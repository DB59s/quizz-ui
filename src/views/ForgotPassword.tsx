'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'

// Third-party Imports
import classnames from 'classnames'
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { email, object, minLength, string, pipe, nonEmpty } from 'valibot'
import type { SubmitHandler } from 'react-hook-form'
import type { InferInput } from 'valibot'

// Type Imports
import type { SystemMode } from '@core/types'
import type { Locale } from '@configs/i18n'

// Component Imports
import DirectionalIcon from '@components/DirectionalIcon'
import Logo from '@components/layout/shared/Logo'
import CustomTextField from '@core/components/mui/TextField'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Service Imports
import { authService } from '@/services/auth.service'

// Styled Custom Components
const ForgotPasswordIllustration = styled('img')(({ theme }) => ({
  zIndex: 2,
  blockSize: 'auto',
  maxBlockSize: 650,
  maxInlineSize: '100%',
  margin: theme.spacing(12),
  [theme.breakpoints.down(1536)]: {
    maxBlockSize: 550
  },
  [theme.breakpoints.down('lg')]: {
    maxBlockSize: 450
  }
}))

const MaskImg = styled('img')({
  blockSize: 'auto',
  maxBlockSize: 355,
  inlineSize: '100%',
  position: 'absolute',
  insetBlockEnd: 0,
  zIndex: -1
})

// Validation schemas
const emailSchema = object({
  email: pipe(string(), minLength(1, 'This field is required'), email('Email is invalid'))
})

const otpSchema = object({
  otp: pipe(string(), minLength(6, 'OTP must be 6 digits'), nonEmpty('This field is required'))
})

const resetPasswordSchema = object({
  newPassword: pipe(
    string(),
    nonEmpty('This field is required'),
    minLength(8, 'Password must be at least 8 characters long')
  ),
  confirmNewPassword: pipe(
    string(),
    nonEmpty('This field is required'),
    minLength(8, 'Password must be at least 8 characters long')
  )
})

type EmailFormData = InferInput<typeof emailSchema>
type OTPFormData = InferInput<typeof otpSchema>
type ResetPasswordFormData = InferInput<typeof resetPasswordSchema>

type Step = 'email' | 'otp' | 'reset'

