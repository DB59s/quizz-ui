import { apiClient } from '@/libs/axios-client'

export interface QuizAnswer {
  id: string
  content: string
  is_true: boolean
}

export interface QuizQuestion {
  id: string
  content: string
  level: number
  type: string
  teacher_id: string
  answers: QuizAnswer[]
  created_at: string
  updated_at: string
}

export interface QuizDetail {
  id: string
  name: string
  description: string
  teacher_id: string
  class_id: string
  start_time: string
  end_time: string
  questions: QuizQuestion[]
  created_at: string
  updated_at: string
}

export interface QuizDetailResponse {
  success: boolean
  message: string
  data: QuizDetail
}

export interface SubmitQuizPayload {
  answers: Array<{
    question_id: string
    selected_option_id: string
  }>
}

export interface QuizResultResponse {
  success: boolean
  message: string
  data: {
    attempt_id: string
    score: number
    total_score: number
    percentage: number
    passed: boolean
    answers: Array<{
      question_id: string
      selected_option_id: string
      is_correct: boolean
      correct_option_id: string
    }>
  }
}

export const quizService = {
  /**
   * Get quiz details with questions for student
   */
  getQuizForStudent: async (quizId: string) => {
    const response = await apiClient.get<QuizDetailResponse>(
      `/api/v1/quizzes/${quizId}/student`
    )
    return response.data
  },

  /**
   * Submit quiz answers
   */
  submitQuiz: async (quizId: string, payload: SubmitQuizPayload) => {
    const response = await apiClient.post<QuizResultResponse>(
      `/api/v1/quizzes/${quizId}/submit`,
      payload
    )
    return response.data
  },

  /**
   * Get quiz attempt result
   */
  getQuizResult: async (attemptId: string) => {
    const response = await apiClient.get<QuizResultResponse>(
      `/api/v1/quiz-attempts/${attemptId}/result`
    )
    return response.data
  },
}
