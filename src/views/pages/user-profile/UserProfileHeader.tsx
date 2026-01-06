'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Skeleton from '@mui/material/Skeleton'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'

// Type Imports
import type { ProfileHeaderType } from '@/types/pages/profileTypes'

// Hook Imports
import { useUserProfile } from '@/hooks/queries/useUserProfile'

// Component Imports
import UpdateProfileModal from './UpdateProfileModal'

const UserProfileHeader = ({ data }: { data?: ProfileHeaderType }) => {
  const [openModal, setOpenModal] = useState(false)

  // Use React Query hook for instant cached loads
  const { data: userProfile, isLoading } = useUserProfile()

  const handleModalOpen = () => {
    setOpenModal(true)
  }

  const handleModalClose = () => {
    setOpenModal(false)
  }

  return (
    <>
      <Card>
        <CardContent>
          <Box className='flex flex-col gap-4'>
            {/* Header Section */}
            <Box className='flex items-start justify-between'>
              <Box className='flex flex-col gap-2'>
                {isLoading ? (
                  <>
                    <Skeleton variant='text' width={250} height={40} />
                    <Skeleton variant='text' width={180} height={24} />
                  </>
                ) : (
                  <>
                    <Typography variant='h4' sx={{ fontWeight: 600 }}>
                      {userProfile?.full_name || 'N/A'}
                    </Typography>
                    <Typography variant='body1' color='text.secondary'>
                      {userProfile?.email}
                    </Typography>
                  </>
                )}
              </Box>
              <Button
                variant='contained'
                onClick={handleModalOpen}
                disabled={isLoading}
                sx={{
                  bgcolor: 'var(--mui-palette-primary-main)',
                  '&:hover': {
                    bgcolor: 'var(--mui-palette-primary-dark)'
                  }
                }}
              >
                {isLoading ? (
                  <CircularProgress size={20} sx={{ color: 'white' }} />
                ) : (
                  <>
                    <i className='tabler-edit !text-base mr-2'></i>
                    <span>Cập nhật</span>
                  </>
                )}
              </Button>
            </Box>

            <Divider />

            {/* Info Grid */}
            <Box className='flex flex-wrap gap-6'>
              {isLoading ? (
                <>
                  <Skeleton variant='text' width={150} height={24} />
                  <Skeleton variant='text' width={150} height={24} />
                  <Skeleton variant='text' width={150} height={24} />
                </>
              ) : (
                <>
                  {userProfile?.student_code && (
                    <Box className='flex items-center gap-2'>
                      <i className='tabler-id-badge' style={{ color: 'var(--mui-palette-primary-main)' }} />
                      <Typography variant='body2' sx={{ fontWeight: 500 }}>
                        {userProfile.student_code}
                      </Typography>
                    </Box>
                  )}
                  {userProfile?.class_name && (
                    <Box className='flex items-center gap-2'>
                      <i className='tabler-building-community' style={{ color: 'var(--mui-palette-primary-main)' }} />
                      <Typography variant='body2' sx={{ fontWeight: 500 }}>
                        {userProfile.class_name}
                      </Typography>
                    </Box>
                  )}
                  {userProfile?.phone_number && (
                    <Box className='flex items-center gap-2'>
                      <i className='tabler-phone' style={{ color: 'var(--mui-palette-primary-main)' }} />
                      <Typography variant='body2' sx={{ fontWeight: 500 }}>
                        {userProfile.phone_number}
                      </Typography>
                    </Box>
                  )}
                </>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      <UpdateProfileModal
        open={openModal}
        onClose={handleModalClose}
        userProfile={userProfile || null}
        onSuccess={handleModalClose}
      />
    </>
  )
}

export default UserProfileHeader
