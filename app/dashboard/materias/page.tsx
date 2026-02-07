"use client";

import { Alert, Button, Card, Input, Modal, Table } from "@/src/components/ui";
import { materiaService } from "@/src/lib/services";
import { Materia } from "@/src/types/models";
import { useEffect, useState } from "react";
import { useErrorHandler } from "@/src/hooks/useErrorHandler";
import { useModalState } from "@/src/hooks/useModalState";
import { useFilteredData } from "@/src/hooks/useFilteredData";

export default function MateriasPage() {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ nombre: "" });

  // Hooks centralizados
  const { error, success, handleError, handleSuccess, setError } =
    useErrorHandler();
  const { isOpen, editingItem, openCreate, openEdit, close } =
    useModalState<Materia>();
  const {
    filteredData: materiasFiltradas,
    searchTerm,
    setSearchTerm,
  } = useFilteredData(materias, ["nombre"]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await materiaService.getAll();
      setMaterias(data);
    } catch (err) {
      handleError(err, "Error al cargar las materias");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    openCreate();
    setFormData({ nombre: "" });
  };

  const handleEditClick = (item: Materia) => {
    openEdit(item);
    setFormData({ nombre: item.nombre });
  };

  const handleDelete = async (item: Materia) => {
    if (!confirm("¿Estás seguro de eliminar esta materia?")) return;

    try {
      await materiaService.delete(item.id);
      handleSuccess("Materia eliminada correctamente", fetchData);
    } catch (err) {
      handleError(err, "Error al eliminar la materia");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingItem) {
        await materiaService.update(editingItem.id, formData);
        handleSuccess("Materia actualizada correctamente");
      } else {
        await materiaService.create(formData);
        handleSuccess("Materia creada correctamente");
      }

      close();
      fetchData();
    } catch (err) {
      handleError(err, "Error al guardar la materia");
    }
  };

  const columns = [
    { key: "id", label: "ID" },
    { key: "nombre", label: "Nombre de la Materia" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Materias</h1>
          <p className="text-gray-600 mt-2">
            Gestión de materias del currículo
          </p>
        </div>
        <Button variant="primary" onClick={handleCreateClick}>
          + Nueva Materia
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
            placeholder="Buscar materia..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-sm text-gray-600">
          Mostrando {materiasFiltradas.length} de {materias.length} materias
        </div>
      </Card>

      <Card>
        <Table
          columns={columns}
          data={materiasFiltradas}
          loading={loading}
          onEdit={handleEditClick}
          onDelete={handleDelete}
        />
      </Card>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          close();
          setError(null);
        }}
        title={editingItem ? "Editar Materia" : "Nueva Materia"}
        size="md"
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
            label="Nombre de la Materia"
            value={formData.nombre}
            onChange={(e) =>
              setFormData({ ...formData, nombre: e.target.value })
            }
            required
            placeholder="Ej: Matemática, Comunicación..."
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
