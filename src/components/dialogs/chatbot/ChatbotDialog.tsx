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
import {
  Send,
  X,
  Bot,
  User,
  Minimize2,
  Maximize2,
  Trash2,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  Crosshair
} from 'lucide-react'

// Component Imports
import { useChatbot } from '@/hooks/useChatbot'
import { useSession } from 'next-auth/react'
import TestScenariosPanel, { type ScenarioType } from './TestScenariosPanel'
import PastConversationsDropdown from './PastConversationsDropdown'
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
  QuestionBankPanel,
  QuestionBankHeader,
  QuestionBankTitle,
  QuestionBankContent,
  FormGroup,
  FormLabel,
  FormActions,
  StatusIndicator
} from './styles/ChatbotDialog.styles'

// ============= MAIN COMPONENT =============

type ChatbotDialogProps = {
  open: boolean
  onClose: () => void
  initialQuestionContent?: string
  initialScenario?: ScenarioType | null
}

const ChatbotDialog = ({ open, onClose, initialQuestionContent, initialScenario }: ChatbotDialogProps) => {
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

  const [currentScenario, setCurrentScenario] = useState<ScenarioType | null>(null)
  const [questionId, setQuestionId] = useState('')
  const [questionContent, setQuestionContent] = useState('')
  const [isQuestionBankExpanded, setIsQuestionBankExpanded] = useState(true)
  const [userFullName, setUserFullName] = useState<string>('')
  const [isCreatingConversation, setIsCreatingConversation] = useState(false)
  const [conversationError, setConversationError] = useState<string | null>(null)
  const cachedConversationsRef = useRef<Conversation[]>([])
  const hasLoadedConversationsRef = useRef(false)

  // Handle initial values when dialog opens
  useEffect(() => {
    if (open) {
      if (initialScenario) {
        setCurrentScenario(initialScenario)
        if (initialScenario === 'question_bank') {
          setIsQuestionBankExpanded(true)
        }
      }
      if (initialQuestionContent) {
        setQuestionContent(initialQuestionContent)
      }
    }
  }, [open, initialScenario, initialQuestionContent])

  // Callback to update cached conversations
  const handleConversationsChange = useCallback((conversations: Conversation[]) => {
    cachedConversationsRef.current = conversations
  }, [])

  // Memoize sample questions
  const sampleQuestions = useMemo(
    () => ({
      question_bank: [
        'Có bao nhiêu câu hỏi về hệ điều hành?',
        'Cho tôi xem câu hỏi về tiến trình',
        'Tìm câu hỏi khó về bộ nhớ'
      ],
      knowledge_base: [
        'Tiến trình trong hệ điều hành là gì?',
        'Giải thích về deadlock',
        'Phân biệt tiến trình và luồng'
      ],
      general: ['Hôm nay thời tiết thế nào?', 'Kể cho tôi một câu chuyện vui', 'Bạn có thể làm gì?']
    }),
    []
  )

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

  const handleScenarioChange = useCallback(
    (scenario: ScenarioType | null) => {
      setCurrentScenario(scenario)

      if (scenario === null) {
        setQuestionId('')
        setQuestionContent('')
        setInputValue('')
        setIsQuestionBankExpanded(true)
      } else if (scenario === 'question_bank') {
        setQuestionId('')
        setQuestionContent('')
        setIsQuestionBankExpanded(true)
      } else {
        const samples = sampleQuestions[scenario]
        const randomSample = samples[Math.floor(Math.random() * samples.length)]
        setInputValue(randomSample)
        inputRef.current?.focus()
        setIsQuestionBankExpanded(false)
      }
    },
    [sampleQuestions]
  )

  const handleToggleQuestionBank = useCallback(() => {
    setIsQuestionBankExpanded(prev => !prev)
  }, [])

  const handleConversationSelect = useCallback(
    async (conversation: Conversation, messages: any[]) => {
      await selectConversation(conversation.id)
    },
    [selectConversation]
  )

  const handleSubmitQuestionBank = useCallback(() => {
    if (!questionId.trim() && !questionContent.trim()) {
      return
    }

    if (!connected || isLoading) {
      return
    }

    let queryMessage = ''
    if (questionId && questionContent) {
      queryMessage = `Question ID: ${questionId}\nNội dung: ${questionContent}`
    } else if (questionId) {
      queryMessage = `Tìm thông tin về câu hỏi có ID: ${questionId}`
    } else {
      queryMessage = questionContent
    }

    const context: { force_type: 'question_bank'; question_id?: string } = {
      force_type: 'question_bank'
    }

    if (questionId.trim()) {
      context.question_id = questionId.trim()
    }

    sendMessage(queryMessage, context)
    setQuestionId('')
    setQuestionContent('')
  }, [questionId, questionContent, connected, isLoading, sendMessage])

  const handleClearQuestionBankForm = useCallback(() => {
    setQuestionId('')
    setQuestionContent('')
  }, [])

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

      // Prepare context
      const context = currentScenario ? { force_type: currentScenario } : undefined

      // Clear input
      const messageToSend = currentInput
      setInputValue('')

      // Send message
      console.log('[handleSend] Sending message, conversationId:', conversationIdToUse)
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
    currentScenario,
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
    setCurrentScenario(null)
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

          {/* Past Conversations Dropdown */}
          <Box
            sx={{
              px: 2,
              py: 1.5,
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
              zIndex: 10
            }}
          >
            <PastConversationsDropdown
              onConversationSelect={handleConversationSelect}
              onNewConversation={async conversation => {
                await selectConversation(conversation.id)
              }}
              onStartNewConversation={async () => {
                await startNewConversation()
              }}
              currentConversationId={conversationId || null}
              onConversationUpdate={conversation => {
                // Update conversation in dropdown
                if ((window as any).__updateConversationInDropdown) {
                  ;(window as any).__updateConversationInDropdown(conversation)
                }
              }}
              cachedConversations={cachedConversationsRef.current}
              onConversationsChange={handleConversationsChange}
            />
          </Box>

          {/* Question Bank Panel */}
          <QuestionBankPanel active={currentScenario === 'question_bank'} expanded={isQuestionBankExpanded}>
            <QuestionBankHeader onClick={handleToggleQuestionBank}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                <Crosshair size={20} style={{ color: theme.palette.primary.main }} />
                <QuestionBankTitle>Question Bank - Nhập thông tin câu hỏi</QuestionBankTitle>
              </Box>
              <IconButton size='small' sx={{ color: 'primary.main' }}>
                {isQuestionBankExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </IconButton>
            </QuestionBankHeader>
            <QuestionBankContent expanded={isQuestionBankExpanded}>
              <FormGroup>
                <FormLabel>ID Câu hỏi (Question ID):</FormLabel>
                <TextField
                  fullWidth
                  size='small'
                  placeholder='Ví dụ: 6734c1f3eab52d34087cb4aa'
                  value={questionId}
                  onChange={e => setQuestionId(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: '14px'
                    }
                  }}
                />
              </FormGroup>
              <FormGroup>
                <FormLabel>Nội dung câu hỏi (Question Content):</FormLabel>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  size='small'
                  placeholder='Ví dụ: Tiến trình trong hệ điều hành là gì?'
                  value={questionContent}
                  onChange={e => setQuestionContent(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: '14px'
                    }
                  }}
                />
              </FormGroup>
              <FormActions>
                <Button
                  variant='contained'
                  fullWidth
                  onClick={handleSubmitQuestionBank}
                  disabled={(!questionId.trim() && !questionContent.trim()) || !connected || isLoading}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Gửi câu hỏi
                </Button>
                <Button
                  variant='outlined'
                  onClick={handleClearQuestionBankForm}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Xóa
                </Button>
              </FormActions>
            </QuestionBankContent>
          </QuestionBankPanel>
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
                      Xin chào! Tôi là chatbot hỗ trợ học tập với 3 chế độ:
                    </Typography>
                    <Typography
                      variant='body2'
                      sx={{ color: 'text.secondary', lineHeight: 1.5, fontSize: '14px', mb: 1 }}
                    >
                      <strong>Question Bank:</strong> Hỏi về câu hỏi trong ngân hàng đề
                      <br />
                      <strong>Knowledge Base:</strong> Hỏi về kiến thức trong tài liệu
                      <br />
                      <strong>General Chat:</strong> Trò chuyện tự do
                    </Typography>
                    <Typography
                      variant='body2'
                      sx={{ color: 'text.secondary', lineHeight: 1.5, fontSize: '13px', opacity: 0.8 }}
                    >
                      Hãy chọn một chế độ hoặc gõ câu hỏi trực tiếp!
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
            {/* Test Scenarios Panel */}
            <Box sx={{ px: 2, py: 1.5 }}>
              <TestScenariosPanel currentScenario={currentScenario} onScenarioChange={handleScenarioChange} />
            </Box>
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
