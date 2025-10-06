import { apiClient } from '@/libs/axios-client'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  full_name: string
  department?: string
  university?: string
}

export interface AuthResponse {
  success: boolean
  message: string
  data: {
    access_token: string
    user: {
      id: string
      email: string
      full_name: string
      role: string
    }
  }
}

export const authService = {
  /**
   * Login
   */
  login: async (credentials: LoginRequest) => {
    const response = await apiClient.post<AuthResponse>(
      '/api/v1/auth/login',
      credentials
    )
    return response.data
  },

  /**
   * Register
   */
  register: async (data: RegisterRequest) => {
    const response = await apiClient.post<AuthResponse>(
      '/api/v1/auth/register',
      data
    )
    return response.data
  },

  /**
   * Logout
   */
  logout: async () => {
    const response = await apiClient.post('/api/v1/auth/logout')
    return response.data
  },

  /**
   * Get current user profile
   */
  getProfile: async () => {
    const response = await apiClient.get('/api/v1/auth/profile')
    return response.data
  },
}
