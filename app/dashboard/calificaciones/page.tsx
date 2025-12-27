'use client';

import { Alert, Button, Card, Input, Modal, Table } from '@/src/components/ui';
import {
    calificacionService,
    estudianteService,
    materiaService,
    periodoService,
    docentePortalService,
} from '@/src/lib/services';
import { Calificacion, Estudiante, Materia, PeriodoAcademico } from '@/src/types/models';
import { useEffect, useState } from 'react';
import { useAuth } from '@/src/features/auth';

export default function CalificacionesPage() {
  const { user } = useAuth();
  const [calificaciones, setCalificaciones] = useState<Calificacion[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [periodos, setPeriodos] = useState<PeriodoAcademico[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Calificacion | null>(null);
  const [formData, setFormData] = useState({
    estudiante_id: '',
    materia_id: '',
    periodo_academico_id: '',
    nota: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (user?.role === 'docente') {
        // Docentes usan endpoints del portal
        const [calificacionesData, estudiantesData, asignacionesData, periodosData] = await Promise.all([
          docentePortalService.misCalificaciones(),
          docentePortalService.misEstudiantes(),
          docentePortalService.misAsignaciones(),
          periodoService.getAll(),
        ]);
        
        console.log('Calificaciones:', calificacionesData);
        console.log('Estudiantes:', estudiantesData);
        console.log('Asignaciones:', asignacionesData);
        console.log('Periodos:', periodosData);
        
        setCalificaciones(calificacionesData.calificaciones || []);
        setEstudiantes(estudiantesData.estudiantes || []);
        // Extraer materias únicas usando Map
        const materiasMap = new Map();
        asignacionesData.asignaciones?.forEach((a: any) => {
          if (a.materia && !materiasMap.has(a.materia.id)) {
            materiasMap.set(a.materia.id, a.materia);
          }
        });
        const materiasUnicas = Array.from(materiasMap.values());
        console.log('Materias únicas:', materiasUnicas);
        setMaterias(materiasUnicas);
        setPeriodos(periodosData.data || periodosData);
      } else {
        // Admin/Auxiliar usan endpoints generales
        const [calificacionesData, estudiantesData, materiasData, periodosData] = await Promise.all([
          calificacionService.getAll(),
          estudianteService.getAll(),
          materiaService.getAll(),
          periodoService.getAll(),
        ]);
        setCalificaciones(calificacionesData);
        setEstudiantes(estudiantesData);
        setMaterias(materiasData);
        setPeriodos(periodosData);
      }
    } catch (err) {
      console.error('Error completo:', err);
      setError('Error al cargar los datos: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({
      estudiante_id: '',
      materia_id: '',
      periodo_academico_id: '',
      nota: '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (item: Calificacion) => {
    setEditingItem(item);
    setFormData({
      estudiante_id: item.estudiante_id.toString(),
      materia_id: item.materia_id.toString(),
      periodo_academico_id: item.periodo_academico_id.toString(),
      nota: item.nota.toString(),
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (item: Calificacion) => {
    if (!confirm('¿Estás seguro de eliminar esta calificación?')) return;

    try {
      await calificacionService.delete(item.id);
      setSuccess('Calificación eliminada correctamente');
      fetchData();
    } catch {
      setError('Error al eliminar la calificación');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const data = {
        estudiante_id: parseInt(formData.estudiante_id),
        materia_id: parseInt(formData.materia_id),
        periodo_academico_id: parseInt(formData.periodo_academico_id),
        nota: parseFloat(formData.nota),
      };

      if (user?.role === 'docente') {
        // Docentes usan el endpoint específico
        await docentePortalService.registrarCalificacion(data);
        setSuccess(editingItem ? 'Calificación actualizada correctamente' : 'Calificación registrada correctamente');
      } else {
        // Admin/Auxiliar usan endpoints generales
        if (editingItem) {
          await calificacionService.update(editingItem.id, data);
          setSuccess('Calificación actualizada correctamente');
        } else {
          await calificacionService.create(data);
          setSuccess('Calificación creada correctamente');
        }
      }

      setIsModalOpen(false);
      fetchData();
    } catch {
      setError('Error al guardar la calificación');
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
      key: 'periodo_academico',
      label: 'Periodo',
      render: (value: unknown) => (value as PeriodoAcademico)?.nombre || 'N/A',
    },
    {
      key: 'nota',
      label: 'Nota',
      render: (value: unknown) => {
        const nota = value as number;
        return (
          <span className={`font-bold ${nota >= 14 ? 'text-green-600' : nota >= 11 ? 'text-yellow-600' : 'text-red-600'}`}>
            {nota}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calificaciones</h1>
          <p className="text-gray-600 mt-2">Gestión de calificaciones de estudiantes</p>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          + Nueva Calificación
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

      <Card>
        <Table
          columns={columns}
          data={calificaciones}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Editar Calificación' : 'Nueva Calificación'}
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

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Periodo Académico</label>
            <select
              value={formData.periodo_academico_id}
              onChange={(e) => setFormData({ ...formData, periodo_academico_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Seleccionar periodo</option>
              {periodos?.map((periodo) => (
                <option key={periodo.id} value={periodo.id}>
                  {periodo.nombre}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Nota (0-20)"
            type="number"
            min="0"
            max="20"
            step="0.5"
            value={formData.nota}
            onChange={(e) => setFormData({ ...formData, nota: e.target.value })}
            required
          />
        </form>
      </Modal>
    </div>
  );
}
