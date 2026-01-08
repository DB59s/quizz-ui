'use client'

import { useQuery } from '@tanstack/react-query'
import { classService } from '@/services/class.service'
import { cacheManager, CACHE_KEYS, CACHE_DURATION } from '@/utils/cacheManager'

interface ClassInfo {
  registration_id: string
  status: 'pending' | 'approved' | 'rejected'
  class: {
    _id: string
    name: string
    description: string
    max_students: number
    current_students: number
    class_code: string
  }
  teacherName?: string
}

/**
 * Fetch student's approved classes with teacher information
 * This hook optimizes the original implementation that made sequential API calls
 */
export function useClasses() {
  return useQuery({
    queryKey: ['classes', 'approved'],
    queryFn: async (): Promise<ClassInfo[]> => {
      // Try to get from cache first for immediate response
      const cachedClasses = cacheManager.get<ClassInfo[]>(CACHE_KEYS.STUDENT_APPLICATIONS)

      // Fetch student applications
      const response = await classService.getStudentApplications()

      if (!response.success || !response.data?.classes) {
        throw new Error(response.message || 'Failed to fetch classes')
      }

      // Filter only approved classes
      const approvedClasses = response.data.classes.filter((app: ClassInfo) => app.status === 'approved')

      // Fetch teacher names for each class in parallel
      const classesWithTeachers = await Promise.all(
        approvedClasses.map(async (app: ClassInfo) => {
          try {
            // Check cache for class info first
            const cacheKey = CACHE_KEYS.CLASS_BY_CODE(app.class.class_code)
            let classInfo = cacheManager.get(cacheKey)

            if (!classInfo) {
              // If not in cache, fetch from API
              const apiResponse = await classService.getClassByCode(app.class.class_code)
              classInfo = apiResponse.data
              // Cache the result
              cacheManager.set(cacheKey, classInfo, CACHE_DURATION.LONG)
            }

            return {
              ...app,
              teacherName: (classInfo as any)?.teacher?.full_name || 'Chưa có thông tin'
            }
          } catch (error) {
            return {
              ...app,
              teacherName: 'Chưa có thông tin'
            }
          }
        })
      )

      // Update cache with final result
      cacheManager.set(CACHE_KEYS.STUDENT_APPLICATIONS, classesWithTeachers, CACHE_DURATION.MEDIUM)

      return classesWithTeachers
    },
    staleTime: 3 * 60 * 1000, // 3 minutes - classes don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes in cache
    refetchOnWindowFocus: true, // Refetch on window focus
    refetchOnMount: true // Refetch on mount
  })
}
