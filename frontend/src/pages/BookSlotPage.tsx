import { useState, useEffect } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { CalendarMonthRounded } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

import { verifyMember, getSlots, createBooking } from '../services/api'
import type { Slot, Member } from '../types/api'

type VerifyResponse = Member & { verified: boolean }

// slots are loaded from API

export default function BookSlotPage() {
  const [verified, setVerified] = useState(false)
  const [cardNumber, setCardNumber] = useState('')
  const [mobile, setMobile] = useState('')
  const [member, setMember] = useState<Member | null>(null)
  const [slotsList, setSlotsList] = useState<Slot[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getSlots().then((res) => setSlotsList(res.data || [])).catch(() => {})
  }, [])
  const navigate = useNavigate()

  const handleVerify = async () => {
    setError(null)
    setLoading(true)
    try {
      const res = await verifyMember({ cardNumber, mobileNumber: mobile })
      const data = res.data as VerifyResponse
      if (data?.verified) {
        setMember(data)
        setVerified(true)
      }
    } catch (e: any) {
      setError(e?.response?.data || e?.message || 'Verification failed')
    } finally { setLoading(false) }
  }

  return (
    <Box>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Book Your Canteen Slot</Typography>
          <Typography color="text.secondary">Verify service credentials and reserve a time slot with confidence.</Typography>
        </Box>

        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6">Member Verification</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth label="Card Number" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth label="Registered Mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} />
                </Grid>
              </Grid>
              <Button variant="contained" onClick={handleVerify} disabled={loading}>{loading ? 'Verifying...' : 'Verify'}</Button>
              {error && <Typography color="error">{error}</Typography>}
            </Stack>
          </CardContent>
        </Card>

        {verified && (
          <Stack spacing={2}>
            <Alert severity="success">Customer verified successfully. Select an available slot.</Alert>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h6">Customer Profile</Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}><Typography><strong>Name:</strong> {member?.fullName}</Typography></Grid>
                    <Grid size={{ xs: 12, md: 6 }}><Typography><strong>Rank:</strong> {member?.rank}</Typography></Grid>
                    <Grid size={{ xs: 12, md: 6 }}><Typography><strong>Category:</strong> {member?.category}</Typography></Grid>
                    <Grid size={{ xs: 12, md: 6 }}><Typography><strong>Unit:</strong> {member?.unit}</Typography></Grid>
                  </Grid>
                </Stack>
              </CardContent>
            </Card>

            <Grid container spacing={2}>
              {slotsList.map((slot) => {
                const disabled = (slot.capacity ?? 0) - (slot.bookedCount ?? 0) <= 0 || !slot.active
                return (
                  <Grid size={{ xs: 12, md: 4 }} key={slot.id}>
                    <Card sx={{ height: '100%', opacity: disabled ? 0.7 : 1 }}>
                      <CardContent>
                        <Stack spacing={2}>
                          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6">{`${slot.startTime || ''}-${slot.endTime || ''}`}</Typography>
                            <Chip label={disabled ? 'Full' : 'Available'} color={disabled ? 'default' : 'success'} />
                          </Stack>
                          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                            <CalendarMonthRounded color="primary" />
                            <Typography>{(slot.bookedCount ?? 0)}/{slot.capacity ?? 0}</Typography>
                          </Stack>
                          <Button variant="contained" disabled={disabled} onClick={async () => {
                            try {
                              setLoading(true)
                              const booking = await createBooking({ memberId: member!.id, slotId: slot.id })
                              navigate('/booking-success', { state: { booking: booking.data } })
                            } catch (e: any) {
                              setError(e?.response?.data || e?.message || 'Booking failed')
                            } finally { setLoading(false) }
                          }}>Book Now</Button>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                )
              })}
            </Grid>
          </Stack>
        )}
      </Stack>
    </Box>
  )
}
