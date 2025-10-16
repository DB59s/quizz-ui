'use client'

// React Imports
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

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
  const [tabValue, setTabValue] = useState(0)
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchClassInfo()
  }, [classId])

  const fetchClassInfo = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await classService.getStudentApplications()

      if (response.success && response.data?.classes) {
        const foundClass = response.data.classes.find((app: any) => app.class._id === classId)
        
        if (foundClass) {
          // Fetch teacher info
          const classRes = await classService.getClassByCode(foundClass.class.class_code)
          
          setClassInfo({
            id: foundClass.class._id,
            name: foundClass.class.name,
            code: foundClass.class.class_code,
            teacher: classRes.data?.teacher?.full_name || 'Chưa có thông tin',
            description: foundClass.class.description || 'Không có mô tả',
            maxStudents: foundClass.class.max_students,
            currentStudents: foundClass.class.current_students
          })
        } else {
          setError('Không tìm thấy thông tin lớp học')
        }
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
    router.push('/my-classes')
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
          <Typography variant="h5" className="font-semibold" sx={{ color: '#1E40AF' }}>
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
