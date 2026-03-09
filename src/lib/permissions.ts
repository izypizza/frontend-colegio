import { UserRole } from '@/src/types';

/**
 * Definición de permisos por módulo del sistema
 */
export const MODULE_PERMISSIONS: Record<string, Record<string, UserRole[]>> = {
  // Biblioteca
  biblioteca: {
    view: [UserRole.ADMIN, UserRole.BIBLIOTECARIO],
    create: [UserRole.ADMIN, UserRole.BIBLIOTECARIO],
    edit: [UserRole.ADMIN, UserRole.BIBLIOTECARIO],
    delete: [UserRole.ADMIN],
  },
  
  // Préstamos
  prestamos: {
    view: [UserRole.ADMIN, UserRole.BIBLIOTECARIO],
    create: [UserRole.ADMIN, UserRole.BIBLIOTECARIO],
    edit: [UserRole.ADMIN, UserRole.BIBLIOTECARIO],
    delete: [UserRole.ADMIN],
  },
  
  // Estudiantes
  estudiantes: {
    view: [UserRole.ADMIN, UserRole.AUXILIAR, UserRole.DOCENTE],
    create: [UserRole.ADMIN, UserRole.AUXILIAR],
    edit: [UserRole.ADMIN, UserRole.AUXILIAR],
    delete: [UserRole.ADMIN],
  },
  
  // Calificaciones
  calificaciones: {
    view: [UserRole.ADMIN, UserRole.AUXILIAR, UserRole.DOCENTE, UserRole.ESTUDIANTE, UserRole.PADRE],
    create: [UserRole.ADMIN, UserRole.AUXILIAR, UserRole.DOCENTE],
    edit: [UserRole.ADMIN, UserRole.AUXILIAR, UserRole.DOCENTE],
    delete: [UserRole.ADMIN],
  },
  
  // Asistencias
  asistencias: {
    view: [UserRole.ADMIN, UserRole.AUXILIAR, UserRole.DOCENTE, UserRole.ESTUDIANTE, UserRole.PADRE],
    create: [UserRole.ADMIN, UserRole.AUXILIAR, UserRole.DOCENTE],
    edit: [UserRole.ADMIN, UserRole.AUXILIAR, UserRole.DOCENTE],
    delete: [UserRole.ADMIN],
  },
  
  // Usuarios
  usuarios: {
    view: [UserRole.ADMIN],
    create: [UserRole.ADMIN],
    edit: [UserRole.ADMIN],
    delete: [UserRole.ADMIN],
  },
  
  // Permisos Auxiliares
  permisos: {
    view: [UserRole.ADMIN],
    create: [UserRole.ADMIN],
    edit: [UserRole.ADMIN],
    delete: [UserRole.ADMIN],
  },
  
  // Docentes
  docentes: {
    view: [UserRole.ADMIN, UserRole.AUXILIAR],
    create: [UserRole.ADMIN],
    edit: [UserRole.ADMIN],
    delete: [UserRole.ADMIN],
  },
  
  // Padres
  padres: {
    view: [UserRole.ADMIN, UserRole.AUXILIAR],
    create: [UserRole.ADMIN],
    edit: [UserRole.ADMIN],
    delete: [UserRole.ADMIN],
  },
  
  // Materias
  materias: {
    view: [UserRole.ADMIN, UserRole.AUXILIAR, UserRole.DOCENTE],
    create: [UserRole.ADMIN],
    edit: [UserRole.ADMIN],
    delete: [UserRole.ADMIN],
  },
  
  // Horarios
  horarios: {
    view: [UserRole.ADMIN, UserRole.AUXILIAR, UserRole.DOCENTE, UserRole.ESTUDIANTE, UserRole.PADRE],
    create: [UserRole.ADMIN, UserRole.AUXILIAR],
    edit: [UserRole.ADMIN, UserRole.AUXILIAR],
    delete: [UserRole.ADMIN],
  },
  
  // Secciones
  secciones: {
    view: [UserRole.ADMIN, UserRole.AUXILIAR],
    create: [UserRole.ADMIN],
    edit: [UserRole.ADMIN],
    delete: [UserRole.ADMIN],
  },
  
  // Grados
  grados: {
    view: [UserRole.ADMIN, UserRole.AUXILIAR, UserRole.DOCENTE],
    create: [UserRole.ADMIN],
    edit: [UserRole.ADMIN],
    delete: [UserRole.ADMIN],
  },
  
  // Períodos Académicos
  periodos: {
    view: [UserRole.ADMIN, UserRole.AUXILIAR, UserRole.DOCENTE, UserRole.ESTUDIANTE, UserRole.PADRE],
    create: [UserRole.ADMIN],
    edit: [UserRole.ADMIN],
    delete: [UserRole.ADMIN],
  },
};

export type ModuleName = string;
export type PermissionAction = 'view' | 'create' | 'edit' | 'delete';

/**
 * Verifica si un usuario tiene permiso para una acción en un módulo
 */
export function hasPermission(
  userRole: UserRole,
  module: ModuleName,
  action: PermissionAction = 'view'
): boolean {
  const modulePermissions = MODULE_PERMISSIONS[module];
  if (!modulePermissions) {
    console.warn(`Módulo "${module}" no tiene permisos definidos`);
    return false;
  }

  const allowedRoles = modulePermissions[action];
  return allowedRoles.includes(userRole);
}

/**
 * Obtiene los roles requeridos para una acción en un módulo
 */
export function getRequiredRoles(
  module: ModuleName,
  action: PermissionAction = 'view'
): UserRole[] {
  const modulePermissions = MODULE_PERMISSIONS[module];
  return modulePermissions?.[action] || [];
}

/**
 * Verifica si un error es de permisos (403)
 */
export function isForbiddenError(error: any): boolean {
  return error?.response?.status === 403 || error?.isForbidden === true;
}

/**
 * Extrae información de error de permisos
 */
export function getPermissionErrorInfo(error: any) {
  return {
    message: error?.message || 'No tiene permisos para esta acción',
    requiredRoles: error?.response?.data?.requiredRoles || [],
    userRole: error?.response?.data?.userRole || '',
  };
}
