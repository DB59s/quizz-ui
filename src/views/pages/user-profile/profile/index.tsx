// MUI Imports
import Grid from '@mui/material/Grid2'

// Type Imports
import type { ProfileTabType } from '@/types/pages/profileTypes'

// Component Imports
import AboutOverview from './AboutOverview'

const ProfileTab = ({ data }: { data?: ProfileTabType }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <AboutOverview data={data} />
      </Grid>
    </Grid>
  )
}

export default ProfileTab