const ForgotPassword = ({ mode }: { mode: SystemMode }) => {
  // States
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  // Vars
  const darkImg = '/images/pages/auth-mask-dark.png'
  const lightImg = '/images/pages/auth-mask-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-forgot-password-dark.png'
  const lightIllustration = '/images/illustrations/auth/v2-forgot-password-light.png'

  // Hooks
  const { lang: locale } = useParams()
  const { settings } = useSettings()
  const theme = useTheme()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))
  const authBackground = useImageVariant(mode, lightImg, darkImg)
  const router = useRouter()

  const characterIllustration = useImageVariant(mode, lightIllustration, darkIllustration)

  // Form for email step
  const emailForm = useForm<EmailFormData>({
    resolver: valibotResolver(emailSchema),
    defaultValues: {
      email: ''
    }
  })

  // Form for OTP step
  const otpForm = useForm<OTPFormData>({
    resolver: valibotResolver(otpSchema),
    defaultValues: {
      otp: ''
    }
  })

  // Form for reset password step
  const resetPasswordForm = useForm<ResetPasswordFormData>({
    resolver: valibotResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmNewPassword: ''
    }
  })

  // Handle email submission
  const onEmailSubmit: SubmitHandler<EmailFormData> = async data => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await authService.forgotPassword({ email: data.email })
      setEmail(data.email)
      setSuccess(response.message || 'OTP has been sent to your email')
      setStep('otp')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to send reset link. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle OTP submission
  const onOTPSubmit: SubmitHandler<OTPFormData> = async data => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await authService.verifyOTP({ email, otp: data.otp })
      setSuccess(response.message || 'OTP verified successfully')
      setStep('reset')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle reset password submission
  const onResetPasswordSubmit: SubmitHandler<ResetPasswordFormData> = async data => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    // Validate passwords match
    if (data.newPassword !== data.confirmNewPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const response = await authService.resetPassword({
        email,
        newPassword: data.newPassword,
        confirmNewPassword: data.confirmNewPassword
      })
      setSuccess(response.message || 'Password reset successfully! Redirecting to login...')

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push(getLocalizedUrl('/login', locale as Locale))
      }, 2000)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex bs-full justify-center'>
      <div
        className={classnames(
          'flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden',
          {
            'border-ie': settings.skin === 'bordered'
          }
        )}
      >
        <ForgotPasswordIllustration src={characterIllustration} alt='character-illustration' />
        {!hidden && <MaskImg alt='mask' src={authBackground} />}
      </div>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <Link
          href={getLocalizedUrl('/login', locale as Locale)}
          className='absolute block-start-5 sm:block-start-[33px] inline-start-6 sm:inline-start-[38px]'
        >
          <Logo />
        </Link>
        <div className='flex flex-col gap-6 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset] mbs-8 sm:mbs-11 md:mbs-0'>
          <div className='flex flex-col gap-1'>
            <Typography variant='h4'>Forgot Password 🔒</Typography>
            <Typography>
              {step === 'email' && "Enter your email and we'll send you an OTP to reset your password"}
              {step === 'otp' && 'Enter the OTP sent to your email'}
              {step === 'reset' && 'Enter your new password'}
            </Typography>
          </div>

          {/* Show error message */}
          {error && (
            <Alert severity='error' onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Show success message */}
          {success && (
            <Alert severity='success' onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}

          {/* Step 1: Email Form */}
          {step === 'email' && (
            <form
              noValidate
              autoComplete='off'
              onSubmit={emailForm.handleSubmit(onEmailSubmit)}
              className='flex flex-col gap-6'
            >
              <Controller
                name='email'
                control={emailForm.control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    autoFocus
                    fullWidth
                    label='Email'
                    placeholder='Enter your email'
                    error={!!emailForm.formState.errors.email}
                    helperText={emailForm.formState.errors.email?.message}
                  />
                )}
              />
              <Button fullWidth variant='contained' type='submit' disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Send Reset Link'}
              </Button>
              <Typography className='flex justify-center items-center' color='primary.main'>
                <Link href={getLocalizedUrl('/login', locale as Locale)} className='flex items-center gap-1.5'>
                  <DirectionalIcon
                    ltrIconClass='tabler-chevron-left'
                    rtlIconClass='tabler-chevron-right'
                    className='text-xl'
                  />
                  <span>Back to login</span>
                </Link>
              </Typography>
            </form>
          )}

          {/* Step 2: OTP Form */}
          {step === 'otp' && (
            <form
              noValidate
              autoComplete='off'
              onSubmit={otpForm.handleSubmit(onOTPSubmit)}
              className='flex flex-col gap-6'
            >
              <Typography variant='body2' className='text-center'>
                OTP has been sent to <strong>{email}</strong>
              </Typography>
              <Controller
                name='otp'
                control={otpForm.control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    autoFocus
                    fullWidth
                    label='OTP Code'
                    placeholder='Enter 6-digit OTP'
                    error={!!otpForm.formState.errors.otp}
                    helperText={otpForm.formState.errors.otp?.message}
                    inputProps={{ maxLength: 6 }}
                  />
                )}
              />
              <Button fullWidth variant='contained' type='submit' disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Verify OTP'}
              </Button>
              <Typography className='flex justify-center items-center' color='primary.main'>
                <Link href={getLocalizedUrl('/login', locale as Locale)} className='flex items-center gap-1.5'>
                  <DirectionalIcon
                    ltrIconClass='tabler-chevron-left'
                    rtlIconClass='tabler-chevron-right'
                    className='text-xl'
                  />
                  <span>Back to login</span>
                </Link>
              </Typography>
            </form>
          )}

          {/* Step 3: Reset Password Form */}
          {step === 'reset' && (
            <form
              noValidate
              autoComplete='off'
              onSubmit={resetPasswordForm.handleSubmit(onResetPasswordSubmit)}
              className='flex flex-col gap-6'
            >
              <Controller
                name='newPassword'
                control={resetPasswordForm.control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    autoFocus
                    fullWidth
                    label='New Password'
                    placeholder='Enter new password'
                    type={showPassword ? 'text' : 'password'}
                    error={!!resetPasswordForm.formState.errors.newPassword}
                    helperText={resetPasswordForm.formState.errors.newPassword?.message}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position='end'>
                            <IconButton
                              edge='end'
                              onClick={() => setShowPassword(!showPassword)}
                              onMouseDown={e => e.preventDefault()}
                            >
                              <i className={showPassword ? 'tabler-eye' : 'tabler-eye-off'} />
                            </IconButton>
                          </InputAdornment>
                        )
                      }
                    }}
                  />
                )}
              />
              <Controller
                name='confirmNewPassword'
                control={resetPasswordForm.control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Confirm New Password'
                    placeholder='Confirm new password'
                    type={showConfirmPassword ? 'text' : 'password'}
                    error={!!resetPasswordForm.formState.errors.confirmNewPassword}
                    helperText={resetPasswordForm.formState.errors.confirmNewPassword?.message}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position='end'>
                            <IconButton
                              edge='end'
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              onMouseDown={e => e.preventDefault()}
                            >
                              <i className={showConfirmPassword ? 'tabler-eye' : 'tabler-eye-off'} />
                            </IconButton>
                          </InputAdornment>
                        )
                      }
                    }}
                  />
                )}
              />
              <Button fullWidth variant='contained' type='submit' disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Reset Password'}
              </Button>
              <Typography className='flex justify-center items-center' color='primary.main'>
                <Link href={getLocalizedUrl('/login', locale as Locale)} className='flex items-center gap-1.5'>
                  <DirectionalIcon
                    ltrIconClass='tabler-chevron-left'
                    rtlIconClass='tabler-chevron-right'
                    className='text-xl'
                  />
                  <span>Back to login</span>
                </Link>
              </Typography>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
