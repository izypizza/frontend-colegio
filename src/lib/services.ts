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
    | T[]
    | {
        data: T[];
        current_page: number;
        last_page: number;
        total: number;
        per_page?: number;
      }
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
        per_page?: number;
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

  /**
   * Normaliza respuestas que pueden venir en múltiples formatos
   * Extraído para evitar duplicación entre create() y update()
   */
  private normalizeResponse(response: any): any {
    if (response && typeof response === "object") {
      // Format: { data: {...} }
      if ("data" in response && typeof response.data === "object") {
        return response.data;
      }
      // Format: { estudiante: {...} }, { docente: {...} }, etc.
      if (
        "estudiante" in response ||
        "docente" in response ||
        "padre" in response
      ) {
        return response;
      }
      // Format: { message: '...', [key]: {...} }
      if ("message" in response) {
        return response;
      }
    }
    return response as T;
  }

  async create(data: Partial<T>): Promise<any> {
    const response = await apiClient.post<any>(this.endpoint, data);
    return this.normalizeResponse(response);
  }

  async update(id: number, data: Partial<T>): Promise<any> {
    const response = await apiClient.put<any>(`${this.endpoint}/${id}`, data);
    return this.normalizeResponse(response);
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.endpoint}/${id}`);
  }
}

// Services
export const estudianteService = new CrudService<Estudiante>("/estudiantes");
export const docenteService = new CrudService<Docente>("/docentes");

// Padre Service with extra methods
class PadreServiceExtended extends CrudService<Padre> {
  async asociarEstudiante(padreId: number, estudianteId: number): Promise<any> {
    return await apiClient.post(`/padres/${padreId}/asociar-estudiante`, {
      estudiante_id: estudianteId,
    });
  }

  async desasociarEstudiante(
    padreId: number,
    estudianteId: number,
  ): Promise<any> {
    return await apiClient.delete(
      `/padres/${padreId}/desasociar-estudiante/${estudianteId}`,
    );
  }

  async getEstudiantesDisponibles(padreId: number): Promise<Estudiante[]> {
    return await apiClient.get(`/padres/${padreId}/estudiantes-disponibles`);
  }
}

export const padreService = new PadreServiceExtended("/padres");
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
    return await apiClient.get<any>(
      `/calificaciones/estadisticas-avanzadas${params}`,
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
    return await apiClient.get<any>("/prestamos");
  },
  create: async (data: any) => {
    return await apiClient.post("/prestamos", data);
  },
  devolver: async (id: number) => {
    return await apiClient.post(`/prestamos/${id}/devolver`, {});
  },
  misPrestamos: async () => {
    return await apiClient.get<any>("/mis-prestamos");
  },
};

// User Management Services
export const userManagementService = {
  getAll: async (params?: { page?: number; per_page?: number }) => {
    const response = await apiClient.get<any>("/users", { params });
    return response.users || response;
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
    return await apiClient.get<any>("/elecciones");
  },
  getById: async (id: number) => {
    return await apiClient.get<any>(`/elecciones/${id}`);
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
    return await apiClient.get<any>(`/elecciones/${id}/resultados`);
  },
  yaVote: async (id: number) => {
    return await apiClient.get<any>(`/elecciones/${id}/ya-vote`);
  },
  activar: async (id: number) => {
    return await apiClient.post(`/elecciones/${id}/activar`);
  },
  cerrar: async (id: number) => {
    return await apiClient.post(`/elecciones/${id}/cerrar`);
  },
  publicarResultados: async (id: number) => {
    return await apiClient.post(`/elecciones/${id}/publicar-resultados`);
  },
};

export const partidoService = {
  getAll: async (eleccion_id?: number) => {
    const query = eleccion_id ? `?eleccion_id=${eleccion_id}` : "";
    return await apiClient.get<any>(`/partidos${query}`);
  },
  create: async (data: FormData) => {
    return await apiClient.post("/partidos", data);
  },
  update: async (id: number, data: FormData) => {
    return await apiClient.put(`/partidos/${id}`, data);
  },
  delete: async (id: number) => {
    return await apiClient.delete(`/partidos/${id}`);
  },
};

export const votoService = {
  votar: async (eleccion_id: number, candidato_id: number) => {
    return await apiClient.post("/votos", { eleccion_id, candidato_id });
  },
  misVotos: async () => {
    return await apiClient.get<any>("/mis-votos");
  },
};

// Portal Docente
export const docentePortalService = {
  misAsignaciones: async () => {
    return await apiClient.get<{ asignaciones: any[] }>(
      "/docente/mis-asignaciones",
    );
  },
  misEstudiantes: async () => {
    return await apiClient.get<{ estudiantes: any[] }>(
      "/docente/mis-estudiantes",
    );
  },
  registrarAsistencia: async (data: any) => {
    return await apiClient.post("/docente/registrar-asistencia", data);
  },
  registrarCalificacion: async (data: any) => {
    return await apiClient.post("/docente/registrar-calificacion", data);
  },
  misCalificaciones: async (params?: any) => {
    return await apiClient.get<any>("/docente/mis-calificaciones", { params });
  },
  misAsistencias: async (params?: any) => {
    return await apiClient.get<any>("/docente/mis-asistencias", { params });
  },
};

// Portal Estudiante
export const estudiantePortalService = {
  misCalificaciones: async (params?: any) => {
    return await apiClient.get<any>("/estudiante/mis-calificaciones", {
      params,
    });
  },
  misAsistencias: async (params?: any) => {
    return await apiClient.get<any>("/estudiante/mis-asistencias", { params });
  },
  miPerfil: async () => {
    return await apiClient.get<any>("/estudiante/mi-perfil");
  },
  miBoletin: async (periodo_id: number) => {
    return await apiClient.get<any>(`/estudiante/mi-boletin/${periodo_id}`);
  },
};

// Portal Padre
export const padrePortalService = {
  misHijos: async () => {
    return await apiClient.get<any>("/padre/mis-hijos");
  },
  calificacionesHijos: async (params?: any) => {
    return await apiClient.get<any>("/padre/calificaciones-hijos", { params });
  },
  asistenciasHijo: async (hijo_id: number, params?: any) => {
    return await apiClient.get<any>(`/padre/asistencias-hijo/${hijo_id}`, {
      params,
    });
  },
  boletinHijo: async (hijo_id: number, periodo_id: number) => {
    return await apiClient.get<any>(
      `/padre/boletin-hijo/${hijo_id}/${periodo_id}`,
    );
  },
  docentesHijo: async (hijo_id: number) => {
    return await apiClient.get<any>(`/padre/docentes-hijo/${hijo_id}`);
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
    return await apiClient.get<any>("/configuraciones");
  },
  obtener: async (clave: string) => {
    return await apiClient.get<any>(`/configuraciones/${clave}`);
  },
  actualizar: async (configuraciones: Array<{ clave: string; valor: any }>) => {
    return await apiClient.post("/configuraciones", { configuraciones });
  },
  limpiarCache: async () => {
    return await apiClient.post("/sistema/limpiar-cache");
  },
  infoSistema: async () => {
    return await apiClient.get<any>("/sistema/info");
  },
  modulosActivos: async () => {
    return await apiClient.get<any>("/sistema/modulos-activos");
  },
};

// Notificaciones
export const notificacionService = {
  getAll: async (params?: any) => {
    return await apiClient.get<any>("/notificaciones", { params });
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
    return await apiClient.get<any>("/chat/conversaciones", { params });
  },
  conversaciones: async (params?: any) => {
    return await apiClient.get<any>("/chat/conversaciones", { params });
  },
  crearConversacion: async (data: any) => {
    return await apiClient.post("/chat/conversaciones", data);
  },
  getMensajes: async (conversacionId: number) => {
    return await apiClient.get<any>(
      `/chat/conversaciones/${conversacionId}/mensajes`,
    );
  },
  mensajes: async (conversacionId: number) => {
    return await apiClient.get<any>(
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
    return await apiClient.get<any>("/reportes/estudiantes/excel", {
      responseType: "blob",
    });
  },
  estudiantesPdf: async () => {
    return await apiClient.get<any>("/reportes/estudiantes/pdf", {
      responseType: "blob",
    });
  },
  calificacionesExcel: async (periodo_academico_id?: number) => {
    return await apiClient.get<any>("/reportes/calificaciones/excel", {
      responseType: "blob",
      params: { periodo_academico_id },
    });
  },
  calificacionesPdf: async (periodo_academico_id?: number) => {
    return await apiClient.get<any>("/reportes/calificaciones/pdf", {
      responseType: "blob",
      params: { periodo_academico_id },
    });
  },
};
