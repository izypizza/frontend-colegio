'use client';

import { useAuth } from '@/src/features/auth/hooks/useAuth';
import { useRolePermissions } from '@/src/features/auth/hooks/useRolePermissions';
import { UserRole } from '@/src/types';
import { ReactNode } from 'react';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallback?: ReactNode;
}

/**
 * Componente para proteger contenido según el rol del usuario
 * 
 * @example
 * // Solo admin puede ver el botón
 * <RoleGuard allowedRoles={[UserRole.ADMIN]}>
 *   <button>Eliminar todo</button>
 * </RoleGuard>
 * 
 * @example
 * // Admin o auxiliar pueden ver la sección
 * <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.AUXILIAR]}>
 *   <AdminPanel />
 * </RoleGuard>
 * 
 * @example
 * // Con fallback personalizado
 * <RoleGuard 
 *   allowedRoles={[UserRole.ADMIN]} 
 *   fallback={<p>No tienes permisos</p>}
 * >
 *   <SecretContent />
 * </RoleGuard>
 */
export const RoleGuard = ({ children, allowedRoles, fallback = null }: RoleGuardProps) => {
  const { user } = useAuth();
  const { hasRole } = useRolePermissions();

  if (!user) {
    return <>{fallback}</>;
  }

  if (!hasRole(user.role, allowedRoles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
