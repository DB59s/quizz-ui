/**
 * Cache Manager Utility
 * Handles caching of API responses with expiration times
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

interface CacheConfig {
  duration: number // in milliseconds
}

const DEFAULT_CACHE_CONFIG: CacheConfig = {
  duration: 5 * 60 * 1000 // 5 minutes
}

class CacheManager {
  private cache: Map<string, CacheEntry<any>> = new Map()

  /**
   * Get cached data if it exists and hasn't expired
   */
  get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null

    try {
      const entry = this.cache.get(key)
      if (!entry) return null

      // Check if cache has expired
      if (Date.now() > entry.expiresAt) {
        this.cache.delete(key)
        return null
      }

      return entry.data as T
    } catch (error) {
      console.warn('[CacheManager] Error getting cache:', error)
      return null
    }
  }

  /**
   * Set cache with expiration time
   */
  set<T>(key: string, data: T, config: CacheConfig = DEFAULT_CACHE_CONFIG): void {
    if (typeof window === 'undefined') return

    try {
      const timestamp = Date.now()
      const expiresAt = timestamp + config.duration

      this.cache.set(key, {
        data,
        timestamp,
        expiresAt
      })
    } catch (error) {
      console.warn('[CacheManager] Error setting cache:', error)
    }
  }

  /**
   * Clear specific cache entry
   */
  clear(key: string): void {
    if (typeof window === 'undefined') return
    try {
      this.cache.delete(key)
    } catch (error) {
      console.warn('[CacheManager] Error clearing cache:', error)
    }
  }

  /**
   * Clear all cache
   */
  clearAll(): void {
    if (typeof window === 'undefined') return
    try {
      this.cache.clear()
    } catch (error) {
      console.warn('[CacheManager] Error clearing all cache:', error)
    }
  }

  /**
   * Get cache info for debugging
   */
  getInfo(key: string): { age: number; expiresIn: number } | null {
    if (typeof window === 'undefined') return null

    try {
      const entry = this.cache.get(key)
      if (!entry) return null

      const now = Date.now()
      return {
        age: now - entry.timestamp,
        expiresIn: Math.max(0, entry.expiresAt - now)
      }
    } catch (error) {
      console.warn('[CacheManager] Error getting cache info:', error)
      return null
    }
  }
}

export const cacheManager = new CacheManager()

export const CACHE_KEYS = {
  STUDENT_CLASSES: 'student_classes',
  STUDENT_APPLICATIONS: 'student_applications',
  CLASS_BY_CODE: (code: string) => `class_${code}`,
  CLASS_ASSIGNMENTS: (classId: string) => `assignments_${classId}`,
  QUIZ_INFO: (quizId: string) => `quiz_${quizId}`
}

export const CACHE_DURATION = {
  SHORT: { duration: 2 * 60 * 1000 }, // 2 minutes
  MEDIUM: { duration: 5 * 60 * 1000 }, // 5 minutes
  LONG: { duration: 15 * 60 * 1000 } // 15 minutes
}
