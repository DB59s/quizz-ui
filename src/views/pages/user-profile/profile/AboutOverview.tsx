'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'

// Hook Imports
import { useUserProfile } from '@/hooks/queries/useUserProfile'

// Simple Info Card without gradient
const InfoCard = ({ icon, label, value }: { icon: string; label: string; value: string | number }) => {
  return (
    <Card>
      <CardContent>
        <Box className='flex items-center gap-3'>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: 'var(--mui-palette-primary-lightOpacity)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <i className={icon} style={{ fontSize: 24, color: 'var(--mui-palette-primary-main)' }} />
          </Box>
          <Box className='flex flex-col flex-1'>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 0.5 }}>
              {label}
            </Typography>
            <Typography variant='h6' sx={{ fontWeight: 600 }}>
              {value}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

const AboutOverview = () => {
  const { data: userProfile, isLoading, error } = useUserProfile()

  if (isLoading) {
    return (
      <Grid container spacing={3}>
        {[...Array(6)].map((_, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6 }}>
            <Card>
              <CardContent>
                <Box className='flex items-center gap-3'>
                  <Skeleton variant='rectangular' width={48} height={48} sx={{ borderRadius: 2 }} />
                  <Box className='flex flex-col flex-1'>
                    <Skeleton variant='text' width='40%' height={20} />
                    <Skeleton variant='text' width='60%' height={28} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    )
  }

  if (error) {
    return <Alert severity='error'>{error.message || 'Không thể tải thông tin người dùng'}</Alert>
  }

  if (!userProfile) {
    return <Alert severity='info'>Không có dữ liệu hồ sơ</Alert>
  }

  return (
    <Box>
      {/* Section Header */}
      <Typography variant='h5' sx={{ fontWeight: 600, mb: 1 }}>
        Thông tin cá nhân
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 4 }}>
        Quản lý thông tin tài khoản của bạn
      </Typography>

      {/* Info Cards Grid */}
      <Grid container spacing={3} className='mb-6'>
        <Grid size={{ xs: 12, sm: 6 }}>
          <InfoCard icon='tabler-user' label='Họ và tên' value={userProfile.full_name} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <InfoCard icon='tabler-mail' label='Email' value={userProfile.email} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <InfoCard icon='tabler-id-badge' label='Mã sinh viên' value={userProfile.student_code || 'Chưa cập nhật'} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <InfoCard
            icon='tabler-building-community'
            label='Lớp học'
            value={userProfile.class_name || 'Chưa cập nhật'}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <InfoCard icon='tabler-phone' label='Số điện thoại' value={userProfile.phone_number || 'Chưa cập nhật'} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <InfoCard
            icon='tabler-calendar'
            label='Ngày tạo tài khoản'
            value={new Date(userProfile.created_at).toLocaleDateString('vi-VN')}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* Account Stats Section */}
      <Typography variant='h6' sx={{ fontWeight: 600, mb: 3 }}>
        Thông tin tài khoản
      </Typography>

      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                  Ngày tạo
                </Typography>
                <Box className='flex items-center gap-2'>
                  <i className='tabler-calendar-check' style={{ color: 'var(--mui-palette-primary-main)' }} />
                  <Typography variant='body1' sx={{ fontWeight: 500 }}>
                    {new Date(userProfile.created_at).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                  Cập nhật lần cuối
                </Typography>
                <Box className='flex items-center gap-2'>
                  <i className='tabler-clock' style={{ color: 'var(--mui-palette-primary-main)' }} />
                  <Typography variant='body1' sx={{ fontWeight: 500 }}>
                    {new Date(userProfile.updated_at).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                  Trạng thái
                </Typography>
                <Box className='flex items-center gap-2'>
                  <i className='tabler-circle-check' style={{ color: 'var(--mui-palette-success-main)' }} />
                  <Typography variant='body1' sx={{ fontWeight: 500 }}>
                    Đang hoạt động
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                  Vai trò
                </Typography>
                <Box className='flex items-center gap-2'>
                  <i className='tabler-school' style={{ color: 'var(--mui-palette-primary-main)' }} />
                  <Typography variant='body1' sx={{ fontWeight: 500 }}>
                    Sinh viên
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  )
}

export default AboutOverview
