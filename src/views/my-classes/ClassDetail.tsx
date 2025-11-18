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

// Service Imports
import { classService } from '@/services/class.service'

// Cache Imports
import { cacheManager, CACHE_KEYS, CACHE_DURATION } from '@/utils/cacheManager'

type ClassInfo = {
  id: string
  name: string
  code: string
  teacher: string
  description: string
  maxStudents: number
  currentStudents: number
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
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
      return savedTab ? parseInt(savedTab, 10) : 0
    }
    return 0
  })

  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Fetch class info when classId changes
    fetchClassInfo()
  }, [classId])

  useEffect(() => {
    // Save active tab to sessionStorage whenever it changes
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`classDetail_tab_${classId}`, tabValue.toString())
    }
  }, [tabValue, classId])

  const fetchClassInfo = async () => {
    setLoading(true)
    setError(null)

    try {
      // Try to get from cache first
      const cachedApplications = cacheManager.get<any[]>(CACHE_KEYS.STUDENT_APPLICATIONS)
      let foundClass = cachedApplications?.find((app: any) => app.class._id === classId)

      // If not in cache, fetch from API
      if (!foundClass) {
        const response = await classService.getStudentApplications()

        if (response.success && response.data?.classes) {
          foundClass = response.data.classes.find((app: any) => app.class._id === classId)
          // Cache the applications
          cacheManager.set(CACHE_KEYS.STUDENT_APPLICATIONS, response.data.classes, CACHE_DURATION.MEDIUM)
        }
      }

      if (foundClass) {
        // Check cache for class info
        const cacheKey = CACHE_KEYS.CLASS_BY_CODE(foundClass.class.class_code)
        let classRes = cacheManager.get(cacheKey)

        if (!classRes) {
          // If not in cache, fetch from API
          const apiResponse = await classService.getClassByCode(foundClass.class.class_code)
          classRes = apiResponse
          // Cache the result
          cacheManager.set(cacheKey, apiResponse, CACHE_DURATION.LONG)
        }

        setClassInfo({
          id: foundClass.class._id,
          name: foundClass.class.name,
          code: foundClass.class.class_code,
          teacher: classRes?.data?.teacher?.full_name || 'Chưa có thông tin',
          description: foundClass.class.description || 'Không có mô tả',
          maxStudents: foundClass.class.max_students,
          currentStudents: foundClass.class.current_students
        })
      } else {
        setError('Không tìm thấy thông tin lớp học')
      }
    } catch (err: any) {
      console.error('Error fetching class info:', err)
      setError(err?.response?.data?.message || 'Đã xảy ra lỗi khi tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleBack = () => {
    // Clear the sessionStorage key so ClassCard doesn't auto-redirect
    sessionStorage.removeItem('lastViewedClassId')
    router.push(`/${lang}/my-classes`)
  }

  if (loading) {
    return (
      <Box className="flex justify-center items-center p-8">
        <CircularProgress />
      </Box>
    )
  }

  if (error || !classInfo) {
    return (
      <Box>
        <Alert severity="error">{error || 'Không tìm thấy thông tin lớp học'}</Alert>
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box className="flex items-center gap-4 mb-6">
        <IconButton
          onClick={handleBack}
          sx={{
            bgcolor: 'var(--mui-palette-primary-dark)',
            borderRadius: 1,
            color: 'white',
            '&:hover': { bgcolor: 'var(--mui-palette-primary-dark)' },
          }}
        >
          <i className="tabler-arrow-left" />
        </IconButton>
        <div>
          <Typography variant="h5" className="font-semibold" sx={{ color: 'var(--mui-palette-primary-dark)' }}>
            {classInfo.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
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
            aria-label="class detail tabs"
            sx={{
              px: 3,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '1rem'
              }
            }}
          >
            <Tab label="Tổng quan" id="class-tab-0" aria-controls="class-tabpanel-0" />
            <Tab label="Bài tập" id="class-tab-1" aria-controls="class-tabpanel-1" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <ClassOverview classInfo={classInfo} />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <ClassAssignments classId={classId} isTabView={true} />
        </TabPanel>
      </Card>
    </Box>
  )
}

export default ClassDetail
