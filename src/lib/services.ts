import { apiClient } from "@/src/lib/api-client";
import {
  AnioEscolar,
  AsignacionDocenteMateria,
  Asistencia,
  Calificacion,
  DashboardStats,
  Docente,
  Estudiante,
  EstadisticasMatricula,
  Grado,
  Horario,
  Materia,
  Matricula,
  Padre,
  PeriodoAcademico,
  Seccion,
  VacanteSeccion,
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
class PeriodoAcademicoServiceExtended extends CrudService<PeriodoAcademico> {
  async activar(id: number): Promise<any> {
    return await apiClient.post<any>(`/periodos/${id}/activar`, {});
  }

  async generarAnio(anio: number): Promise<any> {
    return await apiClient.post<any>("/periodos/generar-anio", { anio });
  }
}

export const periodoAcademicoService = new PeriodoAcademicoServiceExtended(
  "/periodos",
);
export const asignacionService = new CrudService<AsignacionDocenteMateria>(
  "/asignaciones",
);

export interface CursoAsignadoAnual {
  id: string;
  docente_id: number;
  docente: string;
  materia_id: number;
  materia: string;
  seccion_id: number;
  seccion: string;
  grado: string;
  capacidad: number;
  ocupadas: number;
  bloques_horario: number;
  anio: number;
  bimestres: number;
  bimestres_del_anio: number;
  es_tutor: boolean;
}

export const asignacionAnualService = {
  listar: async (
    anio: number,
  ): Promise<{
    anio: number;
    bimestres_del_anio: number;
    cursos: CursoAsignadoAnual[];
  }> => {
    return await apiClient.get(`/asignaciones/anual?anio=${anio}`);
  },

  asignar: async (datos: {
    docente_id: number;
    materia_id: number;
    seccion_id: number;
    anio: number;
    es_tutor?: boolean;
  }): Promise<{ message: string; creados: number; existentes: number }> => {
    return await apiClient.post("/asignaciones/anual", datos);
  },

  quitar: async (datos: {
    docente_id: number;
    materia_id: number;
    seccion_id: number;
    anio: number;
  }): Promise<{ message: string; eliminadas: number }> => {
    const parametros = new URLSearchParams({
      docente_id: String(datos.docente_id),
      materia_id: String(datos.materia_id),
      seccion_id: String(datos.seccion_id),
      anio: String(datos.anio),
    });

    return await apiClient.delete(
      `/asignaciones/anual?${parametros.toString()}`,
    );
  },
};
export const horarioService = new CrudService<Horario>("/horarios");
export const asistenciaService = new CrudService<Asistencia>("/asistencias");

export const asistenciaJustificacionService = {
  justificar: async (id: number, justificada: boolean, motivo?: string) => {
    return await apiClient.put<any>(`/asistencias/${id}/justificar`, {
      justificada,
      motivo: motivo ?? null,
    });
  },
};

class MatriculaServiceExtended {
  async listar(filtros: {
    anio_escolar_id?: number;
    seccion_id?: number;
    grado_id?: number;
    estado?: string;
    buscar?: string;
    page?: number;
    per_page?: number;
  }): Promise<{
    data: Matricula[];
    total: number;
    current_page: number;
    last_page: number;
  }> {
    const parametros = new URLSearchParams();

    Object.entries(filtros).forEach(([clave, valor]) => {
      if (valor !== undefined && valor !== null && valor !== "") {
        parametros.append(clave, String(valor));
      }
    });

    const consulta = parametros.toString();

    return await apiClient.get(
      consulta ? `/matriculas?${consulta}` : "/matriculas",
    );
  }

  async matricular(datos: {
    estudiante_id: number;
    anio_escolar_id: number;
    seccion_id: number;
    tipo?: string;
    observacion?: string;
  }): Promise<{ message: string; matricula: Matricula }> {
    return await apiClient.post("/matriculas", datos);
  }

  async registroCompleto(datos: {
    dni: string;
    nombres: string;
    apellido_paterno: string;
    apellido_materno: string;
    fecha_nacimiento: string;
    anio_escolar_id: number;
    seccion_id: number;
    tipo?: string;
    observacion?: string;
    telefono?: string;
    direccion?: string;
    apoderado?: {
      dni: string;
      nombres?: string;
      apellido_paterno?: string;
      apellido_materno?: string;
      telefono?: string;
      tipo?: "padre" | "madre" | "apoderado";
      es_contacto_principal?: boolean;
    };
  }): Promise<{
    message: string;
    persona_creada: boolean;
    matricula: Matricula;
    estudiante: Estudiante;
  }> {
    return await apiClient.post("/matriculas/registro-completo", datos);
  }

  async actualizar(
    id: number,
    datos: {
      seccion_id?: number;
      estado?: string;
      observacion?: string;
    },
  ): Promise<{ message: string; matricula: Matricula }> {
    return await apiClient.put(`/matriculas/${id}`, datos);
  }

  async estudiantesSinMatricula(
    anioEscolarId: number,
    buscar?: string,
  ): Promise<Estudiante[]> {
    const parametros = new URLSearchParams({
      anio_escolar_id: String(anioEscolarId),
    });

    if (buscar) {
      parametros.append("buscar", buscar);
    }

    return await apiClient.get(
      `/matriculas/estudiantes-sin-matricula?${parametros.toString()}`,
    );
  }

  async vacantes(
    anioEscolarId: number,
    gradoId?: number,
  ): Promise<{
    anio_escolar_id: number;
    anio: number;
    secciones: VacanteSeccion[];
    totales: { capacidad: number; ocupadas: number; disponibles: number };
  }> {
    const parametros = new URLSearchParams({
      anio_escolar_id: String(anioEscolarId),
    });

    if (gradoId) {
      parametros.append("grado_id", String(gradoId));
    }

    return await apiClient.get(`/matriculas/vacantes?${parametros.toString()}`);
  }

  async estadisticas(anioEscolarId?: number): Promise<EstadisticasMatricula> {
    const consulta = anioEscolarId ? `?anio_escolar_id=${anioEscolarId}` : "";

    return await apiClient.get(`/matriculas/estadisticas${consulta}`);
  }
}

export const matriculaService = new MatriculaServiceExtended();

export const anioEscolarService = {
  listar: async (): Promise<AnioEscolar[]> => {
    const respuesta = await apiClient.get<
      AnioEscolar[] | { data: AnioEscolar[] }
    >("/anios-escolares");

    return Array.isArray(respuesta) ? respuesta : respuesta.data;
  },

  crear: async (
    anio: number,
  ): Promise<{ message: string; anio_escolar: AnioEscolar }> => {
    return await apiClient.post("/anios-escolares", { anio });
  },
};

// Calificacion Service with extra methods
class CalificacionServiceExtended extends CrudService<Calificacion> {
  async estadisticasAvanzadas(periodo_id?: number): Promise<any> {
    const params = periodo_id ? `?periodo_academico_id=${periodo_id}` : "";
    return await apiClient.get<any>(
      `/calificaciones/estadisticas-avanzadas${params}`,
    );
  }

  async buscar(params: {
    page?: number;
    per_page?: number;
    buscar?: string;
    materia_id?: number;
    periodo_academico_id?: number;
    todos?: boolean;
  }): Promise<{
    data: Calificacion[];
    current_page: number;
    last_page: number;
    total: number;
  }> {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.per_page) query.set("per_page", String(params.per_page));
    if (params.buscar) query.set("buscar", params.buscar);
    if (params.materia_id) query.set("materia_id", String(params.materia_id));
    if (params.periodo_academico_id)
      query.set("periodo_academico_id", String(params.periodo_academico_id));
    if (params.todos) query.set("todos", "1");

    return await apiClient.get(`/calificaciones?${query.toString()}`);
  }
}

