'use client';

import { Alert, Button, Card, Input, Modal, Table } from '@/src/components/ui';
import { apiClient } from '@/src/lib/api-client';
import { useEffect, useState } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuxiliarPermiso {
  id: number;
  user_id: number;
  puede_editar_estudiantes: boolean;
  puede_editar_asistencias: boolean;
  puede_editar_calificaciones: boolean;
  activado_hasta: string | null;
  activado_por: string | null;
  motivo: string | null;
  user?: User;
  esta_activo?: boolean;
}

export default function PermisosAuxiliaresPage() {
  const [permisos, setPermisos] = useState<AuxiliarPermiso[]>([]);
  const [auxiliares, setAuxiliares] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    user_id: '',
    puede_editar_estudiantes: false,
    puede_editar_asistencias: false,
    puede_editar_calificaciones: false,
    activado_hasta: '',
    motivo: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [permisosData, usersData] = await Promise.all([
        apiClient.get('/auxiliar-permisos'),
        apiClient.get('/auxiliares'),
      ]);
      setPermisos(permisosData as AuxiliarPermiso[]);
      const usersResponse = usersData as { auxiliares?: User[] };
      setAuxiliares(usersResponse.auxiliares || []);
    } catch (err) {
      setError('Error al cargar los permisos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedUserId(null);
    // Fecha por defecto: 7 días desde hoy
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 7);
    const formattedDate = defaultDate.toISOString().slice(0, 16);
    
    setFormData({
      user_id: '',
      puede_editar_estudiantes: false,
      puede_editar_asistencias: false,
      puede_editar_calificaciones: false,
      activado_hasta: formattedDate,
      motivo: '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (permiso: AuxiliarPermiso) => {
    setSelectedUserId(permiso.user_id);
    setFormData({
      user_id: permiso.user_id.toString(),
      puede_editar_estudiantes: permiso.puede_editar_estudiantes,
      puede_editar_asistencias: permiso.puede_editar_asistencias,
      puede_editar_calificaciones: permiso.puede_editar_calificaciones,
      activado_hasta: permiso.activado_hasta 
        ? new Date(permiso.activado_hasta).toISOString().slice(0, 16)
        : '',
      motivo: permiso.motivo || '',
    });
    setIsModalOpen(true);
  };

  const handleDesactivar = async (userId: number) => {
    if (!confirm('¿Desactivar todos los permisos especiales de este auxiliar?')) return;

    try {
      await apiClient.delete(`/auxiliar-permisos/${userId}`);
      setSuccess('Permisos desactivados correctamente');
      fetchData();
    } catch (err) {
      setError('Error al desactivar los permisos');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.puede_editar_estudiantes && 
        !formData.puede_editar_asistencias && 
        !formData.puede_editar_calificaciones) {
      setError('Debe seleccionar al menos un permiso');
      return;
    }

    try {
      await apiClient.post('/auxiliar-permisos', {
        ...formData,
        user_id: parseInt(formData.user_id),
      });

      setSuccess('Permisos configurados exitosamente');
      setIsModalOpen(false);
      fetchData();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } }).response;
        if (response?.data?.errors) {
          const firstError = Object.values(response.data.errors)[0];
          setError(Array.isArray(firstError) ? firstError[0] : firstError);
        } else if (response?.data?.message) {
          setError(response.data.message);
        } else {
          setError('Error al configurar los permisos');
        }
      } else {
        setError('Error al configurar los permisos');
      }
    }
  };

  const columns = [
    { 
      key: 'user', 
      label: 'Auxiliar',
      render: (value: unknown, item: AuxiliarPermiso) => item.user?.name || `Usuario #${item.user_id}`
    },
    { 
      key: 'puede_editar_estudiantes', 
      label: 'Editar Estudiantes',
      render: (value: unknown) => (value as boolean) ? '✅' : '❌'
    },
    { 
      key: 'puede_editar_asistencias', 
      label: 'Editar Asistencias',
      render: (value: unknown) => (value as boolean) ? '✅' : '❌'
    },
    { 
      key: 'puede_editar_calificaciones', 
      label: 'Editar Calificaciones',
      render: (value: unknown) => (value as boolean) ? '✅' : '❌'
    },
    { 
      key: 'activado_hasta', 
      label: 'Válido Hasta',
      render: (value: unknown) => {
        if (!value) return 'Sin expiración';
        const fecha = new Date(value as string);
        const ahora = new Date();
        const estaActivo = fecha > ahora;
        return (
          <span className={estaActivo ? 'text-green-600' : 'text-red-600'}>
            {fecha.toLocaleDateString('es-PE')} {fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
          </span>
        );
      }
    },
    { 
      key: 'motivo', 
      label: 'Motivo',
      render: (value: unknown) => (value as string | null) || '-'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Permisos Especiales para Auxiliares</h1>
          <p className="text-gray-600 mt-2">Gestión de permisos temporales para auxiliares</p>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          + Configurar Permiso
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

      <Card>
        <Table
          columns={columns}
          data={permisos}
          loading={loading}
          onEdit={handleEdit}
          onDelete={(item: AuxiliarPermiso) => handleDesactivar(item.user_id)}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedUserId ? 'Editar Permisos' : 'Configurar Permisos'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Auxiliar *
            </label>
            <select
              value={formData.user_id}
              onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
              required
              disabled={!!selectedUserId}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar auxiliar</option>
              {auxiliares.map(aux => (
                <option key={aux.id} value={aux.id}>
                  {aux.name} - {aux.email}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Permisos a Otorgar *
            </label>
            <div className="space-y-2 bg-gray-50 p-3 rounded-md">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.puede_editar_estudiantes}
                  onChange={(e) => setFormData({ ...formData, puede_editar_estudiantes: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Puede editar estudiantes</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.puede_editar_asistencias}
                  onChange={(e) => setFormData({ ...formData, puede_editar_asistencias: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Puede editar asistencias</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.puede_editar_calificaciones}
                  onChange={(e) => setFormData({ ...formData, puede_editar_calificaciones: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Puede editar calificaciones</span>
              </label>
            </div>
          </div>

          <Input
            label="Válido Hasta (opcional)"
            type="datetime-local"
            value={formData.activado_hasta}
            onChange={(e) => setFormData({ ...formData, activado_hasta: e.target.value })}
            helperText="Dejar vacío para permiso sin fecha de expiración"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motivo del Permiso Especial *
            </label>
            <textarea
              value={formData.motivo}
              onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
              required
              rows={3}
              maxLength={500}
              placeholder="Ej: Secretaria de licencia médica por una semana"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.motivo.length}/500 caracteres
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Guardar Permisos
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
