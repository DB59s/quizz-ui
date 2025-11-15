// Cache utility for class assignments
type CachedData = {
  assignments: any[]
  classInfo: any | null
  pagination: {
    currentPage: number
    totalPages: number
    itemsPerPage: number
    totalItems: number
  }
  timestamp: number
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const getCacheKey = (classId: string, page: number) => `class_assignments_${classId}_${page}`
const getClassInfoCacheKey = (classId: string) => `class_info_${classId}`

export const assignmentsCache = {
  /**
   * Get cached assignments for a class and page
   */
  get: (classId: string, page: number): CachedData | null => {
    if (!classId) return null

    const cacheKey = getCacheKey(classId, page)

    try {
      const cachedData = sessionStorage.getItem(cacheKey)
      if (cachedData) {
        const parsed: CachedData = JSON.parse(cachedData)
        const cacheAge = Date.now() - parsed.timestamp

        if (cacheAge < CACHE_DURATION) {
          return parsed
        } else {
          sessionStorage.removeItem(cacheKey)
        }
      }
    } catch (err) {
      sessionStorage.removeItem(cacheKey)
    }

    return null
  },

  /**
   * Set cached assignments for a class and page
   */
  set: (classId: string, page: number, data: Omit<CachedData, 'timestamp'>): void => {
    if (!classId) return

    const cacheKey = getCacheKey(classId, page)
    const cachedData: CachedData = {
      ...data,
      timestamp: Date.now()
    }

    try {
      sessionStorage.setItem(cacheKey, JSON.stringify(cachedData))
    } catch (err) {
      console.error('Error caching assignments:', err)
    }
  },

  /**
   * Get cached class info
   */
  getClassInfo: (classId: string): any | null => {
    if (!classId) return null

    const cacheKey = getClassInfoCacheKey(classId)

    try {
      const cachedData = sessionStorage.getItem(cacheKey)
      if (cachedData) {
        const parsed = JSON.parse(cachedData)
        const cacheAge = Date.now() - parsed.timestamp

        if (cacheAge < CACHE_DURATION) {
          return parsed.data
        } else {
          sessionStorage.removeItem(cacheKey)
        }
      }
    } catch (err) {
      sessionStorage.removeItem(cacheKey)
    }

    return null
  },

  /**
   * Set cached class info
   */
  setClassInfo: (classId: string, classInfo: any): void => {
    if (!classId) return

    const cacheKey = getClassInfoCacheKey(classId)

    try {
      sessionStorage.setItem(
        cacheKey,
        JSON.stringify({
          data: classInfo,
          timestamp: Date.now()
        })
      )
    } catch (err) {
      console.error('Error caching class info:', err)
    }
  },

  /**
   * Clear cache for a class and page
   */
  clear: (classId: string, page: number): void => {
    const cacheKey = getCacheKey(classId, page)
    sessionStorage.removeItem(cacheKey)
  },

  /**
   * Clear all cache for a class
   */
  clearAll: (classId: string): void => {
    if (!classId) return

    // Clear all pages for this class
    const keys = Object.keys(sessionStorage)
    keys.forEach(key => {
      if (key.startsWith(`class_assignments_${classId}_`) || key === getClassInfoCacheKey(classId)) {
        sessionStorage.removeItem(key)
      }
    })
  }
}

