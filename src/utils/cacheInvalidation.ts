/**
 * Cache Invalidation Utilities
 * Helper functions to invalidate cache when needed
 */

import { cacheManager, CACHE_KEYS } from './cacheManager'

/**
 * Invalidate all class-related caches
 * Use this after user updates or joins a new class
 */
export const invalidateClassCache = () => {
  cacheManager.clear(CACHE_KEYS.STUDENT_APPLICATIONS)
}

/**
 * Invalidate class info cache for a specific class code
 */
export const invalidateClassInfoCache = (classCode: string) => {
  cacheManager.clear(CACHE_KEYS.CLASS_BY_CODE(classCode))
}

/**
 * Invalidate assignments cache for a specific class
 */
export const invalidateClassAssignmentsCache = (classId: string) => {
  cacheManager.clear(CACHE_KEYS.CLASS_ASSIGNMENTS(classId))
}

/**
 * Invalidate quiz info cache
 */
export const invalidateQuizCache = (quizId: string) => {
  cacheManager.clear(CACHE_KEYS.QUIZ_INFO(quizId))
}

/**
 * Invalidate all caches
 * Use this when user logs out or explicitly requests refresh
 */
export const invalidateAllCaches = () => {
  cacheManager.clearAll()
}

/**
 * Refresh class list - invalidates and can optionally refetch
 */
export const refreshClassList = async () => {
  invalidateClassCache()
  // Data will be refetched when component re-renders
}

/**
 * Refresh class info - invalidates and can optionally refetch
 */
export const refreshClassInfo = async (classCode: string) => {
  invalidateClassInfoCache(classCode)
  // Data will be refetched when component re-renders
}
