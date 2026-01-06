'use client'

import { useQuery } from '@tanstack/react-query'
import { classService } from '@/services/class.service'
import { cacheManager, CACHE_KEYS, CACHE_DURATION } from '@/utils/cacheManager'

interface ClassDetailInfo {
  id: string
  name: string
  code: string
  teacher: string
  description: string
  maxStudents: number
  currentStudents: number
}

/**
 * Fetch class detail information with caching
 * Leverages cache from useClasses for faster initial load
 */
export function useClassDetail(classId: string) {
  return useQuery({
    queryKey: ['class', 'detail', classId],
    queryFn: async (): Promise<ClassDetailInfo> => {
      // Try to get from cached applications first
      const cachedApplications = cacheManager.get<any[]>(CACHE_KEYS.STUDENT_APPLICATIONS)
      let foundClass = cachedApplications?.find((app: any) => app.class._id === classId)

      // If not in cache, fetch from API
      if (!foundClass) {
        const response = await classService.getStudentApplications()

        if (response.success && response.data?.classes) {
          foundClass = response.data.classes.find((app: any) => app.class._id === classId)
          // Cache the applications
          cacheManager.set(CACHE_KEYS.STUDENT_APPLICATIONS, response.data.classes, CACHE_DURATION.MEDIUM)
        }
      }

      if (!foundClass) {
        throw new Error('Class not found')
      }

      // Check cache for class info
      const cacheKey = CACHE_KEYS.CLASS_BY_CODE(foundClass.class.class_code)
      let classRes = cacheManager.get<any>(cacheKey)

      if (!classRes) {
        // If not in cache, fetch from API
        const apiResponse = await classService.getClassByCode(foundClass.class.class_code)
        classRes = apiResponse
        // Cache the result
        cacheManager.set(cacheKey, apiResponse, CACHE_DURATION.LONG)
      }

      return {
        id: foundClass.class._id,
        name: foundClass.class.name,
        code: foundClass.class.class_code,
        teacher: classRes?.data?.teacher?.full_name || 'Chưa có thông tin',
        description: foundClass.class.description || 'Không có mô tả',
        maxStudents: foundClass.class.max_students,
        currentStudents: foundClass.class.current_students
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - class details don't change often
    gcTime: 10 * 60 * 1000,
    enabled: !!classId // Only run query if classId is provided
  })
}
