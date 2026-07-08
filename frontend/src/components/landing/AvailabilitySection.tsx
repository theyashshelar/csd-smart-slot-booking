import AccessTimeRounded from '@mui/icons-material/AccessTimeRounded'
import Inventory2Rounded from '@mui/icons-material/Inventory2Rounded'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import LinearProgress from '@mui/material/LinearProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { LandingTotals } from '../../pages/LandingPage'
import type { LandingPageResponse, Slot } from '../../types/api'

type AvailabilitySectionProps = {
  data: LandingPageResponse | null
  totals: LandingTotals
  loading: boolean
}

const getRemaining = (slot: Slot) => Math.max(slot.capacity - slot.bookedCount, 0)

export default function AvailabilitySection({ data, totals, loading }: AvailabilitySectionProps) {
  const slots = data?.availableSlots ?? []

  return (
    <Box component="section" id="availability" sx={{ px: { xs: 2, sm: 3 }, py: { xs: 7, md: 10 }, bgcolor: '#FFFFFF' }}>
      <Box sx={{ maxWidth: 1220, mx: 'auto' }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={3}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'flex-end' }}
          sx={{ mb: 4 }}
        >
          <Stack spacing={1.2} sx={{ maxWidth: 700 }}>
            <Chip label="Live backend data" color="success" variant="outlined" sx={{ width: 'fit-content' }} />
            <Typography variant="h3" sx={{ color: '#102319', fontWeight: 850 }}>
              Live Slot Availability
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: 17, lineHeight: 1.7 }}>
              Guests can view availability, but booking starts only after customer login.
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
            <Chip icon={<Inventory2Rounded />} label={`${totals.available} available`} color="success" />
            <Chip icon={<AccessTimeRounded />} label={`${totals.activeSlots} active slots`} variant="outlined" />
          </Stack>
        </Stack>

        {loading && <LinearProgress color="success" sx={{ borderRadius: 99, mb: 3 }} />}

        {!loading && slots.length === 0 && (
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight={850}>
                No active slots are available right now.
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Please check again later or contact the CSD support desk.
              </Typography>
            </CardContent>
          </Card>
        )}

        <Grid container spacing={2.5}>
          {slots.map((slot) => {
            const remaining = getRemaining(slot)
            const percent = slot.capacity > 0 ? Math.min((slot.bookedCount / slot.capacity) * 100, 100) : 0
            const full = remaining <= 0

            return (
              <Grid key={slot.id} size={{ xs: 12, md: 6, lg: 4 }}>
                <Card sx={{ height: '100%', borderRadius: 4, boxShadow: '0 18px 46px rgba(15,23,42,0.07)' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack spacing={2.5}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                        <Box>
                          <Typography variant="overline" color="text.secondary" fontWeight={850}>
                            {slot.cardType}
                          </Typography>
                          <Typography variant="h5" fontWeight={850}>
                            {slot.startTime} - {slot.endTime}
                          </Typography>
                        </Box>

                        <Chip
                          size="small"
                          color={full ? 'error' : remaining <= 5 ? 'warning' : 'success'}
                          label={full ? 'Full' : 'Open'}
                        />
                      </Stack>

                      <Stack spacing={1}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            {slot.label}
                          </Typography>
                          <Typography variant="body2" fontWeight={850}>
                            {remaining} remaining
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={percent}
                          color={full ? 'error' : 'success'}
                          sx={{ height: 9, borderRadius: 99, bgcolor: '#EEF4EF' }}
                        />
                      </Stack>

                      <Grid container spacing={1}>
                        {[
                          ['Capacity', slot.capacity],
                          ['Booked', slot.bookedCount],
                          ['Available', remaining],
                        ].map(([label, value]) => (
                          <Grid key={label} size={4}>
                            <Box sx={{ p: 1.3, borderRadius: 3, bgcolor: '#F8FAF8', border: '1px solid rgba(46,125,50,0.10)' }}>
                              <Typography fontWeight={850}>{value}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {label}
                              </Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
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
