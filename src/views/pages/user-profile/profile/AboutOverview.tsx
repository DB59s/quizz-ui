'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

// Type Imports
import type { ProfileTeamsType, ProfileCommonType, ProfileTabType } from '@/types/pages/profileTypes'

// Service Imports
import { userService, type UserProfile } from '@/services'

const renderList = (list: ProfileCommonType[]) => {
  return (
    list.length > 0 &&
    list.map((item, index) => {
      return (
        <div key={index} className='flex items-center gap-2'>
          <i className={item.icon} />
          <div className='flex items-center flex-wrap gap-2'>
            <Typography className='font-medium'>
              {`${item.property.charAt(0).toUpperCase() + item.property.slice(1)}:`}
            </Typography>
            <Typography> {item.value.charAt(0).toUpperCase() + item.value.slice(1)}</Typography>
          </div>
        </div>
      )
    })
  )
}

const renderTeams = (teams: ProfileTeamsType[]) => {
  return (
    teams.length > 0 &&
    teams.map((item, index) => {
      return (
        <div key={index} className='flex items-center flex-wrap gap-2'>
          <Typography className='font-medium'>
            {item.property.charAt(0).toUpperCase() + item.property.slice(1)}
          </Typography>
          <Typography>{item.value.charAt(0).toUpperCase() + item.value.slice(1)}</Typography>
        </div>
      )
    })
  )
}

const AboutOverview = ({ data }: { data?: ProfileTabType }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await userService.getProfile()
        if (response.success) {
          setUserProfile(response.data)
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Không thể tải thông tin'
        setError(errorMessage)
        console.error('Failed to fetch user profile:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [])

  if (loading) {
    return (
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent className='flex justify-center items-center py-8'>
              <CircularProgress />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    )
  }

  if (error) {
    return (
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <Alert severity="error">{error}</Alert>
        </Grid>
      </Grid>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent className='flex flex-col gap-6'>
            {/* User Profile Data from API */}
            {userProfile && (
              <>
                <div className='flex flex-col gap-4'>
                  <Typography className='uppercase' variant='body2' color='text.disabled'>
                    Thông Tin Cá Nhân
                  </Typography>
                  <div className='flex items-center gap-2'>
                    <i className='tabler-mail' />
                    <div className='flex items-center flex-wrap gap-2'>
                      <Typography className='font-medium'>Email:</Typography>
                      <Typography>{userProfile.email}</Typography>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <i className='tabler-user' />
                    <div className='flex items-center flex-wrap gap-2'>
                      <Typography className='font-medium'>Họ và tên:</Typography>
                      <Typography>{userProfile.full_name}</Typography>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <i className='tabler-id-badge' />
                    <div className='flex items-center flex-wrap gap-2'>
                      <Typography className='font-medium'>Mã sinh viên:</Typography>
                      <Typography>{userProfile.student_code || 'N/A'}</Typography>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <i className='tabler-building-community' />
                    <div className='flex items-center flex-wrap gap-2'>
                      <Typography className='font-medium'>Lớp:</Typography>
                      <Typography>{userProfile.class_name || 'N/A'}</Typography>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <i className='tabler-phone' />
                    <div className='flex items-center flex-wrap gap-2'>
                      <Typography className='font-medium'>Số điện thoại:</Typography>
                      <Typography>{userProfile.phone_number}</Typography>
                    </div>
                  </div>
                </div>

                <div className='flex flex-col gap-4'>
                  <Typography className='uppercase' variant='body2' color='text.disabled'>
                    Thống Kê Tài Khoản
                  </Typography>
                  <div className='flex items-center gap-2'>
                    <i className='tabler-calendar' />
                    <div className='flex items-center flex-wrap gap-2'>
                      <Typography className='font-medium'>Ngày tạo:</Typography>
                      <Typography>{new Date(userProfile.created_at).toLocaleDateString('vi-VN')}</Typography>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <i className='tabler-clock' />
                    <div className='flex items-center flex-wrap gap-2'>
                      <Typography className='font-medium'>Cập nhật lần cuối:</Typography>
                      <Typography>{new Date(userProfile.updated_at).toLocaleDateString('vi-VN')}</Typography>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </Grid>
      {/* {data?.overview && (
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent className='flex flex-col gap-6'>
              <div className='flex flex-col gap-4'>
                <Typography className='uppercase' variant='body2' color='text.disabled'>
                  Overview
                </Typography>
                {renderList(data?.overview)}
              </div>
            </CardContent>
          </Card>
        </Grid>
      )} */}
    </Grid>
  )
}

export default AboutOverview
