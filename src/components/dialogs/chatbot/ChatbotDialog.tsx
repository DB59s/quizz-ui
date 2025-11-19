'use client'

// React Imports
import { useState, useRef, useEffect, useCallback, useMemo } from 'react'

// MUI Imports
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import { useTheme } from '@mui/material/styles'

// Icons
import { Send, X, Bot, User, Minimize2, Maximize2, Trash2, ArrowDown } from 'lucide-react'

// Component Imports
import { useSession } from 'next-auth/react'

import { useChatbot } from '@/hooks/useChatbot'
import ChatbotHeaderActions from './components/ChatbotHeaderActions'
import QuestionIdTag from './components/QuestionIdTag'
import { type Conversation, chatbotService } from '@/services/chatbot.service'
import { userService } from '@/services/user.service'
import { debounce } from './utils/chatbot.utils'

// Styled Components
import {
  ChatWidget,
  ChatContent,
  Header,
  HeaderLeft,
  HeaderRight,
  MessagesContainer,
  MessageRow,
  MessageBubble,
  SenderName,
  WelcomeMessageCard,
  InputContainer,
  InputWrapperContainer,
  InputWrapper,
  ActionButton,
  TypingIndicator,
  TypingDot,
  ScrollToBottomButton,
  StatusIndicator
} from './styles/ChatbotDialog.styles'

// ============= MAIN COMPONENT =============

type ScenarioType = 'question_bank' | 'explain_answer' | 'generate_question' | null

type ChatbotDialogProps = {
  open: boolean
  onClose: () => void
  initialQuestionContent?: string
  initialQuestionId?: string
  initialScenario?: ScenarioType
}

