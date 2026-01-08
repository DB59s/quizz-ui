'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, Typography, Box, Chip, CircularProgress, Alert, Button } from '@mui/material'
import { useSession } from 'next-auth/react'
import { classService, type ClassData } from '@/services/class.service'
import { useClassRegistrationStatus } from '@/hooks/useClassRegistrationStatus'
import { invalidateClassCache } from '@/utils/cacheInvalidation'

interface ClassInformationProps {
  classCode: string
}

const ClassInformation = ({ classCode }: ClassInformationProps) => {
  const [classData, setClassData] = useState<ClassData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [joining, setJoining] = useState(false)
  const [joinSuccess, setJoinSuccess] = useState(false)
  const { data: session, status } = useSession()

  // Check if class is already registered
  const registrationStatus = useClassRegistrationStatus(classData?.id)

  useEffect(() => {
    if (!classCode) {
      setClassData(null)
      setError(null)
      return
    }

    // Wait for session to load
    if (status === 'loading') {
      return
    }

    const fetchClassInfo = async () => {
      // Reset state when classCode changes
      setError(null)
      setClassData(null)

      // Check sessionStorage first
      const cacheKey = `class_info_${classCode}`
      const cachedData = sessionStorage.getItem(cacheKey)

      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData)
          // Check if cache is still valid (e.g., less than 5 minutes old)
          const cacheAge = Date.now() - parsed.timestamp
          if (cacheAge < 5 * 60 * 1000) {
            // 5 minutes
            setClassData(parsed.data)
            setError(null)
            setLoading(false)
            return
          }
        } catch (e) {
          // Invalid cache, continue to fetch
          sessionStorage.removeItem(cacheKey)
        }
      }

      setLoading(true)

      try {
        // Check if user is authenticated
        const token = (session as any)?.accessToken

        if (!token) {
          setError('Bạn cần đăng nhập để xem thông tin lớp học')
          setLoading(false)
          return
        }

        // Call API using class service
        const response = await classService.getClassByCode(classCode)

        if (response.success && response.data) {
          setClassData(response.data)

          // Save to sessionStorage
          sessionStorage.setItem(
            cacheKey,
            JSON.stringify({
              data: response.data,
              timestamp: Date.now()
            })
          )
        } else {
          setError(response.message || 'Không thể tải thông tin lớp học')
        }
      } catch (err: any) {
        // Handle specific error cases
        if (err?.response?.status === 404) {
          setError('Không tìm thấy lớp học với mã này')
        } else if (err?.response?.status === 401) {
          setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại')
        } else if (err?.response?.status === 403) {
          setError('Bạn không có quyền truy cập thông tin lớp học này')
        } else if (err?.response?.data?.message) {
          setError(err.response.data.message)
        } else if (err?.message) {
          setError(err.message)
        } else {
          setError('Đã xảy ra lỗi khi tải thông tin lớp học')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchClassInfo()
  }, [classCode, session, status])

  if (!classCode) {
    return null
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
      <Alert severity='error' className='mt-4'>
        {error}
      </Alert>
    )
  }

  if (!classData) {
    return null
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success'
      case 'inactive':
        return 'error'
      case 'pending':
        return 'warning'
      default:
        return 'default'
    }
  }

  // Translate status to Vietnamese
  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'Đang hoạt động'
      case 'inactive':
        return 'Ngừng hoạt động'
      case 'pending':
        return 'Chờ duyệt'
      default:
        return status
    }
  }

  const availableSlots = classData.max_students - classData.current_students

  const handleJoinClass = async () => {
    if (!classData?.id) {
      setError('Không tìm thấy thông tin lớp học')
      return
    }
    setJoining(true)
    setJoinSuccess(false)
    setError(null)

    try {
      const response = await classService.requestJoinClass(classData.id)
      console.log('Join request response:', response)
      console.log('Registration ID:', response.data?._id)
      setJoinSuccess(true)

      // Invalidate class cache so the student list updates
      invalidateClassCache()
    } catch (err: any) {
      if (err?.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError('Không thể gửi yêu cầu tham gia lớp học')
      }
    } finally {
      setJoining(false)
    }
  }

  return (
    <Card className='mt-6 shadow-lg'>
      <CardContent className='p-6'>
        <Box className='flex justify-between items-start mb-4'>
          <Typography variant='h5' component='h2' className='font-bold'>
            {classData.name}
          </Typography>
          <Chip label={getStatusLabel(classData.status)} color={getStatusColor(classData.status)} size='small' />
        </Box>

        <Box className='space-y-3'>
          <Box>
            <Typography variant='body2' color='text.secondary' className='font-semibold'>
              Mã lớp học
            </Typography>
            <Typography variant='body1' className='font-mono'>
              {classData.class_code}
            </Typography>
          </Box>

          {classData.description && (
            <Box>
              <Typography variant='body2' color='text.secondary' className='font-semibold'>
                Mô tả
              </Typography>
              <Typography variant='body1'>{classData.description}</Typography>
            </Box>
          )}

          <Box className='grid grid-cols-2 gap-4'>
            <Box>
              <Typography variant='body2' color='text.secondary' className='font-semibold'>
                Số lượng sinh viên
              </Typography>
              <Typography variant='body1'>
                {classData.current_students} / {classData.max_students}
              </Typography>
            </Box>

            <Box>
              <Typography variant='body2' color='text.secondary' className='font-semibold'>
                Chỗ trống
              </Typography>
              <Typography
                variant='body1'
                color={availableSlots > 0 ? 'success.main' : 'error.main'}
                className='font-semibold'
              >
                {availableSlots > 0 ? `${availableSlots} chỗ` : 'Đã đầy'}
              </Typography>
            </Box>
          </Box>

          <Box className='pt-3 border-t border-gray-200'>
            <Typography variant='body2' color='text.secondary' className='font-semibold mb-2'>
              Giảng viên
            </Typography>
            <Box className='space-y-1'>
              <Typography variant='body1' className='font-medium'>
                {classData.teacher.full_name}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {classData.teacher.email}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {classData.teacher.department} - {classData.teacher.university}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Join Class Button */}
        <Box className='mt-6 pt-4 border-t border-gray-200'>
          {registrationStatus.loading ? (
            <Box className='flex justify-center items-center p-4'>
              <CircularProgress size={24} />
              <Typography variant='body2' className='ml-2'>
                Đang kiểm tra trạng thái...
              </Typography>
            </Box>
          ) : joinSuccess || registrationStatus.isRegistered ? (
            <Alert
              severity={
                registrationStatus.registrationStatus === 'approved'
                  ? 'success'
                  : registrationStatus.registrationStatus === 'rejected'
                    ? 'error'
                    : 'info'
              }
            >
              {registrationStatus.registrationStatus === 'approved'
                ? 'Bạn đã được chấp nhận vào lớp học này!'
                : registrationStatus.registrationStatus === 'rejected'
                  ? 'Yêu cầu tham gia lớp học của bạn đã bị từ chối'
                  : 'Đã gửi yêu cầu tham gia lớp học. Đang chờ duyệt...'}
            </Alert>
          ) : (
            <Button
              variant='contained'
              color='primary'
              fullWidth
              onClick={handleJoinClass}
              disabled={joining || availableSlots <= 0}
              className='py-3'
            >
              {joining ? (
                <Box className='flex items-center gap-2'>
                  <CircularProgress size={20} color='inherit' />
                  <span>Đang gửi yêu cầu...</span>
                </Box>
              ) : availableSlots <= 0 ? (
                'Lớp học đã đầy'
              ) : (
                'Gửi yêu cầu tham gia lớp học'
              )}
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

export default ClassInformation
