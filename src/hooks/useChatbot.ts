'use client'

// React Imports
import { useEffect, useState, useCallback, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

// Service Imports
import { chatbotService, type Conversation, type ChatMessage as APIChatMessage } from '@/services/chatbot.service'

// Types
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface ChatContext {
  type: 'question' | 'knowledge'
  id?: string
  force_type?: 'question_bank' | 'knowledge_base' | 'general'
}

interface ChatMessageRequest {
  account_id: string
  prompt: string
  conversation_id?: string | null | undefined
  context?:
    | ChatContext
    | {
        force_type?: 'question_bank' | 'knowledge_base' | 'general'
      }
    | null
}

interface ChatMessageResponse {
  success: boolean
  data?: {
    response: string
    conversation_id: string
    timestamp: string
  }
  message?: string
}

// Use localhost for development, production URL for production
// Will fallback to production if localhost fails
const getSocketUrl = () => {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL
  }

  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:9008'
  }

  return process.env.NEXT_PUBLIC_API_URL || ''
}

const SOCKET_URL = getSocketUrl()

export function useChatbot(accountId: string | null | undefined) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingConversations, setIsLoadingConversations] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [socketUrl, setSocketUrl] = useState<string>(SOCKET_URL)
  const hasTriedFallback = useRef(false)

  // Initialize socket
  useEffect(() => {
    if (!accountId) {

      return
    }

    // Reset fallback flag when socketUrl changes (but not when accountId changes)
    // This allows retry when URL is manually changed
    if (socketUrl !== SOCKET_URL && !socketUrl.includes('localhost')) {
      hasTriedFallback.current = false
    }


    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'], // Try websocket first, then polling
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
      forceNew: false,
      upgrade: true, // Allow upgrade from polling to websocket
      rememberUpgrade: false
    })

    socketRef.current = newSocket
    setSocket(newSocket)

    // Connection events
    newSocket.on('connect', () => {

      setConnected(true)
      setError(null)

      // Reset fallback flag on successful connection
      if (!socketUrl.includes('localhost')) {
        hasTriedFallback.current = false
      }
    })

    newSocket.on('disconnect', reason => {

      setConnected(false)
    })

    newSocket.on('connect_error', (error: any) => {
      // Check if this is a localhost error that should trigger fallback
      const isLocalhostError =
        error.message?.includes('refused') ||
        error.message?.includes('xhr poll error') ||
        error.message?.includes('websocket error') ||
        error.type === 'TransportError' ||
        (error as any)?.description?.isTrusted === true

      // If localhost fails and we haven't tried fallback yet, switch to production immediately
      if (socketUrl.includes('localhost') && isLocalhostError && !hasTriedFallback.current) {

        hasTriedFallback.current = true
        setSocketUrl(process.env.NEXT_PUBLIC_API_URL || '')
        // Close current socket immediately - useEffect will reconnect with new URL
        newSocket.close()
        return
      }

      // Ignore errors if we've already switched URLs or if this is expected localhost error
      if (hasTriedFallback.current && socketUrl.includes('localhost')) {
        return
      }


      // If we've tried both and still failing, show error
      if (hasTriedFallback.current && !connected && !socketUrl.includes('localhost')) {
        setError('Không thể kết nối đến chatbot. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.')
        setConnected(false)
      }

    })

    // Listen for transport errors specifically
    newSocket.io.on('error', (error: any) => {
      // Ignore errors if we've already switched URLs or if socket is disconnected
      if (hasTriedFallback.current || !newSocket.connected) {
        return
      }


      // If localhost fails with transport error, switch to production
      if (
        socketUrl.includes('localhost') &&
        !hasTriedFallback.current &&
        (error?.message?.includes('websocket error') || error?.type === 'TransportError')
      ) {

        hasTriedFallback.current = true
        setSocketUrl(process.env.NEXT_PUBLIC_API_URL || '')
        newSocket.close()
      }
    })

    // Monitor transport changes
    newSocket.io.engine.on('upgrade', () => {
      // Transport upgraded
    })

    newSocket.io.engine.on('upgradeError', () => {
      // Transport upgrade error, continuing with polling
    })

    newSocket.on('reconnect_attempt', () => {
      // Reconnecting attempt
    })

    newSocket.on('reconnect', () => {
      setConnected(true)
      setError(null)
    })

    // Listen for chat errors
    newSocket.on('chat:error', (error: { message: string }) => {

      setError(error.message)
      setIsLoading(false)
      // Clear timeout on error
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    })

    return () => {
      newSocket.close()
      socketRef.current = null
      // Clear timeout on cleanup
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [accountId, socketUrl])

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!accountId) return

    try {
      setIsLoadingConversations(true)
      const response = await chatbotService.getConversations()
      if (response.success && response.data) {
        setConversations(response.data)
      }
    } catch (error: any) {

    } finally {
      setIsLoadingConversations(false)
    }
  }, [accountId])

  // Load messages for a conversation
  const loadMessages = useCallback(async (convId: string) => {
    if (!convId) return

    try {
      setIsLoadingMessages(true)
      const response = await chatbotService.getMessages(convId)
      if (response.success && response.data) {
        // Convert API messages to ChatMessage format
        const convertedMessages: ChatMessage[] = response.data.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp)
        }))
        setMessages(convertedMessages)
        setConversationId(convId)
        setSelectedConversationId(convId)
      }
    } catch (error: any) {

      setError('Không thể tải tin nhắn')
    } finally {
      setIsLoadingMessages(false)
    }
  }, [])

  // Create new conversation
  const createNewConversation = useCallback(
    async (title: string = 'Cuộc trò chuyện mới') => {
      if (!accountId) return null

      try {
        const response = await chatbotService.createConversation(title)
        if (response.success && response.data) {
          const newConv = response.data
          setConversations(prev => [newConv, ...prev])
          setConversationId(newConv.id)
          setSelectedConversationId(newConv.id)
          setMessages([])
          return newConv.id
        }
      } catch (error: any) {

        setError('Không thể tạo cuộc trò chuyện mới')
      }
      return null
    },
    [accountId]
  )

  // Select conversation
  const selectConversation = useCallback(
    async (convId: string | null) => {
      if (convId) {
        await loadMessages(convId)
      } else {
        setMessages([])
        setConversationId(null)
        setSelectedConversationId(null)
      }
    },
    [loadMessages]
  )

  // Load conversations on mount
  useEffect(() => {
    if (accountId) {
      loadConversations()
    }
  }, [accountId, loadConversations])

  // Send message
  const sendMessage = useCallback(
    (
      prompt: string,
      context?: ChatContext | { force_type?: 'question_bank' | 'knowledge_base' | 'general'; question_id?: string },
      explicitConversationId?: string | null,
      displayMessage?: string
    ) => {


      if (!socket) {

        setError('Chưa kết nối đến chatbot')
        return
      }

      if (!connected) {

        setError('Chưa kết nối đến chatbot')
        return
      }

      if (!accountId) {

        setError('Chưa đăng nhập')
        return
      }

      if (!prompt.trim()) {

        setError('Vui lòng nhập câu hỏi')
        return
      }

      // Add user message to UI (use displayMessage if provided, otherwise use prompt)
      const userMessage: ChatMessage = {
        role: 'user',
        content: displayMessage || prompt,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, userMessage])
      setIsLoading(true)
      setError(null)

      // Prepare request - server will create conversation if needed
      const request: any = {
        account_id: accountId,
        prompt: prompt.trim()
      }

      // Use explicit conversation ID if provided, otherwise use the one from state
      const convIdToUse = explicitConversationId !== undefined ? explicitConversationId : conversationId
      // Only add conversation_id if it exists
      if (convIdToUse) {
        request.conversation_id = convIdToUse
      }

      // Only add context if provided
      if (context) {
        request.context = context
      }



      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Send to server with timeout
      timeoutRef.current = setTimeout(() => {
        setIsLoading(false)
        const errorMsg = 'Không nhận được phản hồi từ server. Vui lòng thử lại.'
        setError(errorMsg)
        // Add error message instead of removing user message
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: errorMsg,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
        timeoutRef.current = null
      }, 30000) // 30 seconds timeout


      socket.emit('chat:message', request, (response: ChatMessageResponse) => {
        // Clear timeout on response
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
        setIsLoading(false)



        if (response.success && response.data) {
          // Add AI response to UI
          const aiMessage: ChatMessage = {
            role: 'assistant',
            content: response.data.response,
            timestamp: new Date(response.data.timestamp)
          }
          setMessages(prev => [...prev, aiMessage])

          // Update conversation ID if changed or newly created
          if (response.data.conversation_id) {
            const newConvId = response.data.conversation_id
            if (newConvId !== conversationId) {
              setConversationId(newConvId)
              setSelectedConversationId(newConvId)
              // Reload conversations to get updated list
              loadConversations()
            }
          }
        } else {
          const errorMsg = response.message || 'Không thể nhận phản hồi từ chatbot'
          setError(errorMsg)

          // Add error message instead of removing user message
          const errorMessage: ChatMessage = {
            role: 'assistant',
            content: errorMsg,
            timestamp: new Date()
          }
          setMessages(prev => [...prev, errorMessage])
        }
      })
    },
    [socket, connected, accountId, conversationId, loadConversations]
  )

  // Clear messages and start new conversation
  const clearMessages = useCallback(() => {
    setMessages([])
    setConversationId(null)
    setSelectedConversationId(null)
    setError(null)
  }, [])

  // Start new conversation
  const startNewConversation = useCallback(async () => {
    clearMessages()
    await loadConversations()
  }, [clearMessages, loadConversations])

  // Explain question
  const explainQuestion = useCallback(
    (questionId: string, customPrompt?: string) => {
      sendMessage(customPrompt || 'Giải thích câu hỏi này cho tôi', {
        force_type: 'question_bank',
        question_id: questionId
      })
    },
    [sendMessage]
  )

  // Search knowledge
  const searchKnowledge = useCallback(
    (query: string) => {
      sendMessage(query, {
        type: 'knowledge'
      })
    },
    [sendMessage]
  )

  return {
    connected,
    messages,
    conversationId,
    conversations,
    selectedConversationId,
    isLoading,
    isLoadingConversations,
    isLoadingMessages,
    error,
    sendMessage,
    clearMessages,
    startNewConversation,
    loadConversations,
    loadMessages,
    selectConversation,
    createNewConversation,
    explainQuestion,
    searchKnowledge
  }
}
