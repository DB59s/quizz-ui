import { apiClient } from '@/libs/axios-client'

export interface DashboardKPI {
  total_classes_joined: number
  total_submissions: number
  average_score: number
  upcoming_quizzes: number
}

export interface ProgressChartData {
  date?: string
  score?: number
  // Add more fields based on actual API response
}

export interface DashboardData {
  kpi: DashboardKPI
  progress_chart: ProgressChartData[]
}

export interface DashboardResponse {
  success: boolean
  data: DashboardData
}

export const dashboardService = {
  /**
   * Get student dashboard data (KPIs and progress chart)
   */
  getStudentDashboard: async () => {
    const response = await apiClient.get<DashboardResponse>('/api/v1/dashboard/student')
    return response.data
  }
}
