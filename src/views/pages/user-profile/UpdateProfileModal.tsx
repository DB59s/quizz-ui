'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

// Service Imports
import { userService, type UserProfile } from '@/services'

interface UpdateProfileModalProps {
  open: boolean
  onClose: () => void
  userProfile: UserProfile | null
  onSuccess?: (updatedProfile: UserProfile) => void
}

const UpdateProfileModal = ({ open, onClose, userProfile, onSuccess }: UpdateProfileModalProps) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    full_name: userProfile?.full_name || '',
    student_code: userProfile?.student_code || '',
    class_name: userProfile?.class_name || '',
    phone_number: userProfile?.phone_number || '',
    email: userProfile?.email || ''
  })

  // Update form data when modal opens or userProfile changes
  useEffect(() => {
    if (userProfile) {
      setFormData({
        full_name: userProfile.full_name || '',
        student_code: userProfile.student_code || '',
        class_name: userProfile.class_name || '',
        phone_number: userProfile.phone_number || '',
        email: userProfile.email || ''
      })
    }
  }, [userProfile])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async () => {
    try {
      setError(null)
      setLoading(true)

      const response = await userService.updateProfile({
        full_name: formData.full_name,
        student_code: formData.student_code,
        class_name: formData.class_name,
        phone_number: formData.phone_number,
        email: formData.email
      })

      if (response.success && response.data) {
        onSuccess?.(response.data)
        onClose()
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Cập nhật thất bại'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setError(null)
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Cập nhật thông tin cá nhân</DialogTitle>
      <DialogContent className='flex flex-col gap-4 pt-4'>
        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          label="Họ và tên"
          name="full_name"
          value={formData.full_name}
          onChange={handleInputChange}
          fullWidth
          variant="outlined"
          disabled={loading}
        />

        <TextField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          fullWidth
          variant="outlined"
          disabled={loading}
        />

        <TextField
          label="Mã sinh viên"
          name="student_code"
          value={formData.student_code}
          onChange={handleInputChange}
          fullWidth
          variant="outlined"
          disabled={loading}
        />

        <TextField
          label="Lớp"
          name="class_name"
          value={formData.class_name}
          onChange={handleInputChange}
          fullWidth
          variant="outlined"
          disabled={loading}
        />

        <TextField
          label="Số điện thoại"
          name="phone_number"
          value={formData.phone_number}
          onChange={handleInputChange}
          fullWidth
          variant="outlined"
          disabled={loading}
        />
      </DialogContent>
      <DialogActions className='gap-2 p-4'>
        <Button onClick={handleClose} disabled={loading}>
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          className='flex gap-2'
        >
          {loading ? (
            <>
              <CircularProgress size={20} />
              <span>Đang cập nhật...</span>
            </>
          ) : (
            'Xác nhận'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default UpdateProfileModal
