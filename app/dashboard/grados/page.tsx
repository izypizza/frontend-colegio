"use client";

import React, { useEffect, useState } from "react";
import { Button, Card, Input, Modal, Alert } from "@/src/components/ui";
import {
  gradoService,
  seccionService,
  estudianteService,
} from "@/src/lib/services";
import { Grado, Seccion, Estudiante } from "@/src/types/models";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { useErrorHandler } from "@/src/hooks/useErrorHandler";
import { useModalState } from "@/src/hooks/useModalState";

type ViewMode = "grados" | "secciones";

export default function GradosYSeccionesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const { error, success, setError, setSuccess, handleError } =
    useErrorHandler();
  const {
    isOpen: isGradoModalOpen,
    open: openGradoModal,
    close: closeGradoModal,
  } = useModalState();
  const {
    isOpen: isSeccionModalOpen,
    open: openSeccionModal,
    close: closeSeccionModal,
  } = useModalState();
  const {
    isOpen: isEstudiantesModalOpen,
    open: openEstudiantesModal,
    close: closeEstudiantesModal,
  } = useModalState();

  const [grados, setGrados] = useState<Grado[]>([]);
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingGrado, setEditingGrado] = useState<Grado | null>(null);
  const [editingSeccion, setEditingSeccion] = useState<Seccion | null>(null);
  const [selectedGrado, setSelectedGrado] = useState<Grado | null>(null);
  const [selectedSeccion, setSelectedSeccion] = useState<Seccion | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grados");
  const [searchTerm, setSearchTerm] = useState("");

  const [gradoFormData, setGradoFormData] = useState({
    nombre: "",
    nivel: "primaria",
  });

  const [seccionFormData, setSeccionFormData] = useState({
    nombre: "",
    grado_id: "",
    capacidad_maxima: "40",
    turno: "Mañana",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [gradosData, seccionesData, estudiantesData] = await Promise.all([
        gradoService.getAll({ all: true }),
        seccionService.getAll({ all: true }),
        estudianteService.getAll({ all: true }),
      ]);

      setGrados(Array.isArray(gradosData) ? gradosData : []);
      setSecciones(Array.isArray(seccionesData) ? seccionesData : []);
      setEstudiantes(Array.isArray(estudiantesData) ? estudiantesData : []);
    } catch (err) {
      handleError(err, "Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  // GRADOS
  const handleCreateGrado = () => {
    setEditingGrado(null);
    setGradoFormData({ nombre: "", nivel: "primaria" });
    openGradoModal();
  };

  const handleEditGrado = (grado: Grado) => {
    setEditingGrado(grado);
    setGradoFormData({
      nombre: grado.nombre,
      nivel: grado.nivel || "primaria",
    });
    openGradoModal();
  };

  const handleDeleteGrado = async (grado: Grado) => {
    const seccionesGrado = secciones.filter((s) => s.grado_id === grado.id);
    if (seccionesGrado.length > 0) {
      setError(
        `No se puede eliminar el grado "${grado.nombre}" porque tiene ${seccionesGrado.length} secciones asociadas`,
      );
      return;
    }

    if (!confirm(`¿Estás seguro de eliminar el grado "${grado.nombre}"?`))
      return;

    try {
      await gradoService.delete(grado.id);
      setSuccess("Grado eliminado correctamente");
      fetchData();
    } catch (err) {
      handleError(err, "Error al eliminar el grado");
    }
  };

  const handleSubmitGrado = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = {
        nombre: gradoFormData.nombre,
        nivel: gradoFormData.nivel,
      };

      if (editingGrado) {
        await gradoService.update(editingGrado.id, data);
        setSuccess("Grado actualizado correctamente");
      } else {
        await gradoService.create(data);
        setSuccess("Grado creado correctamente");
      }

      closeGradoModal();
      fetchData();
    } catch (err) {
      handleError(err, "Error al guardar el grado");
    }
  };

  // SECCIONES
  const handleCreateSeccion = (gradoId?: number) => {
    setEditingSeccion(null);
    setSeccionFormData({
      nombre: "",
      grado_id: gradoId?.toString() || "",
      capacidad_maxima: "40",
      turno: "Mañana",
    });
    openSeccionModal();
  };

  const handleEditSeccion = (seccion: Seccion) => {
    setEditingSeccion(seccion);
    setSeccionFormData({
      nombre: seccion.nombre,
      grado_id: seccion.grado_id?.toString() || "",
      capacidad_maxima: seccion.capacidad_maxima?.toString() || "40",
      turno: seccion.turno || "Mañana",
    });
    openSeccionModal();
  };

  const handleDeleteSeccion = async (seccion: Seccion) => {
    const estudiantesSeccion = estudiantes.filter(
      (e) => e.seccion_id === seccion.id,
    );
    if (estudiantesSeccion.length > 0) {
      setError(
        `No se puede eliminar la sección "${seccion.nombre}" porque tiene ${estudiantesSeccion.length} estudiantes matriculados`,
      );
      return;
    }

    if (!confirm(`¿Estás seguro de eliminar la sección "${seccion.nombre}"?`))
      return;

    try {
      await seccionService.delete(seccion.id);
      setSuccess("Sección eliminada correctamente");
      fetchData();
    } catch (err) {
      handleError(err, "Error al eliminar la sección");
    }
  };

  const handleSubmitSeccion = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = {
        nombre: seccionFormData.nombre,
        grado_id: parseInt(seccionFormData.grado_id),
        capacidad_maxima: parseInt(seccionFormData.capacidad_maxima),
        turno: seccionFormData.turno,
      };

      if (editingSeccion) {
        await seccionService.update(editingSeccion.id, data);
        setSuccess("Sección actualizada correctamente");
      } else {
        await seccionService.create(data);
        setSuccess("Sección creada correctamente");
      }

      closeSeccionModal();
      fetchData();
    } catch (err) {
      handleError(err, "Error al guardar la sección");
    }
  };

  const verSecciones = (grado: Grado) => {
    setSelectedGrado(grado);
    setViewMode("secciones");
  };

  const verEstudiantes = (seccion: Seccion) => {
    setSelectedSeccion(seccion);
    openEstudiantesModal();
  };

  const seccionesDelGrado = selectedGrado
    ? secciones.filter((s) => s.grado_id === selectedGrado.id)
    : [];

  const estudiantesDeSeccion = selectedSeccion
    ? estudiantes.filter((e) => e.seccion_id === selectedSeccion.id)
    : [];

  // Filtrado
  const gradosFiltrados = grados.filter((grado) =>
    grado.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const seccionesFiltradas = secciones.filter((seccion) => {
    const matchesSearch = seccion.nombre
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesGrado =
      !selectedGrado || seccion.grado_id === selectedGrado.id;
    return matchesSearch && matchesGrado;
  });

  // Estadísticas
  const stats = {
    totalGrados: grados.length,
    totalSecciones: secciones.length,
    totalEstudiantes: estudiantes.length,
    primaria: grados.filter((g) => g.nivel?.toLowerCase() === "primaria")
      .length,
    secundaria: grados.filter((g) => g.nivel?.toLowerCase() === "secundaria")
      .length,
    capacidadTotal: secciones.reduce(
      (sum, s) => sum + (s.capacidad_maxima || 0),
      0,
    ),
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        Cargando...
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#04ADBF] to-[#038a9a] rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {viewMode === "grados"
                ? "Grados y Secciones"
                : `Secciones de ${selectedGrado?.nombre}`}
            </h1>
            <p className="text-[#FEFCD6]">
              {viewMode === "grados"
                ? "Gestiona la estructura académica de tu institución"
                : "Administra las secciones del grado seleccionado"}
            </p>
          </div>
          {viewMode === "secciones" && (
            <Button
              variant="secondary"
              onClick={() => {
                setViewMode("grados");
                setSelectedGrado(null);
              }}
            >
              Volver a Grados
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-sm text-[#FEFCD6]">Grados</div>
            <div className="text-3xl font-bold">{stats.totalGrados}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-sm text-[#FEFCD6]">Primaria</div>
            <div className="text-3xl font-bold">{stats.primaria}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-sm text-[#FEFCD6]">Secundaria</div>
            <div className="text-3xl font-bold">{stats.secundaria}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-sm text-[#FEFCD6]">Secciones</div>
            <div className="text-3xl font-bold">{stats.totalSecciones}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-sm text-[#FEFCD6]">Estudiantes</div>
            <div className="text-3xl font-bold">{stats.totalEstudiantes}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-sm text-[#FEFCD6]">Capacidad</div>
            <div className="text-3xl font-bold">{stats.capacidadTotal}</div>
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

      {/* Vista de Grados */}
      {viewMode === "grados" && (
        <>
          <div className="flex gap-4 items-center justify-between">
            <Input
              placeholder="Buscar grado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
            {isAdmin && (
              <Button variant="primary" onClick={handleCreateGrado}>
                + Nuevo Grado
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gradosFiltrados.map((grado) => {
              const seccionesCount = secciones.filter(
                (s) => s.grado_id === grado.id,
              ).length;
              const estudiantesCount = estudiantes.filter((e) => {
                const seccion = secciones.find((s) => s.id === e.seccion_id);
                return seccion?.grado_id === grado.id;
              }).length;
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
                      <div className="w-16 h-16 bg-gradient-to-br from-[#04ADBF] to-[#038a9a] rounded-full flex items-center justify-center">
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

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#F2F0CE] rounded-lg p-4">
                        <div className="text-sm text-gray-600">Secciones</div>
                        <div className="text-2xl font-bold text-gray-900">
                          {seccionesCount}
                        </div>
                      </div>
                      <div className="bg-[#FEFCD6] rounded-lg p-4">
                        <div className="text-sm text-gray-600">Estudiantes</div>
                        <div className="text-2xl font-bold text-gray-900">
                          {estudiantesCount}
                        </div>
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
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                        Ver Secciones
                      </Button>
                      {isAdmin && (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => handleEditGrado(grado)}
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
                            onClick={() => handleDeleteGrado(grado)}
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
        </>
      )}

      {/* Vista de Secciones */}
      {viewMode === "secciones" && selectedGrado && (
        <>
          <div className="flex gap-4 items-center justify-between">
            <Input
              placeholder="Buscar sección..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
            {isAdmin && (
              <Button
                variant="primary"
                onClick={() => handleCreateSeccion(selectedGrado.id)}
              >
                + Nueva Sección
              </Button>
            )}
          </div>

          {seccionesDelGrado.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-10 h-10 text-gray-400"
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
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No hay secciones registradas
                </h3>
                <p className="text-gray-500 mb-4">
                  Comienza creando la primera sección para{" "}
                  {selectedGrado.nombre}
                </p>
                {isAdmin && (
                  <Button
                    variant="primary"
                    onClick={() => handleCreateSeccion(selectedGrado.id)}
                  >
                    + Crear Primera Sección
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {seccionesDelGrado.map((seccion) => {
                const estudiantesCount = estudiantes.filter(
                  (e) => e.seccion_id === seccion.id,
                ).length;
                const capacidad = seccion.capacidad_maxima || 0;
                const porcentajeOcupacion =
                  capacidad > 0 ? (estudiantesCount / capacidad) * 100 : 0;

                return (
                  <Card
                    key={seccion.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">
                            Sección {seccion.nombre}
                          </h3>
                          {seccion.turno && (
                            <span
                              className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                                seccion.turno === "Mañana"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {seccion.turno}
                            </span>
                          )}
                        </div>
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center">
                          <span className="text-2xl font-bold text-white">
                            {seccion.nombre}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Estudiantes</span>
                          <span className="font-semibold">
                            {estudiantesCount} / {capacidad}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              porcentajeOcupacion >= 90
                                ? "bg-red-500"
                                : porcentajeOcupacion >= 75
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                            }`}
                            style={{
                              width: `${Math.min(porcentajeOcupacion, 100)}%`,
                            }}
                          />
                        </div>
                        <div className="text-xs text-gray-500">
                          {Math.round(porcentajeOcupacion)}% de ocupación
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4 border-t">
                        <Button
                          variant="outline"
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
                          Ver Estudiantes
                        </Button>
                        {isAdmin && (
                          <>
                            <Button
                              variant="outline"
                              onClick={() => handleEditSeccion(seccion)}
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
                              onClick={() => handleDeleteSeccion(seccion)}
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
          )}
        </>
      )}

      {/* Modal Grado */}
      <Modal
        isOpen={isGradoModalOpen}
        onClose={closeGradoModal}
        title={editingGrado ? "Editar Grado" : "Nuevo Grado"}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={closeGradoModal}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSubmitGrado}>
              Guardar
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmitGrado} className="space-y-4">
          <Input
            label="Nombre del Grado"
            value={gradoFormData.nombre}
            onChange={(e) =>
              setGradoFormData({ ...gradoFormData, nombre: e.target.value })
            }
            required
            placeholder="Ej: 1° Primaria, 5° Secundaria"
          />

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nivel
            </label>
            <select
              value={gradoFormData.nivel}
              onChange={(e) =>
                setGradoFormData({ ...gradoFormData, nivel: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#04ADBF]"
            >
              <option value="primaria">Primaria</option>
              <option value="secundaria">Secundaria</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Modal Sección */}
      <Modal
        isOpen={isSeccionModalOpen}
        onClose={closeSeccionModal}
        title={editingSeccion ? "Editar Sección" : "Nueva Sección"}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={closeSeccionModal}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSubmitSeccion}>
              Guardar
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmitSeccion} className="space-y-4">
          <Input
            label="Nombre de la Sección"
            value={seccionFormData.nombre}
            onChange={(e) =>
              setSeccionFormData({ ...seccionFormData, nombre: e.target.value })
            }
            required
            placeholder="Ej: A, B, C"
          />

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Grado
            </label>
            <select
              value={seccionFormData.grado_id}
              onChange={(e) =>
                setSeccionFormData({
                  ...seccionFormData,
                  grado_id: e.target.value,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#04ADBF]"
              required
            >
              <option value="">Seleccione un grado</option>
              {grados.map((grado) => (
                <option key={grado.id} value={grado.id}>
                  {grado.nombre}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Capacidad Máxima"
            type="number"
            value={seccionFormData.capacidad_maxima}
            onChange={(e) =>
              setSeccionFormData({
                ...seccionFormData,
                capacidad_maxima: e.target.value,
              })
            }
            required
            min="1"
          />

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Turno
            </label>
            <select
              value={seccionFormData.turno}
              onChange={(e) =>
                setSeccionFormData({
                  ...seccionFormData,
                  turno: e.target.value,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#04ADBF]"
            >
              <option value="Mañana">Mañana</option>
              <option value="Tarde">Tarde</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Modal Estudiantes */}
      <Modal
        isOpen={isEstudiantesModalOpen}
        onClose={closeEstudiantesModal}
        title={`Estudiantes de ${selectedSeccion?.nombre}`}
        size="xl"
      >
        <div className="space-y-4">
          {estudiantesDeSeccion.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay estudiantes matriculados en esta sección
            </div>
          ) : (
            <div className="space-y-2">
              {estudiantesDeSeccion.map((estudiante, index) => (
                <div
                  key={estudiante.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#04ADBF] rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        {estudiante.nombres} {estudiante.apellido_paterno}{" "}
                        {estudiante.apellido_materno}
                      </div>
                      {estudiante.dni && (
                        <div className="text-sm text-gray-500">
                          DNI: {estudiante.dni}
                        </div>
                      )}
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
