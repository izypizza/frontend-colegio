import { apiClient } from '@/src/lib/api-client';
import {
    AsignacionDocenteMateria,
    Asistencia,
    Calificacion,
    Docente,
    Estudiante,
    Grado,
    Horario,
    Materia,
    Padre,
    PeriodoAcademico,
    Seccion,
} from '@/src/types/models';

// Generic CRUD service
class CrudService<T> {
  constructor(private endpoint: string) {}

  async getAll(): Promise<T[]> {
    const response = await apiClient.get<T[] | { data: T[] }>(this.endpoint);
    // Handle both formats: direct array or wrapped in { data: [...] }
    return Array.isArray(response) ? response : response.data;
  }

  async getById(id: number): Promise<T> {
    const response = await apiClient.get<T | { data: T }>(`${this.endpoint}/${id}`);
    // Handle both formats: direct object or wrapped in { data: {...} }
    return response && typeof response === 'object' && 'data' in response ? response.data : response as T;
  }

  async create(data: Partial<T>): Promise<T> {
    const response = await apiClient.post<T | { data: T }>(this.endpoint, data);
    // Handle both formats: direct object or wrapped in { data: {...} }
    return response && typeof response === 'object' && 'data' in response ? response.data : response as T;
  }

  async update(id: number, data: Partial<T>): Promise<T> {
    const response = await apiClient.put<T | { data: T }>(`${this.endpoint}/${id}`, data);
    // Handle both formats: direct object or wrapped in { data: {...} }
    return response && typeof response === 'object' && 'data' in response ? response.data : response as T;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.endpoint}/${id}`);
  }
}

// Services
export const estudianteService = new CrudService<Estudiante>('/estudiantes');
export const docenteService = new CrudService<Docente>('/docentes');
export const padreService = new CrudService<Padre>('/padres');
export const gradoService = new CrudService<Grado>('/grados');
export const seccionService = new CrudService<Seccion>('/secciones');
export const materiaService = new CrudService<Materia>('/materias');
export const periodoService = new CrudService<PeriodoAcademico>('/periodos');
export const periodoAcademicoService = new CrudService<PeriodoAcademico>('/periodos');
export const asignacionService = new CrudService<AsignacionDocenteMateria>('/asignaciones');
export const horarioService = new CrudService<Horario>('/horarios');
export const asistenciaService = new CrudService<Asistencia>('/asistencias');
export const calificacionService = new CrudService<Calificacion>('/calificaciones');

// Biblioteca Services
export const categoriaLibroService = new CrudService<any>('/categorias-libros');
export const libroService = new CrudService<any>('/libros');
export const prestamoLibroService = {
  getAll: async () => {
    return await apiClient.get('/prestamos');
  },
  create: async (data: any) => {
    return await apiClient.post('/prestamos', data);
  },
  devolver: async (id: number) => {
    return await apiClient.post(`/prestamos/${id}/devolver`, {});
  },
  misPrestamos: async () => {
    return await apiClient.get('/mis-prestamos');
  },
};

// Elecciones Services
export const eleccionService = {
  getAll: async () => {
    return await apiClient.get('/elecciones');
  },
  getById: async (id: number) => {
    return await apiClient.get(`/elecciones/${id}`);
  },
  create: async (data: any) => {
    return await apiClient.post('/elecciones', data);
  },
  update: async (id: number, data: any) => {
    return await apiClient.put(`/elecciones/${id}`, data);
  },
  delete: async (id: number) => {
    return await apiClient.delete(`/elecciones/${id}`);
  },
  getResultados: async (id: number) => {
    return await apiClient.get(`/elecciones/${id}/resultados`);
  },
  yaVote: async (id: number) => {
    return await apiClient.get(`/elecciones/${id}/ya-vote`);
  },
};

export const votoService = {
  votar: async (eleccion_id: number, candidato_id: number) => {
    return await apiClient.post('/votos', { eleccion_id, candidato_id });
  },
  misVotos: async () => {
    return await apiClient.get('/mis-votos');
  },
};

// Portal Docente
export const docentePortalService = {
  misAsignaciones: async () => {
    return await apiClient.get('/docente/mis-asignaciones');
  },
  misEstudiantes: async () => {
    return await apiClient.get('/docente/mis-estudiantes');
  },
  registrarAsistencia: async (data: any) => {
    return await apiClient.post('/docente/registrar-asistencia', data);
  },
  registrarCalificacion: async (data: any) => {
    return await apiClient.post('/docente/registrar-calificacion', data);
  },
  misCalificaciones: async () => {
    return await apiClient.get('/docente/mis-calificaciones');
  },
  misAsistencias: async (params?: any) => {
    return await apiClient.get('/docente/mis-asistencias', { params });
  },
};

// Portal Estudiante
export const estudiantePortalService = {
  misCalificaciones: async () => {
    return await apiClient.get('/estudiante/mis-calificaciones');
  },
  misAsistencias: async (params?: any) => {
    return await apiClient.get('/estudiante/mis-asistencias', { params });
  },
  miPerfil: async () => {
    return await apiClient.get('/estudiante/mi-perfil');
  },
  miBoletin: async (periodo_id: number) => {
    return await apiClient.get(`/estudiante/mi-boletin/${periodo_id}`);
  },
};

// Portal Padre
export const padrePortalService = {
  misHijos: async () => {
    return await apiClient.get('/padre/mis-hijos');
  },
  calificacionesHijos: async () => {
    return await apiClient.get('/padre/calificaciones-hijos');
  },
  asistenciasHijo: async (hijo_id: number, params?: any) => {
    return await apiClient.get(`/padre/asistencias-hijo/${hijo_id}`, { params });
  },
  boletinHijo: async (hijo_id: number, periodo_id: number) => {
    return await apiClient.get(`/padre/boletin-hijo/${hijo_id}/${periodo_id}`);
  },
};

// Dashboard Service
export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<DashboardStats>('/dashboard/stats');
    return response;
  },
};
