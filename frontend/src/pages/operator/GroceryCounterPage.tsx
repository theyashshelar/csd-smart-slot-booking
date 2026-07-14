import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
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
  TableRow,
  Typography,
  Skeleton,
} from '@mui/material'

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

import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import DialogContent from "@mui/material/DialogContent"

import QrScanner from "./QrScanner"
import CounterHeader from '../../components/operator/CounterHeader'
import CounterSummaryCard from '../../components/operator/CounterSummaryCard'
import NowServingCard from '../../components/operator/NowServingCard'
import QueueTable from '../../components/operator/QueueTable'
import SearchPanel from '../../components/operator/SearchPanel'

export default function GroceryCounterPage() {
  const [queue, setQueue] = useState<OperatorBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [openScanner, setOpenScanner] = useState(false)
  const [search, setSearch] = useState('')
  const [searchResult, setSearchResult] = useState<OperatorSearchResponse | null>(null)
  const [error, setError] = useState('')
  const [searchError, setSearchError] = useState('')

  const getTodayString = () => {
    const d = new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const date = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${date}`
  }

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
        'Unable to load grocery queue and statistics.'
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
        // Enforce dedicated workspace boundary: only show result if it matches GROCERY
        if (response.data.bookingType === 'GROCERY') {
          setSearchResult(response.data)
        } else {
          setSearchError('This booking is registered for the Liquor Counter, not Grocery.')
        }
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

  // Filter strictly for GROCERY bookings
  const groceryQueue = queue.filter(b => b.slot?.cardType === 'GROCERY')

  const groceryTodayQueue = groceryQueue.filter(b => b.bookingDate === todayStr)

  // Grocery Summary Counts (Today)
  const groceryToday = groceryTodayQueue.length
  const groceryWaiting = groceryTodayQueue.filter(b => b.status === 'BOOKED').length
  const groceryCheckedIn = groceryTodayQueue.filter(b => b.status === 'CHECKED_IN').length
  const groceryCompleted = groceryTodayQueue.filter(b => b.status === 'CHECKED_OUT').length
  const groceryCancelled = groceryTodayQueue.filter(b => b.status === 'CANCELLED').length

  // Now Serving (Today, first waiting customer in grocery queue)
  const groceryServing = groceryTodayQueue.find(b => b.status === 'BOOKED') || null

  // Completed & Cancelled Today
  const completedToday = groceryTodayQueue.filter(b => b.status === 'CHECKED_OUT')
  const cancelledToday = groceryTodayQueue.filter(b => b.status === 'CANCELLED')

  if (loading) {
    return (
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#111827', letterSpacing: '-0.02em', mb: 0.5 }}>
            🥬 Grocery Counter Control
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Loading live grocery queue statistics...
          </Typography>
        </Box>

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

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: '12px' }} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: '12px' }} />
          </Grid>
        </Grid>
      </Stack>
    )
  }

  return (
    <>
      <Stack spacing={3}>
        <CounterHeader
          title="🥬 Grocery Counter Page"
          description="Process real-time grocery check-ins, scans, and queue states."
          onRefresh={() => loadQueueAndStats(true)}
        />

        {error && (
          <Alert severity="error" sx={{ borderRadius: '12px' }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Counter Summary */}
        <CounterSummaryCard
          cardType="GROCERY"
          total={groceryToday}
          waiting={groceryWaiting}
          checkedIn={groceryCheckedIn}
          completed={groceryCompleted}
          cancelled={groceryCancelled}
        />

        <Grid container spacing={3}>
          {/* Now Serving */}
          <Grid size={{ xs: 12, md: 6 }}>
            <NowServingCard
              cardType="GROCERY"
              serving={groceryServing}
              onCheckIn={handleCheckIn}
            />
          </Grid>

          {/* Search & Scan Panel */}
          <Grid size={{ xs: 12, md: 6 }}>
            <SearchPanel
              cardType="GROCERY"
              search={search}
              setSearch={setSearch}
              searchResult={searchResult}
              searchError={searchError}
              onSearch={handleSearch}
              onScanClick={() => setOpenScanner(true)}
              onCheckIn={handleCheckIn}
              onCheckOut={handleCheckOut}
              onCancel={handleCancel}
            />
          </Grid>
        </Grid>

        {/* Live Queue Table */}
        <QueueTable
          cardType="GROCERY"
          bookings={groceryQueue}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
          onCancel={handleCancel}
        />

        {/* Bottom Lists: Completed and Cancelled Today */}
        <Grid container spacing={3}>
          {/* Completed Today */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card id="completed-grocery-card" sx={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: 'none' }}>
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
                      <TableCell sx={{ fontWeight: 700, bgcolor: '#FFFFFF' }}>Status</TableCell>
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
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#1B5E20' }}>{b.token}</TableCell>
                          <TableCell sx={{ fontSize: '0.8rem' }}>{b.member?.fullName}</TableCell>
                          <TableCell sx={{ fontSize: '0.8rem' }}>
                            <Chip label="COMPLETED" size="small" variant="outlined" color="success" sx={{ fontSize: '0.65rem', height: 18 }} />
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
          <Grid size={{ xs: 12, md: 6 }}>
            <Card id="cancelled-grocery-card" sx={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: 'none' }}>
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
                      <TableCell sx={{ fontWeight: 700, bgcolor: '#FFFFFF' }}>Status</TableCell>
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
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#B91C1C' }}>{b.token}</TableCell>
                          <TableCell sx={{ fontSize: '0.8rem' }}>{b.member?.fullName}</TableCell>
                          <TableCell sx={{ fontSize: '0.8rem' }}>
                            <Chip label="CANCELLED" size="small" variant="outlined" color="error" sx={{ fontSize: '0.65rem', height: 18 }} />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>
        </Grid>
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
        <DialogTitle sx={{ fontWeight: 800, color: '#111827', fontSize: '1.1rem' }}>Scan QR Code (Grocery)</DialogTitle>
        <DialogContent>
          <QrScanner
            onScan={async (token) => {
              try {
                setOpenScanner(false)

                const response = await getBookingByToken(token)
                const booking = response.data

                if (booking.slot?.cardType !== 'GROCERY') {
                  setSearchError('This scanned QR is registered for the Liquor Counter, not Grocery.')
                  setSearchResult(null)
                  return
                }

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
