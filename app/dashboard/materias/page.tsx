'use client';

import { Alert, Button, Card, Input, Modal, Table } from '@/src/components/ui';
import { materiaService } from '@/src/lib/services';
import { Materia } from '@/src/types/models';
import { useEffect, useState } from 'react';

export default function MateriasPage() {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Materia | null>(null);
  const [formData, setFormData] = useState({ nombre: '' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await materiaService.getAll();
      setMaterias(data);
    } catch {
      setError('Error al cargar las materias');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({ nombre: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (item: Materia) => {
    setEditingItem(item);
    setFormData({ nombre: item.nombre });
    setIsModalOpen(true);
  };

  const handleDelete = async (item: Materia) => {
    if (!confirm('¿Estás seguro de eliminar esta materia?')) return;

    try {
      await materiaService.delete(item.id);
      setSuccess('Materia eliminada correctamente');
      fetchData();
    } catch {
      setError('Error al eliminar la materia');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingItem) {
        await materiaService.update(editingItem.id, formData);
        setSuccess('Materia actualizada correctamente');
      } else {
        await materiaService.create(formData);
        setSuccess('Materia creada correctamente');
      }

      setIsModalOpen(false);
      fetchData();
    } catch {
      setError('Error al guardar la materia');
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Nombre de la Materia' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Materias</h1>
          <p className="text-gray-600 mt-2">Gestión de materias del currículo</p>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          + Nueva Materia
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

      <Card>
        <Table
          columns={columns}
          data={materias}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Editar Materia' : 'Nueva Materia'}
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
          <Input
            label="Nombre de la Materia"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            required
            placeholder="Ej: Matemática, Comunicación..."
          />
        </form>
      </Modal>
    </div>
  );
}
