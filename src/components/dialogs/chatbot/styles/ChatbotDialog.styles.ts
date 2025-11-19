import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

// ============= Layout Components =============
export const ChatWidget = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(4),
  right: theme.spacing(4),
  width: '550px',
  height: '680px',
  maxHeight: '85vh',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.paper,
  borderRadius: '16px',
  boxShadow: `0 8px 32px ${theme.palette.primary.main}20`,
  zIndex: 1300,
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  border: `1px solid ${theme.palette.primary.main}10`,
  [theme.breakpoints.down('sm')]: {
    width: 'calc(100vw - 32px)',
    height: 'calc(100vh - 100px)',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
    left: theme.spacing(2)
  }
}))

export const ChatContent = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden'
})

export const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(1.5, 2),
  background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.main}08 100%)`,
  borderBottom: `1.5px solid ${theme.palette.primary.main}20`,
  minHeight: '60px',
  gap: theme.spacing(1),
  boxShadow: `0 2px 8px ${theme.palette.primary.main}10`
}))

export const HeaderLeft = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  flex: 1
})

export const HeaderRight = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.25)
}))

export const MessagesContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
  flex: 1,
  overflowY: 'auto',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  '&::-webkit-scrollbar': {
    width: '6px'
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent'
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
    borderRadius: '3px',
    '&:hover': {
      background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)'
    }
  }
}))

// ============= Message Components =============
export const MessageRow = styled(Box, {
  shouldForwardProp: prop => prop !== 'isUser'
})<{ isUser?: boolean }>(({ theme, isUser }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: 4,
  marginBottom: theme.spacing(1.5),
  flexDirection: isUser ? 'row-reverse' : 'row',
  width: '100%'
}))

export const MessageBubble = styled(Box, {
  shouldForwardProp: prop => prop !== 'isUser'
})<{ isUser?: boolean }>(({ theme, isUser }) => ({
  padding: theme.spacing(1, 1.5),
  // maxWidth: isUser ? 'calc(100% - 8px)' : 'calc(100% - 40px)',
  backgroundColor: isUser ? theme.palette.primary.main : theme.palette.action.hover,
  color: isUser ? '#ffffff' : theme.palette.text.primary,
  borderRadius: isUser ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
  wordBreak: 'normal',
  overflowWrap: 'break-word',
  whiteSpace: 'pre-line',
  fontSize: '14px',
  lineHeight: '20px',
  marginLeft: isUser ? '35px' : '0',
  boxShadow: isUser ? `0 1px 2px ${theme.palette.primary.main}22` : `0 1px 2px ${theme.palette.action.hover}`
}))

export const SenderName = styled(Typography, {
  shouldForwardProp: prop => prop !== 'alignRight'
})<{ alignRight?: boolean }>(({ theme, alignRight }) => ({
  fontSize: '13px',
  fontWeight: 600,
  color: theme.palette.text.primary,
  marginBottom: 4,
  textAlign: alignRight ? 'right' : 'left'
}))

export const StatusIndicator = styled(Box, {
  shouldForwardProp: prop => prop !== 'online'
})<{ online?: boolean }>(({ theme, online }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  '& .status-dot': {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: online ? theme.palette.success.main : theme.palette.text.disabled,
    animation: online ? 'pulse 2s infinite' : 'none',
    '@keyframes pulse': {
      '0%': {
        opacity: 1,
        transform: 'scale(1)'
      },
      '50%': {
        opacity: 0.7,
        transform: 'scale(1.1)'
      },
      '100%': {
        opacity: 1,
        transform: 'scale(1)'
      }
    }
  }
}))

export const WelcomeMessageCard = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}10 0%, ${theme.palette.primary.main}05 100%)`,
  borderRadius: '14px',
  padding: theme.spacing(2.5),
  marginBottom: theme.spacing(1.5),
  border: `1.5px solid ${theme.palette.primary.main}25`,
  boxShadow: `0 2px 12px ${theme.palette.primary.main}12`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
}))

// ============= Input Components =============
export const InputContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.paper,
  borderTop: `1px solid ${theme.palette.divider}`
}))

