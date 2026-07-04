import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { CheckCircleRounded, DownloadRounded, HomeRounded } from '@mui/icons-material'
import { Link as RouterLink, useLocation } from 'react-router-dom'

export default function BookingSuccessPage() {
  const location = useLocation()
  const booking = location.state?.booking

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <Card sx={{ maxWidth: 640, width: '100%', textAlign: 'center', p: 2 }}>
        <CardContent>
          <Stack spacing={3} sx={{ alignItems: 'center' }}>
            <CheckCircleRounded sx={{ fontSize: 80, color: 'success.main' }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>Booking Confirmed</Typography>
              <Typography color="text.secondary">Your slot has been reserved successfully. Please keep the token safe.</Typography>
            </Box>
            <Box sx={{ p: 3, borderRadius: 3, bgcolor: 'primary.main', color: 'white', width: '100%' }}>
              <Typography variant="caption">Token Number</Typography>
              <Typography variant="h3" sx={{ fontWeight: 800 }}>{booking?.token || 'Pending'}</Typography>
            </Box>
            <Box sx={{ width: 180, height: 180, borderRadius: 3, bgcolor: 'grey.100', display: 'grid', placeItems: 'center' }}>
              <Typography variant="h6">QR Code</Typography>
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button variant="contained" startIcon={<DownloadRounded />}>Download Token</Button>
              <Button component={RouterLink} to="/" variant="outlined" startIcon={<HomeRounded />}>Back Home</Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
