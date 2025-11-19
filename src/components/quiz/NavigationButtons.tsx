import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface NavigationButtonsProps {
  currentQuestion: number
  totalQuestions: number
  onPrevious: () => void
  onNext: () => void
}

export const NavigationButtons = ({
  currentQuestion,
  totalQuestions,
  onPrevious,
  onNext
}: NavigationButtonsProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        mt: 6,
        pt: 4,
        borderColor: 'divider'
      }}
    >
      <Button
        variant='outlined'
        onClick={onPrevious}
        disabled={currentQuestion === 0}
        startIcon={<ArrowLeft size={18} />}
        sx={{
          borderRadius: 2,
          textTransform: 'none',
          fontWeight: 600,
          '&:hover': {
            bgcolor: 'action.hover'
          },
          '&.Mui-disabled': {
            opacity: 0.5
          }
        }}
      >
        Câu trước
      </Button>
      {currentQuestion < totalQuestions - 1 ? (
        <Button
          variant='contained'
          onClick={onNext}
          endIcon={<ArrowRight size={18} />}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          Câu tiếp theo
        </Button>
      ) : (
        <Box />
      )}
    </Box>
  )
}
