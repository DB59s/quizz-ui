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
  status: 'active' | 'ended'
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

export interface SubmitQuizResponse {
  success: boolean
  message: string
  data: {
    submission_id: string
    student_id: string
    quiz_name: string
    score: number
    n_total_true: number
    total_questions: number
    submission_time: string
    detailed_results: Array<{
      question_id: string
      content: string
      answers: Array<{
        answer_id: string
        content: string
        is_correct: boolean
        student_selected: boolean
      }>
    }>
  }
}

export const classQuizzService = {
  /**
   * Get all class quizzes for a student in a specific class
   */
  getClassQuizzes: async (classId: string, page: number = 1, limit: number = 10, skipCache: boolean = false) => {
    const timestamp = skipCache ? `&_t=${Date.now()}` : ''
    const response = await apiClient.get<ClassQuizzResponse>(
      `/api/v1/class-quizzes/class/${classId}/student/all?page=${page}&limit=${limit}${timestamp}`
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
  submitQuizAttempt: async (classQuizzId: string, answers: any[], totalTime: number = 0) => {
    const response = await apiClient.post<SubmitQuizResponse>(`/api/v1/submissions`, {
      class_quiz_id: classQuizzId,
      answers,
      total_time: totalTime
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

  /**
   * Get student's submissions for a class quiz
   */
  getStudentSubmissions: async (classQuizzId: string) => {
    const response = await apiClient.get(`/api/v1/submissions/class-quiz/${classQuizzId}`)
    return response.data
  },

  /**
   * Get all student's submissions for a class
   */
  getStudentSubmissionsByClass: async (classId: string) => {
    const response = await apiClient.get(`/api/v1/submissions/student/class/${classId}`)
    return response.data
  }
}
