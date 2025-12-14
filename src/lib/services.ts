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
