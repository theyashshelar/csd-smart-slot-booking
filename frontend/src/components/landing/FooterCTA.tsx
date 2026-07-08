import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link as RouterLink } from 'react-router-dom'

export default function FooterCTA() {
  return (
    <Box component="section" id="cta" sx={{ px: { xs: 2, sm: 3 }, py: { xs: 7, md: 10 }, bgcolor: '#FFFFFF' }}>
      <Box
        sx={{
          maxWidth: 1220,
          mx: 'auto',
          borderRadius: 5,
          p: { xs: 3, md: 5 },
          color: '#fff',
          background: 'linear-gradient(135deg, #102319 0%, #1B5E20 60%, #C9A227 100%)',
          boxShadow: '0 28px 90px rgba(16,35,25,0.22)',
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between">
          <Box sx={{ maxWidth: 700 }}>
            <Typography variant="h3" fontWeight={850}>
              Start from the customer portal.
            </Typography>
            <Typography sx={{ mt: 1.3, color: 'rgba(255,255,255,0.78)', fontSize: 17, lineHeight: 1.7 }}>
              Sign in with your approved account to select a date, choose a card type, reserve a slot, and download your QR after confirmation.
            </Typography>
          </Box>

          <Button
            component={RouterLink}
            to="/customer/login"
            size="large"
            variant="contained"
            endIcon={<ArrowForwardRounded />}
            sx={{ bgcolor: '#fff', color: '#12301F', '&:hover': { bgcolor: '#F4F7F4' } }}
          >
            Customer Login
          </Button>
        </Stack>
      </Box>
    </Box>
  )
}
