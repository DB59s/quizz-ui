'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { submissionService, type Submission, type PaginationInfo } from '@/services/submission.service'
import { useEffect } from 'react'

interface UseSubmissionsOptions {
  page?: number
  limit?: number
  classId?: string
}

interface UseSubmissionsResult {
  submissions: Submission[]
  pagination: PaginationInfo | null
  isLoading: boolean
  error: Error | null
}

/**
 * Fetch student submissions with pagination and optional class filtering
 * Supports prefetching next page for instant navigation
 */
export function useSubmissions({ page = 1, limit = 10, classId }: UseSubmissionsOptions = {}): UseSubmissionsResult {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['submissions', { page, limit }],
    queryFn: async () => {
      const response = await submissionService.getMySubmissions(page, limit)

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch submissions')
      }

      return {
        submissions: response.data,
        pagination: response.pagination
      }
    },
    staleTime: 1 * 60 * 1000, // 1 minute - submissions may change frequently
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchOnMount: true // Always refetch for fresh submissions
  })

  // Prefetch next page for instant navigation
  useEffect(() => {
    if (query.data?.pagination && query.data.pagination.current_page < query.data.pagination.total_pages) {
      queryClient.prefetchQuery({
        queryKey: ['submissions', { page: page + 1, limit }],
        queryFn: async () => {
          const response = await submissionService.getMySubmissions(page + 1, limit)
          return {
            submissions: response.data,
            pagination: response.pagination
          }
        }
      })
    }
  }, [query.data, page, limit, queryClient])

  // Filter by classId if provided
  const filteredSubmissions =
    classId && query.data?.submissions
      ? query.data.submissions.filter(s => s.class_id === classId)
      : query.data?.submissions || []

  return {
    submissions: filteredSubmissions,
    pagination: query.data?.pagination || null,
    isLoading: query.isLoading,
    error: query.error
  }
}
