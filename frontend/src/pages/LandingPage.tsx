import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ArrowForwardRounded, EventAvailableRounded, QrCodeRounded, VerifiedRounded, MilitaryTechRounded } from '@mui/icons-material'
import { motion } from 'framer-motion'
import { Link as RouterLink } from 'react-router-dom'

const availability = [
  { time: '09:00-10:00', count: '18/30', status: 'Available', tone: 'success.main' },
  { time: '10:00-11:00', count: '29/30', status: 'Almost Full', tone: 'warning.main' },
  { time: '11:00-12:00', count: '30/30', status: 'Full', tone: 'error.main' },
]

const features = [
  { title: 'Instant Verification', text: 'Fast card and mobile validation at the counter.' },
  { title: 'Live Capacity', text: 'Monitors slot occupancy in real time.' },
  { title: 'Token Transparency', text: 'Downloadable QR tokens with digital records.' },
]

export default function LandingPage() {
  return (
    <Box>
      <Grid container spacing={4} sx={{ py: { xs: 2, md: 4 }, alignItems: 'center' }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Stack spacing={2.5}>
              <Chip label="Secure CSD Queue Management" color="secondary" sx={{ width: 'fit-content' }} />
              <Typography variant="h2" sx={{ fontSize: { xs: '2.2rem', md: '3.4rem' }, lineHeight: 1.1 }}>
                Premium token management for disciplined service at the canteen.
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 680 }}>
                Reserve your slot, manage queue flow, and keep every visit organized with the smart booking experience built for the CSD network.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button component={RouterLink} to="/book-slot" variant="contained" size="large" endIcon={<ArrowForwardRounded />}>Book Slot</Button>
                <Button component={RouterLink} to="/track-booking" variant="outlined" size="large">Track Booking</Button>
              </Stack>
            </Stack>
          </motion.div>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <Card sx={{ p: 2, borderRadius: 4 }}>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <MilitaryTechRounded color="primary" />
                    <Typography variant="h6">Today’s Slot Availability</Typography>
                  </Stack>
                  {availability.map((slot) => (
                    <Box key={slot.time} sx={{ p: 2, borderRadius: 3, bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200' }}>
                      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography fontWeight={700}>{slot.time}</Typography>
                        <Typography color={slot.tone as 'success' | 'warning' | 'error'} fontWeight={700}>{slot.count}</Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary">{slot.status}</Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      <Box sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>Why CSD teams rely on this platform</Typography>
        <Grid container spacing={3}>
          {features.map((feature) => (
            <Grid size={{ xs: 12, md: 4 }} key={feature.title}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Stack spacing={1.5}>
                    <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: 'primary.light', display: 'grid', placeItems: 'center', color: 'primary.main' }}>
                      {feature.title.includes('Verification') ? <VerifiedRounded /> : feature.title.includes('Capacity') ? <EventAvailableRounded /> : <QrCodeRounded />}
                    </Box>
                    <Typography variant="h6">{feature.title}</Typography>
                    <Typography color="text.secondary">{feature.text}</Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  )
}
