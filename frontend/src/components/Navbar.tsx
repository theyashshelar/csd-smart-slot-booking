import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { ShieldOutlined } from '@mui/icons-material'
import { Link as RouterLink } from 'react-router-dom'
import { isAuthenticated, logout, getRole } from '../services/auth'

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Book Slot', to: '/book-slot' },
  { label: 'Track', to: '/track-booking' },
  { label: 'Admin', to: '/admin/login' },
  { label: 'Operator', to: '/operator/login' },
]

export default function Navbar() {
  return (
    <AppBar position="sticky" color="transparent" elevation={0} sx={{ bgcolor: 'rgba(245,247,250,0.92)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(53,94,59,0.08)' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ py: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ flexGrow: 1 }}>
            <ShieldOutlined sx={{ color: 'primary.main', fontSize: 28 }} />
            <Box>
              <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700, lineHeight: 1.1 }}>
                CSD Smart Slot Booking
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Token Management System
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' } }}>
            {navItems.map((item) => (
              <Button key={item.to} component={RouterLink} to={item.to} color="inherit" sx={{ color: 'text.primary', fontWeight: 600 }}>
                {item.label}
              </Button>
            ))}
          </Stack>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            {isAuthenticated() ? (
              <Button onClick={() => { logout(); window.location.href = getRole() === 'OPERATOR' ? '/operator/login' : '/admin/login' }} color="inherit">Sign Out</Button>
            ) : (
              <Chip label="24/7 Support" color="secondary" variant="outlined" />
            )}
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  )
}
