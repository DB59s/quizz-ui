import { useState, useEffect } from 'react'
import { classService } from '@/services/class.service'

interface RegistrationStatus {
  isRegistered: boolean
  registrationStatus?: 'pending' | 'approved' | 'rejected'
  loading: boolean
}

export const useClassRegistrationStatus = (classId?: string): RegistrationStatus => {
  const [status, setStatus] = useState<RegistrationStatus>({
    isRegistered: false,
    loading: true
  })

  useEffect(() => {
    if (!classId) {
      setStatus({ isRegistered: false, loading: false })
      return
    }

    const checkRegistrationStatus = async () => {
      setStatus(prev => ({ ...prev, loading: true }))

      try {
        const response = await classService.getStudentApplications()

        if (response.success && response.data?.classes) {
          // Find if this class is in the student's applications
          const registration = response.data.classes.find(
            (app: any) => app.class._id === classId || app.class.class_code === classId
          )

          if (registration) {
            setStatus({
              isRegistered: true,
              registrationStatus: registration.status,
              loading: false
            })
          } else {
            setStatus({
              isRegistered: false,
              loading: false
            })
          }
        } else {
          setStatus({
            isRegistered: false,
            loading: false
          })
        }
      } catch (error) {
        console.error('Error checking registration status:', error)
        setStatus({
          isRegistered: false,
          loading: false
        })
      }
    }

    checkRegistrationStatus()
  }, [classId])

  return status
}
