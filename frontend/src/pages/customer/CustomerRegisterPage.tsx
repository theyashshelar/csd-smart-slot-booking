import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import {
  ArrowForwardRounded,
  CalendarMonthRounded,
  CreditCardRounded,
  LockRounded,
  PersonAddRounded,
  PhoneIphoneRounded,
  VisibilityOffRounded,
  VisibilityRounded,
} from '@mui/icons-material'
import IconButton from '@mui/material/IconButton'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { registerCustomer } from '../../services/auth'

export default function CustomerRegisterPage() {
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [groceryCardNumber, setGroceryCardNumber] = useState('')
  const [liquorCardNumber, setLiquorCardNumber] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleRegister = async () => {
    setError('')
    setSuccess('')

    if (
      fullName.trim() === '' ||
      mobileNumber.trim() === '' ||
      dateOfBirth === '' ||
      password.trim() === ''
    ) {
      setError('Please fill all required fields.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    try {
      setLoading(true)

      await registerCustomer({
        fullName,
        mobileNumber,
        dateOfBirth,
        password,
        confirmPassword,
        groceryCardNumber,
        liquorCardNumber,
      })

      setSuccess('Registration submitted successfully. Please wait for admin approval before logging in.')

      window.setTimeout(() => {
        navigate('/customer/login')
      }, 1400)
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
        e?.response?.data ||
        'Registration failed.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        py: { xs: 5, md: 8 },
      }}
    >
      <Grid container spacing={5} alignItems="center">
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={3.5}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 4,
                display: 'grid',
                placeItems: 'center',
                bgcolor: 'rgba(46,125,50,0.10)',
                color: '#2E7D32',
              }}
            >
              <PersonAddRounded sx={{ fontSize: 34 }} />
            </Box>

            <Box>
              <Typography
                component="h1"
                sx={{
                  fontSize: { xs: 42, md: 58 },
                  fontWeight: 850,
                  lineHeight: 1.05,
                  color: '#102319',
                }}
              >
                Create your customer account
              </Typography>

              <Typography variant="h6" color="text.secondary" sx={{ mt: 2, lineHeight: 1.7 }}>
                Register with your member details. Your account becomes active after admin approval.
              </Typography>
            </Box>

            <Stack spacing={1.6}>
              {[
                'Admin approval before login',
                'Authenticated slot booking',
                'QR token after confirmation',
                'Booking history and profile access',
              ].map((item) => (
                <Stack key={item} direction="row" spacing={1.2} alignItems="center">
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#C9A227' }} />
                  <Typography fontWeight={700}>{item}</Typography>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ borderRadius: 4, boxShadow: '0 24px 70px rgba(15,23,42,0.10)' }}>
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h4" fontWeight={850} color="#102319">
                    Customer Registration
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.8 }}>
                    Submit your member details for admin review.
                  </Typography>
                </Box>

                <Divider />

                {error && <Alert severity="error">{error}</Alert>}
                {success && <Alert severity="success">{success}</Alert>}

                <SectionHeader icon={<PersonAddRounded />} title="Personal Details" />

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      required
                      label="Full Name"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      required
                      label="Mobile Number"
                      value={mobileNumber}
                      onChange={(event) => setMobileNumber(event.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIphoneRounded />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      required
                      type="date"
                      label="Date of Birth"
                      value={dateOfBirth}
                      onChange={(event) => setDateOfBirth(event.target.value)}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarMonthRounded />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>

                <Divider />

                <SectionHeader icon={<CreditCardRounded />} title="Card Details" />

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Grocery Card Number"
                      value={groceryCardNumber}
                      onChange={(event) => setGroceryCardNumber(event.target.value)}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Liquor Card Number"
                      value={liquorCardNumber}
                      onChange={(event) => setLiquorCardNumber(event.target.value)}
                    />
                  </Grid>
                </Grid>

                <Divider />

                <SectionHeader icon={<LockRounded />} title="Account Security" />

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      required
                      type={showPassword ? 'text' : 'password'}
                      label="Password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label={showPassword ? 'Hide password' : 'Show password'}
                              onClick={() => setShowPassword((value) => !value)}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOffRounded /> : <VisibilityRounded />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      required
                      type={showConfirmPassword ? 'text' : 'password'}
                      label="Confirm Password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                              onClick={() => setShowConfirmPassword((value) => !value)}
                              edge="end"
                            >
                              {showConfirmPassword ? <VisibilityOffRounded /> : <VisibilityRounded />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>

                <Button
                  variant="contained"
                  size="large"
                  onClick={handleRegister}
                  disabled={loading}
                  endIcon={<ArrowForwardRounded />}
                  sx={{ py: 1.5, mt: 1 }}
                >
                  {loading ? 'Submitting...' : 'Submit for Approval'}
                </Button>

                <Button component={RouterLink} to="/customer/login">
                  Already approved? Login
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

type SectionHeaderProps = {
  icon: React.ReactNode
  title: string
}

function SectionHeader({ icon, title }: SectionHeaderProps) {
  return (
    <Stack direction="row" spacing={1.2} alignItems="center">
      <Box
        sx={{
          width: 38,
          height: 38,
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
