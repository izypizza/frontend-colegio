"use client";

import { Card } from "@/src/components/ui";
import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

interface EstadisticasAvanzadasProps {
  estadisticas: any;
}

export default function EstadisticasAvanzadas({
  estadisticas,
}: EstadisticasAvanzadasProps) {
  const [vistaActiva, setVistaActiva] = useState<
    "resumen" | "niveles" | "grados" | "distribucion"
  >("resumen");

  if (!estadisticas) {
    return null;
  }

  const { general, por_nivel, por_grado, distribucion } = estadisticas;

  // Colores para las gráficas
  const COLORS = {
    excelente: "#10b981", // verde
    bueno: "#3b82f6", // azul
    regular: "#f59e0b", // amarillo
    deficiente: "#ef4444", // rojo
    aprobados: "#10b981",
    desaprobados: "#ef4444",
  };

  // Preparar datos para gráficas
  const datosNiveles = Object.entries(por_nivel || {}).map(
    ([nivel, stats]: [string, any]) => ({
      nivel,
      promedio: stats.promedio,
      aprobados: stats.aprobados,
      desaprobados: stats.desaprobados,
      total: stats.total,
    }),
  );

  const datosGrados = (por_grado || []).map((grado: any) => ({
    grado: grado.grado.replace(/°/g, "").substring(0, 15),
    promedio: grado.promedio,
    aprobados: grado.aprobados,
    desaprobados: grado.desaprobados,
  }));

  const datosDistribucion = [
    {
      name: "Excelente (16-20)",
      value: distribucion?.excelente || 0,
      color: COLORS.excelente,
    },
    {
      name: "Bueno (14-15)",
      value: distribucion?.bueno || 0,
      color: COLORS.bueno,
    },
    {
      name: "Regular (11-13)",
      value: distribucion?.regular || 0,
      color: COLORS.regular,
    },
    {
      name: "Deficiente (0-10)",
      value: distribucion?.deficiente || 0,
      color: COLORS.deficiente,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs de navegación */}
      <Card>
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setVistaActiva("resumen")}
            className={`px-6 py-3 text-sm font-medium ${
              vistaActiva === "resumen"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Resumen General
          </button>
          <button
            onClick={() => setVistaActiva("niveles")}
            className={`px-6 py-3 text-sm font-medium ${
              vistaActiva === "niveles"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Por Nivel Educativo
          </button>
          <button
            onClick={() => setVistaActiva("grados")}
            className={`px-6 py-3 text-sm font-medium ${
              vistaActiva === "grados"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Por Grado
          </button>
          <button
            onClick={() => setVistaActiva("distribucion")}
            className={`px-6 py-3 text-sm font-medium ${
              vistaActiva === "distribucion"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Distribución de Notas
          </button>
        </div>
      </Card>

      {/* Resumen General */}
      {vistaActiva === "resumen" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Promedio General</p>
                <p className="text-4xl font-bold text-blue-600">
                  {general.promedio}
                </p>
                <p className="text-xs text-gray-500 mt-2">Sobre 20 puntos</p>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Total Registradas</p>
                <p className="text-4xl font-bold text-purple-600">
                  {general.total.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-2">Calificaciones</p>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Aprobados</p>
                <p className="text-4xl font-bold text-green-600">
                  {general.aprobados.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {general.porcentaje_aprobados}% del total
                </p>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Desaprobados</p>
                <p className="text-4xl font-bold text-red-600">
                  {general.desaprobados.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {(100 - general.porcentaje_aprobados).toFixed(2)}% del total
                </p>
              </div>
            </Card>
          </div>

          <Card>
            <h3 className="text-lg font-semibold mb-4">
              Distribución de Rendimiento
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={datosDistribucion}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {datosDistribucion.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* Por Nivel Educativo */}
      {vistaActiva === "niveles" && datosNiveles.length > 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {datosNiveles.map((nivel) => (
              <Card key={nivel.nivel} className="border-t-4 border-blue-500">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  {nivel.nivel}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Promedio:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {nivel.promedio}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total:</span>
                    <span className="text-lg font-semibold">
                      {nivel.total.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-600">Aprobados:</span>
                    <span className="text-lg font-semibold text-green-600">
                      {nivel.aprobados.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-red-600">Desaprobados:</span>
                    <span className="text-lg font-semibold text-red-600">
                      {nivel.desaprobados.toLocaleString()}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card>
            <h3 className="text-lg font-semibold mb-4">
              Comparación de Promedios por Nivel
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={datosNiveles}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nivel" />
                <YAxis domain={[0, 20]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="promedio" fill="#3b82f6" name="Promedio" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold mb-4">
              Aprobados vs Desaprobados por Nivel
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={datosNiveles}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nivel" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="aprobados"
                  fill={COLORS.aprobados}
                  name="Aprobados"
                />
                <Bar
                  dataKey="desaprobados"
                  fill={COLORS.desaprobados}
                  name="Desaprobados"
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* Por Grado */}
      {vistaActiva === "grados" && datosGrados.length > 0 && (
        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-semibold mb-4">Promedios por Grado</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={datosGrados}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="grado"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis domain={[0, 20]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="promedio"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Promedio"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold mb-4">
              Aprobados vs Desaprobados por Grado
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={datosGrados}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="grado"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="aprobados"
                  fill={COLORS.aprobados}
                  name="Aprobados"
                />
                <Bar
                  dataKey="desaprobados"
                  fill={COLORS.desaprobados}
                  name="Desaprobados"
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Tabla detallada */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">Detalle por Grado</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Grado
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Promedio
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Total
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Aprobados
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Desaprobados
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(por_grado || []).map((grado: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {grado.grado}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-lg font-bold text-blue-600">
                          {grado.promedio}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {grado.total}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-semibold text-green-600">
                          {grado.aprobados}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-semibold text-red-600">
                          {grado.desaprobados}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Distribución */}
      {vistaActiva === "distribucion" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-t-4 border-green-500">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Excelente</p>
                <p className="text-4xl font-bold text-green-600">
                  {distribucion?.excelente || 0}
                </p>
                <p className="text-xs text-gray-500 mt-2">16 - 20 puntos</p>
              </div>
            </Card>

            <Card className="border-t-4 border-blue-500">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Bueno</p>
                <p className="text-4xl font-bold text-blue-600">
                  {distribucion?.bueno || 0}
                </p>
                <p className="text-xs text-gray-500 mt-2">14 - 15 puntos</p>
              </div>
            </Card>

            <Card className="border-t-4 border-yellow-500">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Regular</p>
                <p className="text-4xl font-bold text-yellow-600">
                  {distribucion?.regular || 0}
                </p>
                <p className="text-xs text-gray-500 mt-2">11 - 13 puntos</p>
              </div>
            </Card>

            <Card className="border-t-4 border-red-500">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Deficiente</p>
                <p className="text-4xl font-bold text-red-600">
                  {distribucion?.deficiente || 0}
                </p>
                <p className="text-xs text-gray-500 mt-2">0 - 10 puntos</p>
              </div>
            </Card>
          </div>

          <Card>
            <h3 className="text-lg font-semibold mb-4">
              Gráfico de Distribución
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={datosDistribucion}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" name="Cantidad">
                  {datosDistribucion.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}
    </div>
  );
}
