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
  Tabs,
  Tab,
} from '@mui/material'

import {
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon,
  QrCodeScanner as QrCodeScannerIcon,
  Inbox as InboxIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material'

import {
  getQueue,
  searchBooking,
  checkIn,
  checkOut,
  cancelBooking,
  getBookingByToken,
} from '../../services/api'

import type {
  OperatorBooking,
  OperatorSearchResponse,
} from '../../types/api'

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";

import QrScanner from "./QrScanner";
import { formatSlotLabel } from '../../utils/timeFormatter'

export default function OperatorDashboardPage() {

  const [queue, setQueue] = useState<OperatorBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [openScanner, setOpenScanner] = useState(false)
  const [search, setSearch] = useState('')
  const [searchResult, setSearchResult] = useState<OperatorSearchResponse | null>(null)
  const [error, setError] = useState('')
  const [searchError, setSearchError] = useState('')

  // Separate tab states for independent queue navigation
  const [groceryTab, setGroceryTab] = useState<'today' | 'upcoming'>('today')
  const [liquorTab, setLiquorTab] = useState<'today' | 'upcoming'>('today')

  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${date}`;
  };

  const loadQueueAndStats = async (showSkeleton = false) => {
    if (showSkeleton) {
      setLoading(true)
    }
    setError('')
    try {
      const response = await getQueue()
      setQueue(response.data || [])
    } catch (e: any) {
      setError(
          e?.response?.data?.message ||
          'Unable to load queue and statistics.'
      )
    } finally {
      if (showSkeleton) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    void loadQueueAndStats(true)

    const interval = setInterval(() => {
      void loadQueueAndStats(false)
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const handleSearch = async () => {
    if (!search.trim()) return

    setSearchError('')
    setSearchResult(null)

    try {
      const response = await searchBooking({
        token: search,
        mobileNumber: search,
        cardNumber: search,
      })
      if (response.data) {
        setSearchResult(response.data)
      } else {
        setSearchError('No booking found.')
      }
    } catch (e: any) {
      setSearchError('No booking found.')
    }
  }

  const handleCheckIn = async (bookingId: number) => {
    try {
      await checkIn(bookingId)
      await loadQueueAndStats(false)
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
      await loadQueueAndStats(false)
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
      await loadQueueAndStats(false)
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

  const todayStr = getTodayString()

  // 1. Partition queue by cardType
  const groceryQueue = queue.filter(b => b.slot?.cardType === 'GROCERY')
  const liquorQueue = queue.filter(b => b.slot?.cardType === 'LIQUOR')

  // 2. Today's sorted queues
  const groceryTodayQueue = groceryQueue
    .filter(b => b.bookingDate === todayStr)
    .sort((a, b) => {
      const startTimeA = a.slot?.startTime || '';
      const startTimeB = b.slot?.startTime || '';
      if (startTimeA !== startTimeB) {
        return startTimeA.localeCompare(startTimeB);
      }
      return (a.token || '').localeCompare(b.token || '');
    });

  const liquorTodayQueue = liquorQueue
    .filter(b => b.bookingDate === todayStr)
    .sort((a, b) => {
      const startTimeA = a.slot?.startTime || '';
      const startTimeB = b.slot?.startTime || '';
      if (startTimeA !== startTimeB) {
        return startTimeA.localeCompare(startTimeB);
      }
      return (a.token || '').localeCompare(b.token || '');
    });

  // 3. Upcoming sorted queues
  const groceryUpcomingQueue = groceryQueue
    .filter(b => b.bookingDate > todayStr)
    .sort((a, b) => {
      const dateComp = (a.bookingDate || '').localeCompare(b.bookingDate || '');
      if (dateComp !== 0) return dateComp;
      const startTimeA = a.slot?.startTime || '';
      const startTimeB = b.slot?.startTime || '';
      if (startTimeA !== startTimeB) {
        return startTimeA.localeCompare(startTimeB);
      }
      return (a.token || '').localeCompare(b.token || '');
    });

  const liquorUpcomingQueue = liquorQueue
    .filter(b => b.bookingDate > todayStr)
    .sort((a, b) => {
      const dateComp = (a.bookingDate || '').localeCompare(b.bookingDate || '');
      if (dateComp !== 0) return dateComp;
      const startTimeA = a.slot?.startTime || '';
      const startTimeB = b.slot?.startTime || '';
      if (startTimeA !== startTimeB) {
        return startTimeA.localeCompare(startTimeB);
      }
      return (a.token || '').localeCompare(b.token || '');
    });

  // 4. Summaries (Today)
  const groceryToday = groceryTodayQueue.length;
  const groceryWaiting = groceryTodayQueue.filter(b => b.status === 'BOOKED').length;
  const groceryCheckedIn = groceryTodayQueue.filter(b => b.status === 'CHECKED_IN').length;
  const groceryCompleted = groceryTodayQueue.filter(b => b.status === 'CHECKED_OUT').length;
  const groceryCancelled = groceryTodayQueue.filter(b => b.status === 'CANCELLED').length;

  const liquorToday = liquorTodayQueue.length;
  const liquorWaiting = liquorTodayQueue.filter(b => b.status === 'BOOKED').length;
  const liquorCheckedIn = liquorTodayQueue.filter(b => b.status === 'CHECKED_IN').length;
  const liquorCompleted = liquorTodayQueue.filter(b => b.status === 'CHECKED_OUT').length;
  const liquorCancelled = liquorTodayQueue.filter(b => b.status === 'CANCELLED').length;

  // 5. Now Serving (Today)
  const groceryServing = groceryTodayQueue.find(b => b.status === 'BOOKED') || null;
  const liquorServing = liquorTodayQueue.find(b => b.status === 'BOOKED') || null;

  // 6. Up Next (Up to 3 next waiting tokens)

  // 7. Completed and Cancelled Today (Across both counters)
  const completedToday = [...groceryTodayQueue, ...liquorTodayQueue]
    .filter(b => b.status === 'CHECKED_OUT');

  const cancelledToday = [...groceryTodayQueue, ...liquorTodayQueue]
    .filter(b => b.status === 'CANCELLED');

  const getStatusChipStyles = (status: string) => {
    switch (status) {
      case 'BOOKED':
        return {
          bgcolor: '#FEF3C7',
          color: '#B45309',
          border: '1px solid #FCD34D',
          borderRadius: '9999px',
        };
      case 'CHECKED_IN':
        return {
          bgcolor: '#D1FAE5',
          color: '#047857',
          border: '1px solid #6EE7B7',
          borderRadius: '9999px',
        };
      case 'CHECKED_OUT':
        return {
          bgcolor: '#DBEAFE',
          color: '#1D4ED8',
          border: '1px solid #93C5FD',
          borderRadius: '9999px',
        };
      case 'CANCELLED':
        return {
          bgcolor: '#FEE2E2',
          color: '#B91C1C',
          border: '1px solid #FCA5A5',
          borderRadius: '9999px',
        };
      default:
        return {
          borderRadius: '9999px',
        };
    }
  };

  const renderEmptyState = (message: string, description: string) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 3, px: 2 }}>
      <Box sx={{
        p: 1.5,
        borderRadius: '50%',
        bgcolor: '#F3F4F6',
        color: '#9CA3AF',
        mb: 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <InboxIcon sx={{ fontSize: 36 }} />
      </Box>
      <Typography variant="subtitle2" color="#111827" fontWeight={800} align="center">
        {message}
      </Typography>
      <Typography variant="caption" color="text.secondary" align="center" sx={{ mt: 0.5, maxWidth: 300 }}>
        {description}
      </Typography>
    </Box>
  )

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
        <Grid container spacing={2.5}>
          {[1, 2].map((i) => (
            <Grid size={{ xs: 12, md: 6 }} key={i}>
              <Card sx={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: 'none' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Skeleton variant="circular" width={44} height={44} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="60%" height={18} />
                      <Skeleton variant="text" width="40%" height={28} />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Double Queues Skeleton */}
        <Grid container spacing={3}>
          {[1, 2].map((i) => (
            <Grid size={{ xs: 12, md: 6 }} key={i}>
              <Card sx={{ borderRadius: '12px', border: '1px solid #E5E7EB', p: 3 }}>
                <Skeleton variant="text" width="30%" height={24} sx={{ mb: 1.5 }} />
                <Skeleton variant="text" width="60%" height={60} sx={{ mb: 1.5 }} />
                <Skeleton variant="rectangular" height={150} sx={{ borderRadius: '8px' }} />
              </Card>
            </Grid>
          ))}
        </Grid>
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
            color="success"
            onClick={() => loadQueueAndStats(true)}
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

        {/* Top Row: Summaries */}
        <Grid container spacing={3}>
          {/* Grocery Summary */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: 'none' }}>
              <Box sx={{ bgcolor: '#E8F5E9', px: 3, py: 1.5, borderBottom: '1px solid #C8E6C9' }}>
                <Typography variant="subtitle2" fontWeight={800} color="#1B5E20">
                  🥬 Grocery Counter Summary (Today)
                </Typography>
              </Box>
              <CardContent sx={{ p: 2 }}>
                <Grid container spacing={1}>
                  {[
                    ['Total Booked', groceryToday, '#1E293B'],
                    ['Waiting', groceryWaiting, '#D97706'],
                    ['Checked In', groceryCheckedIn, '#059669'],
                    ['Completed', groceryCompleted, '#2563EB'],
                    ['Cancelled', groceryCancelled, '#DC2626'],
                  ].map(([label, val, color]) => (
                    <Grid size={{ xs: 4, sm: 2.4 }} key={label as string}>
                      <Box sx={{ textAlign: 'center', p: 1, bgcolor: '#F9FAFB', borderRadius: '8px' }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ fontSize: '0.68rem' }}>
                          {label}
                        </Typography>
                        <Typography variant="subtitle1" fontWeight={800} color={color as string} sx={{ mt: 0.2 }}>
                          {val}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Liquor Summary */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: 'none' }}>
              <Box sx={{ bgcolor: '#FFF3E0', px: 3, py: 1.5, borderBottom: '1px solid #FFE0B2' }}>
                <Typography variant="subtitle2" fontWeight={800} color="#E65100">
                  🥃 Liquor Counter Summary (Today)
                </Typography>
              </Box>
              <CardContent sx={{ p: 2 }}>
                <Grid container spacing={1}>
                  {[
                    ['Total Booked', liquorToday, '#1E293B'],
                    ['Waiting', liquorWaiting, '#D97706'],
                    ['Checked In', liquorCheckedIn, '#059669'],
                    ['Completed', liquorCompleted, '#2563EB'],
                    ['Cancelled', liquorCancelled, '#DC2626'],
                  ].map(([label, val, color]) => (
                    <Grid size={{ xs: 4, sm: 2.4 }} key={label as string}>
                      <Box sx={{ textAlign: 'center', p: 1, bgcolor: '#F9FAFB', borderRadius: '8px' }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ fontSize: '0.68rem' }}>
                          {label}
                        </Typography>
                        <Typography variant="subtitle1" fontWeight={800} color={color as string} sx={{ mt: 0.2 }}>
                          {val}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Middle Row: Split Queues */}
        <Grid container spacing={3}>
          {/* Grocery Queue Column */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Stack spacing={3}>
              {/* NOW SERVING - GROCERY */}
              <Card sx={{ borderRadius: '12px', border: '1px solid #A5D6A7', bgcolor: '#E8F5E9', p: 2.5, position: 'relative', overflow: 'hidden' }}>
                <Box sx={{
                  position: 'absolute',
                  right: -20,
                  top: -20,
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  bgcolor: 'rgba(74, 222, 128, 0.15)',
                  zIndex: 0
                }} />
                
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Typography variant="caption" fontWeight={800} color="#1B5E20" sx={{ letterSpacing: '0.05em', display: 'block', mb: 1.5 }}>
                    🥬 GROCERY COUNTER — NOW SERVING
                  </Typography>
                  {groceryServing ? (
                    <Stack spacing={2}>
                      <Typography variant="h2" fontWeight={900} color="#1B5E20" sx={{ lineHeight: 1 }}>
                        {groceryServing.token}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="#1B5E20" fontWeight={600} display="block">Customer Name</Typography>
                          <Typography variant="subtitle2" fontWeight={800} color="#111827">{groceryServing.member?.fullName || 'Unknown'}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="#1B5E20" fontWeight={600} display="block">Time Slot</Typography>
                          <Typography variant="subtitle2" fontWeight={800} color="#111827">{groceryServing.slot?.label || 'N/A'}</Typography>
                        </Grid>
                      </Grid>
                      <Box sx={{ pt: 1 }}>
                        <Button
                          variant="contained"
                          color="success"
                          size="medium"
                          startIcon={<CheckCircleIcon />}
                          sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
                          onClick={() => handleCheckIn(groceryServing.id)}
                        >
                          Check In Customer
                        </Button>
                      </Box>
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2, fontStyle: 'italic' }}>
                      No customer waiting at Grocery counter.
                    </Typography>
                  )}
                </Box>
              </Card>

              {/* LIVE QUEUE - GROCERY */}
              <Card sx={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: 'none' }}>
                <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="subtitle2" fontWeight={800} color="#111827">
                    🥬 Grocery Live Queue ({groceryTodayQueue.length})
                  </Typography>
                  <Tabs
                    value={groceryTab}
                    onChange={(_, val) => setGroceryTab(val)}
                    textColor="primary"
                    indicatorColor="primary"
                    sx={{ minHeight: 32, '& .MuiTab-root': { py: 0.5, minHeight: 32, fontSize: '0.8rem', fontWeight: 800, textTransform: 'none' } }}
                  >
                    <Tab value="today" label="Today" />
                    <Tab value="upcoming" label="Upcoming" />
                  </Tabs>
                </Box>
                <TableContainer sx={{ maxHeight: 300 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, bgcolor: '#F9FAFB' }}>Token</TableCell>
                        <TableCell sx={{ fontWeight: 700, bgcolor: '#F9FAFB' }}>Customer</TableCell>
                        <TableCell sx={{ fontWeight: 700, bgcolor: '#F9FAFB' }}>Slot/Date</TableCell>
                        <TableCell sx={{ fontWeight: 700, bgcolor: '#F9FAFB' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700, bgcolor: '#F9FAFB', textAlign: 'center' }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(groceryTab === 'today' ? groceryTodayQueue : groceryUpcomingQueue).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                            {renderEmptyState(
                              "No Grocery Bookings Found",
                              groceryTab === 'today' ? "There are no bookings in the grocery queue for today." : "No upcoming grocery bookings registered."
                            )}
                          </TableCell>
                        </TableRow>
                      ) : (
                        (groceryTab === 'today' ? groceryTodayQueue : groceryUpcomingQueue).map((booking) => (
                          <TableRow key={booking.id} hover>
                            <TableCell sx={{ fontWeight: 800, color: '#1B5E20' }}>{booking.token}</TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={700} color="#111827">{booking.member?.fullName || 'Unknown'}</Typography>
                              <Typography variant="caption" color="text.secondary" display="block">{booking.member?.mobileNumber || ''}</Typography>
                            </TableCell>
                            <TableCell>
                              {groceryTab === 'today' ? booking.slot?.label : `${booking.bookingDate} (${booking.slot?.label})`}
                            </TableCell>
                            <TableCell>
                              <Chip label={booking.status} size="small" sx={{ ...getStatusChipStyles(booking.status), fontSize: '0.65rem', height: 20 }} />
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={0.5} justifyContent="center">
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="success"
                                  disabled={booking.status !== 'BOOKED' || groceryTab === 'upcoming'}
                                  onClick={() => handleCheckIn(booking.id)}
                                  sx={{ fontSize: '0.7rem', px: 1, py: 0.2, minWidth: 44, textTransform: 'none', fontWeight: 600 }}
                                >
                                  In
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                  disabled={booking.status !== 'CHECKED_IN' || groceryTab === 'upcoming'}
                                  onClick={() => handleCheckOut(booking.id)}
                                  sx={{ fontSize: '0.7rem', px: 1, py: 0.2, minWidth: 44, textTransform: 'none', fontWeight: 600 }}
                                >
                                  Out
                                </Button>
                                <Button
                                  size="small"
                                  color="error"
                                  disabled={booking.status === 'CHECKED_OUT' || booking.status === 'CANCELLED'}
                                  onClick={() => handleCancel(booking.id)}
                                  sx={{ fontSize: '0.7rem', px: 1, py: 0.2, textTransform: 'none', minWidth: 0, fontWeight: 500 }}
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
              </Card>
            </Stack>
          </Grid>

          {/* Liquor Queue Column */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Stack spacing={3}>
              {/* NOW SERVING - LIQUOR */}
              <Card sx={{ borderRadius: '12px', border: '1px solid #FFCC80', bgcolor: '#FFF3E0', p: 2.5, position: 'relative', overflow: 'hidden' }}>
                <Box sx={{
                  position: 'absolute',
                  right: -20,
                  top: -20,
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  bgcolor: 'rgba(255, 152, 0, 0.12)',
                  zIndex: 0
                }} />

                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Typography variant="caption" fontWeight={800} color="#E65100" sx={{ letterSpacing: '0.05em', display: 'block', mb: 1.5 }}>
                    🥃 LIQUOR COUNTER — NOW SERVING
                  </Typography>
                  {liquorServing ? (
                    <Stack spacing={2}>
                      <Typography variant="h2" fontWeight={900} color="#E65100" sx={{ lineHeight: 1 }}>
                        {liquorServing.token}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="#E65100" fontWeight={600} display="block">Customer Name</Typography>
                          <Typography variant="subtitle2" fontWeight={800} color="#111827">{liquorServing.member?.fullName || 'Unknown'}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="#E65100" fontWeight={600} display="block">Time Slot</Typography>
                          <Typography variant="subtitle2" fontWeight={800} color="#111827">{liquorServing.slot?.label || 'N/A'}</Typography>
                        </Grid>
                      </Grid>
                      <Box sx={{ pt: 1 }}>
                        <Button
                          variant="contained"
                          color="success"
                          size="medium"
                          startIcon={<CheckCircleIcon />}
                          sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
                          onClick={() => handleCheckIn(liquorServing.id)}
                        >
                          Check In Customer
                        </Button>
                      </Box>
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2, fontStyle: 'italic' }}>
                      No customer waiting at Liquor counter.
                    </Typography>
                  )}
                </Box>
              </Card>

              {/* LIVE QUEUE - LIQUOR */}
              <Card sx={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: 'none' }}>
                <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="subtitle2" fontWeight={800} color="#111827">
                    🥃 Liquor Live Queue ({liquorTodayQueue.length})
                  </Typography>
                  <Tabs
                    value={liquorTab}
                    onChange={(_, val) => setLiquorTab(val)}
                    textColor="secondary"
                    indicatorColor="secondary"
                    sx={{ minHeight: 32, '& .MuiTab-root': { py: 0.5, minHeight: 32, fontSize: '0.8rem', fontWeight: 800, textTransform: 'none' } }}
                  >
                    <Tab value="today" label="Today" />
                    <Tab value="upcoming" label="Upcoming" />
                  </Tabs>
                </Box>
                <TableContainer sx={{ maxHeight: 300 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, bgcolor: '#F9FAFB' }}>Token</TableCell>
                        <TableCell sx={{ fontWeight: 700, bgcolor: '#F9FAFB' }}>Customer</TableCell>
                        <TableCell sx={{ fontWeight: 700, bgcolor: '#F9FAFB' }}>Slot/Date</TableCell>
                        <TableCell sx={{ fontWeight: 700, bgcolor: '#F9FAFB' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700, bgcolor: '#F9FAFB', textAlign: 'center' }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(liquorTab === 'today' ? liquorTodayQueue : liquorUpcomingQueue).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                            {renderEmptyState(
                              "No Liquor Bookings Found",
                              liquorTab === 'today' ? "There are no bookings in the liquor queue for today." : "No upcoming liquor bookings registered."
                            )}
                          </TableCell>
                        </TableRow>
                      ) : (
                        (liquorTab === 'today' ? liquorTodayQueue : liquorUpcomingQueue).map((booking) => (
                          <TableRow key={booking.id} hover>
                            <TableCell sx={{ fontWeight: 800, color: '#E65100' }}>{booking.token}</TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={700} color="#111827">{booking.member?.fullName || 'Unknown'}</Typography>
                              <Typography variant="caption" color="text.secondary" display="block">{booking.member?.mobileNumber || ''}</Typography>
                            </TableCell>
                            <TableCell>
                              {liquorTab === 'today' ? booking.slot?.label : `${booking.bookingDate} (${booking.slot?.label})`}
                            </TableCell>
                            <TableCell>
                              <Chip label={booking.status} size="small" sx={{ ...getStatusChipStyles(booking.status), fontSize: '0.65rem', height: 20 }} />
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={0.5} justifyContent="center">
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="success"
                                  disabled={booking.status !== 'BOOKED' || liquorTab === 'upcoming'}
                                  onClick={() => handleCheckIn(booking.id)}
                                  sx={{ fontSize: '0.7rem', px: 1, py: 0.2, minWidth: 44, textTransform: 'none', fontWeight: 600 }}
                                >
                                  In
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                  disabled={booking.status !== 'CHECKED_IN' || liquorTab === 'upcoming'}
                                  onClick={() => handleCheckOut(booking.id)}
                                  sx={{ fontSize: '0.7rem', px: 1, py: 0.2, minWidth: 44, textTransform: 'none', fontWeight: 600 }}
                                >
                                  Out
                                </Button>
                                <Button
                                  size="small"
                                  color="error"
                                  disabled={booking.status === 'CHECKED_OUT' || booking.status === 'CANCELLED'}
                                  onClick={() => handleCancel(booking.id)}
                                  sx={{ fontSize: '0.7rem', px: 1, py: 0.2, textTransform: 'none', minWidth: 0, fontWeight: 500 }}
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
              </Card>
            </Stack>
          </Grid>
        </Grid>

        {/* Bottom Row: Completed, Cancelled, Search Directory */}
        <Grid container spacing={3}>
          {/* Completed Today */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: 'none' }}>
              <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid #E5E7EB', bgcolor: '#F9FAFB' }}>
                <Typography variant="subtitle2" fontWeight={800} color="#111827">
                  ✅ Completed Today ({completedToday.length})
                </Typography>
              </Box>
              <TableContainer sx={{ maxHeight: 250 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, bgcolor: '#FFFFFF' }}>Token</TableCell>
                      <TableCell sx={{ fontWeight: 700, bgcolor: '#FFFFFF' }}>Customer</TableCell>
                      <TableCell sx={{ fontWeight: 700, bgcolor: '#FFFFFF' }}>Type</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {completedToday.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} align="center" sx={{ py: 4, color: 'text.secondary', fontStyle: 'italic', fontSize: '0.8rem' }}>
                          No completed bookings yet today.
                        </TableCell>
                      </TableRow>
                    ) : (
                      completedToday.map((b) => (
                        <TableRow key={b.id} hover>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>{b.token}</TableCell>
                          <TableCell sx={{ fontSize: '0.8rem' }}>{b.member?.fullName}</TableCell>
                          <TableCell sx={{ fontSize: '0.8rem' }}>
                            <Chip label={b.slot?.cardType} size="small" variant="outlined" color={b.slot?.cardType === 'GROCERY' ? 'success' : 'warning'} sx={{ fontSize: '0.65rem', height: 18 }} />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>

          {/* Cancelled Today */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: 'none' }}>
              <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid #E5E7EB', bgcolor: '#F9FAFB' }}>
                <Typography variant="subtitle2" fontWeight={800} color="#111827">
                  ❌ Cancelled Today ({cancelledToday.length})
                </Typography>
              </Box>
              <TableContainer sx={{ maxHeight: 250 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, bgcolor: '#FFFFFF' }}>Token</TableCell>
                      <TableCell sx={{ fontWeight: 700, bgcolor: '#FFFFFF' }}>Customer</TableCell>
                      <TableCell sx={{ fontWeight: 700, bgcolor: '#FFFFFF' }}>Type</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cancelledToday.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} align="center" sx={{ py: 4, color: 'text.secondary', fontStyle: 'italic', fontSize: '0.8rem' }}>
                          No cancelled bookings today.
                        </TableCell>
                      </TableRow>
                    ) : (
                      cancelledToday.map((b) => (
                        <TableRow key={b.id} hover>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>{b.token}</TableCell>
                          <TableCell sx={{ fontSize: '0.8rem' }}>{b.member?.fullName}</TableCell>
                          <TableCell sx={{ fontSize: '0.8rem' }}>
                            <Chip label={b.slot?.cardType} size="small" variant="outlined" color={b.slot?.cardType === 'GROCERY' ? 'success' : 'warning'} sx={{ fontSize: '0.65rem', height: 18 }} />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>

          {/* Search Booking Directory / Recent Activity */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: 'none' }}>
              <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid #E5E7EB', bgcolor: '#F9FAFB' }}>
                <Typography variant="subtitle2" fontWeight={800} color="#111827">
                  🔍 Search & Scan Directory
                </Typography>
              </Box>
              <CardContent sx={{ p: 2 }}>
                <Stack spacing={1.5}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Search booking"
                    placeholder="Token / Mobile / Card Number..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      if (searchError) setSearchError('')
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') void handleSearch()
                    }}
                  />
                  <Stack direction="row" spacing={1}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleSearch}
                      startIcon={<SearchIcon />}
                      size="small"
                      color="success"
                      sx={{ textTransform: 'none', fontWeight: 600, height: 36 }}
                    >
                      Search
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => setOpenScanner(true)}
                      startIcon={<QrCodeScannerIcon />}
                      size="small"
                      color="success"
                      sx={{ textTransform: 'none', fontWeight: 600, height: 36 }}
                    >
                      Scan QR
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search Result display */}
        {searchResult && (
          <Card sx={{ borderRadius: '12px', border: '1.5px solid #2E7D32', boxShadow: '0 8px 16px rgba(46, 125, 50, 0.05)', overflow: 'hidden' }}>
            <Box sx={{ bgcolor: 'rgba(46, 125, 50, 0.04)', px: 3, py: 1.5, borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 1 }}>
              <SearchIcon sx={{ color: '#2E7D32' }} />
              <Typography variant="subtitle2" fontWeight={800} color="#2E7D32">
                Booking Search Result Found
              </Typography>
            </Box>
            <CardContent sx={{ p: 2.5 }}>
              <Grid container spacing={1.5}>
                {[
                  ['Name', searchResult.memberName],
                  ['Mobile', searchResult.mobileNumber],
                  ['Grocery Card', searchResult.groceryCardNumber || '-'],
                  ['Liquor Card', searchResult.liquorCardNumber || '-'],
                  ['Token', searchResult.token],
                  ['Slot', formatSlotLabel(searchResult.slotLabel)],
                  ['Booking Type', searchResult.bookingType],
                ].map(([label, value]) => (
                  <Grid size={{ xs: 12, sm: 4, md: 3 }} key={label}>
                    <Box sx={{ p: 1.2, borderRadius: '8px', bgcolor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ textTransform: 'uppercase', letterSpacing: '0.02em', mb: 0.2, fontSize: '0.68rem' }}>
                        {label}
                      </Typography>
                      <Typography variant="body2" fontWeight={700} color="#111827">
                        {value}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
                <Grid size={{ xs: 12, sm: 4, md: 3 }}>
                  <Box sx={{ p: 1.2, borderRadius: '8px', bgcolor: '#F9FAFB', border: '1px solid #E5E7EB', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ textTransform: 'uppercase', letterSpacing: '0.02em', mb: 0.2, fontSize: '0.68rem' }}>
                      Status
                    </Typography>
                    <Chip
                      label={searchResult.status}
                      size="small"
                      sx={{
                        ...getStatusChipStyles(searchResult.status),
                        borderRadius: '9999px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        alignSelf: 'flex-start',
                        height: 22
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>

              <Stack direction="row" spacing={1.5} mt={2.5}>
                <Button
                  variant="contained"
                  color="success"
                  disabled={searchResult.status !== 'BOOKED'}
                  onClick={() => handleCheckIn(searchResult.bookingId)}
                  sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, px: 3 }}
                >
                  Check In
                </Button>
                <Button
                  variant="outlined"
                  disabled={searchResult.status !== 'CHECKED_IN'}
                  onClick={() => handleCheckOut(searchResult.bookingId)}
                  sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, px: 3 }}
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
                  sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, px: 3 }}
                >
                  Cancel Booking
                </Button>
              </Stack>
            </CardContent>
          </Card>
        )}

        {searchError && (
          <Card sx={{ borderRadius: '12px', border: '1.5px dashed #EF4444', p: 3, textAlign: 'center', bgcolor: '#FEF2F2' }}>
            <Box sx={{ color: '#EF4444', mb: 1, display: 'flex', justifyContent: 'center' }}>
              <CancelIcon sx={{ fontSize: 36 }} />
            </Box>
            <Typography variant="subtitle2" fontWeight={800} color="#991B1B">
              No Booking Found
            </Typography>
            <Typography variant="caption" color="#B91C1C" sx={{ mt: 0.5, display: 'block' }}>
              We couldn't find any booking matching your query. Please verify the credentials or try searching again.
            </Typography>
          </Card>
        )}
      </Stack>

      <Dialog
        open={openScanner}
        onClose={() => setOpenScanner(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: { borderRadius: '12px', p: 1 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#111827', fontSize: '1.1rem' }}>Scan QR Code</DialogTitle>
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

                await loadQueueAndStats(false)
              } catch {
                setSearchError('No booking found.')
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
