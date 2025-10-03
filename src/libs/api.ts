/* eslint-disable @typescript-eslint/no-explicit-any */

import { redirect } from 'next/navigation'

import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { getServerSession } from 'next-auth'
import { getSession, signOut } from 'next-auth/react'

import { applyInterceptors } from './api-interceptors'
import { authOptions } from './auth'

enum HTTP_ERROR_CODE {
  BAD_REQUEST = 'ERR_BAD_REQUEST',
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500
}

export class CustomError extends Error {
  public statusCode: string

  constructor(message: string, statusCode?: string) {
    super(message)
    this.statusCode = statusCode || ''
  }
}

export const isServer = typeof window === 'undefined'

// Use the same API URL as auth.ts for consistency
const baseUrlAPI = isServer
  ? process.env.API_URL
  : process.env.NEXT_PUBLIC_API_URL

let clientInstance: AxiosInstance | null = null
let serverInstance: AxiosInstance | null = null

const getClientInstance = (): AxiosInstance => {
  if (!clientInstance) {
    clientInstance = axios.create({
      baseURL: baseUrlAPI
    })
    applyInterceptors(clientInstance)
  }

  return clientInstance
}

const getServerInstance = (): AxiosInstance => {
  if (!serverInstance) {
    serverInstance = axios.create({
      baseURL: baseUrlAPI
    })
    applyInterceptors(serverInstance)
  }

  return serverInstance
}

const getSessionToken = async (): Promise<string | null> => {
  try {
    if (isServer) {
      const session = await getServerSession(authOptions)

      return session?.accessToken || null
    } else {
      const session = await getSession()

      return session?.accessToken || null
    }
  } catch (error) {
    console.error('Error getting session token:', error)

    return null
  }
}

// Utility function to check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const token = await getSessionToken()

    return !!token
  } catch (error) {
    console.error('Error checking authentication:', error)

    return false
  }
}

// Utility function to get current user session
export const getCurrentSession = async () => {
  try {
    if (isServer) {
      return await getServerSession(authOptions)
    } else {
      return await getSession()
    }
  } catch (error) {
    console.error('Error getting current session:', error)

    return null
  }
}

const handleAuthError = async (error: any): Promise<CustomError> => {
  console.error('Authentication error:', error)

  if (isServer) {
    // Use redirect for server-side
    redirect('/login')
  } else {
    // Use signOut for client-side
    await signOut({ callbackUrl: '/login' })
  }

  return new CustomError('Unauthorized. Please log in again.', '401')
}

const handleForbiddenError = (): CustomError => {
  if (isServer) {
    redirect('/403')
  } else {
    window.location.href = '/403'
  }

  return new CustomError('Forbidden. Access denied.', '403')
}

export const api = async (input: string, init: AxiosRequestConfig = {}) => {
  const instance = isServer ? getServerInstance() : getClientInstance()

  try {
    const token = await getSessionToken()

    const config: AxiosRequestConfig = {
      ...init,
      url: input,
      headers: {
        'Content-Type': 'application/json',
        ...init.headers,
        ...(token && { Authorization: `Bearer ${token}` })
      }
    }

    const res = await instance.request(config)

    return res.data
  } catch (error: any) {
    const { code, response } = error

    // Log the full error for debugging
    console.error('API Error Details:', {
      url: input,
      status: response?.status,
      statusText: response?.statusText,
      data: response?.data,
      code: code
    })

    // Handle 401 Unauthorized
    if (
      response?.status === HTTP_ERROR_CODE.UNAUTHORIZED ||
      response?.data?.statusCode === HTTP_ERROR_CODE.UNAUTHORIZED
    ) {
      console.log('Unauthorized access, redirecting to sign in...')

      return await handleAuthError(error)
    }

    // Handle 403 Forbidden
    if (response?.status === HTTP_ERROR_CODE.FORBIDDEN || response?.data?.statusCode === HTTP_ERROR_CODE.FORBIDDEN) {
      console.log('Forbidden access, redirecting to 403...')

      return handleForbiddenError()
    }

    // Handle 404 Not Found - but don't throw error, return null instead
    // if (response?.status === HTTP_ERROR_CODE.NOT_FOUND || response?.data?.statusCode === HTTP_ERROR_CODE.NOT_FOUND) {
    //   console.log('Resource not found:', input)

    //   return null
    // }

    // Handle 500 Internal Server Error
    if (
      response?.status === HTTP_ERROR_CODE.INTERNAL_SERVER_ERROR ||
      response?.data?.statusCode === HTTP_ERROR_CODE.INTERNAL_SERVER_ERROR
    ) {
      return new CustomError(response?.data?.message || 'Internal Server Error', '500')
    }

    // Handle 400 Bad Request
    if (code === HTTP_ERROR_CODE.BAD_REQUEST && response?.data?.message) {
      return new CustomError(response.data.message, response?.data?.statusCode?.toString() || '400')
    }

    // For unhandled errors, log and re-throw
    console.error('Unhandled API error:', error)
    throw error
  }
}

export const apiGet = (url: string, config?: AxiosRequestConfig) => api(url, { ...config, method: 'GET' })

export const apiPost = (url: string, data?: any, config?: AxiosRequestConfig) =>
  api(url, { ...config, method: 'POST', data })

export const apiPut = (url: string, data?: any, config?: AxiosRequestConfig) =>
  api(url, { ...config, method: 'PUT', data })

export const apiPatch = (url: string, data?: any, config?: AxiosRequestConfig) =>
  api(url, { ...config, method: 'PATCH', data })

export const apiDelete = (url: string, config?: AxiosRequestConfig) => api(url, { ...config, method: 'DELETE' })

export const serverApi = async (input: string, init: AxiosRequestConfig = {}) => {
  if (!isServer) {
    throw new Error('serverApi can only be used on the server side')
  }

  const session = await getServerSession(authOptions)

  if (!session?.accessToken) {
    throw new CustomError('No valid session found', '401')
  }

  const instance = getServerInstance()

  try {
    const config: AxiosRequestConfig = {
      ...init,
      url: input,
      headers: {
        'Content-Type': 'application/json',
        ...init.headers,
        Authorization: `Bearer ${session.accessToken}`
      }
    }

    const res = await instance.request(config)

    return res.data
  } catch (error: any) {
    const { response } = error

    if (response?.status === HTTP_ERROR_CODE.UNAUTHORIZED) {
      redirect('/auth/signin')
    }

    if (response?.status === HTTP_ERROR_CODE.FORBIDDEN) {
      redirect('/403')
    }

    if (response?.status === HTTP_ERROR_CODE.NOT_FOUND) {
      throw new CustomError('Resource not found', '404')
    }

    throw error
  }
}
