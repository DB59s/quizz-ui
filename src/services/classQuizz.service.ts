import { apiClient } from '@/libs/axios-client'

export interface Quiz {
  id: string
  name: string
  description: string
  created_at: string
  updated_at: string
}

export interface ClassQuizz {
  id: string
  quiz_id: string
  class_id: string
  start_time: string
  end_time: string
  status: 'active' | 'ended' | 'upcoming'
  quiz: Quiz
}

export interface ClassQuizzResponse {
  success: boolean
  message: string
  data: ClassQuizz[]
  pagination: {
    current_page: number
    items_per_page: number
    total_items: number
    total_pages: number
  }
  cached: boolean
}

export const classQuizzService = {
  /**
   * Get all class quizzes for a student in a specific class
   */
  getClassQuizzes: async (classId: string, page: number = 1, limit: number = 10) => {
    const response = await apiClient.get<ClassQuizzResponse>(
      `/api/v1/class-quizzes/class/${classId}/student/all?page=${page}&limit=${limit}`
    )
    return response.data
  },

  /**
   * Get a specific class quiz details
   */
  getClassQuizzById: async (classQuizzId: string) => {
    const response = await apiClient.get(`/api/v1/class-quizzes/${classQuizzId}`)
    return response.data
  },

  /**
   * Start a quiz attempt
   */
  startQuizAttempt: async (classQuizzId: string) => {
    const response = await apiClient.post(`/api/v1/class-quizzes/${classQuizzId}/attempt`)
    return response.data
  },

  /**
   * Submit quiz answers
   */
  submitQuizAttempt: async (attemptId: string, answers: any[]) => {
    const response = await apiClient.post(`/api/v1/quiz-attempts/${attemptId}/submit`, {
      answers
    })
    return response.data
  },

  /**
   * Get quiz attempt result
   */
  getQuizAttemptResult: async (attemptId: string) => {
    const response = await apiClient.get(`/api/v1/quiz-attempts/${attemptId}/result`)
    return response.data
  },

  /**
   * Get student's quiz attempts for a class quiz
   */
  getStudentAttempts: async (classQuizzId: string) => {
    const response = await apiClient.get(`/api/v1/class-quizzes/${classQuizzId}/attempts`)
    return response.data
  },
}
