"use client";

import { Alert, Button, Card } from "@/src/components/ui";
import { PermissionGuard } from "@/src/components/auth";
import { UserRole } from "@/src/types";
import { useErrorHandler } from "@/src/hooks/useErrorHandler";
import {
  actividadEvaluacionService,
  competenciaService,
  docentePortalService,
} from "@/src/lib/services";
import { useEffect, useMemo, useState } from "react";

const TIPOS = [
  { valor: "examen", etiqueta: "Examen" },
  { valor: "tarea", etiqueta: "Tarea" },
  { valor: "practica", etiqueta: "Práctica" },
  { valor: "proyecto", etiqueta: "Proyecto" },
  { valor: "participacion", etiqueta: "Participación" },
  { valor: "otro", etiqueta: "Otro" },
];

export default function ActividadesEvaluacionPage() {
  const { error, success, setError, setSuccess, handleError } =
    useErrorHandler();

  const [asignaciones, setAsignaciones] = useState<any[]>([]);
  const [estudiantes, setEstudiantes] = useState<any[]>([]);
  const [competencias, setCompetencias] = useState<any[]>([]);
  const [actividades, setActividades] = useState<any[]>([]);
  const [pesoTotal, setPesoTotal] = useState(0);

  const [asignacionId, setAsignacionId] = useState("");
  const [competenciaId, setCompetenciaId] = useState("");
  const [valores, setValores] = useState<Record<string, string>>({});
  const [formulario, setFormulario] = useState({
    nombre: "",
    tipo: "examen",
    peso: "25",
  });

  const [cargando, setCargando] = useState(true);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const asignacion = useMemo(
    () => asignaciones.find((item) => item.id === parseInt(asignacionId)),
    [asignaciones, asignacionId],
  );

  useEffect(() => {
    const cargar = async () => {
      try {
        setCargando(true);
        const [respuestaAsignaciones, respuestaEstudiantes] =
          (await Promise.all([
            docentePortalService.misAsignaciones(),
            docentePortalService.misEstudiantes(),
          ])) as any[];

        setAsignaciones(respuestaAsignaciones.asignaciones || []);
        setEstudiantes(respuestaEstudiantes.estudiantes || []);
      } catch (err) {
        handleError(err, "No se pudieron cargar sus cursos");
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, []);

  useEffect(() => {
    if (!asignacion) return;

    const cargarCompetencias = async () => {
      try {
        const respuesta = await competenciaService.porCurso(
          asignacion.seccion_id,
          asignacion.materia_id,
        );
        setCompetencias(respuesta.competencias || []);
        setCompetenciaId("");
        setActividades([]);
        setValores({});
      } catch (err) {
        handleError(err, "No se pudieron cargar las competencias");
      }
    };

    cargarCompetencias();
  }, [asignacionId]);

  const cargarActividades = async () => {
    if (!asignacion || !competenciaId) return;

    try {
      setCargandoDetalle(true);
      const respuesta = await actividadEvaluacionService.listar(
        parseInt(competenciaId),
        asignacion.periodo_academico_id,
        asignacion.seccion_id,
      );

      setActividades(respuesta.actividades || []);
      setPesoTotal(respuesta.peso_total || 0);

      const mapa: Record<string, string> = {};
      Object.entries(respuesta.notas || {}).forEach(
        ([estudianteId, porActividad]: [string, any]) => {
          Object.entries(porActividad).forEach(
            ([actividadId, registro]: [string, any]) => {
              mapa[`${actividadId}-${estudianteId}`] =
                registro?.nota !== null && registro?.nota !== undefined
                  ? String(registro.nota)
                  : "";
            },
          );
        },
      );
      setValores(mapa);
    } catch (err) {
      handleError(err, "No se pudieron cargar las evidencias");
    } finally {
      setCargandoDetalle(false);
    }
  };

  useEffect(() => {
    cargarActividades();
  }, [competenciaId]);

  const estudiantesDeLaSeccion = useMemo(
    () =>
      estudiantes.filter(
        (estudiante) => estudiante.seccion_id === asignacion?.seccion_id,
      ),
    [estudiantes, asignacion],
  );

  const crearActividad = async (evento: React.FormEvent) => {
    evento.preventDefault();
    if (!asignacion || !competenciaId) return;

    try {
      setError(null);
      await actividadEvaluacionService.create({
        competencia_id: parseInt(competenciaId),
        periodo_academico_id: asignacion.periodo_academico_id,
        nombre: formulario.nombre.trim(),
        tipo: formulario.tipo,
        peso: parseFloat(formulario.peso),
        orden: actividades.length + 1,
      });

      setSuccess("Evidencia agregada.");
      setFormulario({ nombre: "", tipo: "examen", peso: "25" });
      cargarActividades();
    } catch (err) {
      handleError(err, "No se pudo registrar la evidencia");
    }
  };

  const eliminarActividad = async (id: number) => {
    if (!confirm("¿Eliminar esta evidencia y todas sus notas?")) return;

    try {
      await actividadEvaluacionService.delete(id);
      setSuccess("Evidencia eliminada.");
      cargarActividades();
    } catch (err) {
      handleError(err, "No se pudo eliminar la evidencia");
    }
  };

  const guardarNotas = async () => {
    if (!asignacion || !competenciaId || actividades.length === 0) return;

    setGuardando(true);
    setError(null);

    try {
      for (const actividad of actividades) {
        const registros = estudiantesDeLaSeccion
          .map((estudiante) => {
            const valor = valores[`${actividad.id}-${estudiante.id}`];
            return {
              estudiante_id: estudiante.id,
              nota:
                valor === undefined || valor === "" ? null : parseFloat(valor),
            };
          })
          .filter((registro) => registro.nota !== null);

        if (registros.length > 0) {
          await actividadEvaluacionService.registrarNotas(
            actividad.id,
            registros,
          );
        }
      }

      await actividadEvaluacionService.recalcular({
        competencia_id: parseInt(competenciaId),
        periodo_academico_id: asignacion.periodo_academico_id,
      });

      setSuccess(
        "Notas guardadas y competencia recalculada con el promedio ponderado.",
      );
      cargarActividades();
    } catch (err) {
      handleError(err, "No se pudieron guardar las notas");
    } finally {
      setGuardando(false);
    }
  };

  const sumaNoEsCien =
    actividades.length > 0 && Math.abs(pesoTotal - 100) > 0.01;

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
            Evidencias de evaluación
          </h1>
          <p className="text-gray-600 mt-1">
            Registra exámenes, tareas y prácticas con su peso. La nota de la
            competencia es el promedio ponderado, no un valor único.
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Curso, sección y periodo
              </label>
              <select
                value={asignacionId}
                onChange={(evento) => setAsignacionId(evento.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar curso</option>
                {asignaciones.map((item) => (
                  <option key={item.id} value={item.id}>
                    {(item.materia?.nombre || "Área") +
                      " · " +
                      (item.seccion?.grado?.nombre || "") +
                      " " +
                      (item.seccion?.nombre || "") +
                      " · " +
                      (item.periodo?.nombre || "")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Competencia
              </label>
              <select
                value={competenciaId}
                onChange={(evento) => setCompetenciaId(evento.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={competencias.length === 0}
              >
                <option value="">Seleccionar competencia</option>
                {competencias.map((competencia) => (
                  <option key={competencia.id} value={competencia.id}>
                    {competencia.codigo} · {competencia.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {asignacionId && competencias.length === 0 && !cargando && (
          <Alert
            type="warning"
            message="Esta área no tiene competencias registradas para el ciclo."
          />
        )}

        {competenciaId && (
          <>
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <h2 className="text-lg font-semibold text-gray-800">
                  Evidencias
                </h2>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    sumaNoEsCien
                      ? "bg-amber-100 text-amber-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  Peso total: {pesoTotal}
                </span>
              </div>

              {sumaNoEsCien && (
                <p className="text-xs text-amber-700 mb-3">
                  Los pesos no suman 100. El sistema los normaliza al calcular
                  el promedio, pero se recomienda que sumen 100.
                </p>
              )}

              <form
                onSubmit={crearActividad}
                className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4"
              >
                <input
                  value={formulario.nombre}
                  onChange={(evento) =>
                    setFormulario({
                      ...formulario,
                      nombre: evento.target.value,
                    })
                  }
                  placeholder="Nombre (ej. Examen 1)"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <select
                  value={formulario.tipo}
                  onChange={(evento) =>
                    setFormulario({ ...formulario, tipo: evento.target.value })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {TIPOS.map((tipo) => (
                    <option key={tipo.valor} value={tipo.valor}>
                      {tipo.etiqueta}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="0.01"
                  max="100"
                  step="0.5"
                  value={formulario.peso}
                  onChange={(evento) =>
                    setFormulario({ ...formulario, peso: evento.target.value })
                  }
                  placeholder="Peso"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <Button variant="primary" type="submit">
                  Agregar
                </Button>
              </form>

              {actividades.length === 0 ? (
                <p className="text-sm text-gray-600">
                  Aún no hay evidencias para esta competencia.
                </p>
              ) : (
                <ul className="divide-y divide-gray-100 border border-gray-200 rounded-lg">
                  {actividades.map((actividad) => (
                    <li
                      key={actividad.id}
                      className="px-4 py-2 flex items-center justify-between gap-3"
                    >
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          {actividad.nombre}
                        </span>
                        <span className="ml-2 text-xs text-gray-500">
                          {actividad.tipo} · peso {actividad.peso}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => eliminarActividad(actividad.id)}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Eliminar
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {cargandoDetalle && (
              <Card>
                <p className="text-center text-gray-600 py-6">Cargando...</p>
              </Card>
            )}

            {!cargandoDetalle && actividades.length > 0 && (
              <Card>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-left">
                        <th className="px-3 py-2 font-semibold text-gray-700 sticky left-0 bg-gray-50">
                          Estudiante
                        </th>
                        {actividades.map((actividad) => (
                          <th
                            key={actividad.id}
                            className="px-3 py-2 font-semibold text-gray-700 min-w-[120px]"
                          >
                            {actividad.nombre}
                            <div className="text-xs text-gray-500 font-normal">
                              peso {actividad.peso}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {estudiantesDeLaSeccion.map((estudiante) => (
                        <tr
                          key={estudiante.id}
                          className="border-t border-gray-100"
                        >
                          <td className="px-3 py-2 font-medium text-gray-900 sticky left-0 bg-white">
                            {`${estudiante.apellido_paterno} ${estudiante.apellido_materno}`}
                            <div className="text-xs text-gray-500">
                              {estudiante.nombres}
                            </div>
                          </td>
                          {actividades.map((actividad) => (
                            <td key={actividad.id} className="px-3 py-2">
                              <input
                                type="number"
                                min="0"
                                max="20"
                                step="0.5"
                                value={
                                  valores[`${actividad.id}-${estudiante.id}`] ||
                                  ""
                                }
                                onChange={(evento) =>
                                  setValores({
                                    ...valores,
                                    [`${actividad.id}-${estudiante.id}`]:
                                      evento.target.value,
                                  })
                                }
                                className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="—"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600">
                    {estudiantesDeLaSeccion.length} estudiante(s) ·{" "}
                    {actividades.length} evidencia(s)
                  </p>
                  <Button
                    variant="primary"
                    onClick={guardarNotas}
                    disabled={guardando}
                  >
                    {guardando ? "Calculando..." : "Guardar notas y calcular"}
                  </Button>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </PermissionGuard>
  );
}
