'use client';

import { Alert, Button, Card, Input, Modal, Table } from '@/src/components/ui';
import { docenteService } from '@/src/lib/services';
import { Docente } from '@/src/types/models';
import { useEffect, useState } from 'react';

export default function DocentesPage() {
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Docente | null>(null);
  const [formData, setFormData] = useState({ nombre: '', especialidad: '' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await docenteService.getAll();
      setDocentes(data);
    } catch {
      setError('Error al cargar los docentes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({ nombre: '', especialidad: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (item: Docente) => {
    setEditingItem(item);
    setFormData({ nombre: item.nombre, especialidad: item.especialidad });
    setIsModalOpen(true);
  };

  const handleDelete = async (item: Docente) => {
    if (!confirm('¿Estás seguro de eliminar este docente?')) return;

    try {
      await docenteService.delete(item.id);
      setSuccess('Docente eliminado correctamente');
      fetchData();
    } catch {
      setError('Error al eliminar el docente');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingItem) {
        await docenteService.update(editingItem.id, formData);
        setSuccess('Docente actualizado correctamente');
      } else {
        await docenteService.create(formData);
        setSuccess('Docente creado correctamente');
      }

      setIsModalOpen(false);
      fetchData();
    } catch {
      setError('Error al guardar el docente');
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'especialidad', label: 'Especialidad' },
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

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

      <Card>
        <Table
          columns={columns}
          data={docentes}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Editar Docente' : 'Nuevo Docente'}
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
            label="Nombre Completo"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            required
          />
          <Input
            label="Especialidad"
            value={formData.especialidad}
            onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
            required
          />
        </form>
      </Modal>
    </div>
  );
}
