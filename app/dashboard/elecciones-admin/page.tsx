"use client";

import { useState, useEffect } from "react";
import { Alert, Button, Card, Input, Modal, Table } from "@/src/components/ui";
import { apiClient } from "@/src/lib/api-client";
import {
  ELECCION_ESTADOS,
  ELECCION_ESTADO_LABELS,
} from "@/src/config/constants";

interface Candidato {
  id: number;
  eleccion_id: number;
  estudiante_id: number;
  propuesta: string;
  votos_count?: number;
  estudiante?: {
    nombre_completo: string;
  };
}

interface Eleccion {
  id: number;
  titulo: string;
  fecha: string;
  fecha_inicio: string;
  fecha_cierre: string;
  estado: "pendiente" | "activa" | "cerrada";
  resultados_publicados: boolean;
  candidatos?: Candidato[];
}

export default function EleccionesAdminPage() {
  const [elecciones, setElecciones] = useState<Eleccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Eleccion | null>(null);
  const [formData, setFormData] = useState({
    titulo: "",
    fecha: "",
    fecha_inicio: "",
    fecha_cierre: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get("/elecciones");
      setElecciones(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Error al cargar las elecciones");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekLater = new Date(tomorrow);
    weekLater.setDate(weekLater.getDate() + 7);

    setFormData({
      titulo: "",
      fecha: now.toISOString().split("T")[0],
      fecha_inicio: tomorrow.toISOString().slice(0, 16),
      fecha_cierre: weekLater.toISOString().slice(0, 16),
    });
    setIsModalOpen(true);
  };

  const handleEdit = (item: Eleccion) => {
    setEditingItem(item);
    setFormData({
      titulo: item.titulo,
      fecha: item.fecha.split("T")[0],
      fecha_inicio: new Date(item.fecha_inicio).toISOString().slice(0, 16),
      fecha_cierre: new Date(item.fecha_cierre).toISOString().slice(0, 16),
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (item: Eleccion) => {
    if (!confirm("¿Estás seguro de eliminar esta elección?")) return;

    try {
      await apiClient.delete(`/elecciones/${item.id}`);
      setSuccess("Elección eliminada correctamente");
      fetchData();
    } catch (err) {
      setError("Error al eliminar la elección");
    }
  };

  const handleActivar = async (id: number) => {
    if (!confirm("¿Activar esta elección? Los estudiantes podrán votar."))
      return;

    try {
      await apiClient.post(`/elecciones/${id}/activar`);
      setSuccess("Elección activada exitosamente");
      fetchData();
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const response = (err as { response?: { data?: { message?: string } } })
          .response;
        setError(response?.data?.message || "Error al activar la elección");
      } else {
        setError("Error al activar la elección");
      }
    }
  };

  const handleCerrar = async (id: number) => {
    if (!confirm("¿Cerrar esta elección? No se podrán registrar más votos."))
      return;

    try {
      await apiClient.post(`/elecciones/${id}/cerrar`);
      setSuccess("Elección cerrada exitosamente");
      fetchData();
    } catch (err) {
      setError("Error al cerrar la elección");
    }
  };

  const handlePublicarResultados = async (id: number) => {
    if (!confirm("¿Publicar los resultados? Serán visibles para todos."))
      return;

    try {
      await apiClient.post(`/elecciones/${id}/publicar-resultados`);
      setSuccess("Resultados publicados exitosamente");
      fetchData();
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const response = (err as { response?: { data?: { message?: string } } })
          .response;
        setError(response?.data?.message || "Error al publicar resultados");
      } else {
        setError("Error al publicar resultados");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const cleanData = {
        ...formData,
        titulo: formData.titulo.trim(),
      };

      if (editingItem) {
        await apiClient.put(`/elecciones/${editingItem.id}`, cleanData);
        setSuccess("Elección actualizada correctamente");
      } else {
        await apiClient.post("/elecciones", cleanData);
        setSuccess("Elección creada correctamente");
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const response = (
          err as {
            response?: {
              data?: { errors?: Record<string, string[]>; message?: string };
            };
          }
        ).response;
        if (response?.data?.errors) {
          const firstError = Object.values(response.data.errors)[0];
          setError(Array.isArray(firstError) ? firstError[0] : firstError);
        } else if (response?.data?.message) {
          setError(response.data.message);
        } else {
          setError("Error al guardar la elección");
        }
      } else {
        setError("Error al guardar la elección");
      }
    }
  };

  const getEstadoBadge = (estado: string) => {
    const colors = {
      pendiente: "bg-yellow-100 text-yellow-800",
      activa: "bg-green-100 text-green-800",
      cerrada: "bg-gray-100 text-gray-800",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${
          colors[estado as keyof typeof colors]
        }`}
      >
        {ELECCION_ESTADO_LABELS[estado as keyof typeof ELECCION_ESTADO_LABELS]}
      </span>
    );
  };

  const columns = [
    { key: "id", label: "ID" },
    { key: "titulo", label: "Título" },
    {
      key: "fecha_inicio",
      label: "Inicio",
      render: (value: unknown) =>
        new Date(value as string).toLocaleString("es-PE", {
          dateStyle: "short",
          timeStyle: "short",
        }),
    },
    {
      key: "fecha_cierre",
      label: "Cierre",
      render: (value: unknown) =>
        new Date(value as string).toLocaleString("es-PE", {
          dateStyle: "short",
          timeStyle: "short",
        }),
    },
    {
      key: "estado",
      label: "Estado",
      render: (value: unknown) => getEstadoBadge(value as string),
    },
    {
      key: "resultados_publicados",
      label: "Resultados",
      render: (value: unknown) =>
        (value as boolean) ? "Publicados" : "Pendientes",
    },
    {
      key: "acciones",
      label: "Acciones",
      render: (_: unknown, item: Eleccion) => (
        <div className="flex gap-2">
          {item.estado === "pendiente" && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleActivar(item.id)}
            >
              Activar
            </Button>
          )}
          {item.estado === "activa" && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleCerrar(item.id)}
            >
              Cerrar
            </Button>
          )}
          {item.estado === "cerrada" && !item.resultados_publicados && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handlePublicarResultados(item.id)}
            >
              Publicar Resultados
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de Elecciones
          </h1>
          <p className="text-gray-600 mt-2">
            Administración de elecciones escolares con tiempo limitado
          </p>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          + Nueva Elección
        </Button>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-700">Pendientes</h3>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {elecciones.filter((e) => e.estado === "pendiente").length}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-700">Activas</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {elecciones.filter((e) => e.estado === "activa").length}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-700">Cerradas</h3>
            <p className="text-3xl font-bold text-gray-600 mt-2">
              {elecciones.filter((e) => e.estado === "cerrada").length}
            </p>
          </div>
        </Card>
      </div>

      <Card>
        <Table
          columns={columns}
          data={elecciones}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Editar Elección" : "Nueva Elección"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Título de la Elección"
            value={formData.titulo}
            onChange={(e) =>
              setFormData({ ...formData, titulo: e.target.value })
            }
            required
            placeholder="Ej: Elección del Consejo Estudiantil 2026"
          />

          <Input
            label="Fecha del Evento"
            type="date"
            value={formData.fecha}
            onChange={(e) =>
              setFormData({ ...formData, fecha: e.target.value })
            }
            required
            helperText="Fecha de referencia de la elección"
          />

          <Input
            label="Fecha y Hora de Inicio de Votación"
            type="datetime-local"
            value={formData.fecha_inicio}
            onChange={(e) =>
              setFormData({ ...formData, fecha_inicio: e.target.value })
            }
            required
            helperText="Cuándo se abrirá la votación"
          />

          <Input
            label="Fecha y Hora de Cierre de Votación"
            type="datetime-local"
            value={formData.fecha_cierre}
            onChange={(e) =>
              setFormData({ ...formData, fecha_cierre: e.target.value })
            }
            required
            helperText="Cuándo se cerrará la votación"
          />

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <h4 className="font-semibold text-blue-900 text-sm mb-2">
              Flujo de Trabajo:
            </h4>
            <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
              <li>
                Crear elección → Estado: <strong>Pendiente</strong>
              </li>
              <li>
                Activar elección → Estado: <strong>Activa</strong> (estudiantes
                pueden votar)
              </li>
              <li>
                Cerrar elección → Estado: <strong>Cerrada</strong> (votos
                bloqueados)
              </li>
              <li>Publicar resultados → Visibles para todos</li>
            </ol>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              {editingItem ? "Actualizar" : "Crear Elección"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
