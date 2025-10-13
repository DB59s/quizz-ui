'use client'

// React Imports
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid2'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'

// Service Imports
import { classService } from '@/services/class.service'

// Type Imports
type ClassInfo = {
  registration_id: string
  status: 'pending' | 'approved' | 'rejected'
  class: {
    _id: string
    name: string
    description: string
    max_students: number
    current_students: number
    class_code: string
  }
  teacherName?: string
}

const ClassCard = () => {
  const router = useRouter()
  const [classes, setClasses] = useState<ClassInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchApprovedClasses()
  }, [])

  const fetchApprovedClasses = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await classService.getStudentApplications()

      if (response.success && response.data?.classes) {
        // Filter only approved classes
        const approvedClasses = response.data.classes.filter(
          (app: ClassInfo) => app.status === 'approved'
        )

        // Fetch teacher names for each class
        const classesWithTeachers = await Promise.all(
          approvedClasses.map(async (app: ClassInfo) => {
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

        setClasses(classesWithTeachers)
      } else {
        setError(response.message || 'Không thể tải danh sách lớp học')
      }
    } catch (err: any) {
      console.error('Error fetching classes:', err)
      setError(err?.response?.data?.message || 'Đã xảy ra lỗi khi tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  const handleViewClass = (classId: string) => {
    // Navigate to class assignments page
    router.push(`/my-classes/${classId}`)
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
      <Alert severity="error">{error}</Alert>
    )
  }

  if (classes.length === 0) {
    return (
      <Alert severity="info">Bạn chưa có lớp học nào được duyệt</Alert>
    )
  }

  return (
    <Grid container spacing={6}>
      {classes.map((classInfo: ClassInfo) => (
        <Grid size={{ xs: 12, md: 6, lg: 4 }} key={classInfo.registration_id}>
          <Card className='h-full'>
            <CardContent className='flex flex-col gap-4'>
              <div className='flex justify-between items-start'>
                <Typography variant='h5' className='font-semibold'>
                  {classInfo.class.name}
                </Typography>
                <Chip
                  label='Đang học'
                  color='success'
                  size='small'
                  variant='tonal'
                />
              </div>

              <div className='flex flex-col gap-2'>
                <Typography variant='body1' color='text.secondary'>
                  Giáo viên: {classInfo.teacherName || 'Đang tải...'}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Mã lớp: {classInfo.class.class_code}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Số lượng: {classInfo.class.current_students}/{classInfo.class.max_students} học sinh
                </Typography>
              </div>

              <Button
                variant='contained'
                color='primary'
                onClick={() => handleViewClass(classInfo.class._id)}
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  mt: 2
                }}
              >
                Xem bài tập
              </Button>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}

export default ClassCard
