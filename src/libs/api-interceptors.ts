import { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { getServerSession } from 'next-auth'
import { getSession, signOut } from 'next-auth/react'

import { authOptions } from './auth' // Adjust path to your auth config

const isServer = typeof window === 'undefined'

// Helper: read cookie value by name (client-side only)
const getCookieValue = (name: string): string | null => {
  if (typeof document === 'undefined') return null

  const match = document.cookie.match(
    new RegExp(
      '(?:^|; )' +
        name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, '\\$1') +
        '=([^;]*)',
    ),
  )

  return match ? decodeURIComponent(match[1]) : null
}

// Request interceptor
const requestInterceptor = async (config: InternalAxiosRequestConfig) => {
  try {
    let token: string | null = null
    let session: any | null = null

    if (isServer) {
      // Server-side: get session from server
      session = await getServerSession(authOptions)

      token = (session?.accessToken as string) || null
    } else {
      // Client-side: get session from client
      const clientSession = await getSession()

      token = (clientSession?.accessToken as string) || null
    }

    // Add Authorization header if token exists
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Add common headers
    if (config.headers) {
      config.headers['Content-Type'] =
        config.headers['Content-Type'] || 'application/json'
      config.headers['Accept'] = 'application/json'

      // Auto add Content-Language if not explicitly provided
      if (!('Content-Language' in config.headers)) {
        let contentLanguage: string | null = null

        if (isServer) {
          // Server-side: try to use user's defaultLanguage from session
          contentLanguage = session?.user?.defaultLanguage || null
        } else {
          // Client-side: prefer cookie, then NEXT_LOCALE, then URL prefix /[lang]/...
          contentLanguage =
            getCookieValue('locale') ||
            getCookieValue('NEXT_LOCALE') ||
            (typeof window !== 'undefined'
              ? window.location.pathname.split('/')[1] || null
              : null)
        }

        if (contentLanguage) {
          config.headers['Content-Language'] = contentLanguage
        }
      } else {
        // If Content-Language is already set in headers, respect it and don't override
        if (process.env.NODE_ENV === 'development') {
          console.log(
            'Content-Language already set in headers:',
            config.headers['Content-Language'],
          )
        }
      }

      // Log headers for debugging in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Request headers:', {
          url: config.url,
          'Content-Language': config.headers['Content-Language'],
          Authorization: config.headers['Authorization']
            ? 'Bearer ***'
            : 'None',
          'Content-Type': config.headers['Content-Type'],
        })
      }
    }

    return config
  } catch (error) {
    console.error('Request interceptor error:', error)

    return config
  }
}

// Response interceptor for success
const responseSuccessInterceptor = (response: any) => {
  // Log successful requests in development
  if (process.env.NODE_ENV === 'development') {
    console.log(
      `✅ ${response.config.method?.toUpperCase()} ${response.config.url}`,
      {
        status: response.status,
        data: response.data,
      },
    )
  }

  return response
}

const responseErrorInterceptor = async (error: any) => {
  const { config, response } = error

  if (response?.status === 401) {
    console.log('Token expired or invalid, handling authentication...')

    if (!isServer) {
      // Client-side: sign out using next-auth
      await signOut({
        callbackUrl: '/login',
        redirect: true,
      })
    }

    // Server-side handling will be done in the main api function
  }

  // Handle 403 Forbidden
  if (response?.status === 403) {
    console.log('Access forbidden')

    // Redirect will be handled in the main api function
  }

  // Handle network errors
  if (
    !response &&
    (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK')
  ) {
    error.message = 'Network error. Please check your internet connection.'
  }

  // Handle connection refused
  if (error.code === 'ECONNREFUSED') {
    console.error('Connection refused')
    error.message = 'Unable to connect to server. Please try again later.'
  }

  // Handle timeout errors
  if (error.code === 'ECONNABORTED') {
    console.error('Request timeout')
    error.message = 'Request timeout. Please try again.'
  }

  // Handle cases where config is missing (network-level errors)
  if (!config) {
    console.error('Network-level error occurred:', error.message || error)
    error.message = error.message || 'Network error occurred'
  }

  return Promise.reject(error)
}

// Apply interceptors to axios instance
export const applyInterceptors = (instance: AxiosInstance) => {
  // Request interceptor
  instance.interceptors.request.use(requestInterceptor, (error) => {
    console.error('Request interceptor error:', error)

    return Promise.reject(error)
  })

  // Response interceptors
  instance.interceptors.response.use(
    responseSuccessInterceptor,
    responseErrorInterceptor,
  )

  // Add request/response logging interceptor for debugging
  if (process.env.NODE_ENV === 'development') {
    instance.interceptors.request.use((config) => {
      console.log(
        `🚀 Starting Request: ${config.method?.toUpperCase()} ${config.url}`,
      )

      return config
    })
  }
}

// Utility function to clear auth state
export const clearAuthState = async () => {
  if (!isServer) {
    // Clear any client-side storage if needed
    localStorage.removeItem('lastVisitedPath')
    sessionStorage.clear()

    // Sign out through next-auth
    await signOut({
      callbackUrl: '/login',
      redirect: true,
    })
  }
}

// Utility function to refresh session
export const refreshSessionToken = async () => {
  if (!isServer) {
    // Trigger session refresh
    const event = new Event('visibilitychange')

    document.dispatchEvent(event)

    // Get fresh session
    return await getSession()
  }

  return null
}
