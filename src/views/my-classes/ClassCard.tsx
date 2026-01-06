'use client'

// React Imports
import { useEffect } from 'react'
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

// Hook Imports
import { useClasses } from '@/hooks/queries/useClasses'

const ClassCard = () => {
  const router = useRouter()
  const params = useParams()
  const pathname = usePathname()
  const lang = (params?.lang as string) || 'en'

  // Use React Query hook for data fetching
  const { data: classes, isLoading, error } = useClasses()

  // Auto-redirect to last viewed class if user was viewing class detail before
  useEffect(() => {
    const lastViewedClassId = sessionStorage.getItem('lastViewedClassId')
    const isListPage = pathname === `/${lang}/my-classes`

    // Only auto-redirect if:
    // 1. We're on the list page (not already on a detail page)
    // 2. We have a lastViewedClassId
    // 3. Classes have loaded successfully
    if (isListPage && lastViewedClassId && classes && classes.length > 0) {
      // Verify the classId exists in current classes
      const classExists = classes.some(c => c.class._id === lastViewedClassId)
      if (classExists) {
        // Only redirect if this is not a deliberate navigation to list (e.g., from applications)
        // We can check if user just came from another route
        const fromExternal = sessionStorage.getItem('fromExternalRoute')
        if (fromExternal === 'true') {
          // Clear the flag and redirect
          sessionStorage.removeItem('fromExternalRoute')
          router.push(`/${lang}/my-classes/${lastViewedClassId}`)
        }
      }
    }
  }, [classes, pathname, lang, router])

  // Clear lastViewedClassId when deliberately navigating to list page
  useEffect(() => {
    const isListPage = pathname === `/${lang}/my-classes`
    if (isListPage) {
      // Check if this is a deliberate navigation (e.g., clicked "Lớp học của bạn")
      // If so, clear the lastViewedClassId
      const shouldClearNavigation = sessionStorage.getItem('clearNavigation')
      if (shouldClearNavigation === 'true') {
        sessionStorage.removeItem('lastViewedClassId')
        sessionStorage.removeItem('clearNavigation')
      }
    }
  }, [pathname, lang])

  const handleViewClass = (classId: string) => {
    // Navigate to class detail page with language prefix
    router.push(`/${lang}/my-classes/${classId}`)
  }

  if (isLoading) {
    return (
      <Box className='flex justify-center items-center p-8'>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return <Alert severity='error'>{error.message || 'Đã xảy ra lỗi khi tải dữ liệu'}</Alert>
  }

  if (!classes || classes.length === 0) {
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
      {classes.map(classInfo => (
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
