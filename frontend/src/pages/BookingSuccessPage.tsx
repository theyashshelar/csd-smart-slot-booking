import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import QRCode from 'react-qr-code'
import {
  CheckCircleRounded,
  DownloadRounded,
  HomeRounded,
  HistoryRounded,
} from '@mui/icons-material'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'

export default function BookingSuccessPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const booking = location.state?.booking
  const slot = location.state?.slot
  const cardType = location.state?.cardType

  if (!booking) {
    navigate('/customer/dashboard')
    return null
  }

  return (
      <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            py: 5,
          }}
      >
        <Card
            sx={{
              maxWidth: 700,
              width: '100%',
              borderRadius: 4,
            }}
        >
          <CardContent>

            <Stack spacing={4} alignItems="center">

              <CheckCircleRounded
                  sx={{
                    fontSize: 90,
                    color: 'success.main',
                  }}
              />

              <Box textAlign="center">
                <Typography
                    variant="h4"
                    fontWeight={700}
                >
                  Booking Confirmed
                </Typography>

                <Typography color="text.secondary">
                  Your slot has been reserved successfully.
                </Typography>
              </Box>

              <Box
                  sx={{
                    width: '100%',
                    bgcolor: 'primary.main',
                    color: 'white',
                    borderRadius: 3,
                    p: 4,
                  }}
              >
                <Stack spacing={2}>

                  <Typography variant="caption">
                    TOKEN NUMBER
                  </Typography>

                  <Typography
                      variant="h3"
                      fontWeight={800}
                  >
                    {booking.token}
                  </Typography>

                  <Divider
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.25)',
                      }}
                  />

                  <Typography>
                    <strong>Booking Date :</strong>{' '}
                    {booking.bookingDate}
                  </Typography>

                  <Typography>
                    <strong>Slot :</strong>{' '}
                    {slot?.label}
                  </Typography>

                  <Typography>
                    <strong>Time :</strong>{' '}
                    {slot?.startTime} - {slot?.endTime}
                  </Typography>

                  <Typography>
                    <strong>Card Type :</strong>{' '}
                    {cardType}
                  </Typography>

                  <Box>

                    <Typography
                        variant="body2"
                        gutterBottom
                    >
                      Booking Status
                    </Typography>

                    <Chip
                        color="success"
                        label={booking.status}
                    />

                  </Box>

                </Stack>
              </Box>

                <Box
                    sx={{
                        bgcolor: "white",
                        p: 3,
                        borderRadius: 3,
                        display: "inline-flex",
                    }}
                >
                    <QRCode
                        value={booking?.token || ""}
                        size={180}
                    />
                </Box>
                
              <Stack
                  direction={{
                    xs: 'column',
                    sm: 'row',
                  }}
                  spacing={2}
              >

                <Button
                    variant="contained"
                    startIcon={<DownloadRounded />}
                >
                  Download QR
                </Button>

                <Button
                    component={RouterLink}
                    to="/customer/history"
                    variant="outlined"
                    startIcon={<HistoryRounded />}
                >
                  Booking History
                </Button>

                <Button
                    component={RouterLink}
                    to="/customer/dashboard"
                    variant="outlined"
                    startIcon={<HomeRounded />}
                >
                  Dashboard
                </Button>

              </Stack>

            </Stack>

          </CardContent>
        </Card>
      </Box>
  )
}