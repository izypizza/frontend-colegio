"use client";

import { Card } from "@/src/components/ui";
import { useEffect, useState } from "react";
import { dashboardService } from "@/src/lib/services";
import { useAuth } from "@/src/features/auth";
import { UserRole } from "@/src/types";
import { useAutoRefresh } from "@/src/hooks/useAutoRefresh";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async (silencioso = false) => {
    try {
      if (!silencioso) {
        setError(null);
      }
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (error: any) {
      console.error("Error al cargar estadísticas:", error);
      if (!silencioso) {
        setError(
          error.message || "Error al cargar las estadísticas del sistema",
        );
      }
    } finally {
      if (!silencioso) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  useAutoRefresh(() => loadStats(true), {
    intervaloMs: 45000,
    activo: Boolean(user),
  });

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin inline-block w-10 h-10 border-4 border-[#04ADBF] border-t-transparent rounded-full"></div>
        <p className="mt-4 text-gray-600">Cargando tu dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <svg
            className="w-12 h-12 text-red-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Error al cargar datos
          </h3>
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (user?.role === UserRole.BIBLIOTECARIO) {
    const biblioteca = stats?.biblioteca;
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Portal de Biblioteca
        </h1>
        <p className="text-gray-600">Bienvenido(a), {user.name}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            ["Libros en catálogo", biblioteca?.total_libros ?? 0],
            ["Préstamos activos", biblioteca?.prestamos_activos ?? 0],
            ["Solicitudes pendientes", biblioteca?.prestamos_pendientes ?? 0],
            ["Préstamos vencidos", biblioteca?.prestamos_vencidos ?? 0],
          ].map(([titulo, total]) => (
            <Card key={titulo}>
              <p className="text-sm text-gray-600">{titulo}</p>
              <p className="text-3xl font-bold text-[#04ADBF] mt-2">{total}</p>
            </Card>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/biblioteca"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#04ADBF] text-white text-sm font-semibold shadow-sm transition-colors hover:bg-[#039aab] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#04ADBF]"
          >
            Consultar catálogo
          </Link>
          <Link
            href="/dashboard/prestamos"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-[#04ADBF] bg-white text-sm font-semibold text-[#04ADBF] transition-colors hover:bg-[#04ADBF]/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#04ADBF]"
          >
            Gestionar préstamos
          </Link>
          <Link
            href="/dashboard/biblioteca/estadisticas"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
          >
            Ver reportes
          </Link>
        </div>
      </div>
    );
  }

  // Dashboard personalizado para docentes
  if (user?.role === UserRole.DOCENTE) {
    return (
      <div className="space-y-6">
        <div className="bg-[#04ADBF] rounded-lg p-6 shadow-md text-white">
          <h1 className="text-3xl font-bold">Portal del Docente</h1>
          <p className="mt-2 text-teal-50">Bienvenido(a), {user.name}</p>
          <p className="mt-1 text-sm text-teal-100">
            Gestiona tus clases, estudiantes y evaluaciones desde aquí
          </p>
        </div>

        {/* Estadísticas rápidas */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="bg-green-50 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">
                    Estudiantes
                  </p>
                  <p className="text-3xl font-bold text-green-900">
                    {stats.mis_estudiantes || 0}
                  </p>
                </div>
                <div className="p-3 bg-green-200 rounded-full">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
              </div>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">
                    Asistencias Hoy
                  </p>
                  <p className="text-3xl font-bold text-purple-900">
                    {stats.asistencias_hoy || 0}
                  </p>
                </div>
                <div className="p-3 bg-purple-200 rounded-full">
                  <svg
                    className="w-8 h-8 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </Card>

            <Card className="bg-orange-50 border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium">
                    Calificaciones
                  </p>
                  <p className="text-3xl font-bold text-orange-900">
                    {stats.calificaciones?.registradas || 0}
                  </p>
                  <p className="text-xs text-orange-500">
                    {stats.calificaciones?.pendientes || 0} pendientes
                  </p>
                </div>
                <div className="p-3 bg-orange-200 rounded-full">
                  <svg
                    className="w-8 h-8 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Tareas Pendientes */}
        {stats?.tareas_pendientes && (
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Tareas de Hoy
            </h2>
            <div className="space-y-3">
              {stats.tareas_pendientes.map((tarea: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border-l-4 ${
                    tarea.prioridad === "alta"
                      ? "bg-red-50 border-red-500"
                      : "bg-blue-50 border-blue-500"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {tarea.tipo}
                      </p>
                      <p className="text-sm text-gray-600">
                        {tarea.descripcion}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        tarea.prioridad === "alta"
                          ? "bg-red-200 text-red-800"
                          : "bg-blue-200 text-blue-800"
                      }`}
                    >
                      {tarea.prioridad === "alta" ? "Urgente" : "Normal"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Sin bloque de clases asignadas para vista simplificada */}
      </div>
    );
  }

  // Dashboard personalizado para estudiantes
  if (user?.role === UserRole.ESTUDIANTE) {
    return (
      <div className="space-y-6">
        <div className="bg-[#04ADBF] rounded-lg p-6 shadow-md text-white">
          <h1 className="text-3xl font-bold">Portal del Estudiante</h1>
          <p className="mt-2 text-teal-50">Bienvenido(a), {user.name}</p>
          <p className="mt-1 text-sm text-teal-100">
            Consulta tus calificaciones, asistencias y tareas
          </p>
          {stats?.info_personal && (
            <div className="mt-4 bg-white/20 rounded-lg p-3 backdrop-blur-sm">
              <p className="text-sm">
                {stats.info_personal.grado} - {stats.info_personal.seccion}
              </p>
            </div>
          )}
        </div>

        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.calificaciones && (
              <Card className="bg-blue-50 border-blue-200">
                <div className="text-center">
                  <p className="text-sm text-blue-600 font-medium">
                    Mi Promedio
                  </p>
                  <p className="text-4xl font-bold text-blue-900 my-2">
                    {stats.calificaciones.promedio ?? "—"}
                  </p>
                  <p className="text-xs text-blue-600">
                    {stats.calificaciones.aprobados} aprobados /{" "}
                    {stats.calificaciones.desaprobados} desaprobados
                  </p>
                </div>
              </Card>
            )}

            {stats.asistencia_mes && (
              <Card className="bg-green-50 border-green-200">
                <div className="text-center">
                  <p className="text-sm text-green-600 font-medium">
                    Asistencia del Mes
                  </p>
                  <p className="text-4xl font-bold text-green-900 my-2">
                    {stats.asistencia_mes.total > 0
                      ? `${stats.asistencia_mes.porcentaje}%`
                      : "—"}
                  </p>
                  <div className="text-xs text-green-600 space-y-1">
                    <p>• {stats.asistencia_mes.presentes} presentes</p>
                    <p>• {stats.asistencia_mes.faltas} faltas</p>
                  </div>
                </div>
              </Card>
            )}

            {stats.calificaciones && (
              <Card className="bg-purple-50 border-purple-200">
                <div className="text-center">
                  <p className="text-sm text-purple-600 font-medium">
                    Mejor Curso
                  </p>
                  <p className="text-2xl font-bold text-purple-900 my-2">
                    {stats.calificaciones.curso_mejor}
                  </p>
                  <p className="text-4xl font-bold text-purple-900">
                    {stats.calificaciones.total_cursos > 0
                      ? stats.calificaciones.mejor_nota
                      : "—"}
                  </p>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Recordatorios */}
        {stats?.recordatorios && (
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Recordatorios
            </h2>
            <div className="space-y-3">
              {stats.recordatorios.map((recordatorio: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg ${
                    recordatorio.tipo === "success"
                      ? "bg-green-50 border border-green-200"
                      : recordatorio.tipo === "warning"
                        ? "bg-yellow-50 border border-yellow-200"
                        : "bg-blue-50 border border-blue-200"
                  }`}
                >
                  <p className="font-semibold text-gray-900">
                    {recordatorio.titulo}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    {recordatorio.mensaje}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    );
  }

  // Dashboard personalizado para padres
  if (user?.role === UserRole.PADRE) {
    return (
      <div className="space-y-6">
        <div className="bg-[#04ADBF] rounded-lg p-6 shadow-md text-white">
          <h1 className="text-3xl font-bold">Portal del Padre de Familia</h1>
          <p className="mt-2 text-teal-50">Bienvenido(a), {user.name}</p>
          <p className="mt-1 text-sm text-teal-100">
            Monitorea el progreso académico de tus hijos
          </p>
          {stats?.mis_hijos && (
            <p className="mt-2 text-teal-100">
              Tienes {stats.mis_hijos}{" "}
              {stats.mis_hijos === 1 ? "hijo registrado" : "hijos registrados"}
            </p>
          )}
        </div>

        {/* Resumen General */}
        {stats?.resumen && (
          <Card className="bg-blue-50 border-blue-200">
            <div className="text-center">
              <p className="text-sm text-blue-600 font-medium">
                Promedio General de tus Hijos
              </p>
              <p className="text-5xl font-bold text-blue-900 my-3">
                {stats.resumen.promedio_general ?? "Sin evaluaciones"}
              </p>
              <p className="text-sm text-blue-600">
                {stats.resumen.periodo_actual}
              </p>
            </div>
          </Card>
        )}

        {/* Alertas Importantes */}
        {stats?.alertas && stats.alertas.length > 0 && (
          <Card className="border-l-4 border-red-500">
            <h2 className="text-xl font-bold text-red-900 mb-4">
              Alertas Importantes
            </h2>
            <div className="space-y-3">
              {stats.alertas.map((alerta: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg ${
                    alerta.severidad === "alta"
                      ? "bg-red-100 border border-red-300"
                      : "bg-yellow-100 border border-yellow-300"
                  }`}
                >
                  <p className="font-semibold text-gray-900">
                    {alerta.estudiante}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">{alerta.mensaje}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Información de Hijos */}
        {stats?.hijos_detalle && stats.hijos_detalle.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {stats.hijos_detalle.map((hijo: any, idx: number) => (
              <Card key={idx}>
                <div className="border-b border-gray-200 pb-4 mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    {hijo.nombre}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {hijo.grado} - {hijo.seccion}
                  </p>
                </div>

                {/* Promedio */}
                {hijo.promedio !== undefined && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600 font-medium">
                      Promedio Actual
                    </p>
                    <p
                      className={`text-3xl font-bold ${
                        hijo.promedio >= 14
                          ? "text-green-600"
                          : hijo.promedio >= 11
                            ? "text-blue-600"
                            : "text-red-600"
                      }`}
                    >
                      {hijo.promedio ?? "Sin evaluaciones"}
                    </p>
                  </div>
                )}

                {/* Asistencia */}
                {hijo.asistencia && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-700">
                      Asistencia del Mes:
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2 bg-green-100 rounded text-center">
                        <p className="text-xs text-green-600">Presentes</p>
                        <p className="text-lg font-bold text-green-800">
                          {hijo.asistencia.presentes}
                        </p>
                      </div>
                      <div className="p-2 bg-yellow-100 rounded text-center">
                        <p className="text-xs text-yellow-600">Tardanzas</p>
                        <p className="text-lg font-bold text-yellow-800">
                          {hijo.asistencia.tardanzas}
                        </p>
                      </div>
                      <div className="p-2 bg-red-100 rounded text-center">
                        <p className="text-xs text-red-600">Faltas</p>
                        <p className="text-lg font-bold text-red-800">
                          {hijo.asistencia.faltas}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Panel compacto para el auxiliar: solo lo que necesita en el día a día
  if (user?.role === UserRole.AUXILIAR) {
    const asistenciaHoy = stats?.asistencias_hoy;
    const calificacionesPeriodo = stats?.calificaciones;

    const indicadores = [
      {
        titulo: "Estudiantes",
        valor: stats?.estudiantes ?? 0,
        detalle: `${stats?.secciones ?? 0} secciones`,
      },
      {
        titulo: "Asistencia de hoy",
        valor: `${asistenciaHoy?.porcentaje_asistencia ?? 0}%`,
        detalle: `${asistenciaHoy?.presentes ?? 0} presentes`,
      },
      {
        titulo: "Calificaciones",
        valor: calificacionesPeriodo?.total_calificaciones ?? 0,
        detalle: `${calificacionesPeriodo?.aprobados ?? 0} aprobadas`,
      },
      {
        titulo: "Tardanzas de hoy",
        valor: asistenciaHoy?.tardes ?? 0,
        detalle: `${asistenciaHoy?.ausentes ?? 0} ausentes`,
      },
    ];

    const accesos = [
      {
        titulo: "Asistencias",
        descripcion: "Registrar y justificar",
        href: "/dashboard/asistencias",
        trazo: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
      },
      {
        titulo: "Calificaciones",
        descripcion: "Consultar notas",
        href: "/dashboard/calificaciones",
        trazo:
          "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
      },
      {
        titulo: "Estudiantes",
        descripcion: "Fichas y apoderados",
        href: "/dashboard/estudiantes",
        trazo:
          "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
      },
      {
        titulo: "Horarios",
        descripcion: "Consulta de aulas",
        href: "/dashboard/horarios",
        trazo:
          "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
      },
    ];

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Hola, {user.name}
          </h1>
          <p className="text-sm text-gray-500">
            Panel del auxiliar · I.E. N° 51006 Túpac Amaru
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {indicadores.map((indicador) => (
            <Card key={indicador.titulo}>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                {indicador.titulo}
              </p>
              <p className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
                {indicador.valor}
              </p>
              <p className="mt-1 text-xs text-gray-500">{indicador.detalle}</p>
            </Card>
          ))}
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
            Tareas rápidas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {accesos.map((acceso) => (
              <Link key={acceso.href} href={acceso.href}>
                <Card className="hover:shadow-md transition-shadow h-full">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-teal-50 rounded-lg text-[#04ADBF]">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={acceso.trazo}
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {acceso.titulo}
                      </p>
                      <p className="text-xs text-gray-500">
                        {acceso.descripcion}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Dashboard para administración
  const asistenciaHoy = stats?.asistencias_hoy;
  const notaResumen = stats?.calificaciones;

  const indicadores = [
    {
      titulo: "Estudiantes",
      valor: stats?.estudiantes ?? 0,
      detalle: `${stats?.grados ?? 0} grados activos`,
      href: "/dashboard/estudiantes",
      trazo:
        "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
    },
    {
      titulo: "Docentes",
      valor: stats?.docentes ?? 0,
      detalle: "Personal activo",
      href: "/dashboard/docentes",
      trazo:
        "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    },
    {
      titulo: "Secciones",
      valor: stats?.secciones ?? 0,
      detalle: `${stats?.materias ?? 0} cursos`,
      href: "/dashboard/grados",
      trazo:
        "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
    },
    {
      titulo: "Asistencia de hoy",
      valor: `${asistenciaHoy?.porcentaje_asistencia ?? 0}%`,
      detalle: `${asistenciaHoy?.presentes ?? 0} de ${asistenciaHoy?.total ?? 0}`,
      href: "/dashboard/asistencias",
      trazo: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    },
  ];

  const resumen: [string, string | number][] = [
    ["Padres de familia", stats?.padres ?? 0],
    ["Calificaciones", notaResumen?.total_calificaciones ?? 0],
    ["Promedio general", notaResumen?.promedio_general ?? "—"],
    ["Aprobados", notaResumen?.aprobados ?? 0],
    ["Desaprobados", notaResumen?.desaprobados ?? 0],
    ["Tardanzas hoy", asistenciaHoy?.tardes ?? 0],
    ["Ausentes hoy", asistenciaHoy?.ausentes ?? 0],
    ["Préstamos activos", stats?.biblioteca?.prestamos_activos ?? 0],
    ["Préstamos vencidos", stats?.biblioteca?.prestamos_vencidos ?? 0],
    ["Elecciones activas", stats?.elecciones?.activas ?? 0],
  ];

  const gruposAcceso = [
    {
      grupo: "Académico",
      items: [
        { etiqueta: "Libro de notas", href: "/dashboard/calificaciones/libro" },
        { etiqueta: "Calificaciones", href: "/dashboard/calificaciones" },
        { etiqueta: "Asistencias", href: "/dashboard/asistencias" },
        { etiqueta: "Planificación", href: "/dashboard/planificacion" },
        { etiqueta: "Competencias", href: "/dashboard/competencias" },
      ],
    },
    {
      grupo: "Personas",
      items: [
        { etiqueta: "Estudiantes", href: "/dashboard/estudiantes" },
        { etiqueta: "Matrículas", href: "/dashboard/matriculas" },
        { etiqueta: "Docentes", href: "/dashboard/docentes" },
        { etiqueta: "Padres", href: "/dashboard/padres" },
        { etiqueta: "Usuarios", href: "/dashboard/usuarios" },
      ],
    },
    {
      grupo: "Institución",
      items: [
        { etiqueta: "Grados y secciones", href: "/dashboard/grados" },
        { etiqueta: "Materias", href: "/dashboard/materias" },
        { etiqueta: "Periodos", href: "/dashboard/periodos" },
        { etiqueta: "Biblioteca", href: "/dashboard/biblioteca" },
        { etiqueta: "Configuraciones", href: "/dashboard/configuraciones" },
      ],
    },
  ];

  const totalAsistencia = asistenciaHoy?.total ?? 0;
  const proporcionPresentes =
    totalAsistencia > 0
      ? Math.round(((asistenciaHoy?.presentes ?? 0) / totalAsistencia) * 100)
      : 0;
  const totalNotas = notaResumen?.total_calificaciones ?? 0;
  const proporcionAprobados =
    totalNotas > 0
      ? Math.round(((notaResumen?.aprobados ?? 0) / totalNotas) * 100)
      : 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Hola, {user?.name}
          </h1>
          <p className="text-sm text-gray-500">
            Panel de administración · I.E. N° 51006 Túpac Amaru
          </p>
        </div>
        <Link
          href="/dashboard/calificaciones/libro"
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#04ADBF] text-white text-sm font-semibold shadow-sm transition-colors hover:bg-[#039aab] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#04ADBF]"
        >
          Abrir libro de notas
        </Link>
      </div>

      {stats ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {indicadores.map((indicador) => (
              <Link key={indicador.titulo} href={indicador.href}>
                <Card className="hover:shadow-md transition-shadow h-full">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        {indicador.titulo}
                      </p>
                      <p className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
                        {indicador.valor}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {indicador.detalle}
                      </p>
                    </div>
                    <div className="p-2 bg-teal-50 rounded-lg text-[#04ADBF]">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={indicador.trazo}
                        />
                      </svg>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          <Card>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
              Resumen del periodo
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px bg-gray-100 rounded-lg overflow-hidden">
              {resumen.map(([titulo, valor]) => (
                <div key={titulo} className="bg-white px-3 py-3">
                  <p className="text-xs text-gray-500">{titulo}</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    {valor}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
              Accesos rápidos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              {gruposAcceso.map((grupo) => (
                <Card key={grupo.grupo}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#04ADBF] mb-3">
                    {grupo.grupo}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {grupo.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="inline-flex items-center px-3 py-1.5 rounded-full border border-gray-200 bg-white text-xs font-medium text-gray-700 transition-colors hover:border-[#04ADBF] hover:text-[#04ADBF] focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#04ADBF]"
                      >
                        {item.etiqueta}
                      </Link>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {asistenciaHoy && (
              <Card>
                <div className="flex items-baseline justify-between">
                  <h2 className="text-base font-semibold text-gray-800">
                    Asistencia de hoy
                  </h2>
                  <Link
                    href="/dashboard/asistencias"
                    className="text-xs font-semibold text-[#04ADBF] hover:underline"
                  >
                    Ver detalle
                  </Link>
                </div>
                <p className="mt-3 text-3xl font-bold text-gray-900">
                  {asistenciaHoy.porcentaje_asistencia}%
                </p>
                <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
                  <div
                    className="h-2 rounded-full bg-[#04ADBF]"
                    style={{ width: `${proporcionPresentes}%` }}
                  />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-green-50 px-2 py-2">
                    <p className="text-xs text-green-700">Presentes</p>
                    <p className="text-lg font-bold text-green-800">
                      {asistenciaHoy.presentes}
                    </p>
                  </div>
                  <div className="rounded-lg bg-red-50 px-2 py-2">
                    <p className="text-xs text-red-700">Ausentes</p>
                    <p className="text-lg font-bold text-red-800">
                      {asistenciaHoy.ausentes}
                    </p>
                  </div>
                  <div className="rounded-lg bg-amber-50 px-2 py-2">
                    <p className="text-xs text-amber-700">Tardanzas</p>
                    <p className="text-lg font-bold text-amber-800">
                      {asistenciaHoy.tardes ?? 0}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            <Card>
              <div className="flex items-baseline justify-between">
                <h2 className="text-base font-semibold text-gray-800">
                  Calificaciones
                </h2>
                <Link
                  href="/dashboard/calificaciones"
                  className="text-xs font-semibold text-[#04ADBF] hover:underline"
                >
                  Ver detalle
                </Link>
              </div>
              <p className="mt-3 text-3xl font-bold text-gray-900">
                {notaResumen?.promedio_general ?? "—"}
              </p>
              <p className="text-xs text-gray-500">Promedio general</p>
              <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
                <div
                  className="h-2 rounded-full bg-green-500"
                  style={{ width: `${proporcionAprobados}%` }}
                />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-gray-50 px-2 py-2">
                  <p className="text-xs text-gray-600">Registradas</p>
                  <p className="text-lg font-bold text-gray-800">{totalNotas}</p>
                </div>
                <div className="rounded-lg bg-green-50 px-2 py-2">
                  <p className="text-xs text-green-700">Aprobados</p>
                  <p className="text-lg font-bold text-green-800">
                    {notaResumen?.aprobados ?? 0}
                  </p>
                </div>
                <div className="rounded-lg bg-red-50 px-2 py-2">
                  <p className="text-xs text-red-700">Desaprobados</p>
                  <p className="text-lg font-bold text-red-800">
                    {notaResumen?.desaprobados ?? 0}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {stats.distribucion_grados &&
            stats.distribucion_grados.length > 0 && (
              <Card>
                <h2 className="text-base font-semibold text-gray-800 mb-3">
                  Matrícula por grado
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
                        <th className="py-2 pr-4 font-semibold">Grado</th>
                        <th className="py-2 pr-4 text-center font-semibold">
                          Secciones
                        </th>
                        <th className="py-2 text-right font-semibold">
                          Estudiantes
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.distribucion_grados.map(
                        (grado: any, idx: number) => (
                          <tr
                            key={idx}
                            className="border-b border-gray-50 last:border-0 hover:bg-gray-50"
                          >
                            <td className="py-2 pr-4 font-medium text-gray-800">
                              {grado.grado}
                            </td>
                            <td className="py-2 pr-4 text-center text-gray-600">
                              {grado.secciones}
                            </td>
                            <td className="py-2 text-right font-bold text-[#04ADBF]">
                              {grado.estudiantes}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

          {stats.actividad_reciente && stats.actividad_reciente.length > 0 && (
            <Card>
              <h2 className="text-base font-semibold text-gray-800 mb-3">
                Actividad reciente
              </h2>
              <div className="space-y-2">
                {stats.actividad_reciente.map((actividad: any, idx: number) => {
                  const colorClasses: Record<string, string> = {
                    blue: "bg-[#04ADBF]",
                    green: "bg-green-500",
                    red: "bg-red-500",
                  };
                  return (
                    <div
                      key={idx}
                      className="flex items-start gap-3 pb-2 border-b border-gray-50 last:border-0 last:pb-0"
                    >
                      <div
                        className={`w-2 h-2 rounded-full mt-1.5 ${
                          colorClasses[actividad.color] || "bg-gray-400"
                        }`}
                      ></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">
                          {actividad.titulo}
                        </p>
                        <p className="text-xs text-gray-600">
                          {actividad.descripcion}
                        </p>
                      </div>
                      <p className="text-xs text-gray-400 whitespace-nowrap">
                        {actividad.fecha}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">No hay datos disponibles</p>
        </div>
      )}
    </div>
  );
}
