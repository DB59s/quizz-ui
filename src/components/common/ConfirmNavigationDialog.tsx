import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { AlertTriangle } from 'lucide-react'
import Box from '@mui/material/Box'

interface ConfirmNavigationDialogProps {
  open: boolean
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export const ConfirmNavigationDialog = ({ open, message, onConfirm, onCancel }: ConfirmNavigationDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth='sm'
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3
        }
      }}
    >
      <DialogContent sx={{ p: 4, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              bgcolor: 'warning.lighter',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <AlertTriangle size={24} color='#FFC107' />
          </Box>
          <DialogTitle sx={{ p: 0, fontSize: '1.25rem', fontWeight: 700 }}>Xác nhận rời khỏi trang</DialogTitle>
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            {message}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0, gap: 2 }}>
        <Button onClick={onCancel} variant='outlined' sx={{ flex: 1 }}>
          Ở lại
        </Button>
        <Button onClick={onConfirm} variant='contained' color='warning' sx={{ flex: 1 }}>
          Rời khỏi
        </Button>
      </DialogActions>
    </Dialog>
  )
}
