'use client'

// React Imports
import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'

// MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

// Service Imports
import { quizService } from '@/services/quiz.service'
import { classQuizzService } from '@/services/classQuizz.service'

// Hook Imports
import { useNavigationBlock } from '@/hooks/useNavigationBlock'

// Component Imports
import {
  QuizHeader,
  QuizProgress,
  QuestionCard,
  NavigationButtons,
  SubmitDialog,
  LoadingState,
  ErrorState
} from '@/components/quiz'
import { ConfirmNavigationDialog } from '@/components/common/ConfirmNavigationDialog'

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
  const startTimeRef = useRef<number | null>(null) // Use ref to persist start time across refreshes
  const totalTimeRef = useRef<number | null>(null) // Store total quiz time
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [checkingSubmission, setCheckingSubmission] = useState(true)
  const classIdRef = useRef<string | null>(null) // Store classId for redirect
  const answersStorageKeyRef = useRef<string>('') // Store localStorage key for answers

  // Check if error is authorization related (should not block navigation)
  const isAuthError = error && (error.includes('not authorized') || error.includes('not enrolled'))

  // Block navigation when taking quiz (including when there's a non-auth error)
  const { allowNavigation, showDialog, dialogMessage, handleConfirmNavigation, handleCancelNavigation } =
    useNavigationBlock({
      when: !submitting && !loading && (questions.length > 0 || (error !== null && !isAuthError)),
      message: 'Bạn có chắc chắn muốn rời khỏi trang? Bài làm của bạn đã được lưu và bạn có thể tiếp tục sau.'
    })

  // Initialize startTime from localStorage and restore answers from localStorage
  useEffect(() => {
    if (startTimeRef.current === null) {
      const savedStartTime = typeof window !== 'undefined' ? localStorage.getItem(`quiz_start_${quizId}`) : null
      if (savedStartTime) {
        startTimeRef.current = parseInt(savedStartTime, 10)
      } else {
        startTimeRef.current = Date.now()
        if (typeof window !== 'undefined') {
          localStorage.setItem(`quiz_start_${quizId}`, startTimeRef.current.toString())
        }
      }
    }

    // Set up localStorage key for answers
    answersStorageKeyRef.current = `quiz_answers_${quizId}`

    // Restore answers from localStorage if they exist
    if (typeof window !== 'undefined') {
      const savedAnswers = localStorage.getItem(answersStorageKeyRef.current)
      if (savedAnswers) {
        try {
          const parsedAnswers = JSON.parse(savedAnswers)
          setAnswers(parsedAnswers)
        } catch (err) {
          console.error('Error parsing saved answers:', err)
        }
      }
    }
  }, [quizId])

  // Auto-save answers to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && answersStorageKeyRef.current && Object.keys(answers).length > 0) {
      try {
        localStorage.setItem(answersStorageKeyRef.current, JSON.stringify(answers))
      } catch (err) {
        console.error('Error saving answers to localStorage:', err)
      }
    }
  }, [answers])

  useEffect(() => {
    const checkAndLoad = async () => {
      if (!classQuizzIdFromUrl) {
        setCheckingSubmission(false)
        await fetchQuizData()
        return
      }

      // Check sessionStorage first - fastest way to check if already submitted
      const submittedKey = `quiz_submitted_${classQuizzIdFromUrl}`
      const isSubmitted = typeof window !== 'undefined' ? sessionStorage.getItem(submittedKey) : null

      if (isSubmitted === 'true') {
        // If we have classId, redirect to classassignment
        if (classIdRef.current) {
          router.push(`/${lang}/my-classes/${classIdRef.current}`)
          return
        }
        // Otherwise, try to get classId from quiz data first
        // We'll check again after fetching quiz data
      }

      // Try to check submission status from API, but don't block if it fails
      try {
        const submissionsResponse = await classQuizzService.getStudentSubmissions(classQuizzIdFromUrl)

        if (submissionsResponse.success && submissionsResponse.data && Array.isArray(submissionsResponse.data)) {
          const submissions = submissionsResponse.data
          if (submissions.length > 0) {
            // Mark as submitted in sessionStorage
            if (typeof window !== 'undefined') {
              sessionStorage.setItem(submittedKey, 'true')
            }
            // Redirect to classassignment if we have classId, otherwise to result
            if (classIdRef.current) {
              router.push(`/${lang}/my-classes/${classIdRef.current}`)
              return
            }
            const latestSubmission = submissions[0]
            const submissionId = latestSubmission.id || latestSubmission.submission_id
            if (submissionId) {
              router.push(`/${lang}/quiz/${submissionId}/result`)
              return
            }
          }
        }
      } catch (err: any) {
        // Silently ignore errors (403, 404, etc.) - allow quiz to load
        // Backend will handle preventing duplicate submissions when submitting
        // This check is optional and should not block the user
      } finally {
        setCheckingSubmission(false)
      }

      // Load quiz data to get classId
      await fetchQuizData()

      // After loading quiz data, check again if submitted
      if (isSubmitted === 'true' && classIdRef.current) {
        router.push(`/${lang}/my-classes/${classIdRef.current}`)
        return
      }
    }

    checkAndLoad()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId, classQuizzIdFromUrl, lang])

  const fetchQuizData = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await quizService.getQuizForStudent(quizId)

      if (response.success && response.data) {
        const quizData = response.data

        // Store classId for redirect
        if (quizData.class_id) {
          classIdRef.current = quizData.class_id
        }

        // Check if already submitted after getting classId
        if (classQuizzIdFromUrl && typeof window !== 'undefined') {
          const submittedKey = `quiz_submitted_${classQuizzIdFromUrl}`
          const isSubmitted = sessionStorage.getItem(submittedKey)
          if (isSubmitted === 'true' && classIdRef.current) {
            setLoading(false)
            router.push(`/${lang}/my-classes/${classIdRef.current}`)
            return
          }
        }

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

        // Set timer based on total_time from API or default to 600 seconds
        const totalTime = quizData.total_time ?? 600 // Use total_time from API, default to 600 seconds
        totalTimeRef.current = totalTime
        setTimeLeft(totalTime)
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Đã xảy ra lỗi khi tải bài kiểm tra'

      // If unauthorized (403) or enrollment issue, redirect to my-classes after 2 seconds
      if (err?.response?.status === 403 || errorMessage.includes('not authorized') || errorMessage.includes('not enrolled')) {
        setError(errorMessage)
        setTimeout(() => {
          router.push(`/${lang}/my-classes`)
        }, 2000)
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  // Timer countdown
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const timer = setInterval(() => {
      if (startTimeRef.current && totalTimeRef.current) {
        const elapsedTime = Math.floor((Date.now() - startTimeRef.current) / 1000)
        const remainingTime = Math.max(0, totalTimeRef.current - elapsedTime)
        setTimeLeft(remainingTime)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Auto submit when time is up
  useEffect(() => {
    if (timeLeft <= 0 && !submitting) {
      handleSubmit()
    }
  }, [timeLeft, submitting])

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
          [questionId]: isSelected ? currentAnswers.filter(id => id !== answerId) : [...currentAnswers, answerId]
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
      const totalTime = startTimeRef.current ? Math.floor((Date.now() - startTimeRef.current) / 1000) : 0

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
        // Mark as submitted in sessionStorage
        if (typeof window !== 'undefined' && classQuizzIdFromUrl) {
          sessionStorage.setItem(`quiz_submitted_${classQuizzIdFromUrl}`, 'true')
          // Clear answers and startTime from localStorage after successful submission
          if (answersStorageKeyRef.current) {
            localStorage.removeItem(answersStorageKeyRef.current)
          }
          localStorage.removeItem(`quiz_start_${quizId}`)
        }

        // Allow navigation without blocking
        allowNavigation()

        // Always navigate to result page after successful submission
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

  if (loading || checkingSubmission) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState error={error} />
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
      <QuizHeader title={quiz.title} timeLeft={timeLeft} formatTime={formatTime} onSubmit={handleSubmitClick} />

      {/* Main Quiz Content */}
      <Box
        component='main'
        sx={{
          width: '100%',
          maxWidth: '896px',
          flex: 1,
          px: { xs: 2, sm: 3, lg: 4 },
          py: 4,
          pb: 4
        }}
      >
        <Box sx={{ width: '100%' }}>
          {/* Progress Bar */}
          <QuizProgress currentQuestion={currentQuestion} totalQuestions={questions.length} />

          {/* Question Card */}
          <QuestionCard
            question={currentQ}
            currentQuestionNumber={currentQuestion + 1}
            answers={answers}
            onAnswerChange={handleAnswerChange}
          />

          {/* Navigation Buttons */}
          <NavigationButtons
            currentQuestion={currentQuestion}
            totalQuestions={questions.length}
            onPrevious={handlePrevious}
            onNext={handleNext}
          />
        </Box>
      </Box>

      {/* Submission Confirmation Modal */}
      <SubmitDialog
        open={showSubmitDialog}
        onClose={() => setShowSubmitDialog(false)}
        onSubmit={handleSubmit}
        answeredCount={getAnsweredCount()}
        totalQuestions={questions.length}
        submitting={submitting}
      />

      {/* Navigation Block Confirmation Dialog */}
      <ConfirmNavigationDialog
        open={showDialog}
        message={dialogMessage}
        onConfirm={handleConfirmNavigation}
        onCancel={handleCancelNavigation}
      />
    </Box>
  )
}

export default TakeQuiz