export const calificacionService = new CalificacionServiceExtended(
  "/calificaciones",
);

// Competencias del Currículo Nacional
export const competenciaService = {
  getAll: async (params?: {
    materia_id?: number;
    ciclo?: string;
    activo?: boolean;
    buscar?: string;
    all?: boolean;
    per_page?: number;
  }): Promise<any> => {
    const query = new URLSearchParams();
    if (params?.materia_id) query.set("materia_id", String(params.materia_id));
    if (params?.ciclo) query.set("ciclo", params.ciclo);
    if (params?.activo !== undefined)
      query.set("activo", String(params.activo));
    if (params?.buscar) query.set("buscar", params.buscar);
    if (params?.all) query.set("all", "1");
    if (params?.per_page) query.set("per_page", String(params.per_page));

    return await apiClient.get(`/competencias?${query.toString()}`);
  },

  porCurso: async (seccion_id: number, materia_id: number): Promise<any> =>
    await apiClient.get(
      `/competencias/por-curso?seccion_id=${seccion_id}&materia_id=${materia_id}`,
    ),

  catalogoSeccion: async (seccion_id: number): Promise<any> =>
    await apiClient.get(`/competencias/catalogo-seccion/${seccion_id}`),

  create: async (datos: any): Promise<any> =>
    await apiClient.post("/competencias", datos),

  update: async (id: number, datos: any): Promise<any> =>
    await apiClient.put(`/competencias/${id}`, datos),

  delete: async (id: number): Promise<any> =>
    await apiClient.delete(`/competencias/${id}`),
};

