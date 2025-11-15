'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import { styled, useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'

// Icons
import { History, Clock, Trash2 } from 'lucide-react'

// Services
import { chatbotService, type Conversation } from '@/services/chatbot.service'

// ============= STYLED COMPONENTS =============

const DropdownContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  width: '100%',
  padding: theme.spacing(1.5, 2),
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.action.hover}30 100%)`,
  borderRadius: '12px',
  border: `1.5px solid ${theme.palette.primary.main}20`,
  boxShadow: `0 2px 8px ${theme.palette.primary.main}10`
}))

const HeaderBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(0.5)
}))

const HeaderTitle = styled(Typography)(({ theme }) => ({
  fontSize: '13px',
  fontWeight: 700,
  color: theme.palette.text.primary,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.75)
}))

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  flex: 1,
  minWidth: 0,
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    height: '40px',
    fontSize: '13px',
    transition: 'all 0.3s ease',
    backgroundColor: theme.palette.background.paper,
    border: `1.5px solid ${theme.palette.divider}`,
    '&:hover': {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 2px 8px ${theme.palette.primary.main}15`
    },
    '&.Mui-focused': {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 3px ${theme.palette.primary.main}20`
    }
  },
  '& .MuiOutlinedInput-input': {
    padding: theme.spacing(1, 1.25),
    fontSize: '13px',
    fontWeight: 500
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none'
  }
}))

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  fontSize: '13px',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: theme.palette.primary.main + '15'
  },
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.main + '25',
    '&:hover': {
      backgroundColor: theme.palette.primary.main + '35'
    }
  }
}))

const LoadingBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(2),
  color: theme.palette.text.secondary
}))

const LoadingText = styled(Typography)(({ theme }) => ({
  fontSize: '13px',
  fontWeight: 500,
  color: theme.palette.text.secondary
}))

const EmptyStateBox = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(2),
  color: theme.palette.text.secondary
}))

const ConversationItemBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  gap: theme.spacing(1)
}))

const ConversationTitle = styled(Typography)(({ theme }) => ({
  fontSize: '13px',
  fontWeight: 500,
  color: theme.palette.text.primary,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  flex: 1
}))

const ConversationDate = styled(Chip)(({ theme }) => ({
  height: '20px',
  fontSize: '11px',
  fontWeight: 500,
  backgroundColor: theme.palette.primary.main + '15',
  color: theme.palette.primary.main,
  '& .MuiChip-icon': {
    marginRight: 4,
    fontSize: '12px',
    color: theme.palette.primary.main
  }
}))

// ============= TYPES =============

export type PastConversationsDropdownProps = {
  onConversationSelect?: (conversation: Conversation, messages: any[]) => void
}

// ============= MAIN COMPONENT =============

const PastConversationsDropdown = ({ onConversationSelect }: PastConversationsDropdownProps) => {
  const theme = useTheme()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedId, setSelectedId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch conversations on mount
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await chatbotService.getConversations()
        setConversations(response.data || [])
      } catch (err) {
        setError('Failed to load conversations')
        console.error('Error fetching conversations:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchConversations()
  }, [])

  const handleSelectChange = async (conversationId: string) => {
    setSelectedId(conversationId)
    const selected = conversations.find(c => c.id === conversationId)

    if (selected && onConversationSelect) {
      try {
        // Fetch messages for this conversation
        const messagesResponse = await chatbotService.getMessages(conversationId)
        onConversationSelect(selected, messagesResponse.data || [])
      } catch (err) {
        console.error('Error fetching messages:', err)
        // Still pass conversation even if messages fail to load
        onConversationSelect(selected, [])
      }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const dateObj = new Date(dateString)
    const dateOnly = dateObj.toDateString()

    if (dateOnly === today.toDateString()) {
      return dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    } else if (dateOnly === yesterday.toDateString()) {
      return 'Hôm qua'
    } else {
      return dateObj.toLocaleDateString('vi-VN', { month: '2-digit', day: '2-digit' })
    }
  }

  if (loading) {
    return (
      <LoadingBox>
        <CircularProgress size={18} />
        <LoadingText>Đang tải lịch sử...</LoadingText>
      </LoadingBox>
    )
  }

  if (conversations.length === 0) {
    return (
      <EmptyStateBox>
        <Typography sx={{ fontSize: '13px', fontWeight: 500 }}>
          Chưa có cuộc trò chuyện nào
        </Typography>
      </EmptyStateBox>
    )
  }

  return (
    <DropdownContainer>
      <HeaderBox>
        <History size={18} style={{ color: theme.palette.primary.main }} />
        <HeaderTitle>Lịch sử cuộc trò chuyện</HeaderTitle>
      </HeaderBox>
      <StyledFormControl fullWidth size="small">
        <Select
          value={selectedId}
          onChange={(e) => handleSelectChange(e.target.value)}
          displayEmpty
          renderValue={(value) => value ? 'Đã chọn cuộc trò chuyện' : 'Chọn từ lịch sử...'}
        >
          <StyledMenuItem value="">
            <Typography sx={{ fontSize: '13px', fontStyle: 'italic', color: 'text.secondary' }}>
              Chọn một cuộc trò chuyện...
            </Typography>
          </StyledMenuItem>
          {conversations.map((conversation) => (
            <StyledMenuItem key={conversation.id} value={conversation.id}>
              <ConversationItemBox>
                <ConversationTitle title={conversation.title}>
                  {conversation.title.length > 40
                    ? conversation.title.substring(0, 37) + '...'
                    : conversation.title}
                </ConversationTitle>
                <ConversationDate
                  label={formatDate(conversation.created_at)}
                  size="small"
                  variant="outlined"
                />
              </ConversationItemBox>
            </StyledMenuItem>
          ))}
        </Select>
      </StyledFormControl>
    </DropdownContainer>
  )
}

export default PastConversationsDropdown
