'use client'

// React Imports
import { useRouter, useParams } from 'next/navigation'

// Lucide Icons
import { BarChart3, Clock, TrendingUp } from 'lucide-react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'

// Hook Imports
import { useDashboard } from '@/hooks/queries/useDashboard'
import { useSubmissions } from '@/hooks/queries/useSubmissions'

// Chart Imports
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

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
  const params = useParams()
  const lang = (params?.lang as string) || 'en'

  // Use React Query hooks for data fetching
  const { data: dashboardData, isLoading, error } = useDashboard()
  const { submissions, isLoading: submissionsLoading } = useSubmissions({ page: 1, limit: 5 })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return '#10B981'
    if (score >= 5) return '#F59E0B'
    return '#EF4444'
  }

  if (isLoading) {
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

  if (!dashboardData) {
    return <Typography>Không có dữ liệu</Typography>
  }

  const { kpi } = dashboardData

  // Prepare chart data from submissions
  const chartData =
    submissions && submissions.length > 0
      ? submissions
          .slice()
          .reverse() // Reverse to show chronological order
          .map((submission, index) => ({
            name: `Bài ${index + 1}`,
            score: submission.score,
            date: new Date(submission.submitted_at).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit'
            }),
            quizName:
              submission.quiz_name?.length > 20 ? submission.quiz_name.substring(0, 20) + '...' : submission.quiz_name
          }))
      : []

  return (
    <Box>
      {/* Header */}
      <Box className='mb-6'>
        <Typography variant='h4' className='font-bold mb-2'>
          Trang chủ
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

      {/* Score Progression Chart */}
      <Card>
        <CardContent>
          <Box className='flex items-center gap-2 mb-4'>
            <TrendingUp size={24} color='#3B82F6' />
            <Typography variant='h6' className='font-semibold'>
              Biểu đồ tiến độ điểm số
            </Typography>
          </Box>

          {submissionsLoading ? (
            <Box className='flex justify-center items-center' sx={{ height: 300 }}>
              <CircularProgress />
            </Box>
          ) : chartData.length > 0 ? (
            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id='colorScore' x1='0' y1='0' x2='0' y2='1'>
                      <stop offset='5%' stopColor='#3B82F6' stopOpacity={0.3} />
                      <stop offset='95%' stopColor='#3B82F6' stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray='3 3' stroke='#E5E7EB' />
                  <XAxis dataKey='name' tick={{ fill: '#6B7280', fontSize: 12 }} stroke='#E5E7EB' />
                  <YAxis
                    domain={[0, 10]}
                    ticks={[0, 2, 4, 6, 8, 10]}
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    stroke='#E5E7EB'
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    content={({ active, payload }: any) => {
                      if (active && payload && payload.length > 0) {
                        const data = payload[0].payload
                        return (
                          <Box sx={{ p: 1.5, minWidth: 200 }}>
                            <Typography variant='body2' sx={{ fontWeight: 600, mb: 0.5 }}>
                              {data.quizName}
                            </Typography>
                            <Typography variant='body2' color='text.secondary' sx={{ mb: 0.5 }}>
                              Ngày: {data.date}
                            </Typography>
                            <Typography
                              variant='body2'
                              sx={{
                                fontWeight: 600,
                                color: getScoreColor(data.score)
                              }}
                            >
                              Điểm: {data.score.toFixed(1)}/10
                            </Typography>
                          </Box>
                        )
                      }
                      return null
                    }}
                  />
                  <Line
                    type='monotone'
                    dataKey='score'
                    stroke='#3B82F6'
                    strokeWidth={3}
                    fill='url(#colorScore)'
                    dot={{ fill: '#3B82F6', r: 5 }}
                    activeDot={{ r: 7, fill: '#2563EB' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          ) : (
            <Box className='flex flex-col items-center justify-center py-12 px-4'>
              <BarChart3 size={48} style={{ color: '#9CA3AF', marginBottom: 12 }} />
              <Typography variant='h6' sx={{ fontWeight: 600, color: '#1F2937', mb: 1 }}>
                Chưa có dữ liệu
              </Typography>
              <Typography variant='body2' sx={{ color: '#6B7280', textAlign: 'center', maxWidth: 400 }}>
                Hoàn thành bài kiểm tra để xem biểu đồ tiến độ của bạn
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default StudentDashboard
