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
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormControl from '@mui/material/FormControl'
import LinearProgress from '@mui/material/LinearProgress'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'

// Service Imports
import { quizService, type QuizDetail, type QuizQuestion as ApiQuizQuestion } from '@/services/quiz.service'

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

const TakeQuiz = ({ quizId }: { quizId: string }) => {
  const router = useRouter()
  const [quiz, setQuiz] = useState<QuizInfo | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [timeLeft, setTimeLeft] = useState(3600) // 60 minutes in seconds
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
          options: q.answers.map((ans) => ({
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
      console.error('Error fetching quiz:', err)
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
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswerChange = (questionId: string, answerId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerId
    }))
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
    }
  }

  const handleQuestionNavigate = (index: number) => {
    setCurrentQuestion(index)
  }

  const handleSubmitClick = () => {
    setShowSubmitDialog(true)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setShowSubmitDialog(false)

    // TODO: Implement API submit when backend is ready
    // For now, save answers to localStorage and navigate to result page
    console.log('Submitted answers:', answers)
    localStorage.setItem(`quiz_${quizId}_answers`, JSON.stringify(answers))
    
    // Simulate a short delay
    setTimeout(() => {
      router.push(`/quiz/${quizId}/result`)
    }, 500)

    /* 
    // Uncomment when submit API is ready
    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, optionId]) => ({
        question_id: questionId,
        selected_option_id: optionId
      }))

      const response = await quizService.submitQuiz(quizId, {
        answers: formattedAnswers
      })

      if (response.success && response.data?.attempt_id) {
        router.push(`/quiz/${quizId}/result?attemptId=${response.data.attempt_id}`)
      }
    } catch (err: any) {
      console.error('Error submitting quiz:', err)
      setError(err?.response?.data?.message || 'Đã xảy ra lỗi khi nộp bài')
      setSubmitting(false)
    }
    */
  }

  const getAnsweredCount = () => {
    return Object.keys(answers).length
  }

  const isQuestionAnswered = (questionId: string) => {
    return questionId in answers
  }

  if (loading) {
    return (
      <Box className="flex justify-center items-center p-8">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box className="p-4">
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button variant="outlined" onClick={() => router.back()}>
          Quay lại
        </Button>
      </Box>
    )
  }

  if (!quiz || questions.length === 0) {
    return <Typography>Không có dữ liệu bài kiểm tra</Typography>
  }

  const currentQ = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <Box>
      {/* Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box className="flex justify-between items-start mb-4">
            <div>
              <Typography variant="h5" className="font-semibold mb-2">
                {quiz.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {quiz.description}
              </Typography>
            </div>
            <Chip
              label={formatTime(timeLeft)}
              color={timeLeft < 300 ? 'error' : 'primary'}
              sx={{ fontSize: '1rem', fontWeight: 600, px: 2, py: 3 }}
            />
          </Box>

          <Box className="flex gap-4 items-center">
            <Typography variant="body2">
              Câu hỏi: {currentQuestion + 1}/{questions.length}
            </Typography>
            <Typography variant="body2">
              Đã trả lời: {getAnsweredCount()}/{questions.length}
            </Typography>
            <Typography variant="body2">
              Tổng điểm: {quiz.totalPoints}
            </Typography>
          </Box>

          <LinearProgress variant="determinate" value={progress} sx={{ mt: 2, height: 8, borderRadius: 4 }} />
        </CardContent>
      </Card>

      {/* Question Navigation */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" className="mb-3 font-semibold">
            Danh sách câu hỏi
          </Typography>
          <Box className="flex flex-wrap gap-2">
            {questions.map((q, index) => (
              <Button
                key={q.id}
                variant={currentQuestion === index ? 'contained' : 'outlined'}
                size="small"
                onClick={() => handleQuestionNavigate(index)}
                sx={{
                  minWidth: 45,
                  height: 45,
                  borderRadius: 1,
                  bgcolor: isQuestionAnswered(q.id)
                    ? currentQuestion === index
                      ? 'primary.main'
                      : 'success.light'
                    : currentQuestion === index
                    ? 'primary.main'
                    : 'transparent',
                  color: isQuestionAnswered(q.id)
                    ? currentQuestion === index
                      ? 'white'
                      : 'success.dark'
                    : currentQuestion === index
                    ? 'white'
                    : 'text.primary',
                  borderColor: isQuestionAnswered(q.id) ? 'success.main' : 'divider',
                  '&:hover': {
                    bgcolor: currentQuestion === index ? 'primary.dark' : 'action.hover'
                  }
                }}
              >
                {index + 1}
              </Button>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card>
        <CardContent>
          <Box className="mb-4">
            <Typography variant="h6" className="font-semibold mb-2">
              Câu {currentQuestion + 1}: ({currentQ.points} điểm)
            </Typography>
            <Typography variant="body1" className="mb-4">
              {currentQ.question}
            </Typography>
          </Box>

          <FormControl component="fieldset" fullWidth>
            <RadioGroup
              value={answers[currentQ.id] || ''}
              onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
            >
              {currentQ.options.map((option, index) => (
                <FormControlLabel
                  key={option.id}
                  value={option.id}
                  control={<Radio />}
                  label={
                    <Typography variant="body1">
                      {String.fromCharCode(65 + index)}. {option.text}
                    </Typography>
                  }
                  sx={{
                    mb: 2,
                    p: 2,
                    border: '1px solid',
                    borderColor: answers[currentQ.id] === option.id ? 'primary.main' : 'divider',
                    borderRadius: 1,
                    bgcolor: answers[currentQ.id] === option.id ? 'primary.lighter' : 'transparent',
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                />
              ))}
            </RadioGroup>
          </FormControl>

          {/* Navigation Buttons */}
          <Box className="flex justify-between mt-6">
            <Button
              variant="outlined"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              startIcon={<i className="tabler-arrow-left" />}
            >
              Câu trước
            </Button>

            <Box className="flex gap-2">
              {currentQuestion === questions.length - 1 ? (
                <Button variant="contained" color="success" onClick={handleSubmitClick}>
                  Nộp bài
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<i className="tabler-arrow-right" />}
                >
                  Câu tiếp theo
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Submit Confirmation Dialog */}
      <Dialog open={showSubmitDialog} onClose={() => setShowSubmitDialog(false)}>
        <DialogTitle>Xác nhận nộp bài</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Bạn đã trả lời {getAnsweredCount()}/{questions.length} câu hỏi
          </Alert>
          <Typography>
            Bạn có chắc chắn muốn nộp bài? Sau khi nộp bài, bạn sẽ không thể thay đổi câu trả lời.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSubmitDialog(false)} disabled={submitting}>Hủy</Button>
          <Button 
            variant="contained" 
            color="success" 
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Đang nộp...' : 'Nộp bài'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default TakeQuiz
