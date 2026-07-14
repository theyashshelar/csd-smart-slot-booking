import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { toast } from 'react-hot-toast'
import {
  AccessTimeRounded,
  ArrowForwardRounded,
  CalendarMonthRounded,
  CheckCircleRounded,
  CreditCardRounded,
  LiquorRounded,
  LocalMallRounded,
  PersonRounded,
} from '@mui/icons-material'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Grid'
import LinearProgress from '@mui/material/LinearProgress'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Stepper from '@mui/material/Stepper'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { formatTime12h, formatSlotLabel } from '../../utils/timeFormatter'
import {
  createBooking,
  getCustomerProfile,
  getSlots,
  getSettings,
} from '../../services/api'
import type { CustomerProfile, Slot, SettingsItem } from '../../types/api'

type CardType = 'GROCERY' | 'LIQUOR'

const steps = ['Member', 'Date', 'Card', 'Slot', 'Review']

const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })

function getRemaining(slot: Slot) {
  return Math.max(slot.capacity - slot.bookedCount, 0)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

export default function CustomerBookSlotPage() {
  const navigate = useNavigate()
  const memberId = Number(localStorage.getItem('memberId'))

  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [bookingDate, setBookingDate] = useState(today)
  const [cardType, setCardType] = useState<CardType | null>(null)
  const [slots, setSlots] = useState<Slot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [booking, setBooking] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [error, setError] = useState('')
  const [settings, setSettings] = useState<Record<string, string>>({})

  const bookingWindowDays = settings.bookingWindow ? parseInt(settings.bookingWindow, 10) : 7
  const maxDateObj = new Date(new Date(today + 'T00:00:00').getTime() + bookingWindowDays * 24 * 60 * 60 * 1000)
  const maxDate = maxDateObj.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })

  useEffect(() => {
    let mounted = true
    getSettings()
      .then((res) => {
        if (mounted) {
          const mapped = ((res.data || []) as SettingsItem[]).reduce<Record<string, string>>((acc, item) => {
            if (item.keyName) acc[item.keyName] = item.settingValue || ''
            return acc
          }, {})
          setSettings(mapped)
        }
      })
      .catch((err) => console.error('Failed to load settings in booking', err))

    return () => {
      mounted = false
    }
  }, [])

  const holidayOrDisabledReason = useMemo(() => {
    if (!bookingDate) return null

    // 1. Check booking enabled
    const bookingEnabled = settings.BOOKING_ENABLED !== 'false'
    if (!bookingEnabled) {
      return 'Booking is currently offline/disabled.'
    }

    // 2. Check weekly holidays
    const weeklyHolidays = settings.weeklyHolidays
      ? settings.weeklyHolidays.split(',').map((d) => d.trim()).filter(Boolean)
      : ['Sunday']
    const selectedDateObj = new Date(`${bookingDate}T00:00:00`)
    const dayOfWeek = selectedDateObj.toLocaleDateString('en-US', { weekday: 'long' })
    if (weeklyHolidays.includes(dayOfWeek)) {
      return `Selected date is a Weekly Holiday ${dayOfWeek}.`
    }

    // 3. Check special holidays
    const specialHolidays = settings.specialHolidays
      ? settings.specialHolidays.split(',').map((d) => d.trim()).filter(Boolean)
      : []
    if (specialHolidays.includes(bookingDate)) {
      return 'Selected date is a Special Holiday.'
    }

    return null
  }, [bookingDate, settings])

  useEffect(() => {
    let mounted = true

    if (!memberId) {
      setError('Unable to identify logged-in customer. Please login again.')
      setLoadingProfile(false)
      return
    }

    getCustomerProfile(memberId)
      .then((response) => {
        if (mounted) {
          setProfile(response.data)
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err?.response?.data?.message || 'Unable to load member details.')
        }
      })
      .finally(() => {
        if (mounted) {
          setLoadingProfile(false)
        }
      })

    return () => {
      mounted = false
    }
  }, [memberId])

  useEffect(() => {
    if (!cardType || !bookingDate || holidayOrDisabledReason) {
      setSlots([])
      setSelectedSlot(null)
      return
    }

    let mounted = true

    setLoadingSlots(true)
    setError('')
    setSelectedSlot(null)

    getSlots(cardType, bookingDate)
      .then((response) => {
        if (mounted) {
          setSlots(response.data || [])
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err?.response?.data?.message || 'Unable to load slots for the selected date.')
        }
      })
      .finally(() => {
        if (mounted) {
          setLoadingSlots(false)
        }
      })

    return () => {
      mounted = false
    }
  }, [bookingDate, cardType, holidayOrDisabledReason])

  const activeStep = useMemo(() => {
    if (reviewOpen) return 4
    if (selectedSlot) return 4
    if (cardType) return 3
    if (bookingDate) return 2
    if (profile) return 1
    return 0
  }, [bookingDate, cardType, profile, reviewOpen, selectedSlot])

  const cardOptions = [
    {
      type: 'GROCERY' as const,
      title: 'Grocery Card',
      number: profile?.groceryCardNumber,
      icon: LocalMallRounded,
      color: '#2E7D32',
    },
    {
      type: 'LIQUOR' as const,
      title: 'Liquor Card',
      number: profile?.liquorCardNumber,
      icon: LiquorRounded,
      color: '#C9A227',
    },
  ]

  const confirmBooking = async () => {
    if (!selectedSlot || !cardType || !bookingDate) {
      setError('Please select booking date, card type, and slot.')
      toast.error('Please select booking date, card type, and slot.')
      return
    }

    try {
      setBooking(true)
      setError('')

      const response = await createBooking({
        memberId,
        slotId: selectedSlot.id,
        cardType,
        bookingDate,
      })

      toast.success('Slot booked successfully!')
      navigate('/booking-success', {
        state: {
          booking: response.data,
          slot: selectedSlot,
          cardType,
          bookingDate,
        },
      })
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.response?.data || 'Booking failed.'
      setError(errMsg)
      toast.error(errMsg)
      setReviewOpen(false)
    } finally {
      setBooking(false)
    }
  }

  const filteredSlots = useMemo(() => {
    return slots.filter((slot) => slot.cardType === cardType)
  }, [slots, cardType])

  return (
    <Box>
      <Stack spacing={2}>
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', lg: 'center' }}
          spacing={1}
        >
          <Box>
            <Chip
              label="Authenticated booking"
              color="success"
              variant="outlined"
              size="small"
              sx={{ mb: 1, borderRadius: '999px', fontSize: '0.7rem' }}
            />
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>
              Book Your Slot
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Select a booking date, card type, available slot, and review everything before confirmation.
            </Typography>
          </Box>
        </Stack>

        {error && <Alert severity="error" sx={{ borderRadius: '10px' }}>{error}</Alert>}

        <Card sx={{ borderRadius: '12px', border: '1px solid #E5E7EB' }}>
          <CardContent sx={{ p: 2 }}>
            <Stepper activeStep={activeStep} alternativeLabel sx={{ display: { xs: 'none', md: 'flex' } }}>
              {steps.map((step) => (
                <Step key={step}>
                  <StepLabel>{step}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Card sx={{ height: '100%', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
              <CardContent sx={{ p: 2 }}>
                <SectionTitle icon={<PersonRounded />} title="Logged-in Member" />

                {loadingProfile ? (
                  <Stack spacing={1} sx={{ mt: 2 }}>
                    <Skeleton height={32} />
                    <Skeleton height={32} />
                    <Skeleton height={32} />
                  </Stack>
                ) : profile ? (
                  <Stack spacing={1} sx={{ mt: 2 }}>
                    <InfoRow label="Name" value={profile.fullName} />
                    <InfoRow label="Mobile" value={profile.mobileNumber} />
                    <InfoRow label="Status" value={profile.registrationStatus} />
                    <InfoRow label="Grocery Card" value={profile.groceryCardNumber || 'Not registered'} />
                    <InfoRow label="Liquor Card" value={profile.liquorCardNumber || 'Not registered'} />
                  </Stack>
                ) : (
                  <Alert severity="warning" sx={{ mt: 2, borderRadius: '10px' }}>
                    Member details are unavailable.
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, lg: 8 }}>
            <Card sx={{ borderRadius: '12px', border: '1px solid #E5E7EB' }}>
              <CardContent sx={{ p: 2 }}>
                <SectionTitle icon={<CalendarMonthRounded />} title="Select Booking Date" />
                <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5, mb: 1.5 }}>
                  Past dates are disabled. Booking window controls will be handled from admin settings in the next module.
                </Typography>

                <Grid container spacing={2} alignItems="center">
                  <Grid size={{ xs: 12, md: 5 }}>
                    <TextField
                      fullWidth
                      size="small"
                      type="date"
                      label="Booking Date"
                      value={bookingDate}
                      onChange={(event) => setBookingDate(event.target.value)}
                      slotProps={{ htmlInput: { min: today, max: maxDate, style: { borderRadius: '10px' } } }}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 7 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: '10px',
                        bgcolor: '#F9FAFB',
                        border: '1px solid #E5E7EB',
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        SELECTED DATE
                      </Typography>
                      <Typography variant="subtitle1" fontWeight={700} color="#111827">
                        {formatDate(bookingDate)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {holidayOrDisabledReason && (
                  <Alert severity="error" sx={{ mt: 2, borderRadius: '10px', fontWeight: 600 }}>
                    No slots available today due to holiday. {holidayOrDisabledReason}
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card sx={{ borderRadius: '12px', border: '1px solid #E5E7EB' }}>
          <CardContent sx={{ p: 2 }}>
            <SectionTitle icon={<CreditCardRounded />} title="Choose Card Type" />
            <Grid container spacing={2} sx={{ mt: 1.5 }}>
              {cardOptions.map((option) => {
                const Icon = option.icon
                const disabled = !option.number
                const selected = cardType === option.type

                return (
                  <Grid key={option.type} size={{ xs: 12, md: 6 }}>
                    <motion.div whileHover={disabled ? undefined : { y: -2 }}>
                      <Card
                        variant="outlined"
                        onClick={() => {
                          if (!disabled) setCardType(option.type)
                        }}
                        sx={{
                          cursor: disabled ? 'not-allowed' : 'pointer',
                          borderRadius: '12px',
                          borderColor: selected ? option.color : '#E5E7EB',
                          borderWidth: selected ? 2 : 1,
                          opacity: disabled ? 0.56 : 1,
                          bgcolor: selected ? `${option.color}0D` : '#FFFFFF',
                          boxShadow: selected ? '0 4px 12px rgba(0,0,0,0.02)' : 'none',
                        }}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box
                              sx={{
                                width: 44,
                                height: 44,
                                borderRadius: '10px',
                                display: 'grid',
                                placeItems: 'center',
                                bgcolor: `${option.color}14`,
                                color: option.color,
                              }}
                            >
                              <Icon sx={{ fontSize: 24 }} />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle1" fontWeight={700} color="#111827">
                                {option.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {option.number || 'No registered card'}
                              </Typography>
                            </Box>
                            {selected && <CheckCircleRounded sx={{ color: option.color }} />}
                          </Stack>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                )
              })}
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: '12px', border: '1px solid #E5E7EB' }}>
          <CardContent sx={{ p: 2 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 1.5 }}>
              <Box>
                <SectionTitle icon={<AccessTimeRounded />} title="Choose Available Slot" />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Showing availability for {cardType || 'selected card'} on {formatDate(bookingDate)}.
                </Typography>
              </Box>
              {cardType && (
                <Chip
                  label={cardType}
                  color={cardType === 'GROCERY' ? 'success' : 'warning'}
                  size="small"
                  sx={{ borderRadius: '999px' }}
                />
              )}
            </Stack>

            {!cardType && (
              <Alert severity="info" sx={{ borderRadius: '10px' }}>Select Grocery or Liquor to load available slots.</Alert>
            )}

            {loadingSlots && <LinearProgress color="success" sx={{ height: 4, borderRadius: 6 }} />}

            {!loadingSlots && cardType && filteredSlots.length === 0 && (
              <Alert severity="warning" sx={{ borderRadius: '10px' }}>No active slots are available for this card type and date.</Alert>
            )}

            <Grid container spacing={2} sx={{ mt: filteredSlots.length ? 0 : 1 }}>
              {filteredSlots.map((slot) => {
                const remaining = getRemaining(slot)
                const full = remaining <= 0
                const selected = selectedSlot?.id === slot.id
                const progress = slot.capacity > 0 ? Math.min((slot.bookedCount / slot.capacity) * 100, 100) : 0

                return (
                  <Grid key={slot.id} size={{ xs: 12, md: 6, xl: 4 }}>
                    <Card
                      variant="outlined"
                      onClick={() => {
                        if (!full && slot.active) setSelectedSlot(slot)
                      }}
                      sx={{
                        height: '100%',
                        borderRadius: '12px',
                        cursor: full ? 'not-allowed' : 'pointer',
                        borderColor: selected ? '#2E7D32' : '#E5E7EB',
                        borderWidth: selected ? 2 : 1,
                        bgcolor: selected ? 'rgba(46,125,50,0.04)' : '#FFFFFF',
                        opacity: full ? 0.62 : 1,
                        transition: 'all 0.2s',
                      }}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Stack spacing={1.5}>
                          <Stack direction="row" justifyContent="space-between" spacing={2}>
                            <Box>
                              <Typography variant="subtitle1" fontWeight={700} color="#111827">
                                {formatTime12h(slot.startTime)} – {formatTime12h(slot.endTime)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">{formatSlotLabel(slot.label)}</Typography>
                            </Box>
                            <Chip
                              size="small"
                              label={full ? 'Full' : `${remaining} left`}
                              color={full ? 'error' : remaining <= 5 ? 'warning' : 'success'}
                              sx={{ borderRadius: '999px', fontSize: '0.65rem', height: 18 }}
                            />
                          </Stack>

                          <LinearProgress
                            variant="determinate"
                            value={progress}
                            color={full ? 'error' : 'success'}
                            sx={{ height: 6, borderRadius: 6, bgcolor: '#EEF4EF' }}
                          />

                          <Grid container spacing={1}>
                            <Grid size={4}>
                              <MiniStat label="Capacity" value={slot.capacity} />
                            </Grid>
                            <Grid size={4}>
                              <MiniStat label="Booked" value={slot.bookedCount} />
                            </Grid>
                            <Grid size={4}>
                              <MiniStat label="Open" value={remaining} />
                            </Grid>
                          </Grid>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                )
              })}
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: '12px', border: '1px solid #E5E7EB' }}>
          <CardContent sx={{ p: 2 }}>
            <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', lg: 'center' }} spacing={2}>
              <Box>
                <Typography variant="subtitle1" fontWeight={700} color="#111827">
                  Review Booking
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Confirm only after checking member details, date, card type, and selected slot.
                </Typography>
              </Box>
              <Button
                variant="contained"
                disabled={!profile || !bookingDate || !cardType || !selectedSlot || Boolean(holidayOrDisabledReason)}
                endIcon={<ArrowForwardRounded />}
                onClick={() => setReviewOpen(true)}
                sx={{ height: 40 }}
              >
                Review & Confirm
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      <Dialog
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: '14px' } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Review Booking</DialogTitle>
        <DialogContent>
          <Stack spacing={1.2} sx={{ pt: 1 }}>
            <InfoRow label="Member" value={profile?.fullName || 'Unknown'} />
            <InfoRow label="Booking Date" value={formatDate(bookingDate)} />
            <InfoRow label="Card Type" value={cardType || 'Not selected'} />
            <InfoRow label="Booking Time" value={selectedSlot ? `${formatTime12h(selectedSlot.startTime)} – ${formatTime12h(selectedSlot.endTime)}` : 'Not selected'} />
            <InfoRow label="Slot" value={selectedSlot ? formatSlotLabel(selectedSlot.label) : 'Not selected'} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setReviewOpen(false)} color="inherit">Back</Button>
          <Button variant="contained" disabled={booking} onClick={confirmBooking}>
            {booking ? 'Confirming...' : 'Confirm Booking'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

function SectionTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '8px',
          display: 'grid',
          placeItems: 'center',
          bgcolor: 'rgba(46,125,50,0.10)',
          color: '#2E7D32',
        }}
      >
        {icon}
      </Box>
      <Typography variant="subtitle1" fontWeight={600} color="#111827">
        {title}
      </Typography>
    </Stack>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ p: 1.2, borderRadius: '10px', bgcolor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
      <Typography variant="caption" color="text.secondary" fontWeight={600}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={700} color="#111827">{value}</Typography>
    </Box>
  )
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <Box sx={{ p: 1, borderRadius: '8px', bgcolor: '#F9FAFB', border: '1px solid #E5E7EB', textAlign: 'center' }}>
      <Typography variant="body2" fontWeight={700} color="#111827">{value}</Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem' }}>
        {label}
      </Typography>
    </Box>
  )
}
