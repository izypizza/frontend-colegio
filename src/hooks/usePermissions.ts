import { useAuth } from '@/src/features/auth';
import { UserRole } from '@/src/types';
import { MODULE_PERMISSIONS } from '@/src/lib/permissions';

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete';

/**
 * Hook para verificar permisos del usuario en un módulo específico
 */
export const usePermissions = (module: string) => {
  const { user } = useAuth();

  /**
   * Verifica si el usuario tiene un permiso específico
   */
  const hasPermission = (action: PermissionAction): boolean => {
    if (!user) return false;
    
    const modulePermissions = MODULE_PERMISSIONS[module];
    if (!modulePermissions) return false;

    const allowedRoles = modulePermissions[action];
    if (!allowedRoles) return false;

    return allowedRoles.includes(user.role as UserRole);
  };

  /**
   * Verifica múltiples permisos a la vez
   */
  const hasAnyPermission = (actions: PermissionAction[]): boolean => {
    return actions.some(action => hasPermission(action));
  };

  /**
   * Verifica que tenga todos los permisos
   */
  const hasAllPermissions = (actions: PermissionAction[]): boolean => {
    return actions.every(action => hasPermission(action));
  };

  return {
    canView: hasPermission('view'),
    canCreate: hasPermission('create'),
    canEdit: hasPermission('edit'),
    canDelete: hasPermission('delete'),
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
};
