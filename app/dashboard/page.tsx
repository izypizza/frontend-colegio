'use client';

import { Card } from '@/src/components/ui';
import { useEffect, useState } from 'react';
import { dashboardService } from '@/src/lib/services';
import type { DashboardStats } from '@/src/types/models';
import { useAuth } from '@/src/features/auth';
import { UserRole } from '@/src/types';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    estudiantes: 0,
    docentes: 0,
    padres: 0,
    materias: 0,
    secciones: 0,
    grados: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await dashboardService.getStats();
        setStats(data);
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  // Dashboard personalizado para docentes
  if (user?.role === UserRole.DOCENTE) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h1 className="text-3xl font-bold text-[#04ADBF]">Portal del Docente</h1>
          <p className="text-gray-600 mt-2">Bienvenido, {user.nombre}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/dashboard/docente/mis-clases">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Mis Clases</h3>
                <p className="text-gray-600 text-sm">Ver materias asignadas</p>
              </div>
            </Card>
          </Link>

          <Link href="/dashboard/docente/mis-estudiantes">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Mis Estudiantes</h3>
                <p className="text-gray-600 text-sm">Ver lista de estudiantes</p>
              </div>
            </Card>
          </Link>

          <Link href="/dashboard/calificaciones">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Calificaciones</h3>
                <p className="text-gray-600 text-sm">Registrar calificaciones</p>
              </div>
            </Card>
          </Link>

          <Link href="/dashboard/asistencias">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Asistencias</h3>
                <p className="text-gray-600 text-sm">Registrar asistencias</p>
              </div>
            </Card>
          </Link>

          <Link href="/dashboard/horarios">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Horarios</h3>
                <p className="text-gray-600 text-sm">Ver horarios de clases</p>
              </div>
            </Card>
          </Link>

          <Link href="/dashboard/elecciones">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Elecciones</h3>
                <p className="text-gray-600 text-sm">Gestionar elecciones</p>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    );
  }

  // Dashboard personalizado para estudiantes
  if (user?.role === UserRole.ESTUDIANTE) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h1 className="text-3xl font-bold text-[#04ADBF]">Portal del Estudiante</h1>
          <p className="text-gray-600 mt-2">Bienvenido, {user.nombre}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/dashboard/estudiante/mis-calificaciones">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Mis Calificaciones</h3>
                <p className="text-gray-600 text-sm">Ver mis notas</p>
              </div>
            </Card>
          </Link>

          <Link href="/dashboard/estudiante/mis-asistencias">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Mis Asistencias</h3>
                <p className="text-gray-600 text-sm">Ver mi asistencia</p>
              </div>
            </Card>
          </Link>

          <Link href="/dashboard/horarios">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Horarios</h3>
                <p className="text-gray-600 text-sm">Ver mi horario</p>
              </div>
            </Card>
          </Link>

          <Link href="/dashboard/elecciones">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Elecciones</h3>
                <p className="text-gray-600 text-sm">Participar en votaciones</p>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    );
  }

  // Dashboard personalizado para padres
  if (user?.role === UserRole.PADRE) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h1 className="text-3xl font-bold text-[#04ADBF]">Portal del Padre de Familia</h1>
          <p className="text-gray-600 mt-2">Bienvenido, {user.nombre}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/dashboard/padre/mis-hijos">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Mis Hijos</h3>
                <p className="text-gray-600 text-sm">Ver información de mis hijos</p>
              </div>
            </Card>
          </Link>

          <Link href="/dashboard/padre/calificaciones">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Calificaciones</h3>
                <p className="text-gray-600 text-sm">Ver calificaciones de mis hijos</p>
              </div>
            </Card>
          </Link>

          <Link href="/dashboard/horarios">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Horarios</h3>
                <p className="text-gray-600 text-sm">Ver horarios de clases</p>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    );
  }

  // Dashboard para admin/auxiliar (original)
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#04ADBF]">Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Institución Educativa N° 51006 Túpac Amaru</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin inline-block w-10 h-10 border-4 border-[#04ADBF] border-t-transparent rounded-full"></div>
          <p className="mt-4 text-gray-600">Cargando estadísticas...</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <Card hover>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-[#04ADBF]/10 rounded-lg flex-shrink-0">
                  <svg
                    className="w-6 h-6 sm:w-8 sm:h-8 text-[#04ADBF]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Estudiantes</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.estudiantes}</p>
                </div>
              </div>
            </Card>

            <Card hover>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-green-100 rounded-lg flex-shrink-0">
                  <svg
                    className="w-6 h-6 sm:w-8 sm:h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Docentes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.docentes}</p>
                </div>
              </div>
            </Card>

            <Card hover>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <svg
                    className="w-8 h-8 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Materias</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.materias}</p>
                </div>
              </div>
            </Card>

            <Card hover>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <svg
                    className="w-8 h-8 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Secciones</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.secciones}</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card hover>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-pink-100 rounded-lg">
                  <svg
                    className="w-8 h-8 text-pink-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Padres</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.padres}</p>
                </div>
              </div>
            </Card>

            <Card hover>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <svg
                    className="w-8 h-8 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Grados</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.grados}</p>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Actividad Reciente</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3 pb-4 border-b">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-gray-900">Nueva calificación registrada</p>
                <p className="text-sm text-gray-500">Matemática - 5° Secundaria A</p>
                <p className="text-xs text-gray-400 mt-1">Hace 2 horas</p>
              </div>
            </div>
            <div className="flex items-start gap-3 pb-4 border-b">
              <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-gray-900">Asistencia completada</p>
                <p className="text-sm text-gray-500">3° Primaria B</p>
                <p className="text-xs text-gray-400 mt-1">Hace 4 horas</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-gray-900">Nuevo estudiante registrado</p>
                <p className="text-sm text-gray-500">1° Secundaria C</p>
                <p className="text-xs text-gray-400 mt-1">Hace 1 día</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Próximos Eventos</h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-blue-900">Reunión de Padres</p>
                <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">
                  Próximo
                </span>
              </div>
              <p className="text-sm text-blue-700">Viernes, 15 de Diciembre</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-green-900">Examen Final</p>
                <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                  En 1 semana
                </span>
              </div>
              <p className="text-sm text-green-700">Lunes, 18 de Diciembre</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-purple-900">Clausura del Año</p>
                <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded">
                  En 2 semanas
                </span>
              </div>
              <p className="text-sm text-purple-700">Viernes, 22 de Diciembre</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