export const calificacionCompetenciaService = {
  listar: async (params?: {
    estudiante_id?: number;
    materia_id?: number;
    competencia_id?: number;
    periodo_academico_id?: number;
    per_page?: number;
  }): Promise<any> => {
    const query = new URLSearchParams();
    if (params?.estudiante_id)
      query.set("estudiante_id", String(params.estudiante_id));
    if (params?.materia_id) query.set("materia_id", String(params.materia_id));
    if (params?.competencia_id)
      query.set("competencia_id", String(params.competencia_id));
    if (params?.periodo_academico_id)
      query.set("periodo_academico_id", String(params.periodo_academico_id));
    if (params?.per_page) query.set("per_page", String(params.per_page));

    return await apiClient.get(
      `/calificaciones-competencias?${query.toString()}`,
    );
  },

  consolidado: async (
    estudiante_id: number,
    periodo_academico_id: number,
  ): Promise<any> =>
    await apiClient.get(
      `/calificaciones-competencias/consolidado/${estudiante_id}/${periodo_academico_id}`,
    ),

  guardar: async (datos: {
    estudiante_id: number;
    competencia_id: number;
    periodo_academico_id: number;
    escala: "literal" | "numerica";
    nivel?: string | null;
    nota?: number | null;
    conclusion_descriptiva?: string | null;
  }): Promise<any> =>
    await apiClient.post("/calificaciones-competencias", datos),

  guardarLote: async (datos: {
    periodo_academico_id: number;
    escala: "literal" | "numerica";
    registros: Array<{
      estudiante_id: number;
      competencia_id: number;
      nivel?: string | null;
      nota?: number | null;
      conclusion_descriptiva?: string | null;
    }>;
  }): Promise<any> =>
    await apiClient.post("/calificaciones-competencias/lote", datos),
};

// Evidencias de evaluación (exámenes, tareas, prácticas) y sus notas
export const actividadEvaluacionService = {
  listar: async (
    competencia_id: number,
    periodo_academico_id: number,
    seccion_id?: number,
  ): Promise<any> => {
    const query = new URLSearchParams({
      competencia_id: String(competencia_id),
      periodo_academico_id: String(periodo_academico_id),
    });
    if (seccion_id) query.set("seccion_id", String(seccion_id));

    return await apiClient.get(`/actividades-evaluacion?${query.toString()}`);
  },

  create: async (datos: {
    competencia_id: number;
    periodo_academico_id: number;
    nombre: string;
    tipo: string;
    peso: number;
    fecha?: string | null;
    orden?: number;
  }): Promise<any> => await apiClient.post("/actividades-evaluacion", datos),

  update: async (id: number, datos: any): Promise<any> =>
    await apiClient.put(`/actividades-evaluacion/${id}`, datos),

  delete: async (id: number): Promise<any> =>
    await apiClient.delete(`/actividades-evaluacion/${id}`),

  registrarNotas: async (
    id: number,
    registros: Array<{
      estudiante_id: number;
      nota: number | null;
      observacion?: string | null;
    }>,
  ): Promise<any> =>
    await apiClient.post(`/actividades-evaluacion/${id}/notas`, { registros }),

  recalcular: async (datos: {
    competencia_id: number;
    periodo_academico_id: number;
  }): Promise<any> =>
    await apiClient.post("/actividades-evaluacion/recalcular", datos),

  resumen: async (params: {
    competencia_id: number;
    periodo_academico_id: number;
    estudiante_id: number;
  }): Promise<any> => {
    const query = new URLSearchParams({
      competencia_id: String(params.competencia_id),
      periodo_academico_id: String(params.periodo_academico_id),
      estudiante_id: String(params.estudiante_id),
    });

    return await apiClient.get(
      `/actividades-evaluacion/resumen?${query.toString()}`,
    );
  },
};

