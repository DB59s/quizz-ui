import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios'
import { getSession, signOut } from 'next-auth/react'

const isClient = typeof window !== 'undefined'

// Create axios instance
const axiosClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://vuquangduy.io.vn',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - Add auth token
axiosClient.interceptors.request.use(
  async (config) => {
    if (isClient) {
      const session = await getSession()
      const token = (session as any)?.accessToken

      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      } else {
        // Check if this is a protected endpoint (not login/register)
        const isAuthEndpoint = config.url?.includes('/auth/login') || 
                               config.url?.includes('/auth/register')
        
        if (!isAuthEndpoint) {
          console.log('No token found, redirecting to login...')
          // Redirect to login if no token for protected endpoints
          window.location.href = '/login'
          return Promise.reject(new Error('No authentication token'))
        }
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle errors
axiosClient.interceptors.response.use(
  (response) => {
    return response
  },
  async (error: AxiosError) => {
    // Handle 401 Unauthorized - Token expired or missing
    if (error.response?.status === 401) {
      console.log('Token expired or invalid, redirecting to login...')
      
      if (isClient) {
        // Clear session and redirect to login
        await signOut({
          callbackUrl: '/login',
          redirect: true,
        })
      }
    }
    
    return Promise.reject(error)
  }
)

// Helper functions for common requests
export const apiClient = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) => 
    axiosClient.get<T>(url, config),
  
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
    axiosClient.post<T>(url, data, config),
  
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
    axiosClient.put<T>(url, data, config),
  
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
    axiosClient.patch<T>(url, data, config),
  
  delete: <T = any>(url: string, config?: AxiosRequestConfig) => 
    axiosClient.delete<T>(url, config),
}

// Utility function to clear session storage
export const clearSessionStorage = () => {
  if (isClient) {
    sessionStorage.clear()
  }
}

export default axiosClient
