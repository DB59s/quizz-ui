import { styled } from '@mui/material/styles'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'

export const TestScenariosContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1.2),
  flexWrap: 'nowrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%'
}))

export const ScenarioButton = styled(Button, {
  shouldForwardProp: prop => prop !== 'active'
})<{ active?: boolean }>(({ theme, active }) => ({
  textTransform: 'none',
  padding: theme.spacing(1.1, 2.2),
  borderRadius: '24px',
  border: `2px solid ${active ? theme.palette.primary.main : theme.palette.divider}`,
  backgroundColor: active ? theme.palette.primary.main : theme.palette.background.paper,
  color: active ? '#ffffff' : theme.palette.primary.main,
  fontSize: '13px',
  fontWeight: 600,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  whiteSpace: 'nowrap',
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(0.75),
  position: 'relative',
  overflow: 'hidden',
  flex: 1,
  justifyContent: 'center',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    transition: 'left 0.3s ease',
    zIndex: 0
  },
  '&:hover::before': {
    left: '100%'
  },
  '&:hover': {
    backgroundColor: active ? theme.palette.primary.dark : theme.palette.action.hover,
    borderColor: theme.palette.primary.main,
    transform: 'translateY(-3px)',
    boxShadow: active ? `0 4px 12px ${theme.palette.primary.main}40` : `0 4px 12px ${theme.palette.primary.main}25`
  },
  '&:active': {
    transform: 'translateY(-1px)'
  },
  '& > *': {
    position: 'relative',
    zIndex: 1
  }
}))

