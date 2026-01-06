"use client";

import { Alert, Button, Card, Input, Modal, Table } from "@/src/components/ui";
import { periodoAcademicoService } from "@/src/lib/services";
import { PeriodoAcademico } from "@/src/types/models";
import { useEffect, useState } from "react";

export default function PeriodosPage() {
  const [periodos, setPeriodos] = useState<PeriodoAcademico[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PeriodoAcademico | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    anio: "",
    fecha_inicio: "",
    fecha_fin: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAnio, setFilterAnio] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await periodoAcademicoService.getAll();
      setPeriodos(data);
    } catch {
      setError("Error al cargar los periodos");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({ nombre: "", anio: "", fecha_inicio: "", fecha_fin: "" });
    setIsModalOpen(true);
  };

  const handleEdit = (item: PeriodoAcademico) => {
    setEditingItem(item);
    setFormData({
      nombre: item.nombre,
      anio: item.anio.toString(),
      fecha_inicio: item.fecha_inicio ? item.fecha_inicio.split("T")[0] : "", // Convertir a yyyy-MM-dd
      fecha_fin: item.fecha_fin ? item.fecha_fin.split("T")[0] : "", // Convertir a yyyy-MM-dd
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (item: PeriodoAcademico) => {
    if (!confirm("¿Estás seguro de eliminar este periodo académico?")) return;

    try {
      await periodoAcademicoService.delete(item.id);
      setSuccess("Periodo eliminado correctamente");
      fetchData();
    } catch {
      setError("Error al eliminar el periodo");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const data = {
        nombre: formData.nombre,
        anio: parseInt(formData.anio),
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin,
      };

      if (editingItem) {
        await periodoAcademicoService.update(editingItem.id, data);
        setSuccess("Periodo actualizado correctamente");
      } else {
        await periodoAcademicoService.create(data);
        setSuccess("Periodo creado correctamente");
      }

      setIsModalOpen(false);
      fetchData();
    } catch {
      setError("Error al guardar el periodo");
    }
  };

  // Filtrado de periodos
  const periodosFiltrados = periodos.filter((periodo) => {
    const matchesSearch = periodo.nombre
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesAnio = !filterAnio || periodo.anio?.toString() === filterAnio;
    return matchesSearch && matchesAnio;
  });

  // Obtener años únicos
  const aniosUnicos = Array.from(new Set(periodos.map((p) => p.anio))).sort(
    (a, b) => b - a
  );

  const columns = [
    { key: "id", label: "ID" },
    { key: "nombre", label: "Nombre" },
    { key: "anio", label: "Año" },
    {
      key: "fecha_inicio",
      label: "Fecha Inicio",
      render: (value: unknown) =>
        new Date(value as string).toLocaleDateString(),
    },
    {
      key: "fecha_fin",
      label: "Fecha Fin",
      render: (value: unknown) =>
        new Date(value as string).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Periodos Académicos
          </h1>
          <p className="text-gray-600 mt-2">Gestión de periodos académicos</p>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          + Agregar Periodo
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
            placeholder="Buscar periodo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <select
            value={filterAnio}
            onChange={(e) => setFilterAnio(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los años</option>
            {aniosUnicos.map((anio) => (
              <option key={anio} value={anio}>
                {anio}
              </option>
            ))}
          </select>
        </div>
        <div className="text-sm text-gray-600">
          Mostrando {periodosFiltrados.length} de {periodos.length} periodos
        </div>
      </Card>

      <Card>
        <Table
          columns={columns}
          data={periodosFiltrados}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setError(null);
        }}
        title={editingItem ? "Editar Periodo" : "Nuevo Periodo"}
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
          <Input
            label="Nombre"
            value={formData.nombre}
            onChange={(e) =>
              setFormData({ ...formData, nombre: e.target.value })
            }
            placeholder="Ejemplo: Primer Trimestre, Segundo Bimestre"
            required
          />
          <Input
            label="Año"
            type="number"
            value={formData.anio}
            onChange={(e) => setFormData({ ...formData, anio: e.target.value })}
            placeholder="2024"
            required
          />
          <Input
            label="Fecha Inicio"
            type="date"
            value={formData.fecha_inicio}
            onChange={(e) =>
              setFormData({ ...formData, fecha_inicio: e.target.value })
            }
            required
          />
          <Input
            label="Fecha Fin"
            type="date"
            value={formData.fecha_fin}
            onChange={(e) =>
              setFormData({ ...formData, fecha_fin: e.target.value })
            }
            required
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
    </div>
  );
}
