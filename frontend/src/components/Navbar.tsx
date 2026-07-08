import { useState } from 'react'
import {
  AdminPanelSettingsRounded,
  CloseRounded,
  EventAvailableRounded,
  MenuRounded,
  PersonRounded,
  ShieldRounded,
} from '@mui/icons-material'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom'
import { isAuthenticated, logout } from '../services/auth'

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Track Booking', to: '/track-booking' },
  { label: 'Availability', to: '/#availability' },
  { label: 'Process', to: '/#booking-process' },
  { label: 'FAQ', to: '/#faq' },
]

const portalItems = [
  { label: 'Customer Login', to: '/customer/login', icon: PersonRounded, color: '#2E7D32' },
  { label: 'Operator Login', to: '/operator/login', icon: ShieldRounded, color: '#C9A227' },
  { label: 'Admin Login', to: '/admin/login', icon: AdminPanelSettingsRounded, color: '#163B2A' },
]

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const authenticated = isAuthenticated()

  const handleNavClick = (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, to: string) => {
    if (to === '/track-booking') {
      return
    }

    event.preventDefault()

    const targetHash = to === '/' ? '#hero' : to.substring(to.indexOf('#'))
    const targetId = targetHash.replace('#', '')

    if (location.pathname === '/') {
      const element = document.getElementById(targetId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      navigate('/' + targetHash)
    }
  }

  const handleLogout = () => {
    logout()
    setMobileOpen(false)
    navigate('/')
  }

  const closeMobile = () => {
    setMobileOpen(false)
  }

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(18px)',
        borderBottom: '1px solid rgba(17,24,39,0.08)',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: { xs: 68, md: 78 }, justifyContent: 'space-between', gap: 2 }}>
          <Stack component={RouterLink} to="/" direction="row" spacing={1.4} alignItems="center" sx={{ color: 'inherit', minWidth: 0 }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 3,
                display: 'grid',
                placeItems: 'center',
                bgcolor: 'rgba(46,125,50,0.10)',
                color: '#2E7D32',
                flexShrink: 0,
              }}
            >
              <EventAvailableRounded />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 850, fontSize: { xs: 19, md: 23 }, color: '#102319', lineHeight: 1 }}>
                CSD Smart
              </Typography>
              <Typography sx={{ fontSize: 11, color: 'text.secondary', letterSpacing: 0.8, fontWeight: 800 }}>
                SLOT BOOKING
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={0.4} sx={{ display: { xs: 'none', lg: 'flex' } }}>
            {navItems.map((item) => (
              <Button
                key={item.label}
                component={RouterLink}
                to={item.to}
                onClick={(e) => handleNavClick(e, item.to)}
                sx={{ color: '#26352C', px: 1.6 }}
              >
                {item.label}
              </Button>
            ))}
          </Stack>

          <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' } }}>
            {authenticated && location.pathname !== '/' ? (
              <Button variant="outlined" color="error" onClick={handleLogout}>
                Logout
              </Button>
            ) : (
              portalItems.map((item) => {
                const Icon = item.icon

                return (
                  <Button
                    key={item.label}
                    component={RouterLink}
                    to={item.to}
                    startIcon={<Icon />}
                    variant={item.label === 'Customer Login' ? 'contained' : 'outlined'}
                    sx={{
                      borderColor: `${item.color}55`,
                      color: item.label === 'Customer Login' ? '#fff' : item.color,
                      bgcolor: item.label === 'Customer Login' ? item.color : 'rgba(255,255,255,0.7)',
                      px: 2,
                      '&:hover': {
                        borderColor: item.color,
                        bgcolor: item.label === 'Customer Login' ? item.color : `${item.color}0D`,
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                )
              })
            )}
          </Stack>

          <IconButton
            aria-label="Open navigation menu"
            onClick={() => setMobileOpen(true)}
            sx={{
              display: { xs: 'inline-flex', md: 'none' },
              color: '#102319',
              border: '1px solid rgba(17,24,39,0.10)',
              borderRadius: 2,
            }}
          >
            <MenuRounded />
          </IconButton>
        </Toolbar>
      </Container>

      {mobileOpen && (
        <Drawer anchor="right" open={mobileOpen} onClose={closeMobile} PaperProps={{ sx: { width: 'min(86vw, 340px)' } }}>
          <Stack spacing={2} sx={{ p: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography fontWeight={850} color="#102319">
                Navigation
              </Typography>
              <IconButton aria-label="Close navigation menu" onClick={closeMobile}>
                <CloseRounded />
              </IconButton>
            </Stack>

            <Stack spacing={1}>
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  component={RouterLink}
                  to={item.to}
                  onClick={(e) => {
                    closeMobile()
                    handleNavClick(e, item.to)
                  }}
                  fullWidth
                  sx={{ justifyContent: 'flex-start', color: '#26352C' }}
                >
                  {item.label}
                </Button>
              ))}
            </Stack>

            <Divider />

            {authenticated && location.pathname !== '/' ? (
              <Button variant="outlined" color="error" onClick={handleLogout} fullWidth>
                Logout
              </Button>
            ) : (
              <Stack spacing={1}>
                {portalItems.map((item) => {
                  const Icon = item.icon

                  return (
                    <Button
                      key={item.label}
                      component={RouterLink}
                      to={item.to}
                      onClick={closeMobile}
                      startIcon={<Icon />}
                      fullWidth
                      variant={item.label === 'Customer Login' ? 'contained' : 'outlined'}
                      sx={{
                        justifyContent: 'flex-start',
                        borderColor: `${item.color}55`,
                        color: item.label === 'Customer Login' ? '#fff' : item.color,
                        bgcolor: item.label === 'Customer Login' ? item.color : '#fff',
                      }}
                    >
                      {item.label}
                    </Button>
                  )
                })}
              </Stack>
            )}
          </Stack>
        </Drawer>
      )}
    </AppBar>
  )
}
