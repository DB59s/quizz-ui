import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'

export const StyledFormControl = styled(FormControl)(({ theme }) => ({
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

export const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  fontSize: '13px',
  transition: 'all 0.2s ease',
  padding: theme.spacing(1, 1.5),
  borderRadius: '8px',
  margin: theme.spacing(0.25, 0.5),
  '& .conversation-actions': {
    opacity: 1 // Always show buttons
  },
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

export const LoadingBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(2),
  color: theme.palette.text.secondary
}))

export const LoadingText = styled(Typography)(({ theme }) => ({
  fontSize: '13px',
  fontWeight: 500,
  color: theme.palette.text.secondary
}))

export const EmptyStateBox = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(2),
  color: theme.palette.text.secondary
}))

export const ConversationItemBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  gap: theme.spacing(1),
  padding: theme.spacing(0.5, 0)
}))

export const ConversationContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minWidth: 0,
  gap: theme.spacing(0.25)
}))

export const ConversationTitle = styled(Typography)(({ theme }) => ({
  fontSize: '13px',
  fontWeight: 600,
  color: theme.palette.text.primary,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  lineHeight: 1.4
}))

export const ConversationDate = styled(Typography)(({ theme }) => ({
  fontSize: '11px',
  fontWeight: 400,
  color: theme.palette.text.secondary,
  lineHeight: 1.2
}))

export const ConversationActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  flexShrink: 0,
  pointerEvents: 'auto',
  zIndex: 1
}))

export const Container = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  width: '100%'
})

export const NewConversationButton = styled(Button)(({ theme }) => ({
  flex: '0 0 calc(50% - 4px)',
  height: '40px',
  borderRadius: '10px',
  border: '1.5px solid',
  borderColor: theme.palette.divider,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  fontSize: '13px',
  fontWeight: 500,
  textTransform: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
    color: theme.palette.primary.main
  },
  '&.Mui-disabled': {
    opacity: 0.6
  }
}))

export const DeleteButton = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(0.5),
  width: '28px',
  height: '28px',
  minWidth: '28px',
  color: theme.palette.error.main,
  transition: 'all 0.2s ease',
  borderRadius: '6px',
  flexShrink: 0,
  pointerEvents: 'auto',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&:hover': {
    backgroundColor: theme.palette.error.main + '15',
    color: theme.palette.error.dark,
    transform: 'scale(1.1)'
  },
  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed'
  }
}))

export const EditButton = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(0.5),
  width: '28px',
  height: '28px',
  minWidth: '28px',
  color: theme.palette.primary.main,
  transition: 'all 0.2s ease',
  borderRadius: '6px',
  flexShrink: 0,
  pointerEvents: 'auto',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&:hover': {
    backgroundColor: theme.palette.primary.main + '15',
    color: theme.palette.primary.dark,
    transform: 'scale(1.1)'
  },
  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed'
  }
}))
