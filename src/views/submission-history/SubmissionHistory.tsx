'use client'

// React Imports
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

// Component Imports
import ClassAssignmentsPagination from '@/components/pagination/ClassAssignmentsPagination'
import SubmissionHistoryHeader from './components/SubmissionHistoryHeader'
import StatisticsCard from './components/StatisticsCard'
import EmptyState from './components/EmptyState'
import SubmissionsTable from './components/SubmissionsTable'

// Service Imports
import { submissionService, type Submission, type PaginationInfo } from '@/services/submission.service'

interface SubmissionHistoryProps {
  classId?: string
  isTabView?: boolean
}

const SubmissionHistory = ({ classId, isTabView = false }: SubmissionHistoryProps) => {
  const router = useRouter()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Memoize filtered submissions
  const displaySubmissions = useMemo(() => {
    if (classId) {
      return submissions.filter(s => s.class_id === classId)
    }
    return submissions
  }, [submissions, classId])

  // Fetch submissions with useCallback
  const fetchSubmissions = useCallback(async (page: number, limit: number) => {
    setLoading(true)
    setError(null)

    try {
      const response = await submissionService.getMySubmissions(page, limit)

      if (response.success) {
        setSubmissions(response.data)
        setPagination(response.pagination)
      }
    } catch (err: any) {
      console.error('Error fetching submissions:', err)
      setError(err?.response?.data?.message || 'Đã xảy ra lỗi khi tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSubmissions(currentPage, itemsPerPage)
  }, [currentPage, itemsPerPage, fetchSubmissions])

  // Handlers with useCallback
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const handleLimitChange = useCallback((newLimit: number) => {
    setItemsPerPage(newLimit)
    setCurrentPage(1) // Reset to first page when changing limit
  }, [])

  const handleViewResult = useCallback((submissionId: string) => {
    router.push(`/quiz/${submissionId}/result`)
  }, [router])

  // Format functions with useCallback
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }, [])

  const formatTime = useCallback((seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }, [])

  // Get score color based on value
  const getScoreColor = useCallback((score: number) => {
    if (score >= 8) return '#10B981'
    if (score >= 5) return '#F59E0B'
    return '#EF4444'
  }, [])

  // Calculate total items for statistics
  const totalItems = useMemo(() => {
    return classId ? displaySubmissions.length : pagination?.total_items || 0
  }, [classId, displaySubmissions.length, pagination?.total_items])

  if (loading && currentPage === 1) {
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
      {!isTabView && <SubmissionHistoryHeader />}

      {/* Statistics Card */}
      {!isTabView && pagination && <StatisticsCard totalItems={totalItems} />}

      {/* Submissions Table */}
      <Card sx={isTabView ? { boxShadow: 'none', border: 'none' } : {}}>
        <CardContent>
          {displaySubmissions.length === 0 ? (
            <EmptyState classId={classId} />
          ) : (
            <>
              <SubmissionsTable
                submissions={displaySubmissions}
                showClassColumn={!classId}
                formatDate={formatDate}
                formatTime={formatTime}
                getScoreColor={getScoreColor}
                onViewResult={handleViewResult}
              />

              {/* Pagination - Only show when not filtering by classId */}
              {!classId && pagination && (
                <ClassAssignmentsPagination
                  pagination={{
                    page: currentPage,
                    limit: itemsPerPage,
                    totalItems: pagination.total_items,
                    total_pages: pagination.total_pages,
                    items_per_page: itemsPerPage,
                    total_items: pagination.total_items
                  }}
                  onChangePage={handlePageChange}
                  onChangeLimit={handleLimitChange}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default SubmissionHistory
