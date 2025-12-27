'use client';

import { useState, useEffect } from 'react';
import { prestamoLibroService, libroService } from '@/src/lib/services';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Modal } from '@/src/components/ui/Modal';
import { Table } from '@/src/components/ui/Table';
import { Alert } from '@/src/components/ui/Alert';

interface Prestamo {
  id: number;
  libro_id: number;
  user_id: number;
  fecha_prestamo: string;
  fecha_devolucion: string;
  devuelto: boolean;
  libro?: {
    id: number;
    titulo: string;
    autor: string;
  };
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

interface Libro {
  id: number;
  titulo: string;
  autor: string;
  disponible: boolean;
}

export default function PrestamosPage() {
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [librosDisponibles, setLibrosDisponibles] = useState<Libro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    libro_id: '',
    user_id: '',
    fecha_devolucion: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prestamosData, librosData] = await Promise.all([
        prestamoLibroService.getAll(),
        libroService.getAll(),
      ]);
      
      setPrestamos(Array.isArray(prestamosData) ? prestamosData : []);
      
      const disponibles = Array.isArray(librosData)
        ? librosData.filter((libro: Libro) => libro.disponible)
        : [];
      setLibrosDisponibles(disponibles);
      
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        libro_id: Number(formData.libro_id),
        user_id: Number(formData.user_id),
        fecha_devolucion: formData.fecha_devolucion,
      };

      await prestamoLibroService.create(data);
      setSuccess('Préstamo registrado exitosamente');
      setShowModal(false);
      resetForm();
      loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al registrar el préstamo');
    }
  };

  const handleDevolver = async (id: number) => {
    if (!confirm('¿Confirmar devolución del libro?')) return;
    
    try {
      await prestamoLibroService.devolver(id);
      setSuccess('Libro devuelto exitosamente');
      loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al devolver el libro');
    }
  };

  const resetForm = () => {
    setFormData({
      libro_id: '',
      user_id: '',
      fecha_devolucion: '',
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const columns = [
    {
      key: 'libro',
      label: 'Libro',
      render: (prestamo: Prestamo) => prestamo.libro?.titulo || '-',
    },
    {
      key: 'autor',
      label: 'Autor',
      render: (prestamo: Prestamo) => prestamo.libro?.autor || '-',
    },
    {
      key: 'user',
      label: 'Usuario',
      render: (prestamo: Prestamo) => prestamo.user?.name || '-',
    },
    {
      key: 'fecha_prestamo',
      label: 'Fecha Préstamo',
      render: (prestamo: Prestamo) => new Date(prestamo.fecha_prestamo).toLocaleDateString(),
    },
    {
      key: 'fecha_devolucion',
      label: 'Fecha Devolución',
      render: (prestamo: Prestamo) => new Date(prestamo.fecha_devolucion).toLocaleDateString(),
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (prestamo: Prestamo) => {
        const hoy = new Date();
        const fechaDevolucion = new Date(prestamo.fecha_devolucion);
        const atrasado = !prestamo.devuelto && hoy > fechaDevolucion;
        
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              prestamo.devuelto
                ? 'bg-green-100 text-green-800'
                : atrasado
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {prestamo.devuelto ? 'Devuelto' : atrasado ? 'Atrasado' : 'Activo'}
          </span>
        );
      },
    },
  ];

  const customActions = (prestamo: Prestamo) => {
    if (!prestamo.devuelto) {
      return (
        <Button
          variant="primary"
          size="small"
          onClick={() => handleDevolver(prestamo.id)}
        >
          Devolver
        </Button>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Préstamos</h1>
        <Button onClick={() => setShowModal(true)}>+ Nuevo Préstamo</Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-[#04ADBF]">
              {prestamos.filter((p) => !p.devuelto).length}
            </div>
            <div className="text-gray-600">Préstamos Activos</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {prestamos.filter((p) => p.devuelto).length}
            </div>
            <div className="text-gray-600">Devoluciones</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-[#F22727]">
              {
                prestamos.filter((p) => {
                  if (p.devuelto) return false;
                  const hoy = new Date();
                  const fechaDevolucion = new Date(p.fecha_devolucion);
                  return hoy > fechaDevolucion;
                }).length
              }
            </div>
            <div className="text-gray-600">Préstamos Atrasados</div>
          </div>
        </Card>
      </div>

      {/* Tabla de préstamos */}
      <Card>
        <Table
          columns={columns}
          data={prestamos}
          customActions={customActions}
          hideEdit
          hideDelete
        />
      </Card>

      {/* Modal de formulario */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title="Nuevo Préstamo"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Libro *
            </label>
            <select
              value={formData.libro_id}
              onChange={(e) => setFormData({ ...formData, libro_id: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            >
              <option value="">Seleccionar libro</option>
              {librosDisponibles.map((libro) => (
                <option key={libro.id} value={libro.id}>
                  {libro.titulo} - {libro.autor}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID de Usuario *
            </label>
            <input
              type="number"
              value={formData.user_id}
              onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Ingrese el ID del usuario que solicita el préstamo
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Devolución *
            </label>
            <input
              type="date"
              value={formData.fecha_devolucion}
              onChange={(e) => setFormData({ ...formData, fecha_devolucion: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit">Registrar Préstamo</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
