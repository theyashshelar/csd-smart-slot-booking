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
} from '@mui/material'

import { trackBooking } from '../services/api'
import type { Booking } from '../types/api'

export default function TrackBookingPage() {

  const [cardNumber, setCardNumber] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [booking, setBooking] = useState<Booking | null>(null)

  const searchBooking = async () => {

    try {

      const res = await trackBooking(mobileNumber)

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

            <Typography
                variant="h4"
                fontWeight={700}
            >
              Track Booking
            </Typography>

          </Box>

          <Card>

            <CardContent>

              <Grid
                  container
                  spacing={2}
              >

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
                    <strong>Token :</strong> {booking.token}
                  </Typography>

                  <Typography>
                    <strong>Booking Date :</strong> {booking.bookingDate}
                  </Typography>

                  <Typography>
                    <strong>Status :</strong> {booking.status}
                  </Typography>

                  <Typography>
                    <Typography>
                      <strong>Slot :</strong> {booking.slot}
                    </Typography>
                  </Typography>

                </CardContent>

              </Card>

          )}

        </Stack>

      </Box>

  )

}