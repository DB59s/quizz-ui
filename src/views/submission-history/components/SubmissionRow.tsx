'use client'

import { memo } from 'react'

// MUI Imports
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'

// Lucide Icons
import { Clock, Eye } from 'lucide-react'

// Service Imports
import type { Submission } from '@/services/submission.service'

interface SubmissionRowProps {
  submission: Submission
  index: number
  showClassColumn: boolean
  formatDate: (dateString: string) => string
  formatTime: (seconds: number) => string
  getScoreColor: (score: number) => string
  onViewResult: (submissionId: string) => void
}

const SubmissionRow = memo(({
  submission,
  index,
  showClassColumn,
  formatDate,
  formatTime,
  getScoreColor,
  onViewResult
}: SubmissionRowProps) => {
  return (
    <TableRow
      sx={{
        bgcolor: index % 2 === 0 ? 'white' : '#F9FAFB',
        '&:hover': { bgcolor: '#F3F4F6' }
      }}
    >
      <TableCell sx={{ py: 2.5 }}>
        <Typography variant='body2' className='font-medium'>
          {submission.quiz_name}
        </Typography>
      </TableCell>
      <TableCell align='center' sx={{ py: 2.5 }}>
        <Typography variant='body2' className='font-bold' sx={{ color: getScoreColor(submission.score) }}>
          {submission.score.toFixed(1)}
        </Typography>
      </TableCell>
      <TableCell align='center' sx={{ py: 2.5 }}>
        <Typography variant='body2'>{submission.n_total_true}</Typography>
      </TableCell>
      <TableCell align='center' sx={{ py: 2.5 }}>
        <Box className='flex items-center justify-center gap-1'>
          <Clock size={14} style={{ color: '#6B7280' }} />
          <Typography variant='body2' color='text.secondary'>
            {formatTime(submission.total_time)}
          </Typography>
        </Box>
      </TableCell>
      <TableCell align='center' sx={{ py: 2.5 }}>
        <Typography variant='body2' color='text.secondary'>
          {formatDate(submission.submission_time)}
        </Typography>
      </TableCell>
      <TableCell align='center' sx={{ py: 2.5 }}>
        <Chip
          label={submission.status === 'graded' ? 'Đã chấm' : 'Đang chấm'}
          size='small'
          color={submission.status === 'graded' ? 'success' : 'warning'}
        />
      </TableCell>
      <TableCell align='center' sx={{ py: 2.5 }}>
        <Tooltip title='Xem kết quả chi tiết'>
          <IconButton size='small' color='primary' onClick={() => onViewResult(submission.submission_id)}>
            <Eye size={18} />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  )
})

SubmissionRow.displayName = 'SubmissionRow'

export default SubmissionRow
