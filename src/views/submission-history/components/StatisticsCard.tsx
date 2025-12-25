'use client'

import { memo } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

// Lucide Icons
import { FileText } from 'lucide-react'

interface StatisticsCardProps {
  totalItems: number
}

const StatisticsCard = memo(({ totalItems }: StatisticsCardProps) => {
  return (
    <Card className='mb-6'>
      <CardContent>
        <Box className='flex items-center gap-3'>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: '#3B82F615',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FileText size={24} style={{ color: '#3B82F6' }} />
          </Box>
          <Box>
            <Typography variant='body2' color='text.secondary'>
              Tổng số bài đã nộp
            </Typography>
            <Typography variant='h5' className='font-bold' sx={{ color: '#3B82F6' }}>
              {totalItems}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
})

StatisticsCard.displayName = 'StatisticsCard'

export default StatisticsCard
