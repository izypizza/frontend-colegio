// API base configuration
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
export const API_TIMEOUT = 60000; // 60 segundos para consultas con muchos datos

// Token storage keys
export const TOKEN_KEY = "auth_token";
export const REFRESH_TOKEN_KEY = "refresh_token";
export const USER_KEY = "user_data";

// Routes
export const ROUTES = {
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  HOME: "/",
  STUDENTS: "/dashboard/estudiantes",
  TEACHERS: "/dashboard/docentes",
  SUBJECTS: "/dashboard/materias",
  SCHEDULE: "/dashboard/horarios",
  GRADES: "/dashboard/calificaciones",
  ATTENDANCE: "/dashboard/asistencias",
  SETTINGS: "/dashboard/configuracion",
} as const;

// HTTP Status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
} as const;

// User roles
export const ROLES = {
  ADMIN: "admin",
  DOCENTE: "docente",
  AUXILIAR: "auxiliar",
  PADRE: "padre",
  ESTUDIANTE: "estudiante",
  BIBLIOTECARIO: "bibliotecario",
} as const;

// Role labels in Spanish
export const ROLE_LABELS = {
  admin: "Administrador",
  docente: "Docente",
  auxiliar: "Auxiliar",
  padre: "Padre de Familia",
  estudiante: "Estudiante",
  bibliotecario: "Bibliotecario",
} as const;

// Elección states
export const ELECCION_ESTADOS = {
  PENDIENTE: "pendiente",
  ACTIVA: "activa",
  CERRADA: "cerrada",
} as const;

export const ELECCION_ESTADO_LABELS = {
  pendiente: "Pendiente",
  activa: "Activa",
  cerrada: "Cerrada",
} as const;

// Especialidades de docentes
export const ESPECIALIDADES = [
  "Matemáticas",
  "Comunicación",
  "Ciencias Sociales",
  "Ciencia y Tecnología",
  "Educación Física",
  "Arte y Cultura",
  "Inglés",
  "Educación Religiosa",
  "Tutoría",
  "Educación para el Trabajo",
  "Desarrollo Personal, Ciudadanía y Cívica",
] as const;
