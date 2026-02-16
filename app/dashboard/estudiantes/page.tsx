"use client";

import {
  Alert,
  Button,
  Card,
  Input,
  Modal,
  Table,
  Pagination,
} from "@/src/components/ui";
import { estudianteService, seccionService } from "@/src/lib/services";
import { Estudiante, Seccion } from "@/src/types/models";
import { useEffect, useState } from "react";
import { useErrorHandler } from "@/src/hooks/useErrorHandler";
import { useModalState } from "@/src/hooks/useModalState";
import { usePagination } from "@/src/hooks/usePagination";
import { useFilteredData } from "@/src/hooks/useFilteredData";

export default function EstudiantesPage() {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<Estudiante | null>(null);
  const [formData, setFormData] = useState({
    nombres: "",
    apellido_paterno: "",
    apellido_materno: "",
    fecha_nacimiento: "",
    seccion_id: "",
    dni: "",
    telefono: "",
    direccion: "",
  });
  const [filterSeccion, setFilterSeccion] = useState("");

  // Hooks personalizados
  const { error, success, handleError, handleSuccess, setError, setSuccess } =
    useErrorHandler();
  const { isOpen, editingItem, openCreate, openEdit, close } =
    useModalState<Estudiante>();
  const pagination = usePagination();
  const {
    filteredData: estudiantesFiltrados,
    searchTerm,
    setSearchTerm,
  } = useFilteredData(estudiantes, (estudiante, term) => {
    const nombreCompleto =
      `${estudiante.nombres} ${estudiante.apellido_paterno} ${estudiante.apellido_materno}`.toLowerCase();
    const dni = estudiante.dni?.toLowerCase() || "";
    return (
      nombreCompleto.includes(term.toLowerCase()) ||
      dni.includes(term.toLowerCase())
    );
  });

  useEffect(() => {
    fetchData();
  }, [pagination.currentPage, pagination.perPage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const startTime = performance.now();

      const [estudiantesData, seccionesData] = await Promise.all([
        estudianteService.getAll({
          page: pagination.currentPage,
          per_page: pagination.perPage,
        }),
        seccionService.getAll({ all: true }),
      ]);

      // Manejar respuesta paginada
      if (
        estudiantesData &&
        typeof estudiantesData === "object" &&
        "data" in estudiantesData &&
        "current_page" in estudiantesData
      ) {
        setEstudiantes(estudiantesData.data);
        pagination.updatePagination({
          currentPage: estudiantesData.current_page,
          lastPage: estudiantesData.last_page || 1,
          total: estudiantesData.total || 0,
          perPage: estudiantesData.per_page,
        });
      } else {
        const estudiantesArray = Array.isArray(estudiantesData)
          ? estudiantesData
          : estudiantesData?.data || [];
        setEstudiantes(estudiantesArray);
      }

      const seccionesArray = Array.isArray(seccionesData)
        ? seccionesData
        : seccionesData?.data || [];
      setSecciones(seccionesArray);
    } catch (err) {
      handleError(err, "Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      nombres: "",
      apellido_paterno: "",
      apellido_materno: "",
      fecha_nacimiento: "",
      seccion_id: "",
      dni: "",
      telefono: "",
      direccion: "",
    });
    openCreate();
  };

  const handleView = (item: Estudiante) => {
    setViewingItem(item);
    setIsViewModalOpen(true);
  };

  const handleEdit = (item: Estudiante) => {
    setFormData({
      nombres: item.nombres,
      apellido_paterno: item.apellido_paterno,
      apellido_materno: item.apellido_materno,
      fecha_nacimiento: item.fecha_nacimiento.split("T")[0],
      seccion_id: item.seccion_id.toString(),
      dni: item.dni || "",
      telefono: item.telefono || "",
      direccion: item.direccion || "",
    });
    openEdit(item);
  };

  const handleDelete = async (item: Estudiante) => {
    if (!confirm("¿Estás seguro de eliminar este estudiante?")) return;

    try {
      await estudianteService.delete(item.id);
      handleSuccess("Estudiante eliminado correctamente");
      fetchData();
    } catch (err) {
      handleError(err, "Error al eliminar el estudiante");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = {
        nombres: formData.nombres.trim(),
        apellido_paterno: formData.apellido_paterno.trim(),
        apellido_materno: formData.apellido_materno.trim(),
        fecha_nacimiento: formData.fecha_nacimiento,
        seccion_id: parseInt(formData.seccion_id),
        dni: formData.dni.trim(),
        telefono: formData.telefono.trim(),
        direccion: formData.direccion.trim(),
      };

      if (editingItem) {
        const response = await estudianteService.update(editingItem.id, data);
        handleSuccess(
          response.message || "Estudiante actualizado correctamente",
        );
      } else {
        const response = await estudianteService.create(data);
        handleSuccess(response.message || "Estudiante creado correctamente");
      }

      close();
      fetchData();
    } catch (err) {
      handleError(err, "Error al guardar el estudiante");
    }
  };

  // Filtrado adicional por sección
  const estudiantesFiltradosCompletos = estudiantesFiltrados.filter(
    (estudiante) => {
      const matchesSeccion =
        !filterSeccion || estudiante.seccion_id?.toString() === filterSeccion;
      return matchesSeccion;
    },
  );

  const columns = [
    { key: "id", label: "ID" },
    {
      key: "nombre_completo",
      label: "Nombre Completo",
      render: (value: unknown, item: Estudiante) =>
        item.nombre_completo ||
        `${item.apellido_paterno} ${item.apellido_materno}, ${item.nombres}`,
    },
    {
      key: "fecha_nacimiento",
      label: "Fecha de Nacimiento",
      render: (value: unknown) =>
        new Date(value as string).toLocaleDateString(),
    },
    {
      key: "seccion",
      label: "Sección",
      render: (value: unknown) => (value as Seccion)?.nombre || "N/A",
    },
  ];

  const hasFilters = searchTerm.trim() !== "" || filterSeccion !== "";
  const effectiveTotal = hasFilters
    ? estudiantesFiltradosCompletos.length
    : pagination.totalItems || estudiantes.length;
  const effectiveLastPage = hasFilters ? 1 : pagination.totalPages;
  const effectiveCurrentPage = hasFilters ? 1 : pagination.currentPage;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Estudiantes</h1>
          <p className="text-gray-600 mt-2">
            Gestión de estudiantes del colegio
          </p>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          + Nuevo Estudiante
        </Button>
      </div>

      {success && (
        <Alert
          type="success"
          message={success}
          onClose={() => setSuccess(null)}
        />
      )}

      {/* Filtros de búsqueda */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <Input
            placeholder="Buscar por nombre o DNI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <select
            value={filterSeccion}
            onChange={(e) => setFilterSeccion(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las secciones</option>
            {secciones?.map((seccion) => (
              <option key={seccion.id} value={seccion.id}>
                {seccion.nombre} - {seccion.grado?.nombre}
              </option>
            ))}
          </select>
        </div>
      </Card>

      <Card>
        <Table
          columns={columns}
          data={estudiantesFiltradosCompletos}
          loading={loading}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Paginación */}
        {effectiveTotal > 0 && (
          <Pagination
            currentPage={effectiveCurrentPage}
            lastPage={effectiveLastPage}
            total={effectiveTotal}
            perPage={pagination.perPage}
            onPageChange={(page) => {
              pagination.goToPage(page);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onPerPageChange={(newPerPage) => {
              pagination.updatePagination({ perPage: newPerPage });
            }}
          />
        )}
      </Card>

      <Modal
        isOpen={isOpen}
        onClose={close}
        title={editingItem ? "Editar Estudiante" : "Nuevo Estudiante"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert
              type="error"
              message={error}
              onClose={() => setError(null)}
            />
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Nombres"
              value={formData.nombres}
              onChange={(e) =>
                setFormData({ ...formData, nombres: e.target.value })
              }
              required
              placeholder="Juan Carlos"
            />
            <Input
              label="Apellido Paterno"
              value={formData.apellido_paterno}
              onChange={(e) =>
                setFormData({ ...formData, apellido_paterno: e.target.value })
              }
              required
              placeholder="García"
            />
            <Input
              label="Apellido Materno"
              value={formData.apellido_materno}
              onChange={(e) =>
                setFormData({ ...formData, apellido_materno: e.target.value })
              }
              required
              placeholder="López"
            />
          </div>
          <Input
            label="DNI"
            value={formData.dni}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              if (value.length <= 8) {
                setFormData({ ...formData, dni: value });
              }
            }}
            placeholder="12345678"
            required
            maxLength={8}
            pattern="[0-9]{8}"
          />
          <Input
            label="Fecha de Nacimiento"
            type="date"
            value={formData.fecha_nacimiento}
            onChange={(e) =>
              setFormData({ ...formData, fecha_nacimiento: e.target.value })
            }
            required
            max={new Date().toISOString().split("T")[0]}
          />
          <Input
            label="Teléfono (9 dígitos)"
            value={formData.telefono}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              if (value.length <= 9) {
                setFormData({ ...formData, telefono: value });
              }
            }}
            placeholder="987654321"
            maxLength={9}
            pattern="9[0-9]{8}"
          />
          <Input
            label="Dirección"
            value={formData.direccion}
            onChange={(e) =>
              setFormData({ ...formData, direccion: e.target.value })
            }
            placeholder="Av. Principal 123"
          />
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Sección
            </label>
            <select
              value={formData.seccion_id}
              onChange={(e) =>
                setFormData({ ...formData, seccion_id: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Seleccionar sección</option>
              {secciones?.map((seccion) => (
                <option key={seccion.id} value={seccion.id}>
                  {seccion.nombre} - {seccion.grado?.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={close}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              {editingItem ? "Actualizar" : "Guardar"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Ver Detalles */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Detalles del Estudiante"
        size="lg"
      >
        {viewingItem && (
          <div className="space-y-6">
            {/* Información Personal */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Información Personal
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">ID</p>
                  <p className="font-medium">{viewingItem.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">DNI</p>
                  <p className="font-medium">{viewingItem.dni}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Nombre Completo</p>
                  <p className="font-medium">
                    {viewingItem.nombres} {viewingItem.apellido_paterno}{" "}
                    {viewingItem.apellido_materno}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fecha de Nacimiento</p>
                  <p className="font-medium">
                    {new Date(viewingItem.fecha_nacimiento).toLocaleDateString(
                      "es-ES",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Edad</p>
                  <p className="font-medium">
                    {Math.floor(
                      (new Date().getTime() -
                        new Date(viewingItem.fecha_nacimiento).getTime()) /
                        (1000 * 60 * 60 * 24 * 365),
                    )}
                    {" años"}
                  </p>
                </div>
              </div>
            </div>

            {/* Información de Contacto */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Información de Contacto
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Teléfono</p>
                  <p className="font-medium">
                    {viewingItem.telefono || "No registrado"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Dirección</p>
                  <p className="font-medium">
                    {viewingItem.direccion || "No registrada"}
                  </p>
                </div>
              </div>
            </div>

            {/* Información Académica */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Información Académica
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {viewingItem.seccion && (
                  <>
                    <div>
                      <p className="text-sm text-gray-500">Sección</p>
                      <p className="font-medium">
                        {viewingItem.seccion.nombre}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Grado</p>
                      <p className="font-medium">
                        {viewingItem.seccion.grado?.nombre}
                      </p>
                    </div>
                  </>
                )}
                {viewingItem.estado && (
                  <div>
                    <p className="text-sm text-gray-500">Estado</p>
                    <p className="font-medium">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          viewingItem.estado === "activo"
                            ? "bg-green-100 text-green-800"
                            : viewingItem.estado === "suspendido"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {viewingItem.estado.charAt(0).toUpperCase() +
                          viewingItem.estado.slice(1)}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                variant="secondary"
                onClick={() => setIsViewModalOpen(false)}
              >
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
