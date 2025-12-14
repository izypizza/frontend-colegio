import { apiClient } from '@/src/lib/api-client';
import { ApiResponse, LoginCredentials, LoginResponse, User } from '@/src/types';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/auth/login', credentials);
  },

  logout: (): void => {
    apiClient.clearAuth();
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    return apiClient.get<ApiResponse<User>>('/auth/me');
  },

  refreshToken: async (): Promise<LoginResponse> => {
    const refreshToken =
      typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;

    if (!refreshToken) throw new Error('No refresh token found');

    return apiClient.post<LoginResponse>('/auth/refresh', { refreshToken });
  },
};
