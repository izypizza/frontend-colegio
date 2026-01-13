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
import { docenteService } from "@/src/lib/services";
import { Docente } from "@/src/types/models";
import { useEffect, useState } from "react";
import { useAuth } from "@/src/features/auth";

export default function DocentesPage() {
  const { user } = useAuth();
  const ESPECIALIDADES = [
    "Matemáticas",
    "Comunicación",
    "Ciencias Sociales",
    "Ciencia y Tecnología",
    "Educación Física",
    "Arte y Cultura",
    "Inglés",
    "Educación Religiosa",
    "Tutoría",
    "Educación para el Trabajo",
    "Desarrollo Personal, Ciudadanía y Cívica",
  ];

  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Docente | null>(null);
  const [viewingItem, setViewingItem] = useState<Docente | null>(null);
  const [formData, setFormData] = useState({
    nombres: "",
    apellido_paterno: "",
    apellido_materno: "",
    especialidad: "",
    dni: "",
    email: "",
    telefono: "",
    direccion: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEspecialidad, setFilterEspecialidad] = useState("");

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(50);
  const [paginationData, setPaginationData] = useState({
    total: 0,
    lastPage: 1,
  });

  useEffect(() => {
    fetchData();
  }, [currentPage, perPage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await docenteService.getAll({
        page: currentPage,
        per_page: perPage,
      });

      // Manejar respuesta paginada
      if (
        data &&
        typeof data === "object" &&
        "data" in data &&
        "current_page" in data
      ) {
        setDocentes(data.data);
        setPaginationData({
          total: data.total || 0,
          lastPage: data.last_page || 1,
        });
      } else {
        const docentesArray = Array.isArray(data) ? data : data?.data || [];
        setDocentes(docentesArray);
      }
    } catch {
      setError("Error al cargar los docentes");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({
      nombres: "",
      apellido_paterno: "",
      apellido_materno: "",
      especialidad: "",
      dni: "",
      email: "",
      telefono: "",
      direccion: "",
    });
    setIsModalOpen(true);
  };

  const handleView = (item: Docente) => {
    setViewingItem(item);
    setIsViewModalOpen(true);
  };

  const handleEdit = (item: Docente) => {
    setEditingItem(item);
    setFormData({
      nombres: item.nombres,
      apellido_paterno: item.apellido_paterno,
      apellido_materno: item.apellido_materno,
      especialidad: item.especialidad || "",
      dni: item.dni || "",
      email: item.email || "",
      telefono: item.telefono || "",
      direccion: item.direccion || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (item: Docente) => {
    if (!confirm("¿Estás seguro de eliminar este docente?")) return;

    try {
      await docenteService.delete(item.id);
      setSuccess("Docente eliminado correctamente");
      fetchData();
    } catch {
      setError("Error al eliminar el docente");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const data = {
        ...formData,
        nombres: formData.nombres.trim(),
        apellido_paterno: formData.apellido_paterno.trim(),
        apellido_materno: formData.apellido_materno.trim(),
        dni: formData.dni.trim(),
        email: formData.email.trim().toLowerCase(),
        telefono: formData.telefono.trim(),
      };

      if (editingItem) {
        const response = await docenteService.update(editingItem.id, data);
        setSuccess(response.message || "Docente actualizado correctamente");
      } else {
        const response = await docenteService.create(data);
        setSuccess(response.message || "Docente creado correctamente");
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      if (err.response?.data?.errors) {
        const firstError = Object.values(err.response.data.errors)[0];
        setError(Array.isArray(firstError) ? firstError[0] : firstError);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Error al guardar el docente");
      }
    }
  };

  // Filtrado de docentes
  const docentesFiltrados = docentes.filter((docente) => {
    const nombreCompleto =
      `${docente.nombres} ${docente.apellido_paterno} ${docente.apellido_materno}`.toLowerCase();
    const email = docente.email?.toLowerCase() || "";
    const matchesSearch =
      nombreCompleto.includes(searchTerm.toLowerCase()) ||
      email.includes(searchTerm.toLowerCase());
    const matchesEspecialidad =
      !filterEspecialidad || docente.especialidad === filterEspecialidad;
    return matchesSearch && matchesEspecialidad;
  });

  const columns = [
    { key: "id", label: "ID" },
    {
      key: "nombre_completo",
      label: "Nombre Completo",
      render: (value: unknown, item: Docente) =>
        item.nombre_completo ||
        `${item.apellido_paterno} ${item.apellido_materno}, ${item.nombres}`,
    },
    { key: "especialidad", label: "Especialidad" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Docentes</h1>
          <p className="text-gray-600 mt-2">Gestión de docentes del colegio</p>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          + Nuevo Docente
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
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <select
            value={filterEspecialidad}
            onChange={(e) => setFilterEspecialidad(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las especialidades</option>
            {ESPECIALIDADES.map((esp) => (
              <option key={esp} value={esp}>
                {esp}
              </option>
            ))}
          </select>
        </div>
        <div className="text-sm text-gray-600">
          Mostrando {docentesFiltrados.length} de {docentes.length} docentes
        </div>
      </Card>

      <Card>
        <Table
          columns={columns}
          data={docentesFiltrados}
          loading={loading}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>

      {(user?.role === "admin" || user?.role === "auxiliar") && (
        <Pagination
          currentPage={currentPage}
          lastPage={paginationData.lastPage}
          total={paginationData.total}
          perPage={perPage}
          onPageChange={(page) => {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onPerPageChange={(newPerPage) => {
            setPerPage(newPerPage);
            setCurrentPage(1);
          }}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setError(null);
        }}
        title={editingItem ? "Editar Docente" : "Nuevo Docente"}
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
              placeholder="Roberto"
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
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="docente@colegio.pe"
            required
          />
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Especialidad *
            </label>
            <select
              value={formData.especialidad}
              onChange={(e) =>
                setFormData({ ...formData, especialidad: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Seleccionar especialidad</option>
              {ESPECIALIDADES.map((esp) => (
                <option key={esp} value={esp}>
                  {esp}
                </option>
              ))}
            </select>
          </div>
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

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setIsModalOpen(false)}
            >
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
        title="Detalles del Docente"
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
                  <p className="font-medium">
                    {viewingItem.dni || "No registrado"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Nombre Completo</p>
                  <p className="font-medium">
                    {viewingItem.nombres} {viewingItem.apellido_paterno}{" "}
                    {viewingItem.apellido_materno}
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
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">
                    {viewingItem.email || "No registrado"}
                  </p>
                </div>
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

            {/* Información Profesional */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Información Profesional
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Especialidad</p>
                  <p className="font-medium">
                    {viewingItem.especialidad || "No especificada"}
                  </p>
                </div>
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
