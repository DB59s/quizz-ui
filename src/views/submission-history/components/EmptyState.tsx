'use client'

import { memo } from 'react'

// MUI Imports
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

// Lucide Icons
import { FileText } from 'lucide-react'

interface EmptyStateProps {
  classId?: string
}

const EmptyState = memo(({ classId }: EmptyStateProps) => {
  return (
    <Box className='flex flex-col items-center justify-center py-12 px-4'>
      <FileText size={48} style={{ color: '#9CA3AF', marginBottom: 12 }} />
      <Typography variant='h6' sx={{ fontWeight: 600, color: '#1F2937', mb: 1 }}>
        Chưa có bài nộp
      </Typography>
      <Typography variant='body2' sx={{ color: '#6B7280', textAlign: 'center', maxWidth: 400 }}>
        {classId
          ? 'Bạn chưa hoàn thành bài kiểm tra nào trong lớp này.'
          : 'Bạn chưa hoàn thành bài kiểm tra nào. Hãy tham gia các lớp học và làm bài tập.'}
      </Typography>
    </Box>
  )
})

EmptyState.displayName = 'EmptyState'

export default EmptyState
