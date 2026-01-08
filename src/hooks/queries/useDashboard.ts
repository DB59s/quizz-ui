'use client'

import { useQuery } from '@tanstack/react-query'
import { dashboardService, type DashboardData } from '@/services/dashboard.service'

/**
 * Fetch student dashboard data (KPIs and progress chart)
 */
export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard', 'student'],
    queryFn: async (): Promise<DashboardData> => {
      const response = await dashboardService.getStudentDashboard()

      if (!response.success || !response.data) {
        throw new Error('Failed to fetch dashboard data')
      }

      return response.data
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - moderate freshness for dashboard
    gcTime: 10 * 60 * 1000,
    refetchOnMount: true, // Always refetch when mounting for fresh stats
    refetchOnWindowFocus: true // Refetch when user returns to tab
  })
}
