'use client';

import { Alert, Button, Card, Input, Modal, Table } from '@/src/components/ui';
import { asistenciaService, estudianteService, materiaService, docentePortalService } from '@/src/lib/services';
import { Asistencia, Estudiante, Materia } from '@/src/types/models';
import { useEffect, useState } from 'react';
import { useAuth } from '@/src/features/auth';

export default function AsistenciasPage() {
  const { user } = useAuth();
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Asistencia | null>(null);
  const [formData, setFormData] = useState({
    estudiante_id: '',
    materia_id: '',
    fecha: '',
    presente: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Si es docente, usar los endpoints del portal de docente
      if (user?.role === 'docente') {
        const [asistenciasData, estudiantesData, asignacionesData] = await Promise.all([
          docentePortalService.misAsistencias(),
          docentePortalService.misEstudiantes(),
          docentePortalService.misAsignaciones(),
        ]);
        setAsistencias(asistenciasData.asistencias || []);
        setEstudiantes(estudiantesData.estudiantes || []);
        // Extraer materias únicas de las asignaciones usando Map
        const materiasMap = new Map();
        asignacionesData.asignaciones?.forEach((a: any) => {
          if (a.materia && !materiasMap.has(a.materia.id)) {
            materiasMap.set(a.materia.id, a.materia);
          }
        });
        const materiasUnicas = Array.from(materiasMap.values());
        console.log('Materias únicas:', materiasUnicas);
        setMaterias(materiasUnicas);
      } else {
        // Admin/Auxiliar usan endpoints generales
        const [asistenciasData, estudiantesData, materiasData] = await Promise.all([
          asistenciaService.getAll(),
          estudianteService.getAll(),
          materiaService.getAll(),
        ]);
        setAsistencias(asistenciasData);
        setEstudiantes(estudiantesData);
        setMaterias(materiasData);
      }
    } catch {
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({
      estudiante_id: '',
      materia_id: '',
      fecha: new Date().toISOString().split('T')[0],
      presente: true,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (item: Asistencia) => {
    setEditingItem(item);
    setFormData({
      estudiante_id: item.estudiante_id.toString(),
      materia_id: item.materia_id.toString(),
      fecha: item.fecha,
      presente: item.presente,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (item: Asistencia) => {
    if (!confirm('¿Estás seguro de eliminar este registro de asistencia?')) return;

    try {
      await asistenciaService.delete(item.id);
      setSuccess('Asistencia eliminada correctamente');
      fetchData();
    } catch {
      setError('Error al eliminar la asistencia');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const data = {
        estudiante_id: parseInt(formData.estudiante_id),
        materia_id: parseInt(formData.materia_id),
        fecha: formData.fecha,
        presente: formData.presente,
      };

      if (user?.role === 'docente') {
        // Docentes usan el endpoint específico
        await docentePortalService.registrarAsistencia(data);
        setSuccess(editingItem ? 'Asistencia actualizada correctamente' : 'Asistencia registrada correctamente');
      } else {
        // Admin/Auxiliar usan endpoints generales
        if (editingItem) {
          await asistenciaService.update(editingItem.id, data);
          setSuccess('Asistencia actualizada correctamente');
        } else {
          await asistenciaService.create(data);
          setSuccess('Asistencia creada correctamente');
        }
      }

      setIsModalOpen(false);
      fetchData();
    } catch {
      setError('Error al guardar la asistencia');
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    {
      key: 'estudiante',
      label: 'Estudiante',
      render: (value: unknown) => (value as Estudiante)?.nombre || 'N/A',
    },
    {
      key: 'materia',
      label: 'Materia',
      render: (value: unknown) => (value as Materia)?.nombre || 'N/A',
    },
    {
      key: 'fecha',
      label: 'Fecha',
      render: (value: unknown) => new Date(value as string).toLocaleDateString(),
    },
    {
      key: 'presente',
      label: 'Estado',
      render: (value: unknown) => {
        const presente = value as boolean;
        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              presente ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {presente ? 'Presente' : 'Ausente'}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Asistencias</h1>
          <p className="text-gray-600 mt-2">Gestión de asistencias de estudiantes</p>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          + Registrar Asistencia
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

      <Card>
        <Table
          columns={columns}
          data={asistencias}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Editar Asistencia' : 'Nueva Asistencia'}
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">Estudiante</label>
            <select
              value={formData.estudiante_id}
              onChange={(e) => setFormData({ ...formData, estudiante_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Seleccionar estudiante</option>
              {estudiantes?.map((estudiante) => (
                <option key={estudiante.id} value={estudiante.id}>
                  {estudiante.nombre}
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

          <Input
            label="Fecha"
            type="date"
            value={formData.fecha}
            onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Estado</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={formData.presente === true}
                  onChange={() => setFormData({ ...formData, presente: true })}
                  className="w-4 h-4 text-blue-600"
                />
                <span>Presente</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={formData.presente === false}
                  onChange={() => setFormData({ ...formData, presente: false })}
                  className="w-4 h-4 text-blue-600"
                />
                <span>Ausente</span>
              </label>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
