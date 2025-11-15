'use client'

// React Imports
import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams, usePathname } from 'next/navigation'

// Lucide Icons
import { BookOpen } from 'lucide-react'

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
  const params = useParams()
  const pathname = usePathname()
  const lang = (params?.lang as string) || 'en'
  const [classes, setClasses] = useState<ClassInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const hasRestoredRef = useRef(false)

  useEffect(() => {
    fetchApprovedClasses()
  }, [])

  // Restore last viewed class after classes are loaded
  // Only restore if we're on the list page (not detail page) and there's a saved classId
  // Only restore once when component mounts
  useEffect(() => {
    // Check if we're on the list page (not detail page)
    const isListPage = pathname === `/${lang}/my-classes`

    if (isListPage && classes.length > 0 && !loading && !hasRestoredRef.current) {
      const savedClassId = sessionStorage.getItem('lastViewedClassId')
      if (savedClassId) {
        // Check if the class exists in the list
        const classExists = classes.some(c => c.class._id === savedClassId)
        if (classExists) {
          hasRestoredRef.current = true
          // Small delay to avoid flickering
          const timer = setTimeout(() => {
            router.push(`/${lang}/my-classes/${savedClassId}`)
          }, 100)
          return () => clearTimeout(timer)
        } else {
          // Clear if class doesn't exist anymore
          sessionStorage.removeItem('lastViewedClassId')
        }
      }
    }
  }, [classes, loading, lang, router, pathname])

  const fetchApprovedClasses = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await classService.getStudentApplications()

      if (response.success && response.data?.classes) {
        // Filter only approved classes
        const approvedClasses = response.data.classes.filter((app: ClassInfo) => app.status === 'approved')

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
    // Navigate to class detail page with language prefix
    router.push(`/${lang}/my-classes/${classId}`)
  }

  if (loading) {
    return (
      <Box className='flex justify-center items-center p-8'>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return <Alert severity='error'>{error}</Alert>
  }

  if (classes.length === 0) {
    return (
      <Box className='flex flex-col items-center justify-center py-12 px-4'>
        <BookOpen size={48} style={{ color: '#9CA3AF', marginBottom: 12 }} />
        <Typography variant='h6' sx={{ fontWeight: 600, color: '#1F2937', mb: 1 }}>
          Chưa có lớp học nào
        </Typography>
        <Typography variant='body2' sx={{ color: '#6B7280', textAlign: 'center', maxWidth: 400 }}>
          Bạn chưa có lớp học nào được duyệt. Vui lòng đăng ký một lớp học để bắt đầu.
        </Typography>
      </Box>
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
                <Chip label='Đang học' color='success' size='small' variant='tonal' />
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
                Xem chi tiết
              </Button>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}

export default ClassCard
