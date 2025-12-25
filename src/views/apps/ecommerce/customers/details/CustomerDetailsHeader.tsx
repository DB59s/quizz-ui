// MUI Imports
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import type { ButtonProps } from '@mui/material/Button'

// Type Imports
import type { ThemeColor } from '@core/types'

// Component Imports

const CustomerDetailHeader = ({ customerId }: { customerId: string }) => {
  return (
    <div className='flex flex-wrap justify-between max-sm:flex-col sm:items-center gap-x-6 gap-y-4'>
      <div className='flex flex-col items-start gap-1'>
        <Typography variant='h4'>{`Customer ID #${customerId}`}</Typography>
        <Typography>Aug 17, 2020, 5:48 (ET)</Typography>
      </div>
      <Button variant='tonal' color='error'>
        Delete Customer
      </Button>
    </div>
  )
}

export default CustomerDetailHeader
