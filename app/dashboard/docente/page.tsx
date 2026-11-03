"use client";

import { useEffect, useState } from "react";
import { Card } from "@/src/components/ui";
import { dashboardService, docentePortalService } from "@/src/lib/services";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";

interface EstadisticaMateria {
  materia_id: number;
  materia: string;
  estudiantes: number;
  promedio: number | null;
  porcentaje_asistencia: number | null;
}

interface DashboardData {
  resumen: {
    total_asignaciones: number;
    total_estudiantes: number;
    promedio_general: number | null;
    porcentaje_asistencia: number | null;
  };
  asignaciones: any[];
  estadisticas_por_materia: EstadisticaMateria[];
}

interface EstadisticasDocente {
  resumen?: {
    total_asignaciones: number;
    total_estudiantes: number;
    promedio_general: number | null;
    porcentaje_asistencia: number | null;
  };
  estadisticas_por_materia?: EstadisticaMateria[];
}

export default function DocenteDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const [asignacionesRespuesta, estadisticasRespuesta] = await Promise.all([
        docentePortalService.misAsignaciones(),
        dashboardService.getStats(),
      ]);

      const estadisticas =
        estadisticasRespuesta as unknown as EstadisticasDocente;
      const resumen = estadisticas?.resumen;

      setData({
        resumen: {
          total_asignaciones:
            resumen?.total_asignaciones ??
            asignacionesRespuesta?.asignaciones?.length ??
            0,
          total_estudiantes: resumen?.total_estudiantes ?? 0,
          promedio_general: resumen?.promedio_general ?? null,
          porcentaje_asistencia: resumen?.porcentaje_asistencia ?? null,
        },
        asignaciones: asignacionesRespuesta?.asignaciones ?? [],
        estadisticas_por_materia:
          estadisticas?.estadisticas_por_materia ?? [],
      });
    } catch (error) {
      console.error("Error al cargar dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatear = (valor: number | null | undefined, decimales = 2) =>
    valor === null || valor === undefined ? "—" : valor.toFixed(decimales);

  const materiasConPromedio = (data?.estadisticas_por_materia ?? []).filter(
    (item) => item.promedio !== null,
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Docente</h1>
        <p className="text-gray-600 mt-2">
          Vista general de tus clases y estudiantes
        </p>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Mis Clases</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {data?.resumen.total_asignaciones || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">Asignaciones activas</p>
            </div>
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
              <svg
                className="w-7 h-7 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
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

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Estudiantes</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {data?.resumen.total_estudiantes || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">Total en tus clases</p>
            </div>
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-7 h-7 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
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

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Promedio General
              </p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {formatear(data?.resumen.promedio_general)}
              </p>
              <p className="text-xs text-gray-500 mt-1">De tus estudiantes</p>
            </div>
            <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
              <svg
                className="w-7 h-7 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
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

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Asistencia</p>
              <p
                className={`text-3xl font-bold mt-2 ${
                  (data?.resumen.porcentaje_asistencia || 0) >= 80
                    ? "text-green-600"
                    : "text-orange-600"
                }`}
              >
                {formatear(data?.resumen.porcentaje_asistencia, 1)}%
              </p>
              <p className="text-xs text-gray-500 mt-1">Promedio de clases</p>
            </div>
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center ${
                (data?.resumen.porcentaje_asistencia || 0) >= 80
                  ? "bg-green-100"
                  : "bg-orange-100"
              }`}
            >
              <svg
                className={`w-7 h-7 ${
                  (data?.resumen.porcentaje_asistencia || 0) >= 80
                    ? "text-green-600"
                    : "text-orange-600"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
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
      </div>

      {/* Rendimiento por materia */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Promedio por materia
        </h2>
        {materiasConPromedio.length > 0 ? (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={materiasConPromedio.map((item) => ({
                  materia: item.materia,
                  promedio: item.promedio,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="materia" />
                <YAxis domain={[0, 20]} />
                <Tooltip />
                <Bar dataKey="promedio" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">
            Aún no hay calificaciones registradas en tus materias
          </p>
        )}
      </Card>

      {/* Acciones rápidas */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Acciones Rapidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/dashboard/docente/mis-clases"
            className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors group"
          >
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-700">
                Ver Mis Clases
              </h3>
              <p className="text-sm text-gray-600">Todas tus asignaciones</p>
            </div>
          </Link>

          <Link
            href="/dashboard/docente/mis-estudiantes"
            className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors group"
          >
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mr-4">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-green-700">
                Mis Estudiantes
              </h3>
              <p className="text-sm text-gray-600">Lista de alumnos</p>
            </div>
          </Link>

          <Link
            href="/dashboard/calificaciones"
            className="flex items-center p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors group"
          >
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mr-4">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-purple-700">
                Calificaciones
              </h3>
              <p className="text-sm text-gray-600">Registrar notas</p>
            </div>
          </Link>
        </div>
      </Card>

      {/* Mis Clases */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Mis Clases</h2>
        {data?.asignaciones && data.asignaciones.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.asignaciones.slice(0, 6).map((asignacion: any) => (
              <div
                key={asignacion.id}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-gray-900 mb-2">
                  {asignacion.materia.nombre}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {asignacion.seccion.grado.nombre} -{" "}
                  {asignacion.seccion.nombre}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                    {asignacion.periodo_academico.nombre}
                  </span>
                  <Link
                    href={`/dashboard/docente/mis-clases?id=${asignacion.id}`}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Ver →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">
            No tienes clases asignadas
          </p>
        )}
        {data?.asignaciones && data.asignaciones.length > 6 && (
          <div className="mt-4 text-center">
            <Link
              href="/dashboard/docente/mis-clases"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Ver todas las clases →
            </Link>
          </div>
        )}
      </Card>

      {/* Mensajes y Recordatorios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Recordatorios
          </h2>
          <div className="space-y-3">
            <div className="flex items-start p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
              <svg
                className="w-5 h-5 text-yellow-600 mt-0.5 mr-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Calificaciones pendientes
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Registra las notas del último bimestre
                </p>
              </div>
            </div>
            <div className="flex items-start p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
              <svg
                className="w-5 h-5 text-blue-600 mt-0.5 mr-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Asistencia de hoy
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  No olvides tomar asistencia en todas tus clases
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Consejos</h2>
          <div className="space-y-3">
            <div className="flex items-start p-3 bg-green-50 rounded">
              <svg
                className="w-5 h-5 text-green-600 mt-0.5 mr-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Usa la vista de gráficas
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Analiza el rendimiento de tus estudiantes visualmente
                </p>
              </div>
            </div>
            <div className="flex items-start p-3 bg-purple-50 rounded">
              <svg
                className="w-5 h-5 text-purple-600 mt-0.5 mr-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Registra observaciones
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Agrega comentarios para un mejor seguimiento
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
