'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/src/components/ui';
import { padrePortalService, periodoService } from '@/src/lib/services';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  LineChart,
  Line
} from 'recharts';

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
      // Manejar diferentes estructuras de respuesta
      const periodosData = response.data?.data || response.data || response;
      setPeriodos(periodosData);
      
      if (periodosData.length > 0) {
        setSelectedPeriodo(periodosData[0].id);
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

  // Preparar datos para gráficas de cada hijo
  const prepararDatosHijo = (hijo: Estudiante) => {
    if (!hijo.calificaciones || hijo.calificaciones.length === 0) return null;

    // Datos para gráfico de barras
    const barData = hijo.calificaciones.map(c => ({
      materia: c.materia.nombre.length > 15 ? c.materia.nombre.substring(0, 15) + '...' : c.materia.nombre,
      nota: c.nota,
      nombreCompleto: c.materia.nombre
    }));

    // Datos para gráfico de radar
    const radarData = hijo.calificaciones.map(c => ({
      materia: c.materia.nombre.length > 12 ? c.materia.nombre.substring(0, 12) + '...' : c.materia.nombre,
      nota: c.nota
    }));

    return { barData, radarData };
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
            const graficasData = prepararDatosHijo(hijo);
            
            return (
              <Card key={hijo.id}>
                {/* Encabezado del hijo */}
                <div className="border-b pb-4 mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {hijo.nombre} {hijo.apellido}
                      </h2>
                      <p className="text-gray-600 mt-1">
                        {hijo.seccion.grado.nombre} - Sección {hijo.seccion.nombre}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">Código: {hijo.codigo}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 mb-1">Promedio General</p>
                      <p className={`text-4xl font-bold ${getNotaColor(promedio)}`}>
                        {promedio.toFixed(2)}
                      </p>
                      <div className="mt-2 flex gap-4 text-xs">
                        <div>
                          <span className="text-gray-500">Aprobadas:</span>
                          <span className="ml-1 font-semibold text-green-600">
                            {hijo.calificaciones?.filter(c => c.nota >= 11).length || 0}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Reprobadas:</span>
                          <span className="ml-1 font-semibold text-red-600">
                            {hijo.calificaciones?.filter(c => c.nota < 11).length || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Calificaciones */}
                {!hijo.calificaciones || hijo.calificaciones.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No hay calificaciones registradas en este periodo
                  </div>
                ) : (
                  <>
                    {/* Gráficas */}
                    {graficasData && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Gráfico de barras */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">📊 Notas por Materia</h3>
                          <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={graficasData.barData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis 
                                dataKey="materia" 
                                angle={-35}
                                textAnchor="end"
                                height={90}
                                fontSize={11}
                              />
                              <YAxis domain={[0, 20]} />
                              <Tooltip 
                                content={({ active, payload }) => {
                                  if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                      <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                                        <p className="font-semibold text-sm">{data.nombreCompleto}</p>
                                        <p className={`text-lg font-bold ${getNotaColor(data.nota)}`}>
                                          Nota: {data.nota.toFixed(2)}
                                        </p>
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                              />
                              <Bar dataKey="nota" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Gráfico de radar */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">🎯 Vista Comparativa</h3>
                          <ResponsiveContainer width="100%" height={250}>
                            <RadarChart data={graficasData.radarData}>
                              <PolarGrid />
                              <PolarAngleAxis dataKey="materia" fontSize={10} />
                              <PolarRadiusAxis domain={[0, 20]} />
                              <Radar 
                                name="Notas" 
                                dataKey="nota" 
                                stroke="#8B5CF6" 
                                fill="#8B5CF6" 
                                fillOpacity={0.6} 
                              />
                              <Legend />
                              <Tooltip />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}

                    {/* Tabla de calificaciones */}
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
                            <tr key={calificacion.id} className="hover:bg-gray-50">
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
                  </>
                )}

                {/* Enlaces a detalle */}
                <div className="mt-6 pt-4 border-t flex gap-4">
                  <Link
                    href={`/dashboard/padre/mis-hijos/${hijo.id}`}
                    className="flex items-center text-blue-600 hover:text-blue-700 font-medium group"
                  >
                    <svg className="w-4 h-4 mr-2 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Ver Perfil Completo
                  </Link>
                  <Link
                    href={`/dashboard/asistencias?estudiante=${hijo.id}`}
                    className="flex items-center text-blue-600 hover:text-blue-700 font-medium group"
                  >
                    <svg className="w-4 h-4 mr-2 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Ver Asistencias
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
