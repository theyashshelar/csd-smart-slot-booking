import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TextField,
  TableRow,
  Typography,
  Skeleton,
} from '@mui/material'

import {
  People as PeopleIcon,
  HourglassEmpty as HourglassEmptyIcon,
  CheckCircle as CheckCircleIcon,
  ExitToApp as ExitToAppIcon,
  Search as SearchIcon,
  QrCodeScanner as QrCodeScannerIcon,
  TrendingUp as TrendingUpIcon,
  ArrowForward as ArrowForwardIcon,
  Inbox as InboxIcon,
} from '@mui/icons-material'

import {
  getQueue,
  searchBooking,
  checkIn,
  checkOut,
  cancelBooking,
  getBookingByToken
} from '../../services/api'

import type {
  OperatorBooking,
  OperatorSearchResponse,
} from '../../types/api'

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";

import QrScanner from "./QrScanner";

export default function OperatorDashboardPage() {

  const [queue, setQueue] = useState<OperatorBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [openScanner, setOpenScanner] = useState(false);
  const [search, setSearch] = useState('')
  const [searchResult, setSearchResult] = useState<OperatorSearchResponse | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    void loadQueue()
  }, [])

  const loadQueue = async () => {
    setLoading(true)
    try {
      const res = await getQueue()
      setQueue(res.data)
    } catch (e: any) {
      setError(
          e?.response?.data?.message ||
          'Unable to load queue.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!search.trim()) return

    setError('')
    setSearchResult(null)

    try {
      const response = await searchBooking({
        token: search,
        mobileNumber: search,
        cardNumber: search,
      })
      setSearchResult(response.data)
    } catch (e: any) {
      setError(
          e?.response?.data?.message ||
          'Booking not found.'
      )
    }
  }

  const handleCheckIn = async (bookingId: number) => {
    try {
      await checkIn(bookingId)
      await loadQueue()
      if (searchResult?.bookingId === bookingId) {
        await handleSearch()
      }
    } catch (e: any) {
      setError(
          e?.response?.data?.message ||
          'Unable to check in.'
      )
    }
  }

  const handleCheckOut = async (bookingId: number) => {
    try {
      await checkOut(bookingId)
      await loadQueue()
      if (searchResult?.bookingId === bookingId) {
        await handleSearch()
      }
    } catch (e: any) {
      setError(
          e?.response?.data?.message ||
          'Unable to check out.'
      )
    }
  }

  const handleCancel = async (bookingId: number) => {
    try {
      await cancelBooking(bookingId)
      await loadQueue()
      if (searchResult?.bookingId === bookingId) {
        await handleSearch()
      }
    } catch (e: any) {
      setError(
          e?.response?.data?.message ||
          'Unable to cancel booking.'
      )
    }
  }

  // Sort queue by:
  // 1. Slot Start Time
  // 2. Token Number
  const sortedQueue = [...queue].sort((a, b) => {
    const startTimeA = a.slot?.startTime || '';
    const startTimeB = b.slot?.startTime || '';
    if (startTimeA !== startTimeB) {
      return startTimeA.localeCompare(startTimeB);
    }
    const tokenA = a.token || '';
    const tokenB = b.token || '';
    return tokenA.localeCompare(tokenB);
  });

  // Calculate stats
  const totalToday = queue.length
  const waitingCount = queue.filter(b => b.status === 'BOOKED').length
  const checkedInCount = queue.filter(b => b.status === 'CHECKED_IN').length
  const completedCount = queue.filter(b => b.status === 'CHECKED_OUT').length

  // Now serving logic:
  // Earliest BOOKED booking in sorted list
  const bookedBookings = sortedQueue.filter(b => b.status === 'BOOKED');
  const currentServing = bookedBookings[0] || null;
  const nextTokens = bookedBookings.slice(1, 4);

  const getStatusChipStyles = (status: string) => {
    switch (status) {
      case 'BOOKED':
        return {
          bgcolor: '#FEF3C7',
          color: '#B45309',
          border: '1px solid #FCD34D',
        };
      case 'CHECKED_IN':
        return {
          bgcolor: '#D1FAE5',
          color: '#047857',
          border: '1px solid #6EE7B7',
        };
      case 'CHECKED_OUT':
        return {
          bgcolor: '#DBEAFE',
          color: '#1D4ED8',
          border: '1px solid #93C5FD',
        };
      case 'CANCELLED':
        return {
          bgcolor: '#FEE2E2',
          color: '#B91C1C',
          border: '1px solid #FCA5A5',
        };
      default:
        return {};
    }
  };

  if (loading) {
    return (
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#111827', letterSpacing: '-0.02em', mb: 0.5 }}>
            Queue Operations Control
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Loading live queue statistics and customer flow...
          </Typography>
        </Box>

        {/* Summary Cards Skeleton */}
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
              <Card sx={{ borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: 'none' }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Skeleton variant="circular" width={48} height={48} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="60%" height={20} />
                      <Skeleton variant="text" width="40%" height={32} />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Now Serving Skeleton */}
        <Card sx={{ borderRadius: '16px', border: '1px solid #E5E7EB', p: 3 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Skeleton variant="text" width="30%" height={24} sx={{ mb: 1.5 }} />
              <Skeleton variant="text" width="60%" height={60} sx={{ mb: 1.5 }} />
              <Skeleton variant="text" width="45%" height={28} sx={{ mb: 1.5 }} />
              <Skeleton variant="rectangular" width={160} height={36} sx={{ borderRadius: '8px' }} />
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Skeleton variant="text" width="50%" height={24} sx={{ mb: 2 }} />
              <Stack spacing={1}>
                <Skeleton variant="rectangular" height={48} sx={{ borderRadius: '8px' }} />
                <Skeleton variant="rectangular" height={48} sx={{ borderRadius: '8px' }} />
              </Stack>
            </Grid>
          </Grid>
        </Card>

        {/* Table Skeleton */}
        <Card sx={{ borderRadius: '16px', border: '1px solid #E5E7EB', p: 3 }}>
          <Skeleton variant="text" width="20%" height={32} sx={{ mb: 2 }} />
          <Stack spacing={1.5}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} variant="rectangular" height={48} sx={{ borderRadius: '8px' }} />
            ))}
          </Stack>
        </Card>
      </Stack>
    )
  }

  return (
    <>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#111827', letterSpacing: '-0.02em', mb: 0.5 }}>
              Queue Operations Control
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Process real-time member check-ins, scans, and queue states.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={loadQueue}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}
          >
            Refresh Queue
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ borderRadius: '12px' }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Summary Metric Cards */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)', bgcolor: '#FFFFFF' }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(25, 118, 210, 0.08)', color: 'primary.main', display: 'flex' }}>
                    <PeopleIcon sx={{ fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      Today's Bookings
                    </Typography>
                    <Typography variant="h4" fontWeight={800} color="#111827" sx={{ mt: 0.5 }}>
                      {totalToday}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)', bgcolor: '#FFFFFF' }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(237, 108, 2, 0.08)', color: 'warning.main', display: 'flex' }}>
                    <HourglassEmptyIcon sx={{ fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      Waiting (Booked)
                    </Typography>
                    <Typography variant="h4" fontWeight={800} color="#111827" sx={{ mt: 0.5 }}>
                      {waitingCount}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)', bgcolor: '#FFFFFF' }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(46, 125, 50, 0.08)', color: 'success.main', display: 'flex' }}>
                    <CheckCircleIcon sx={{ fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      Checked In
                    </Typography>
                    <Typography variant="h4" fontWeight={800} color="#111827" sx={{ mt: 0.5 }}>
                      {checkedInCount}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)', bgcolor: '#FFFFFF' }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(2, 136, 209, 0.08)', color: 'info.main', display: 'flex' }}>
                    <ExitToAppIcon sx={{ fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      Completed
                    </Typography>
                    <Typography variant="h4" fontWeight={800} color="#111827" sx={{ mt: 0.5 }}>
                      {completedCount}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Now Serving Highlighted Card */}
        <Card sx={{
          borderRadius: '16px',
          border: '1px solid #D1FAE5',
          bgcolor: '#F0FDF4',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.04), 0 4px 6px -2px rgba(0,0,0,0.02)',
          p: { xs: 2.5, md: 3 },
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background decorative blob */}
          <Box sx={{
            position: 'absolute',
            right: -30,
            top: -30,
            width: 160,
            height: 160,
            borderRadius: '50%',
            bgcolor: 'rgba(74, 222, 128, 0.12)',
            zIndex: 0
          }} />

          <Grid container spacing={3} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
            {/* Now Serving Segment */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Stack spacing={1.5}>
                <Box>
                  <Box sx={{ px: 2, py: 0.5, borderRadius: '20px', bgcolor: '#D1FAE5', color: '#065F46', fontWeight: 800, fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: 0.5, letterSpacing: '0.05em' }}>
                    <TrendingUpIcon sx={{ fontSize: 13 }} /> NOW SERVING
                  </Box>
                </Box>
                
                {currentServing ? (
                  <>
                    <Typography variant="h2" fontWeight={900} color="#065F46" sx={{ letterSpacing: '-0.03em', lineHeight: 1 }}>
                      {currentServing.token}
                    </Typography>
                    <Box>
                      <Typography variant="h5" fontWeight={800} color="#111827">
                        {currentServing.member?.fullName || 'Unknown Customer'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Time Slot: <strong style={{ color: '#111827' }}>{currentServing.slot?.label || 'N/A'}</strong> | Card Type: <strong style={{ color: '#111827' }}>{currentServing.slot?.cardType || 'N/A'}</strong>
                      </Typography>
                    </Box>
                    <Box sx={{ pt: 0.5 }}>
                      <Button
                        variant="contained"
                        color="success"
                        size="medium"
                        startIcon={<CheckCircleIcon />}
                        sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, px: 3, py: 1, boxShadow: '0 4px 6px -1px rgba(74, 222, 128, 0.2)' }}
                        onClick={() => handleCheckIn(currentServing.id)}
                      >
                        Check In Customer
                      </Button>
                    </Box>
                  </>
                ) : (
                  <Box sx={{ py: 2 }}>
                    <Typography variant="h5" fontWeight={800} color="#065F46">
                      No customer waiting
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      All registered appointments for today are checked-in or completed.
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Grid>

            {/* Up Next / Upcoming Segment */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Box sx={{
                borderLeft: { xs: 'none', md: '1px solid #D1FAE5' },
                pl: { xs: 0, md: 3 },
                pt: { xs: 2.5, md: 0 },
                borderTop: { xs: '1px solid #D1FAE5', md: 'none' }
              }}>
                <Typography variant="subtitle2" fontWeight={800} color="#065F46" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5, letterSpacing: '0.05em' }}>
                  <ArrowForwardIcon sx={{ fontSize: 15 }} /> UP NEXT IN QUEUE
                </Typography>
                <Stack spacing={1.2}>
                  {nextTokens.length > 0 ? (
                    nextTokens.map((t, idx) => (
                      <Box key={t.id} sx={{
                        p: 1.5,
                        borderRadius: '12px',
                        bgcolor: '#FFFFFF',
                        border: '1px solid #E5E7EB',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.01)'
                      }}>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={800} color="#111827">
                            {t.token}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" fontWeight={500}>
                            {t.member?.fullName || 'Unknown Customer'}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">
                            {t.slot?.label}
                          </Typography>
                          <Chip
                            label={`Position ${idx + 1}`}
                            size="small"
                            sx={{ height: 16, fontSize: '0.62rem', fontWeight: 700, bgcolor: '#F3F4F6', color: '#4B5563', mt: 0.2 }}
                          />
                        </Box>
                      </Box>
                    ))
                  ) : (
                    <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.5)', borderRadius: '12px', border: '1px dashed #D1FAE5' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        No upcoming waiting customers.
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Card>

        {/* Live Queue Table Card */}
        <Card sx={{ borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={800} color="#111827">
                Today's Live Queue
              </Typography>
              <Chip
                label={`${sortedQueue.length} Active`}
                size="small"
                sx={{ bgcolor: '#F3F4F6', color: '#1F2937', fontWeight: 700, borderRadius: '6px' }}
              />
            </Box>

            <Box sx={{ border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' }}>
              <TableContainer sx={{ maxHeight: 440 }}>
                <Table stickyHeader size="medium">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ bgcolor: '#F9FAFB', fontWeight: 700, color: '#4B5563', width: '15%' }}>Token</TableCell>
                      <TableCell sx={{ bgcolor: '#F9FAFB', fontWeight: 700, color: '#4B5563', width: '25%' }}>Customer</TableCell>
                      <TableCell sx={{ bgcolor: '#F9FAFB', fontWeight: 700, color: '#4B5563', width: '25%' }}>Time Slot & Type</TableCell>
                      <TableCell sx={{ bgcolor: '#F9FAFB', fontWeight: 700, color: '#4B5563', width: '15%' }}>Status</TableCell>
                      <TableCell sx={{ bgcolor: '#F9FAFB', fontWeight: 700, color: '#4B5563', width: '20%', textAlign: 'center' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedQueue.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <InboxIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.4, mb: 1.5 }} />
                            <Typography variant="h6" color="text.primary" fontWeight={800}>
                              No bookings for today.
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 320 }}>
                              There are currently no active bookings in the queue for today.
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedQueue.map((booking) => (
                        <TableRow key={booking.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                          <TableCell sx={{ fontWeight: 800, color: '#111827', fontSize: '1.05rem' }}>
                            {booking.token}
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="subtitle2" fontWeight={700} color="#111827">
                                {booking.member?.fullName || 'Unknown Customer'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                {booking.member?.mobileNumber || 'N/A'}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight={600} color="#374151">
                                {booking.slot?.label || 'N/A'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ textTransform: 'uppercase' }}>
                                {booking.slot?.cardType || 'N/A'}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={booking.status}
                              size="small"
                              sx={{
                                ...getStatusChipStyles(booking.status),
                                borderRadius: '8px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                height: 22,
                                px: 0.5
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1} justifyContent="center">
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                disabled={booking.status !== 'BOOKED'}
                                onClick={() => handleCheckIn(booking.id)}
                                sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.75rem', px: 1.5 }}
                              >
                                Check In
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="primary"
                                disabled={booking.status !== 'CHECKED_IN'}
                                onClick={() => handleCheckOut(booking.id)}
                                sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.75rem', px: 1.5 }}
                              >
                                Check Out
                              </Button>
                              <Button
                                size="small"
                                color="error"
                                variant="text"
                                disabled={
                                  booking.status === 'CHECKED_OUT' ||
                                  booking.status === 'CANCELLED'
                                }
                                onClick={() => handleCancel(booking.id)}
                                sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.75rem' }}
                              >
                                Cancel
                              </Button>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </CardContent>
        </Card>

        {/* Search Booking Section */}
        <Card sx={{ borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={800} color="#111827" sx={{ mb: 2 }}>
              Search Booking Directory
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                size="medium"
                label="Token / Mobile / Card Number"
                placeholder="Enter token, mobile number or grocery/liquor card number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  }
                }}
              />
              <Stack direction="row" spacing={1.5} sx={{ height: 56 }}>
                <Button
                  variant="contained"
                  onClick={handleSearch}
                  startIcon={<SearchIcon />}
                  sx={{ px: 4, borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}
                >
                  Search
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setOpenScanner(true)}
                  startIcon={<QrCodeScannerIcon />}
                  sx={{ px: 3, borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}
                >
                  Scan QR
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Search Result display */}
        {searchResult && (
          <Card sx={{ borderRadius: '16px', border: '1.5px solid #2E7D32', boxShadow: '0 8px 16px rgba(46, 125, 50, 0.05)', overflow: 'hidden' }}>
            <Box sx={{ bgcolor: 'rgba(46, 125, 50, 0.04)', px: 3, py: 2, borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 1 }}>
              <SearchIcon sx={{ color: '#2E7D32' }} />
              <Typography variant="subtitle1" fontWeight={800} color="#2E7D32">
                Booking Search Result Found
              </Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={2}>
                {[
                  ['Name', searchResult.memberName],
                  ['Mobile', searchResult.mobileNumber],
                  ['Grocery Card', searchResult.groceryCardNumber || '-'],
                  ['Liquor Card', searchResult.liquorCardNumber || '-'],
                  ['Token', searchResult.token],
                  ['Slot', searchResult.slotLabel],
                  ['Booking Type', searchResult.bookingType],
                ].map(([label, value]) => (
                  <Grid size={{ xs: 12, sm: 4, md: 3 }} key={label}>
                    <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ textTransform: 'uppercase', letterSpacing: '0.02em', mb: 0.5 }}>
                        {label}
                      </Typography>
                      <Typography variant="body1" fontWeight={700} color="#111827">
                        {value}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
                <Grid size={{ xs: 12, sm: 4, md: 3 }}>
                  <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: '#F9FAFB', border: '1px solid #E5E7EB', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ textTransform: 'uppercase', letterSpacing: '0.02em', mb: 0.5 }}>
                      Status
                    </Typography>
                    <Chip
                      label={searchResult.status}
                      size="small"
                      sx={{
                        ...getStatusChipStyles(searchResult.status),
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        alignSelf: 'flex-start',
                        height: 24
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>

              <Stack direction="row" spacing={1.5} mt={3}>
                <Button
                  variant="contained"
                  color="success"
                  disabled={searchResult.status !== 'BOOKED'}
                  onClick={() => handleCheckIn(searchResult.bookingId)}
                  sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, px: 3 }}
                >
                  Check In
                </Button>
                <Button
                  variant="outlined"
                  disabled={searchResult.status !== 'CHECKED_IN'}
                  onClick={() => handleCheckOut(searchResult.bookingId)}
                  sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, px: 3 }}
                >
                  Check Out
                </Button>
                <Button
                  color="error"
                  variant="outlined"
                  disabled={
                    searchResult.status === 'CHECKED_OUT' || searchResult.status === 'CANCELLED'
                  }
                  onClick={() => handleCancel(searchResult.bookingId)}
                  sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, px: 3 }}
                >
                  Cancel Booking
                </Button>
              </Stack>
            </CardContent>
          </Card>
        )}
      </Stack>

      <Dialog
        open={openScanner}
        onClose={() => setOpenScanner(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: { borderRadius: '16px', p: 1 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#111827' }}>Scan QR Code</DialogTitle>
        <DialogContent>
          <QrScanner
            onScan={async (token) => {
              try {
                setOpenScanner(false)

                const response = await getBookingByToken(token)
                const booking = response.data

                setSearch(booking.token)

                setSearchResult({
                  bookingId: booking.id,
                  memberName: booking.member.fullName,
                  mobileNumber: booking.member.mobileNumber,
                  groceryCardNumber: booking.member.groceryCardNumber,
                  liquorCardNumber: booking.member.liquorCardNumber,
                  token: booking.token,
                  slotLabel: booking.slot.label,
                  status: booking.status,
                  bookingType: booking.slot.cardType,
                })

                await loadQueue()
              } catch {
                setError('Booking not found.')
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
