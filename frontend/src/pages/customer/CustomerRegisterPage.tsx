import { useState, useRef, useEffect } from 'react'
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
import { toast } from 'react-hot-toast'

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

  const fullNameRef = useRef<HTMLInputElement>(null)
  const mobileNumberRef = useRef<HTMLInputElement>(null)
  const dateOfBirthRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const confirmPasswordRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fullNameRef.current?.focus()
  }, [])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (fullName.trim() === '') {
      setError('Full Name is required.')
      toast.error('Full Name is required.')
      fullNameRef.current?.focus()
      return
    }
    if (mobileNumber.trim() === '') {
      setError('Mobile Number is required.')
      toast.error('Mobile Number is required.')
      mobileNumberRef.current?.focus()
      return
    }
    if (dateOfBirth === '') {
      setError('Date of Birth is required.')
      toast.error('Date of Birth is required.')
      dateOfBirthRef.current?.focus()
      return
    }
    if (password.trim() === '') {
      setError('Password is required.')
      toast.error('Password is required.')
      passwordRef.current?.focus()
      return
    }
    if (confirmPassword.trim() === '') {
      setError('Confirm Password is required.')
      toast.error('Confirm Password is required.')
      confirmPasswordRef.current?.focus()
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      toast.error('Passwords do not match.')
      confirmPasswordRef.current?.focus()
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
        groceryCardNumber: groceryCardNumber
          ? `GA${groceryCardNumber.replace(/^GA/i, '')}`
          : '',
        liquorCardNumber: liquorCardNumber
          ? `LA${liquorCardNumber.replace(/^LA/i, '')}`
          : '',
      })

      const successMsg = 'Registration submitted successfully. Please wait for admin approval before logging in.'
      setSuccess(successMsg)
      toast.success('Registration successful! Pending admin approval.')

      window.setTimeout(() => {
        navigate('/customer/login')
      }, 1400)
    } catch (e: any) {
      const errMsg = e?.response?.data?.message || e?.response?.data || 'Registration failed.'
      setError(errMsg)
      toast.error(errMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        py: { xs: 4, md: 5 },
      }}
    >
      <Grid container spacing={4} alignItems="center">
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={2.5}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '10px',
                display: 'grid',
                placeItems: 'center',
                bgcolor: 'rgba(46,125,50,0.10)',
                color: '#2E7D32',
              }}
            >
              <PersonAddRounded sx={{ fontSize: 26 }} />
            </Box>

            <Box>
              <Typography
                component="h1"
                sx={{
                  fontSize: { xs: 32, md: 44 },
                  fontWeight: 700,
                  lineHeight: 1.15,
                  color: '#111827',
                  letterSpacing: '-0.025em',
                }}
              >
                Create your customer account
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, lineHeight: 1.6 }}>
                Register with your member details. Your account becomes active after admin approval.
              </Typography>
            </Box>

            <Stack spacing={1.2}>
              {[
                'Admin approval before login',
                'Authenticated slot booking',
                'QR token after confirmation',
                'Booking history and profile access',
              ].map((item) => (
                <Stack key={item} direction="row" spacing={1} alignItems="center">
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#D4A017' }} />
                  <Typography variant="body2" fontWeight={600} color="#374151">{item}</Typography>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ borderRadius: "12px", border: "1px solid #E5E7EB", boxShadow: '0 4px 18px rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Box component="form" onSubmit={handleRegister} noValidate>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="h5" fontWeight={700} color="#111827">
                      Customer Registration
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Submit your member details for admin review.
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 0.5 }} />

                  {error && <Alert severity="error" sx={{ borderRadius: '10px' }}>{error}</Alert>}
                  {success && <Alert severity="success" sx={{ borderRadius: '10px' }}>{success}</Alert>}

                  <SectionHeader icon={<PersonAddRounded />} title="Personal Details" />

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        required
                        size="small"
                        label="Full Name"
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                        inputRef={fullNameRef}
                        disabled={loading}
                        slotProps={{ htmlInput: { style: { borderRadius: '10px' } } }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        required
                        size="small"
                        label="Mobile Number"
                        value={mobileNumber}
                        onChange={(event) => setMobileNumber(event.target.value)}
                        inputRef={mobileNumberRef}
                        disabled={loading}
                        slotProps={{
                          htmlInput: { style: { borderRadius: '10px' } },
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <PhoneIphoneRounded sx={{ fontSize: 18 }} />
                              </InputAdornment>
                            ),
                          }
                        }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        required
                        size="small"
                        type="date"
                        label="Date of Birth"
                        value={dateOfBirth}
                        onChange={(event) => setDateOfBirth(event.target.value)}
                        inputRef={dateOfBirthRef}
                        disabled={loading}
                        InputLabelProps={{ shrink: true }}
                        slotProps={{
                          htmlInput: { style: { borderRadius: '10px' } },
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <CalendarMonthRounded sx={{ fontSize: 18 }} />
                              </InputAdornment>
                            ),
                          }
                        }}
                      />
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 0.5 }} />

                  <SectionHeader icon={<CreditCardRounded />} title="Card Details" />

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Grocery Card Number"
                        value={groceryCardNumber}
                        onChange={(event) => setGroceryCardNumber(event.target.value)}
                        disabled={loading}
                        slotProps={{
                            htmlInput: {
                                style: { borderRadius: '10px' },
                            },
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        GA
                                    </InputAdornment>
                                ),
                            },
                        }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Liquor Card Number"
                        value={liquorCardNumber}
                        onChange={(event) => setLiquorCardNumber(event.target.value)}
                        disabled={loading}
                        slotProps={{
                            htmlInput:
                                { style: { borderRadius: '10px' },
                            },
                              input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        LA
                                    </InputAdornment>
                                ),
                              },
                        }}
                      />
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 0.5 }} />

                  <SectionHeader icon={<LockRounded />} title="Account Security" />

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        required
                        size="small"
                        type={showPassword ? 'text' : 'password'}
                        label="Password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        inputRef={passwordRef}
                        disabled={loading}
                        slotProps={{
                          htmlInput: { style: { borderRadius: '10px' } },
                          input: {
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                                  onClick={() => setShowPassword((value) => !value)}
                                  edge="end"
                                  size="small"
                                >
                                  {showPassword ? <VisibilityOffRounded sx={{ fontSize: 18 }} /> : <VisibilityRounded sx={{ fontSize: 18 }} />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }
                        }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        required
                        size="small"
                        type={showConfirmPassword ? 'text' : 'password'}
                        label="Confirm Password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        inputRef={confirmPasswordRef}
                        disabled={loading}
                        slotProps={{
                          htmlInput: { style: { borderRadius: '10px' } },
                          input: {
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                                  onClick={() => setShowConfirmPassword((value) => !value)}
                                  edge="end"
                                  size="small"
                                >
                                  {showConfirmPassword ? <VisibilityOffRounded sx={{ fontSize: 18 }} /> : <VisibilityRounded sx={{ fontSize: 18 }} />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }
                        }}
                      />
                    </Grid>
                  </Grid>

                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    endIcon={<ArrowForwardRounded />}
                    sx={{ py: 1, mt: 1, height: 40, borderRadius: '10px' }}
                  >
                    {loading ? 'Submitting...' : 'Submit for Approval'}
                  </Button>

                  <Button
                    component={RouterLink}
                    to="/customer/login"
                    variant="text"
                    size="small"
                    disabled={loading}
                    sx={{ textTransform: 'none', fontWeight: 500 }}
                  >
                    Already approved? Login
                  </Button>
                </Stack>
              </Box>
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
    <Stack direction="row" spacing={1} alignItems="center">
      <Box
        sx={{
          width: 30,
          height: 30,
          borderRadius: '6px',
          display: 'grid',
          placeItems: 'center',
          bgcolor: 'rgba(46,125,50,0.10)',
          color: '#2E7D32',
        }}
      >
        {icon}
      </Box>
      <Typography variant="body1" fontWeight={600} color="#111827">
        {title}
      </Typography>
    </Stack>
  )
}
