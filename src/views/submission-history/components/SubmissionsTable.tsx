'use client'

import { memo } from 'react'

// MUI Imports
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableContainer from '@mui/material/TableContainer'
import Paper from '@mui/material/Paper'

// Component Imports
import SubmissionsTableHeader from './SubmissionsTableHeader'
import SubmissionRow from './SubmissionRow'

// Service Imports
import type { Submission } from '@/services/submission.service'

interface SubmissionsTableProps {
  submissions: Submission[]
  showClassColumn: boolean
  formatDate: (dateString: string) => string
  formatTime: (seconds: number) => string
  getScoreColor: (score: number) => string
  onViewResult: (submissionId: string) => void
}

const SubmissionsTable = memo(({
  submissions,
  showClassColumn,
  formatDate,
  formatTime,
  getScoreColor,
  onViewResult
}: SubmissionsTableProps) => {
  return (
    <TableContainer component={Paper} elevation={0}>
      <Table>
        <SubmissionsTableHeader showClassColumn={showClassColumn} />
        <TableBody>
          {submissions.map((submission, index) => (
            <SubmissionRow
              key={submission.submission_id}
              submission={submission}
              index={index}
              showClassColumn={showClassColumn}
              formatDate={formatDate}
              formatTime={formatTime}
              getScoreColor={getScoreColor}
              onViewResult={onViewResult}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
})

SubmissionsTable.displayName = 'SubmissionsTable'

export default SubmissionsTable
