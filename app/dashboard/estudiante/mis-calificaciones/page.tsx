'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/src/components/ui';
import { estudiantePortalService, periodoService } from '@/src/lib/services';
import { useAuth } from '@/src/features/auth';

interface Calificacion {
  id: number;
  nota: number;
  observaciones?: string;
  materia: {
    id: number;
    nombre: string;
  };
  periodo: {
    id: number;
    nombre: string;
  };
}

interface CalificacionesData {
  calificaciones: Calificacion[];
  promedio: number;
}

interface Periodo {
  id: number;
  nombre: string;
}

export default function MisCalificacionesPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CalificacionesData | null>(null);
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [selectedPeriodo, setSelectedPeriodo] = useState<number | null>(null);

  useEffect(() => {
    fetchPeriodos();
  }, []);

  useEffect(() => {
    if (selectedPeriodo) {
      fetchCalificaciones();
    }
  }, [selectedPeriodo]);

  const fetchPeriodos = async () => {
    try {
      const response = await periodoService.getAll();
      setPeriodos(response.data || response);
      if (response.data.data?.length > 0) {
        setSelectedPeriodo(response.data.data[0].id);
      }
    } catch (error) {
      console.error('Error al cargar periodos:', error);
    }
  };

  const fetchCalificaciones = async () => {
    try {
      setLoading(true);
      const response = await estudiantePortalService.misCalificaciones();
      const allCalificaciones = response.calificaciones || [];
      
      // Filtrar por periodo seleccionado
      const calificacionesFiltradas = selectedPeriodo 
        ? allCalificaciones.filter((c: Calificacion) => c.periodo.id === selectedPeriodo)
        : allCalificaciones;
      
      // Calcular promedio
      const promedio = calificacionesFiltradas.length > 0
        ? calificacionesFiltradas.reduce((sum: number, c: Calificacion) => sum + c.nota, 0) / calificacionesFiltradas.length
        : 0;
      
      setData({ calificaciones: calificacionesFiltradas, promedio });
    } catch (error) {
      console.error('Error al cargar calificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotaColor = (nota: number) => {
    if (nota >= 16) return 'text-green-600 font-bold';
    if (nota >= 13) return 'text-blue-600 font-semibold';
    if (nota >= 11) return 'text-yellow-600';
    return 'text-red-600 font-bold';
  };

  const getEstadoNota = (nota: number) => {
    if (nota >= 16) return 'Excelente';
    if (nota >= 13) return 'Bueno';
    if (nota >= 11) return 'Aprobado';
    return 'Reprobado';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mis Calificaciones</h1>
        <p className="text-gray-600 mt-2">Revisa tu rendimiento académico por periodo</p>
      </div>

      {/* Selector de periodo */}
      <div className="flex gap-2">
        {periodos.map((periodo) => (
          <button
            key={periodo.id}
            onClick={() => setSelectedPeriodo(periodo.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedPeriodo === periodo.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {periodo.nombre}
          </button>
        ))}
      </div>

      {/* Resumen de promedio */}
      <Card>
        <div className="text-center py-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Promedio General</h3>
          <div className={`text-5xl font-bold ${getNotaColor(data?.promedio || 0)}`}>
            {data?.promedio.toFixed(2) || '0.00'}
          </div>
          <p className={`text-lg mt-2 ${getNotaColor(data?.promedio || 0)}`}>
            {getEstadoNota(data?.promedio || 0)}
          </p>
        </div>
      </Card>

      {/* Tabla de calificaciones */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Calificaciones por Materia</h2>
        
        {!data?.calificaciones || data.calificaciones.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No tienes calificaciones registradas en este periodo
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Materia
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nota
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Observaciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.calificaciones.map((calificacion) => (
                  <tr key={calificacion.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {calificacion.materia.nombre}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`text-2xl ${getNotaColor(calificacion.nota)}`}>
                        {calificacion.nota.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        calificacion.nota >= 11 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {getEstadoNota(calificacion.nota)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {calificacion.observaciones || '-'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
