'use client'

// React Imports
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'

// MUI Imports
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'

// Lucide Icons
import { Clock, ArrowLeft, ArrowRight } from 'lucide-react'

// Service Imports
import { quizService } from '@/services/quiz.service'
import { classQuizzService } from '@/services/classQuizz.service'

// Types
type Option = {
  id: string
  text: string
}

type Question = {
  id: string
  question: string
  type: string
  points: number
  options: Option[]
  correctAnswer: string
}

type Answer = {
  questionId: string
  selectedAnswerIds: string[] // Changed to array to support multiple selections
}

type QuizInfo = {
  id: string
  title: string
  description: string
  duration: number
  totalQuestions: number
  totalPoints: number
  startTime: string
  endTime: string
}

const TakeQuiz = ({ quizId, quizzClassId }: { quizId: string; quizzClassId?: string }) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const lang = (params.lang as string) || 'en'

  // Lấy classQuizzId từ props hoặc URL
  const classQuizzIdFromUrl = quizzClassId || searchParams.get('quizzClassId')

  const [quiz, setQuiz] = useState<QuizInfo | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [timeLeft, setTimeLeft] = useState(3600) // 60 minutes in seconds
  const [startTime] = useState<number>(Date.now()) // Track when quiz started
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchQuizData()
  }, [quizId])

  const fetchQuizData = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await quizService.getQuizForStudent(quizId)

      if (response.success && response.data) {
        const quizData = response.data

        // Calculate duration from start_time and end_time
        const startTime = new Date(quizData.start_time)
        const endTime = new Date(quizData.end_time)
        const durationMinutes = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60))

        // Calculate total points (assume each question is worth 10 points by default)
        const totalPoints = quizData.questions.length * 10

        // Set quiz info
        setQuiz({
          id: quizData.id,
          title: quizData.name,
          description: quizData.description,
          duration: durationMinutes,
          totalQuestions: quizData.questions.length,
          totalPoints: totalPoints,
          startTime: quizData.start_time,
          endTime: quizData.end_time
        })

        // Map questions
        const mappedQuestions: Question[] = quizData.questions.map((q, index) => ({
          id: q.id,
          question: q.content,
          type: q.type,
          points: 10, // Default points per question
          options: q.answers.map(ans => ({
            id: ans.id,
            text: ans.content
          })),
          correctAnswer: '' // Hidden from student
        }))

        setQuestions(mappedQuestions)

        // Set timer based on remaining time
        const now = new Date()
        const remainingSeconds = Math.floor((endTime.getTime() - now.getTime()) / 1000)
        setTimeLeft(remainingSeconds > 0 ? remainingSeconds : durationMinutes * 60)
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Đã xảy ra lỗi khi tải bài kiểm tra')
    } finally {
      setLoading(false)
    }
  }

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit()
      return
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswerChange = (questionId: string, answerId: string, isMultiple: boolean) => {
    setAnswers(prev => {
      if (isMultiple) {
        // For multiple choice questions, toggle the answer
        const currentAnswers = prev[questionId] || []
        const isSelected = currentAnswers.includes(answerId)
        return {
          ...prev,
          [questionId]: isSelected
            ? currentAnswers.filter(id => id !== answerId)
            : [...currentAnswers, answerId]
        }
      } else {
        // For single choice questions, replace the answer
        return {
          ...prev,
          [questionId]: [answerId]
        }
      }
    })
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  const handleSubmitClick = () => {
    setShowSubmitDialog(true)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setShowSubmitDialog(false)

    try {
      // Calculate total time in seconds
      const totalTime = Math.floor((Date.now() - startTime) / 1000)

      // Format answers according to the API structure
      const formattedAnswers = Object.entries(answers).map(([questionId, selectedAnswerIds]) => ({
        question_id: questionId,
        selected_answer_ids: selectedAnswerIds
      }))

      if (!classQuizzIdFromUrl) {
        throw new Error('Không tìm thấy ID bài kiểm tra')
      }

      // Submit to API
      const response = await classQuizzService.submitQuizAttempt(classQuizzIdFromUrl, formattedAnswers, totalTime)

      if (response.success && response.data) {
        // Navigate to result page using submission_id
        const submissionId = response.data.submission_id
        router.push(`/${lang}/quiz/${submissionId}/result`)
      } else {
        throw new Error(response.message || 'Đã xảy ra lỗi khi nộp bài')
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Đã xảy ra lỗi khi nộp bài')
      setSubmitting(false)
    }
  }

  const getAnsweredCount = () => {
    return Object.keys(answers).length
  }

  if (loading) {
    return (
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          minHeight: '100vh',
          width: '100%',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: '896px',
            flex: 1,
            px: { xs: 2, sm: 3, lg: 4 },
            py: 4
          }}
        >
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  height: 16,
                  width: 192,
                  borderRadius: '9999px',
                  bgcolor: 'action.disabledBackground',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}
              />
              <Box
                sx={{
                  mt: 2,
                  height: 8,
                  width: '100%',
                  borderRadius: '9999px',
                  bgcolor: 'action.disabledBackground',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}
              />
            </Box>
            <Box
              sx={{
                width: '100%',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                p: { xs: 3, sm: 4 },
                boxShadow: 1
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box
                  sx={{
                    height: 32,
                    width: '33%',
                    borderRadius: 2,
                    bgcolor: 'action.disabledBackground',
                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                  }}
                />
                <Box
                  sx={{
                    height: 24,
                    width: '100%',
                    borderRadius: 2,
                    bgcolor: 'action.disabledBackground',
                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                  }}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                  {[1, 2, 3, 4].map(i => (
                    <Box
                      key={i}
                      sx={{
                        height: 56,
                        width: '100%',
                        borderRadius: 2,
                        bgcolor: 'action.disabledBackground',
                        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    )
  }

  if (error) {
    return (
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          minHeight: '100vh',
          width: '100%',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: '896px',
            flex: 1,
            px: { xs: 2, sm: 3, lg: 4 },
            py: 4
          }}
        >
          <Alert severity='error' sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button variant='outlined' onClick={() => router.back()}>
            Quay lại
          </Button>
        </Box>
      </Box>
    )
  }

  if (!quiz || questions.length === 0) {
    return (
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          minHeight: '100vh',
          width: '100%',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: '896px',
            flex: 1,
            px: { xs: 2, sm: 3, lg: 4 },
            py: 4
          }}
        >
          <Typography>Không có dữ liệu bài kiểm tra</Typography>
        </Box>
      </Box>
    )
  }

  const currentQ = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      {/* Header Bar */}
      <Box
        component='header'
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          width: '100%',
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          backdropFilter: 'blur(8px)',
          backgroundColor: theme => `${theme.palette.background.paper}CC`
        }}
      >
        <Box
          sx={{
            maxWidth: '1200px',
            mx: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            whiteSpace: 'nowrap',
            px: { xs: 2, sm: 3, lg: 4 },
            py: 1.5
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 20,
                height: 20,
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <svg fill='none' viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg' width='100%' height='100%'>
                <path
                  d='M39.5563 34.1455V13.8546C39.5563 15.708 36.8773 17.3437 32.7927 18.3189C30.2914 18.916 27.263 19.2655 24 19.2655C20.737 19.2655 17.7086 18.916 15.2073 18.3189C11.1227 17.3437 8.44365 15.708 8.44365 13.8546V34.1455C8.44365 35.9988 11.1227 37.6346 15.2073 38.6098C17.7086 39.2069 20.737 39.5564 24 39.5564C27.263 39.5564 30.2914 39.2069 32.7927 38.6098C36.8773 37.6346 39.5563 35.9988 39.5563 34.1455Z'
                  fill='currentColor'
                ></path>
                <path
                  clipRule='evenodd'
                  d='M10.4485 13.8519C10.4749 13.9271 10.6203 14.246 11.379 14.7361C12.298 15.3298 13.7492 15.9145 15.6717 16.3735C18.0007 16.9296 20.8712 17.2655 24 17.2655C27.1288 17.2655 29.9993 16.9296 32.3283 16.3735C34.2508 15.9145 35.702 15.3298 36.621 14.7361C37.3796 14.246 37.5251 13.9271 37.5515 13.8519C37.5287 13.7876 37.4333 13.5973 37.0635 13.2931C36.5266 12.8516 35.6288 12.3647 34.343 11.9175C31.79 11.0295 28.1333 10.4437 24 10.4437C19.8667 10.4437 16.2099 11.0295 13.657 11.9175C12.3712 12.3647 11.4734 12.8516 10.9365 13.2931C10.5667 13.5973 10.4713 13.7876 10.4485 13.8519ZM37.5563 18.7877C36.3176 19.3925 34.8502 19.8839 33.2571 20.2642C30.5836 20.9025 27.3973 21.2655 24 21.2655C20.6027 21.2655 17.4164 20.9025 14.7429 20.2642C13.1498 19.8839 11.6824 19.3925 10.4436 18.7877V34.1275C10.4515 34.1545 10.5427 34.4867 11.379 35.027C12.298 35.6207 13.7492 36.2054 15.6717 36.6644C18.0007 37.2205 20.8712 37.5564 24 37.5564C27.1288 37.5564 29.9993 37.2205 32.3283 36.6644C34.2508 36.2054 35.702 35.6207 36.621 35.027C37.4573 34.4867 37.5485 34.1546 37.5563 34.1275V18.7877ZM41.5563 13.8546V34.1455C41.5563 36.1078 40.158 37.5042 38.7915 38.3869C37.3498 39.3182 35.4192 40.0389 33.2571 40.5551C30.5836 41.1934 27.3973 41.5564 24 41.5564C20.6027 41.5564 17.4164 41.1934 14.7429 40.5551C12.5808 40.0389 10.6502 39.3182 9.20848 38.3869C7.84205 37.5042 6.44365 36.1078 6.44365 34.1455L6.44365 13.8546C6.44365 12.2684 7.37223 11.0454 8.39581 10.2036C9.43325 9.3505 10.8137 8.67141 12.343 8.13948C15.4203 7.06909 19.5418 6.44366 24 6.44366C28.4582 6.44366 32.5797 7.06909 35.657 8.13948C37.1863 8.67141 38.5667 9.3505 39.6042 10.2036C40.6278 11.0454 41.5563 12.2684 41.5563 13.8546Z'
                  fill='currentColor'
                  fillRule='evenodd'
                ></path>
              </svg>
            </Box>
            <Typography variant='h6' sx={{ fontWeight: 700, fontSize: { xs: '1rem', sm: '1.125rem' } }}>
              {quiz.title}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
            <Clock size={20} color='#FFC107' />
            <Typography variant='body2' sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              Time Left:{' '}
              <Box component='span' sx={{ color: timeLeft < 300 ? 'error.main' : 'warning.main' }}>
                {formatTime(timeLeft)}
              </Box>
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Main Quiz Content */}
      <Box
        component='main'
        sx={{
          width: '100%',
          maxWidth: '896px',
          flex: 1,
          px: { xs: 2, sm: 3, lg: 4 },
          py: 4
        }}
      >
        <Box sx={{ width: '100%' }}>
          {/* Progress Bar */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant='body2' sx={{ textAlign: 'center', fontWeight: 500 }}>
              Question {currentQuestion + 1} of {questions.length}
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

          {/* Question Card */}
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
              Question {currentQuestion + 1}
            </Typography>
            <Typography variant='body1' sx={{ fontSize: { xs: '1rem', sm: '1.125rem' }, lineHeight: 1.75, mb: 3 }}>
              {currentQ.question}
            </Typography>

            {/* Answer Options */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
              {currentQ.options.map((option, index) => {
                const selectedAnswerIds = answers[currentQ.id] || []
                const isSelected = selectedAnswerIds.includes(option.id)
                const isMultiple = currentQ.type === '2'

                return (
                  <Box
                    key={option.id}
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
                        onChange={() => handleAnswerChange(currentQ.id, option.id, true)}
                        sx={{
                          cursor: 'pointer',
                          accentColor: 'var(--mui-palette-primary-main)'
                        }}
                      />
                    ) : (
                      <input
                        type='radio'
                        name={`answer-${currentQ.id}`}
                        value={option.id}
                        checked={isSelected}
                        onChange={() => handleAnswerChange(currentQ.id, option.id, false)}
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
              })}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Navigation Footer */}
      <Box
        component='footer'
        sx={{
          position: 'sticky',
          bottom: 0,
          zIndex: 10,
          width: '100%'
        }}
      >
        <Box
          sx={{
            maxWidth: '1200px',
            mx: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            px: { xs: 2, sm: 3, lg: 4 }
          }}
        >
          <Button
            variant='outlined'
            onClick={handlePrevious}
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {currentQuestion < questions.length - 1 ? (
              <Button
                variant='contained'
                onClick={handleNext}
                endIcon={<ArrowRight size={18} />}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Câu tiếp theo
              </Button>
            ) : null}
            <Button
              variant='contained'
              color='success'
              onClick={handleSubmitClick}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Nộp bài
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Submission Confirmation Modal */}
      <Dialog
        open={showSubmitDialog}
        onClose={() => setShowSubmitDialog(false)}
        maxWidth='sm'
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
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
                {getAnsweredCount()} trong tổng số {questions.length}
              </span>{' '}
              câu hỏi.
            </Typography>
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0, gap: 2 }}>
          <Button onClick={() => setShowSubmitDialog(false)} variant='outlined' disabled={submitting} sx={{ flex: 1 }}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} variant='contained' color='primary' disabled={submitting} sx={{ flex: 1 }}>
            {submitting ? 'Đang nộp...' : 'Có, nộp bài'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default TakeQuiz
