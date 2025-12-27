'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/src/components/ui';
import { padrePortalService, periodoService } from '@/src/lib/services';
import Link from 'next/link';

interface Estudiante {
  id: number;
  nombre: string;
  apellido: string;
  codigo: string;
  seccion: {
    nombre: string;
    grado: {
      nombre: string;
    };
  };
  calificaciones?: Calificacion[];
}

interface Calificacion {
  id: number;
  nota: number;
  materia: {
    nombre: string;
  };
  periodo: {
    id: number;
    nombre: string;
  };
}

interface Periodo {
  id: number;
  nombre: string;
}

export default function CalificacionesHijosPage() {
  const [loading, setLoading] = useState(true);
  const [hijos, setHijos] = useState<Estudiante[]>([]);
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [selectedPeriodo, setSelectedPeriodo] = useState<number | null>(null);

  useEffect(() => {
    fetchPeriodos();
    fetchCalificaciones();
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
      const response = await padrePortalService.calificacionesHijos();
      const hijosData = response.hijos || [];
      
      // Filtrar calificaciones por periodo
      const hijosConCalificaciones = hijosData.map((hijo: Estudiante) => ({
        ...hijo,
        calificaciones: selectedPeriodo
          ? (hijo.calificaciones || []).filter(c => c.periodo.id === selectedPeriodo)
          : hijo.calificaciones || [],
      }));
      
      setHijos(hijosConCalificaciones);
    } catch (error) {
      console.error('Error al cargar calificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularPromedio = (calificaciones: Calificacion[]) => {
    if (calificaciones.length === 0) return 0;
    const suma = calificaciones.reduce((acc, c) => acc + c.nota, 0);
    return suma / calificaciones.length;
  };

  const getNotaColor = (nota: number) => {
    if (nota >= 16) return 'text-green-600';
    if (nota >= 13) return 'text-blue-600';
    if (nota >= 11) return 'text-yellow-600';
    return 'text-red-600';
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
        <h1 className="text-3xl font-bold text-gray-900">Calificaciones de mis Hijos</h1>
        <p className="text-gray-600 mt-2">Revisa el rendimiento académico de tus hijos</p>
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

      {/* Tarjetas de hijos */}
      {hijos.length === 0 ? (
        <Card>
          <div className="text-center py-8 text-gray-500">
            No se encontraron estudiantes asociados a tu cuenta
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {hijos.map((hijo) => {
            const promedio = calcularPromedio(hijo.calificaciones || []);
            
            return (
              <Card key={hijo.id}>
                {/* Encabezado del hijo */}
                <div className="border-b pb-4 mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {hijo.nombre}
                      </h2>
                      <p className="text-gray-600 mt-1">
                        {hijo.seccion.grado.nombre} - {hijo.seccion.nombre}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 mb-1">Promedio</p>
                      <p className={`text-4xl font-bold ${getNotaColor(promedio)}`}>
                        {promedio.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Calificaciones */}
                {!hijo.calificaciones || hijo.calificaciones.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No hay calificaciones registradas en este periodo
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
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {hijo.calificaciones.map((calificacion) => (
                          <tr key={calificacion.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {calificacion.materia.nombre}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className={`text-2xl font-bold ${getNotaColor(calificacion.nota)}`}>
                                {calificacion.nota.toFixed(2)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                calificacion.nota >= 11 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {calificacion.nota >= 11 ? 'Aprobado' : 'Reprobado'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Enlaces a detalle */}
                <div className="mt-4 pt-4 border-t flex gap-4">
                  <Link
                    href={`/dashboard/padre/asistencias/${hijo.id}`}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Ver Asistencias →
                  </Link>
                  <Link
                    href={`/dashboard/padre/boletin/${hijo.id}`}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Ver Boletín Completo →
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
