"use client";

import { Alert, Button, Card } from "@/src/components/ui";
import { PermissionGuard } from "@/src/components/auth";
import { UserRole } from "@/src/types";
import { useErrorHandler } from "@/src/hooks/useErrorHandler";
import {
  calificacionCompetenciaService,
  competenciaService,
  docentePortalService,
} from "@/src/lib/services";
import { useEffect, useMemo, useState } from "react";

const NIVELES = ["AD", "A", "B", "C"] as const;

const DESCRIPCION_NIVEL: Record<string, string> = {
  AD: "Logro destacado",
  A: "Logro esperado",
  B: "En proceso",
  C: "En inicio",
};

interface Competencia {
  id: number;
  codigo: string;
  nombre: string;
}

interface Asignacion {
  id: number;
  materia_id: number;
  seccion_id: number;
  periodo_academico_id: number;
  materia?: { id: number; nombre: string };
  seccion?: { id: number; nombre: string; grado?: { nombre: string } };
  periodo?: { id: number; nombre: string };
}

interface Estudiante {
  id: number;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  seccion_id: number;
}

export default function CalificarCompetenciasPage() {
  const { error, success, setError, setSuccess, handleError } =
    useErrorHandler();

  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [competencias, setCompetencias] = useState<Competencia[]>([]);
  const [asignacionId, setAsignacionId] = useState("");
  const [escala, setEscala] = useState<"literal" | "numerica">("literal");
  const [valores, setValores] = useState<Record<string, string>>({});
  const [conclusiones, setConclusiones] = useState<Record<string, string>>({});
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [ciclo, setCiclo] = useState<string | null>(null);

  const asignacionActual = useMemo(
    () => asignaciones.find((item) => item.id === parseInt(asignacionId)),
    [asignaciones, asignacionId],
  );

  useEffect(() => {
    const cargarInicial = async () => {
      try {
        setCargando(true);
        const [respuestaAsignaciones, respuestaEstudiantes] = (await Promise.all([
          docentePortalService.misAsignaciones(),
          docentePortalService.misEstudiantes(),
        ])) as any[];

        setAsignaciones(respuestaAsignaciones.asignaciones || []);
        setEstudiantes(respuestaEstudiantes.estudiantes || []);
      } catch (err) {
        handleError(err, "No se pudieron cargar sus asignaciones");
      } finally {
        setCargando(false);
      }
    };

    cargarInicial();
  }, []);

  useEffect(() => {
    if (!asignacionActual) {
      setCompetencias([]);
      setValores({});
      setConclusiones({});
      return;
    }

    const cargarCompetencias = async () => {
      try {
        setCargando(true);
        const respuesta = await competenciaService.porCurso(
          asignacionActual.seccion_id,
          asignacionActual.materia_id,
        );
        setCompetencias(respuesta.competencias || []);
        setCiclo(respuesta.seccion?.ciclo || null);

        const existentes = await calificacionCompetenciaService.listar({
          materia_id: asignacionActual.materia_id,
          periodo_academico_id: asignacionActual.periodo_academico_id,
          per_page: 100,
        });

        const registros = existentes?.data || [];
        const mapaValores: Record<string, string> = {};
        const mapaConclusiones: Record<string, string> = {};

        registros.forEach((registro: any) => {
          const clave = `${registro.estudiante_id}-${registro.competencia_id}`;
          mapaValores[clave] =
            registro.escala === "numerica"
              ? String(registro.nota ?? "")
              : (registro.nivel ?? "");
          mapaConclusiones[clave] = registro.conclusion_descriptiva || "";
        });

        setValores(mapaValores);
        setConclusiones(mapaConclusiones);
      } catch (err) {
        handleError(err, "No se pudieron cargar las competencias del área");
      } finally {
        setCargando(false);
      }
    };

    cargarCompetencias();
  }, [asignacionId]);

  const estudiantesDeLaSeccion = useMemo(
    () =>
      estudiantes.filter(
        (estudiante) => estudiante.seccion_id === asignacionActual?.seccion_id,
      ),
    [estudiantes, asignacionActual],
  );

  const clave = (estudianteId: number, competenciaId: number) =>
    `${estudianteId}-${competenciaId}`;

  const actualizarValor = (
    estudianteId: number,
    competenciaId: number,
    valor: string,
  ) => {
    setValores((previo) => ({
      ...previo,
      [clave(estudianteId, competenciaId)]: valor,
    }));
  };

  const actualizarConclusion = (
    estudianteId: number,
    competenciaId: number,
    texto: string,
  ) => {
    setConclusiones((previo) => ({
      ...previo,
      [clave(estudianteId, competenciaId)]: texto,
    }));
  };

  const requiereConclusion = (valor: string) =>
    escala === "literal"
      ? valor === "B" || valor === "C"
      : valor !== "" && parseInt(valor) < 14;

  const guardar = async () => {
    if (!asignacionActual || guardando) return;

    const registros: any[] = [];
    const faltantes: string[] = [];

    estudiantesDeLaSeccion.forEach((estudiante) => {
      competencias.forEach((competencia) => {
        const valor = valores[clave(estudiante.id, competencia.id)] || "";
        if (!valor) return;

        const conclusion = conclusiones[clave(estudiante.id, competencia.id)] || "";

        if (requiereConclusion(valor) && !conclusion.trim()) {
          faltantes.push(
            `${estudiante.apellido_paterno} ${estudiante.apellido_materno}, ${estudiante.nombres} — ${competencia.codigo}`,
          );
        }

        registros.push({
          estudiante_id: estudiante.id,
          competencia_id: competencia.id,
          nivel: escala === "literal" ? valor : null,
          nota: escala === "numerica" ? parseFloat(valor) : null,
          conclusion_descriptiva: conclusion.trim() || null,
        });
      });
    });

    if (registros.length === 0) {
      setError("No hay calificaciones para guardar. Registra al menos un nivel.");
      return;
    }

    if (faltantes.length > 0) {
      setError(
        `Faltan conclusiones descriptivas en ${faltantes.length} competencia(s): ${faltantes
          .slice(0, 3)
          .join("; ")}${faltantes.length > 3 ? "…" : ""}`,
      );
      return;
    }

    setGuardando(true);
    setError(null);

    try {
      const respuesta = await calificacionCompetenciaService.guardarLote({
        periodo_academico_id: asignacionActual.periodo_academico_id,
        escala,
        registros,
      });
      setSuccess(respuesta?.message || "Calificaciones registradas correctamente");
    } catch (err) {
      handleError(err, "No se pudieron guardar las calificaciones");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <PermissionGuard
      requiredRoles={[UserRole.DOCENTE, UserRole.ADMIN]}
      fallback={
        <div className="p-6">
          <Alert type="error" message="Esta página es para docentes." />
        </div>
      }
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Calificar por competencias
          </h1>
          <p className="text-gray-600 mt-1">
            Cada competencia conserva su propio nivel de logro. El sistema no
            promedia las competencias para obtener una nota de área.
          </p>
        </div>

        {success && (
          <Alert
            type="success"
            message={success}
            onClose={() => setSuccess(null)}
          />
        )}
        {error && (
          <Alert type="error" message={error} onClose={() => setError(null)} />
        )}

        <Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Curso, sección y periodo
              </label>
              <select
                value={asignacionId}
                onChange={(evento) => setAsignacionId(evento.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar curso</option>
                {asignaciones.map((asignacion) => (
                  <option key={asignacion.id} value={asignacion.id}>
                    {(asignacion.materia?.nombre || "Área") +
                      " · " +
                      (asignacion.seccion?.grado?.nombre || "") +
                      " " +
                      (asignacion.seccion?.nombre || "") +
                      " · " +
                      (asignacion.periodo?.nombre || "")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Escala
              </label>
              <select
                value={escala}
                onChange={(evento) => {
                  setEscala(evento.target.value as "literal" | "numerica");
                  setValores({});
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="literal">Letras (AD, A, B, C)</option>
                <option value="numerica">Números (0 - 20)</option>
              </select>
            </div>
          </div>

          {ciclo && (
            <p className="mt-3 text-sm text-gray-600">
              Ciclo del estándar: <span className="font-semibold">{ciclo}</span>
              {competencias.length > 0
                ? ` · ${competencias.length} competencia(s) del área`
                : " · Esta área no tiene competencias registradas"}
            </p>
          )}
        </Card>

        {cargando && asignacionId && (
          <Card>
            <p className="text-center text-gray-600 py-6">Cargando...</p>
          </Card>
        )}

        {!cargando && asignacionId && competencias.length > 0 && (
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-3 py-2 font-semibold text-gray-700 sticky left-0 bg-gray-50">
                      Estudiante
                    </th>
                    {competencias.map((competencia) => (
                      <th
                        key={competencia.id}
                        className="px-3 py-2 font-semibold text-gray-700 min-w-[190px]"
                        title={competencia.nombre}
                      >
                        <div className="text-xs text-gray-500">
                          {competencia.codigo}
                        </div>
                        <div className="font-medium text-gray-700 leading-tight">
                          {competencia.nombre}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {estudiantesDeLaSeccion.map((estudiante) => (
                    <tr key={estudiante.id} className="border-t border-gray-100">
                      <td className="px-3 py-2 font-medium text-gray-900 sticky left-0 bg-white">
                        {`${estudiante.apellido_paterno} ${estudiante.apellido_materno}`}
                        <div className="text-xs text-gray-500">
                          {estudiante.nombres}
                        </div>
                      </td>
                      {competencias.map((competencia) => {
                        const valor =
                          valores[clave(estudiante.id, competencia.id)] || "";
                        const pideConclusion = requiereConclusion(valor);

                        return (
                          <td
                            key={competencia.id}
                            className="px-3 py-2 align-top"
                          >
                            {escala === "literal" ? (
                              <select
                                value={valor}
                                onChange={(evento) =>
                                  actualizarValor(
                                    estudiante.id,
                                    competencia.id,
                                    evento.target.value,
                                  )
                                }
                                className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">—</option>
                                {NIVELES.map((nivel) => (
                                  <option key={nivel} value={nivel}>
                                    {nivel} · {DESCRIPCION_NIVEL[nivel]}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type="number"
                                min="0"
                                max="20"
                                step="0.5"
                                value={valor}
                                onChange={(evento) =>
                                  actualizarValor(
                                    estudiante.id,
                                    competencia.id,
                                    evento.target.value,
                                  )
                                }
                                className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0-20"
                              />
                            )}

                            {pideConclusion && (
                              <textarea
                                value={
                                  conclusiones[
                                    clave(estudiante.id, competencia.id)
                                  ] || ""
                                }
                                onChange={(evento) =>
                                  actualizarConclusion(
                                    estudiante.id,
                                    competencia.id,
                                    evento.target.value,
                                  )
                                }
                                rows={2}
                                maxLength={1000}
                                className="mt-1 w-full px-2 py-1 text-xs border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                                placeholder="Conclusión descriptiva obligatoria"
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

            <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                {estudiantesDeLaSeccion.length} estudiante(s) ·{" "}
                {competencias.length} competencia(s)
              </p>
              <Button
                variant="primary"
                onClick={guardar}
                disabled={guardando}
              >
                {guardando ? "Guardando..." : "Guardar calificaciones"}
              </Button>
            </div>
          </Card>
        )}

        {!cargando && asignacionId && competencias.length === 0 && (
          <Card>
            <Alert
              type="warning"
              message="Esta área aún no tiene competencias registradas para el ciclo. Solicita al administrador que cargue el catálogo."
            />
          </Card>
        )}
      </div>
    </PermissionGuard>
  );
}
