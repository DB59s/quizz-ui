'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService, type UserProfile } from '@/services'

/**
 * Fetch user profile with caching
 */
export function useUserProfile() {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: async (): Promise<UserProfile> => {
      const response = await userService.getProfile()

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch user profile')
      }

      return response.data
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - profile data doesn't change often
    gcTime: 30 * 60 * 1000, // 30 minutes in cache
    refetchOnMount: false // Don't refetch if data is fresh
  })
}

/**
 * Update user profile with optimistic updates
 */
export function useUpdateUserProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updatedData: Partial<UserProfile>) => {
      const response = await userService.updateProfile(updatedData)
      return response.data
    },
    onMutate: async updatedData => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['user', 'profile'] })

      // Snapshot the previous value
      const previousProfile = queryClient.getQueryData<UserProfile>(['user', 'profile'])

      // Optimistically update to the new value
      if (previousProfile) {
        queryClient.setQueryData<UserProfile>(['user', 'profile'], {
          ...previousProfile,
          ...updatedData
        })
      }

      // Return context with previous value for rollback
      return { previousProfile }
    },
    onError: (err, updatedData, context) => {
      // Rollback to previous value on error
      if (context?.previousProfile) {
        queryClient.setQueryData(['user', 'profile'], context.previousProfile)
      }
    },
    onSuccess: data => {
      // Update cache with server response
      queryClient.setQueryData(['user', 'profile'], data)
    }
  })
}
