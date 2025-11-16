'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Fab from '@mui/material/Fab'
import { styled } from '@mui/material/styles'

// Icons
import { Bot } from 'lucide-react'

// Component Imports
import ChatbotDialog from './ChatbotDialog'
import { useChatbotContext } from '@/contexts/ChatbotContext'

// Styled Component
const StyledFab = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(4),
  right: theme.spacing(4),
  zIndex: 1000,
  boxShadow: theme.shadows[8],
  '&:hover': {
    boxShadow: theme.shadows[12]
  },
  [theme.breakpoints.down('md')]: {
    bottom: theme.spacing(2),
    right: theme.spacing(2)
  }
}))

const ChatbotButton = () => {
  const [localOpen, setLocalOpen] = useState(false)
  const { open: contextOpen, initialQuestionContent, initialScenario, closeChatbot } = useChatbotContext()

  const handleToggle = () => {
    setLocalOpen(prev => !prev)
  }

  const handleClose = () => {
    setLocalOpen(false)
    closeChatbot()
  }

  // Use context open if available, otherwise use local state
  const isOpen = contextOpen || localOpen

  return (
    <>
      {!isOpen && (
        <StyledFab color='primary' aria-label='chatbot' onClick={handleToggle}>
          <Bot size={24} />
        </StyledFab>
      )}
      <ChatbotDialog 
        open={isOpen} 
        onClose={handleClose}
        initialQuestionContent={initialQuestionContent}
        initialScenario={initialScenario}
      />
    </>
  )
}

export default ChatbotButton
