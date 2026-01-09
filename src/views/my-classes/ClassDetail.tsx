'use client'

// React Imports
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

// Component Imports
import ClassOverview from './ClassOverview'
import ClassAssignments from './ClassAssignments'

// Hook Imports
import { useClassDetail } from '@/hooks/queries/useClassDetail'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`class-tabpanel-${index}`}
      aria-labelledby={`class-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

const ClassDetail = ({ classId }: { classId: string }) => {
  const router = useRouter()
  const params = useParams()
  const lang = (params?.lang as string) || 'en'

  // Initialize tabValue from sessionStorage or default to 0
  const [tabValue, setTabValue] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTab = sessionStorage.getItem(`classDetail_tab_${classId}`)
      const tabIndex = savedTab ? parseInt(savedTab, 10) : 0
      // Validate tab index (only 0 and 1 are valid now)
      return tabIndex > 1 ? 0 : tabIndex
    }
    return 0
  })

  // Use React Query hook for data fetching
  const { data: classInfo, isLoading, error } = useClassDetail(classId)

  // Save current classId to sessionStorage for navigation persistence
  useEffect(() => {
    if (classId) {
      sessionStorage.setItem('lastViewedClassId', classId)
    }
  }, [classId])

  // Save active tab to sessionStorage whenever it changes
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`classDetail_tab_${classId}`, newValue.toString())
    }
  }

  const handleBack = () => {
    // Clear the sessionStorage key so ClassCard doesn't auto-redirect
    sessionStorage.removeItem('lastViewedClassId')
    router.push(`/${lang}/my-classes`)
  }

  if (isLoading) {
    return (
      <Box className='flex justify-center items-center p-8'>
        <CircularProgress />
      </Box>
    )
  }

  if (error || !classInfo) {
    return (
      <Box>
        <Alert severity='error'>{error?.message || 'Không tìm thấy thông tin lớp học'}</Alert>
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box className='flex items-center gap-4 mb-6'>
        <IconButton
          onClick={handleBack}
          sx={{
            bgcolor: 'var(--mui-palette-primary-dark)',
            borderRadius: 1,
            color: 'white',
            '&:hover': { bgcolor: 'var(--mui-palette-primary-dark)' }
          }}
        >
          <i className='tabler-arrow-left' />
        </IconButton>
        <div>
          <Typography variant='h5' className='font-semibold' sx={{ color: 'var(--mui-palette-primary-dark)' }}>
            {classInfo.name}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Mã lớp: {classInfo.code} | Giáo viên: {classInfo.teacher}
          </Typography>
        </div>
      </Box>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label='class detail tabs'
            sx={{
              px: 3,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '1rem'
              }
            }}
          >
            <Tab label='Tổng quan' id='class-tab-0' aria-controls='class-tabpanel-0' />
            <Tab label='Bài tập' id='class-tab-1' aria-controls='class-tabpanel-1' />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <ClassOverview classInfo={classInfo} />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <ClassAssignments classId={classId} isTabView={true} isActive={tabValue === 1} />
        </TabPanel>
      </Card>
    </Box>
  )
}

export default ClassDetail
