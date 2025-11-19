import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface ErrorStateProps {
  error: string
}

export const ErrorState = ({ error }: ErrorStateProps) => {
  const router = useRouter()
  const [countdown, setCountdown] = useState<number | null>(null)

  // Check if this is an authorization error
  const isAuthError = error.includes('not authorized') || error.includes('not enrolled') || error.includes('enroll')

  useEffect(() => {
    if (isAuthError) {
      setCountdown(2)
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(interval)
            return null
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [isAuthError])

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: '896px',
          flex: 1,
          px: { xs: 2, sm: 3, lg: 4 },
          py: 4
        }}
      >
        <Alert severity='error' sx={{ mb: 2 }}>
          {error}
        </Alert>
        {isAuthError && countdown !== null && (
          <Typography variant='body2' sx={{ mb: 2, color: 'text.secondary' }}>
            Đang chuyển hướng về trang lớp học trong {countdown} giây...
          </Typography>
        )}
        <Button variant='outlined' onClick={() => router.back()}>
          Quay lại ngay
        </Button>
      </Box>
    </Box>
  )
}