export const InputWrapperContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-end',
  gap: theme.spacing(0.5),
  padding: theme.spacing(1, 1.5)
}))

export const InputWrapper = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  backgroundColor: theme.palette.background.paper,
  borderRadius: '24px',
  padding: theme.spacing(1, 1.75),
  border: `1.5px solid ${theme.palette.divider}`,
  minHeight: '44px',
  maxHeight: '120px',
  overflowY: 'auto',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    boxShadow: `0 2px 8px ${theme.palette.primary.main}15`
  },
  '&:focus-within': {
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 3px ${theme.palette.primary.main}20`
  },
  '& .MuiTextField-root': {
    width: '100%'
  }
}))

// ============= UI Components =============
export const ActionButton = styled(IconButton)(({ theme }) => ({
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

export const TypingIndicator = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.75),
  padding: theme.spacing(1, 1.75),
  backgroundColor: theme.palette.action.hover,
  borderRadius: '20px',
  width: 'fit-content',
  boxShadow: `0 2px 8px ${theme.palette.action.hover}20`,
  animation: 'slideUp 0.3s ease-out'
}))

export const TypingDot = styled(Box)(({ theme }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: theme.palette.text.secondary,
  animation: 'typing 1.4s infinite',
  '&:nth-of-type(2)': {
    animationDelay: '0.2s'
  },
  '&:nth-of-type(3)': {
    animationDelay: '0.4s'
  },
  '@keyframes typing': {
    '0%, 60%, 100%': {
      transform: 'translateY(0)'
    },
    '30%': {
      transform: 'translateY(-10px)'
    }
  }
}))

export const ScrollToBottomButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  bottom: 80,
  right: 16,
  width: 44,
  height: 44,
  backgroundColor: theme.palette.background.paper,
  boxShadow: `0 4px 16px ${theme.palette.primary.main}25`,
  border: `1.5px solid ${theme.palette.primary.main}30`,
  color: theme.palette.primary.main,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: 'bounce 2s infinite',
  '@keyframes bounce': {
    '0%, 100%': {
      transform: 'translateY(0)',
      opacity: 1
    },
    '50%': {
      transform: 'translateY(-6px)',
      opacity: 0.8
    }
  },
  '&:hover': {
    backgroundColor: theme.palette.primary.main + '15',
    color: theme.palette.primary.main,
    transform: 'scale(1.1)',
    boxShadow: `0 6px 20px ${theme.palette.primary.main}35`
  }
}))

// ============= Form Components =============
export const QuestionBankPanel = styled(Box, {
  shouldForwardProp: prop => prop !== 'active' && prop !== 'expanded'
})<{ active?: boolean; expanded?: boolean }>(({ theme, active, expanded }) => ({
  display: active ? 'block' : 'none',
  background: `linear-gradient(135deg, ${theme.palette.primary.main}12 0%, ${theme.palette.primary.main}08 100%)`,
  border: `1.5px solid ${theme.palette.primary.main}30`,
  borderRadius: '14px',
  padding: theme.spacing(expanded ? 2 : 1.5),
  margin: theme.spacing(1.5, 2),
  boxShadow: `0 2px 12px ${theme.palette.primary.main}15`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
}))

export const QuestionBankHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  cursor: 'pointer',
  userSelect: 'none'
})

export const QuestionBankTitle = styled(Typography)(({ theme }) => ({
  fontSize: '16px',
  color: theme.palette.primary.main,
  fontWeight: 600,
  flex: 1
}))

export const QuestionBankContent = styled(Box, {
  shouldForwardProp: prop => prop !== 'expanded'
})<{ expanded?: boolean }>(({ theme, expanded }) => ({
  maxHeight: expanded ? '1000px' : '0',
  overflow: 'hidden',
  transition: 'max-height 0.3s ease, opacity 0.3s ease',
  opacity: expanded ? 1 : 0,
  marginTop: expanded ? theme.spacing(1.5) : 0
}))

export const FormGroup = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(1.5)
}))

export const FormLabel = styled(Typography)(({ theme }) => ({
  display: 'block',
  fontSize: '13px',
  fontWeight: 600,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(0.5)
}))

export const FormActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  marginTop: theme.spacing(1.5)
}))
