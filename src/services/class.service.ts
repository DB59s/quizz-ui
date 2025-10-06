import { apiClient } from '@/libs/axios-client'

export interface Teacher {
  id: string
  email: string
  full_name: string
  department: string
  university: string
}

export interface ClassData {
  id: string
  name: string
  description: string
  max_students: number
  current_students: number
  class_code: string
  status: string
  teacher: Teacher
  is_registered?: boolean
  registration_status?: 'pending' | 'approved' | 'rejected'
}

export interface ClassInformationResponse {
  success: boolean
  message: string
  data: ClassData
}

export const classService = {
  /**
   * Get class information by class code
   */
  getClassByCode: async (classCode: string) => {
    const response = await apiClient.get<ClassInformationResponse>(
      `/api/v1/classes/join/${classCode}`
    )
    return response.data
  },

  /**
   * Request to join a class (student-classes)
   */
  requestJoinClass: async (classId: string) => {
    const response = await apiClient.post(
      `/api/v1/student-classes`,
      { class_id: classId }
    )
    return response.data
  },

  /**
   * Get student's class applications/registrations
   */
  getStudentApplications: async () => {
    const response = await apiClient.get('/api/v1/student-classes/student')
    return response.data
  },

  /**
   * Cancel a class registration/application
   */
  cancelRegistration: async (registrationId: string) => {
    const response = await apiClient.delete(`/api/v1/student-classes/${registrationId}`)
    return response.data
  },

  /**
   * Get all classes
   */
  getAllClasses: async () => {
    const response = await apiClient.get('/api/v1/classes')
    return response.data
  },

  /**
   * Get my classes
   */
  getMyClasses: async () => {
    const response = await apiClient.get('/api/v1/classes/my-classes')
    return response.data
  },
}
