/**
 * Debug Logger
 * Logs API calls and component lifecycle for debugging
 */

interface ApiCallLog {
  timestamp: string
  method: string
  endpoint: string
  duration: number
  status: 'success' | 'error'
}

const API_LOGS: ApiCallLog[] = []

export const debugLogger = {
  /**
   * Log API call
   */
  logApiCall(endpoint: string, method: string = 'GET', duration: number, status: 'success' | 'error' = 'success') {
    const log: ApiCallLog = {
      timestamp: new Date().toLocaleTimeString(),
      method,
      endpoint,
      duration,
      status
    }

    API_LOGS.push(log)

    // Keep only last 50 logs
    if (API_LOGS.length > 50) {
      API_LOGS.shift()
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      const color = status === 'success' ? '#4CAF50' : '#F44336'
      console.log(
        `%c[API] ${method} ${endpoint} - ${duration}ms`,
        `color: ${color}; font-weight: bold;`
      )
    }
  },

  /**
   * Log component mount/unmount
   */
  logComponentLifecycle(componentName: string, event: 'mount' | 'unmount') {
    if (process.env.NODE_ENV === 'development') {
      const color = event === 'mount' ? '#2196F3' : '#FF9800'
      console.log(
        `%c[${componentName}] ${event.toUpperCase()}`,
        `color: ${color}; font-weight: bold;`
      )
    }
  },

  /**
   * Log function execution
   */
  logFunctionCall(functionName: string, args?: any) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`%c[FUNCTION] ${functionName}`, 'color: #9C27B0; font-weight: bold;', args)
    }
  },

  /**
   * Get all API logs
   */
  getApiLogs(): ApiCallLog[] {
    return API_LOGS
  },

  /**
   * Clear API logs
   */
  clearApiLogs() {
    API_LOGS.length = 0
  },

  /**
   * Print API logs to console (for debugging)
   */
  printApiLogs() {
    console.table(API_LOGS)
  },

  /**
   * Check for duplicate API calls
   */
  checkDuplicateCalls(): Map<string, number> {
    const callCounts = new Map<string, number>()

    API_LOGS.forEach(log => {
      const key = `${log.method} ${log.endpoint}`
      callCounts.set(key, (callCounts.get(key) || 0) + 1)
    })

    const duplicates = new Map<string, number>()
    callCounts.forEach((count, key) => {
      if (count > 1) {
        duplicates.set(key, count)
      }
    })

    if (duplicates.size > 0) {
      console.warn('%c⚠️  Duplicate API calls detected:', 'color: #FF9800; font-weight: bold;')
      console.table(Array.from(duplicates.entries()))
    }

    return duplicates
  }
}

// Expose to window for console debugging
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).debugLogger = debugLogger
}
