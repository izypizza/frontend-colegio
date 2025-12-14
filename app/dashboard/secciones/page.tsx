'use client';

import { Alert, Button, Card, Input, Modal, Table } from '@/src/components/ui';
import { gradoService, seccionService } from '@/src/lib/services';
import { Grado, Seccion } from '@/src/types/models';
import { useEffect, useState } from 'react';

export default function SeccionesPage() {
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [grados, setGrados] = useState<Grado[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Seccion | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    grado_id: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [seccionesData, gradosData] = await Promise.all([
        seccionService.getAll(),
        gradoService.getAll(),
      ]);
      setSecciones(seccionesData);
      setGrados(gradosData);
    } catch {
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({ nombre: '', grado_id: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (item: Seccion) => {
    setEditingItem(item);
    setFormData({
      nombre: item.nombre,
      grado_id: item.grado_id.toString(),
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (item: Seccion) => {
    if (!confirm('¿Estás seguro de eliminar esta sección?')) return;

    try {
      await seccionService.delete(item.id);
      setSuccess('Sección eliminada correctamente');
      fetchData();
    } catch {
      setError('Error al eliminar la sección');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const data = {
        nombre: formData.nombre,
        grado_id: parseInt(formData.grado_id),
      };

      if (editingItem) {
        await seccionService.update(editingItem.id, data);
        setSuccess('Sección actualizada correctamente');
      } else {
        await seccionService.create(data);
        setSuccess('Sección creada correctamente');
      }

      setIsModalOpen(false);
      fetchData();
    } catch {
      setError('Error al guardar la sección');
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },
    {
      key: 'grado',
      label: 'Grado',
      render: (value: unknown) => (value as Grado)?.nombre || 'N/A',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Secciones</h1>
          <p className="text-gray-600 mt-2">Gestión de secciones por grado</p>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          + Agregar Sección
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

      <Card>
        <Table
          columns={columns}
          data={secciones}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Editar Sección' : 'Nueva Sección'}
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
            placeholder="Ejemplo: Sección A, Sección B"
            required
          />

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Grado</label>
            <select
              value={formData.grado_id}
              onChange={(e) => setFormData({ ...formData, grado_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Seleccionar grado</option>
              {grados?.map((grado) => (
                <option key={grado.id} value={grado.id}>
                  {grado.nombre}
                </option>
              ))}
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}
