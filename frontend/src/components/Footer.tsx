import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

export default function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: 'primary.main', color: 'white', py: 4, mt: 4 }}>
      <Container maxWidth="xl">
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>CSD Smart Slot Booking</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Secure, disciplined, and transparent canteen token management.</Typography>
          </Box>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>© 2026 Indian Army CSD Support Cell</Typography>
        </Stack>
      </Container>
    </Box>
  )
}
