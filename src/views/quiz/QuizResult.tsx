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
import Alert from '@mui/material/Alert'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import CircularProgress from '@mui/material/CircularProgress'
import Checkbox from '@mui/material/Checkbox'
import Radio from '@mui/material/Radio'

// Service Imports
import { quizService } from '@/services/quiz.service'
import { useChatbotContext } from '@/contexts/ChatbotContext'

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
  type?: string
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
  type: string
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
  const { openChatbot } = useChatbotContext()
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
        const reviewAnswers: Answer[] = data.detailed_results.map((question: DetailedResult) => {
          const questionType = question.type || '1' // Default to single choice if not specified

          if (questionType === '2') {
            // Multiple choice (checkbox) - check if all correct answers are selected and no incorrect ones
            const correctAnswers = question.answers.filter(a => a.is_correct)
            const studentAnswers = question.answers.filter(a => a.student_selected)

            const allCorrectSelected = correctAnswers.every(ca =>
              studentAnswers.some(sa => sa.answer_id === ca.answer_id)
            )
            const noIncorrectSelected = studentAnswers.every(sa => sa.is_correct)
            const isCorrect = allCorrectSelected && noIncorrectSelected && correctAnswers.length > 0

            return {
              questionId: question.question_id,
              question: question.content,
              studentAnswer: studentAnswers.map(a => a.answer_id).join(','),
              correctAnswer: correctAnswers.map(a => a.answer_id).join(','),
              correctAnswerText: correctAnswers.map(a => a.content).join(', '),
              isCorrect,
              points: isCorrect ? pointsPerQuestion : 0,
              options: question.answers,
              type: questionType
            }
          } else {
            // Single choice (radio) - existing logic
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
              options: question.answers,
              type: questionType
            }
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

  const handleOpenChatbot = (question: string) => {
    openChatbot(question, 'question_bank')
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
    <Box className='max-w-[960px] mx-auto'>
      {/* Header */}
      {/* Action Buttons */}
      <Box className='flex flex-wrap gap-3 mb-8'>
        <Button
          variant='contained'
          size='large'
          onClick={handleBack}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            px: 4,
            py: 1.5
          }}
        >
          Quay lại
        </Button>
      </Box>
      <Box className='flex flex-wrap justify-between items-start gap-3 mb-8'>
        <Box className='flex flex-col gap-2'>
          <Typography variant='h3' className='font-black tracking-tight text-gray-900'>
            {result.quizTitle}
          </Typography>
          <Typography variant='body1' className='text-gray-500'>
            Nộp lúc: {formatDate(result.submittedAt)}
          </Typography>
        </Box>
      </Box>

      {/* Score Card */}
      <Card
        sx={{
          mb: 4,
          borderRadius: 3,
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Box className='flex flex-col md:flex-row items-center gap-8'>
            {/* Circular Progress */}
            <Box className='relative' sx={{ width: { xs: 160, md: 192 }, height: { xs: 160, md: 192 } }}>
              <svg
                className='absolute inset-0'
                style={{ transform: 'rotate(-90deg)' }}
                viewBox='0 0 100 100'
                width='100%'
                height='100%'
              >
                {/* Background circle */}
                <circle cx='50' cy='50' r='45' fill='none' stroke='#e5e7eb' strokeWidth='10' />
                {/* Progress circle */}
                <circle
                  cx='50'
                  cy='50'
                  r='45'
                  fill='none'
                  stroke='#22c55e'
                  strokeWidth='10'
                  strokeLinecap='round'
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - result.percentage / 100)}`}
                  style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                />
              </svg>
              <Box className='absolute inset-0 flex flex-col items-center justify-center'>
                <Typography variant='h3' className='font-bold text-gray-900'>
                  {result.percentage}%
                </Typography>
                <Typography variant='body2' className='text-gray-500'>
                  {result.earnedPoints}/{result.totalPoints} Điểm
                </Typography>
              </Box>
            </Box>

            {/* Right Section */}
            <Box className='flex flex-1 flex-col items-center md:items-start gap-6 w-full'>
              {/* Pass/Fail Badge */}
              <Box
                className='flex items-center gap-2 px-4 py-2 rounded-full'
                sx={{
                  bgcolor: result.status === 'passed' ? 'success.lighter' : 'error.lighter',
                  color: result.status === 'passed' ? 'success.main' : 'error.main'
                }}
              >
                <i className={result.status === 'passed' ? 'tabler-circle-check' : 'tabler-alert-circle'} />
                <Typography className='font-bold text-base'>
                  {result.status === 'passed' ? 'Đạt' : 'Chưa đạt'}
                </Typography>
              </Box>

              {/* Stats Grid */}
              <Box className='grid grid-cols-1 sm:grid-cols-2 gap-4 w-full'>
                <Card
                  sx={{
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box className='flex items-center gap-2 mb-2'>
                      <i className='tabler-checkbox text-gray-500' style={{ fontSize: '1rem' }} />
                      <Typography variant='body2' className='text-gray-500 font-medium'>
                        Câu trả lời đúng
                      </Typography>
                    </Box>
                    <Typography variant='h4' className='font-bold text-gray-900'>
                      {getCorrectCount()}
                    </Typography>
                  </CardContent>
                </Card>

                <Card
                  sx={{
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box className='flex items-center gap-2 mb-2'>
                      <i className='tabler-list-numbers text-gray-500' style={{ fontSize: '1rem' }} />
                      <Typography variant='body2' className='text-gray-500 font-medium'>
                        Tổng câu hỏi
                      </Typography>
                    </Box>
                    <Typography variant='h4' className='font-bold text-gray-900'>
                      {result.totalQuestions}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Answer Review */}
      <Box className='flex flex-col gap-4'>
        <Typography variant='h5' className='font-bold text-gray-900'>
          Chi tiết câu trả lời
        </Typography>

        <Box className='flex flex-col gap-3'>
          {answers.map((answer, index) => (
            <Accordion
              key={answer.questionId}
              defaultExpanded={!answer.isCorrect}
              sx={{
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 'none',
                '&:before': { display: 'none' },
                '&.Mui-expanded': {
                  margin: 0
                }
              }}
            >
              <AccordionSummary
                expandIcon={<i className='tabler-chevron-down' style={{ fontSize: '1.25rem', color: '#6b7280' }} />}
                sx={{
                  p: 2,
                  '& .MuiAccordionSummary-content': {
                    margin: '12px 0'
                  }
                }}
              >
                <Box className='flex items-center gap-4 w-full'>
                  <Box
                    className='flex items-center justify-center rounded-full'
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: answer.isCorrect ? 'success.lighter' : 'error.lighter',
                      color: answer.isCorrect ? 'success.main' : 'error.main'
                    }}
                  >
                    <i className={answer.isCorrect ? 'tabler-check' : 'tabler-x'} style={{ fontSize: '1.25rem' }} />
                  </Box>
                  <Typography className='font-medium text-gray-800 flex-1'>
                    Câu {index + 1}: {answer.question}
                  </Typography>
                  <Button
                    variant='outlined'
                    size='small'
                    onClick={() => handleOpenChatbot(answer.question)}
                    sx={{
                      textTransform: 'none',
                      minWidth: 'auto',
                      px: 2
                    }}
                  >
                    <i className='tabler-bot' style={{ marginRight: 4 }} />
                    Hỏi chatbot
                  </Button>
                </Box>
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  p: { xs: 2, md: 3 },
                  borderTop: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Box className='space-y-4'>
                  {/* Question Type Indicator */}
                  {answer.type === '2' && (
                    <Alert severity='info' sx={{ mb: 2 }}>
                      <strong>Câu hỏi nhiều lựa chọn</strong> - Có thể chọn nhiều đáp án đúng
                    </Alert>
                  )}

                  {/* Student Answer Section */}
                  {/* <Box className='flex flex-col gap-2'>
                    <Typography variant='body2' className='font-semibold text-gray-700'>
                      Câu trả lời của bạn:
                    </Typography>
                    <Box
                      className='p-3 rounded-md border'
                      sx={{
                        bgcolor: answer.isCorrect ? 'success.lighter' : 'error.lighter',
                        borderColor: answer.isCorrect ? 'success.light' : 'error.light',
                        color: answer.isCorrect ? 'success.main' : 'error.main'
                      }}
                    >
                      {answer.type === '2'
                        ? answer.options
                            .filter(opt => opt.student_selected)
                            .map(opt => opt.content)
                            .join(', ') || 'Chưa chọn đáp án'
                        : answer.options.find(opt => opt.student_selected)?.content || 'Chưa chọn đáp án'}
                    </Box>
                  </Box> */}

                  {/* Correct Answer Section */}
                  {!answer.isCorrect && (
                    <Box className='flex flex-col gap-2'>
                      <Typography variant='body2' className='font-semibold text-gray-700'>
                        Đáp án đúng:
                      </Typography>
                      <Box
                        className='p-3 rounded-md border'
                        sx={{
                          bgcolor: 'success.lighter',
                          borderColor: 'success.light',
                          color: 'success.main'
                        }}
                      >
                        {answer.correctAnswerText}
                      </Box>
                    </Box>
                  )}

                  {/* Correct answer confirmation for correct answers (single choice only) */}
                  {/* {answer.isCorrect && answer.type !== '2' && (
                    <Box className='flex flex-col gap-2'>
                      <Typography variant='body2' className='font-semibold text-gray-700'>
                        Đáp án đúng:
                      </Typography>
                      <Box
                        className='p-3 rounded-md border'
                        sx={{
                          bgcolor: 'success.lighter',
                          borderColor: 'success.light',
                          color: 'success.main'
                        }}
                      >
                        {answer.correctAnswerText}
                      </Box>
                    </Box>
                  )} */}

                  {/* All Options */}
                  <Box className='flex flex-col gap-2 pt-2'>
                    <Typography variant='body2' className='font-semibold text-gray-700'>
                      Các đáp án:
                    </Typography>
                    <Box className='space-y-2'>
                      {answer.options.map((option, optIndex) => {
                        const isStudentAnswer = option.student_selected
                        const isCorrectAnswer = option.is_correct
                        const isWrongAnswer = isStudentAnswer && !option.is_correct

                        return (
                          <Box
                            key={option.answer_id}
                            className='flex items-center gap-3 p-3 rounded-lg border'
                            sx={{
                              borderColor: isCorrectAnswer ? 'success.main' : isWrongAnswer ? 'error.main' : 'divider',
                              bgcolor: isCorrectAnswer
                                ? 'success.lighter'
                                : isWrongAnswer
                                  ? 'error.lighter'
                                  : 'transparent',
                              borderWidth: isCorrectAnswer || isWrongAnswer ? 2 : 1
                            }}
                          >
                            {/* Show checkbox for type 2, radio for type 1 */}
                            {answer.type === '2' ? (
                              <Checkbox
                                checked={isStudentAnswer}
                                disabled
                                sx={{
                                  color: isCorrectAnswer ? 'success.main' : isWrongAnswer ? 'error.main' : 'default',
                                  '&.Mui-checked': {
                                    color: isCorrectAnswer ? 'success.main' : 'error.main'
                                  }
                                }}
                              />
                            ) : (
                              <Radio
                                checked={isStudentAnswer}
                                disabled
                                sx={{
                                  color: isCorrectAnswer ? 'success.main' : isWrongAnswer ? 'error.main' : 'default',
                                  '&.Mui-checked': {
                                    color: isCorrectAnswer ? 'success.main' : 'error.main'
                                  }
                                }}
                              />
                            )}
                            <Typography variant='body1' className='text-gray-700 flex-1'>
                              {String.fromCharCode(65 + optIndex)}. {option.content}
                            </Typography>
                            {isCorrectAnswer && (
                              <Chip label='Đúng' size='small' color='success' icon={<i className='tabler-check' />} />
                            )}
                            {isWrongAnswer && (
                              <Chip label='Đã chọn' size='small' color='error' icon={<i className='tabler-x' />} />
                            )}
                          </Box>
                        )
                      })}
                    </Box>
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Box>
    </Box>
  )
}

export default QuizResult
