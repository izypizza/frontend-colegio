// User
export interface User {
  id: number;
  name: string;
  email: string;
  role:
    | "admin"
    | "auxiliar"
    | "docente"
    | "padre"
    | "estudiante"
    | "bibliotecario";
  is_active: boolean;
  created_at: string;
  persona?: any;
}

export interface PersonaSinUsuario {
  id: number;
  nombre_completo: string;
  dni: string;
  email?: string;
  seccion?: string;
  grado?: string;
  especialidad?: string;
  hijos_count?: number;
}

export interface CreateUserPayload {
  persona_id: number;
  persona_tipo: "estudiante" | "docente" | "padre" | "auxiliar";
  email: string;
  password: string;
  is_active?: boolean;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  is_active?: boolean;
}

// Estudiante
export interface Estudiante {
  id: number;
  user_id?: number;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  nombre_completo?: string; // Computed field from backend
  dni: string;
  fecha_nacimiento: string;
  direccion?: string;
  telefono?: string;
  seccion_id: number;
  estado?: "activo" | "suspendido" | "egresado";
  seccion?: Seccion;
  padres?: Padre[];
  created_at: string;
  updated_at: string;
}

// Docente
export interface Docente {
  id: number;
  user_id?: number;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  nombre_completo?: string; // Computed field from backend
  dni: string;
  email: string;
  telefono?: string;
  direccion?: string;
  especialidad?: string;
  created_at: string;
  updated_at: string;
}

// Padre
export interface Padre {
  id: number;
  user_id?: number;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  nombre_completo?: string; // Computed field from backend
  dni: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  ocupacion?: string;
  estudiantes?: Estudiante[];
  created_at: string;
  updated_at: string;
}

// Grado
export interface Grado {
  id: number;
  nombre: string;
  nivel?: string;
  created_at: string;
  updated_at: string;
}

// Seccion
export interface Seccion {
  id: number;
  nombre: string;
  grado_id: number;
  capacidad?: number;
  turno?: string;
  grado?: Grado;
  created_at: string;
  updated_at: string;
}

// Materia
export interface Materia {
  id: number;
  nombre: string;
  created_at: string;
  updated_at: string;
}

// Periodo Académico
export interface PeriodoAcademico {
  id: number;
  nombre: string;
  anio: number;
  fecha_inicio: string;
  fecha_fin: string;
  created_at: string;
  updated_at: string;
}

// Asignación Docente Materia
export interface AsignacionDocenteMateria {
  id: number;
  docente_id: number;
  materia_id: number;
  seccion_id: number;
  periodo_academico_id: number;
  docente?: Docente;
  materia?: Materia;
  seccion?: Seccion;
  periodo_academico?: PeriodoAcademico;
  created_at: string;
  updated_at: string;
}

// Horario
export interface Horario {
  id: number;
  seccion_id: number;
  materia_id: number;
  dia: string;
  hora_inicio: string;
  hora_fin: string;
  seccion?: Seccion;
  materia?: Materia;
  created_at: string;
  updated_at: string;
}

// Asistencia
export interface Asistencia {
  id: number;
  estudiante_id: number;
  materia_id: number;
  fecha: string;
  presente: boolean;
  estudiante?: Estudiante;
  materia?: Materia;
  created_at: string;
  updated_at: string;
}

// Calificación
export interface Calificacion {
  id: number;
  estudiante_id: number;
  materia_id: number;
  periodo_academico_id: number;
  nota: number;
  estudiante?: Estudiante;
  materia?: Materia;
  periodo_academico?: PeriodoAcademico;
  created_at: string;
  updated_at: string;
}

// Dashboard Stats
export interface DashboardStats {
  estudiantes: number;
  docentes: number;
  padres: number;
  materias: number;
  secciones: number;
  grados: number;
  asistencias_hoy?: number;
  calificaciones_pendientes?: number;
}
