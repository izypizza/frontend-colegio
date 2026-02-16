import { apiClient } from "@/src/lib/api-client";
import {
  ApiResponse,
  LoginCredentials,
  LoginResponse,
  User,
} from "@/src/types";

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>("/auth/login", credentials);
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post("/auth/logout", {});
    } catch (error) {
      // Si el token ya no es válido, igual limpiamos credenciales locales
      console.error("Error al cerrar sesión en backend:", error);
    } finally {
      apiClient.clearAuth();
    }
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    return apiClient.get<ApiResponse<User>>("/auth/me");
  },

  refreshToken: async (): Promise<LoginResponse> => {
    // El backend no expone refresh tokens; fallo rápido para evitar llamadas inexistentes
    throw new Error(
      "Renovación de token no soportada en esta versión del backend",
    );
  },
};
