import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
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
} from '@mui/material'

import {
  getQueue,
  searchBooking,
  checkIn,
  checkOut,
  cancelBooking,
  getBookingByToken
} from '../../services/api'

import type {
  Booking,
  OperatorSearchResponse,
} from '../../types/api'

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";

import QrScanner from "./QrScanner";

export default function OperatorDashboardPage() {

  const [queue, setQueue] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  const [openScanner, setOpenScanner] = useState(false);

  const [search, setSearch] = useState('')
  const [searchResult, setSearchResult] =
      useState<OperatorSearchResponse | null>(null)

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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress color="success" />
      </Box>
    )
  }

  return (
    <>
      <Stack spacing={2}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>
            Operator Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Process real-time member check-ins, scans, and queue states.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ borderRadius: '10px' }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Card sx={{ borderRadius: '12px' }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
              Today's Queue
            </Typography>

            <Box sx={{ border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' }}>
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ bgcolor: '#F9FAFB', fontWeight: 600 }}>Token</TableCell>
                      <TableCell sx={{ bgcolor: '#F9FAFB', fontWeight: 600 }}>Booking Date</TableCell>
                      <TableCell sx={{ bgcolor: '#F9FAFB', fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ bgcolor: '#F9FAFB', fontWeight: 600, align: 'center' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {queue.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                          No active bookings in queue
                        </TableCell>
                      </TableRow>
                    ) : (
                      queue.map((booking) => (
                        <TableRow key={booking.id} hover>
                          <TableCell sx={{ fontWeight: 700, color: '#111827' }}>
                            {booking.token}
                          </TableCell>
                          <TableCell>
                            {booking.bookingDate}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={booking.status}
                              size="small"
                              color={
                                booking.status === 'BOOKED'
                                  ? 'warning'
                                  : booking.status === 'CHECKED_IN'
                                    ? 'info'
                                    : booking.status === 'CHECKED_OUT'
                                      ? 'success'
                                      : 'error'
                              }
                              sx={{ borderRadius: '999px', fontSize: '0.7rem', height: 20 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={0.8}>
                              <Button
                                size="small"
                                variant="contained"
                                disabled={booking.status !== 'BOOKED'}
                                onClick={() => handleCheckIn(booking.id)}
                              >
                                Check In
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                disabled={booking.status !== 'CHECKED_IN'}
                                onClick={() => handleCheckOut(booking.id)}
                              >
                                Check Out
                              </Button>
                              <Button
                                size="small"
                                color="error"
                                variant="outlined"
                                disabled={
                                  booking.status === 'CHECKED_OUT' ||
                                  booking.status === 'CANCELLED'
                                }
                                onClick={() => handleCancel(booking.id)}
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

        <Card sx={{ borderRadius: '12px' }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
              Search Booking
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <TextField
                fullWidth
                size="small"
                label="Token / Mobile / Card Number"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Stack direction="row" spacing={1} sx={{ height: 38 }}>
                <Button variant="contained" onClick={handleSearch} sx={{ px: 3 }}>
                  Search
                </Button>
                <Button variant="outlined" onClick={() => setOpenScanner(true)} sx={{ px: 3 }}>
                  Scan QR
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {searchResult && (
          <Card sx={{ borderRadius: '12px', border: '1.5px solid #2E7D32' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5, color: '#2E7D32' }}>
                Search Result
              </Typography>

              <Grid container spacing={1.5}>
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
                    <Box sx={{ p: 1.2, borderRadius: '10px', bgcolor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={500} display="block">
                        {label}
                      </Typography>
                      <Typography variant="body2" fontWeight={600} color="#111827">
                        {value}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
                <Grid size={{ xs: 12, sm: 4, md: 3 }}>
                  <Box sx={{ p: 1.2, borderRadius: '10px', bgcolor: '#F9FAFB', border: '1px solid #E5E7EB', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={500} display="block" sx={{ mb: 0.5 }}>
                      Status
                    </Typography>
                    <Chip
                      label={searchResult.status}
                      size="small"
                      color={
                        searchResult.status === 'BOOKED'
                          ? 'warning'
                          : searchResult.status === 'CHECKED_IN'
                            ? 'info'
                            : searchResult.status === 'CHECKED_OUT'
                              ? 'success'
                              : 'error'
                      }
                      sx={{ borderRadius: '999px', fontSize: '0.7rem', height: 20, alignSelf: 'flex-start' }}
                    />
                  </Box>
                </Grid>
              </Grid>

              <Stack direction="row" spacing={1} mt={2}>
                <Button
                  variant="contained"
                  disabled={searchResult.status !== 'BOOKED'}
                  onClick={() => handleCheckIn(searchResult.bookingId)}
                >
                  Check In
                </Button>
                <Button
                  variant="outlined"
                  disabled={searchResult.status !== 'CHECKED_IN'}
                  onClick={() => handleCheckOut(searchResult.bookingId)}
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
                >
                  Cancel
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
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Scan QR Code</DialogTitle>
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
