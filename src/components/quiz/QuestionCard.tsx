import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { AnswerOption } from './AnswerOption'

type Option = {
  id: string
  text: string
}

interface QuestionCardProps {
  question: {
    id: string
    question: string
    type: string
    options: Option[]
  }
  currentQuestionNumber: number
  answers: Record<string, string[]>
  onAnswerChange: (questionId: string, answerId: string, isMultiple: boolean) => void
}

export const QuestionCard = ({ question, currentQuestionNumber, answers, onAnswerChange }: QuestionCardProps) => {
  const selectedAnswerIds = answers[question.id] || []
  const isMultiple = question.type === '2'

  return (
    <Box
      sx={{
        mt: 4,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        p: { xs: 3, sm: 4 },
        boxShadow: 1
      }}
    >
      <Typography variant='h4' sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '1.875rem' }, mb: 2 }}>
        Câu {currentQuestionNumber}
      </Typography>
      <Typography variant='body1' sx={{ fontSize: { xs: '1rem', sm: '1.125rem' }, lineHeight: 1.75, mb: 3 }}>
        {question.question}
      </Typography>

      {/* Answer Options */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
        {question.options.map(option => (
          <AnswerOption
            key={option.id}
            option={option}
            isSelected={selectedAnswerIds.includes(option.id)}
            isMultiple={isMultiple}
            questionId={question.id}
            onAnswerChange={onAnswerChange}
          />
        ))}
      </Box>
    </Box>
  )
}
