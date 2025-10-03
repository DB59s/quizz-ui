import { styled } from '@mui/material/styles'

import { InputLabel } from '@mui/material'

const CustomInputLabel = styled(InputLabel)(({ theme }) => ({
  '&.Mui-required': {
    '& > .MuiInputLabel-asterisk': {
      color: theme.palette.error.main
    }
  },
  '&.MuiFormLabel-colorPrimary': {
    color: '#000000',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '4px'
  }
}))

export default CustomInputLabel
