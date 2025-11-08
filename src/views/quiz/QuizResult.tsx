'use client'

// React Imports
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import LinearProgress from '@mui/material/LinearProgress'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import CircularProgress from '@mui/material/CircularProgress'

// Service Imports
import { quizService } from '@/services/quiz.service'

// Types
type AnswerOption = {
  answer_id: string
  content: string
  is_correct: boolean
  student_selected: boolean
}

type DetailedResult = {
  question_id: string
  content: string
  answers: AnswerOption[]
}

type Answer = {
  questionId: string
  question: string
  studentAnswer: string
  correctAnswer: string
  correctAnswerText: string
  isCorrect: boolean
  points: number
  options: AnswerOption[]
}

type QuizResult = {
  submissionId: string
  quizTitle: string
  studentName: string
  submittedAt: string
  totalQuestions: number
  totalPoints: number
  earnedPoints: number
  percentage: number
  correctCount: number
  status: string
}

const QuizResult = ({ submissionId }: { submissionId: string }) => {
  const router = useRouter()
  const [result, setResult] = useState<QuizResult | null>(null)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchResultData()
  }, [submissionId])

  const fetchResultData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Use submissionId parameter to fetch result
      // API: GET /api/v1/submissions/{submissionId}/result
      const response = await quizService.getSubmissionResult(submissionId)

      if (response.success && response.data) {
        const data = response.data

        // Calculate points (10 points per correct answer)
        const pointsPerQuestion = 10
        const earnedPoints = data.n_total_true * pointsPerQuestion
        const totalPoints = data.total_questions * pointsPerQuestion
        const percentage = data.total_questions > 0 ? Math.round((data.n_total_true / data.total_questions) * 100) : 0

        // Map detailed results to Answer format
        const reviewAnswers: Answer[] = data.detailed_results.map(question => {
          const correctAnswer = question.answers.find(a => a.is_correct)
          const studentAnswer = question.answers.find(a => a.student_selected)
          const isCorrect = studentAnswer?.is_correct || false

          return {
            questionId: question.question_id,
            question: question.content,
            studentAnswer: studentAnswer?.answer_id || '',
            correctAnswer: correctAnswer?.answer_id || '',
            correctAnswerText: correctAnswer?.content || '',
            isCorrect,
            points: isCorrect ? pointsPerQuestion : 0,
            options: question.answers
          }
        })

        setResult({
          submissionId: data.submission_id,
          quizTitle: data.quiz_name,
          studentName: 'Học sinh', // TODO: Get from user session
          submittedAt: data.submission_time,
          totalQuestions: data.total_questions,
          totalPoints,
          earnedPoints,
          percentage,
          correctCount: data.n_total_true,
          status: percentage >= 50 ? 'passed' : 'failed'
        })

        setAnswers(reviewAnswers)
      }
    } catch (err: any) {
      console.error('Error fetching result:', err)
      setError(err?.response?.data?.message || 'Đã xảy ra lỗi khi tải kết quả')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCorrectCount = () => {
    return result?.correctCount || 0
  }

  const getIncorrectCount = () => {
    return (result?.totalQuestions || 0) - (result?.correctCount || 0)
  }

  const handleBack = () => {
    router.back()
  }

  if (loading) {
    return (
      <Box className='flex justify-center items-center p-8'>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box className='p-4'>
        <Alert severity='error' sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant='outlined' onClick={() => router.back()}>
          Quay lại
        </Button>
      </Box>
    )
  }

  if (!result) {
    return <Typography>Không có dữ liệu kết quả</Typography>
  }

  return (
    <Box>
      {/* Header */}
      <Box className='flex items-center gap-4 mb-6'>
        <Button variant='outlined' onClick={handleBack} startIcon={<i className='tabler-arrow-left' />}>
          Quay lại
        </Button>
        <Typography variant='h5' className='font-semibold'>
          Kết quả bài kiểm tra
        </Typography>
      </Box>

      {/* Score Card */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box className='text-center mb-4'>
            <Typography variant='h4' className='font-bold mb-2'>
              {result.quizTitle}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Nộp lúc: {formatDate(result.submittedAt)}
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Score Display */}
          <Box className='text-center mb-4'>
            <Box className='inline-flex items-center justify-center w-40 h-40 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4'>
              <div className='text-center'>
                <Typography variant='h2' className='font-bold text-white'>
                  {result.percentage}
                </Typography>
                <Typography variant='body2' className='text-white'>
                  điểm
                </Typography>
              </div>
            </Box>
            <Typography variant='h6' className='mb-2'>
              {result.earnedPoints}/{result.totalPoints} điểm
            </Typography>
            <Chip
              label={result.status === 'passed' ? 'ĐẠT' : 'CHƯA ĐẠT'}
              color={result.status === 'passed' ? 'success' : 'error'}
              sx={{ fontSize: '1rem', fontWeight: 600, px: 3, py: 2.5 }}
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Statistics */}
          <Box className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <Box className='text-center p-4 bg-blue-50 rounded-lg'>
              <Typography variant='h5' className='font-bold text-blue-600'>
                {result.totalQuestions}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Tổng câu hỏi
              </Typography>
            </Box>
            <Box className='text-center p-4 bg-green-50 rounded-lg'>
              <Typography variant='h5' className='font-bold text-green-600'>
                {getCorrectCount()}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Câu đúng
              </Typography>
            </Box>
            <Box className='text-center p-4 bg-red-50 rounded-lg'>
              <Typography variant='h5' className='font-bold text-red-600'>
                {getIncorrectCount()}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Câu sai
              </Typography>
            </Box>
            <Box className='text-center p-4 bg-purple-50 rounded-lg'>
              <Typography variant='h5' className='font-bold text-purple-600'>
                {result.percentage}%
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Tỷ lệ đúng
              </Typography>
            </Box>
          </Box>

          {/* Progress Bar */}
          <Box sx={{ mt: 4 }}>
            <Box className='flex justify-between mb-2'>
              <Typography variant='body2'>Tỷ lệ đúng</Typography>
              <Typography variant='body2' className='font-semibold'>
                {((getCorrectCount() / result.totalQuestions) * 100).toFixed(1)}%
              </Typography>
            </Box>
            <LinearProgress
              variant='determinate'
              value={(getCorrectCount() / result.totalQuestions) * 100}
              sx={{ height: 10, borderRadius: 5 }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Answer Review */}
      <Card>
        <CardContent>
          <Typography variant='h6' className='font-semibold mb-4'>
            Chi tiết câu trả lời
          </Typography>

          {answers.map((answer, index) => (
            <Accordion key={answer.questionId} defaultExpanded={!answer.isCorrect}>
              <AccordionSummary expandIcon={<i className='tabler-chevron-down' />}>
                <Box className='flex items-center gap-3 w-full'>
                  <Chip
                    label={index + 1}
                    size='small'
                    sx={{
                      bgcolor: answer.isCorrect ? 'success.main' : 'error.main',
                      color: 'white',
                      fontWeight: 600
                    }}
                  />
                  <Typography className='flex-1'>{answer.question}</Typography>
                  <Chip
                    icon={answer.isCorrect ? <i className='tabler-check' /> : <i className='tabler-x' />}
                    label={answer.isCorrect ? 'Đúng' : 'Sai'}
                    color={answer.isCorrect ? 'success' : 'error'}
                    size='small'
                  />
                  <Typography variant='body2' className='font-semibold'>
                    {answer.points}/10 điểm
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  {!answer.isCorrect && (
                    <Alert severity='error' sx={{ mb: 3 }}>
                      Bạn đã chọn sai. Đáp án đúng là: <strong>{answer.correctAnswerText}</strong>
                    </Alert>
                  )}

                  <RadioGroup value={answer.studentAnswer}>
                    {answer.options.map((option, optIndex) => {
                      const isStudentAnswer = option.student_selected
                      const isCorrectAnswer = option.is_correct
                      const isWrongAnswer = isStudentAnswer && !option.is_correct

                      return (
                        <FormControlLabel
                          key={option.answer_id}
                          value={option.answer_id}
                          control={<Radio disabled checked={isStudentAnswer} />}
                          label={
                            <Box className='flex items-center gap-2'>
                              <Typography variant='body1'>
                                {String.fromCharCode(65 + optIndex)}. {option.content}
                              </Typography>
                              {isCorrectAnswer && (
                                <Chip
                                  label='Đáp án đúng'
                                  size='small'
                                  color='success'
                                  icon={<i className='tabler-check' />}
                                />
                              )}
                              {isWrongAnswer && (
                                <Chip
                                  label='Bạn đã chọn'
                                  size='small'
                                  color='error'
                                  icon={<i className='tabler-x' />}
                                />
                              )}
                            </Box>
                          }
                          sx={{
                            mb: 2,
                            p: 2,
                            border: '2px solid',
                            borderColor: isCorrectAnswer ? 'success.main' : isWrongAnswer ? 'error.main' : 'divider',
                            borderRadius: 1,
                            bgcolor: isCorrectAnswer
                              ? 'success.lighter'
                              : isWrongAnswer
                                ? 'error.lighter'
                                : 'transparent'
                          }}
                        />
                      )
                    })}
                  </RadioGroup>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </CardContent>
      </Card>
    </Box>
  )
}

export default QuizResult
