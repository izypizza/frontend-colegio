"use client";

import { useEffect, useState } from "react";
import { Card } from "@/src/components/ui";
import { estudiantePortalService } from "@/src/lib/services";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

interface Asistencia {
  id: number;
  fecha: string;
  estado: string;
  observaciones?: string;
  materia: {
    id: number;
    nombre: string;
  };
}

interface AsistenciasData {
  asistencias: Asistencia[];
  estadisticas: {
    total: number;
    presentes: number;
    ausentes: number;
    porcentaje_asistencia: number;
  };
}

export default function MisAsistenciasPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AsistenciasData | null>(null);
  const [filtros, setFiltros] = useState({
    fecha_inicio: "",
    fecha_fin: "",
  });

  useEffect(() => {
    fetchAsistencias();
  }, []);

  const fetchAsistencias = async () => {
    try {
      setLoading(true);
      const params = {
        ...(filtros.fecha_inicio && { fecha_inicio: filtros.fecha_inicio }),
        ...(filtros.fecha_fin && { fecha_fin: filtros.fecha_fin }),
      };
      const response = await estudiantePortalService.misAsistencias(params);
      setData(response);
    } catch (error) {
      console.error("Error al cargar asistencias:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltrar = () => {
    fetchAsistencias();
  };

  const getEstadoBadge = (estado: string) => {
    const estados: Record<string, { color: string; text: string }> = {
      presente: { color: "bg-green-100 text-green-800", text: "Presente" },
      ausente: { color: "bg-red-100 text-red-800", text: "Ausente" },
      tarde: { color: "bg-yellow-100 text-yellow-800", text: "Llegó Tarde" },
    };
    const { color, text } = estados[estado] || {
      color: "bg-gray-100 text-gray-800",
      text: estado,
    };
    return (
      <span
        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${color}`}
      >
        {text}
      </span>
    );
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Preparar datos para gráficas
  const prepararDatosGraficas = () => {
    if (!data || !data.asistencias) return null;

    // Gráfico de dona - Distribución por estado
    const distribucion = {
      presente: data.asistencias.filter((a) => a.estado === "presente").length,
      ausente: data.asistencias.filter((a) => a.estado === "ausente").length,
      tarde: data.asistencias.filter((a) => a.estado === "tarde").length,
    };

    const pieData = [
      { name: "Presente", value: distribucion.presente, color: "#10B981" },
      { name: "Ausente", value: distribucion.ausente, color: "#EF4444" },
      { name: "Llegó Tarde", value: distribucion.tarde, color: "#F59E0B" },
    ].filter((item) => item.value > 0);

    // Asistencias por materia
    const asistenciasPorMateria: Record<string, any> = {};
    data.asistencias.forEach((a) => {
      const materiaId = a.materia.id;
      if (!asistenciasPorMateria[materiaId]) {
        asistenciasPorMateria[materiaId] = {
          materia: a.materia.nombre,
          presente: 0,
          ausente: 0,
          tardanza: 0,
          total: 0,
        };
      }
      asistenciasPorMateria[materiaId].total++;
      if (a.estado === "presente") asistenciasPorMateria[materiaId].presente++;
      if (a.estado === "ausente") asistenciasPorMateria[materiaId].ausente++;
      if (a.estado === "tarde") asistenciasPorMateria[materiaId].tardanza++;
    });

    const barData = Object.values(asistenciasPorMateria).map((item: any) => ({
      ...item,
      porcentaje: ((item.presente / item.total) * 100).toFixed(1),
    }));

    // Tendencia semanal
    const asistenciasPorSemana: Record<string, any> = {};
    data.asistencias.forEach((a) => {
      const fecha = new Date(a.fecha);
      const semana = `Sem ${Math.ceil(fecha.getDate() / 7)}`;
      if (!asistenciasPorSemana[semana]) {
        asistenciasPorSemana[semana] = { semana, presentes: 0, total: 0 };
      }
      asistenciasPorSemana[semana].total++;
      if (a.estado === "presente") asistenciasPorSemana[semana].presentes++;
    });

    const lineData = Object.values(asistenciasPorSemana).map((item: any) => ({
      ...item,
      porcentaje: ((item.presentes / item.total) * 100).toFixed(1),
    }));

    return { pieData, barData, lineData };
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
        <h1 className="text-3xl font-bold text-gray-900">Mis Asistencias</h1>
        <p className="text-gray-600 mt-2">
          Revisa tu registro de asistencias y puntualidad
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={filtros.fecha_inicio}
              onChange={(e) =>
                setFiltros({ ...filtros, fecha_inicio: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Fin
            </label>
            <input
              type="date"
              value={filtros.fecha_fin}
              onChange={(e) =>
                setFiltros({ ...filtros, fecha_fin: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleFiltrar}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      </Card>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total</h3>
              <p className="text-3xl font-bold text-gray-900">
                {data?.estadisticas.total || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-gray-600"
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
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Presentes
              </h3>
              <p className="text-3xl font-bold text-green-600">
                {data?.estadisticas.presentes || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Ausentes
              </h3>
              <p className="text-3xl font-bold text-red-600">
                {data?.estadisticas.ausentes || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                % Asistencia
              </h3>
              <p
                className={`text-3xl font-bold ${
                  (data?.estadisticas.porcentaje_asistencia || 0) >= 80
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {data?.estadisticas.porcentaje_asistencia.toFixed(1) || 0}%
              </p>
            </div>
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                (data?.estadisticas.porcentaje_asistencia || 0) >= 80
                  ? "bg-green-100"
                  : "bg-red-100"
              }`}
            >
              <svg
                className={`w-6 h-6 ${
                  (data?.estadisticas.porcentaje_asistencia || 0) >= 80
                    ? "text-green-600"
                    : "text-red-600"
                }`}
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
      </div>

      {data?.asistencias && data.asistencias.length > 0 && graficasData && (
        <>
          {/* Gráficas de análisis */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Gráfico de dona - Distribución */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📊 Distribución de Asistencias
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={graficasData.pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {graficasData.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            {/* Gráfico de barras - Por materia */}
            <Card className="lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📚 Asistencia por Materia
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={graficasData.barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="materia"
                    angle={-20}
                    textAnchor="end"
                    height={80}
                    fontSize={11}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="presente" fill="#10B981" name="Presente" />
                  <Bar dataKey="tardanza" fill="#F59E0B" name="Tardanza" />
                  <Bar dataKey="ausente" fill="#EF4444" name="Ausente" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Gráfico de línea - Tendencia */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📈 Tendencia de Asistencia
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={graficasData.lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="semana" />
                <YAxis domain={[0, 100]} />
                <Tooltip
                  formatter={(value: any) => [`${value}%`, "Porcentaje"]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="porcentaje"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  activeDot={{ r: 7 }}
                  name="% Asistencia"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </>
      )}

      {/* Tabla de asistencias */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Registro de Asistencias
        </h2>

        {!data?.asistencias || data.asistencias.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No se encontraron registros de asistencia
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Materia
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Observaciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.asistencias.map((asistencia) => (
                  <tr key={asistencia.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatFecha(asistencia.fecha)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {asistencia.materia.nombre}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {getEstadoBadge(asistencia.estado)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {asistencia.observaciones || "-"}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
