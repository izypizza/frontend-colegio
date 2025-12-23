'use client';

import { Alert, Button, Card, Input, Modal, Table } from '@/src/components/ui';
import { estudianteService, seccionService } from '@/src/lib/services';
import { Estudiante, Seccion } from '@/src/types/models';
import { useEffect, useState } from 'react';

export default function EstudiantesPage() {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Estudiante | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    fecha_nacimiento: '',
    seccion_id: '',
    dni: '',
    telefono: '',
    direccion: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [estudiantesData, seccionesData] = await Promise.all([
        estudianteService.getAll(),
        seccionService.getAll(),
      ]);
      setEstudiantes(estudiantesData);
      setSecciones(seccionesData);
    } catch {
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({ nombre: '', fecha_nacimiento: '', seccion_id: '', dni: '', telefono: '', direccion: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (item: Estudiante) => {
    setEditingItem(item);
    setFormData({
      nombre: item.nombre,
      fecha_nacimiento: item.fecha_nacimiento,
      seccion_id: item.seccion_id.toString(),
      dni: item.dni || '',
      telefono: item.telefono || '',
      direccion: item.direccion || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (item: Estudiante) => {
    if (!confirm('¿Estás seguro de eliminar este estudiante?')) return;

    try {
      await estudianteService.delete(item.id);
      setSuccess('Estudiante eliminado correctamente');
      fetchData();
    } catch {
      setError('Error al eliminar el estudiante');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const data = {
        nombre: formData.nombre,
        fecha_nacimiento: formData.fecha_nacimiento,
        seccion_id: parseInt(formData.seccion_id),
        dni: formData.dni,
        telefono: formData.telefono,
        direccion: formData.direccion,
      };

      if (editingItem) {
        await estudianteService.update(editingItem.id, data);
        setSuccess('Estudiante actualizado correctamente');
      } else {
        await estudianteService.create(data);
        setSuccess('Estudiante creado correctamente');
      }

      setIsModalOpen(false);
      fetchData();
    } catch {
      setError('Error al guardar el estudiante');
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },
    {
      key: 'fecha_nacimiento',
      label: 'Fecha de Nacimiento',
      render: (value: unknown) => new Date(value as string).toLocaleDateString(),
    },
    {
      key: 'seccion',
      label: 'Sección',
      render: (value: unknown) => (value as Seccion)?.nombre || 'N/A',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Estudiantes</h1>
          <p className="text-gray-600 mt-2">Gestión de estudiantes del colegio</p>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          + Nuevo Estudiante
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

      <Card>
        <Table
          columns={columns}
          data={estudiantes}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Editar Estudiante' : 'Nuevo Estudiante'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre Completo"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            required
          />
          <Input
            label="DNI"
            value={formData.dni}
            onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
            placeholder="12345678"
          />
          <Input
            label="Fecha de Nacimiento"
            type="date"
            value={formData.fecha_nacimiento}
            onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
            required
          />
          <Input
            label="Teléfono"
            value={formData.telefono}
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
            placeholder="987654321"
          />
          <Input
            label="Dirección"
            value={formData.direccion}
            onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
            placeholder="Av. Principal 123"
          />
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Sección</label>
            <select
              value={formData.seccion_id}
              onChange={(e) => setFormData({ ...formData, seccion_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Seleccionar sección</option>
              {secciones?.map((seccion) => (
                <option key={seccion.id} value={seccion.id}>
                  {seccion.nombre} - {seccion.grado?.nombre}
                </option>
              ))}
            </select>
          </div>

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
