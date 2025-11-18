'use client'

import { useCallback, useState } from 'react'

import Tooltip from '@mui/material/Tooltip'
import { styled } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

// Icons
import { History, Plus, Trash2, Edit2 } from 'lucide-react'

// Services
import { chatbotService, type Conversation } from '@/services/chatbot.service'

// Utils
import { removeDuplicateConversations, formatConversationDate, truncateText } from './utils/chatbot.utils'

// ============= STYLED COMPONENTS =============

const HeaderActionButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.secondary,
  padding: theme.spacing(0.75),
  minWidth: '40px',
  minHeight: '40px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  borderRadius: '10px',
  '&:hover': {
    backgroundColor: theme.palette.primary.main + '15',
    color: theme.palette.primary.main,
    transform: 'translateY(-2px)'
  },
  '&:active': {
    transform: 'scale(0.95) translateY(0)'
  },
  '&.Mui-disabled': {
    color: theme.palette.action.disabled,
    opacity: 0.5
  }
}))

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  fontSize: '13px',
  transition: 'all 0.2s ease',
  padding: theme.spacing(1, 1.5),
  borderRadius: '8px',
  margin: theme.spacing(0.25, 0.5),
  '&:hover': {
    backgroundColor: theme.palette.primary.main + '15',
    '& .conversation-actions': {
      opacity: 1
    }
  },
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.main + '25',
    '&:hover': {
      backgroundColor: theme.palette.primary.main + '35'
    },
    '& .conversation-actions': {
      opacity: 1
    }
  }
}))

const ConversationItemBox = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  gap: 8
})

const ConversationContent = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minWidth: 0,
  gap: 2
})

const ConversationTitle = styled(Typography)({
  fontSize: '13px',
  fontWeight: 600,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  lineHeight: 1.4
})

const ConversationDate = styled(Typography)(({ theme }) => ({
  fontSize: '11px',
  fontWeight: 400,
  color: theme.palette.text.secondary,
  lineHeight: 1.2
}))

const ConversationActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.25),
  opacity: 0,
  transition: 'opacity 0.2s ease'
}))

const DeleteButton = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(0.5),
  width: '28px',
  height: '28px',
  color: theme.palette.error.main,
  transition: 'all 0.2s ease',
  borderRadius: '6px',
  '&:hover': {
    backgroundColor: theme.palette.error.main + '15',
    color: theme.palette.error.dark,
    transform: 'scale(1.1)'
  }
}))

const EditButton = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(0.5),
  width: '28px',
  height: '28px',
  color: theme.palette.primary.main,
  transition: 'all 0.2s ease',
  borderRadius: '6px',
  '&:hover': {
    backgroundColor: theme.palette.primary.main + '15',
    color: theme.palette.primary.dark,
    transform: 'scale(1.1)'
  }
}))

// ============= COMPONENT PROPS =============

export type ChatbotHeaderActionsProps = {
  onNewConversation?: () => void
  currentConversationId?: string | null
}

// ============= MAIN COMPONENT =============

const ChatbotHeaderActions = ({ onNewConversation, currentConversationId }: ChatbotHeaderActionsProps) => {
  const [historyAnchor, setHistoryAnchor] = useState<null | HTMLElement>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleHistoryClick = useCallback(
    async (event: React.MouseEvent<HTMLElement>) => {
      setHistoryAnchor(event.currentTarget)

      if (conversations.length === 0) {
        await fetchConversations()
      }
    },
    [conversations.length]
  )

  const handleHistoryClose = useCallback(() => {
    setHistoryAnchor(null)
  }, [])

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true)
      const response = await chatbotService.getConversations(20, 0)
      const fetchedConversations = response.data || []
      const uniqueConversations = removeDuplicateConversations(fetchedConversations)

      setConversations(uniqueConversations)
    } catch (err) {
      console.error('Error fetching conversations:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleNewConversation = useCallback(() => {
    if (onNewConversation) {
      onNewConversation()
    }
  }, [onNewConversation])

  const handleDeleteConversation = useCallback(async (conversation: Conversation, e: React.MouseEvent) => {
    e.stopPropagation()

    if (!window.confirm(`Xóa cuộc trò chuyện "${conversation.title}"?`)) {
      return
    }

    try {
      setDeletingId(conversation.id)
      const response = await chatbotService.deleteConversation(conversation.id)

      if (response.success) {
        setConversations(prev => prev.filter(c => c.id !== conversation.id))
      }
    } catch (err) {
      console.error('Error deleting conversation:', err)
    } finally {
      setDeletingId(null)
    }
  }, [])

  const handleSelectConversation = useCallback(
    async (conversation: Conversation) => {
      try {
        // Trigger parent to load conversation
        if ((window as any).__loadConversationFromHistory) {
          await (window as any).__loadConversationFromHistory(conversation)
        }

        handleHistoryClose()
      } catch (err) {
        console.error('Error loading conversation:', err)
      }
    },
    [handleHistoryClose]
  )

  const historyOpen = Boolean(historyAnchor)

  return (
    <>
      {/* New Conversation Button */}
      <Tooltip title='Tạo cuộc trò chuyện mới'>
        <HeaderActionButton size='small' onClick={handleNewConversation}>
          <Plus size={18} />
        </HeaderActionButton>
      </Tooltip>

      {/* History Button */}
      <Tooltip title='Xem lịch sử cuộc trò chuyện'>
        <HeaderActionButton size='small' onClick={handleHistoryClick}>
          <History size={18} />
        </HeaderActionButton>
      </Tooltip>

      {/* History Menu */}
      <Menu
        anchorEl={historyAnchor}
        open={historyOpen}
        onClose={handleHistoryClose}
        PaperProps={{
          style: {
            maxHeight: 300,
            minWidth: 320
          }
        }}
        MenuListProps={{
          style: {
            padding: 0
          }
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 2,
              gap: 1
            }}
          >
            <CircularProgress size={18} />
            <Typography sx={{ fontSize: '13px', color: 'text.secondary' }}>Đang tải lịch sử...</Typography>
          </Box>
        ) : conversations.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '13px', fontWeight: 500, color: 'text.secondary' }}>
              Chưa có cuộc trò chuyện nào
            </Typography>
          </Box>
        ) : (
          conversations.map(conversation => (
            <StyledMenuItem
              key={conversation.id}
              selected={conversation.id === currentConversationId}
              onClick={() => handleSelectConversation(conversation)}
            >
              <ConversationItemBox>
                <ConversationContent>
                  <ConversationTitle title={conversation.title}>
                    {truncateText(conversation.title, 35)}
                  </ConversationTitle>
                  <ConversationDate>{formatConversationDate(conversation.created_at)}</ConversationDate>
                </ConversationContent>
                <ConversationActions className='conversation-actions'>
                  <DeleteButton
                    size='small'
                    onClick={e => handleDeleteConversation(conversation, e)}
                    disabled={deletingId === conversation.id}
                    title='Xóa'
                  >
                    {deletingId === conversation.id ? <CircularProgress size={14} /> : <Trash2 size={14} />}
                  </DeleteButton>
                </ConversationActions>
              </ConversationItemBox>
            </StyledMenuItem>
          ))
        )}
      </Menu>
    </>
  )
}

export default ChatbotHeaderActions
