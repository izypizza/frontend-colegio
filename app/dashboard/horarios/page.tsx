'use client';

import { Alert, Button, Card, Input, Modal, Table } from '@/src/components/ui';
import { horarioService, materiaService, seccionService } from '@/src/lib/services';
import { Horario, Materia, Seccion } from '@/src/types/models';
import { useEffect, useState } from 'react';

export default function HorariosPage() {
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Horario | null>(null);
  const [formData, setFormData] = useState({
    seccion_id: '',
    materia_id: '',
    dia: '',
    hora_inicio: '',
    hora_fin: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [horariosData, seccionesData, materiasData] = await Promise.all([
        horarioService.getAll(),
        seccionService.getAll(),
        materiaService.getAll(),
      ]);
      setHorarios(horariosData);
      setSecciones(seccionesData);
      setMaterias(materiasData);
    } catch {
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({
      seccion_id: '',
      materia_id: '',
      dia: '',
      hora_inicio: '',
      hora_fin: '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (item: Horario) => {
    setEditingItem(item);
    setFormData({
      seccion_id: item.seccion_id.toString(),
      materia_id: item.materia_id.toString(),
      dia: item.dia,
      hora_inicio: item.hora_inicio,
      hora_fin: item.hora_fin,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (item: Horario) => {
    if (!confirm('¿Estás seguro de eliminar este horario?')) return;

    try {
      await horarioService.delete(item.id);
      setSuccess('Horario eliminado correctamente');
      fetchData();
    } catch {
      setError('Error al eliminar el horario');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const data = {
        seccion_id: parseInt(formData.seccion_id),
        materia_id: parseInt(formData.materia_id),
        dia: formData.dia,
        hora_inicio: formData.hora_inicio,
        hora_fin: formData.hora_fin,
      };

      if (editingItem) {
        await horarioService.update(editingItem.id, data);
        setSuccess('Horario actualizado correctamente');
      } else {
        await horarioService.create(data);
        setSuccess('Horario creado correctamente');
      }

      setIsModalOpen(false);
      fetchData();
    } catch {
      setError('Error al guardar el horario');
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    {
      key: 'seccion',
      label: 'Sección',
      render: (value: unknown) => {
        const seccion = value as Seccion;
        return `${seccion?.nombre} - ${seccion?.grado?.nombre}` || 'N/A';
      },
    },
    {
      key: 'materia',
      label: 'Materia',
      render: (value: unknown) => (value as Materia)?.nombre || 'N/A',
    },
    { key: 'dia', label: 'Día' },
    { key: 'hora_inicio', label: 'Hora Inicio' },
    { key: 'hora_fin', label: 'Hora Fin' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Horarios</h1>
          <p className="text-gray-600 mt-2">Gestión de horarios de clases</p>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          + Nuevo Horario
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

      <Card>
        <Table
          columns={columns}
          data={horarios}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Editar Horario' : 'Nuevo Horario'}
        size="lg"
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

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Materia</label>
            <select
              value={formData.materia_id}
              onChange={(e) => setFormData({ ...formData, materia_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Seleccionar materia</option>
              {materias?.map((materia) => (
                <option key={materia.id} value={materia.id}>
                  {materia.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Día</label>
            <select
              value={formData.dia}
              onChange={(e) => setFormData({ ...formData, dia: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Seleccionar día</option>
              {dias?.map((dia) => (
                <option key={dia} value={dia}>
                  {dia}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Hora Inicio"
              type="time"
              value={formData.hora_inicio}
              onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
              required
            />
            <Input
              label="Hora Fin"
              type="time"
              value={formData.hora_fin}
              onChange={(e) => setFormData({ ...formData, hora_fin: e.target.value })}
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
