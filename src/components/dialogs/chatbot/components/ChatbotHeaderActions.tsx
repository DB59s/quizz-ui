'use client'

import { useCallback, useState } from 'react'

import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import Popover from '@mui/material/Popover'
import Box from '@mui/material/Box'

import ConversationList from './ConversationList'
import '../styles/ChatbotHeaderActions.css'

// Icons
import { History, Plus } from 'lucide-react'

// Services
import type { Conversation } from '@/services/chatbot.service'

// ============= COMPONENT PROPS =============

export type ChatbotHeaderActionsProps = {
  onNewConversation?: () => void
  currentConversationId?: string | null
  onConversationSelect?: (conversation: Conversation, messages: any[]) => void
  cachedConversations?: Conversation[]
  onConversationsChange?: (conversations: Conversation[]) => void
  onConversationUpdate?: (conversation: Conversation) => void
}

// ============= MAIN COMPONENT =============

const ChatbotHeaderActions = ({
  onNewConversation,
  currentConversationId,
  onConversationSelect,
  cachedConversations,
  onConversationsChange,
  onConversationUpdate
}: ChatbotHeaderActionsProps) => {
  const [historyAnchor, setHistoryAnchor] = useState<null | HTMLElement>(null)

  const handleHistoryClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setHistoryAnchor(event.currentTarget)
  }, [])

  const handleHistoryClose = useCallback(() => {
    setHistoryAnchor(null)
  }, [])

  const handleNewConversation = useCallback(() => {
    if (onNewConversation) {
      onNewConversation()
    }
  }, [onNewConversation])

  const handleConversationSelect = useCallback(
    (conversation: Conversation, messages: any[]) => {
      if (onConversationSelect) {
        onConversationSelect(conversation, messages)
      }
      handleHistoryClose()
    },
    [onConversationSelect, handleHistoryClose]
  )

  const historyOpen = Boolean(historyAnchor)

  return (
    <>
      {/* New Conversation Button */}
      <Tooltip title='Tạo cuộc trò chuyện mới'>
        <IconButton size='small' onClick={handleNewConversation} className='header-action-button'>
          <Plus size={18} />
        </IconButton>
      </Tooltip>

      {/* History Button */}
      <Tooltip title='Xem lịch sử cuộc trò chuyện'>
        <IconButton size='small' onClick={handleHistoryClick} className='header-action-button'>
          <History size={18} />
        </IconButton>
      </Tooltip>

      {/* History Popover with ConversationList */}
      <Popover
        open={historyOpen}
        anchorEl={historyAnchor}
        onClose={handleHistoryClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              minWidth: 320,
              maxWidth: 400,
              borderRadius: 2,
              boxShadow: 3
            }
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <ConversationList
            onConversationSelect={handleConversationSelect}
            currentConversationId={currentConversationId}
            onConversationUpdate={onConversationUpdate}
            cachedConversations={cachedConversations}
            onConversationsChange={onConversationsChange}
          />
        </Box>
      </Popover>
    </>
  )
}

export default ChatbotHeaderActions
