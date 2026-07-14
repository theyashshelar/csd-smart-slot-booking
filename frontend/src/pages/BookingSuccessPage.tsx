import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import QRCode from 'react-qr-code'
import {
  CheckCircleRounded,
  DashboardRounded,
  DownloadRounded,
  HistoryRounded,
  ReceiptLongRounded,
} from '@mui/icons-material'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import { formatTime12h, formatSlotLabel } from '../utils/timeFormatter'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

function formatDate(value?: string) {
  if (!value) return 'Not available'

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

export default function BookingSuccessPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const booking = location.state?.booking
  const slot = location.state?.slot
  const cardType = location.state?.cardType || booking?.cardType
  const bookingDate = location.state?.bookingDate || booking?.bookingDate

  if (!booking) {
    navigate('/customer/dashboard')
    return null
  }

  const bookingId = booking.id || booking.bookingId
  const qrUrl = `${apiBaseUrl}/qr/${booking.token}`

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: { xs: 3, md: 6 } }}>
      <Card sx={{ maxWidth: 980, width: '100%', borderRadius: 5, boxShadow: '0 30px 90px rgba(15,23,42,0.12)' }}>
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          <Stack spacing={4}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: 4,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: 'rgba(46,125,50,0.10)',
                    color: '#2E7D32',
                  }}
                >
                  <CheckCircleRounded sx={{ fontSize: 42 }} />
                </Box>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 850, color: '#102319', lineHeight: 1.05 }}>
                    Booking Confirmed
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 1 }}>
                    QR is now available for this confirmed booking.
                  </Typography>
                </Box>
              </Stack>

              <Chip color="success" label={booking.status || 'BOOKED'} sx={{ fontWeight: 850 }} />
            </Stack>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 7 }}>
                <Box
                  sx={{
                    height: '100%',
                    borderRadius: 4,
                    p: { xs: 3, md: 4 },
                    color: '#fff',
                    background: 'linear-gradient(135deg, #102319 0%, #1B5E20 62%, #C9A227 100%)',
                  }}
                >
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.72)', fontWeight: 850 }}>
                        Token Number
                      </Typography>
                      <Typography variant="h2" fontWeight={850}>
                        {booking.token}
                      </Typography>
                    </Box>

                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.24)' }} />

                    <Grid container spacing={1.5}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <SummaryTile label="Booking ID" value={bookingId ? `#${bookingId}` : 'Not available'} />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <SummaryTile label="Booking Date" value={formatDate(bookingDate)} />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <SummaryTile label="Booking Time" value={slot ? `${formatTime12h(slot.startTime)} – ${formatTime12h(slot.endTime)}` : formatSlotLabel(booking.slot) || 'Not available'} />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <SummaryTile label="Card Type" value={cardType || 'Not available'} />
                      </Grid>
                    </Grid>
                  </Stack>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 5 }}>
                <Card variant="outlined" sx={{ height: '100%', borderRadius: 4 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack spacing={2.5} alignItems="center" textAlign="center">
                      <Box sx={{ bgcolor: '#fff', p: 2.5, borderRadius: 3, border: '1px solid rgba(17,24,39,0.08)' }}>
                        <QRCode value={booking.token || ''} size={190} />
                      </Box>
                      <Box>
                        <Typography variant="h6" fontWeight={850}>
                          Download QR
                        </Typography>
                        <Typography color="text.secondary">
                          Present this QR at the operator desk for check-in.
                        </Typography>
                      </Box>
                      <Button
                        component="a"
                        href={qrUrl}
                        download={`${booking.token}.png`}
                        variant="contained"
                        startIcon={<DownloadRounded />}
                        fullWidth
                      >
                        Download QR
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center">
              <Button component={RouterLink} to="/customer/history" variant="outlined" startIcon={<ReceiptLongRounded />}>
                View Booking
              </Button>
              <Button component={RouterLink} to="/customer/history" variant="outlined" startIcon={<HistoryRounded />}>
                Booking History
              </Button>
              <Button component={RouterLink} to="/customer/dashboard" variant="contained" startIcon={<DashboardRounded />}>
                Dashboard
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ p: 1.8, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.16)' }}>
      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.70)', fontWeight: 850 }}>
        {label}
      </Typography>
      <Typography fontWeight={850}>{value}</Typography>
    </Box>
  )
}
