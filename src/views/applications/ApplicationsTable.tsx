'use client'

// React Imports
import { useState, useEffect } from 'react'

// Lucide Icons
import { FileX } from 'lucide-react'

// MUI Imports
import Card from '@mui/material/Card'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'

// Toast Imports
import { toast } from 'react-toastify'

// Service Imports
import { classService } from '@/services/class.service'

// Type Imports
type ApplicationStatus = 'pending' | 'approved' | 'rejected'

type Application = {
  registration_id: string
  status: ApplicationStatus
  status_code: number
  created_at: string
  class: {
    _id: string
    teacher_id: string
    name: string
    description: string
    max_students: number
    current_students: number
    class_code: string
    status: string
    created_at: string
    updated_at: string
  }
  teacherName?: string // Will be fetched separately
}

const statusConfig = {
  pending: { label: 'Đang chờ duyệt', color: 'warning' as const },
  approved: { label: 'Đã duyệt', color: 'success' as const },
  rejected: { label: 'Đã từ chối', color: 'error' as const }
}

const ApplicationsTable = () => {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedRegistrationId, setSelectedRegistrationId] = useState<string | null>(null)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await classService.getStudentApplications()

      if (response.success && response.data?.classes) {
        const applicationsData = response.data.classes

        // Fetch teacher names for each class
        const applicationsWithTeachers = await Promise.all(
          applicationsData.map(async (app: Application) => {
            try {
              const classInfo = await classService.getClassByCode(app.class.class_code)
              return {
                ...app,
                teacherName: classInfo.data?.teacher?.full_name || 'Chưa có thông tin'
              }
            } catch (error) {
              return {
                ...app,
                teacherName: 'Chưa có thông tin'
              }
            }
          })
        )

        setApplications(applicationsWithTeachers)
      } else {
        setError(response.message || 'Không thể tải danh sách đơn đăng ký')
      }
    } catch (err: any) {
      console.error('Error fetching applications:', err)
      setError(err?.response?.data?.message || 'Đã xảy ra lỗi khi tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCancelDialog = (registrationId: string) => {
    setSelectedRegistrationId(registrationId)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedRegistrationId(null)
  }

  const handleConfirmCancel = async () => {
    if (!selectedRegistrationId) return

    try {
      await classService.cancelRegistration(selectedRegistrationId)

      // Refresh the list after cancellation
      await fetchApplications()

      // Close dialog
      handleCloseDialog()

      // Show success toast
      toast.success('Đã hủy đơn đăng ký thành công!', {
        position: 'bottom-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true
      })
    } catch (err: any) {
      console.error('Error canceling registration:', err)
      toast.error(err?.response?.data?.message || 'Không thể hủy đơn đăng ký', {
        position: 'bottom-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true
      })
    }
  }

  const paginatedApplications = applications.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  if (loading) {
    return (
      <Card>
        <Box className='flex justify-center items-center p-8'>
          <CircularProgress />
        </Box>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <Box className='p-4'>
          <Alert severity='error'>{error}</Alert>
        </Box>
      </Card>
    )
  }

  return (
    <Card>
      {applications.length === 0 ? (
        <Box className='flex flex-col items-center justify-center py-12 px-4'>
          <FileX size={48} style={{ color: '#9CA3AF', marginBottom: 12 }} />
          <Typography variant='h6' sx={{ fontWeight: 600, color: '#1F2937', mb: 1 }}>
            Chưa có đơn đăng ký nào
          </Typography>
          <Typography variant='body2' sx={{ color: '#6B7280', textAlign: 'center', maxWidth: 400 }}>
            Bạn chưa gửi đơn đăng ký lớp học nào. Hãy tìm và đăng ký một lớp học để bắt đầu.
          </Typography>
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'var(--mui-palette-primary-dark)' }}>
                <TableCell sx={{ color: 'var(--mui-palette-common-white)', fontWeight: 600 }}>Tên lớp học</TableCell>
                <TableCell sx={{ color: 'var(--mui-palette-common-white)', fontWeight: 600 }}>Mã lớp học</TableCell>
                <TableCell sx={{ color: 'var(--mui-palette-common-white)', fontWeight: 600 }}>Giáo viên</TableCell>
                <TableCell sx={{ color: 'var(--mui-palette-common-white)', fontWeight: 600 }}>Ngày đăng kí</TableCell>
                <TableCell sx={{ color: 'var(--mui-palette-common-white)', fontWeight: 600 }}>Trạng thái</TableCell>
                <TableCell sx={{ color: 'var(--mui-palette-common-white)', fontWeight: 600 }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedApplications.map((application: Application, index: number) => (
                <TableRow key={application.registration_id || `app-${index}`}>
                  <TableCell>{application.class?.name || 'N/A'}</TableCell>
                  <TableCell>{application.class?.class_code || 'N/A'}</TableCell>
                  <TableCell>{application.teacherName || 'Đang tải...'}</TableCell>
                  <TableCell>{new Date(application.created_at).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell>
                    <Chip
                      label={statusConfig[application.status]?.label || application.status}
                      color={statusConfig[application.status]?.color || 'default'}
                      size='small'
                      variant='tonal'
                      sx={{ minWidth: 100 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant='contained'
                      color={application.status === 'approved' ? 'inherit' : 'error'}
                      size='small'
                      onClick={() => handleOpenCancelDialog(application.registration_id)}
                      disabled={application.status === 'approved'}
                      sx={{
                        textTransform: 'none',
                        minWidth: 80,
                        fontWeight: 500
                      }}
                    >
                      Hủy
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby='cancel-dialog-title'
        aria-describedby='cancel-dialog-description'
      >
        <DialogTitle id='cancel-dialog-title' sx={{ pb: 2 }}>
          Xác nhận hủy đơn đăng ký
        </DialogTitle>
        <DialogContent>
          <Typography id='cancel-dialog-description'>
            Bạn có chắc chắn muốn hủy đơn đăng ký này? Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={handleCloseDialog} variant='outlined' color='secondary'>
            Hủy bỏ
          </Button>
          <Button onClick={handleConfirmCancel} variant='contained' color='error' autoFocus>
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default ApplicationsTable
