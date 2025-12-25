import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'

interface AnswerOptionProps {
  option: {
    id: string
    text: string
  }
  isSelected: boolean
  isMultiple: boolean
  questionId: string
  onAnswerChange: (questionId: string, answerId: string, isMultiple: boolean) => void
}

export const AnswerOption = ({ option, isSelected, isMultiple, questionId, onAnswerChange }: AnswerOptionProps) => {
  return (
    <Box
      component='label'
      sx={{
        display: 'flex',
        cursor: 'pointer',
        alignItems: 'center',
        gap: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: isSelected ? 'primary.main' : 'divider',
        p: 2,
        bgcolor: isSelected ? 'primary.lighter' : 'transparent',
        transition: 'all 0.2s',
        '&:hover': {
          bgcolor: isSelected ? 'primary.lighter' : 'action.hover'
        },
        ...(isSelected && {
          boxShadow: theme => `0 0 0 2px ${theme.palette.primary.main}40`
        })
      }}
    >
      {isMultiple ? (
        <Checkbox
          checked={isSelected}
          onChange={() => onAnswerChange(questionId, option.id, true)}
          sx={{
            cursor: 'pointer',
            accentColor: 'var(--mui-palette-primary-main)'
          }}
        />
      ) : (
        <input
          type='radio'
          name={`answer-${questionId}`}
          value={option.id}
          checked={isSelected}
          onChange={() => onAnswerChange(questionId, option.id, false)}
          style={{
            width: '20px',
            height: '20px',
            cursor: 'pointer',
            accentColor: 'var(--mui-palette-primary-main)'
          }}
        />
      )}
      <Typography variant='body1' sx={{ flex: 1, fontWeight: 500 }}>
        {option.text}
      </Typography>
    </Box>
  )
}
