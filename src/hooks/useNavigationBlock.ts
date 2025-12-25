'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface UseNavigationBlockOptions {
  when: boolean
  message?: string
}

interface NavigationAttempt {
  type: 'push' | 'back'
  args?: any[]
}

export const useNavigationBlock = ({ when, message }: UseNavigationBlockOptions) => {
  const router = useRouter()
  const hasBlockedRef = useRef(false)
  const [showDialog, setShowDialog] = useState(false)
  const [dialogMessage, setDialogMessage] = useState('')
  const pendingNavigationRef = useRef<NavigationAttempt | null>(null)
  const originalPushRef = useRef<any>(null)
  const originalBackRef = useRef<any>(null)
  const hasInitializedHistoryRef = useRef(false) // Track if we've pushed initial state

  const defaultMessage =
    message || 'Bạn có chắc chắn muốn rời khỏi trang? Bài làm của bạn đã được lưu và bạn có thể tiếp tục sau.'

  const handleConfirmNavigation = useCallback(() => {
    setShowDialog(false)
    const navigation = pendingNavigationRef.current

    if (navigation && originalPushRef.current && originalBackRef.current) {
      hasBlockedRef.current = true // Temporarily disable blocking

      if (navigation.type === 'push' && navigation.args) {
        originalPushRef.current.apply(router, navigation.args)
      } else if (navigation.type === 'back') {
        originalBackRef.current.apply(router)
      }

      // Reset after navigation
      setTimeout(() => {
        hasBlockedRef.current = false
        pendingNavigationRef.current = null
      }, 100)
    }
  }, [router])

  const handleCancelNavigation = useCallback(() => {
    setShowDialog(false)
    pendingNavigationRef.current = null
  }, [])

  useEffect(() => {
    if (!when) {
      hasBlockedRef.current = false
      return
    }

    // Block browser refresh, close tab (must use native confirm)
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (when && !hasBlockedRef.current) {
        e.preventDefault()
        // Modern browsers ignore custom messages, but we still need to set returnValue
        e.returnValue = defaultMessage
        return e.returnValue
      }
    }

    // Block browser back button (Alt + Left Arrow) with native confirm
    const handlePopState = () => {
      if (when && !hasBlockedRef.current) {
        const shouldLeave = window.confirm(defaultMessage)
        if (!shouldLeave) {
          // Go forward to cancel the back navigation
          window.history.go(1)
        } else {
          // User confirmed, allow navigation by disabling block temporarily
          hasBlockedRef.current = true
        }
      }
    }

    // Push initial dummy state to enable popstate detection (only once)
    if (!hasInitializedHistoryRef.current) {
      window.history.pushState(null, '', window.location.pathname)
      hasInitializedHistoryRef.current = true
    }

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('popstate', handlePopState)

    // Store original router methods
    if (!originalPushRef.current) {
      originalPushRef.current = router.push
    }
    if (!originalBackRef.current) {
      originalBackRef.current = router.back
    }

    // Override router.push to show dialog
    router.push = (...args: Parameters<typeof router.push>) => {
      if (when && !hasBlockedRef.current) {
        pendingNavigationRef.current = { type: 'push', args }
        setDialogMessage(defaultMessage)
        setShowDialog(true)
        return Promise.resolve()
      }
      return originalPushRef.current.apply(router, args)
    }

    // Override router.back to show dialog
    router.back = () => {
      if (when && !hasBlockedRef.current) {
        pendingNavigationRef.current = { type: 'back' }
        setDialogMessage(defaultMessage)
        setShowDialog(true)
        return
      }
      return originalBackRef.current.apply(router)
    }

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopState)
      if (originalPushRef.current) {
        router.push = originalPushRef.current
      }
      if (originalBackRef.current) {
        router.back = originalBackRef.current
      }
    }
  }, [when, defaultMessage, router, handleConfirmNavigation])

  // Function to permanently disable blocking (useful when submitting)
  const allowNavigation = useCallback(() => {
    hasBlockedRef.current = true
    setShowDialog(false)
  }, [])

  return {
    allowNavigation,
    showDialog,
    dialogMessage,
    handleConfirmNavigation,
    handleCancelNavigation
  }
}
