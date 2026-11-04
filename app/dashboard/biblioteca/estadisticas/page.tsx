"use client";

import { useState, useEffect } from "react";
import { Card, Button } from "@/src/components/ui";
import { apiClient } from "@/src/lib/api-client";
import { PermissionGuard } from "@/src/components/auth";
import { UserRole } from "@/src/types";
import { useAutoRefresh } from "@/src/hooks/useAutoRefresh";

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

  useAutoRefresh(() => loadStats(), { intervaloMs: 30000 });

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

  const porcentajeActivos =
    stats.total_prestamos > 0
      ? Math.round((stats.prestamos_activos / stats.total_prestamos) * 100)
      : 0;

  const totalColeccion = stats.libros_fisicos + stats.libros_digitales;
  const porcentajeFisicos =
    totalColeccion > 0
      ? Math.round((stats.libros_fisicos / totalColeccion) * 100)
      : 0;

  const maximoPrestado = Math.max(
    ...stats.libros_mas_prestados.map((libro) => libro.total_prestamos),
    1,
  );

  return (
    <PermissionGuard
      requiredRoles={[UserRole.ADMIN, UserRole.BIBLIOTECARIO]}
      fallback={
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            No tiene permisos para ver los reportes de biblioteca.
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Reportes de biblioteca
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Movimiento del catálogo y de los préstamos
            </p>
          </div>
          <Button variant="secondary" onClick={loadStats}>
            Actualizar
          </Button>
        </div>

        {/* Indicadores principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">Libros en catálogo</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.total_libros}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {stats.libros_fisicos} físicos · {stats.libros_digitales}{" "}
                  digitales
                </p>
              </div>
              <div className="p-2.5 bg-[#04ADBF]/10 rounded-lg shrink-0">
                <svg
                  className="w-6 h-6 text-[#04ADBF]"
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

          <Card>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">Préstamos activos</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.prestamos_activos}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {porcentajeActivos}% de {stats.total_prestamos} préstamos
                </p>
              </div>
              <div className="p-2.5 bg-green-100 rounded-lg shrink-0">
                <svg
                  className="w-6 h-6 text-green-700"
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

          <Card>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">Solicitudes pendientes</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.prestamos_pendientes}
                </p>
                <p className="text-xs text-gray-500 mt-2">Esperan aprobación</p>
              </div>
              <div className="p-2.5 bg-amber-100 rounded-lg shrink-0">
                <svg
                  className="w-6 h-6 text-amber-700"
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
            </div>
          </Card>

          <Card>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">Préstamos vencidos</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.prestamos_vencidos}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Requieren seguimiento
                </p>
              </div>
              <div className="p-2.5 bg-red-100 rounded-lg shrink-0">
                <svg
                  className="w-6 h-6 text-red-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                  />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* Libros más prestados */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                Libros más prestados
              </h2>
              <p className="text-sm text-gray-500">
                Los cinco títulos con mayor movimiento
              </p>
            </div>
          </div>

          {stats.libros_mas_prestados.length === 0 ? (
            <p className="text-center text-gray-500 py-6">
              Aún no hay préstamos registrados.
            </p>
          ) : (
            <ul className="space-y-4">
              {stats.libros_mas_prestados.map((libro, index) => (
                <li key={libro.id}>
                  <div className="flex items-center justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs font-bold flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800 truncate">
                          {libro.titulo}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {libro.autor}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-600 whitespace-nowrap">
                      <span className="font-semibold text-gray-800">
                        {libro.total_prestamos}
                      </span>{" "}
                      préstamos
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden ml-9">
                    <div
                      className="h-full bg-[#04ADBF]"
                      style={{
                        width: `${Math.round((libro.total_prestamos / maximoPrestado) * 100)}%`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Resumen de la colección */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card>
            <p className="text-sm text-gray-500">Lectores activos</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {stats.estudiantes_activos}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Estudiantes con préstamo vigente
            </p>
          </Card>

          <Card>
            <p className="text-sm text-gray-500">Categorías</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {stats.categorias_count}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Categorías registradas en el catálogo
            </p>
          </Card>

          <Card>
            <p className="text-sm text-gray-500 mb-3">
              Composición de la colección
            </p>
            <div className="flex h-3 rounded-full overflow-hidden bg-gray-100">
              <div
                className="bg-[#04ADBF]"
                style={{ width: `${porcentajeFisicos}%` }}
              />
              <div
                className="bg-amber-400"
                style={{ width: `${100 - porcentajeFisicos}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-2">
              <span>Físicos: {stats.libros_fisicos}</span>
              <span>Digitales: {stats.libros_digitales}</span>
            </div>
          </Card>
        </div>
      </div>
    </PermissionGuard>
  );
}
