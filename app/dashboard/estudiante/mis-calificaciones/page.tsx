"use client";

import { useEffect, useState } from "react";
import { Card } from "@/src/components/ui";
import { Pagination } from "@/src/components/ui/Pagination";
import { estudiantePortalService, periodoService } from "@/src/lib/services";
import { useAuth } from "@/src/features/auth";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface Calificacion {
  id: number;
  nota: number;
  observaciones?: string;
  materia: {
    id: number;
    nombre: string;
  };
  periodo: {
    id: number;
    nombre: string;
  };
}

interface CalificacionesData {
  calificaciones: Calificacion[];
  promedio: number;
}

interface Periodo {
  id: number;
  nombre: string;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export default function MisCalificacionesPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CalificacionesData | null>(null);
  const [allData, setAllData] = useState<Calificacion[]>([]);
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [selectedPeriodo, setSelectedPeriodo] = useState<number | null>(null);
  const [nivelEstudiante, setNivelEstudiante] = useState<
    "primaria" | "secundaria" | null
  >(null);
  const [pagination, setPagination] = useState<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 50,
    total: 0,
  });

  useEffect(() => {
    fetchPeriodos();
  }, []);

  useEffect(() => {
    if (selectedPeriodo) {
      fetchCalificaciones(pagination.current_page);
    }
  }, [selectedPeriodo, pagination.current_page]);

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, current_page: page }));
  };

  const handlePerPageChange = (perPage: number) => {
    setPagination((prev) => ({ ...prev, per_page: perPage, current_page: 1 }));
  };

  const fetchPeriodos = async () => {
    try {
      const response = await periodoService.getAll();
      const periodosData = response.data || response;
      setPeriodos(periodosData);

      if (Array.isArray(periodosData) && periodosData.length > 0) {
        setSelectedPeriodo(periodosData[0].id);
      }
    } catch (error) {
      console.error("Error al cargar periodos:", error);
    }
  };

  const fetchCalificaciones = async (page = 1) => {
    try {
      setLoading(true);
      const [calificacionesResponse, perfilResponse] = await Promise.all([
        estudiantePortalService.misCalificaciones({
          page,
          per_page: pagination.per_page,
        }),
        estudiantePortalService.miPerfil(),
      ]);

      const allCalificaciones = calificacionesResponse.calificaciones || [];
      const paginationData = calificacionesResponse.pagination;
      const promedioData = calificacionesResponse.promedio || 0;

      if (paginationData) {
        setPagination({
          current_page: paginationData.current_page,
          last_page: paginationData.last_page,
          per_page: paginationData.per_page,
          total: paginationData.total,
        });
      }

      setAllData(allCalificaciones);

      // Obtener nivel del estudiante (primaria/secundaria)
      const estudianteData = perfilResponse.estudiante || perfilResponse;
      const nivel = estudianteData?.seccion?.grado?.nivel || "secundaria";
      setNivelEstudiante(nivel);

      // Filtrar por periodo seleccionado
      const calificacionesFiltradas = selectedPeriodo
        ? allCalificaciones.filter(
            (c: Calificacion) => c.periodo.id === selectedPeriodo,
          )
        : allCalificaciones;

      // Calcular promedio
      const promedio =
        calificacionesFiltradas.length > 0
          ? calificacionesFiltradas.reduce(
              (sum: number, c: Calificacion) => sum + c.nota,
              0,
            ) / calificacionesFiltradas.length
          : promedioData;

      setData({ calificaciones: calificacionesFiltradas, promedio });
    } catch (error) {
      console.error("Error al cargar calificaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  const getNotaColor = (nota: number) => {
    if (nota >= 16) return "text-green-600 font-bold";
    if (nota >= 13) return "text-blue-600 font-semibold";
    if (nota >= 11) return "text-yellow-600";
    return "text-red-600 font-bold";
  };

  const getEstadoNota = (nota: number) => {
    if (nota >= 16) return "Excelente";
    if (nota >= 13) return "Bueno";
    if (nota >= 11) return "Aprobado";
    return "Reprobado";
  };

  // Función para obtener indicador visual según nota
  const getIndicadorNota = (nota: number) => {
    if (nivelEstudiante !== "primaria") return null;

    if (nota >= 18) return "Excelente";
    if (nota >= 16) return "Muy Bueno";
    if (nota >= 14) return "Bueno";
    if (nota >= 11) return "Aprobado";
    if (nota >= 8) return "Bajo";
    return "Reprobado";
  };

  // Preparar datos para gráficas
  const prepararDatosGraficas = () => {
    if (!data || !data.calificaciones) return null;

    // Datos para gráfico de barras por materia
    const barData = data.calificaciones.map((c) => ({
      materia:
        c.materia.nombre.length > 20
          ? c.materia.nombre.substring(0, 20) + "..."
          : c.materia.nombre,
      nota: c.nota,
      nombreCompleto: c.materia.nombre,
    }));

    // Datos para gráfico de radar
    const radarData = data.calificaciones.map((c) => ({
      materia:
        c.materia.nombre.length > 15
          ? c.materia.nombre.substring(0, 15) + "..."
          : c.materia.nombre,
      nota: c.nota,
      promedio: data.promedio,
    }));

    // Datos para gráfico de dona (distribución de notas)
    const distribucion = {
      excelente: data.calificaciones.filter((c) => c.nota >= 16).length,
      bueno: data.calificaciones.filter((c) => c.nota >= 13 && c.nota < 16)
        .length,
      aprobado: data.calificaciones.filter((c) => c.nota >= 11 && c.nota < 13)
        .length,
      reprobado: data.calificaciones.filter((c) => c.nota < 11).length,
    };

    const pieData = [
      {
        name: "Excelente (16-20)",
        value: distribucion.excelente,
        color: "#10B981",
      },
      { name: "Bueno (13-15)", value: distribucion.bueno, color: "#3B82F6" },
      {
        name: "Aprobado (11-12)",
        value: distribucion.aprobado,
        color: "#F59E0B",
      },
      {
        name: "Reprobado (0-10)",
        value: distribucion.reprobado,
        color: "#EF4444",
      },
    ].filter((item) => item.value > 0);

    // Datos para evolución por periodo (si hay múltiples periodos)
    const evolucionData = periodos.map((periodo) => {
      const calificacionesPeriodo = allData.filter(
        (c) => c.periodo.id === periodo.id,
      );
      const promedioPeriodo =
        calificacionesPeriodo.length > 0
          ? calificacionesPeriodo.reduce((sum, c) => sum + c.nota, 0) /
            calificacionesPeriodo.length
          : 0;
      return {
        periodo: periodo.nombre,
        promedio: parseFloat(promedioPeriodo.toFixed(2)),
      };
    });

    return { barData, radarData, pieData, evolucionData };
  };

  const graficasData = prepararDatosGraficas();

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
        <h1 className="text-3xl font-bold text-gray-900">Mis Calificaciones</h1>
        <p className="text-gray-600 mt-2">
          Revisa tu rendimiento académico por periodo
        </p>
      </div>

      {/* Selector de periodo */}
      <div className="flex gap-2">
        {periodos.map((periodo) => (
          <button
            key={periodo.id}
            onClick={() => setSelectedPeriodo(periodo.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedPeriodo === periodo.id
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {periodo.nombre}
          </button>
        ))}
      </div>

      {/* Resumen de promedio */}
      <Card>
        <div className="text-center py-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Promedio General
          </h3>
          <div className="flex items-center justify-center gap-4">
            {nivelEstudiante === "primaria" && data?.promedio && (
              <span className="text-6xl" title="¿Cómo voy?">
                {getEmojiNota(data.promedio)}
              </span>
            )}
            <div
              className={`text-5xl font-bold ${getNotaColor(
                data?.promedio || 0,
              )}`}
            >
              {data?.promedio
                ? typeof data.promedio === "number"
                  ? data.promedio.toFixed(2)
                  : Number(data.promedio).toFixed(2)
                : "0.00"}
            </div>
          </div>
          <p className={`text-lg mt-2 ${getNotaColor(data?.promedio || 0)}`}>
            {getEstadoNota(data?.promedio || 0)}
          </p>
          <div className="mt-4 flex justify-center gap-8 text-sm">
            <div>
              <span className="text-gray-600">Materias:</span>
              <span className="ml-2 font-semibold">
                {data?.calificaciones.length || 0}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Aprobadas:</span>
              <span className="ml-2 font-semibold text-green-600">
                {data?.calificaciones.filter((c) => c.nota >= 11).length || 0}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Reprobadas:</span>
              <span className="ml-2 font-semibold text-red-600">
                {data?.calificaciones.filter((c) => c.nota < 11).length || 0}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {data?.calificaciones &&
        data.calificaciones.length > 0 &&
        graficasData && (
          <>
            {/* Gráficas de análisis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de barras - Notas por materia */}
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Notas por Materia
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={graficasData.barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="materia"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      fontSize={12}
                    />
                    <YAxis domain={[0, 20]} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                              <p className="font-semibold">
                                {data.nombreCompleto}
                              </p>
                              <p
                                className={`text-lg font-bold ${getNotaColor(
                                  data.nota,
                                )}`}
                              >
                                Nota:{" "}
                                {typeof data.nota === "number"
                                  ? data.nota.toFixed(2)
                                  : Number(data.nota || 0).toFixed(2)}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="nota" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* Gráfico de radar - Vista comparativa */}
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Vista Comparativa
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={graficasData.radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="materia" fontSize={11} />
                    <PolarRadiusAxis domain={[0, 20]} />
                    <Radar
                      name="Tu nota"
                      dataKey="nota"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.6}
                    />
                    <Radar
                      name="Promedio"
                      dataKey="promedio"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.3}
                    />
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </Card>

              {/* Gráfico de dona - Distribución */}
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Distribución de Calificaciones
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={graficasData.pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {graficasData.pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>

              {/* Gráfico de línea - Evolución por periodo */}
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Evolución por Periodo
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={graficasData.evolucionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="periodo" />
                    <YAxis domain={[0, 20]} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="promedio"
                      stroke="#8B5CF6"
                      strokeWidth={3}
                      dot={{ r: 6 }}
                      activeDot={{ r: 8 }}
                      name="Promedio"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </>
        )}

      {/* Tabla de calificaciones */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Calificaciones por Materia
        </h2>

        {!data?.calificaciones || data.calificaciones.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No tienes calificaciones registradas en este periodo
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Materia
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nota
                  </th>
                  {nivelEstudiante === "primaria" && (
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ¿Cómo voy?
                    </th>
                  )}
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Observaciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.calificaciones.map((calificacion) => (
                  <tr key={calificacion.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {calificacion.materia.nombre}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`text-2xl ${getNotaColor(
                          Number(calificacion.nota || 0)
                        )}`}
                      >
                        {typeof calificacion.nota === "number"
                          ? calificacion.nota.toFixed(2)
                          : Number(calificacion.nota || 0).toFixed(2)}
                      </span>
                    </td>
                    {nivelEstudiante === "primaria" && (
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className="text-4xl"
                          title={`Nota: ${Number(calificacion.nota || 0).toFixed(2)}`}
                        >
                          {getEmojiNota(Number(calificacion.nota || 0))}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          Number(calificacion.nota || 0) >= 11
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {getEstadoNota(Number(calificacion.nota || 0))}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {calificacion.observaciones || "-"}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        {data?.calificaciones && data.calificaciones.length > 0 && (
          <div className="mt-4">
            <Pagination
              currentPage={pagination.current_page}
              lastPage={pagination.last_page}
              total={pagination.total}
              perPage={pagination.per_page}
              onPageChange={handlePageChange}
              onPerPageChange={handlePerPageChange}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
