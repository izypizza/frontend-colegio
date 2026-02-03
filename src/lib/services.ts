import { apiClient } from "@/src/lib/api-client";
import {
  AsignacionDocenteMateria,
  Asistencia,
  Calificacion,
  DashboardStats,
  Docente,
  Estudiante,
  Grado,
  Horario,
  Materia,
  Padre,
  PeriodoAcademico,
  Seccion,
} from "@/src/types/models";

// Generic CRUD service
class CrudService<T> {
  constructor(private endpoint: string) {}

  async getAll(params?: {
    page?: number;
    per_page?: number;
    all?: boolean;
  }): Promise<
    T[] | { data: T[]; current_page: number; last_page: number; total: number }
  > {
    const queryParams: any = {};

    if (params?.all) {
      queryParams.all = "true";
    } else {
      if (params?.page) queryParams.page = params.page;
      if (params?.per_page) queryParams.per_page = params.per_page;
    }

    const response = await apiClient.get<
      | T[]
      | {
          data: T[];
          current_page?: number;
          last_page?: number;
          total?: number;
          especialidades?: any;
        }
    >(this.endpoint, { params: queryParams });

    // Handle paginated response
    if (
      response &&
      typeof response === "object" &&
      "data" in response &&
      "current_page" in response
    ) {
      return response as {
        data: T[];
        current_page: number;
        last_page: number;
        total: number;
      };
    }

    // Handle multiple formats: direct array or wrapped in data
    if (Array.isArray(response)) {
      return response;
    }

    // Handle standard pagination { data: [...] }
    if ("data" in response && Array.isArray(response.data)) {
      return response.data;
    }

    return [];
  }

  async getById(id: number): Promise<T> {
    const response = await apiClient.get<T | { data: T }>(
      `${this.endpoint}/${id}`,
    );
    // Handle both formats: direct object or wrapped in { data: {...} }
    return response && typeof response === "object" && "data" in response
      ? response.data
      : (response as T);
  }

  async create(data: Partial<T>): Promise<any> {
    const response = await apiClient.post<any>(this.endpoint, data);
    // Handle multiple formats
    if (response && typeof response === "object") {
      // Format: { data: {...} }
      if ("data" in response && typeof response.data === "object") {
        return response.data;
      }
      // Format: { estudiante: {...} }
      if ("estudiante" in response) {
        return response;
      }
      // Format: { docente: {...} }
      if ("docente" in response) {
        return response;
      }
      // Format: { message: '...', [key]: {...} } - Return whole response for error handling
      if ("message" in response) {
        return response;
      }
    }
    return response as T;
  }

