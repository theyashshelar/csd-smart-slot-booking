import { useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  TextField,
  Typography,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material'
import { SearchRounded, HelpOutlineRounded } from '@mui/icons-material'
import { toast } from 'react-hot-toast'

import { trackBooking, customerCancelBooking } from '../services/api'
import type { Booking } from '../types/api'

export default function TrackBookingPage() {
  const [mobileNumber, setMobileNumber] = useState('')
  const [booking, setBooking] = useState<Booking | null>(null)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const searchBooking = async () => {
    setError('')
    setBooking(null)
    setSearched(false)

    if (!mobileNumber.trim()) {
      setError('Please provide a mobile number.')
      return
    }

    try {
      const res = await trackBooking(mobileNumber.trim())
      setSearched(true)
      if (res.data.length > 0) {
        setBooking(res.data[0])
      } else {
        setBooking(null)
      }
    } catch (e: any) {
      console.error(e)
      setError(e?.response?.data?.message || 'Unable to fetch booking. Please try again later.')
    }
  }

  const handleOpenCancelDialog = (b: Booking) => {
    setSelectedBooking(b)
    setCancelDialogOpen(true)
  }

  const handleCloseCancelDialog = () => {
    setSelectedBooking(null)
    setCancelDialogOpen(false)
  }

  const handleConfirmCancel = async () => {
    if (!selectedBooking) return
    setCancelling(true)
    try {
      const bId = selectedBooking.bookingId || selectedBooking.id
      const mId = selectedBooking.memberId
      if (!mId) {
        throw new Error('Member information not available on booking.')
      }
      await customerCancelBooking(bId, mId)
      toast.success('Booking cancelled successfully.')
      setBooking(prev => prev ? { ...prev, status: 'CANCELLED' } : null)
      handleCloseCancelDialog()
    } catch (e: any) {
      console.error(e)
      toast.error(e?.response?.data?.message || e?.message || 'Failed to cancel booking.')
    } finally {
      setCancelling(false)
    }
  }

  return (
    <Box sx={{ maxWidth: '800px', mx: 'auto', py: { xs: 2, md: 4 } }}>
      <Stack spacing={3}>
        <Box sx={{ textAlign: 'center', mb: 1 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: '#111827', letterSpacing: '-0.02em', mb: 1 }}
          >
            Track Your Slot Booking
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enter your registered mobile number below to retrieve your active token and reservation status.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ borderRadius: '10px' }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Card sx={{ borderRadius: '14px', border: '1px solid #E5E7EB', boxShadow: '0 4px 18px rgba(0,0,0,0.06)' }}>
          <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, sm: 9 }}>
                <TextField
                  fullWidth
                  label="Registered Mobile Number"
                  placeholder="e.g. +91 9876543210"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<SearchRounded />}
                  onClick={searchBooking}
                  sx={{ height: 40, borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
                >
                  Track Slot
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {searched && booking && (
          <Card sx={{ borderRadius: '14px', border: '1px solid #2E7D32', boxShadow: '0 4px 20px rgba(46, 125, 50, 0.08)' }}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Stack spacing={2.5}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" fontWeight={700} color="#2E7D32">
                    Booking Found
                  </Typography>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    {booking.status === 'BOOKED' && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => handleOpenCancelDialog(booking)}
                        sx={{ textTransform: 'none', borderRadius: '6px', fontWeight: 600, height: 26, fontSize: '0.75rem' }}
                      >
                        Cancel Booking
                      </Button>
                    )}
                    <Chip
                      label={booking.status}
                      color={
                        booking.status === 'BOOKED'
                          ? 'warning'
                          : booking.status === 'CHECKED_IN'
                          ? 'info'
                          : booking.status === 'CHECKED_OUT'
                          ? 'success'
                          : 'error'
                      }
                      sx={{ fontWeight: 600, borderRadius: '999px' }}
                    />
                  </Stack>
                </Box>

                <Grid container spacing={2}>
                  {[
                    ['Token ID', booking.token],
                    ['Booking Date', booking.bookingDate],
                    ['Card Type', booking.cardType],
                    ['Slot Schedule', booking.slot],
                  ].map(([label, value]) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={label}>
                      <Box sx={{ p: 1.5, borderRadius: '10px', bgcolor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={500} display="block">
                          {label}
                        </Typography>
                        <Typography variant="body1" fontWeight={700} color="#111827" sx={{ mt: 0.5 }}>
                          {value}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Stack>
            </CardContent>
          </Card>
        )}

        {searched && !booking && (
          <Card sx={{ p: 4, textAlign: 'center', border: '1px dashed #D1D5DB', borderRadius: '14px', bgcolor: 'transparent' }}>
            <HelpOutlineRounded color="disabled" sx={{ fontSize: '3rem', mb: 1.5 }} />
            <Typography variant="h6" fontWeight={600} color="text.primary" gutterBottom>
              No Active Bookings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No booking record matches the mobile number "{mobileNumber}". Please verify your details or create a new slot booking.
            </Typography>
          </Card>
        )}
      </Stack>

      <Dialog
        open={cancelDialogOpen}
        onClose={handleCloseCancelDialog}
        PaperProps={{
          sx: { borderRadius: '12px', p: 1, maxWidth: '440px' }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          Cancel Booking
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'text.primary' }}>
            Are you sure you want to cancel this booking?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleCloseCancelDialog}
            variant="outlined"
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              color: 'text.secondary',
              borderColor: 'divider',
              '&:hover': {
                borderColor: 'text.secondary',
                bgcolor: 'action.hover'
              }
            }}
          >
            No, Keep Booking
          </Button>
          <Button
            onClick={handleConfirmCancel}
            variant="contained"
            color="error"
            disabled={cancelling}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none'
              }
            }}
          >
            {cancelling ? 'Cancelling...' : 'Cancel'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
