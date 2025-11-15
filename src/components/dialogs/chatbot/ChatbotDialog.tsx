'use client'

// React Imports
import { useState, useRef, useEffect, useCallback } from 'react'

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
}

const ChatbotDialog = ({ open, onClose }: ChatbotDialogProps) => {
  const theme = useTheme()
  const { data: session, status } = useSession()

  // Function to decode JWT token and get account_id
  const getAccountIdFromToken = (token: string | undefined): string | null => {
    if (!token) return null

    try {
      // JWT token format: header.payload.signature
      // We need to decode the payload (second part)
      const parts = token.split('.')
      if (parts.length !== 3) return null

      // Decode base64 payload
      const payload = JSON.parse(atob(parts[1]))

      // Try different possible field names
      return payload.account_id || payload.accountId || payload.id || payload.sub || null
    } catch (error) {
      return null
    }
  }

  // Try multiple ways to get account ID
  const accountId =
    (session?.user as any)?.id ||
    (session?.user as any)?.accountId ||
    (session as any)?.accountId ||
    (session as any)?.id ||
    getAccountIdFromToken(session?.accessToken) ||
    null

  // Debug logging
  useEffect(() => {
    if (session?.accessToken) {
      const tokenAccountId = getAccountIdFromToken(session.accessToken)
    }
  }, [session, status, accountId])

  const [inputValue, setInputValue] = useState('')
  const [dropdownAnchor, setDropdownAnchor] = useState<null | HTMLElement>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

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

  // Callback to update cached conversations
  const handleConversationsChange = useCallback((conversations: Conversation[]) => {
    cachedConversationsRef.current = conversations
  }, [])

  // Sample questions for each scenario
  const sampleQuestions = {
    question_bank: [
      'Có bao nhiêu câu hỏi về hệ điều hành?',
      'Cho tôi xem câu hỏi về tiến trình',
      'Tìm câu hỏi khó về bộ nhớ'
    ],
    knowledge_base: ['Tiến trình trong hệ điều hành là gì?', 'Giải thích về deadlock', 'Phân biệt tiến trình và luồng'],
    general: ['Hôm nay thời tiết thế nào?', 'Kể cho tôi một câu chuyện vui', 'Bạn có thể làm gì?']
  }

  // Auto scroll to bottom when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Handle scroll to show/hide scroll button
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
      setShowScrollButton(!isNearBottom && messages.length > 0)
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [messages.length])

  const handleScrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSuggestedQuestionClick = (question: string) => {
    setInputValue(question)
    inputRef.current?.focus()
  }

  const handleScenarioChange = (scenario: ScenarioType | null) => {
    setCurrentScenario(scenario)

    if (scenario === null) {
      // Clear all when deselecting
      setQuestionId('')
      setQuestionContent('')
      setInputValue('')
      setIsQuestionBankExpanded(true)
    } else if (scenario === 'question_bank') {
      // Clear form when switching to question_bank
      setQuestionId('')
      setQuestionContent('')
      // Auto expand when selecting question_bank
      setIsQuestionBankExpanded(true)
    } else {
      // Auto-fill a random sample question for other scenarios
      const samples = sampleQuestions[scenario]
      const randomSample = samples[Math.floor(Math.random() * samples.length)]
      setInputValue(randomSample)
      inputRef.current?.focus()
      // Collapse question bank panel when switching to other scenarios
      setIsQuestionBankExpanded(false)
    }
  }

  const handleToggleQuestionBank = () => {
    setIsQuestionBankExpanded(prev => !prev)
  }

  const handleConversationSelect = async (conversation: Conversation, messages: any[]) => {
    // Load messages for the selected conversation
    await selectConversation(conversation.id)
  }

  const handleSubmitQuestionBank = () => {
    if (!questionId.trim() && !questionContent.trim()) {
      // Error will be shown via useChatbot hook
      return
    }

    if (!connected || isLoading) {
      return
    }

    // Build the query message
    let queryMessage = ''
    if (questionId && questionContent) {
      queryMessage = `Question ID: ${questionId}\nNội dung: ${questionContent}`
    } else if (questionId) {
      queryMessage = `Tìm thông tin về câu hỏi có ID: ${questionId}`
    } else {
      queryMessage = questionContent
    }

    // Prepare context with question_id if provided
    const context: { force_type: 'question_bank'; question_id?: string } = {
      force_type: 'question_bank'
    }

    if (questionId.trim()) {
      context.question_id = questionId.trim()
    }

    // Send message with context
    sendMessage(queryMessage, context)

    // Clear form
    setQuestionId('')
    setQuestionContent('')
  }

  const handleClearQuestionBankForm = () => {
    setQuestionId('')
    setQuestionContent('')
  }

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

  const handleSend = async () => {
    if (!inputValue.trim()) {
      return
    }

    if (isLoading || isCreatingConversation) {
      return
    }

    if (!connected) {
      // Error will be shown from useChatbot hook
      return
    }

    // If this is the first message, create conversation first
    if (messages.length === 0) {
      try {
        setIsCreatingConversation(true)
        setConversationError(null)
        const title = inputValue.trim().length > 50 ? inputValue.trim().substring(0, 47) + '...' : inputValue.trim()
        const response = await chatbotService.createConversation(title)
        if (response.success && response.data) {
          await selectConversation(response.data.id)
          setConversationError(null)
          // Update dropdown immediately with new conversation
          if ((window as any).__updateConversationInDropdown) {
            ;(window as any).__updateConversationInDropdown(response.data)
          }
        }
      } catch (err) {
        console.error('Error creating conversation:', err)
        setConversationError('Failed to create conversation')
        setIsCreatingConversation(false)
        return
      } finally {
        setIsCreatingConversation(false)
      }
    }

    // Prepare context with force_type if scenario is selected
    const context = currentScenario ? { force_type: currentScenario } : undefined

    sendMessage(inputValue, context)
    setInputValue('')
  }

  const handleDropdownOpen = (event: React.MouseEvent<HTMLElement>) => {
    setDropdownAnchor(event.currentTarget)
  }

  const handleDropdownClose = () => {
    setDropdownAnchor(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleClose = () => {
    onClose()
  }

  const handleMinimize = () => {
    onClose()
  }

  const handleNewConversation = async () => {
    setCurrentScenario(null)
    await startNewConversation()
  }

  const userAvatar = session?.user?.image || null
  const displayName = userFullName || session?.user?.name || 'You'

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
                  onClick={handleSend}
                  disabled={isLoading || !connected || isCreatingConversation}
                  sx={{
                    color: inputValue.trim() ? 'primary.main' : 'action.disabled'
                  }}
                >
                  <Send size={18} />
                </ActionButton>
              ) : (
                <ActionButton size='small' disabled={!connected || isLoading || isCreatingConversation}>
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
