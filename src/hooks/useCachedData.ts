/**
 * Custom hook for managing cached data with automatic refresh
 */

import { useState, useEffect, useCallback } from 'react'
import { cacheManager, CACHE_KEYS, CACHE_DURATION } from '@/utils/cacheManager'

interface UseCachedDataOptions {
  duration?: { duration: number }
  skipCache?: boolean
}

/**
 * Hook to fetch and cache student applications
 */
export const useCachedStudentApplications = (fetchFn: () => Promise<any>, options: UseCachedDataOptions = {}) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Try cache first unless skipped
      if (!options.skipCache) {
        const cached = cacheManager.get(CACHE_KEYS.STUDENT_APPLICATIONS)
        if (cached) {
          setData(cached)
          setLoading(false)
          return
        }
      }

      // Fetch from API
      const result = await fetchFn()
      if (result.success && result.data) {
        // Cache the result
        cacheManager.set(
          CACHE_KEYS.STUDENT_APPLICATIONS,
          result.data,
          options.duration || CACHE_DURATION.MEDIUM
        )
        setData(result.data)
      } else {
        setError(result.message || 'Failed to fetch data')
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [fetchFn, options])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { data, loading, error, refetch: fetch }
}

/**
 * Hook to fetch and cache class info by code
 */
export const useCachedClassByCode = (classCode: string, fetchFn: (code: string) => Promise<any>, options: UseCachedDataOptions = {}) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!classCode) return

    setLoading(true)
    setError(null)

    try {
      const cacheKey = CACHE_KEYS.CLASS_BY_CODE(classCode)

      // Try cache first unless skipped
      if (!options.skipCache) {
        const cached = cacheManager.get(cacheKey)
        if (cached) {
          setData(cached)
          setLoading(false)
          return
        }
      }

      // Fetch from API
      const result = await fetchFn(classCode)
      if (result.success && result.data) {
        // Cache the result
        cacheManager.set(cacheKey, result.data, options.duration || CACHE_DURATION.LONG)
        setData(result.data)
      } else {
        setError(result.message || 'Failed to fetch class data')
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [classCode, fetchFn, options])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { data, loading, error, refetch: fetch }
}
