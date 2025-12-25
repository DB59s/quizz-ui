import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

interface QuizProgressProps {
  currentQuestion: number
  totalQuestions: number
}

export const QuizProgress = ({ currentQuestion, totalQuestions }: QuizProgressProps) => {
  const progress = ((currentQuestion + 1) / totalQuestions) * 100

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography variant='body2' sx={{ textAlign: 'center', fontWeight: 500 }}>
        Câu {currentQuestion + 1} trên {totalQuestions}
      </Typography>
      <Box
        sx={{
          width: '100%',
          height: 8,
          borderRadius: '9999px',
          bgcolor: 'action.disabledBackground',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            height: '100%',
            borderRadius: '9999px',
            bgcolor: 'primary.main',
            width: `${progress}%`,
            transition: 'width 0.3s ease'
          }}
        />
      </Box>
    </Box>
  )
}
