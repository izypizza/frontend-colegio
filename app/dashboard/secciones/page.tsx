"use client";

import React, { useEffect, useState } from "react";
import { Button, Card, Input, Modal, Alert } from "@/src/components/ui";
import {
  seccionService,
  gradoService,
  estudianteService,
} from "@/src/lib/services";
import { Seccion, Grado, Estudiante } from "@/src/types/models";
import { useAuth } from "@/src/features/auth/hooks/useAuth";

type ViewMode = "grid" | "list";

export default function SeccionesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "auxiliar";

  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [grados, setGrados] = useState<Grado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Seccion | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrado, setSelectedGrado] = useState<string>("");
  const [selectedSeccion, setSelectedSeccion] = useState<Seccion | null>(null);
  const [estudiantesSeccion, setEstudiantesSeccion] = useState<Estudiante[]>(
    []
  );
  const [showEstudiantes, setShowEstudiantes] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    grado_id: "",
    capacidad: "",
    turno: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [seccionesData, gradosData] = await Promise.all([
        seccionService.getAll(),
        gradoService.getAll(),
      ]);
      setSecciones(seccionesData);
      setGrados(gradosData);
    } catch {
      setError("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({ nombre: "", grado_id: "", capacidad: "", turno: "Mañana" });
    setIsModalOpen(true);
  };

  const handleEdit = (item: Seccion) => {
    setEditingItem(item);
    setFormData({
      nombre: item.nombre,
      grado_id: item.grado_id?.toString() || "",
      capacidad: item.capacidad?.toString() || "",
      turno: item.turno || "Mañana",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (item: Seccion) => {
    if (!confirm("¿Estás seguro de eliminar esta sección?")) return;

    try {
      await seccionService.delete(item.id);
      setSuccess("Sección eliminada correctamente");
      fetchData();
    } catch {
      setError("Error al eliminar la sección");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const data = {
        nombre: formData.nombre,
        grado_id: parseInt(formData.grado_id),
        capacidad: formData.capacidad
          ? parseInt(formData.capacidad)
          : undefined,
        turno: formData.turno,
      };

      if (editingItem) {
        await seccionService.update(editingItem.id, data);
        setSuccess("Sección actualizada correctamente");
      } else {
        await seccionService.create(data);
        setSuccess("Sección creada correctamente");
      }

      setIsModalOpen(false);
      fetchData();
    } catch {
      setError("Error al guardar la sección");
    }
  };

  const verEstudiantes = async (seccion: Seccion) => {
    try {
      setSelectedSeccion(seccion);
      setShowEstudiantes(true);
      const estudiantes = await estudianteService.getAll();
      const estudiantesFiltrados = estudiantes.filter(
        (e: Estudiante) => e.seccion_id === seccion.id
      );
      setEstudiantesSeccion(estudiantesFiltrados);
    } catch {
      setError("Error al cargar estudiantes");
    }
  };

  // Filtrado de secciones
  const seccionesFiltradas = secciones.filter((seccion) => {
    const matchesSearch = seccion.nombre
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesGrado =
      !selectedGrado || seccion.grado_id?.toString() === selectedGrado;
    return matchesSearch && matchesGrado;
  });

  // Estadísticas
  const stats = {
    total: secciones.length,
    porGrado: grados.map((grado) => ({
      grado: grado.nombre,
      cantidad: secciones.filter((s) => s.grado_id === grado.id).length,
    })),
    capacidadTotal: secciones.reduce((sum, s) => sum + (s.capacidad || 0), 0),
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        Cargando...
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Gestión de Secciones</h1>
        <p className="text-blue-100">
          Administra las secciones escolares por grado
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-sm text-blue-100">Total Secciones</div>
            <div className="text-3xl font-bold">{stats.total}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-sm text-blue-100">Capacidad Total</div>
            <div className="text-3xl font-bold">{stats.capacidadTotal}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-sm text-blue-100">Grados Activos</div>
            <div className="text-3xl font-bold">{grados.length}</div>
          </div>
        </div>
      </div>

      {/* Alertas */}
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

      {/* Controles */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1 w-full md:w-auto">
            <Input
              placeholder="Buscar sección..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <select
              value={selectedGrado}
              onChange={(e) => setSelectedGrado(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los grados</option>
              {grados.map((grado) => (
                <option key={grado.id} value={grado.id}>
                  {grado.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <Button
              variant={viewMode === "grid" ? "primary" : "secondary"}
              onClick={() => setViewMode("grid")}
            >
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
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </Button>
            <Button
              variant={viewMode === "list" ? "primary" : "secondary"}
              onClick={() => setViewMode("list")}
            >
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </Button>
            {isAdmin && (
              <Button variant="primary" onClick={handleCreate}>
                + Nueva Sección
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Vista Grid */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {seccionesFiltradas.map((seccion) => (
            <Card
              key={seccion.id}
              className="hover:shadow-lg transition-shadow"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">
                      {seccion.nombre}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {seccion.grado?.nombre || "Sin grado"}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      seccion.turno === "Mañana"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {seccion.turno || "Mañana"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-600">Capacidad</div>
                    <div className="text-lg font-bold text-gray-900">
                      {seccion.capacidad || "N/A"}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-600">ID</div>
                    <div className="text-lg font-bold text-gray-900">
                      {seccion.id}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="secondary"
                    onClick={() => verEstudiantes(seccion)}
                    className="flex-1"
                  >
                    <svg
                      className="w-4 h-4 mr-1"
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
                    Estudiantes
                  </Button>
                  {isAdmin && (
                    <>
                      <Button
                        variant="secondary"
                        onClick={() => handleEdit(seccion)}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleDelete(seccion)}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Vista Lista */}
      {viewMode === "list" && (
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sección
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Turno
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capacidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {seccionesFiltradas.map((seccion) => (
                  <tr key={seccion.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-gray-900">
                        {seccion.nombre}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {seccion.grado?.nombre || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          seccion.turno === "Mañana"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {seccion.turno || "Mañana"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {seccion.capacidad || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => verEstudiantes(seccion)}
                        >
                          Ver
                        </Button>
                        {isAdmin && (
                          <>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleEdit(seccion)}
                            >
                              Editar
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(seccion)}
                            >
                              Eliminar
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal Formulario */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setError(null);
        }}
        title={editingItem ? "Editar Sección" : "Nueva Sección"}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              Guardar
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert
              type="error"
              message={error}
              onClose={() => setError(null)}
            />
          )}
          <Input
            label="Nombre"
            value={formData.nombre}
            onChange={(e) =>
              setFormData({ ...formData, nombre: e.target.value })
            }
            required
            placeholder="Ej: Sección A"
          />

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Grado
            </label>
            <select
              value={formData.grado_id}
              onChange={(e) =>
                setFormData({ ...formData, grado_id: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Seleccionar grado</option>
              {grados.map((grado) => (
                <option key={grado.id} value={grado.id}>
                  {grado.nombre}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Capacidad"
            type="number"
            value={formData.capacidad}
            onChange={(e) =>
              setFormData({ ...formData, capacidad: e.target.value })
            }
            placeholder="Número máximo de estudiantes"
          />

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Turno
            </label>
            <select
              value={formData.turno}
              onChange={(e) =>
                setFormData({ ...formData, turno: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Mañana">Mañana</option>
              <option value="Tarde">Tarde</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Modal Estudiantes */}
      <Modal
        isOpen={showEstudiantes}
        onClose={() => setShowEstudiantes(false)}
        title={`Estudiantes de ${selectedSeccion?.nombre}`}
        size="xl"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900">
                  {selectedSeccion?.nombre}
                </h3>
                <p className="text-sm text-blue-700">
                  {selectedSeccion?.grado?.nombre}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-900">
                  {estudiantesSeccion.length}
                </div>
                <div className="text-xs text-blue-700">Estudiantes</div>
              </div>
            </div>
          </div>

          {estudiantesSeccion.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay estudiantes en esta sección
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {estudiantesSeccion.map((estudiante) => (
                <div
                  key={estudiante.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        {estudiante.nombre}
                      </div>
                      <div className="text-sm text-gray-600">
                        ID: {estudiante.id}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
