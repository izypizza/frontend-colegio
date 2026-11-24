"use client";

import { Alert, Button, Card, SelectBuscable } from "@/src/components/ui";
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

const claveCurso = (asignacion: any) =>
  `${asignacion.materia_id}-${asignacion.seccion_id}`;

const nombreCurso = (asignacion: any) =>
  `${asignacion.materia?.nombre || "Área"} · ${
    asignacion.seccion?.grado?.nombre || ""
  } ${asignacion.seccion?.nombre || ""}`.trim();

export default function ActividadesEvaluacionPage() {
  const { error, success, setError, setSuccess, handleError } =
    useErrorHandler();

  const [asignaciones, setAsignaciones] = useState<any[]>([]);
  const [estudiantes, setEstudiantes] = useState<any[]>([]);
  const [competencias, setCompetencias] = useState<any[]>([]);
  const [actividades, setActividades] = useState<any[]>([]);
  const [pesoTotal, setPesoTotal] = useState(0);

  const [periodoId, setPeriodoId] = useState("");
  const [cursoClave, setCursoClave] = useState("");
  const [competenciaId, setCompetenciaId] = useState("");
  const [valores, setValores] = useState<Record<string, string>>({});
  const [formulario, setFormulario] = useState({
    nombre: "",
    tipo: "examen",
    peso: "25",
  });

  const [cargando, setCargando] = useState(true);
  const [cargandoCompetencias, setCargandoCompetencias] = useState(false);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        setCargando(true);
        const [respuestaAsignaciones, respuestaEstudiantes] =
          (await Promise.all([
            docentePortalService.misAsignaciones(),
            docentePortalService.misEstudiantes(),
          ])) as any[];

        const listaAsignaciones = respuestaAsignaciones.asignaciones || [];
        setAsignaciones(listaAsignaciones);
        setEstudiantes(respuestaEstudiantes.estudiantes || []);

        const activo =
          listaAsignaciones.find(
            (item: any) => item.periodo_academico?.estado === "activo",
          ) || listaAsignaciones[0];

        if (activo) setPeriodoId(String(activo.periodo_academico_id));
      } catch (err) {
        handleError(err, "No se pudieron cargar sus cursos");
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, []);

  const opcionesPeriodo = useMemo(() => {
    const mapa = new Map<number, any>();

    asignaciones.forEach((asignacion) => {
      const periodo = asignacion.periodo_academico;
      if (periodo && !mapa.has(periodo.id)) mapa.set(periodo.id, periodo);
    });

    return Array.from(mapa.values())
      .sort((a, b) => (a.id > b.id ? 1 : -1))
      .map((periodo) => ({
        valor: periodo.id,
        etiqueta: periodo.nombre,
        detalle: periodo.estado === "activo" ? "Periodo activo" : null,
      }));
  }, [asignaciones]);

  const opcionesCurso = useMemo(() => {
    const mapa = new Map<string, any>();

    asignaciones.forEach((asignacion) => {
      if (String(asignacion.periodo_academico_id) !== periodoId) return;
      const clave = claveCurso(asignacion);
      if (!mapa.has(clave)) mapa.set(clave, asignacion);
    });

    return Array.from(mapa.entries()).map(([clave, asignacion]) => ({
      valor: clave,
      etiqueta: nombreCurso(asignacion),
      detalle: `${asignacion.seccion?.grado?.nivel || ""}`.trim() || null,
    }));
  }, [asignaciones, periodoId]);

  const asignacion = useMemo(
    () =>
      asignaciones.find(
        (item) =>
          String(item.periodo_academico_id) === periodoId &&
          claveCurso(item) === cursoClave,
      ),
    [asignaciones, periodoId, cursoClave],
  );

  useEffect(() => {
    if (!asignacion) {
      setCompetencias([]);
      setCompetenciaId("");
      setActividades([]);
      setValores({});
      setPesoTotal(0);
      return;
    }

    const cargarCompetencias = async () => {
      try {
        setCargandoCompetencias(true);
        const respuesta = await competenciaService.porCurso(
          asignacion.seccion_id,
          asignacion.materia_id,
        );
        setCompetencias(respuesta.competencias || []);
        setCompetenciaId("");
        setActividades([]);
        setValores({});
        setPesoTotal(0);
      } catch (err) {
        handleError(err, "No se pudieron cargar las competencias");
      } finally {
        setCargandoCompetencias(false);
      }
    };

    cargarCompetencias();
  }, [asignacion]);

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
      estudiantes
        .filter(
          (estudiante) => estudiante.seccion_id === asignacion?.seccion_id,
        )
        .sort((a, b) =>
          `${a.apellido_paterno} ${a.apellido_materno}`.localeCompare(
            `${b.apellido_paterno} ${b.apellido_materno}`,
          ),
        ),
    [estudiantes, asignacion],
  );

  const competenciaSeleccionada = useMemo(
    () =>
      competencias.find(
        (competencia) => String(competencia.id) === competenciaId,
      ),
    [competencias, competenciaId],
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
      requiredRoles={[UserRole.DOCENTE]}
      fallback={
        <div className="p-6">
          <Alert type="error" message="Esta página es para docentes." />
        </div>
      }
    >
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Evidencias de evaluación
          </h1>
          <p className="text-gray-600 mt-1">
            Elige bimestre, curso y competencia. Cada competencia tiene sus
            propias evidencias y la nota final es el promedio ponderado.
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
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#04ADBF] text-xs font-bold text-white">
              1
            </span>
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-700">
              Ubicación
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <SelectBuscable
              label="Bimestre"
              opciones={opcionesPeriodo}
              valor={periodoId}
              onChange={(valor) => {
                setPeriodoId(valor);
                setCursoClave("");
                setCompetenciaId("");
              }}
              placeholder="Buscar bimestre"
              disabled={cargando || opcionesPeriodo.length === 0}
            />

            <SelectBuscable
              label="Curso y sección"
              opciones={opcionesCurso}
              valor={cursoClave}
              onChange={(valor) => {
                setCursoClave(valor);
                setCompetenciaId("");
              }}
              vacio="Seleccionar curso"
              placeholder="Buscar curso o sección"
              disabled={!periodoId || opcionesCurso.length === 0}
            />

            <SelectBuscable
              label="Competencia"
              opciones={competencias.map((competencia) => ({
                valor: competencia.id,
                etiqueta: competencia.nombre,
                detalle: competencia.codigo,
              }))}
              valor={competenciaId}
              onChange={setCompetenciaId}
              vacio="Seleccionar competencia"
              placeholder="Buscar competencia"
              disabled={!asignacion || cargandoCompetencias}
            />
          </div>

          {asignacion && (
            <p className="mt-3 border-t border-gray-100 pt-3 text-sm text-gray-600">
              {nombreCurso(asignacion)} ·{" "}
              {asignacion.periodo_academico?.nombre || "Bimestre"} ·{" "}
              {estudiantesDeLaSeccion.length} estudiante(s)
            </p>
          )}
        </Card>

        {asignacion && !cargandoCompetencias && competencias.length === 0 && (
          <Alert
            type="warning"
            message="Esta área no tiene competencias registradas para el ciclo."
          />
        )}

        {competenciaId && (
          <Card>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#04ADBF] text-xs font-bold text-white">
                  2
                </span>
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wide text-gray-700">
                    Evidencias
                  </h2>
                  <p className="text-xs text-gray-500">
                    {competenciaSeleccionada
                      ? `${competenciaSeleccionada.codigo} · ${competenciaSeleccionada.nombre}`
                      : "Competencia seleccionada"}
                  </p>
                </div>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  sumaNoEsCien
                    ? "bg-amber-100 text-amber-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                Peso total: {pesoTotal}%
              </span>
            </div>

            {sumaNoEsCien && (
              <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Los pesos no suman 100. El sistema los normaliza al calcular el
                promedio, pero se recomienda que sumen 100.
              </p>
            )}

            <form
              onSubmit={crearActividad}
              className="mb-4 grid grid-cols-1 gap-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3 md:grid-cols-4"
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
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <select
                value={formulario.tipo}
                onChange={(evento) =>
                  setFormulario({ ...formulario, tipo: evento.target.value })
                }
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <Button variant="primary" type="submit">
                Agregar evidencia
              </Button>
            </form>

            {cargandoDetalle ? (
              <p className="py-4 text-center text-sm text-gray-600">
                Cargando evidencias...
              </p>
            ) : actividades.length === 0 ? (
              <p className="text-sm text-gray-600">
                Aún no hay evidencias para esta competencia.
              </p>
            ) : (
              <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
                {actividades.map((actividad, indice) => (
                  <li
                    key={actividad.id}
                    className="flex items-center justify-between gap-3 px-4 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                        {indice + 1}
                      </span>
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          {actividad.nombre}
                        </span>
                        <span className="ml-2 text-xs text-gray-500">
                          {TIPOS.find((tipo) => tipo.valor === actividad.tipo)
                            ?.etiqueta || actividad.tipo}{" "}
                          · peso {actividad.peso}%
                        </span>
                      </div>
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
        )}

        {competenciaId && actividades.length > 0 && !cargandoDetalle && (
          <Card>
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#04ADBF] text-xs font-bold text-white">
                3
              </span>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wide text-gray-700">
                  Notas por evidencia
                </h2>
                <p className="text-xs text-gray-500">
                  Escala vigesimal (0 a 20). Deja vacío lo que no se evaluó.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="sticky left-0 z-10 bg-gray-50 px-3 py-2 font-semibold text-gray-700">
                      Estudiante
                    </th>
                    {actividades.map((actividad) => (
                      <th
                        key={actividad.id}
                        className="min-w-[110px] px-3 py-2 font-semibold text-gray-700"
                      >
                        {actividad.nombre}
                        <div className="text-xs font-normal text-gray-500">
                          peso {actividad.peso}%
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
                      <td className="sticky left-0 z-10 bg-white px-3 py-2 font-medium text-gray-900">
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
                              valores[`${actividad.id}-${estudiante.id}`] || ""
                            }
                            onChange={(evento) =>
                              setValores({
                                ...valores,
                                [`${actividad.id}-${estudiante.id}`]:
                                  evento.target.value,
                              })
                            }
                            className="w-full rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="—"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
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
      </div>
    </PermissionGuard>
  );
}
