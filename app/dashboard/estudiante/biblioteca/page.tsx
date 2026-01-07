"use client";

import { Alert, Button, Card } from "@/src/components/ui";
import { apiClient } from "@/src/lib/api-client";
import { useEffect, useState } from "react";
import { useAuth } from "@/src/features/auth";

interface Libro {
  id: number;
  titulo: string;
  autor: string;
  isbn: string;
  editorial: string;
  anio_publicacion: number;
  cantidad_disponible: number;
  cantidad_total: number;
  categoria?: {
    id: number;
    nombre: string;
  };
}

interface Prestamo {
  id: number;
  libro_id: number;
  fecha_prestamo: string;
  fecha_devolucion: string;
  devuelto: boolean;
  libro: Libro;
}

export default function BibliotecaEstudiantePage() {
  const { user } = useAuth();
  const [libros, setLibros] = useState<Libro[]>([]);
  const [misPrestamos, setMisPrestamos] = useState<Prestamo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log("[Biblioteca] Cargando datos...");
      const startTime = performance.now();

      const [librosData, prestamosData] = await Promise.all([
        apiClient.get<Libro[]>("/libros-disponibles"),
        apiClient.get<Prestamo[]>("/mis-prestamos"),
      ]);

      const endTime = performance.now();
      console.log(
        `[Biblioteca] Datos cargados en ${(endTime - startTime).toFixed(0)}ms`
      );
      console.log("[Biblioteca] Libros:", librosData?.length || 0);
      console.log("[Biblioteca] Préstamos:", prestamosData?.length || 0);

      setLibros(librosData || []);
      setMisPrestamos(prestamosData || []);
    } catch (err) {
      console.error("[Biblioteca] Error:", err);
      setError("Error al cargar los datos de la biblioteca");
    } finally {
      setLoading(false);
    }
  };

  const handleSolicitarPrestamo = async (libroId: number) => {
    try {
      setError(null);

      // Verificar si ya tiene un préstamo activo de este libro
      const prestamoActivo = misPrestamos.find(
        (p) => p.libro_id === libroId && !p.devuelto
      );

      if (prestamoActivo) {
        setError("Ya tienes un préstamo activo de este libro");
        return;
      }

      // Solicitar préstamo (endpoint protegido)
      await apiClient.post("/prestamos", {
        libro_id: libroId,
      });

      setSuccess(
        "Préstamo solicitado correctamente. Acércate a la biblioteca para recoger el libro."
      );
      fetchData(); // Recargar datos
    } catch (err: any) {
      console.error("[Biblioteca] Error al solicitar préstamo:", err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Error al solicitar el préstamo. Contacta con la biblioteca.";
      setError(errorMessage);
    }
  };

  const librosFiltrados = libros.filter((libro) => {
    const matchesSearch =
      libro.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      libro.autor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      libro.isbn?.includes(searchTerm);
    const matchesCategoria =
      !selectedCategoria ||
      libro.categoria?.id.toString() === selectedCategoria;
    return matchesSearch && matchesCategoria;
  });

  // Extraer categorías únicas por ID
  const categorias = Array.from(
    new Map(
      libros
        .filter((l) => l.categoria)
        .map((l) => [l.categoria!.id, l.categoria!])
    ).values()
  );

  const prestamosActivos = misPrestamos.filter((p) => !p.devuelto);
  const prestamosHistoricos = misPrestamos.filter((p) => p.devuelto);

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
        <h1 className="text-3xl font-bold text-gray-900">Biblioteca Digital</h1>
        <p className="text-gray-600 mt-2">
          Consulta el catálogo y solicita préstamos de libros
        </p>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}
      {success && (
        <Alert
          type="success"
          message={success}
          onClose={() => setSuccess(null)}
        />
      )}

      {/* Mis Préstamos Activos */}
      {prestamosActivos.length > 0 && (
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Mis Préstamos Activos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prestamosActivos.map((prestamo) => (
              <div
                key={prestamo.id}
                className="border border-yellow-200 bg-yellow-50 rounded-lg p-4"
              >
                <h3 className="font-semibold text-gray-900">
                  {prestamo.libro.titulo}
                </h3>
                <p className="text-sm text-gray-600">
                  Autor: {prestamo.libro.autor}
                </p>
                <p className="text-sm text-gray-600">
                  Fecha de préstamo:{" "}
                  {new Date(prestamo.fecha_prestamo).toLocaleDateString(
                    "es-PE"
                  )}
                </p>
                <p className="text-sm font-semibold text-yellow-700">
                  Fecha de devolución:{" "}
                  {new Date(prestamo.fecha_devolucion).toLocaleDateString(
                    "es-PE"
                  )}
                </p>
                <div className="mt-2">
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                    Préstamo Activo
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Filtros */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Buscar por título, autor o ISBN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={selectedCategoria}
            onChange={(e) => setSelectedCategoria(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las categorías</option>
            {categorias.map((cat: any) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-2 text-sm text-gray-600">
          Mostrando {librosFiltrados.length} de {libros.length} libros
        </div>
      </Card>

      {/* Catálogo de Libros */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Catálogo de Libros
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {librosFiltrados.map((libro) => (
            <div
              key={libro.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-gray-900 text-lg mb-2">
                {libro.titulo}
              </h3>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Autor:</span> {libro.autor}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Editorial:</span>{" "}
                {libro.editorial}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">ISBN:</span> {libro.isbn}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Año:</span>{" "}
                {libro.anio_publicacion}
              </p>
              {libro.categoria && (
                <p className="text-sm text-gray-600 mb-3">
                  <span className="font-medium">Categoría:</span>{" "}
                  {libro.categoria.nombre}
                </p>
              )}
              <div className="flex justify-end mt-4">
                {libro.cantidad_disponible > 0 ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleSolicitarPrestamo(libro.id)}
                  >
                    Solicitar
                  </Button>
                ) : (
                  <button
                    disabled
                    className="px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed"
                  >
                    No disponible
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {librosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No se encontraron libros con los filtros seleccionados
            </p>
          </div>
        )}
      </Card>

      {/* Historial de Préstamos */}
      {prestamosHistoricos.length > 0 && (
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Historial de Préstamos
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Libro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Autor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fecha Préstamo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fecha Devolución
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {prestamosHistoricos.map((prestamo) => (
                  <tr key={prestamo.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {prestamo.libro.titulo}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {prestamo.libro.autor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(prestamo.fecha_prestamo).toLocaleDateString(
                        "es-PE"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(prestamo.fecha_devolucion).toLocaleDateString(
                        "es-PE"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                        Devuelto
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
