'use client'

// React Imports
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Lucide Icons
import { BarChart3 } from 'lucide-react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

// Service Imports
import { dashboardService, type DashboardData } from '@/services/dashboard.service'

// Component for KPI Card
const KPICard = ({ title, value, icon, color }: { title: string; value: number; icon: string; color: string }) => {
  return (
    <Card>
      <CardContent>
        <Box className='flex items-start justify-between'>
          <Box>
            <Typography variant='body2' color='text.secondary' className='mb-1'>
              {title}
            </Typography>
            <Typography variant='h4' className='font-bold' sx={{ color }}>
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: `${color}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <i className={icon} style={{ fontSize: 24, color }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

const StudentDashboard = () => {
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await dashboardService.getStudentDashboard()

      if (response.success && response.data) {
        setDashboardData(response.data)
      }
    } catch (err: any) {
      console.error('Error fetching dashboard:', err)
      setError(err?.response?.data?.message || 'Đã xảy ra lỗi khi tải dữ liệu')
    } finally {
      setLoading(false)
    }
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

  if (!dashboardData) {
    return <Typography>Không có dữ liệu</Typography>
  }

  const { kpi, progress_chart } = dashboardData

  return (
    <Box>
      {/* Header */}
      <Box className='mb-6'>
        <Typography variant='h4' className='font-bold mb-2'>
          Dashboard
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Xem tổng quan về kết quả học tập của bạn
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={4} className='mb-6'>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard title='Lớp học đã tham gia' value={kpi.total_classes_joined} icon='tabler-school' color='#3B82F6' />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard title='Tổng bài đã nộp' value={kpi.total_submissions} icon='tabler-file-check' color='#10B981' />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard title='Điểm trung bình' value={kpi.average_score} icon='tabler-chart-line' color='#F59E0B' />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard title='Bài kiểm tra sắp tới' value={kpi.upcoming_quizzes} icon='tabler-clock' color='#EF4444' />
        </Grid>
      </Grid>

      {/* Progress Chart Section */}
      {progress_chart && progress_chart.length > 0 ? (
        <Card>
          <CardContent>
            <Typography variant='h6' className='font-semibold mb-4'>
              Biểu đồ tiến độ
            </Typography>
            {/* TODO: Add chart component here */}
            <Box className='flex items-center justify-center p-8'>
              <Typography color='text.secondary'>Biểu đồ sẽ được hiển thị ở đây</Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <Box className='flex flex-col items-center justify-center py-12 px-4'>
              <BarChart3 size={48} style={{ color: '#9CA3AF', marginBottom: 12 }} />
              <Typography variant='h6' sx={{ fontWeight: 600, color: '#1F2937', mb: 1 }}>
                Chưa có dữ liệu tiến độ
              </Typography>
              <Typography variant='body2' sx={{ color: '#6B7280', textAlign: 'center', maxWidth: 400 }}>
                Bạn chưa hoàn thành bài kiểm tra nào. Hãy tham gia các lớp học và hoàn thành bài tập để xem tiến độ của bạn.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}

export default StudentDashboard
