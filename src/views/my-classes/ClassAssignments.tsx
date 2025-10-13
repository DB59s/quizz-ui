'use client'

// React Imports
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

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

// Mock Data
import assignmentsData from '@/data/mock/assignments.json'

import { classService } from '@/services/class.service'

// Types
type AssignmentStatus = 'open' | 'completed' | 'upcoming'

type Assignment = {
  id: string
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

const ClassAssignments = ({ classId }: { classId: string }) => {
  const router = useRouter()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null)

  useEffect(() => {
    // Load mock data
    setAssignments(assignmentsData.assignments as Assignment[])
    
    // Fetch class info from student applications
    classService.getStudentApplications().then((res: any) => {
      if (res.success && res.data?.classes) {
        const foundClass = res.data.classes.find((app: any) => app.class._id === classId)
        if (foundClass) {
          // Fetch teacher info
          classService.getClassByCode(foundClass.class.class_code).then((classRes: any) => {
            setClassInfo({
              id: foundClass.class._id,
              name: foundClass.class.name,
              code: foundClass.class.class_code,
              teacher: classRes.data?.teacher?.full_name || 'Chưa có thông tin'
            })
          })
        }
      }
    }).catch((error) => {
      console.error('Error fetching class info:', error)
    })
  }, [classId])

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
        return <Chip label="Đang mở" size="small" color="info" sx={{ bgcolor: '#E0F2FE', color: '#0369A1' }} />
      case 'completed':
        return <Chip label="Đã hoàn thành" size="small" color="success" sx={{ bgcolor: '#D1FAE5', color: '#059669' }} />
      case 'upcoming':
        return <Chip label="Chưa mở" size="small" sx={{ bgcolor: '#E5E7EB', color: '#6B7280' }} />
      default:
        return null
    }
  }

  const getActionButton = (assignment: Assignment) => {
    if (assignment.status === 'open' && !assignment.submitted) {
      return (
        <Button
          variant="contained"
          size="small"
          sx={{
            bgcolor: '#06B6D4',
            '&:hover': { bgcolor: '#0891B2' },
            textTransform: 'none',
            fontWeight: 500
          }}
          onClick={() => handleJoinAssignment(assignment.id)}
        >
          Tham gia
        </Button>
      )
    }

    if (assignment.status === 'completed') {
      return (
        <Button
          variant="outlined"
          size="small"
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
          onClick={() => handleViewResult(assignment.id)}
        >
          Xem kết quả
        </Button>
      )
    }

    if (assignment.status === 'upcoming') {
      return (
        <Button
          variant="outlined"
          size="small"
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

  const handleJoinAssignment = (assignmentId: string) => {
    // Navigate to quiz page
    router.push(`/quiz/${assignmentId}`)
  }

  const handleViewResult = (assignmentId: string) => {
    // Navigate to result page
    router.push(`/quiz/${assignmentId}/result`)
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <Box>
      {/* Header */}
      <Box className="flex items-center gap-4 mb-6">
        <IconButton
          onClick={handleBack}
          sx={{
            bgcolor: 'var(--mui-palette-primary-dark)',
            borderRadius: 1,
            color: 'white',
            '&:hover': { bgcolor: 'var(--mui-palette-primary-dark)' },
          }}
        >
          <i className="tabler-arrow-left" />
        </IconButton>
        <Typography variant="h5" className="font-semibold" sx={{ color: '#1E40AF' }}>
          Bài tập & Kiểm tra - {classInfo?.name || 'Đang tải...'}
        </Typography>
      </Box>

      {/* Table */}
      <Card>
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
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {assignment.title}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 2.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(assignment.startDate)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 2.5 }}>
                    <Typography variant="body2" color="text.secondary">
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
      </Card>
    </Box>
  )
}

export default ClassAssignments
