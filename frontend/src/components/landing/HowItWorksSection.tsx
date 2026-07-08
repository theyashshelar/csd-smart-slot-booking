import {
  CalendarMonthRounded,
  CheckCircleRounded,
  DownloadRounded,
  LoginRounded,
  LocalMallRounded,
  QrCode2Rounded,
  StorefrontRounded,
  TimelapseRounded,
} from '@mui/icons-material'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { motion } from 'framer-motion'

const steps = [
  {
    title: 'Customer Login',
    body: 'Approved members sign in before any booking action is available.',
    icon: LoginRounded,
  },
  {
    title: 'Select Date',
    body: 'Choose the booking date supported by the current slot schedule.',
    icon: CalendarMonthRounded,
  },
  {
    title: 'Choose Card',
    body: 'Select Grocery or Liquor based on the member card registered in the profile.',
    icon: LocalMallRounded,
  },
  {
    title: 'Choose Slot',
    body: 'Review time, capacity, booked count, and remaining availability.',
    icon: TimelapseRounded,
  },
  {
    title: 'Booking Confirmed',
    body: 'The backend creates the booking and returns the confirmed token.',
    icon: CheckCircleRounded,
  },
  {
    title: 'Download QR',
    body: 'QR is available only after confirmation and can be used at the canteen.',
    icon: QrCode2Rounded,
  },
  {
    title: 'Visit Canteen',
    body: 'Operators scan the QR and complete check-in and check-out.',
    icon: StorefrontRounded,
  },
]

export default function HowItWorksSection() {
  return (
    <Box component="section" id="booking-process" sx={{ px: { xs: 2, sm: 3 }, py: { xs: 7, md: 10 }, bgcolor: '#FFFFFF' }}>
      <Box sx={{ maxWidth: 1220, mx: 'auto' }}>
        <Grid container spacing={4} alignItems="flex-start">
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={1.5} sx={{ position: { md: 'sticky' }, top: { md: 104 } }}>
              <Chip label="Booking process" color="success" variant="outlined" sx={{ width: 'fit-content' }} />
              <Typography variant="h3" sx={{ color: '#102319', fontWeight: 850 }}>
                A clear path from login to canteen visit.
              </Typography>
              <Typography color="text.secondary" sx={{ fontSize: 17, lineHeight: 1.7 }}>
                The customer experience follows the backend booking lifecycle without exposing anonymous booking.
              </Typography>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Stack spacing={2}>
              {steps.map((step, index) => {
                const Icon = step.icon
                const isGold = index === 2 || index === 5

                return (
                  <motion.div key={step.title} initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.35 }} transition={{ duration: 0.42, delay: index * 0.04 }}>
                    <Card sx={{ borderRadius: 4 }}>
                      <CardContent sx={{ p: 3 }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                          <Box
                            sx={{
                              width: 54,
                              height: 54,
                              borderRadius: 3,
                              display: 'grid',
                              placeItems: 'center',
                              bgcolor: isGold ? 'rgba(201,162,39,0.14)' : 'rgba(46,125,50,0.12)',
                              color: isGold ? '#A97900' : '#2E7D32',
                              flexShrink: 0,
                            }}
                          >
                            {index === 5 ? <DownloadRounded /> : <Icon />}
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="overline" color="text.secondary" fontWeight={850}>
                              Step {index + 1}
                            </Typography>
                            <Typography variant="h5" fontWeight={850}>
                              {step.title}
                            </Typography>
                            <Typography color="text.secondary" sx={{ mt: 0.6, lineHeight: 1.7 }}>
                              {step.body}
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}
