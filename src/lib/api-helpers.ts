/**
 * Utilidades para normalizar respuestas de la API
 * Reemplaza el código duplicado en 20+ archivos
 */

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

interface NormalizedResponse<T> {
  data: T[];
  pagination?: {
    total: number;
    currentPage: number;
    lastPage: number;
    perPage: number;
  };
}

/**
 * Normaliza respuestas paginadas de Laravel
 * Maneja tanto respuestas paginadas como arrays simples
 */
export function normalizePaginatedResponse<T>(
  response: any,
): NormalizedResponse<T> {
  // Si es null o undefined, retornar array vacío
  if (!response) {
    return { data: [] };
  }

  // Si tiene estructura de paginación Laravel
  if (
    response &&
    typeof response === "object" &&
    "data" in response &&
    "current_page" in response &&
    "last_page" in response
  ) {
    return {
      data: response.data || [],
      pagination: {
        total: response.total || 0,
        currentPage: response.current_page || 1,
        lastPage: response.last_page || 1,
        perPage: response.per_page || 50,
      },
    };
  }

  // Si es un array directo
  if (Array.isArray(response)) {
    return { data: response };
  }

  // Si tiene propiedad 'data' pero no es paginado
  if (response && typeof response === "object" && "data" in response) {
    const dataArray = Array.isArray(response.data) ? response.data : [];
    return { data: dataArray };
  }

  // Fallback: intentar convertir a array
  return { data: [] };
}

/**
 * Verifica si una respuesta es paginada
 */
export function isPaginatedResponse(response: any): boolean {
  return !!(
    response &&
    typeof response === "object" &&
    "data" in response &&
    "current_page" in response
  );
}

/**
 * Extrae datos de una respuesta (paginada o no)
 */
export function extractData<T>(response: any): T[] {
  const normalized = normalizePaginatedResponse<T>(response);
  return normalized.data;
}
