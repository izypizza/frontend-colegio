import {
  API_BASE_URL,
  API_TIMEOUT,
  HTTP_STATUS,
  REFRESH_TOKEN_KEY,
  TOKEN_KEY,
} from "@/src/config/constants";

class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string = API_BASE_URL, timeout: number = API_TIMEOUT) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  private getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json();

    if (!response.ok) {
      // Verificar si el sistema está en modo mantenimiento (503)
      if (response.status === 503 && data.maintenance_mode) {
        if (typeof window !== "undefined") {
          // Redirigir a la página de mantenimiento
          window.location.href = "/maintenance";
        }
        throw new Error(data.message || "Sistema en mantenimiento");
      }

      if (response.status === HTTP_STATUS.UNAUTHORIZED) {
        this.clearAuth();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        throw new Error("Sesión expirada. Por favor inicia sesión nuevamente.");
      }

      // Verificar si es un error de permisos (403)
      if (response.status === HTTP_STATUS.FORBIDDEN) {
        const errorMessage =
          data.message || "No tiene permisos para acceder a este recurso";
        console.error("Error de permisos:", {
          status: response.status,
          message: errorMessage,
          requiredRoles: data.required_roles,
          userRole: data.user_role,
          url: response.url,
        });

        const error: any = new Error(errorMessage);
        error.response = {
          status: response.status,
          data: data,
        };
        throw error;
      }

      // Crear un error con toda la información de respuesta
      const error: any = new Error(data.message || "Error en la solicitud");
      error.response = {
        status: response.status,
        data: data,
      };
      throw error;
    }

    return data as T;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit & { timeout?: number } = {}
  ): Promise<T> {
    const { timeout = this.timeout, ...fetchOptions } = options;
    const url = `${this.baseURL}${endpoint}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: this.getHeaders(true),
        signal: controller.signal,
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("La solicitud ha excedido el tiempo de espera");
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async get<T>(
    endpoint: string,
    options?: { params?: Record<string, any> }
  ): Promise<T> {
    let url = endpoint;
    if (options?.params) {
      const params = new URLSearchParams();
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
      const queryString = params.toString();
      if (queryString) {
        url = `${endpoint}?${queryString}`;
      }
    }
    return this.request<T>(url, { method: "GET" });
  }

  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  setToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, token);
    }
  }

  setRefreshToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    }
  }

  clearAuth(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  }
}

export const apiClient = new ApiClient();
