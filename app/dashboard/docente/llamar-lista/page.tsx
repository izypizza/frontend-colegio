"use client";

import { useEffect, useMemo, useState } from "react";
import { docentePortalService } from "@/src/lib/services";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { Alert } from "@/src/components/ui/Alert";
import { useErrorHandler } from "@/src/hooks/useErrorHandler";

type EstadoAsistencia = "presente" | "tarde" | "ausente";

interface Asignacion {
  id: number;
  materia_id: number;
  seccion_id: number;
  materia?: { id: number; nombre: string };
  seccion?: { id: number; nombre: string; grado?: { nombre: string } };
  periodoAcademico?: { id: number; nombre: string };
}

interface EstudianteLista {
  id: number;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  dni: string | null;
  estado: EstadoAsistencia | null;
  observaciones: string | null;
}

const hoyEnFormato = () => {
  const fecha = new Date();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${fecha.getFullYear()}-${mes}-${dia}`;
};

const opcionesEstado: Array<{
  valor: EstadoAsistencia;
  etiqueta: string;
  claseActiva: string;
}> = [
  {
    valor: "presente",
    etiqueta: "Presente",
    claseActiva: "bg-green-600 text-white border-green-600",
  },
  {
    valor: "tarde",
    etiqueta: "Tarde",
    claseActiva: "bg-amber-500 text-white border-amber-500",
  },
  {
    valor: "ausente",
    etiqueta: "Ausente",
    claseActiva: "bg-red-600 text-white border-red-600",
  },
];

export default function LlamarListaPage() {
  const { error, success, setError, setSuccess, handleError } =
    useErrorHandler();

  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [cargandoAsignaciones, setCargandoAsignaciones] = useState(true);
  const [claveSeleccionada, setClaveSeleccionada] = useState<string>("");
  const [fecha, setFecha] = useState(hoyEnFormato());
  const [estudiantes, setEstudiantes] = useState<EstudianteLista[]>([]);
  const [marcas, setMarcas] = useState<Record<number, EstadoAsistencia>>({});
  const [observaciones, setObservaciones] = useState<Record<number, string>>(
    {},
  );
  const [yaRegistrada, setYaRegistrada] = useState(false);
  const [nombreSeccion, setNombreSeccion] = useState("");
  const [cargandoLista, setCargandoLista] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const opciones = useMemo(() => {
    const vistas = new Set<string>();
    return asignaciones.filter((asignacion) => {
      const clave = `${asignacion.materia_id}-${asignacion.seccion_id}`;
      if (vistas.has(clave)) return false;
      vistas.add(clave);
      return true;
    });
  }, [asignaciones]);

  const asignacionActiva = useMemo(
    () =>
      opciones.find(
        (asignacion) =>
          `${asignacion.materia_id}-${asignacion.seccion_id}` ===
          claveSeleccionada,
      ) ?? null,
    [opciones, claveSeleccionada],
  );

  useEffect(() => {
    const cargarAsignaciones = async () => {
      try {
        setCargandoAsignaciones(true);
        const datos = await docentePortalService.misAsignaciones();
        setAsignaciones(datos?.asignaciones ?? []);
      } catch (err: any) {
        handleError(err, "No se pudieron cargar tus cursos asignados");
      } finally {
        setCargandoAsignaciones(false);
      }
    };

    cargarAsignaciones();
  }, []);

  useEffect(() => {
    if (!asignacionActiva) {
      setEstudiantes([]);
      setMarcas({});
      setObservaciones({});
      setYaRegistrada(false);
      return;
    }

    const cargarLista = async () => {
      try {
        setCargandoLista(true);
        setError(null);
        setSuccess(null);

        const datos = await docentePortalService.listaSeccion(
          asignacionActiva.seccion_id,
          asignacionActiva.materia_id,
          fecha,
        );

        const lista: EstudianteLista[] = datos?.estudiantes ?? [];
        const marcasIniciales: Record<number, EstadoAsistencia> = {};
        const observacionesIniciales: Record<number, string> = {};

        lista.forEach((estudiante) => {
          marcasIniciales[estudiante.id] = estudiante.estado ?? "presente";
          observacionesIniciales[estudiante.id] =
            estudiante.observaciones ?? "";
        });

        setEstudiantes(lista);
        setMarcas(marcasIniciales);
        setObservaciones(observacionesIniciales);
        setYaRegistrada(Boolean(datos?.ya_registrada));
        setNombreSeccion(datos?.seccion?.nombre ?? "");
      } catch (err: any) {
        handleError(err, "No se pudo cargar la lista de estudiantes");
      } finally {
        setCargandoLista(false);
      }
    };

    cargarLista();
  }, [asignacionActiva, fecha]);

  const marcar = (estudianteId: number, estado: EstadoAsistencia) => {
    setMarcas((previas) => ({ ...previas, [estudianteId]: estado }));
  };

  const marcarTodosPresentes = () => {
    const nuevas: Record<number, EstadoAsistencia> = {};
    estudiantes.forEach((estudiante) => {
      nuevas[estudiante.id] = "presente";
    });
    setMarcas(nuevas);
  };

  const resumen = useMemo(() => {
    const valores = Object.values(marcas);
    return {
      presentes: valores.filter((valor) => valor === "presente").length,
      tarde: valores.filter((valor) => valor === "tarde").length,
      ausentes: valores.filter((valor) => valor === "ausente").length,
    };
  }, [marcas]);

  const guardar = async () => {
    if (!asignacionActiva || estudiantes.length === 0) return;

    try {
      setGuardando(true);
      setError(null);

      const registros = estudiantes.map((estudiante) => ({
        estudiante_id: estudiante.id,
        estado: marcas[estudiante.id] ?? "presente",
        observaciones: observaciones[estudiante.id]?.trim() || null,
      }));

      const resultado = await docentePortalService.llamarLista({
        materia_id: asignacionActiva.materia_id,
        seccion_id: asignacionActiva.seccion_id,
        fecha,
        registros,
      });

      const partes: string[] = [];
      if (resultado?.creados) partes.push(`${resultado.creados} nuevos`);
      if (resultado?.actualizados)
        partes.push(`${resultado.actualizados} corregidos`);

      setSuccess(
        `Asistencia guardada: ${partes.join(" y ") || `${estudiantes.length} registros`}.`,
      );
      setYaRegistrada(true);
    } catch (err: any) {
      handleError(err, "No se pudo guardar la asistencia");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Llamar lista</h1>
        <p className="text-sm text-gray-500 mt-1">
          Registra la asistencia de tu clase. Todos aparecen como presentes y
          solo marcas las excepciones.
        </p>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}
      {success && (
        <Alert
          type="success"
          message={success}
          onClose={() => setSuccess(null)}
        />
      )}

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Curso y sección
            </label>
            <select
              value={claveSeleccionada}
              onChange={(evento) => setClaveSeleccionada(evento.target.value)}
              disabled={cargandoAsignaciones}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#04ADBF]"
            >
              <option value="">
                {cargandoAsignaciones
                  ? "Cargando cursos..."
                  : "Selecciona un curso"}
              </option>
              {opciones.map((asignacion) => (
                <option
                  key={`${asignacion.materia_id}-${asignacion.seccion_id}`}
                  value={`${asignacion.materia_id}-${asignacion.seccion_id}`}
                >
                  {asignacion.materia?.nombre ?? "Materia"} ·{" "}
                  {asignacion.seccion?.grado?.nombre ?? ""}{" "}
                  {asignacion.seccion?.nombre ?? ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de la clase
            </label>
            <input
              type="date"
              value={fecha}
              max={hoyEnFormato()}
              onChange={(evento) => setFecha(evento.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#04ADBF]"
            />
          </div>
        </div>
      </Card>

      {!asignacionActiva && !cargandoAsignaciones && (
        <Card>
          <p className="text-center text-gray-600 py-8">
            {opciones.length === 0
              ? "Aún no tienes cursos asignados. Comunicate con el auxiliar o el administrador."
              : "Selecciona un curso para ver la lista de estudiantes."}
          </p>
        </Card>
      )}

      {asignacionActiva && (
        <>
          {yaRegistrada && (
            <Alert
              type="warning"
              message="Ya registraste esta clase. Si guardas de nuevo se corregirá el registro existente."
            />
          )}

          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3 mb-3">
              <div>
                <p className="font-semibold text-gray-800">
                  {asignacionActiva.materia?.nombre} · {nombreSeccion}
                </p>
                <p className="text-sm text-gray-500">
                  {estudiantes.length} estudiantes · {resumen.presentes}{" "}
                  presentes · {resumen.tarde} tarde · {resumen.ausentes}{" "}
                  ausentes
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={marcarTodosPresentes}>
                  Todos presentes
                </Button>
                <Button
                  onClick={guardar}
                  disabled={guardando || estudiantes.length === 0}
                >
                  {guardando ? "Guardando..." : "Guardar asistencia"}
                </Button>
              </div>
            </div>

            {cargandoLista ? (
              <p className="text-center text-gray-500 py-6">
                Cargando estudiantes...
              </p>
            ) : estudiantes.length === 0 ? (
              <p className="text-center text-gray-600 py-6">
                Esta sección no tiene estudiantes matriculados.
              </p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {estudiantes.map((estudiante, indice) => {
                  const estadoActual = marcas[estudiante.id] ?? "presente";

                  return (
                    <li
                      key={estudiante.id}
                      className="py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="text-sm text-gray-400 w-6 shrink-0 pt-0.5">
                          {indice + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 truncate">
                            {estudiante.apellido_paterno}{" "}
                            {estudiante.apellido_materno}, {estudiante.nombres}
                          </p>
                          {estudiante.dni && (
                            <p className="text-xs text-gray-500">
                              DNI {estudiante.dni}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex rounded-md overflow-hidden border border-gray-200">
                          {opcionesEstado.map((opcion) => (
                            <button
                              key={opcion.valor}
                              type="button"
                              onClick={() =>
                                marcar(estudiante.id, opcion.valor)
                              }
                              className={`px-3 py-1.5 text-xs font-semibold border-r last:border-r-0 border-gray-200 transition-colors ${
                                estadoActual === opcion.valor
                                  ? opcion.claseActiva
                                  : "bg-white text-gray-600 hover:bg-gray-50"
                              }`}
                            >
                              {opcion.etiqueta}
                            </button>
                          ))}
                        </div>

                        {estadoActual !== "presente" && (
                          <input
                            type="text"
                            value={observaciones[estudiante.id] ?? ""}
                            onChange={(evento) =>
                              setObservaciones((previas) => ({
                                ...previas,
                                [estudiante.id]: evento.target.value,
                              }))
                            }
                            placeholder="Motivo (opcional)"
                            className="border border-gray-300 rounded-md px-2 py-1.5 text-xs text-gray-800 w-48 focus:outline-none focus:ring-1 focus:ring-[#04ADBF]"
                          />
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
