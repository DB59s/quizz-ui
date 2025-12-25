'use client'

// MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import Chip from '@mui/material/Chip'

type ClassInfo = {
  id: string
  name: string
  code: string
  teacher: string
  description: string
  maxStudents: number
  currentStudents: number
}

const ClassOverview = ({ classInfo }: { classInfo: ClassInfo }) => {
  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={4}>
        {/* Class Information */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" className="font-semibold mb-4">
                Thông tin lớp học
              </Typography>
              
              <div className="flex flex-col gap-3">
                <div>
                  <Typography variant="body2" color="text.secondary" className="mb-1">
                    Tên lớp học
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {classInfo.name}
                  </Typography>
                </div>

                <div>
                  <Typography variant="body2" color="text.secondary" className="mb-1">
                    Mã lớp
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {classInfo.code}
                  </Typography>
                </div>

                <div>
                  <Typography variant="body2" color="text.secondary" className="mb-1">
                    Giáo viên
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {classInfo.teacher}
                  </Typography>
                </div>

                <div>
                  <Typography variant="body2" color="text.secondary" className="mb-1">
                    Mô tả
                  </Typography>
                  <Typography variant="body1">
                    {classInfo.description}
                  </Typography>
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>

        {/* Statistics */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined" sx={{ bgcolor: '#F0F9FF' }}>
            <CardContent>
              <Typography variant="h6" className="font-semibold mb-4">
                Thống kê
              </Typography>
              
              <div className="flex flex-col gap-4">
                <div>
                  <Typography variant="body2" color="text.secondary" className="mb-2">
                    Số lượng học sinh
                  </Typography>
                  <Box className="flex items-center gap-2">
                    <Typography variant="h4" className="font-bold" sx={{ color: '#1E40AF' }}>
                      {classInfo.currentStudents}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      / {classInfo.maxStudents}
                    </Typography>
                  </Box>
                </div>

                <div>
                  <Typography variant="body2" color="text.secondary" className="mb-2">
                    Trạng thái
                  </Typography>
                  <Chip
                    label="Đang hoạt động"
                    color="success"
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default ClassOverview
