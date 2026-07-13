import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
import { formatTime12h, formatSlotLabel } from '../../utils/timeFormatter'

type AvailabilitySectionProps = {
  data: LandingPageResponse | null
  totals: LandingTotals
  loading: boolean
}

const getRemaining = (slot: Slot) => Math.max(slot.capacity - slot.bookedCount, 0)

function getDisplayDate(dateObj: Date) {
  const weekdayStr = dateObj.toLocaleDateString('en-GB', { weekday: 'long' })
  const dayStr = dateObj.toLocaleDateString('en-GB', { day: 'numeric' })
  const monthStr = dateObj.toLocaleDateString('en-GB', { month: 'long' })
  const yearStr = dateObj.toLocaleDateString('en-GB', { year: 'numeric' })
  const formattedDate = `${weekdayStr}, ${dayStr} ${monthStr} ${yearStr}`

  const isToday = dateObj.toDateString() === new Date().toDateString()
  if (isToday) {
    return `Today • ${formattedDate}`
  }
  return formattedDate
}

export default function AvailabilitySection({ data, totals, loading }: AvailabilitySectionProps) {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'GROCERY' | 'LIQUOR'>('ALL')
  const slots = data?.availableSlots ?? []

  const allCount = slots.length
  const groceryCount = slots.filter((s) => s.cardType === 'GROCERY').length
  const liquorCount = slots.filter((s) => s.cardType === 'LIQUOR').length

  const filteredSlots = slots.filter((s) => {
    if (activeFilter === 'ALL') return true
    return s.cardType === activeFilter
  })

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
            <Chip label="Live Availability" color="success" variant="outlined" sx={{ width: 'fit-content' }} />
            <Typography variant="h3" sx={{ color: '#102319', fontWeight: 850 }}>
              Available Slots
            </Typography>
            <Typography variant="h6" sx={{ color: '#2E7D32', fontWeight: 700 }}>
              {getDisplayDate(new Date())}
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: 17, lineHeight: 1.7 }}>
              Guests can view availability before logging in.
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
            <Chip icon={<Inventory2Rounded />} label={`${totals.available} Seats Available`} color="success" />
            <Chip icon={<AccessTimeRounded />} label={`${totals.activeSlots} Time Slots`} variant="outlined" />
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

        {/* Segmented Filter */}
        {!loading && slots.length > 0 && (
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'flex-start' }}>
            <Stack
              direction="row"
              spacing={1}
              sx={{
                p: 0.6,
                borderRadius: '999px',
                bgcolor: '#F1F5F1',
                border: '1px solid rgba(46, 125, 50, 0.08)',
                width: { xs: '100%', sm: 'auto' },
                display: 'inline-flex'
              }}
            >
              {[
                { value: 'ALL', label: `All (${allCount})` },
                { value: 'GROCERY', label: `Grocery (${groceryCount})` },
                { value: 'LIQUOR', label: `Liquor (${liquorCount})` }
              ].map((filter) => {
                const isActive = activeFilter === filter.value
                return (
                  <Box
                    key={filter.value}
                    component="button"
                    onClick={() => setActiveFilter(filter.value as any)}
                    sx={{
                      px: { xs: 2.2, sm: 3 },
                      py: 1,
                      borderRadius: '999px',
                      fontSize: { xs: '0.85rem', sm: '0.9rem' },
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      outline: 'none',
                      bgcolor: isActive ? '#2E7D32' : 'transparent',
                      color: isActive ? '#FFFFFF' : '#4E5F52',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        color: isActive ? '#FFFFFF' : '#1B5E20',
                        bgcolor: isActive ? '#2E7D32' : 'rgba(46, 125, 50, 0.04)'
                      }
                    }}
                  >
                    {filter.label}
                  </Box>
                )
              })}
            </Stack>
          </Box>
        )}

        <Grid container spacing={2.5}>
          <AnimatePresence mode="popLayout">
            {filteredSlots.map((slot) => {
              const remaining = getRemaining(slot)
              const percent = slot.capacity > 0 ? Math.min((slot.bookedCount / slot.capacity) * 100, 100) : 0
              const full = remaining <= 0

              return (
                <Grid key={slot.id} size={{ xs: 12, md: 6, lg: 4 }}>
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    style={{ height: '100%' }}
                  >
                    <Card sx={{ height: '100%', borderRadius: 4, boxShadow: '0 18px 46px rgba(15,23,42,0.07)' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Stack spacing={2.5}>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                            <Box>
                              <Typography variant="overline" color="text.secondary" fontWeight={850}>
                                {slot.cardType}
                              </Typography>
                              <Typography variant="h5" fontWeight={850}>
                                {formatTime12h(slot.startTime)} – {formatTime12h(slot.endTime)}
                              </Typography>
                            </Box>

                            <Chip
                              size="small"
                              color={full ? 'error' : remaining <= 5 ? 'warning' : 'success'}
                              label={full ? 'Full' : 'Available'}
                            />
                          </Stack>

                          <Stack spacing={1}>
                            <Stack direction="row" justifyContent="space-between">
                              <Typography variant="body2" color="text.secondary">
                                {formatSlotLabel(slot.label)}
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
                  </motion.div>
                </Grid>
              )
            })}
          </AnimatePresence>
        </Grid>
      </Box>
    </Box>
  )
}
