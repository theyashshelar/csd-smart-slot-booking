import {
  AdminPanelSettingsRounded,
  ArrowForwardRounded,
  PersonRounded,
  ShieldRounded,
} from '@mui/icons-material'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { motion } from 'framer-motion'
import { Link as RouterLink } from 'react-router-dom'

const portals = [
  {
    title: 'Customer',
    icon: PersonRounded,
    color: '#2E7D32',
    description: 'Approved members can book slots, view QR tokens, track history, and manage their profile.',
    button: 'Customer Login',
    link: '/customer/login',
    items: ['Book slots', 'Booking history', 'Profile'],
  },
  {
    title: 'Operator',
    icon: ShieldRounded,
    color: '#C9A227',
    description: 'Operators can scan QR tokens, search bookings, manage check-ins, and clear the live queue.',
    button: 'Operator Login',
    link: '/operator/login',
    items: ['QR scanner', 'Search booking', 'Queue'],
  },
  {
    title: 'Admin',
    icon: AdminPanelSettingsRounded,
    color: '#163B2A',
    description: 'Administrators control members, slots, reports, exports, approvals, and system settings.',
    button: 'Admin Login',
    link: '/admin/login',
    items: ['Members', 'Slots', 'Reports'],
  },
]

export default function AccessPortal() {
  return (
    <Box component="section" id="portal" sx={{ px: { xs: 2, sm: 3 }, py: { xs: 7, md: 10 }, bgcolor: '#F8FAF8' }}>
      <Box sx={{ maxWidth: 1220, mx: 'auto' }}>
        <Stack spacing={1.4} alignItems="center" textAlign="center" sx={{ mb: 5 }}>
          <Chip label="Access portals" color="secondary" variant="outlined" />
          <Typography variant="h3" sx={{ color: '#102319', fontWeight: 850 }}>
            One system, three focused workspaces.
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 700, fontSize: 17, lineHeight: 1.7 }}>
            Each role enters through the existing authentication flow and sees only the tools required for that responsibility.
          </Typography>
        </Stack>

        <Grid container spacing={2.5}>
          {portals.map((portal, index) => {
            const Icon = portal.icon

            return (
              <Grid key={portal.title} size={{ xs: 12, md: 4 }}>
                <motion.div initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.45, delay: index * 0.07 }}>
                  <Card sx={{ height: '100%', borderRadius: 4 }}>
                    <CardContent sx={{ p: 3.5 }}>
                      <Stack spacing={3}>
                        <Box
                          sx={{
                            width: 64,
                            height: 64,
                            borderRadius: 3,
                            display: 'grid',
                            placeItems: 'center',
                            bgcolor: `${portal.color}14`,
                            color: portal.color,
                          }}
                        >
                          <Icon sx={{ fontSize: 34 }} />
                        </Box>

                        <Stack spacing={1}>
                          <Typography variant="h5" fontWeight={850}>
                            {portal.title}
                          </Typography>
                          <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                            {portal.description}
                          </Typography>
                        </Stack>

                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          {portal.items.map((item) => (
                            <Chip key={item} label={item} size="small" variant="outlined" />
                          ))}
                        </Stack>

                        <Button
                          component={RouterLink}
                          to={portal.link}
                          variant="contained"
                          endIcon={<ArrowForwardRounded />}
                          sx={{
                            bgcolor: portal.color,
                            color: '#fff',
                            '&:hover': { bgcolor: portal.color },
                          }}
                        >
                          {portal.button}
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            )
          })}
        </Grid>
      </Box>
    </Box>
  )
}
