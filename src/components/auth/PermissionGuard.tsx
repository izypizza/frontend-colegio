'use client';

import { useAuth } from '@/src/features/auth/hooks/useAuth';
import { UserRole } from '@/src/types';
import { Alert } from '@/src/components/ui';
import { ReactNode } from 'react';

interface PermissionGuardProps {
  children: ReactNode;
  requiredRoles?: UserRole[];
  requiredPermissions?: string[];
  fallback?: ReactNode;
  showFallback?: boolean;
}

/**
 * Componente para proteger contenido según permisos del usuario
 * Verifica roles y muestra mensajes amigables si no tiene acceso
 */
export const PermissionGuard = ({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  fallback,
  showFallback = true,
}: PermissionGuardProps) => {
  const { user, loading } = useAuth();

  // Mientras carga, no mostrar nada
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Si no hay usuario autenticado
  if (!user) {
    return (
      <div className="p-6">
        <Alert
          type="warning"
          message="Debe iniciar sesión para acceder a este contenido."
        />
      </div>
    );
  }

  // Verificar si el usuario tiene uno de los roles requeridos
  const hasRequiredRole =
    requiredRoles.length === 0 || requiredRoles.includes(user.role as UserRole);

  if (!hasRequiredRole) {
    // Si hay un fallback personalizado, mostrarlo
    if (fallback) {
      return <>{fallback}</>;
    }

    // Si showFallback es false, no mostrar nada
    if (!showFallback) {
      return null;
    }

    // Mostrar mensaje de error por defecto
    return (
      <div className="p-6">
        <Alert
          type="error"
          message={`No tiene permisos para acceder a este contenido. Roles requeridos: ${requiredRoles.join(', ')}`}
        />
        <div className="mt-4 text-sm text-gray-600">
          <p>Su rol actual: <span className="font-semibold">{user.role}</span></p>
          <p className="mt-2">
            Si cree que debería tener acceso, contacte al administrador del sistema.
          </p>
        </div>
      </div>
    );
  }

  // Usuario tiene permisos, mostrar contenido
  return <>{children}</>;
};

/**
 * Componente para mostrar mensaje cuando no hay permisos
 */
export const NoPermission = ({ 
  message = "No tiene permisos para realizar esta acción",
  requiredRoles,
  currentRole 
}: { 
  message?: string; 
  requiredRoles?: string[]; 
  currentRole?: string;
}) => {
  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-yellow-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">{message}</h3>
          {(requiredRoles || currentRole) && (
            <div className="mt-2 text-sm text-yellow-700">
              {currentRole && <p>Su rol actual: <span className="font-semibold">{currentRole}</span></p>}
              {requiredRoles && requiredRoles.length > 0 && (
                <p className="mt-1">Roles requeridos: <span className="font-semibold">{requiredRoles.join(', ')}</span></p>
              )}
            </div>
          )}
          <p className="mt-2 text-sm text-yellow-700">
            Contacte al administrador si necesita acceso a esta funcionalidad.
          </p>
        </div>
      </div>
    </div>
  );
};
