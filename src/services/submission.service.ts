import { apiClient } from '@/libs/axios-client'

// Types
export interface Submission {
  submission_id: string
  class_quiz_id: string
  quiz_name: string
  class_name: string
  class_id: string
  submission_time: string
  total_time: number
  score: number
  n_total_true: number
  status: 'graded' | 'pending'
}

export interface PaginationInfo {
  current_page: number
  items_per_page: number
  total_items: number
  total_pages: number
}

export interface GetSubmissionsResponse {
  success: boolean
  message: string
  data: Submission[]
  pagination: PaginationInfo
}

const SUBMISSION_API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

export const submissionService = {
  /**
   * Get all submissions for current user with pagination
   */
  getMySubmissions: async (page: number = 1, limit: number = 10) => {
    const response = await apiClient.get<GetSubmissionsResponse>(
      `${SUBMISSION_API_BASE}/api/v1/submissions/me?page=${page}&limit=${limit}`
    )
    return response.data
  }
}
