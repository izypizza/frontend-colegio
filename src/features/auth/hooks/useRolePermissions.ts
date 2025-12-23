import { UserRole } from '@/types';

/**
 * Hook para verificar permisos de acceso según el rol del usuario
 */
export const useRolePermissions = () => {
  /**
   * Verificar si el usuario tiene acceso administrativo (admin o auxiliar)
   */
  const hasAdminAccess = (userRole: UserRole): boolean => {
    return [UserRole.ADMIN, UserRole.AUXILIAR].includes(userRole);
  };

  /**
   * Verificar si el usuario tiene uno de los roles permitidos
   */
  const hasRole = (userRole: UserRole, allowedRoles: UserRole[]): boolean => {
    return allowedRoles.includes(userRole);
  };

  /**
   * Obtener permisos según el rol del usuario
   */
  const getPermissions = (userRole: UserRole) => {
    const permissions = {
      [UserRole.ADMIN]: {
        canManageUsers: true,
        canManageSystem: true,
        canViewReports: true,
        canManageRoles: true,
        canManageStudents: true,
        canManageGrades: true,
        canManageAttendance: true,
        canManageSchedules: true,
        canManageSubjects: true,
        canManageTeachers: true,
        canManageParents: true,
      },
      [UserRole.AUXILIAR]: {
        canManageUsers: false,
        canManageSystem: false,
        canViewReports: true,
        canManageRoles: false,
        canManageStudents: true,
        canManageGrades: true,
        canManageAttendance: true,
        canManageSchedules: true,
        canManageSubjects: false,
        canManageTeachers: false,
        canManageParents: false,
      },
      [UserRole.DOCENTE]: {
        canManageUsers: false,
        canManageSystem: false,
        canViewReports: true,
        canManageRoles: false,
        canManageStudents: false,
        canManageGrades: true, // Solo sus cursos
        canManageAttendance: true, // Solo sus cursos
        canManageSchedules: false,
        canManageSubjects: false,
        canManageTeachers: false,
        canManageParents: false,
      },
      [UserRole.PADRE]: {
        canManageUsers: false,
        canManageSystem: false,
        canViewReports: false,
        canManageRoles: false,
        canManageStudents: false,
        canManageGrades: false,
        canManageAttendance: false,
        canManageSchedules: false,
        canManageSubjects: false,
        canManageTeachers: false,
        canManageParents: false,
      },
      [UserRole.ESTUDIANTE]: {
        canManageUsers: false,
        canManageSystem: false,
        canViewReports: false,
        canManageRoles: false,
        canManageStudents: false,
        canManageGrades: false,
        canManageAttendance: false,
        canManageSchedules: false,
        canManageSubjects: false,
        canManageTeachers: false,
        canManageParents: false,
      },
    };

    return permissions[userRole];
  };

  /**
   * Obtener rutas accesibles según el rol
   */
  const getAccessibleRoutes = (userRole: UserRole) => {
    const routes = {
      [UserRole.ADMIN]: [
        '/dashboard',
        '/dashboard/estudiantes',
        '/dashboard/docentes',
        '/dashboard/padres',
        '/dashboard/grados',
        '/dashboard/secciones',
        '/dashboard/materias',
        '/dashboard/horarios',
        '/dashboard/calificaciones',
        '/dashboard/asistencias',
        '/dashboard/periodos',
      ],
      [UserRole.AUXILIAR]: [
        '/dashboard',
        '/dashboard/estudiantes',
        '/dashboard/calificaciones',
        '/dashboard/asistencias',
        '/dashboard/horarios',
      ],
      [UserRole.DOCENTE]: [
        '/dashboard',
        '/dashboard/calificaciones',
        '/dashboard/asistencias',
        '/dashboard/horarios',
      ],
      [UserRole.PADRE]: [
        '/dashboard',
        '/dashboard/calificaciones',
        '/dashboard/asistencias',
        '/dashboard/horarios',
      ],
      [UserRole.ESTUDIANTE]: [
        '/dashboard',
        '/dashboard/calificaciones',
        '/dashboard/asistencias',
        '/dashboard/horarios',
      ],
    };

    return routes[userRole] || [];
  };

  return {
    hasAdminAccess,
    hasRole,
    getPermissions,
    getAccessibleRoutes,
  };
};