  async update(id: number, data: Partial<T>): Promise<any> {
    const response = await apiClient.put<any>(`${this.endpoint}/${id}`, data);
    // Handle multiple formats
    if (response && typeof response === "object") {
      // Format: { data: {...} }
      if ("data" in response && typeof response.data === "object") {
        return response.data;
      }
      // Format: { estudiante: {...} }
      if ("estudiante" in response) {
        return response;
      }
      // Format: { docente: {...} }
      if ("docente" in response) {
        return response;
      }
      // Format: { message: '...', [key]: {...} } - Return whole response for error handling
      if ("message" in response) {
        return response;
      }
    }
    return response as T;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.endpoint}/${id}`);
  }
}

// Services
export const estudianteService = new CrudService<Estudiante>("/estudiantes");
export const docenteService = new CrudService<Docente>("/docentes");
export const padreService = new CrudService<Padre>("/padres");
export const gradoService = new CrudService<Grado>("/grados");
export const seccionService = new CrudService<Seccion>("/secciones");
export const materiaService = new CrudService<Materia>("/materias");
export const periodoService = new CrudService<PeriodoAcademico>("/periodos");
export const periodoAcademicoService = new CrudService<PeriodoAcademico>(
  "/periodos",
);
export const asignacionService = new CrudService<AsignacionDocenteMateria>(
  "/asignaciones",
);
export const horarioService = new CrudService<Horario>("/horarios");
export const asistenciaService = new CrudService<Asistencia>("/asistencias");

// Calificacion Service with extra methods
class CalificacionServiceExtended extends CrudService<Calificacion> {
  async estadisticasAvanzadas(periodo_id?: number): Promise<any> {
    const params = periodo_id ? `?periodo_academico_id=${periodo_id}` : "";
    return await apiClient.get(
      `/calificaciones/estadisticas-avanzadas${params}`,
      { timeout: 120000 }, // 120 segundos para estadísticas complejas
    );
  }
}

export const calificacionService = new CalificacionServiceExtended(
  "/calificaciones",
);

// Biblioteca Services
export const categoriaLibroService = new CrudService<any>("/categorias-libros");
export const libroService = new CrudService<any>("/libros");
export const prestamoLibroService = {
  getAll: async () => {
    return await apiClient.get("/prestamos");
  },
  create: async (data: any) => {
    return await apiClient.post("/prestamos", data);
  },
  devolver: async (id: number) => {
    return await apiClient.post(`/prestamos/${id}/devolver`, {});
  },
  misPrestamos: async () => {
    return await apiClient.get("/mis-prestamos");
  },
};

// User Management Services
export const userManagementService = {
  getAll: async () => {
    const response = await apiClient.get<any>("/users");
    return response.users || [];
  },
  create: async (data: any) => {
    return await apiClient.post("/users", data);
  },
  update: async (id: number, data: any) => {
    return await apiClient.put(`/users/${id}`, data);
  },
  toggleActive: async (id: number) => {
    return await apiClient.post(`/users/${id}/toggle-active`, {});
  },
  getPersonasSinUsuario: async (tipo: "estudiante" | "docente" | "padre") => {
    const response = await apiClient.get<any>(`/personas-sin-usuario/${tipo}`);
    return response.personas || [];
  },
  updateEstadoEstudiante: async (
    id: number,
    estado: "activo" | "suspendido" | "egresado",
  ) => {
    return await apiClient.put(`/estudiantes/${id}/estado`, { estado });
  },
};

// Elecciones Services
export const eleccionService = {
  getAll: async () => {
    return await apiClient.get("/elecciones");
  },
  getById: async (id: number) => {
    return await apiClient.get(`/elecciones/${id}`);
  },
  create: async (data: any) => {
    return await apiClient.post("/elecciones", data);
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
    return await apiClient.post("/votos", { eleccion_id, candidato_id });
  },
  misVotos: async () => {
    return await apiClient.get("/mis-votos");
  },
};

// Portal Docente
export const docentePortalService = {
  misAsignaciones: async () => {
    return await apiClient.get("/docente/mis-asignaciones");
  },
  misEstudiantes: async () => {
    return await apiClient.get("/docente/mis-estudiantes");
  },
  registrarAsistencia: async (data: any) => {
    return await apiClient.post("/docente/registrar-asistencia", data);
  },
  registrarCalificacion: async (data: any) => {
    return await apiClient.post("/docente/registrar-calificacion", data);
  },
  misCalificaciones: async (params?: any) => {
    return await apiClient.get("/docente/mis-calificaciones", { params });
  },
  misAsistencias: async (params?: any) => {
    return await apiClient.get("/docente/mis-asistencias", { params });
  },
};

// Portal Estudiante
export const estudiantePortalService = {
  misCalificaciones: async (params?: any) => {
    return await apiClient.get("/estudiante/mis-calificaciones", { params });
  },
  misAsistencias: async (params?: any) => {
    return await apiClient.get("/estudiante/mis-asistencias", { params });
  },
  miPerfil: async () => {
    return await apiClient.get("/estudiante/mi-perfil");
  },
  miBoletin: async (periodo_id: number) => {
    return await apiClient.get(`/estudiante/mi-boletin/${periodo_id}`);
  },
};

// Portal Padre
export const padrePortalService = {
  misHijos: async () => {
    return await apiClient.get("/padre/mis-hijos");
  },
  calificacionesHijos: async (params?: any) => {
    return await apiClient.get("/padre/calificaciones-hijos", { params });
  },
  asistenciasHijo: async (hijo_id: number, params?: any) => {
    return await apiClient.get(`/padre/asistencias-hijo/${hijo_id}`, {
      params,
    });
  },
  boletinHijo: async (hijo_id: number, periodo_id: number) => {
    return await apiClient.get(`/padre/boletin-hijo/${hijo_id}/${periodo_id}`);
  },
  docentesHijo: async (hijo_id: number) => {
    return await apiClient.get(`/padre/docentes-hijo/${hijo_id}`);
  },
};

// Dashboard Service
export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<DashboardStats>("/dashboard/stats");
    return response;
  },
};

// Configuraciones Service
export const configuracionService = {
  getAll: async () => {
    return await apiClient.get("/configuraciones");
  },
  obtener: async (clave: string) => {
    return await apiClient.get(`/configuraciones/${clave}`);
  },
  actualizar: async (configuraciones: Array<{ clave: string; valor: any }>) => {
    return await apiClient.post("/configuraciones", { configuraciones });
  },
  limpiarCache: async () => {
    return await apiClient.post("/sistema/limpiar-cache");
  },
  infoSistema: async () => {
    return await apiClient.get("/sistema/info");
  },
  modulosActivos: async () => {
    return await apiClient.get("/sistema/modulos-activos");
  },
};

// Notificaciones
export const notificacionService = {
  getAll: async (params?: any) => {
    return await apiClient.get("/notificaciones", { params });
  },
  marcarLeida: async (id: number) => {
    return await apiClient.post(`/notificaciones/${id}/leer`, {});
  },
  marcarTodasLeidas: async () => {
    return await apiClient.post("/notificaciones/leer-todas", {});
  },
};

// Chat
export const chatService = {
  getConversaciones: async (params?: any) => {
    return await apiClient.get("/chat/conversaciones", { params });
  },
  conversaciones: async (params?: any) => {
    return await apiClient.get("/chat/conversaciones", { params });
  },
  crearConversacion: async (data: any) => {
    return await apiClient.post("/chat/conversaciones", data);
  },
  getMensajes: async (conversacionId: number) => {
    return await apiClient.get(
      `/chat/conversaciones/${conversacionId}/mensajes`,
    );
  },
  mensajes: async (conversacionId: number) => {
    return await apiClient.get(
      `/chat/conversaciones/${conversacionId}/mensajes`,
    );
  },
  enviarMensaje: async (conversacionId: number, data: { mensaje: string }) => {
    return await apiClient.post(
      `/chat/conversaciones/${conversacionId}/mensajes`,
      data,
    );
  },
};

// Reportes
export const reporteService = {
  estudiantesExcel: async () => {
    return await apiClient.get("/reportes/estudiantes/excel", {
      responseType: "blob",
    });
  },
  estudiantesPdf: async () => {
    return await apiClient.get("/reportes/estudiantes/pdf", {
      responseType: "blob",
    });
  },
  calificacionesExcel: async (periodo_academico_id?: number) => {
    return await apiClient.get("/reportes/calificaciones/excel", {
      responseType: "blob",
      params: { periodo_academico_id },
    });
  },
  calificacionesPdf: async (periodo_academico_id?: number) => {
    return await apiClient.get("/reportes/calificaciones/pdf", {
      responseType: "blob",
      params: { periodo_academico_id },
    });
  },
};
