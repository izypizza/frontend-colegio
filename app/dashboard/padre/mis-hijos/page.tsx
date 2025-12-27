'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/src/components/ui';
import { padrePortalService } from '@/src/lib/services';
import Link from 'next/link';

interface Estudiante {
  id: number;
  nombre: string;
  apellido: string;
  codigo: string;
  email: string;
  seccion: {
    nombre: string;
    grado: {
      nombre: string;
      nivel: string;
    };
  };
}

export default function MisHijosPage() {
  const [loading, setLoading] = useState(true);
  const [hijos, setHijos] = useState<Estudiante[]>([]);

  useEffect(() => {
    fetchHijos();
  }, []);

  const fetchHijos = async () => {
    try {
      setLoading(true);
      const response = await padrePortalService.misHijos();
      setHijos(response.hijos || []);
    } catch (error) {
      console.error('Error al cargar hijos:', error);
    } finally {
      setLoading(false);
    }
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
        <h1 className="text-3xl font-bold text-gray-900">Mis Hijos</h1>
        <p className="text-gray-600 mt-2">Información de tus hijos matriculados</p>
      </div>

      {hijos.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-gray-500">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p className="text-lg">No tienes estudiantes asociados a tu cuenta</p>
            <p className="text-sm mt-2">Contacta con la administración si esto es un error</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hijos.map((hijo) => (
            <Card key={hijo.id} className="hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Avatar */}
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
                    <span className="text-white text-2xl font-bold">
                      {hijo.nombre.charAt(0)}
                    </span>
                  </div>

                  {/* Información básica */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {hijo.nombre}
                  </h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      Grado: <span className="font-semibold ml-1">{hijo.seccion.grado.nombre}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Sección: <span className="font-semibold ml-1">{hijo.seccion.nombre}</span>
                    </div>
                  </div>

                  {/* Nivel académico badge */}
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-4">
                    {hijo.seccion.grado.nivel}
                  </span>

                  {/* Enlaces de acción */}
                  <div className="space-y-2 pt-4 border-t">
                    <Link
                      href={`/dashboard/padre/calificaciones`}
                      className="flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm group"
                    >
                      <svg className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Ver Calificaciones
                    </Link>
                    <Link
                      href={`/dashboard/padre/asistencias/${hijo.id}`}
                      className="flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm group"
                    >
                      <svg className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Ver Asistencias
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
