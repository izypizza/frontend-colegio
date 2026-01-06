"use client";

import { Card } from "@/src/components/ui";
import { useEffect, useState } from "react";
import { dashboardService, calificacionService } from "@/src/lib/services";
import { useAuth } from "@/src/features/auth";
import { UserRole } from "@/src/types";
import Link from "next/link";
import EstadisticasAvanzadas from "./calificaciones/components/EstadisticasAvanzadas";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [estadisticasAvanzadas, setEstadisticasAvanzadas] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingEstadisticas, setLoadingEstadisticas] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mostrarEstadisticas, setMostrarEstadisticas] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setError(null);
        const data = await dashboardService.getStats();
        console.log("Estadísticas cargadas:", data);
        setStats(data);
      } catch (error: any) {
        console.error("Error al cargar estadísticas:", error);
        setError(
          error.message || "Error al cargar las estadísticas del sistema"
        );
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  useEffect(() => {
    if (
      (user?.role === UserRole.ADMIN || user?.role === UserRole.AUXILIAR) &&
      mostrarEstadisticas &&
      !estadisticasAvanzadas
    ) {
      loadEstadisticasAvanzadas();
    }
  }, [mostrarEstadisticas, user?.role]);

  const loadEstadisticasAvanzadas = async () => {
    try {
      setLoadingEstadisticas(true);
      const response = await calificacionService.estadisticasAvanzadas();
      setEstadisticasAvanzadas(response);
    } catch (err) {
      console.error("[Dashboard] Error al cargar estadísticas avanzadas:", err);
    } finally {
      setLoadingEstadisticas(false);
    }
  };

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

  // Dashboard personalizado para docentes
  if (user?.role === UserRole.DOCENTE) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-lg p-6 shadow-md text-white">
          <h1 className="text-3xl font-bold">Portal del Docente</h1>
          <p className="mt-2 text-blue-50">Bienvenido, {user.name}</p>
        </div>

        {/* Estadísticas rápidas */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">
                    Mis Clases
                  </p>
                  <p className="text-3xl font-bold text-blue-900">
                    {stats.mis_clases || 0}
                  </p>
                </div>
                <div className="p-3 bg-blue-200 rounded-full">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
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

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
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

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
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

        {/* Mis Clases Detalle */}
        {stats?.clases_detalle && stats.clases_detalle.length > 0 && (
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Mis Clases Asignadas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.clases_detalle.map((clase: any, idx: number) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-lg border">
                  <h3 className="font-bold text-blue-600">{clase.materia}</h3>
                  <p className="text-sm text-gray-600">
                    {clase.grado} - {clase.seccion}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {clase.estudiantes} estudiantes
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Accesos Rápidos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/dashboard/docente/mis-clases">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Mis Clases
                </h3>
                <p className="text-gray-600 text-sm">Ver materias asignadas</p>
              </div>
            </Card>
          </Link>

          <Link href="/dashboard/docente/mis-estudiantes">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Mis Estudiantes
                </h3>
                <p className="text-gray-600 text-sm">
                  Ver lista de estudiantes
                </p>
              </div>
            </Card>
          </Link>

          <Link href="/dashboard/calificaciones">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Calificaciones
                </h3>
                <p className="text-gray-600 text-sm">
                  Registrar calificaciones
                </p>
              </div>
            </Card>
          </Link>

          <Link href="/dashboard/asistencias">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-yellow-600"
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
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Asistencias
                </h3>
                <p className="text-gray-600 text-sm">Registrar asistencias</p>
              </div>
            </Card>
          </Link>

          <Link href="/dashboard/horarios">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Horarios
                </h3>
                <p className="text-gray-600 text-sm">Ver horarios de clases</p>
              </div>
            </Card>
          </Link>

          <Link href="/dashboard/elecciones">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Elecciones
                </h3>
                <p className="text-gray-600 text-sm">Gestionar elecciones</p>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    );
  }

  // Dashboard personalizado para estudiantes
  if (user?.role === UserRole.ESTUDIANTE) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-600 to-green-400 rounded-lg p-6 shadow-md text-white">
          <h1 className="text-3xl font-bold">Portal del Estudiante</h1>
          <p className="mt-2 text-green-50">Bienvenido, {user.name}</p>
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
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <div className="text-center">
                  <p className="text-sm text-blue-600 font-medium">
                    Mi Promedio
                  </p>
                  <p className="text-4xl font-bold text-blue-900 my-2">
                    {stats.calificaciones.promedio}
                  </p>
                  <p className="text-xs text-blue-600">
                    {stats.calificaciones.aprobados} aprobados /{" "}
                    {stats.calificaciones.desaprobados} desaprobados
                  </p>
                </div>
              </Card>
            )}

            {stats.asistencia_mes && (
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <div className="text-center">
                  <p className="text-sm text-green-600 font-medium">
                    Asistencia del Mes
                  </p>
                  <p className="text-4xl font-bold text-green-900 my-2">
                    {stats.asistencia_mes.porcentaje}%
                  </p>
                  <div className="text-xs text-green-600 space-y-1">
                    <p>• {stats.asistencia_mes.presentes} presentes</p>
                    <p>• {stats.asistencia_mes.faltas} faltas</p>
                  </div>
                </div>
              </Card>
            )}

            {stats.calificaciones && (
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <div className="text-center">
                  <p className="text-sm text-purple-600 font-medium">
                    Mejor Curso
                  </p>
                  <p className="text-2xl font-bold text-purple-900 my-2">
                    {stats.calificaciones.curso_mejor}
                  </p>
                  <p className="text-4xl font-bold text-purple-900">
                    {stats.calificaciones.mejor_nota}
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

        {/* Calificaciones Detalle */}
        {stats?.calificaciones_detalle &&
          stats.calificaciones_detalle.length > 0 && (
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Mis Calificaciones
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Materia
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">
                        Nota
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.calificaciones_detalle.map(
                      (cal: any, idx: number) => (
                        <tr
                          key={idx}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-3 px-4">{cal.materia}</td>
                          <td className="text-center py-3 px-4">
                            <span
                              className={`font-bold ${
                                cal.nota >= 14
                                  ? "text-green-600"
                                  : cal.nota >= 11
                                  ? "text-blue-600"
                                  : "text-red-600"
                              }`}
                            >
                              {cal.nota}
                            </span>
                          </td>
                          <td className="text-center py-3 px-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                cal.estado === "Aprobado"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {cal.estado}
                            </span>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

        {/* Accesos Rápidos */}
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Accesos Rápidos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/dashboard/estudiante/mis-calificaciones">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Mis Calificaciones
                  </h3>
                  <p className="text-gray-600 text-sm">Ver mis notas</p>
                </div>
              </Card>
            </Link>

            <Link href="/dashboard/estudiante/mis-asistencias">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Mis Asistencias
                  </h3>
                  <p className="text-gray-600 text-sm">Ver mi asistencia</p>
                </div>
              </Card>
            </Link>

            <Link href="/dashboard/horarios">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Horarios
                  </h3>
                  <p className="text-gray-600 text-sm">Ver mi horario</p>
                </div>
              </Card>
            </Link>

            <Link href="/dashboard/elecciones">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-yellow-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Elecciones
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Participar en votaciones
                  </p>
                </div>
              </Card>
            </Link>

            <Link href="/dashboard/estudiante/biblioteca">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Biblioteca
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Solicitar préstamos de libros
                  </p>
                </div>
              </Card>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // Dashboard personalizado para padres
  if (user?.role === UserRole.PADRE) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-600 to-purple-400 rounded-lg p-6 shadow-md text-white">
          <h1 className="text-3xl font-bold">Portal del Padre de Familia</h1>
          <p className="mt-2 text-purple-50">Bienvenido, {user.name}</p>
          {stats?.mis_hijos && (
            <p className="mt-2 text-purple-100">
              Tienes {stats.mis_hijos}{" "}
              {stats.mis_hijos === 1 ? "hijo" : "hijos"} registrado(s)
            </p>
          )}
        </div>

        {/* Resumen General */}
        {stats?.resumen && (
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="text-center">
              <p className="text-sm text-blue-600 font-medium">
                Promedio General de tus Hijos
              </p>
              <p className="text-5xl font-bold text-blue-900 my-3">
                {stats.resumen.promedio_general}
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
                      {hijo.promedio}
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

        {/* Accesos Rápidos */}
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Accesos Rápidos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/dashboard/padre/mis-hijos">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-blue-600"
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
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Mis Hijos
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Ver información de mis hijos
                  </p>
                </div>
              </Card>
            </Link>

            <Link href="/dashboard/padre/calificaciones">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Calificaciones
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Ver calificaciones de mis hijos
                  </p>
                </div>
              </Card>
            </Link>

            <Link href="/dashboard/horarios">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Horarios
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Ver horarios de clases
                  </p>
                </div>
              </Card>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // Dashboard para admin/auxiliar/bibliotecario
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#04ADBF] to-blue-500 rounded-lg p-6 shadow-md text-white">
        <h1 className="text-3xl lg:text-4xl font-bold">
          Dashboard Administrativo
        </h1>
        <p className="mt-2 text-blue-50">
          Institución Educativa N° 51006 Túpac Amaru
        </p>
        <p className="text-sm text-blue-100 mt-1">Bienvenido, {user?.name}</p>
      </div>

      {stats ? (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">
                    Estudiantes
                  </p>
                  <p className="text-3xl font-bold text-blue-900">
                    {stats.estudiantes}
                  </p>
                </div>
                <div className="p-3 bg-blue-200 rounded-full">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Docentes</p>
                  <p className="text-3xl font-bold text-green-900">
                    {stats.docentes}
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

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Padres</p>
                  <p className="text-3xl font-bold text-purple-900">
                    {stats.padres}
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
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium">
                    Materias
                  </p>
                  <p className="text-3xl font-bold text-orange-900">
                    {stats.materias}
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
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600 font-medium">
                    Secciones
                  </p>
                  <p className="text-3xl font-bold text-yellow-900">
                    {stats.secciones}
                  </p>
                </div>
                <div className="p-3 bg-yellow-200 rounded-full">
                  <svg
                    className="w-8 h-8 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-indigo-600 font-medium">Grados</p>
                  <p className="text-3xl font-bold text-indigo-900">
                    {stats.grados}
                  </p>
                </div>
                <div className="p-3 bg-indigo-200 rounded-full">
                  <svg
                    className="w-8 h-8 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
              </div>
            </Card>
          </div>

          {/* Asistencias y Calificaciones Hoy */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {stats.asistencias_hoy && (
              <Card>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Asistencias de Hoy
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Registradas:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {stats.asistencias_hoy.total}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Presentes:</span>
                    <span className="text-2xl font-bold text-green-600">
                      {stats.asistencias_hoy.presentes}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Ausentes:</span>
                    <span className="text-2xl font-bold text-red-600">
                      {stats.asistencias_hoy.ausentes}
                    </span>
                  </div>
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600">
                      Porcentaje de Asistencia
                    </p>
                    <p className="text-4xl font-bold text-blue-900">
                      {stats.asistencias_hoy.porcentaje_asistencia}%
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {stats.calificaciones && (
              <Card>
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    Calificaciones
                  </h2>
                  <button
                    onClick={() => setMostrarEstadisticas(!mostrarEstadisticas)}
                    className="text-sm px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors"
                  >
                    {mostrarEstadisticas ? "Ocultar" : "Ver"} Análisis Detallado
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Promedio General:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {stats.calificaciones.promedio_general}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Registradas:</span>
                    <span className="text-2xl font-bold">
                      {stats.calificaciones.total_calificaciones}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="p-4 bg-green-50 rounded-lg text-center">
                      <p className="text-sm text-green-600">Aprobados</p>
                      <p className="text-3xl font-bold text-green-900">
                        {stats.calificaciones.aprobados}
                      </p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg text-center">
                      <p className="text-sm text-red-600">Desaprobados</p>
                      <p className="text-3xl font-bold text-red-900">
                        {stats.calificaciones.desaprobados}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Estadísticas Avanzadas de Calificaciones */}
          {mostrarEstadisticas && (
            <>
              {loadingEstadisticas ? (
                <Card>
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">
                      Cargando análisis detallado...
                    </p>
                  </div>
                </Card>
              ) : estadisticasAvanzadas ? (
                <EstadisticasAvanzadas estadisticas={estadisticasAvanzadas} />
              ) : null}
            </>
          )}

          {/* Biblioteca y Elecciones */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {stats.biblioteca && (
              <Card>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Biblioteca
                </h2>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg flex justify-between items-center">
                    <span className="text-gray-700">Préstamos Activos:</span>
                    <span className="text-xl font-bold text-blue-600">
                      {stats.biblioteca.prestamos_activos}
                    </span>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg flex justify-between items-center">
                    <span className="text-gray-700">Préstamos Vencidos:</span>
                    <span className="text-xl font-bold text-red-600">
                      {stats.biblioteca.prestamos_vencidos}
                    </span>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg flex justify-between items-center">
                    <span className="text-gray-700">Total Este Mes:</span>
                    <span className="text-xl font-bold text-green-600">
                      {stats.biblioteca.total_prestamos_mes}
                    </span>
                  </div>
                </div>
              </Card>
            )}

            {stats.elecciones && (
              <Card>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Elecciones
                </h2>
                <div className="space-y-3">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-600">Elecciones Activas</p>
                    <p className="text-4xl font-bold text-green-900">
                      {stats.elecciones.activas}
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600">Próximas Elecciones</p>
                    <p className="text-4xl font-bold text-blue-900">
                      {stats.elecciones.proximas}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Distribución por Grados */}
          {stats.distribucion_grados &&
            stats.distribucion_grados.length > 0 && (
              <Card>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Distribución por Grados
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Grado
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-700">
                          Secciones
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-700">
                          Estudiantes
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.distribucion_grados.map(
                        (grado: any, idx: number) => (
                          <tr
                            key={idx}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="py-3 px-4 font-medium">
                              {grado.grado}
                            </td>
                            <td className="text-center py-3 px-4">
                              {grado.secciones}
                            </td>
                            <td className="text-center py-3 px-4 font-bold text-blue-600">
                              {grado.estudiantes}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

          {/* Actividad Reciente */}
          {stats.actividad_reciente && stats.actividad_reciente.length > 0 && (
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Actividad Reciente
              </h2>
              <div className="space-y-3">
                {stats.actividad_reciente.map((actividad: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 pb-3 border-b last:border-b-0"
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-2 bg-${actividad.color}-600`}
                    ></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {actividad.titulo}
                      </p>
                      <p className="text-sm text-gray-600">
                        {actividad.descripcion}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {actividad.fecha}
                      </p>
                    </div>
                  </div>
                ))}
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
