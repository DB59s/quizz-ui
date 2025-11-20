'use client'

import { memo } from 'react'

// MUI Imports
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

// Lucide Icons
import { FileText } from 'lucide-react'

const SubmissionHistoryHeader = memo(() => {
  return (
    <Box className='mb-6'>
      <Box className='flex items-center gap-3 mb-2'>
        <FileText size={32} style={{ color: '#3B82F6' }} />
        <Typography variant='h4' className='font-bold'>
          Lịch sử nộp bài
        </Typography>
      </Box>
      <Typography variant='body1' color='text.secondary'>
        Xem lại tất cả các bài kiểm tra bạn đã hoàn thành
      </Typography>
    </Box>
  )
})

SubmissionHistoryHeader.displayName = 'SubmissionHistoryHeader'

export default SubmissionHistoryHeader
