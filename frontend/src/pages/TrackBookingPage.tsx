import { useState } from 'react'
import { Box, Button, Card, CardContent, Grid, Stack, TextField, Typography } from '@mui/material'

import { trackBooking } from '../services/api'
import type { Booking } from '../types/api'

export default function TrackBookingPage() {
  const [cardNumber, setCardNumber] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')

  const [booking, setBooking] = useState<Booking | null>(null)

  const searchBooking = async () => {
    try {
      const res = await trackBooking(cardNumber, mobileNumber)

      if (res.data.length > 0) {
        setBooking(res.data[0])
      } else {
        setBooking(null)
        alert('No booking found')
      }
    } catch (e) {
      console.error(e)
      alert('Unable to fetch booking')
    }
  }

  return (
      <Box>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4">
              Track Booking
            </Typography>
          </Box>

          <Card>
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 5 }}>
                  <TextField
                      fullWidth
                      label="Card Number"
                      value={cardNumber}
                      onChange={(e) =>
                          setCardNumber(e.target.value)
                      }
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 5 }}>
                  <TextField
                      fullWidth
                      label="Mobile Number"
                      value={mobileNumber}
                      onChange={(e) =>
                          setMobileNumber(e.target.value)
                      }
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 2 }}>
                  <Button
                      fullWidth
                      variant="contained"
                      onClick={searchBooking}
                  >
                    Search
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {booking && (
              <Card>
                <CardContent>

                  <Typography>
                    <b>Token :</b> {booking.token}
                  </Typography>

                  <Typography>
                    <b>Booking Date :</b> {booking.bookingDate}
                  </Typography>

                  <Typography>
                    <b>Status :</b> {booking.status}
                  </Typography>

                  <Typography>
                    <b>Slot :</b> {booking.bookingLabel}
                  </Typography>

                  <Typography>
                    <b>Booking Label :</b> {booking.bookingLabel || 'N/A'}
                  </Typography>

                </CardContent>
              </Card>
          )}
        </Stack>
      </Box>
  );
}