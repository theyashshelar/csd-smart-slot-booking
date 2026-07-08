import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

export default function Loader() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
      <CircularProgress color="primary" />
    </Box>
  )
}
