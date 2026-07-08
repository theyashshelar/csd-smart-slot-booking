import {
  AccountCircleRounded,
  FactCheckRounded,
  HistoryRounded,
  LockRounded,
  QrCode2Rounded,
  SpeedRounded,
} from '@mui/icons-material'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

const benefits = [
  {
    title: 'Authenticated customer booking',
    body: 'Only approved customers can reserve slots from the protected customer portal.',
    icon: LockRounded,
  },
  {
    title: 'Transparent capacity',
    body: 'Customers see slot capacity, booked count, remaining seats, and status before confirming.',
    icon: FactCheckRounded,
  },
  {
    title: 'QR after confirmation',
    body: 'The QR token appears only after the booking is successfully created by the backend.',
    icon: QrCode2Rounded,
  },
  {
    title: 'Cleaner queue operations',
    body: 'Operators can scan, search, check in, check out, and maintain the queue from one console.',
    icon: SpeedRounded,
  },
  {
    title: 'Self-service history',
    body: 'Members can revisit booking status, dates, tokens, and profile information at any time.',
    icon: HistoryRounded,
  },
  {
    title: 'Role-specific portals',
    body: 'Customers, operators, and admins keep separate workflows with the existing role model.',
    icon: AccountCircleRounded,
  },
]

export default function FeaturesSection() {
  return (
    <Box component="section" id="why-csd-smart" sx={{ px: { xs: 2, sm: 3 }, py: { xs: 7, md: 10 }, bgcolor: '#F8FAF8' }}>
      <Box sx={{ maxWidth: 1220, mx: 'auto' }}>
        <Stack spacing={1.4} alignItems="center" textAlign="center" sx={{ mb: 5 }}>
          <Chip label="Why choose CSD Smart" color="secondary" variant="outlined" />
          <Typography variant="h3" sx={{ color: '#102319', fontWeight: 850 }}>
            Built for disciplined daily operations.
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 720, fontSize: 17, lineHeight: 1.7 }}>
            A premium front office for a practical backend: verified users, live slots, traceable bookings, and focused role workflows.
          </Typography>
        </Stack>

        <Grid container spacing={2.5}>
          {benefits.map((feature) => {
            const Icon = feature.icon

            return (
              <Grid key={feature.title} size={{ xs: 12, sm: 6, lg: 4 }}>
                <Card sx={{ height: '100%', borderRadius: 4 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack spacing={2.2}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 3,
                          display: 'grid',
                          placeItems: 'center',
                          bgcolor: 'rgba(46,125,50,0.10)',
                          color: '#2E7D32',
                        }}
                      >
                        <Icon />
                      </Box>
                      <Typography variant="h6" fontWeight={850}>
                        {feature.title}
                      </Typography>
                      <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                        {feature.body}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      </Box>
    </Box>
  )
}
