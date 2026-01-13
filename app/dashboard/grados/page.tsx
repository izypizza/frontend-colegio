"use client";

import React, { useEffect, useState } from "react";
import { Button, Card, Input, Modal, Alert } from "@/src/components/ui";
import { gradoService, seccionService } from "@/src/lib/services";
import { Grado, Seccion } from "@/src/types/models";
import { useAuth } from "@/src/features/auth/hooks/useAuth";

export default function GradosPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [grados, setGrados] = useState<Grado[]>([]);
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Grado | null>(null);
  const [selectedGrado, setSelectedGrado] = useState<Grado | null>(null);
  const [showSecciones, setShowSecciones] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    nivel: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [gradosData, seccionesData] = await Promise.all([
        gradoService.getAll({ all: true }),
        seccionService.getAll({ all: true }),
      ]);

      // Los servicios ya manejan la conversión a array
      setGrados(Array.isArray(gradosData) ? gradosData : []);
      setSecciones(Array.isArray(seccionesData) ? seccionesData : []);

      console.log("Grados cargados:", gradosData);
      console.log("Secciones cargadas:", seccionesData);
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({ nombre: "", nivel: "primaria" });
    setIsModalOpen(true);
  };

  const handleEdit = (item: Grado) => {
    setEditingItem(item);
    setFormData({
      nombre: item.nombre,
      nivel: item.nivel || "primaria",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (item: Grado) => {
    const seccionesGrado = secciones.filter((s) => s.grado_id === item.id);
    if (seccionesGrado.length > 0) {
      setError(
        `No se puede eliminar el grado "${item.nombre}" porque tiene ${seccionesGrado.length} secciones asociadas`
      );
      return;
    }

    if (!confirm("¿Estás seguro de eliminar este grado?")) return;

    try {
      await gradoService.delete(item.id);
      setSuccess("Grado eliminado correctamente");
      fetchData();
    } catch {
      setError("Error al eliminar el grado");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const data = {
        nombre: formData.nombre,
        nivel: formData.nivel,
      };

      if (editingItem) {
        await gradoService.update(editingItem.id, data);
        setSuccess("Grado actualizado correctamente");
      } else {
        await gradoService.create(data);
        setSuccess("Grado creado correctamente");
      }

      setIsModalOpen(false);
      fetchData();
    } catch {
      setError("Error al guardar el grado");
    }
  };

  const verSecciones = (grado: Grado) => {
    setSelectedGrado(grado);
    setShowSecciones(true);
  };

  const seccionesDelGrado = selectedGrado
    ? secciones.filter((s) => s.grado_id === selectedGrado.id)
    : [];

  // Estadísticas
  const stats = {
    totalGrados: grados.length,
    totalSecciones: secciones.length,
    primaria: grados.filter((g) => g.nivel?.toLowerCase() === "primaria")
      .length,
    secundaria: grados.filter((g) => g.nivel?.toLowerCase() === "secundaria")
      .length,
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        Cargando...
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header Atractivo */}
      <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Gestión de Grados</h1>
        <p className="text-green-100">
          Organiza los niveles educativos de tu institución
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-sm text-green-100">Total Grados</div>
            <div className="text-3xl font-bold">{stats.totalGrados}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-sm text-green-100">Primaria</div>
            <div className="text-3xl font-bold">{stats.primaria}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-sm text-green-100">Secundaria</div>
            <div className="text-3xl font-bold">{stats.secundaria}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-sm text-green-100">Secciones</div>
            <div className="text-3xl font-bold">{stats.totalSecciones}</div>
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
      {isAdmin && (
        <div className="flex justify-end">
          <Button variant="primary" onClick={handleCreate}>
            + Nuevo Grado
          </Button>
        </div>
      )}

      {/* Cards de Grados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {grados.map((grado) => {
          const seccionesCount = secciones.filter(
            (s) => s.grado_id === grado.id
          ).length;
          const nivel = grado.nivel || "Sin especificar";

          return (
            <Card
              key={grado.id}
              className="hover:shadow-xl transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {grado.nombre}
                    </h3>
                    <span
                      className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                        nivel?.toLowerCase() === "primaria"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {nivel?.charAt(0).toUpperCase() +
                        nivel?.slice(1).toLowerCase()}
                    </span>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-white"
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

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-600">Secciones</div>
                      <div className="text-3xl font-bold text-gray-900">
                        {seccionesCount}
                      </div>
                    </div>
                    <svg
                      className="w-12 h-12 text-gray-300"
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

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => verSecciones(grado)}
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
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    Ver Secciones
                  </Button>
                  {isAdmin && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => handleEdit(grado)}
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
                        onClick={() => handleDelete(grado)}
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
          );
        })}
      </div>

      {/* Modal Formulario */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setError(null);
        }}
        title={editingItem ? "Editar Grado" : "Nuevo Grado"}
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
            label="Nombre del Grado"
            value={formData.nombre}
            onChange={(e) =>
              setFormData({ ...formData, nombre: e.target.value })
            }
            required
            placeholder="Ej: 1° Primaria, 5° Secundaria"
          />

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nivel
            </label>
            <select
              value={formData.nivel}
              onChange={(e) =>
                setFormData({ ...formData, nivel: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="primaria">Primaria</option>
              <option value="secundaria">Secundaria</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Modal Secciones */}
      <Modal
        isOpen={showSecciones}
        onClose={() => setShowSecciones(false)}
        title={`Secciones de ${selectedGrado?.nombre}`}
        size="xl"
      >
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-green-900">
                  {selectedGrado?.nombre}
                </h3>
                <p className="text-sm text-green-700">{selectedGrado?.nivel}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-900">
                  {seccionesDelGrado.length}
                </div>
                <div className="text-xs text-green-700">Secciones</div>
              </div>
            </div>
          </div>

          {seccionesDelGrado.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay secciones para este grado
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {seccionesDelGrado.map((seccion) => (
                <div
                  key={seccion.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 text-lg">
                        {seccion.nombre}
                      </div>
                      {seccion.turno && (
                        <span
                          className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-semibold ${
                            seccion.turno === "Mañana"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {seccion.turno}
                        </span>
                      )}
                    </div>
                    {seccion.capacidad && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-700">
                          {seccion.capacidad}
                        </div>
                        <div className="text-xs text-gray-500">Capacidad</div>
                      </div>
                    )}
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
