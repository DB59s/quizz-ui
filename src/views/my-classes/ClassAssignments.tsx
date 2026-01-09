'use client'

// React Imports
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
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
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

// Component Imports
import ClassAssignmentsPagination from '@/components/pagination/ClassAssignmentsPagination'

// CSS Imports
import 'rc-pagination/assets/index.css'

// Service Imports
import { classService } from '@/services/class.service'
import { classQuizzService, type ClassQuizz } from '@/services/classQuizz.service'

// Utils
import { assignmentsCache } from './utils/assignmentsCache.utils'

// Types
type AssignmentStatus = 'open' | 'completed' | 'upcoming'

type Assignment = {
  id: string
  quizId: string
  submissionId: string | null
  submissionStatus: string | null
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

const ClassAssignments = ({
  classId,
  isTabView = false,
  isActive = true
}: {
  classId: string
  isTabView?: boolean
  isActive?: boolean
}) => {
  const router = useRouter()
  const params = useParams()
  const lang = (params.lang as string) || 'en'
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [validClassId, setValidClassId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const fetchKeyRef = useRef<string>('')
  const classInfoFetchedRef = useRef<string>('')
  const lastClassIdRef = useRef<string>('')

  // Fetch class info
  const fetchClassInfo = useCallback(async () => {
    if (!classId || classInfoFetchedRef.current === classId) return

    try {
      const cachedInfo = assignmentsCache.getClassInfo(classId)
      if (cachedInfo) {
        setClassInfo(cachedInfo)
        classInfoFetchedRef.current = classId
        return
      }

      const applicationsRes = await classService.getStudentApplications()
      if (applicationsRes.success && applicationsRes.data?.classes) {
        const foundClass = applicationsRes.data.classes.find((app: any) => app.class._id === classId)
        if (foundClass) {
          const classRes = await classService.getClassByCode(foundClass.class.class_code)
          const info: ClassInfo = {
            id: foundClass.class._id,
            name: foundClass.class.name,
            code: foundClass.class.class_code,
            teacher: classRes.data?.teacher?.full_name || 'Chưa có thông tin'
          }
          setClassInfo(info)
          assignmentsCache.setClassInfo(classId, info)
          classInfoFetchedRef.current = classId
        }
      }
    } catch (err) {
      console.error('Error fetching class info:', err)
    }
  }, [classId])

  // Map API response to Assignment
  const mapQuizzToAssignment = useCallback((cq: ClassQuizz, submissionsMap: Record<string, any>): Assignment => {
    let status: AssignmentStatus = 'upcoming'
    if (cq.status === 'active') status = 'open'
    else if (cq.status === 'ended') status = 'completed'

    const submission = submissionsMap[cq.id]

    return {
      id: cq.id,
      quizId: cq.quiz_id,
      submissionId: submission?.submission_id || null,
      submissionStatus: submission?.status || null,
      title: cq.quiz.name,
      type: 'exam',
      startDate: cq.start_time,
      dueDate: cq.end_time,
      status,
      submitted: !!submission,
      score: submission?.score || null,
      maxScore: 100,
      description: cq.quiz.description
    }
  }, [])

  // Fetch assignments from API
  const fetchAssignments = useCallback(
    async (page: number = 1, skipCache: boolean = false) => {
      if (!classId) return

      setLoading(true)
      setError(null)

      try {
        const [quizzesResponse, submissionsResponse] = await Promise.all([
          classQuizzService.getClassQuizzes(classId, page, itemsPerPage, skipCache),
          classQuizzService.getStudentSubmissionsByClass(classId).catch(() => ({ success: false, data: [] }))
        ])

        if (quizzesResponse.success && quizzesResponse.data) {
          const paginationData = quizzesResponse.pagination
            ? {
                totalPages: quizzesResponse.pagination.total_pages,
                itemsPerPage: quizzesResponse.pagination.items_per_page,
                totalItems: quizzesResponse.pagination.total_items
              }
            : { totalPages: 0, itemsPerPage: 10, totalItems: 0 }

          const submissionsMap: Record<string, any> = {}
          if (submissionsResponse.success && submissionsResponse.data) {
            submissionsResponse.data.forEach((s: any) => {
              if (s.class_quiz_id) submissionsMap[s.class_quiz_id] = s
            })
          }

          const mappedAssignments = quizzesResponse.data.map((cq: ClassQuizz) =>
            mapQuizzToAssignment(cq, submissionsMap)
          )

          setAssignments(mappedAssignments)
          setTotalPages(paginationData.totalPages)
          setItemsPerPage(paginationData.itemsPerPage)
          setTotalItems(paginationData.totalItems)

          // Only cache if not skipping cache
          if (!skipCache) {
            assignmentsCache.set(classId, page, {
              assignments: mappedAssignments,
              classInfo,
              pagination: { currentPage: page, ...paginationData }
            })
          }
        }

        if (!classInfo) await fetchClassInfo()
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Đã xảy ra lỗi khi tải dữ liệu')
      } finally {
        setLoading(false)
      }
    },
    [classId, itemsPerPage, classInfo, fetchClassInfo, mapQuizzToAssignment]
  )

  // Track if this is initial mount to avoid double fetch
  const isInitialMountRef = useRef(true)

  // Main effect - fetch data when classId or page changes
  useEffect(() => {
    if (!classId?.trim()) {
      setError('Không tìm thấy ID lớp học.')
      setLoading(false)
      return
    }

    const key = `${classId}_${currentPage}`

    // Reset flags if classId changed (new class loaded)
    if (lastClassIdRef.current !== classId) {
      lastClassIdRef.current = classId
      fetchKeyRef.current = '' // Allow fresh fetch for new class
    }

    // Skip if already fetched this exact page (prevents duplicate fetches within same render)
    if (fetchKeyRef.current === key) return

    setValidClassId(classId)
    fetchKeyRef.current = key

    // Load classInfo from cache if available (for immediate display)
    const cachedClassInfo = assignmentsCache.getClassInfo(classId)
    if (cachedClassInfo) setClassInfo(cachedClassInfo)

    // Always fetch fresh data
    fetchAssignments(currentPage)
    isInitialMountRef.current = false
  }, [classId, currentPage, fetchAssignments])

  // Fetch classInfo separately (only once per classId)
  useEffect(() => {
    if (classId && !classInfo) fetchClassInfo()
  }, [classId, classInfo, fetchClassInfo])

  // Refetch when tab becomes active (for fresh data)
  useEffect(() => {
    // Skip on initial mount (main effect already handles it)
    if (isInitialMountRef.current) return

    if (isActive && classId) {
      // Clear the fetch key to allow refetch
      fetchKeyRef.current = ''
      // Clear cache to get fresh data
      assignmentsCache.clearAll(classId)
      // Fetch fresh data and skip caching
      fetchAssignments(currentPage, true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive])

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }, [])

  const getStatusChip = useCallback((status: AssignmentStatus) => {
    switch (status) {
      case 'open':
        return (
          <Chip
            label='Đang mở'
            size='small'
            color='info'
            sx={{ bgcolor: '#E0F2FE', color: '#0369A1', width: '100%' }}
          />
        )
      case 'completed':
        return <Chip label='Đã kết thúc' size='small' sx={{ bgcolor: '#FEE2E2', color: '#DC2626', width: '100%' }} />
      case 'upcoming':
        return <Chip label='Chưa mở' size='small' sx={{ bgcolor: '#E5E7EB', color: '#6B7280', width: '100%' }} />
      default:
        return null
    }
  }, [])

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
            fontWeight: 500,
            minWidth: 100,
            width: '100%'
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
            minWidth: 100,
            width: '100%',
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

  const handleJoinAssignment = useCallback(
    (assignment: Assignment) => {
      if (!validClassId) {
        setError('Không tìm thấy ID lớp học. Vui lòng quay lại và thử lại.')
        return
      }

      // Invalidate cache when starting quiz (submissions might change)
      assignmentsCache.clear(classId, currentPage)

      const urlParams = new URLSearchParams()
      urlParams.set('quizzClassId', assignment.id)
      router.push(`/${lang}/quiz/${assignment.quizId}?${urlParams.toString()}`)
    },
    [validClassId, classId, currentPage, lang, router]
  )

  const handleViewResult = useCallback(
    (assignment: Assignment) => {
      if (assignment.submissionId) {
        router.push(`/${lang}/quiz/${assignment.submissionId}/result`)
      } else {
        setError('Không tìm thấy bài nộp của bạn')
      }
    },
    [lang, router]
  )

  const handleBack = useCallback(() => {
    router.back()
  }, [router])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    fetchKeyRef.current = '' // Reset to allow fetch for new page
  }, [])

  const handleLimitChange = useCallback(
    (newLimit: number) => {
      setItemsPerPage(newLimit)
      setCurrentPage(1) // Reset to first page when changing limit
      fetchKeyRef.current = '' // Reset to allow fetch
      assignmentsCache.clearAll(classId) // Clear cache when limit changes
    },
    [classId]
  )

  const renderEmptyState = useCallback(() => {
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
  }, [])

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
          <>
            <TableContainer>
              <Table sx={{ minWidth: 800 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'var(--mui-palette-primary-dark)' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 600, py: 2 }}>Tên bài</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600, py: 2 }}>Thời gian mở</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600, py: 2 }}>Hạn nộp</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600, py: 2, textAlign: 'center' }}>
                      Trạng thái
                    </TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600, py: 2, textAlign: 'center' }}>Thao tác</TableCell>
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

            {/* Pagination */}
            <ClassAssignmentsPagination
              pagination={{
                page: currentPage,
                limit: itemsPerPage,
                totalItems: totalItems,
                total_pages: totalPages,
                items_per_page: itemsPerPage,
                total_items: totalItems
              }}
              onChangePage={handlePageChange}
              onChangeLimit={handleLimitChange}
            />
          </>
        )}
      </Card>
    </Box>
  )
}

export default ClassAssignments
