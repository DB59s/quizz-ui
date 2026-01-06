'use client'

// React Imports
import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

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

// Hook Imports
import { useSubmissions } from '@/hooks/queries/useSubmissions'

interface SubmissionHistoryProps {
  classId?: string
  isTabView?: boolean
}

const SubmissionHistory = ({ classId, isTabView = false }: SubmissionHistoryProps) => {
  const router = useRouter()
  const params = useParams()
  const lang = (params?.lang as string) || 'en'

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Use React Query hook for data fetching
  const { submissions, pagination, isLoading, error } = useSubmissions({
    page: currentPage,
    limit: itemsPerPage,
    classId
  })

  // Handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleLimitChange = (newLimit: number) => {
    setItemsPerPage(newLimit)
    setCurrentPage(1) // Reset to first page when changing limit
  }

  // FIXED: Add language prefix to routing to preserve sidebar
  const handleViewResult = (submissionId: string) => {
    router.push(`/${lang}/quiz/${submissionId}/result`)
  }

  // Format functions
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  // Get score color based on value
  const getScoreColor = (score: number) => {
    if (score >= 8) return '#10B981'
    if (score >= 5) return '#F59E0B'
    return '#EF4444'
  }

  // Calculate total items for statistics
  const totalItems = classId ? submissions.length : pagination?.total_items || 0

  if (isLoading && currentPage === 1) {
    return (
      <Box className='flex justify-center items-center p-8'>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box className='p-4'>
        <Alert severity='error'>{error.message || 'Đã xảy ra lỗi khi tải dữ liệu'}</Alert>
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
          {submissions.length === 0 ? (
            <EmptyState classId={classId} />
          ) : (
            <>
              <SubmissionsTable
                submissions={submissions}
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
