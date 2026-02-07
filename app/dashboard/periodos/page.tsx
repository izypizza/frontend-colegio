"use client";

import { Alert, Button, Card, Input, Modal, Table } from "@/src/components/ui";
import { periodoAcademicoService } from "@/src/lib/services";
import { PeriodoAcademico } from "@/src/types/models";
import { useEffect, useState } from "react";
import { useErrorHandler } from "@/src/hooks/useErrorHandler";
import { useModalState } from "@/src/hooks/useModalState";
import { useFilteredData } from "@/src/hooks/useFilteredData";

export default function PeriodosPage() {
  const [periodos, setPeriodos] = useState<PeriodoAcademico[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    nombre: "",
    anio: "",
    fecha_inicio: "",
    fecha_fin: "",
  });
  const [filterAnio, setFilterAnio] = useState("");

  // Hooks personalizados
  const { error, success, handleError, handleSuccess, setError } =
    useErrorHandler();
  const { isOpen, editingItem, openCreate, openEdit, close } =
    useModalState<PeriodoAcademico>();
  const {
    filteredData: periodosFiltrados,
    searchTerm,
    setSearchTerm,
  } = useFilteredData(periodos, (periodo, term) =>
    periodo.nombre.toLowerCase().includes(term.toLowerCase()),
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await periodoAcademicoService.getAll();
      setPeriodos(data);
    } catch (err) {
      handleError(err, "Error al cargar los periodos");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({ nombre: "", anio: "", fecha_inicio: "", fecha_fin: "" });
    openCreate();
  };

  const handleEdit = (item: PeriodoAcademico) => {
    setFormData({
      nombre: item.nombre,
      anio: item.anio.toString(),
      fecha_inicio: item.fecha_inicio ? item.fecha_inicio.split("T")[0] : "",
      fecha_fin: item.fecha_fin ? item.fecha_fin.split("T")[0] : "",
    });
    openEdit(item);
  };

  const handleDelete = async (item: PeriodoAcademico) => {
    if (!confirm("¿Estás seguro de eliminar este periodo académico?")) return;

    try {
      await periodoAcademicoService.delete(item.id);
      handleSuccess("Periodo eliminado correctamente");
      fetchData();
    } catch (err) {
      handleError(err, "Error al eliminar el periodo");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = {
        nombre: formData.nombre,
        anio: parseInt(formData.anio),
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin,
      };

      if (editingItem) {
        await periodoAcademicoService.update(editingItem.id, data);
        handleSuccess("Periodo actualizado correctamente");
      } else {
        await periodoAcademicoService.create(data);
        handleSuccess("Periodo creado correctamente");
      }

      close();
      fetchData();
    } catch (err) {
      handleError(err, "Error al guardar el periodo");
    }
  };

  // Filtrado adicional por año
  const periodosFiltradosCompletos = periodosFiltrados.filter((periodo) => {
    const matchesAnio = !filterAnio || periodo.anio?.toString() === filterAnio;
    return matchesAnio;
  });

  // Obtener años únicos
  const aniosUnicos = Array.from(new Set(periodos.map((p) => p.anio))).sort(
    (a, b) => b - a,
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
          Mostrando {periodosFiltradosCompletos.length} de {periodos.length}{" "}
          periodos
        </div>
      </Card>

      <Card>
        <Table
          columns={columns}
          data={periodosFiltradosCompletos}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          close();
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
            <Button variant="secondary" type="button" onClick={close}>
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
