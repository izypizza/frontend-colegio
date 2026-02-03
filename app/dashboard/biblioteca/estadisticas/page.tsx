"use client";

import { useState, useEffect } from "react";
import { Card } from "@/src/components/ui/Card";
import { apiClient } from "@/src/lib/api-client";

interface EstadisticasBiblioteca {
  total_libros: number;
  libros_fisicos: number;
  libros_digitales: number;
  total_prestamos: number;
  prestamos_activos: number;
  prestamos_pendientes: number;
  prestamos_vencidos: number;
  libros_mas_prestados: Array<{
    id: number;
    titulo: string;
    autor: string;
    total_prestamos: number;
  }>;
  estudiantes_activos: number;
  categorias_count: number;
}

export default function EstadisticasBibliotecaPage() {
  const [stats, setStats] = useState<EstadisticasBiblioteca | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response: any = await apiClient.get("/biblioteca/reportes");
      setStats(response);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Error al cargar estadísticas");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Estadísticas de Biblioteca
        </h1>
      </div>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Libros</p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.total_libros}
                </p>
              </div>
              <div className="text-4xl">[Libros]</div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              {stats.libros_fisicos} físicos • {stats.libros_digitales}{" "}
              digitales
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Préstamos Activos</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.prestamos_activos}
                </p>
              </div>
              <div className="text-4xl">[OK]</div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              De {stats.total_prestamos} totales
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {stats.prestamos_pendientes}
                </p>
              </div>
              <div className="text-4xl">⏳</div>
            </div>
            <div className="mt-4 text-sm text-gray-500">Esperan aprobación</div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vencidos</p>
                <p className="text-3xl font-bold text-red-600">
                  {stats.prestamos_vencidos}
                </p>
              </div>
              <div className="text-4xl">[!]</div>
            </div>
            <div className="mt-4 text-sm text-gray-500">Requieren atención</div>
          </div>
        </Card>
      </div>

      {/* Libros Más Prestados */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Libros Más Prestados
          </h2>
          <div className="space-y-4">
            {stats.libros_mas_prestados.map((libro, index) => (
              <div
                key={libro.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex items-center space-x-4">
                  <span className="text-2xl font-bold text-gray-400">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {libro.titulo}
                    </p>
                    <p className="text-sm text-gray-600">{libro.autor}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">
                    {libro.total_prestamos}
                  </p>
                  <p className="text-xs text-gray-500">préstamos</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Resumen Adicional */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Usuarios Activos
            </h3>
            <p className="text-4xl font-bold text-purple-600">
              {stats.estudiantes_activos}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Estudiantes con préstamos activos
            </p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Categorías
            </h3>
            <p className="text-4xl font-bold text-indigo-600">
              {stats.categorias_count}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Categorías de libros disponibles
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
