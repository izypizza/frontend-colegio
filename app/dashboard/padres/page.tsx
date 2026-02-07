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
import { padreService } from "@/src/lib/services";
import { Padre } from "@/src/types/models";
import { useEffect, useState } from "react";
import { useErrorHandler } from "@/src/hooks/useErrorHandler";
import { useModalState } from "@/src/hooks/useModalState";
import { usePagination } from "@/src/hooks/usePagination";
import { useFilteredData } from "@/src/hooks/useFilteredData";

export default function PadresPage() {
  const [padres, setPadres] = useState<Padre[]>([]);
  const [loading, setLoading] = useState(true);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<Padre | null>(null);
  const [formData, setFormData] = useState({
    nombres: "",
    apellido_paterno: "",
    apellido_materno: "",
    telefono: "",
    email: "",
    dni: "",
    direccion: "",
    ocupacion: "",
  });

  // Hooks personalizados
  const { error, success, handleError, handleSuccess } = useErrorHandler();
  const { isOpen, editingItem, openCreate, openEdit, close } =
    useModalState<Padre>();
  const pagination = usePagination();
  const {
    filteredData: padresFiltrados,
    searchTerm,
    setSearchTerm,
  } = useFilteredData(padres, (padre, term) => {
    const nombreCompleto =
      `${padre.nombres} ${padre.apellido_paterno} ${padre.apellido_materno}`.toLowerCase();
    const email = padre.email?.toLowerCase() || "";
    const telefono = padre.telefono?.toLowerCase() || "";
    const dni = padre.dni?.toLowerCase() || "";
    return (
      nombreCompleto.includes(term.toLowerCase()) ||
      email.includes(term.toLowerCase()) ||
      telefono.includes(term.toLowerCase()) ||
      dni.includes(term.toLowerCase())
    );
  });

  useEffect(() => {
    fetchData();
  }, [pagination.currentPage, pagination.perPage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await padreService.getAll({
        page: pagination.currentPage,
        per_page: pagination.perPage,
      });

      if (
        data &&
        typeof data === "object" &&
        "data" in data &&
        "current_page" in data
      ) {
        setPadres(data.data);
        pagination.updatePagination({
          currentPage: data.current_page,
          totalPages: data.last_page || 1,
          totalItems: data.total || 0,
        });
      } else {
        const padresArray = Array.isArray(data) ? data : [];
        setPadres(padresArray);
      }
    } catch (err) {
      handleError(err, "Error al cargar los padres");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      nombres: "",
      apellido_paterno: "",
      apellido_materno: "",
      telefono: "",
      email: "",
      dni: "",
      direccion: "",
      ocupacion: "",
    });
    openCreate();
  };

  const handleView = (item: Padre) => {
    setViewingItem(item);
    setIsViewModalOpen(true);
  };

  const handleEdit = (item: Padre) => {
    setFormData({
      nombres: item.nombres,
      apellido_paterno: item.apellido_paterno,
      apellido_materno: item.apellido_materno,
      telefono: item.telefono || "",
      email: item.email || "",
      dni: item.dni || "",
      direccion: item.direccion || "",
      ocupacion: item.ocupacion || "",
    });
    openEdit(item);
  };

  const handleDelete = async (item: Padre) => {
    if (!confirm("¿Estás seguro de eliminar este padre de familia?")) return;

    try {
      await padreService.delete(item.id);
      handleSuccess("Padre eliminado correctamente");
      fetchData();
    } catch (err) {
      handleError(err, "Error al eliminar el padre");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const cleanData = {
        nombres: formData.nombres.trim(),
        apellido_paterno: formData.apellido_paterno.trim(),
        apellido_materno: formData.apellido_materno.trim(),
        telefono: formData.telefono.trim(),
        email: formData.email.trim(),
        dni: formData.dni.trim(),
        direccion: formData.direccion.trim(),
        ocupacion: formData.ocupacion.trim(),
      };

      if (editingItem) {
        await padreService.update(editingItem.id, cleanData);
        handleSuccess("Padre actualizado correctamente");
      } else {
        await padreService.create(cleanData);
        handleSuccess("Padre creado correctamente");
      }

      close();
      fetchData();
    } catch (err) {
      handleError(err, "Error al guardar el padre");
    }
  };

  const columns = [
    { key: "id", label: "ID" },
    {
      key: "nombre_completo",
      label: "Nombre Completo",
      render: (value: unknown, item: Padre) =>
        item.nombre_completo ||
        `${item.apellido_paterno} ${item.apellido_materno}, ${item.nombres}`,
    },
    { key: "telefono", label: "Teléfono" },
    { key: "email", label: "Email" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Padres de Familia
          </h1>
          <p className="text-gray-600 mt-2">Gestión de padres de familia</p>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          + Agregar Padre
        </Button>
      </div>

      {success && (
        <Alert
          type="success"
          message={success}
          onClose={() => setSuccess(null)}
        />
      )}

      {/* Filtro de búsqueda */}
      <Card>
        <div className="mb-4">
          <Input
            placeholder="Buscar por nombre, email, teléfono o DNI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-sm text-gray-600">
          Mostrando {padresFiltrados.length} de {padres.length} padres
        </div>
      </Card>

      <Card>
        <Table
          columns={columns}
          data={padresFiltrados}
          loading={loading}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>

      {pagination.totalItems > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          lastPage={pagination.totalPages}
          total={pagination.totalItems}
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

      <Modal
        isOpen={isOpen}
        onClose={close}
        title={editingItem ? "Editar Padre" : "Nuevo Padre"}
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
              placeholder="Juan"
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
            label="DNI (8 dígitos)"
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
            placeholder="padre@email.com"
          />
          <Input
            label="Teléfono (9 dígitos)"
            type="tel"
            value={formData.telefono}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              if (value.length <= 9) {
                setFormData({ ...formData, telefono: value });
              }
            }}
            placeholder="987654321"
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
          <Input
            label="Ocupación"
            value={formData.ocupacion}
            onChange={(e) =>
              setFormData({ ...formData, ocupacion: e.target.value })
            }
            placeholder="Ingeniero, Doctor, etc."
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={close}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              {editingItem ? "Actualizar" : "Guardar"}
            </Button>
          </div>{" "}
        </form>
      </Modal>

      {/* Modal Ver Detalles */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Detalles del Padre de Familia"
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
                <div>
                  <p className="text-sm text-gray-500">Ocupación</p>
                  <p className="font-medium">
                    {viewingItem.ocupacion || "No especificada"}
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

            {/* Información de Hijos */}
            {viewingItem.hijos && viewingItem.hijos.length > 0 && (
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Hijos
                </h3>
                <div className="space-y-2">
                  {viewingItem.hijos.map((hijo, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium">
                        {hijo.nombres} {hijo.apellido_paterno}{" "}
                        {hijo.apellido_materno}
                      </p>
                      {hijo.seccion && (
                        <p className="text-sm text-gray-600">
                          {hijo.seccion.nombre} - {hijo.seccion.grado?.nombre}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

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