const ChatbotDialog = ({
  open,
  onClose,
  initialQuestionContent,
  initialQuestionId,
  initialScenario
}: ChatbotDialogProps) => {
  const theme = useTheme()
  const { data: session, status } = useSession()

  // Function to decode JWT token and get account_id
  const getAccountIdFromToken = useCallback((token: string | undefined): string | null => {
    if (!token) return null

    try {
      const parts = token.split('.')

      if (parts.length !== 3) return null

      const payload = JSON.parse(atob(parts[1]))

      return payload.account_id || payload.accountId || payload.id || payload.sub || null
    } catch (error) {
      return null
    }
  }, [])

  // Memoize account ID computation
  const accountId = useMemo(
    () =>
      (session?.user as any)?.id ||
      (session?.user as any)?.accountId ||
      (session as any)?.accountId ||
      (session as any)?.id ||
      getAccountIdFromToken(session?.accessToken) ||
      null,
    [session, getAccountIdFromToken]
  )

  const [inputValue, setInputValue] = useState('')
  const [dropdownAnchor, setDropdownAnchor] = useState<null | HTMLElement>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const isSendingRef = useRef(false)
  const creatingConversationRef = useRef(false)
  const lastSendTimestampRef = useRef<number>(0)
  const lastInputValueRef = useRef<string>('')

  const {
    connected,
    messages,
    isLoading,
    error,
    sendMessage,
    startNewConversation,
    selectConversation,
    conversationId
  } = useChatbot(accountId)

  const [questionId, setQuestionId] = useState('')
  const [questionContent, setQuestionContent] = useState('')
  const [userFullName, setUserFullName] = useState<string>('')
  const [isCreatingConversation, setIsCreatingConversation] = useState(false)
  const [conversationError, setConversationError] = useState<string | null>(null)
  const cachedConversationsRef = useRef<Conversation[]>([])
  const hasLoadedConversationsRef = useRef(false)

  // Handle initial values when dialog opens
  useEffect(() => {
    if (open) {
      if (initialQuestionContent) {
        setQuestionContent(initialQuestionContent)
      }

      if (initialQuestionId) {
        setQuestionId(initialQuestionId)

        // Auto-populate input with question ID reference
        setInputValue(`@${initialQuestionId} `)
      }
    }
  }, [open, initialQuestionContent, initialQuestionId])

  // Callback to update cached conversations
  const handleConversationsChange = useCallback((conversations: Conversation[]) => {
    cachedConversationsRef.current = conversations
  }, [])

  // Auto scroll to bottom when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Debounced scroll handler
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current

    if (!container) return

    const { scrollTop, scrollHeight, clientHeight } = container
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100

    setShowScrollButton(!isNearBottom && messages.length > 0)
  }, [messages.length])

  // Throttled scroll handler
  const throttledHandleScroll = useMemo(() => debounce(handleScroll, 100), [handleScroll])

  // Handle scroll to show/hide scroll button
  useEffect(() => {
    const container = messagesContainerRef.current

    if (!container) return

    container.addEventListener('scroll', throttledHandleScroll)

    return () => container.removeEventListener('scroll', throttledHandleScroll)
  }, [throttledHandleScroll])

  const handleScrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const handleSuggestedQuestionClick = useCallback((question: string) => {
    setInputValue(question)
    inputRef.current?.focus()
  }, [])

  const handleRemoveQuestionId = useCallback(() => {
    setQuestionId('')

    // Remove @questionId from input if present
    setInputValue(prev => prev.replace(`@${questionId} `, '').trim())
  }, [questionId])

  const handleConversationSelect = useCallback(
    async (conversation: Conversation, messages: any[]) => {
      await selectConversation(conversation.id)
    },
    [selectConversation]
  )

  // Fetch user full_name from API
  useEffect(() => {
    if (open && session?.accessToken) {
      const fetchUserProfile = async () => {
        try {
          const response = await userService.getProfile()

          if (response.success && response.data?.full_name) {
            setUserFullName(response.data.full_name)
          }
        } catch (error) {
          console.error('Error fetching user profile:', error)
        }
      }

      fetchUserProfile()
    }
  }, [open, session?.accessToken])

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [open])

  // Expose selectConversation to ChatbotHeaderActions
  useEffect(() => {
    ;(window as any).__loadConversationFromHistory = async (conversation: Conversation) => {
      await selectConversation(conversation.id)
    }

    return () => {
      delete (window as any).__loadConversationFromHistory
    }
  }, [selectConversation])

  // Extract conversation creation logic
  const createNewConversationIfNeeded = useCallback(
    async (title: string): Promise<string | null> => {
      if (creatingConversationRef.current) {
        console.warn('[createNewConversationIfNeeded] Creation already in progress')

        return null
      }

      try {
        creatingConversationRef.current = true
        setIsCreatingConversation(true)
        setConversationError(null)

        const trimmedTitle = title.length > 50 ? title.substring(0, 47) + '...' : title

        console.log('[createNewConversationIfNeeded] Creating conversation with title:', trimmedTitle)

        const response = await chatbotService.createConversation(trimmedTitle)

        if (response.success && response.data) {
          console.log('[createNewConversationIfNeeded] Conversation created:', response.data.id)

          await selectConversation(response.data.id)

          // Wait for conversationId to be updated (max 1 second)
          let retries = 0

          while (retries < 20 && conversationId !== response.data.id) {
            await new Promise(resolve => setTimeout(resolve, 50))
            retries++
          }

          setConversationError(null)

          // Update dropdown immediately
          if ((window as any).__updateConversationInDropdown) {
            ;(window as any).__updateConversationInDropdown(response.data)
          }

          return response.data.id
        } else {
          console.error('[createNewConversationIfNeeded] Failed:', response)

          return null
        }
      } catch (err) {
        console.error('[createNewConversationIfNeeded] Error:', err)
        setConversationError('Failed to create conversation')

        return null
      } finally {
        setIsCreatingConversation(false)
      }
    },
    [conversationId, selectConversation]
  )

  const handleSend = useCallback(async () => {
    const now = Date.now()
    const currentInput = inputValue.trim()

    // Validation checks
    if (isSendingRef.current || creatingConversationRef.current) {
      console.warn('[handleSend] Send already in progress')

      return
    }

    if (now - lastSendTimestampRef.current < 2000 && lastInputValueRef.current === currentInput) {
      console.warn('[handleSend] Duplicate call detected')

      return
    }

    if (!currentInput || isLoading || isCreatingConversation || !connected) {
      return
    }

    // Set flags
    isSendingRef.current = true
    lastSendTimestampRef.current = now
    lastInputValueRef.current = currentInput

    try {
      let conversationIdToUse = conversationId

      // Create conversation if first message
      if (messages.length === 0) {
        const newConversationId = await createNewConversationIfNeeded(currentInput)

        if (!newConversationId) {
          isSendingRef.current = false
          creatingConversationRef.current = false

          return
        }

        conversationIdToUse = newConversationId
      }

      // Prepare context with question ID if available
      const context: any = {}

      if (questionId.trim()) {
        context.question_id = questionId.trim()
      }

      // Clear input
      const messageToSend = currentInput

      setInputValue('')

      // Send message
      console.log('[handleSend] Sending message, conversationId:', conversationIdToUse, 'questionId:', questionId)
      sendMessage(messageToSend, context, conversationIdToUse)

      // Reset flags
      if (messages.length === 0) {
        setTimeout(() => {
          creatingConversationRef.current = false
        }, 500)
      }
    } catch (error) {
      console.error('[handleSend] Unexpected error:', error)
      creatingConversationRef.current = false
    } finally {
      setTimeout(() => {
        isSendingRef.current = false
      }, 1000)
    }
  }, [
    inputValue,
    isLoading,
    isCreatingConversation,
    connected,
    messages.length,
    conversationId,
    questionId,
    createNewConversationIfNeeded,
    sendMessage
  ])

  const handleDropdownOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setDropdownAnchor(event.currentTarget)
  }, [])

  const handleDropdownClose = useCallback(() => {
    setDropdownAnchor(null)
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        e.stopPropagation()

        if (e.currentTarget instanceof HTMLTextAreaElement) {
          const form = e.currentTarget.closest('form')

          if (form) {
            e.stopPropagation()
          }
        }

        if (!isSendingRef.current && !creatingConversationRef.current) {
          handleSend()
        }
      }
    },
    [handleSend]
  )

  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  const handleNewConversation = useCallback(async () => {
    // setCurrentScenario(null)
    await startNewConversation()
  }, [startNewConversation])

  // Memoize user display info
  const userAvatar = useMemo(() => session?.user?.image || null, [session?.user?.image])
  const displayName = useMemo(() => userFullName || session?.user?.name || 'You', [userFullName, session?.user?.name])

  // Handle send button click
  const handleSendButtonClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      if (!isSendingRef.current) {
        handleSend()
      }
    },
    [handleSend]
  )

  if (!open) return null

  return (
    <ChatWidget>
      {/* Chat Content */}
      <ChatContent>
        {/* Header */}
        <Header>
          <HeaderLeft>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                flexShrink: 0,
                mr: 1,
                boxShadow: `0 2px 8px ${theme.palette.primary.main}30`
              }}
            >
              <Bot size={20} style={{ color: '#ffffff' }} />
            </Avatar>
            <Box>
              <Typography variant='h6' sx={{ fontSize: '16px', fontWeight: 700, color: 'text.primary' }}>
                Chatbot Hỗ trợ học tập
              </Typography>
              <StatusIndicator online={connected}>
                <Box className='status-dot' />
                <Typography sx={{ fontSize: '11px', color: 'text.secondary', fontWeight: 500, marginLeft: '5px' }}>
                  {connected ? 'Đang trực tuyến' : 'Đang ngoại tuyến'}
                </Typography>
              </StatusIndicator>
            </Box>
          </HeaderLeft>
          <HeaderRight>
            <ChatbotHeaderActions onNewConversation={handleNewConversation} currentConversationId={conversationId} />
            <ActionButton size='small' onClick={handleClose} title='Đóng khung chat'>
              <X size={18} />
            </ActionButton>
          </HeaderRight>
        </Header>

        {/* Header Section - Static (no overflow) */}
        <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'visible' }}>
          {(error || conversationError) && (
            <Alert severity='error' sx={{ m: 1.5, mb: 0, borderRadius: '8px' }}>
              {error || conversationError}
            </Alert>
          )}
        </Box>

        {/* Messages Section - Scrollable (overflow hidden) */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
          <MessagesContainer ref={messagesContainerRef} sx={{ position: 'relative' }}>
            {messages.length === 0 && connected && (
              <WelcomeMessageCard>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: 'primary.main',
                      flexShrink: 0
                    }}
                  >
                    <Bot size={24} style={{ color: theme.palette.primary.contrastText }} />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <SenderName>Chatbot Hỗ trợ học tập</SenderName>
                    <Typography
                      variant='body2'
                      sx={{ color: 'text.secondary', lineHeight: 1.5, fontSize: '14px', mb: 1 }}
                    >
                      Xin chào! Tôi là chatbot hỗ trợ học tập
                    </Typography>
                  </Box>
                </Box>
              </WelcomeMessageCard>
            )}

            {messages.map((message, index) => (
              <MessageRow key={index} isUser={message.role === 'user'}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    background:
                      message.role === 'user'
                        ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`
                        : theme.palette.action.hover,
                    flexShrink: 0,
                    boxShadow: message.role === 'user' ? `0 2px 8px ${theme.palette.primary.main}30` : 'none'
                  }}
                >
                  {message.role === 'user' ? (
                    userAvatar ? (
                      <img
                        src={userAvatar}
                        alt={displayName}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                      />
                    ) : (
                      <User size={16} />
                    )
                  ) : (
                    <Bot size={16} />
                  )}
                </Avatar>
                <Box>
                  {message.role === 'user' ? (
                    <SenderName alignRight>{displayName}</SenderName>
                  ) : (
                    <SenderName>Chatbot</SenderName>
                  )}
                  <MessageBubble isUser={message.role === 'user'}>
                    <Typography
                      sx={{
                        fontSize: '14px',
                        lineHeight: '20px',
                        color: message.role === 'user' ? '#ffffff' : 'inherit'
                      }}
                    >
                      {message.content}
                    </Typography>
                  </MessageBubble>
                </Box>
              </MessageRow>
            ))}

            {isLoading && (
              <MessageRow>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: 'action.hover',
                    flexShrink: 0
                  }}
                >
                  <Bot size={18} />
                </Avatar>
                <TypingIndicator>
                  <TypingDot />
                  <TypingDot />
                  <TypingDot />
                </TypingIndicator>
              </MessageRow>
            )}

            <div ref={messagesEndRef} />
            {showScrollButton && (
              <ScrollToBottomButton onClick={handleScrollToBottom} size='small'>
                <ArrowDown size={20} />
              </ScrollToBottomButton>
            )}
          </MessagesContainer>

          {/* Input Area*/}
          <InputContainer>
            {questionId.trim() && (
              <Box sx={{ px: 1.5, pt: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <QuestionIdTag questionId={questionId} onRemove={handleRemoveQuestionId} />
              </Box>
            )}
            <InputWrapperContainer>
              <InputWrapper>
                <TextField
                  inputRef={inputRef}
                  fullWidth
                  placeholder={connected ? 'Nhập nội dung chat' : 'Đang kết nối...'}
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={!connected || isLoading || isCreatingConversation}
                  variant='standard'
                  multiline
                  maxRows={4}
                  autoFocus={false}
                  InputProps={{
                    disableUnderline: true,
                    sx: {
                      fontSize: '14px',
                      '& textarea': {
                        padding: '8px 0',
                        maxHeight: '100px',
                        overflowY: 'auto',
                        resize: 'none'
                      }
                    }
                  }}
                  sx={{
                    width: '100%',
                    '& .MuiInputBase-root': {
                      fontSize: '14px'
                    },
                    '& .MuiInputBase-input': {
                      padding: 0
                    }
                  }}
                />
              </InputWrapper>
              {inputValue.trim() ? (
                <ActionButton
                  size='small'
                  onClick={handleSendButtonClick}
                  disabled={isLoading || !connected || isCreatingConversation || isSendingRef.current}
                  sx={{
                    color: inputValue.trim() ? 'primary.main' : 'action.disabled'
                  }}
                >
                  <Send size={18} />
                </ActionButton>
              ) : (
                <ActionButton
                  size='small'
                  disabled={!connected || isLoading || isCreatingConversation || isSendingRef.current}
                >
                  <Send size={18} style={{ opacity: 0.5 }} />
                </ActionButton>
              )}
            </InputWrapperContainer>
          </InputContainer>
        </Box>
      </ChatContent>
    </ChatWidget>
  )
}

export default ChatbotDialog
