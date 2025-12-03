'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useRequireAuth } from '@/app/hooks/useAuth';
import { Button, Card } from '@/app/components/common';
import { ROUTES } from '@/app/constants';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useRequireAuth();
  const { user, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin inline-block">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push(ROUTES.LOGIN);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 text-sm mt-1">Bienvenido, {user?.name}</p>
          </div>
          <Button variant="danger" onClick={handleLogout}>
            Cerrar Sesión
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info Card */}
        <Card className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Información de Usuario</h2>
              <div className="space-y-1 text-gray-600">
                <p><strong>Nombre:</strong> {user?.name}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Rol:</strong> {user?.role}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-center">
              <div className="text-4xl mb-2">👥</div>
              <h3 className="font-semibold text-gray-900 mb-1">Estudiantes</h3>
              <p className="text-sm text-gray-600">Gestionar estudiantes</p>
            </div>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-center">
              <div className="text-4xl mb-2">👨‍🏫</div>
              <h3 className="font-semibold text-gray-900 mb-1">Docentes</h3>
              <p className="text-sm text-gray-600">Gestionar docentes</p>
            </div>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-center">
              <div className="text-4xl mb-2">📚</div>
              <h3 className="font-semibold text-gray-900 mb-1">Materias</h3>
              <p className="text-sm text-gray-600">Gestionar materias</p>
            </div>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-center">
              <div className="text-4xl mb-2">📅</div>
              <h3 className="font-semibold text-gray-900 mb-1">Horario</h3>
              <p className="text-sm text-gray-600">Ver horarios</p>
            </div>
          </Card>
        </div>

        {/* Getting Started */}
        <Card className="mt-6 bg-blue-50 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Comenzar</h3>
          <p className="text-blue-700 mb-4">
            Este es tu panel de control. Aquí puedes acceder a todas las funciones del sistema.
          </p>
          <div className="space-y-2">
            <p className="text-sm text-blue-700">✓ Sistema de autenticación completado</p>
            <p className="text-sm text-blue-700">✓ Rutas protegidas configuradas</p>
            <p className="text-sm text-blue-700">✓ Componentes reutilizables listos</p>
          </div>
        </Card>
      </main>
    </div>
  );
}
