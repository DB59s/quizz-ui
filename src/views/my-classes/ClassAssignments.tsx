'use client'

// React Imports
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'

// Lucide Icons
import { Inbox } from 'lucide-react'

// MUI Imports
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import IconButton from '@mui/material/IconButton'

// Service Imports
import { classService } from '@/services/class.service'
import { classQuizzService, type ClassQuizz } from '@/services/classQuizz.service'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

// Types
type AssignmentStatus = 'open' | 'completed' | 'upcoming'

type Assignment = {
  id: string
  quizId: string // Add quiz_id for navigation
  submissionId: string | null // Add submission_id for viewing results
  submissionStatus: string | null // Add submission status (graded, pending, etc.)
  title: string
  type: 'exam' | 'assignment'
  startDate: string
  dueDate: string
  status: AssignmentStatus
  submitted: boolean
  score: number | null
  maxScore: number
  description: string
}

type ClassInfo = {
  id: string
  name: string
  code: string
  teacher: string
}

const ClassAssignments = ({ classId, isTabView = false }: { classId: string; isTabView?: boolean }) => {
  const router = useRouter()
  const params = useParams()
  const lang = (params.lang as string) || 'en'
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [validClassId, setValidClassId] = useState<string | null>(null)

  useEffect(() => {
    // Validate classId before fetching
    if (!classId || classId.trim() === '') {
      setError('Không tìm thấy ID lớp học. Vui lòng quay lại và thử lại.')
      setLoading(false)
      return
    }
    setValidClassId(classId)
    fetchAssignments()
  }, [classId])

  const fetchAssignments = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch class quizzes
      const quizzesResponse = await classQuizzService.getClassQuizzes(classId)

      if (quizzesResponse.success && quizzesResponse.data) {
        // Fetch all submissions for this class at once
        const submissionsMap: Record<string, any> = {}

        try {
          const submissionsResponse = await classQuizzService.getStudentSubmissionsByClass(classId)
          if (submissionsResponse.success && submissionsResponse.data) {
            // Map submissions by class_quiz_id
            submissionsResponse.data.forEach((submission: any) => {
              if (submission.class_quiz_id) {
                submissionsMap[submission.class_quiz_id] = submission
              }
            })
          }
        } catch (err) {
          console.log('No submissions found for this class')
        }

        // Map API response to Assignment type
        const mappedAssignments: Assignment[] = quizzesResponse.data.map((cq: ClassQuizz) => {
          const now = new Date()
          const startDate = new Date(cq.start_time)
          const endDate = new Date(cq.end_time)

          // Map API status to component status
          let status: AssignmentStatus = 'upcoming'
          if (cq.status === 'active') {
            status = 'open'
          } else if (cq.status === 'ended') {
            status = 'completed'
          } else if (cq.status === 'upcoming') {
            status = 'upcoming'
          }

          const submission = submissionsMap[cq.id]

          return {
            id: cq.id,
            quizId: cq.quiz_id, // Store quiz_id for navigation
            submissionId: submission?.submission_id || null, // Store submission_id for viewing results
            submissionStatus: submission?.status || null, // Store submission status
            title: cq.quiz.name,
            type: 'exam',
            startDate: cq.start_time,
            dueDate: cq.end_time,
            status,
            submitted: !!submission, // Check if submission exists
            score: submission?.score || null, // Get score from submission
            maxScore: 100, // Default value, can be updated later
            description: cq.quiz.description
          }
        })

        setAssignments(mappedAssignments)
      }

      // Fetch class info
      const applicationsRes = await classService.getStudentApplications()
      if (applicationsRes.success && applicationsRes.data?.classes) {
        const foundClass = applicationsRes.data.classes.find((app: any) => app.class._id === classId)
        if (foundClass) {
          const classRes = await classService.getClassByCode(foundClass.class.class_code)
          setClassInfo({
            id: foundClass.class._id,
            name: foundClass.class.name,
            code: foundClass.class.class_code,
            teacher: classRes.data?.teacher?.full_name || 'Chưa có thông tin'
          })
        }
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Đã xảy ra lỗi khi tải dữ liệu')
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

  const getStatusChip = (status: AssignmentStatus) => {
    switch (status) {
      case 'open':
        return <Chip label='Đang mở' size='small' color='info' sx={{ bgcolor: '#E0F2FE', color: '#0369A1' }} />
      case 'completed':
        return <Chip label='Đã hoàn thành' size='small' color='success' sx={{ bgcolor: '#D1FAE5', color: '#059669' }} />
      case 'upcoming':
        return <Chip label='Chưa mở' size='small' sx={{ bgcolor: '#E5E7EB', color: '#6B7280' }} />
      default:
        return null
    }
  }

  const getActionButton = (assignment: Assignment) => {
    if (assignment.status === 'open' && !assignment.submitted) {
      return (
        <Button
          variant='contained'
          size='small'
          sx={{
            bgcolor: '#06B6D4',
            '&:hover': { bgcolor: '#0891B2' },
            textTransform: 'none',
            fontWeight: 500
          }}
          onClick={() => handleJoinAssignment(assignment)}
        >
          Tham gia
        </Button>
      )
    }

    // Show "Xem kết quả" button only if submission status is "graded"
    if (assignment.submitted && assignment.submissionId && assignment.submissionStatus === 'graded') {
      return (
        <Button
          variant='outlined'
          size='small'
          sx={{
            borderColor: '#9CA3AF',
            color: '#6B7280',
            textTransform: 'none',
            fontWeight: 500,
            '&:hover': {
              borderColor: '#6B7280',
              bgcolor: '#F9FAFB'
            }
          }}
          onClick={() => handleViewResult(assignment)}
        >
          Xem kết quả
        </Button>
      )
    }

    // Show "Đã nộp" button if submitted but not yet graded
    if (assignment.submitted && assignment.submissionStatus !== 'graded') {
      return (
        <Chip
          label='Đã nộp'
          size='small'
          sx={{
            bgcolor: '#FEF3C7',
            color: '#92400E',
            fontWeight: 500
          }}
        />
      )
    }

    if (assignment.status === 'upcoming') {
      return (
        <Button
          variant='outlined'
          size='small'
          disabled
          sx={{
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Chưa mở
        </Button>
      )
    }

    return null
  }

  const handleJoinAssignment = (assignment: Assignment) => {
    // Navigate to quiz page with classQuizzId in query params
    if (!validClassId) {
      setError('Không tìm thấy ID lớp học. Vui lòng quay lại và thử lại.')
      return
    }
    // Use URLSearchParams to properly encode query params
    const urlParams = new URLSearchParams()
    urlParams.set('quizzClassId', assignment.id)
    const url = `/${lang}/quiz/${assignment.quizId}?${urlParams.toString()}`

    router.push(url)
  }

  const handleViewResult = (assignment: Assignment) => {
    // Navigate to result page using submission_id
    if (assignment.submissionId) {
      router.push(`/${lang}/quiz/${assignment.submissionId}/result`)
    } else {
      setError('Không tìm thấy bài nộp của bạn')
    }
  }

  const handleBack = () => {
    router.back()
  }

  const renderEmptyState = () => {
    return (
      <Box className='flex flex-col items-center justify-center py-12 px-4'>
        <Inbox size={48} style={{ color: '#9CA3AF', marginBottom: 12 }} />
        <Typography variant='h6' sx={{ fontWeight: 600, color: '#1F2937', mb: 1 }}>
          Chưa có bài tập nào
        </Typography>
        <Typography variant='body2' sx={{ color: '#6B7280', textAlign: 'center', maxWidth: 400 }}>
          Giáo viên chưa giao bài tập hoặc kiểm tra cho lớp này. Vui lòng quay lại sau.
        </Typography>
      </Box>
    )
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
        <Alert severity='error'>{error}</Alert>
      </Box>
    )
  }

  return (
    <Box>
      {/* Header - Only show if not in tab view */}
      {!isTabView && (
        <Box className='flex items-center gap-4 mb-6'>
          <IconButton
            onClick={handleBack}
            sx={{
              bgcolor: 'var(--mui-palette-primary-dark)',
              borderRadius: 1,
              color: 'white',
              '&:hover': { bgcolor: 'var(--mui-palette-primary-dark)' }
            }}
          >
            <i className='tabler-arrow-left' />
          </IconButton>
          <Typography variant='h5' className='font-semibold' sx={{ color: '#1E40AF' }}>
            Bài tập & Kiểm tra - {classInfo?.name || 'Đang tải...'}
          </Typography>
        </Box>
      )}

      {/* Table */}
      <Card sx={isTabView ? { boxShadow: 'none', border: 'none' } : {}}>
        {assignments.length === 0 ? (
          renderEmptyState()
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: 'var(--mui-palette-primary-dark)' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 600, py: 2 }}>Tên bài</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600, py: 2 }}>Thời gian mở</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600, py: 2 }}>Hạn nộp</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600, py: 2 }}>Trạng thái</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600, py: 2 }}>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assignments.map((assignment, index) => (
                  <TableRow
                    key={assignment.id}
                    sx={{
                      bgcolor: index % 2 === 0 ? 'white' : '#F9FAFB',
                      '&:hover': { bgcolor: '#F3F4F6' }
                    }}
                  >
                    <TableCell sx={{ py: 2.5 }}>
                      <Typography variant='body2' sx={{ fontWeight: 500 }}>
                        {assignment.title}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2.5 }}>
                      <Typography variant='body2' color='text.secondary'>
                        {formatDate(assignment.startDate)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2.5 }}>
                      <Typography variant='body2' color='text.secondary'>
                        {formatDate(assignment.dueDate)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2.5 }}>{getStatusChip(assignment.status)}</TableCell>
                    <TableCell sx={{ py: 2.5 }}>{getActionButton(assignment)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </Box>
  )
}

export default ClassAssignments
