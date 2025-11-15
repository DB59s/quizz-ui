import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
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
  gap: theme.spacing(1)
}))

export const ConversationTitle = styled(Typography)(({ theme }) => ({
  fontSize: '13px',
  fontWeight: 500,
  color: theme.palette.text.primary,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  flex: 1
}))

export const ConversationDate = styled(Chip)(({ theme }) => ({
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
  width: '24px',
  height: '24px',
  color: theme.palette.error.main,
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: theme.palette.error.main + '15',
    color: theme.palette.error.dark
  }
}))

export const EditButton = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(0.5),
  width: '24px',
  height: '24px',
  color: theme.palette.primary.main,
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: theme.palette.primary.main + '15',
    color: theme.palette.primary.dark
  }
}))

