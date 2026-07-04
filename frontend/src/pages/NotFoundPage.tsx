import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { HomeRounded } from '@mui/icons-material'
import { Link as RouterLink } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
      <Card sx={{ maxWidth: 560, width: '100%', textAlign: 'center' }}>
        <CardContent>
          <Typography variant="h1" sx={{ fontWeight: 800, color: 'primary.main' }}>404</Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Page not found</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>The requested route does not exist in the CSD portal.</Typography>
          <Button component={RouterLink} to="/" variant="contained" startIcon={<HomeRounded />}>Return Home</Button>
        </CardContent>
      </Card>
    </Box>
  )
}
