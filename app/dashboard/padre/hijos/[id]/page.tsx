"use client";

import { Alert, Card } from "@/src/components/ui";
import { PermissionGuard } from "@/src/components/auth";
import { UserRole } from "@/src/types";
import { useErrorHandler } from "@/src/hooks/useErrorHandler";
import {
  calificacionCompetenciaService,
  padrePortalService,
  periodoService,
} from "@/src/lib/services";
import {
  DIAS_SEMANA,
  construirFilasHorario,
  rangoHorario,
} from "@/src/lib/horario";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const PESTANAS = [
  { clave: "calificaciones", etiqueta: "Calificaciones" },
  { clave: "asistencias", etiqueta: "Asistencias" },
  { clave: "horario", etiqueta: "Horario" },
] as const;

type Pestana = (typeof PESTANAS)[number]["clave"];

const COLOR_NIVEL: Record<string, string> = {
  AD: "bg-green-100 text-green-800 border-green-200",
  A: "bg-blue-100 text-blue-800 border-blue-200",
  B: "bg-amber-100 text-amber-800 border-amber-200",
  C: "bg-red-100 text-red-800 border-red-200",
};

const DESCRIPCION_NIVEL: Record<string, string> = {
  AD: "Logro destacado",
  A: "Logro esperado",
  B: "En proceso",
  C: "En inicio",
};

const listaDe = <T,>(respuesta: any): T[] =>
  Array.isArray(respuesta) ? respuesta : respuesta?.data || [];

const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

const formatearFecha = (valor?: string | null): string => {
  if (!valor) return "—";

  const coincidencia = String(valor).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!coincidencia) return String(valor);

  const anio = Number(coincidencia[1]);
  const mes = Number(coincidencia[2]);
  const dia = Number(coincidencia[3]);
  const fecha = new Date(anio, mes - 1, dia);

  const dias = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

  return `${dias[fecha.getDay()]} ${dia} de ${MESES[mes - 1]} de ${anio}`;
};

const formatearFechaCorta = (valor?: string | null): string => {
  if (!valor) return "—";

  const coincidencia = String(valor).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!coincidencia) return String(valor);

  return `${coincidencia[3]}/${coincidencia[2]}/${coincidencia[1]}`;
};

