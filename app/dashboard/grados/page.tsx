'use client';

import { Alert, Button, Card, Input, Modal, Table } from '@/src/components/ui';
import { gradoService } from '@/src/lib/services';
import { Grado } from '@/src/types/models';
import { useEffect, useState } from 'react';

export default function GradosPage() {
  const [grados, setGrados] = useState<Grado[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Grado | null>(null);
  const [formData, setFormData] = useState({ nombre: '' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await gradoService.getAll();
      setGrados(data);
    } catch {
      setError('Error al cargar los grados');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({ nombre: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (item: Grado) => {
    setEditingItem(item);
    setFormData({ nombre: item.nombre });
    setIsModalOpen(true);
  };

  const handleDelete = async (item: Grado) => {
    if (!confirm('¿Estás seguro de eliminar este grado?')) return;

    try {
      await gradoService.delete(item.id);
      setSuccess('Grado eliminado correctamente');
      fetchData();
    } catch {
      setError('Error al eliminar el grado');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingItem) {
        await gradoService.update(editingItem.id, formData);
        setSuccess('Grado actualizado correctamente');
      } else {
        await gradoService.create(formData);
        setSuccess('Grado creado correctamente');
      }

      setIsModalOpen(false);
      fetchData();
    } catch {
      setError('Error al guardar el grado');
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Grados</h1>
          <p className="text-gray-600 mt-2">Gestión de grados académicos</p>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          + Agregar Grado
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

      <Card>
        <Table
          columns={columns}
          data={grados}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Editar Grado' : 'Nuevo Grado'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            placeholder="Ejemplo: 1ro Primaria, 2do Secundaria"
            required
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              {editingItem ? 'Actualizar' : 'Guardar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
