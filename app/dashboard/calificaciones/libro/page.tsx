"use client";

import { Alert, Button, Card, SelectBuscable } from "@/src/components/ui";
import { PermissionGuard } from "@/src/components/auth";
import { useAuth } from "@/src/features/auth";
import { UserRole } from "@/src/types";
import { useErrorHandler } from "@/src/hooks/useErrorHandler";
import {
  calificacionCompetenciaService,
  docentePortalService,
  libroNotasService,
  materiaService,
  periodoService,
  seccionService,
} from "@/src/lib/services";
import { useEffect, useMemo, useState } from "react";

const listaDe = (respuesta: any): any[] =>
  Array.isArray(respuesta) ? respuesta : respuesta?.data || [];

export default function LibroDeNotasPage() {
  const { user } = useAuth();
  const esDocente = user?.role === UserRole.DOCENTE;
  const { error, setError, handleError } = useErrorHandler();

  const [periodos, setPeriodos] = useState<any[]>([]);
  const [secciones, setSecciones] = useState<any[]>([]);
  const [materias, setMaterias] = useState<any[]>([]);
  const [asignaciones, setAsignaciones] = useState<any[]>([]);

  const [periodoId, setPeriodoId] = useState("");
  const [gradoNombre, setGradoNombre] = useState("");
  const [seccionId, setSeccionId] = useState("");
  const [materiaId, setMateriaId] = useState("");

  const [libro, setLibro] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [consultando, setConsultando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState("");
  const [valores, setValores] = useState<Record<string, string>>({});
  const [conclusiones, setConclusiones] = useState<Record<string, string>>({});

  const claveCelda = (estudianteId: number, competenciaId: number) =>
    `${estudianteId}-${competenciaId}`;

  const requiereConclusion = (nivel: string) => nivel === "B" || nivel === "C";

  useEffect(() => {
    if (!user) return;

    const cargar = async () => {
      try {
        setCargando(true);

        if (esDocente) {
          const respuestaAsignaciones =
            await docentePortalService.misAsignaciones();
          const listaAsignaciones = respuestaAsignaciones.asignaciones || [];
          setAsignaciones(listaAsignaciones);

          const periodosPropios = new Map<number, any>();
          listaAsignaciones.forEach((asignacion: any) => {
            if (asignacion.periodo_academico) {
              periodosPropios.set(
                asignacion.periodo_academico.id,
                asignacion.periodo_academico,
              );
            }
          });

          const listaPeriodos = Array.from(periodosPropios.values());
          setPeriodos(listaPeriodos);

          const activo =
            listaPeriodos.find((periodo: any) => periodo.estado === "activo") ||
            listaPeriodos[0];

          if (activo) setPeriodoId(String(activo.id));

          return;
        }

        const [respuestaPeriodos, respuestaSecciones, respuestaMaterias] =
          await Promise.all([
            periodoService.getAll({ all: true }),
            seccionService.getAll({ all: true, filtros: { solo_conteo: true } }),
            materiaService.getAll({ all: true }),
          ]);

        const listaPeriodos = listaDe(respuestaPeriodos);
        setPeriodos(listaPeriodos);
        setSecciones(listaDe(respuestaSecciones));
        setMaterias(listaDe(respuestaMaterias));

        const activo =
          listaPeriodos.find((periodo) => periodo.estado === "activo") ||
          listaPeriodos[0];

        if (activo) setPeriodoId(String(activo.id));
      } catch (err) {
        handleError(err, "No se pudieron cargar los filtros");
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, [user, esDocente]);

  const seccionesDisponibles = useMemo(() => {
    if (!esDocente) return secciones;

    const mapa = new Map<number, any>();

    asignaciones.forEach((asignacion: any) => {
      if (
        !periodoId ||
        String(asignacion.periodo_academico_id) !== periodoId ||
        !asignacion.seccion
      ) {
        return;
      }

      if (!mapa.has(asignacion.seccion_id)) {
        mapa.set(asignacion.seccion_id, asignacion.seccion);
      }
    });

    return Array.from(mapa.values());
  }, [asignaciones, esDocente, periodoId, secciones]);

  const materiasDisponibles = useMemo(() => {
    if (!esDocente) return materias;

    const mapa = new Map<number, any>();

    asignaciones.forEach((asignacion: any) => {
      if (!periodoId || String(asignacion.periodo_academico_id) !== periodoId) {
        return;
      }

      if (seccionId && String(asignacion.seccion_id) !== seccionId) return;

      if (asignacion.materia && !mapa.has(asignacion.materia_id)) {
        mapa.set(asignacion.materia_id, asignacion.materia);
      }
    });

    return Array.from(mapa.values());
  }, [asignaciones, esDocente, periodoId, seccionId, materias]);

  const grados = useMemo(() => {
    const nombres = new Set<string>();
    seccionesDisponibles.forEach((seccion) => {
      if (seccion.grado?.nombre) nombres.add(seccion.grado.nombre);
    });
    return Array.from(nombres).sort();
  }, [seccionesDisponibles]);

  const seccionesFiltradas = useMemo(
    () =>
      gradoNombre
        ? seccionesDisponibles.filter(
            (seccion) => seccion.grado?.nombre === gradoNombre,
          )
        : seccionesDisponibles,
    [seccionesDisponibles, gradoNombre],
  );

  const consultar = async () => {
    if (!seccionId || !materiaId || !periodoId) {
      setError("Elige periodo, sección y curso para ver el libro de notas.");
      return;
    }

    if (
      esDocente &&
      !asignaciones.some(
        (asignacion: any) =>
          String(asignacion.seccion_id) === seccionId &&
          String(asignacion.materia_id) === materiaId &&
          String(asignacion.periodo_academico_id) === periodoId,
      )
    ) {
      setError(
        "No tienes asignado ese curso en esta sección durante el periodo elegido.",
      );
      return;
    }

    try {
      setConsultando(true);
      setError(null);
      const respuesta = await libroNotasService.obtener({
        seccion_id: parseInt(seccionId),
        materia_id: parseInt(materiaId),
        periodo_academico_id: parseInt(periodoId),
      });
      setLibro(respuesta);

      const mapaValores: Record<string, string> = {};
      const mapaConclusiones: Record<string, string> = {};

      (respuesta.estudiantes || []).forEach((estudiante: any) => {
        estudiante.niveles.forEach((nivel: any) => {
          const clave = claveCelda(estudiante.id, nivel.competencia_id);
          mapaValores[clave] = nivel.nivel || "";
          mapaConclusiones[clave] = nivel.conclusion_descriptiva || "";
        });
      });

      setValores(mapaValores);
      setConclusiones(mapaConclusiones);
      setExito("");
    } catch (err) {
      handleError(err, "No se pudo cargar el libro de notas");
      setLibro(null);
    } finally {
      setConsultando(false);
    }
  };

  const guardar = async () => {
    if (!libro || !periodoId || guardando) return;

    const registros: any[] = [];
    const faltantes: string[] = [];

    libro.estudiantes.forEach((estudiante: any) => {
      estudiante.niveles.forEach((nivel: any) => {
        const clave = claveCelda(estudiante.id, nivel.competencia_id);
        const valor = valores[clave] || "";

        if (!valor) return;

        const conclusion = conclusiones[clave] || "";

        if (requiereConclusion(valor) && !conclusion.trim()) {
          faltantes.push(
            `${estudiante.apellido_paterno} — ${nivel.competencia_id}`,
          );
        }

        registros.push({
          estudiante_id: estudiante.id,
          competencia_id: nivel.competencia_id,
          nivel: valor,
          conclusion_descriptiva: conclusion.trim() || null,
        });
      });
    });

    if (registros.length === 0) {
      setError("No hay niveles para guardar.");
      return;
    }

    if (faltantes.length > 0) {
      setError(
        `Faltan conclusiones descriptivas en ${faltantes.length} celda(s). Los niveles B y C las exigen.`,
      );
      return;
    }

    try {
      setGuardando(true);
      setError(null);
      await calificacionCompetenciaService.guardarLote({
        periodo_academico_id: parseInt(periodoId),
        escala: "literal",
        registros,
      });
      setExito(`Se guardaron ${registros.length} niveles de logro.`);
      await consultar();
    } catch (err) {
      handleError(err, "No se pudieron guardar las calificaciones");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <PermissionGuard
      requiredRoles={[UserRole.ADMIN, UserRole.AUXILIAR, UserRole.DOCENTE]}
      fallback={
        <div className="p-6">
          <Alert type="error" message="No tiene permisos para esta página." />
        </div>
      }
    >
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Libro de notas</h1>
          <p className="text-gray-600 mt-1">
            Elige el periodo, el grado, la sección y el curso. Verás una fila
            por estudiante y una columna por competencia.
          </p>
        </div>

        {error && <Alert type="error" message={error} />}

        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Periodo
              </label>
              <select
                value={periodoId}
                onChange={(evento) => {
                  setPeriodoId(evento.target.value);
                  setSeccionId("");
                  setMateriaId("");
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar periodo</option>
                {periodos.map((periodo) => (
                  <option key={periodo.id} value={periodo.id}>
                    {periodo.nombre} - {periodo.anio}
                  </option>
                ))}
              </select>
            </div>

            <SelectBuscable
              label="Grado"
              valor={gradoNombre}
              onChange={(valor) => {
                setGradoNombre(valor);
                setSeccionId("");
              }}
              vacio="Todos los grados"
              placeholder="Buscar grado"
              opciones={grados.map((grado) => ({
                valor: grado,
                etiqueta: grado,
              }))}
            />

            <SelectBuscable
              label="Sección"
              valor={seccionId}
              onChange={(valor) => {
                setSeccionId(valor);
                setMateriaId("");
              }}
              vacio="Seleccionar sección"
              placeholder="Buscar por grado o sección"
              opciones={seccionesFiltradas.map((seccion) => ({
                valor: seccion.id,
                etiqueta:
                  `${seccion.nombre} - ${seccion.grado?.nombre ?? ""}`.trim(),
              }))}
            />

            <SelectBuscable
              label="Curso"
              valor={materiaId}
              onChange={setMateriaId}
              vacio="Seleccionar curso"
              placeholder="Buscar curso"
              opciones={materiasDisponibles.map((materia) => ({
                valor: materia.id,
                etiqueta: materia.nombre,
              }))}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              {libro
                ? `${libro.estudiantes.length} estudiante(s) · ${libro.competencias.length} competencia(s) · ${libro.seccion.nombre}`
                : "Sin consulta realizada"}
            </p>
            <Button
              variant="primary"
              onClick={consultar}
              disabled={consultando || cargando}
            >
              {consultando ? "Cargando..." : "Ver libro de notas"}
            </Button>
          </div>
        </Card>

        {libro && libro.estudiantes.length > 0 && (
          <Card>
            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {libro.materia.nombre}
                </h2>
                <p className="text-sm text-gray-600">
                  {libro.seccion.nombre} · {libro.periodo.nombre} · Ciclo{" "}
                  {libro.seccion.ciclo}
                </p>
              </div>
              <Button variant="primary" onClick={guardar} disabled={guardando}>
                {guardando ? "Guardando..." : "Guardar niveles"}
              </Button>
            </div>

            {exito && (
              <div className="mb-3">
                <Alert type="success" message={exito} />
              </div>
            )}

            {libro.competencias.length === 0 ? (
              <Alert
                type="warning"
                message="Este curso no tiene competencias registradas para el ciclo de la sección."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th
                        scope="col"
                        className="px-3 py-2 font-semibold text-gray-700 sticky left-0 bg-gray-50"
                      >
                        Estudiante
                      </th>
                      {libro.competencias.map((competencia: any) => (
                        <th
                          key={competencia.id}
                          scope="col"
                          className="px-3 py-2 font-semibold text-gray-700 min-w-[150px] align-bottom"
                        >
                          <span className="block text-xs text-gray-500">
                            {competencia.codigo}
                          </span>
                          {competencia.nombre}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {libro.estudiantes.map((estudiante: any) => (
                      <tr
                        key={estudiante.id}
                        className="border-t border-gray-100"
                      >
                        <td className="px-3 py-2 sticky left-0 bg-white">
                          <div className="font-medium text-gray-900">
                            {`${estudiante.apellido_paterno} ${estudiante.apellido_materno}`}
                          </div>
                          <div className="text-xs text-gray-500">
                            {estudiante.nombres}
                            {estudiante.dni ? ` · DNI ${estudiante.dni}` : ""}
                          </div>
                        </td>
                        {estudiante.niveles.map((nivel: any) => {
                          const clave = claveCelda(
                            estudiante.id,
                            nivel.competencia_id,
                          );
                          const valor = valores[clave] || "";

                          return (
                            <td
                              key={nivel.competencia_id}
                              className="px-2 py-2 align-top"
                            >
                              <select
                                value={valor}
                                onChange={(evento) =>
                                  setValores({
                                    ...valores,
                                    [clave]: evento.target.value,
                                  })
                                }
                                aria-label={`Nivel de ${estudiante.nombres} en la competencia ${nivel.competencia_id}`}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">—</option>
                                <option value="AD">AD</option>
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                              </select>

                              {requiereConclusion(valor) && (
                                <textarea
                                  value={conclusiones[clave] || ""}
                                  onChange={(evento) =>
                                    setConclusiones({
                                      ...conclusiones,
                                      [clave]: evento.target.value,
                                    })
                                  }
                                  rows={2}
                                  maxLength={1000}
                                  placeholder="Conclusión descriptiva"
                                  className="mt-1 w-full px-2 py-1 text-xs border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {libro && libro.estudiantes.length === 0 && (
          <Alert
            type="warning"
            message="La sección no tiene estudiantes matriculados."
          />
        )}
      </div>
    </PermissionGuard>
  );
}
