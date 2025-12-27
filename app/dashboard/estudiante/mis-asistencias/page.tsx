'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/src/components/ui';
import { estudiantePortalService } from '@/src/lib/services';

interface Asistencia {
  id: number;
  fecha: string;
  estado: string;
  observaciones?: string;
  materia: {
    id: number;
    nombre: string;
  };
}

interface AsistenciasData {
  asistencias: Asistencia[];
  estadisticas: {
    total: number;
    presentes: number;
    ausentes: number;
    porcentaje_asistencia: number;
  };
}

export default function MisAsistenciasPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AsistenciasData | null>(null);
  const [filtros, setFiltros] = useState({
    fecha_inicio: '',
    fecha_fin: '',
  });

  useEffect(() => {
    fetchAsistencias();
  }, []);

  const fetchAsistencias = async () => {
    try {
      setLoading(true);
      const params = {
        ...(filtros.fecha_inicio && { fecha_inicio: filtros.fecha_inicio }),
        ...(filtros.fecha_fin && { fecha_fin: filtros.fecha_fin }),
      };
      const response = await estudiantePortalService.misAsistencias(params);
      setData(response);
    } catch (error) {
      console.error('Error al cargar asistencias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltrar = () => {
    fetchAsistencias();
  };

  const getEstadoBadge = (estado: string) => {
    const estados: Record<string, { color: string; text: string }> = {
      presente: { color: 'bg-green-100 text-green-800', text: 'Presente' },
      ausente: { color: 'bg-red-100 text-red-800', text: 'Ausente' },
      tardanza: { color: 'bg-yellow-100 text-yellow-800', text: 'Tardanza' },
      justificado: { color: 'bg-blue-100 text-blue-800', text: 'Justificado' },
    };
    const { color, text } = estados[estado] || { color: 'bg-gray-100 text-gray-800', text: estado };
    return <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${color}`}>{text}</span>;
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
        <h1 className="text-3xl font-bold text-gray-900">Mis Asistencias</h1>
        <p className="text-gray-600 mt-2">Revisa tu registro de asistencias y puntualidad</p>
      </div>

      {/* Filtros */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={filtros.fecha_inicio}
              onChange={(e) => setFiltros({ ...filtros, fecha_inicio: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Fin
            </label>
            <input
              type="date"
              value={filtros.fecha_fin}
              onChange={(e) => setFiltros({ ...filtros, fecha_fin: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleFiltrar}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      </Card>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total</h3>
          <p className="text-3xl font-bold text-gray-900">{data?.estadisticas.total || 0}</p>
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Presentes</h3>
          <p className="text-3xl font-bold text-green-600">{data?.estadisticas.presentes || 0}</p>
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Ausentes</h3>
          <p className="text-3xl font-bold text-red-600">{data?.estadisticas.ausentes || 0}</p>
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-gray-500 mb-2">% Asistencia</h3>
          <p className={`text-3xl font-bold ${
            (data?.estadisticas.porcentaje_asistencia || 0) >= 80 ? 'text-green-600' : 'text-red-600'
          }`}>
            {data?.estadisticas.porcentaje_asistencia.toFixed(1) || 0}%
          </p>
        </Card>
      </div>

      {/* Tabla de asistencias */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Registro de Asistencias</h2>
        
        {!data?.asistencias || data.asistencias.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No se encontraron registros de asistencia
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Materia
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
                {data.asistencias.map((asistencia) => (
                  <tr key={asistencia.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatFecha(asistencia.fecha)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {asistencia.materia.nombre}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {getEstadoBadge(asistencia.estado)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {asistencia.observaciones || '-'}
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
