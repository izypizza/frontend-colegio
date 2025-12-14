'use client';

import { Alert, Button, Card, Input, Modal, Table } from '@/src/components/ui';
import { padreService } from '@/src/lib/services';
import { Padre } from '@/src/types/models';
import { useEffect, useState } from 'react';

export default function PadresPage() {
  const [padres, setPadres] = useState<Padre[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Padre | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await padreService.getAll();
      setPadres(data);
    } catch {
      setError('Error al cargar los padres');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({ nombre: '', telefono: '', email: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (item: Padre) => {
    setEditingItem(item);
    setFormData({
      nombre: item.nombre,
      telefono: item.telefono || '',
      email: item.email || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (item: Padre) => {
    if (!confirm('¿Estás seguro de eliminar este padre de familia?')) return;

    try {
      await padreService.delete(item.id);
      setSuccess('Padre eliminado correctamente');
      fetchData();
    } catch {
      setError('Error al eliminar el padre');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingItem) {
        await padreService.update(editingItem.id, formData);
        setSuccess('Padre actualizado correctamente');
      } else {
        await padreService.create(formData);
        setSuccess('Padre creado correctamente');
      }

      setIsModalOpen(false);
      fetchData();
    } catch {
      setError('Error al guardar el padre');
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'telefono', label: 'Teléfono' },
    { key: 'email', label: 'Email' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Padres de Familia</h1>
          <p className="text-gray-600 mt-2">Gestión de padres de familia</p>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          + Agregar Padre
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

      <Card>
        <Table
          columns={columns}
          data={padres}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Editar Padre' : 'Nuevo Padre'}
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
            label="Nombre"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            required
          />
          <Input
            label="Teléfono"
            type="tel"
            value={formData.telefono}
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </form>
      </Modal>
    </div>
  );
}
