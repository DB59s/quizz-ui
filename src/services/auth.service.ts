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

export interface ForgotPasswordRequest {
  email: string
}

export interface VerifyOTPRequest {
  email: string
  otp: string
}

export interface ResetPasswordRequest {
  email: string
  newPassword: string
  confirmNewPassword: string
}

export interface ForgotPasswordResponse {
  success: boolean
  message: string
}

export const authService = {
  /**
   * Login
   */
  login: async (credentials: LoginRequest) => {
    const response = await apiClient.post<AuthResponse>('/api/v1/auth/login', credentials)
    return response.data
  },

  /**
   * Register
   */
  register: async (data: RegisterRequest) => {
    const response = await apiClient.post<AuthResponse>('/api/v1/auth/register', data)
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

  /**
   * Forgot Password - Send reset link
   */
  forgotPassword: async (data: ForgotPasswordRequest) => {
    const response = await apiClient.post<ForgotPasswordResponse>('/api/v1/auth/forgot-password', data)
    return response.data
  },

  /**
   * Verify OTP
   */
  verifyOTP: async (data: VerifyOTPRequest) => {
    const response = await apiClient.post<ForgotPasswordResponse>('/api/v1/auth/verify-otp', data)
    return response.data
  },

  /**
   * Reset Password
   */
  resetPassword: async (data: ResetPasswordRequest) => {
    const response = await apiClient.post<ForgotPasswordResponse>('/api/v1/auth/reset-password', data)
    return response.data
  }
}
