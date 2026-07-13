import {
  ArrowForwardRounded,
  CalendarMonthRounded,
  GroupsRounded,
  LoginRounded,
  QrCode2Rounded,
  SearchRounded,
  ShieldRounded,
} from '@mui/icons-material'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import LinearProgress from '@mui/material/LinearProgress'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { motion } from 'framer-motion'
import { Link as RouterLink } from 'react-router-dom'
import type { LandingTotals } from '../../pages/LandingPage'
import type { LandingPageResponse } from '../../types/api'

type HeroSectionProps = {
  data: LandingPageResponse | null
  totals: LandingTotals
  loading: boolean
}

const formatNumber = (value?: number) =>
  typeof value === 'number' ? value.toLocaleString('en-IN') : '--'

export default function HeroSection({ data, totals, loading }: HeroSectionProps) {
  const occupancy = totals.capacity > 0 ? Math.round((totals.booked / totals.capacity) * 100) : 0

  return (
    <Box
      component="section"
      id="hero"
      sx={{
        px: { xs: 2, sm: 3 },
        pt: { xs: 8, md: 11 },
        pb: { xs: 8, md: 12 },
        background:
          'radial-gradient(circle at 12% 8%, rgba(46,125,50,0.14), transparent 30%), radial-gradient(circle at 86% 18%, rgba(201,162,39,0.15), transparent 28%), linear-gradient(180deg, #FFFFFF 0%, #F8FAF8 100%)',
      }}
    >
      <Box sx={{ maxWidth: 1220, mx: 'auto' }}>
        <Grid container spacing={{ xs: 5, md: 7 }} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
              <Stack spacing={3.5}>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip icon={<ShieldRounded />} label="Authenticated booking" color="success" variant="outlined" />
                  <Chip icon={<QrCode2Rounded />} label="QR after confirmation" color="primary" variant="outlined" />
                  <Chip icon={<CalendarMonthRounded />} label="Live slot capacity" color="secondary" variant="outlined" />
                </Stack>

                <Stack spacing={2}>
                  <Typography
                    component="h1"
                    sx={{
                      maxWidth: 760,
                      color: '#102319',
                      fontSize: { xs: 42, sm: 54, md: 72 },
                      fontWeight: 850,
                      lineHeight: 1,
                    }}
                  >
                    CSD Smart Slot Booking
                  </Typography>

                  <Typography
                    variant="h6"
                    sx={{
                      maxWidth: 640,
                      color: 'text.secondary',
                      fontWeight: 500,
                      lineHeight: 1.75,
                    }}
                  >
                    A secure government SaaS portal for approved members to reserve canteen slots, track bookings, and move through the queue with verified QR tokens.
                  </Typography>
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <Button
                    component={RouterLink}
                    to="/customer/login"
                    size="large"
                    variant="contained"
                    color="success"
                    startIcon={<LoginRounded />}
                    endIcon={<ArrowForwardRounded />}
                    sx={{ minHeight: 52 }}
                  >
                    Customer Login
                  </Button>

                  <Button
                    component={RouterLink}
                    to="/track-booking"
                    size="large"
                    variant="outlined"
                    color="success"
                    startIcon={<SearchRounded />}
                    sx={{ minHeight: 52, bgcolor: 'rgba(255,255,255,0.78)' }}
                  >
                    Track Booking
                  </Button>
                </Stack>

                <Grid container spacing={1.5} sx={{ maxWidth: 640 }}>
                  {[
                    { label: 'Registered members', value: formatNumber(data?.registeredMembers), icon: GroupsRounded },
                    { label: "Today's bookings", value: formatNumber(data?.todayBookings), icon: CalendarMonthRounded },
                    { label: 'Available seats', value: formatNumber(totals.available), icon: ShieldRounded },
                  ].map((item) => {
                    const Icon = item.icon

                    return (
                      <Grid key={item.label} size={{ xs: 12, sm: 4 }}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            height: '100%',
                            border: '1px solid rgba(17,24,39,0.08)',
                            borderRadius: 4,
                            bgcolor: 'rgba(255,255,255,0.78)',
                            boxShadow: '0 18px 40px rgba(15,23,42,0.06)',
                          }}
                        >
                          <Stack spacing={1}>
                            <Icon sx={{ color: '#2E7D32' }} />
                            <Typography variant="h5" fontWeight={850}>
                              {loading ? '--' : item.value}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" fontWeight={750}>
                              {item.label}
                            </Typography>
                          </Stack>
                        </Paper>
                      </Grid>
                    )
                  })}
                </Grid>
              </Stack>
            </motion.div>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.08 }}>
              <Paper
                elevation={0}
                sx={{
                  overflow: 'hidden',
                  borderRadius: 5,
                  border: '1px solid rgba(17,24,39,0.08)',
                  bgcolor: 'rgba(255,255,255,0.84)',
                  boxShadow: '0 30px 90px rgba(17,24,39,0.14)',
                  backdropFilter: 'blur(18px)',
                }}
              >
                <Box sx={{ px: 2.5, py: 1.6, borderBottom: '1px solid rgba(17,24,39,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#FFFFFF' }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#2E7D32' }} />
                    <Typography fontWeight={850}>Live availability</Typography>
                  </Stack>
                  <Chip label="Live Updates" size="small" color="success" variant="outlined" />
                </Box>

                <Stack spacing={3} sx={{ p: { xs: 2.5, md: 3.5 } }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 4,
                      color: '#fff',
                      background: 'linear-gradient(135deg, #102319 0%, #1B5E20 58%, #C9A227 100%)',
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={3}>
                      <Stack spacing={1}>
                        <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.74)', fontWeight: 850 }}>
                          Current utilization
                        </Typography>
                        <Typography variant="h3" fontWeight={850}>
                          {loading ? '--' : `${occupancy}%`}
                        </Typography>
                      </Stack>
                      <Box
                        sx={{
                          width: 96,
                          height: 96,
                          borderRadius: 4,
                          display: 'grid',
                          placeItems: 'center',
                          bgcolor: 'rgba(255,255,255,0.16)',
                          border: '1px solid rgba(255,255,255,0.22)',
                        }}
                      >
                        <QrCode2Rounded sx={{ fontSize: 58, opacity: 0.95 }} />
                      </Box>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={occupancy}
                      sx={{
                        mt: 3,
                        height: 10,
                        borderRadius: 99,
                        bgcolor: 'rgba(255,255,255,0.26)',
                        '& .MuiLinearProgress-bar': { bgcolor: '#FFFFFF' },
                      }}
                    />
                  </Paper>

                  <Grid container spacing={1.5}>
                    {[
                      ['Active slots', totals.activeSlots],
                      ['Booked seats', totals.booked],
                      ['Total capacity', totals.capacity],
                    ].map(([label, value]) => (
                      <Grid key={label} size={{ xs: 12, sm: 4 }}>
                        <Box sx={{ p: 2, borderRadius: 3, bgcolor: '#F7FAF7', border: '1px solid rgba(46,125,50,0.10)' }}>
                          <Typography variant="h5" fontWeight={850}>
                            {loading ? '--' : formatNumber(Number(value))}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" fontWeight={750}>
                            {label}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Stack>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}
