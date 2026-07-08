import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
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
import Divider from '@mui/material/Divider'
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
import {
  createBooking,
  getCustomerProfile,
  getSlots,
} from '../../services/api'
import type { CustomerProfile, Slot } from '../../types/api'

type CardType = 'GROCERY' | 'LIQUOR'

const steps = ['Member', 'Date', 'Card', 'Slot', 'Review']

const today = new Date().toISOString().slice(0, 10)

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
    if (!cardType || !bookingDate) {
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
  }, [bookingDate, cardType])

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

      navigate('/booking-success', {
        state: {
          booking: response.data,
          slot: selectedSlot,
          cardType,
          bookingDate,
        },
      })
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.response?.data || 'Booking failed.')
      setReviewOpen(false)
    } finally {
      setBooking(false)
    }
  }

  return (
    <Box>
      <Stack spacing={3}>
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', lg: 'center' }}
          spacing={2}
        >
          <Box>
            <Chip label="Authenticated booking" color="success" variant="outlined" sx={{ mb: 1.5 }} />
            <Typography variant="h3" sx={{ fontWeight: 850, color: '#102319', lineHeight: 1.05 }}>
              Book Your Slot
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1, fontSize: 16 }}>
              Select a booking date, card type, available slot, and review everything before confirmation.
            </Typography>
          </Box>
        </Stack>

        {error && <Alert severity="error">{error}</Alert>}

        <Card sx={{ borderRadius: 4 }}>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Stepper activeStep={activeStep} alternativeLabel sx={{ display: { xs: 'none', md: 'flex' } }}>
              {steps.map((step) => (
                <Step key={step}>
                  <StepLabel>{step}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>

        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Card sx={{ height: '100%', borderRadius: 4 }}>
              <CardContent sx={{ p: 3 }}>
                <SectionTitle icon={<PersonRounded />} title="Logged-in Member" />

                {loadingProfile ? (
                  <Stack spacing={1.5} sx={{ mt: 3 }}>
                    <Skeleton height={32} />
                    <Skeleton height={32} />
                    <Skeleton height={32} />
                  </Stack>
                ) : profile ? (
                  <Stack spacing={1.5} sx={{ mt: 3 }}>
                    <InfoRow label="Name" value={profile.fullName} />
                    <InfoRow label="Mobile" value={profile.mobileNumber} />
                    <InfoRow label="Status" value={profile.registrationStatus} />
                    <InfoRow label="Grocery Card" value={profile.groceryCardNumber || 'Not registered'} />
                    <InfoRow label="Liquor Card" value={profile.liquorCardNumber || 'Not registered'} />
                  </Stack>
                ) : (
                  <Alert severity="warning" sx={{ mt: 3 }}>
                    Member details are unavailable.
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, lg: 8 }}>
            <Card sx={{ borderRadius: 4 }}>
              <CardContent sx={{ p: 3 }}>
                <SectionTitle icon={<CalendarMonthRounded />} title="Select Booking Date" />
                <Typography color="text.secondary" sx={{ mt: 1, mb: 2.5 }}>
                  Past dates are disabled. Booking window controls will be handled from admin settings in the next module.
                </Typography>

                <Grid container spacing={2} alignItems="center">
                  <Grid size={{ xs: 12, md: 5 }}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Booking Date"
                      value={bookingDate}
                      onChange={(event) => setBookingDate(event.target.value)}
                      inputProps={{ min: today }}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 7 }}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        bgcolor: '#F8FAF8',
                        border: '1px solid rgba(46,125,50,0.12)',
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" fontWeight={800}>
                        SELECTED DATE
                      </Typography>
                      <Typography variant="h6" fontWeight={850}>
                        {formatDate(bookingDate)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card sx={{ borderRadius: 4 }}>
          <CardContent sx={{ p: 3 }}>
            <SectionTitle icon={<CreditCardRounded />} title="Choose Card Type" />
            <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
              {cardOptions.map((option) => {
                const Icon = option.icon
                const disabled = !option.number
                const selected = cardType === option.type

                return (
                  <Grid key={option.type} size={{ xs: 12, md: 6 }}>
                    <motion.div whileHover={disabled ? undefined : { y: -4 }}>
                      <Card
                        variant="outlined"
                        onClick={() => {
                          if (!disabled) setCardType(option.type)
                        }}
                        sx={{
                          cursor: disabled ? 'not-allowed' : 'pointer',
                          borderRadius: 4,
                          borderColor: selected ? option.color : 'rgba(17,24,39,0.10)',
                          borderWidth: selected ? 2 : 1,
                          opacity: disabled ? 0.56 : 1,
                          bgcolor: selected ? `${option.color}0D` : '#FFFFFF',
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Box
                              sx={{
                                width: 58,
                                height: 58,
                                borderRadius: 3,
                                display: 'grid',
                                placeItems: 'center',
                                bgcolor: `${option.color}14`,
                                color: option.color,
                              }}
                            >
                              <Icon sx={{ fontSize: 32 }} />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" fontWeight={850}>
                                {option.title}
                              </Typography>
                              <Typography color="text.secondary">
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

        <Card sx={{ borderRadius: 4 }}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 2.5 }}>
              <Box>
                <SectionTitle icon={<AccessTimeRounded />} title="Choose Available Slot" />
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  Showing availability for {cardType || 'selected card'} on {formatDate(bookingDate)}.
                </Typography>
              </Box>
              {cardType && <Chip label={cardType} color={cardType === 'GROCERY' ? 'success' : 'warning'} />}
            </Stack>

            {!cardType && (
              <Alert severity="info">Select Grocery or Liquor to load available slots.</Alert>
            )}

            {loadingSlots && <LinearProgress color="success" sx={{ borderRadius: 99 }} />}

            {!loadingSlots && cardType && slots.length === 0 && (
              <Alert severity="warning">No active slots are available for this card type and date.</Alert>
            )}

            <Grid container spacing={2.2} sx={{ mt: slots.length ? 0 : 2 }}>
              {slots.map((slot) => {
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
                        borderRadius: 4,
                        cursor: full ? 'not-allowed' : 'pointer',
                        borderColor: selected ? '#2E7D32' : 'rgba(17,24,39,0.10)',
                        borderWidth: selected ? 2 : 1,
                        bgcolor: selected ? 'rgba(46,125,50,0.06)' : '#FFFFFF',
                        opacity: full ? 0.62 : 1,
                      }}
                    >
                      <CardContent sx={{ p: 2.6 }}>
                        <Stack spacing={2}>
                          <Stack direction="row" justifyContent="space-between" spacing={2}>
                            <Box>
                              <Typography variant="h6" fontWeight={850}>
                                {slot.startTime} - {slot.endTime}
                              </Typography>
                              <Typography color="text.secondary">{slot.label}</Typography>
                            </Box>
                            <Chip
                              size="small"
                              label={full ? 'Full' : `${remaining} left`}
                              color={full ? 'error' : remaining <= 5 ? 'warning' : 'success'}
                            />
                          </Stack>

                          <LinearProgress
                            variant="determinate"
                            value={progress}
                            color={full ? 'error' : 'success'}
                            sx={{ height: 9, borderRadius: 99, bgcolor: '#EEF4EF' }}
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

        <Card sx={{ borderRadius: 4 }}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', lg: 'center' }} spacing={2}>
              <Box>
                <Typography variant="h5" fontWeight={850}>
                  Review Booking
                </Typography>
                <Typography color="text.secondary">
                  Confirm only after checking member details, date, card type, and selected slot.
                </Typography>
              </Box>
              <Button
                variant="contained"
                size="large"
                disabled={!profile || !bookingDate || !cardType || !selectedSlot}
                endIcon={<ArrowForwardRounded />}
                onClick={() => setReviewOpen(true)}
              >
                Review & Confirm
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      <Dialog open={reviewOpen} onClose={() => setReviewOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Review Booking</DialogTitle>
        <DialogContent>
          <Stack spacing={1.6} sx={{ pt: 1 }}>
            <InfoRow label="Member" value={profile?.fullName || 'Unknown'} />
            <InfoRow label="Booking Date" value={formatDate(bookingDate)} />
            <InfoRow label="Card Type" value={cardType || 'Not selected'} />
            <InfoRow label="Booking Time" value={selectedSlot ? `${selectedSlot.startTime} - ${selectedSlot.endTime}` : 'Not selected'} />
            <InfoRow label="Slot" value={selectedSlot?.label || 'Not selected'} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewOpen(false)}>Back</Button>
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
    <Stack direction="row" spacing={1.2} alignItems="center">
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2.5,
          display: 'grid',
          placeItems: 'center',
          bgcolor: 'rgba(46,125,50,0.10)',
          color: '#2E7D32',
        }}
      >
        {icon}
      </Box>
      <Typography variant="h6" fontWeight={850}>
        {title}
      </Typography>
    </Stack>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ p: 1.6, borderRadius: 3, bgcolor: '#F8FAF8', border: '1px solid rgba(17,24,39,0.06)' }}>
      <Typography variant="caption" color="text.secondary" fontWeight={850}>
        {label}
      </Typography>
      <Typography fontWeight={800}>{value}</Typography>
    </Box>
  )
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <Box sx={{ p: 1.2, borderRadius: 2.5, bgcolor: '#F8FAF8', textAlign: 'center' }}>
      <Typography fontWeight={850}>{value}</Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Box>
  )
}