export default function DetalleHijoPage() {
  const params = useParams();
  const hijoId = Number(params?.id);
  const { error, handleError } = useErrorHandler();

  const [pestanaActiva, setPestanaActiva] = useState<Pestana>("calificaciones");
  const [hijo, setHijo] = useState<any>(null);
  const [bloques, setBloques] = useState<any[]>([]);
  const [periodos, setPeriodos] = useState<any[]>([]);
  const [periodoId, setPeriodoId] = useState("");
  const [consolidado, setConsolidado] = useState<any>(null);
  const [asistencias, setAsistencias] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  useEffect(() => {
    if (!hijoId) return;

    const cargar = async () => {
      try {
        setCargando(true);
        const [respuestaHorario, respuestaPeriodos] = await Promise.all([
          padrePortalService.horarioHijo(hijoId),
          periodoService.getAll({ all: true }),
        ]);

        setHijo(respuestaHorario?.hijo ?? null);
        setBloques(respuestaHorario?.bloques ?? []);

        const listaPeriodos = listaDe<any>(respuestaPeriodos);
        setPeriodos(listaPeriodos);

        const periodoActivo =
          listaPeriodos.find((periodo) => periodo.estado === "activo") ||
          listaPeriodos[0];

        if (periodoActivo) {
          setPeriodoId(String(periodoActivo.id));
        }
      } catch (err) {
        handleError(err, "No se pudo cargar la información del estudiante");
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, [hijoId]);

  useEffect(() => {
    if (!hijoId || !periodoId || pestanaActiva !== "calificaciones") return;

    const cargarConsolidado = async () => {
      try {
        setCargandoDetalle(true);
        const respuesta = await calificacionCompetenciaService.consolidado(
          hijoId,
          parseInt(periodoId),
        );
        setConsolidado(respuesta);
      } catch (err) {
        handleError(err, "No se pudieron cargar las calificaciones");
      } finally {
        setCargandoDetalle(false);
      }
    };

    cargarConsolidado();
  }, [hijoId, periodoId, pestanaActiva]);

  useEffect(() => {
    if (!hijoId || pestanaActiva !== "asistencias" || asistencias) return;

    const cargarAsistencias = async () => {
      try {
        setCargandoDetalle(true);
        const respuesta = await padrePortalService.asistenciasHijo(hijoId);
        setAsistencias(respuesta);
      } catch (err) {
        handleError(err, "No se pudieron cargar las asistencias");
      } finally {
        setCargandoDetalle(false);
      }
    };

    cargarAsistencias();
  }, [hijoId, pestanaActiva]);

  const filasHorario = useMemo(() => construirFilasHorario(bloques), [bloques]);

  const bloqueEnCelda = (dia: string, inicio: string) =>
    bloques.find(
      (bloque) =>
        String(bloque.dia || "").toLowerCase() === dia.toLowerCase() &&
        String(bloque.hora_inicio || "").slice(0, 5) === inicio,
    );

  const totalCompetencias = useMemo(() => {
    if (!consolidado?.areas) return 0;
    return consolidado.areas.reduce(
      (total: number, area: any) => total + area.competencias.length,
      0,
    );
  }, [consolidado]);

  const periodoSeleccionado = useMemo(
    () => periodos.find((periodo) => String(periodo.id) === periodoId),
    [periodos, periodoId],
  );

  return (
    <PermissionGuard
      requiredRoles={[UserRole.PADRE]}
      fallback={
        <div className="p-6">
          <Alert
            type="error"
            message="Esta página es para padres de familia."
          />
        </div>
      }
    >
      <div className="space-y-6">
        <Link
          href="/dashboard/padre/mis-hijos"
          className="inline-flex items-center text-sm text-[#04ADBF] hover:text-[#038a99]"
        >
          ← Volver a mis hijos
        </Link>

        {error && (
          <Alert type="error" message={error} onClose={() => undefined} />
        )}

        <Card>
          {cargando ? (
            <p className="text-center text-gray-600 py-6">Cargando...</p>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {hijo?.nombre_completo || "Estudiante"}
                </h1>
                <p className="text-gray-600 mt-1">
                  {hijo?.seccion || "Sin sección asignada"}
                  {hijo?.nivel ? ` · ${hijo.nivel}` : ""}
                  {hijo?.ciclo ? ` · Ciclo ${hijo.ciclo}` : ""}
                </p>
              </div>
            </div>
          )}
        </Card>

        <div className="flex flex-wrap gap-2">
          {PESTANAS.map((pestana) => (
            <button
              key={pestana.clave}
              type="button"
              onClick={() => setPestanaActiva(pestana.clave)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                pestanaActiva === pestana.clave
                  ? "bg-[#04ADBF] text-white"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {pestana.etiqueta}
            </button>
          ))}
        </div>

        {pestanaActiva === "calificaciones" && (
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Calificaciones por competencia
                </h2>
                {periodoSeleccionado?.fecha_inicio && (
                  <p className="text-xs text-gray-500 mt-1">
                    Del {formatearFechaCorta(periodoSeleccionado.fecha_inicio)}{
                      " "
                    }
                    al {formatearFechaCorta(periodoSeleccionado.fecha_fin)}
                  </p>
                )}
              </div>
              <select
                value={periodoId}
                onChange={(evento) => setPeriodoId(evento.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar periodo</option>
                {periodos.map((periodo) => (
                  <option key={periodo.id} value={periodo.id}>
                    {periodo.nombre} - {periodo.anio}
                  </option>
                ))}
              </select>
            </div>

            {cargandoDetalle && (
              <p className="text-center text-gray-600 py-6">Cargando...</p>
            )}

            {!cargandoDetalle && consolidado?.areas?.length === 0 && (
              <Alert
                type="warning"
                message="El estudiante aún no tiene competencias registradas en este periodo."
              />
            )}

            {!cargandoDetalle && totalCompetencias > 0 && (
              <div className="space-y-6">
                <p className="text-sm text-gray-600">
                  Cada competencia conserva su propio nivel. No se promedian
                  para obtener una nota del área.
                </p>

                {consolidado.areas.map((area: any) => (
                  <div
                    key={area.materia_id}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <div className="bg-gray-50 px-4 py-2 font-semibold text-gray-800">
                      {area.materia}
                    </div>
                    <ul className="divide-y divide-gray-100">
                      {area.competencias.map((competencia: any) => (
                        <li
                          key={competencia.competencia_id}
                          className="px-4 py-3"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="flex-1 min-w-[220px]">
                              <p className="text-sm font-medium text-gray-900">
                                {competencia.nombre}
                              </p>
                              {competencia.conclusion_descriptiva && (
                                <p className="text-xs text-gray-600 mt-1">
                                  {competencia.conclusion_descriptiva}
                                </p>
                              )}
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full border text-xs font-semibold ${
                                competencia.nivel
                                  ? COLOR_NIVEL[competencia.nivel]
                                  : "bg-gray-100 text-gray-500 border-gray-200"
                              }`}
                            >
                              {competencia.nivel
                                ? `${competencia.nivel} · ${DESCRIPCION_NIVEL[competencia.nivel]}`
                                : "Sin registrar"}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {pestanaActiva === "asistencias" && (
          <Card>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Asistencias de los últimos 90 días
            </h2>

            {cargandoDetalle && (
              <p className="text-center text-gray-600 py-6">Cargando...</p>
            )}

            {!cargandoDetalle && asistencias && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {[
                    ["Registros", asistencias.estadisticas?.total ?? 0],
                    ["Presentes", asistencias.estadisticas?.presentes ?? 0],
                    ["Ausentes", asistencias.estadisticas?.ausentes ?? 0],
                    [
                      "Asistencia",
                      `${asistencias.estadisticas?.porcentaje_asistencia ?? 0}%`,
                    ],
                  ].map(([etiqueta, valor]) => (
                    <div
                      key={String(etiqueta)}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <p className="text-xs text-gray-500 uppercase">
                        {etiqueta}
                      </p>
                      <p className="text-lg font-bold text-gray-900">{valor}</p>
                    </div>
                  ))}
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-left">
                        <th className="px-3 py-2 font-semibold text-gray-700">
                          Fecha
                        </th>
                        <th className="px-3 py-2 font-semibold text-gray-700">
                          Curso
                        </th>
                        <th className="px-3 py-2 font-semibold text-gray-700">
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(asistencias.asistencias || []).map((registro: any) => (
                        <tr
                          key={registro.id}
                          className="border-t border-gray-100"
                        >
                          <td className="px-3 py-2 text-gray-700">
                            <span className="block">
                              {formatearFecha(registro.fecha)}
                            </span>
                            <span className="block text-xs text-gray-500">
                              {formatearFechaCorta(registro.fecha)}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-gray-700">
                            {registro.materia?.nombre || "—"}
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                registro.estado === "presente"
                                  ? "bg-green-100 text-green-700"
                                  : registro.estado === "tarde"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-red-100 text-red-700"
                              }`}
                            >
                              {registro.estado}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </Card>
        )}

        {pestanaActiva === "horario" && (
          <Card>
            <h2 className="text-lg font-semibold text-gray-800 mb-1">
              Horario de {hijo?.nombre_completo || "el estudiante"}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {hijo?.seccion || "Sin sección asignada"} · cada bloque dura 45
              minutos (hora académica)
            </p>

            {bloques.length === 0 ? (
              <Alert
                type="warning"
                message="Todavía no hay un horario registrado para esta sección."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      <th className="sticky left-0 z-10 w-24 border border-gray-200 bg-gray-100 px-2 py-2 text-left text-xs font-bold uppercase text-gray-600">
                        Hora
                      </th>
                      {DIAS_SEMANA.map((dia) => (
                        <th
                          key={dia}
                          className="min-w-[130px] border border-gray-200 bg-[#04ADBF] px-2 py-2 text-center text-xs font-bold uppercase text-white"
                        >
                          {dia}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filasHorario.map((franja) =>
                      franja.tipo === "receso" ? (
                        <tr key={franja.inicio} className="bg-gray-50">
                          <td className="sticky left-0 z-10 border border-gray-200 bg-gray-100 px-2 py-1 text-[11px] font-semibold text-gray-500">
                            {rangoHorario(franja.inicio, franja.fin)}
                          </td>
                          <td
                            colSpan={DIAS_SEMANA.length}
                            className="border border-gray-200 px-2 py-1 text-center text-[11px] font-semibold uppercase tracking-wide text-gray-500"
                          >
                            Recreo
                          </td>
                        </tr>
                      ) : (
                        <tr key={franja.inicio}>
                          <td className="sticky left-0 z-10 border border-gray-200 bg-gray-50 px-2 py-2 align-top">
                            <span className="block text-[11px] font-bold uppercase text-gray-700">
                              {franja.etiqueta}
                            </span>
                            <span className="block text-[11px] text-gray-500">
                              {rangoHorario(franja.inicio, franja.fin)}
                            </span>
                          </td>
                          {DIAS_SEMANA.map((dia) => {
                            const bloque = bloqueEnCelda(dia, franja.inicio);

                            return (
                              <td
                                key={`${dia}-${franja.inicio}`}
                                className="border border-gray-200 p-1 align-top"
                              >
                                {bloque && (
                                  <div className="h-full rounded-md border-l-4 border-[#04ADBF] bg-[#04ADBF]/10 p-2">
                                    <span className="block text-xs font-bold leading-tight text-gray-900">
                                      {bloque.materia || "Curso"}
                                    </span>
                                    {bloque.docente && (
                                      <span className="mt-0.5 block text-[10px] text-gray-600">
                                        {bloque.docente}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}
      </div>
    </PermissionGuard>
  );
}
