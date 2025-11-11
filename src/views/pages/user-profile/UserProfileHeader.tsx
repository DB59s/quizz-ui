'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'

// Type Imports
import type { ProfileHeaderType } from '@/types/pages/profileTypes'

// Service Imports
import { userService, type UserProfile } from '@/services'

// Component Imports
import UpdateProfileModal from './UpdateProfileModal'

const UserProfileHeader = ({ data }: { data?: ProfileHeaderType }) => {
  const [openModal, setOpenModal] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [fullName, setFullName] = useState(data?.fullName || '')

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true)
        const response = await userService.getProfile()
        if (response.success) {
          setUserProfile(response.data)
          setFullName(response.data.full_name)
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [])

  const handleModalOpen = () => {
    setOpenModal(true)
  }

  const handleModalClose = () => {
    setOpenModal(false)
  }

  const handleUpdateSuccess = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile)
    setFullName(updatedProfile.full_name)
  }

  return (
    <>
      <Card>
        <CardMedia image={data?.coverImg} className='bs-[250px]' />
        <CardContent className='flex gap-5 justify-center flex-col items-center md:items-end md:flex-row !pt-0 md:justify-start'>
          <div className='flex rounded-bs-md mbs-[-40px] border-[5px] mis-[-5px] border-be-0  border-backgroundPaper bg-backgroundPaper'>
            <img height={120} width={120} src={data?.profileImg} className='rounded' alt='Profile Background' />
          </div>
          <div className='flex is-full justify-start self-end flex-col items-center gap-6 sm-gap-0 sm:flex-row sm:justify-between sm:items-end '>
            <div className='flex flex-col items-center sm:items-start gap-2'>
              <Typography variant='h4'>{fullName || 'Loading...'}</Typography>
              <div className='flex flex-wrap gap-6 justify-center sm:justify-normal'>
                {userProfile?.student_code && (
                  <div className='flex items-center gap-2'>
                    <i className='tabler-id-badge' />
                    <Typography className='font-medium'>{userProfile.student_code}</Typography>
                  </div>
                )}
                {userProfile?.class_name && (
                  <div className='flex items-center gap-2'>
                    <i className='tabler-building-community' />
                    <Typography className='font-medium'>{userProfile.class_name}</Typography>
                  </div>
                )}
                {userProfile?.phone_number && (
                  <div className='flex items-center gap-2'>
                    <i className='tabler-phone' />
                    <Typography className='font-medium'>{userProfile.phone_number}</Typography>
                  </div>
                )}
              </div>
            </div>
            <Button variant='contained' onClick={handleModalOpen} disabled={loading} className='flex gap-2'>
              {loading ? (
                <>
                  <CircularProgress size={20} />
                </>
              ) : (
                <>
                  <i className='tabler-user-check !text-base'></i>
                  <span>Cập nhật</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <UpdateProfileModal
        open={openModal}
        onClose={handleModalClose}
        userProfile={userProfile}
        onSuccess={handleUpdateSuccess}
      />
    </>
  )
}

export default UserProfileHeader