// Sesiones de clase (asistencia por curso)
export const sesionClaseService = {
  listar: async (params?: {
    asignacion_id?: number;
    materia_id?: number;
    seccion_id?: number;
    desde?: string;
    hasta?: string;
    per_page?: number;
  }): Promise<any> => {
    const query = new URLSearchParams();
    if (params?.asignacion_id)
      query.set("asignacion_id", String(params.asignacion_id));
    if (params?.materia_id) query.set("materia_id", String(params.materia_id));
    if (params?.seccion_id) query.set("seccion_id", String(params.seccion_id));
    if (params?.desde) query.set("desde", params.desde);
    if (params?.hasta) query.set("hasta", params.hasta);
    if (params?.per_page) query.set("per_page", String(params.per_page));

    return await apiClient.get(`/sesiones-clase?${query.toString()}`);
  },

  abrir: async (datos: {
    asignacion_id: number;
    fecha: string;
    hora_inicio?: string;
    hora_fin?: string;
    tema?: string;
    observaciones?: string;
  }): Promise<any> => await apiClient.post("/sesiones-clase", datos),

  hoja: async (id: number): Promise<any> =>
    await apiClient.get(`/sesiones-clase/${id}/hoja`),

  llamarLista: async (
    id: number,
    registros: Array<{
      estudiante_id: number;
      estado: string;
      minutos_tardanza?: number | null;
      justificacion?: string | null;
    }>,
  ): Promise<any> =>
    await apiClient.post(`/sesiones-clase/${id}/asistencias`, { registros }),

  anular: async (id: number): Promise<any> =>
    await apiClient.put(`/sesiones-clase/${id}/anular`, {}),
};

// Biblioteca Services
export const categoriaLibroService = new CrudService<any>("/categorias-libros");
export const libroService = new CrudService<any>("/libros");
export const prestamoLibroService = {
  getAll: async (params?: { page?: number; per_page?: number }) => {
    return await apiClient.get<any>("/prestamos", { params });
  },
  aprobar: (id: number) => apiClient.post(`/prestamos/${id}/aprobar`),
  rechazar: (id: number, motivo: string) =>
    apiClient.post(`/prestamos/${id}/rechazar`, { motivo }),
  reportes: () =>
    apiClient.get<{
      prestamos_activos: number;
      prestamos_devueltos: number;
      prestamos_vencidos: number;
    }>("/biblioteca/reportes"),
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
  restablecerPassword: async (id: number) => {
    return await apiClient.post<any>(`/users/${id}/restablecer-password`, {});
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
  listaSeccion: async (seccionId: number, materiaId: number, fecha: string) => {
    return await apiClient.get<any>(`/docente/lista-seccion/${seccionId}`, {
      params: { materia_id: materiaId, fecha },
    });
  },
  llamarLista: async (data: {
    materia_id: number;
    seccion_id: number;
    fecha: string;
    registros: Array<{
      estudiante_id: number;
      estado: string;
      observaciones?: string | null;
    }>;
  }) => {
    return await apiClient.post<any>("/docente/llamar-lista", data);
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
  horarioHijo: async (hijo_id: number) => {
    return await apiClient.get<any>(`/padre/horario-hijo/${hijo_id}`);
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
  crearConversacion: async (data: any) => {
    return await apiClient.post("/chat/conversaciones", data);
  },
  getMensajes: async (conversacionId: number, afterId?: number) => {
    return await apiClient.get<any>(
      `/chat/conversaciones/${conversacionId}/mensajes`,
      { params: afterId ? { after_id: afterId } : undefined },
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
