// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import type { TypographyProps } from '@mui/material/Typography'

// Type Imports
import type { ThemeColor } from '@core/types'

// Component Imports

// Vars
const data = {
  firstName: 'Roker',
  lastName: 'Terrace',
  email: 'sbaser0@boston.com',
  country: 'UK',
  address1: 'Latheronwheel',
  address2: 'KW5 8NW, London',
  landmark: 'Near Water Plant',
  city: 'London',
  state: 'Capholim',
  zipCode: '403114',
  taxId: 'TAX-875623',
  vatNumber: 'SDF754K77',
  contact: '+1 (609) 972-22-22'
}

const ShippingAddress = () => {
  return (
    <Card>
      <CardContent className='flex flex-col gap-6'>
        <div className='flex justify-between items-center'>
          <Typography variant='h5'>Shipping Address</Typography>
          <Typography color='primary' className='cursor-pointer font-medium'>
            Edit
          </Typography>
        </div>
        <div className='flex flex-col'>
          <Typography>45 Roker Terrace</Typography>
          <Typography>Latheronwheel</Typography>
          <Typography>KW5 8NW, London</Typography>
          <Typography>UK</Typography>
        </div>
      </CardContent>
    </Card>
  )
}

export default ShippingAddress
