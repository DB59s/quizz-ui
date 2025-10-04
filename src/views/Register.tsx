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
import IconButton from '@mui/material/IconButton'
import Grid from '@mui/material/Grid2'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider'

// Third-party Imports
import classnames from 'classnames'
import { toast } from 'react-toastify'

// React Hook Form Imports
import { Controller, useForm } from 'react-hook-form'

// Type Imports
import type { SystemMode } from '@core/types'
import type { Locale } from '@configs/i18n'

// Component Imports
import Logo from '@components/layout/shared/Logo'
import CustomTextField from '@core/components/mui/TextField'
import CustomInputLabel from '@/components/form/CustomInputLabel'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// No API imports needed for fetch

type FormValues = {
  email: string
  password: string
  fullName: string
  studentCode: string
}

// Styled Custom Components
const RegisterIllustration = styled('img')(({ theme }) => ({
  zIndex: 2,
  blockSize: 'auto',
  maxBlockSize: 600,
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
  maxBlockSize: 345,
  inlineSize: '100%',
  position: 'absolute',
  insetBlockEnd: 0,
  zIndex: -1
})

const Register = ({ mode }: { mode: SystemMode }) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Vars
  const darkImg = '/images/pages/auth-mask-dark.png'
  const lightImg = '/images/pages/auth-mask-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-register-dark.png'
  const lightIllustration = '/images/illustrations/auth/v2-register-light.png'
  const borderedDarkIllustration = '/images/illustrations/auth/v2-register-dark-border.png'
  const borderedLightIllustration = '/images/illustrations/auth/v2-register-light-border.png'

  // Hooks
  const { lang: locale } = useParams()
  const router = useRouter()
  const { settings } = useSettings()
  const theme = useTheme()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const characterIllustration = useImageVariant(
    mode,
    lightIllustration,
    darkIllustration,
    borderedLightIllustration,
    borderedDarkIllustration
  )

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const {
    handleSubmit,
    control,
    setError,
    clearErrors,
    formState: { errors }
  } = useForm<FormValues>({
    defaultValues: {
      email: '',
      fullName: '',
      studentCode: '',
      password: ''
    },
    mode: 'onBlur'
  })

  const onSubmit = async (data: FormValues) => {
    clearErrors()
    setIsLoading(true)

    const payload = {
      email: data.email,
      full_name: data.fullName,
      student_code: data.studentCode,
      password: data.password
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (response.ok && data.success) {
        router.push('/login')

        toast.success('Đăng ký thành công!', {
          position: 'bottom-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true
        })
      } else {
        if (data.error === 'Email already exists') {
          setError('email', {
            message: 'Email already exists'
          })
        } else if (data.error === 'User creation failed' && data.message.includes('Student code already exists')) {
          setError('studentCode', {
            message: 'Student code already exists'
          })
        } else {
          toast.error(data.message || 'Registration failed!', {
            position: 'bottom-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true
          })
        }
      }
    } catch (error: any) {
      toast.error('Network error. Please try again.', {
        position: 'bottom-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true
      })
    } finally {
      setIsLoading(false)
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
        <RegisterIllustration src={characterIllustration} alt='character-illustration' />
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
            <Typography variant='h4'>Adventure starts here 🚀</Typography>
            <Typography>Make your app management easy and fun!</Typography>
          </div>
          <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)} className='flex flex-col'>
            <Grid container spacing={6}>
              <Grid size={{ xs: 12 }}>
                <CustomInputLabel>Email</CustomInputLabel>
                <Controller
                  name='email'
                  control={control}
                  rules={{
                    validate: value => {
                      if (!value) {
                        return 'Email is required'
                      }
                    }
                  }}
                  render={({ field }) => (
                    <CustomTextField
                      fullWidth
                      required
                      placeholder='Enter your email'
                      {...field}
                      onChange={e => {
                        field.onChange(e.target.value)
                      }}
                      {...(errors.email && {
                        error: true,
                        helperText: errors.email.message
                      })}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <CustomInputLabel>Full Name</CustomInputLabel>
                <Controller
                  name='fullName'
                  control={control}
                  rules={{
                    validate: value => {
                      if (!value) {
                        return 'Full name is required'
                      }
                    }
                  }}
                  render={({ field }) => (
                    <CustomTextField
                      fullWidth
                      required
                      placeholder='Enter your full name'
                      {...field}
                      {...(errors.fullName && {
                        error: true,
                        helperText: errors.fullName.message
                      })}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <CustomInputLabel>Student Code</CustomInputLabel>
                <Controller
                  name='studentCode'
                  control={control}
                  rules={{
                    validate: value => {
                      if (!value) {
                        return 'Student code is required'
                      }
                    }
                  }}
                  render={({ field }) => (
                    <CustomTextField
                      fullWidth
                      required
                      placeholder='Enter your student code'
                      {...field}
                      onChange={e => {
                        field.onChange(e.target.value)
                      }}
                      {...(errors.studentCode && {
                        error: true,
                        helperText: errors.studentCode.message
                      })}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <CustomInputLabel>Password</CustomInputLabel>
                <Controller
                  name='password'
                  control={control}
                  rules={{
                    validate: value => {
                      if (!value) {
                        return 'Password is required'
                      }

                      if (value.length < 8) {
                        return 'Password must be at least 8 characters'
                      }

                      if (value.length > 12) {
                        return 'Password must be at most 12 characters'
                      }

                      return true
                    }
                  }}
                  render={({ field }) => (
                    <CustomTextField
                      fullWidth
                      required
                      {...field}
                      placeholder='Enter your password'
                      id='outlined-adornment-password'
                      type={isPasswordShown ? 'text' : 'password'}
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position='end'>
                              <IconButton
                                edge='end'
                                onClick={handleClickShowPassword}
                                onMouseDown={e => e.preventDefault()}
                                aria-label='toggle password visibility'
                              >
                                <i className={isPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
                              </IconButton>
                            </InputAdornment>
                          )
                        }
                      }}
                      {...(errors.password && {
                        error: true,
                        helperText: errors.password.message
                      })}
                    />
                  )}
                />
              </Grid>
              <FormControlLabel
                control={<Checkbox />}
                label={
                  <>
                    <span>I agree to </span>
                    <Link className='text-primary' href='/' onClick={e => e.preventDefault()}>
                      privacy policy & terms
                    </Link>
                  </>
                }
              />
              <Button fullWidth variant='contained' type='submit' disabled={isLoading}>
                {isLoading ? 'Signing Up...' : 'Sign Up'}
              </Button>
              <div className='flex justify-center items-center flex-wrap gap-2'>
                <Typography>Already have an account?</Typography>
                <Typography component={Link} href={getLocalizedUrl('/login', locale as Locale)} color='primary.main'>
                  Sign in instead
                </Typography>
              </div>
              <Divider className='gap-2'>or</Divider>
              <div className='flex justify-center items-center gap-1.5'>
                <IconButton className='text-facebook' size='small'>
                  <i className='tabler-brand-facebook-filled' />
                </IconButton>
                <IconButton className='text-twitter' size='small'>
                  <i className='tabler-brand-twitter-filled' />
                </IconButton>
                <IconButton className='text-textPrimary' size='small'>
                  <i className='tabler-brand-github-filled' />
                </IconButton>
                <IconButton className='text-error' size='small'>
                  <i className='tabler-brand-google-filled' />
                </IconButton>
              </div>
            </Grid>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register
