'use client'

import { memo } from 'react'

// MUI Imports
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'

interface TableHeaderProps {
  showClassColumn: boolean
}

const SubmissionsTableHeader = memo(({ showClassColumn }: TableHeaderProps) => {
  return (
    <TableHead>
      <TableRow sx={{ bgcolor: 'var(--mui-palette-primary-dark)' }}>
        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Tên bài kiểm tra</TableCell>
        {showClassColumn && <TableCell sx={{ color: 'white', fontWeight: 600 }}>Lớp học</TableCell>}
        <TableCell align='center' sx={{ color: 'white', fontWeight: 600 }}>
          Điểm
        </TableCell>
        <TableCell align='center' sx={{ color: 'white', fontWeight: 600 }}>
          Số câu đúng
        </TableCell>
        <TableCell align='center' sx={{ color: 'white', fontWeight: 600 }}>
          Thời gian làm
        </TableCell>
        <TableCell align='center' sx={{ color: 'white', fontWeight: 600 }}>
          Ngày nộp
        </TableCell>
        <TableCell align='center' sx={{ color: 'white', fontWeight: 600 }}>
          Trạng thái
        </TableCell>
        <TableCell align='center' sx={{ color: 'white', fontWeight: 600 }}>
          Hành động
        </TableCell>
      </TableRow>
    </TableHead>
  )
})

SubmissionsTableHeader.displayName = 'SubmissionsTableHeader'

export default SubmissionsTableHeader
