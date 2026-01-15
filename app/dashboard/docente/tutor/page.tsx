"use client";

import { useEffect, useState } from "react";
import { Card } from "@/src/components/ui";
import { apiClient } from "@/src/lib/api-client";

interface TutorInfo {
  es_tutor: boolean;
  seccion?: {
    id: number;
    nombre: string;
    grado: {
      id: number;
      nombre: string;
    };
  };
  periodo?: {
    id: number;
    nombre: string;
  };
  tutor_hasta?: string | null;
}

interface Calificacion {
  id: number;
  estudiante: {
    id: number;
    nombres: string;
    apellido_paterno: string;
    apellido_materno: string;
  };
  materia: {
    id: number;
    nombre: string;
  };
  nota: number;
  modificaciones_count: number;
  ultima_modificacion: string | null;
}

interface Asistencia {
  id: number;
  estudiante: {
    id: number;
    nombres: string;
    apellido_paterno: string;
    apellido_materno: string;
  };
  materia: {
    id: number;
    nombre: string;
  };
  fecha: string;
  estado: "presente" | "tarde" | "ausente";
  observaciones: string | null;
}

export default function TutorPage() {
  const [loading, setLoading] = useState(true);
  const [tutorInfo, setTutorInfo] = useState<TutorInfo | null>(null);
  const [activeTab, setActiveTab] = useState<"calificaciones" | "asistencias">(
    "calificaciones"
  );
  const [calificaciones, setCalificaciones] = useState<Calificacion[]>([]);
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    checkTutorStatus();
  }, []);

  useEffect(() => {
    if (tutorInfo?.es_tutor) {
      if (activeTab === "calificaciones") {
        fetchCalificaciones();
      } else {
        fetchAsistencias();
      }
    }
  }, [tutorInfo, activeTab]);

  const checkTutorStatus = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<TutorInfo>("/docente/es-tutor");
      setTutorInfo(response);
    } catch (error) {
      console.error("Error al verificar estado de tutor:", error);
      setTutorInfo({ es_tutor: false });
    } finally {
      setLoading(false);
    }
  };

  const fetchCalificaciones = async () => {
    try {
      setLoadingData(true);
      const response = await apiClient.get<{ calificaciones: Calificacion[] }>(
        "/docente/tutor-calificaciones"
      );
      setCalificaciones(response.calificaciones || []);
    } catch (error) {
      console.error("Error al cargar calificaciones:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchAsistencias = async () => {
    try {
      setLoadingData(true);
      const response = await apiClient.get<{ asistencias: Asistencia[] }>(
        "/docente/tutor-asistencias"
      );
      setAsistencias(response.asistencias || []);
    } catch (error) {
      console.error("Error al cargar asistencias:", error);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!tutorInfo?.es_tutor) {
    return (
      <Card className="p-8 text-center">
        <div className="max-w-md mx-auto">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No eres tutor de ninguna sección
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Esta vista es solo para docentes asignados como tutores de una
            sección específica.
          </p>
        </div>
      </Card>
    );
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "presente":
        return "bg-green-100 text-green-800";
      case "tarde":
        return "bg-yellow-100 text-yellow-800";
      case "ausente":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getNotaColor = (nota: number) => {
    if (nota >= 14) return "text-green-600";
    if (nota >= 11) return "text-yellow-600";
    return "text-red-600";
  };

  // Calcular estadísticas
  const estadisticas = {
    promedio:
      calificaciones.length > 0
        ? (
            calificaciones.reduce((sum, c) => sum + c.nota, 0) /
            calificaciones.length
          ).toFixed(2)
        : "0.00",
    totalEstudiantes: new Set(calificaciones.map((c) => c.estudiante.id)).size,
    asistenciaPromedio:
      asistencias.length > 0
        ? (
            (asistencias.filter((a) => a.estado === "presente").length /
              asistencias.length) *
            100
          ).toFixed(1)
        : "0.0",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Vista de Tutor</h1>
        <p className="text-gray-600 mt-2">
          Gestión de {tutorInfo.seccion?.grado.nombre} -{" "}
          {tutorInfo.seccion?.nombre}
        </p>
        {tutorInfo.tutor_hasta && (
          <p className="text-sm text-orange-600 mt-1">
            Tutoría válida hasta:{" "}
            {new Date(tutorInfo.tutor_hasta).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Estudiantes</p>
              <p className="text-3xl font-bold text-gray-900">
                {estadisticas.totalEstudiantes}
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg
                className="h-6 w-6 text-blue-600"
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

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Promedio General</p>
              <p
                className={`text-3xl font-bold ${getNotaColor(
                  parseFloat(estadisticas.promedio)
                )}`}
              >
                {estadisticas.promedio}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Asistencia</p>
              <p className="text-3xl font-bold text-gray-900">
                {estadisticas.asistenciaPromedio}%
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg
                className="h-6 w-6 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("calificaciones")}
            className={`${
              activeTab === "calificaciones"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Calificaciones
          </button>
          <button
            onClick={() => setActiveTab("asistencias")}
            className={`${
              activeTab === "asistencias"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Asistencias
          </button>
        </nav>
      </div>

      {/* Content */}
      {loadingData ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {activeTab === "calificaciones" && (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estudiante
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Materia
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nota
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Modificaciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {calificaciones.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          No hay calificaciones registradas
                        </td>
                      </tr>
                    ) : (
                      calificaciones.map((cal) => (
                        <tr key={cal.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {cal.estudiante.nombres}{" "}
                              {cal.estudiante.apellido_paterno}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {cal.materia.nombre}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`text-lg font-bold ${getNotaColor(
                                cal.nota
                              )}`}
                            >
                              {cal.nota.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-500">
                              {cal.modificaciones_count} vez
                              {cal.modificaciones_count !== 1 ? "es" : ""}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {activeTab === "asistencias" && (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estudiante
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Materia
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Observaciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {asistencias.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          No hay asistencias registradas
                        </td>
                      </tr>
                    ) : (
                      asistencias.map((asist) => (
                        <tr key={asist.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {asist.estudiante.nombres}{" "}
                              {asist.estudiante.apellido_paterno}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {asist.materia.nombre}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(asist.fecha).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoColor(
                                asist.estado
                              )}`}
                            >
                              {asist.estado}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500">
                              {asist.observaciones || "-"}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
