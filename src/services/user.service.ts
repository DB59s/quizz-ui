import { apiClient } from '@/libs/axios-client'

export interface UserProfile {
  _id: string
  account_id: string
  email: string
  full_name: string
  student_code: string
  class_name: string
  phone_number: string
  profile_completed: boolean
  created_at: string
  updated_at: string
  __v: number
}

export interface UserProfileResponse {
  success: boolean
  message: string
  data: UserProfile
}

export interface UpdateUserRequest {
  full_name?: string
  student_code?: string
  class_name?: string
  phone_number?: string
  email?: string
}

export const userService = {
  /**
   * Get current user profile
   */
  getProfile: async () => {
    const response = await apiClient.get<UserProfileResponse>('/api/v1/users/me')
    return response.data
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: UpdateUserRequest) => {
    const response = await apiClient.patch<UserProfileResponse>('/api/v1/users/me', data)
    return response.data
  }
}
