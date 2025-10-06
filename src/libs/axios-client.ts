import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios'
import { getSession } from 'next-auth/react'

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
  (error: AxiosError) => {
    // Don't auto-redirect, just return the error
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
