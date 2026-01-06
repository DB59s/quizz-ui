'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { classService } from '@/services/class.service'
import { toast } from 'react-toastify'

type ApplicationStatus = 'pending' | 'approved' | 'rejected'

interface Application {
  registration_id: string
  status: ApplicationStatus
  status_code: number
  created_at: string
  class: {
    _id: string
    teacher_id: string
    name: string
    description: string
    max_students: number
    current_students: number
    class_code: string
    status: string
    created_at: string
    updated_at: string
  }
  teacherName?: string
}

/**
 * Fetch all student applications (pending, approved, rejected) with teacher info
 */
export function useApplications() {
  return useQuery({
    queryKey: ['applications'],
    queryFn: async (): Promise<Application[]> => {
      const response = await classService.getStudentApplications()

      if (!response.success || !response.data?.classes) {
        throw new Error(response.message || 'Failed to fetch applications')
      }

      const applicationsData = response.data.classes

      // Fetch teacher names for each class in parallel
      const applicationsWithTeachers = await Promise.all(
        applicationsData.map(async (app: Application) => {
          try {
            const classInfo = await classService.getClassByCode(app.class.class_code)
            return {
              ...app,
              teacherName: classInfo.data?.teacher?.full_name || 'Chưa có thông tin'
            }
          } catch (error) {
            return {
              ...app,
              teacherName: 'Chưa có thông tin'
            }
          }
        })
      )

      return applicationsWithTeachers
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - applications may change frequently
    gcTime: 10 * 60 * 1000
  })
}

/**
 * Cancel a class registration/application with optimistic updates
 */
export function useCancelApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (registrationId: string) => {
      const response = await classService.cancelRegistration(registrationId)
      return response.data
    },
    onMutate: async registrationId => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['applications'] })

      // Snapshot the previous value
      const previousApplications = queryClient.getQueryData<Application[]>(['applications'])

      // Optimistically update to remove the application
      queryClient.setQueryData<Application[]>(['applications'], old =>
        old ? old.filter(app => app.registration_id !== registrationId) : []
      )

      // Return context with previous value for rollback
      return { previousApplications }
    },
    onError: (err: any, registrationId, context) => {
      // Rollback to previous value on error
      if (context?.previousApplications) {
        queryClient.setQueryData(['applications'], context.previousApplications)
      }
      toast.error(err?.response?.data?.message || 'Không thể hủy đơn đăng ký', {
        position: 'bottom-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true
      })
    },
    onSuccess: () => {
      // Invalidate and refetch applications on success
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      toast.success('Đã hủy đơn đăng ký thành công!', {
        position: 'bottom-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true
      })
    }
  })
}
