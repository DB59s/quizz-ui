import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes - cache garbage collection time (formerly cacheTime)
      refetchOnWindowFocus: false, // Don't refetch when user switches tabs
      retry: 1, // Only retry failed requests once
      refetchOnReconnect: true // Refetch when connection is restored
    }
  }
})
