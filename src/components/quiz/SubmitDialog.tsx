import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

interface SubmitDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: () => void
  answeredCount: number
  totalQuestions: number
  submitting: boolean
}

export const SubmitDialog = ({
  open,
  onClose,
  onSubmit,
  answeredCount,
  totalQuestions,
  submitting
}: SubmitDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3
        }
      }}
    >
      <DialogContent sx={{ p: 4, textAlign: 'center' }}>
        <div className='flex flex-col items-center text-center'>
          <DialogTitle sx={{ mt: 2, mb: 1, p: 0, fontSize: '1.25rem', fontWeight: 700 }}>
            Nộp bài kiểm tra?
          </DialogTitle>
          <Typography variant='body2' sx={{ color: 'text.secondary', mt: 1 }}>
            Bạn có chắc chắn muốn nộp bài? Bạn đã trả lời{' '}
            <span className='font-bold'>
              {answeredCount} trong tổng số {totalQuestions}
            </span>{' '}
            câu hỏi.
          </Typography>
        </div>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0, gap: 2 }}>
        <Button onClick={onClose} variant='outlined' disabled={submitting} sx={{ flex: 1 }}>
          Hủy
        </Button>
        <Button onClick={onSubmit} variant='contained' color='primary' disabled={submitting} sx={{ flex: 1 }}>
          {submitting ? 'Đang nộp...' : 'Có, nộp bài'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
