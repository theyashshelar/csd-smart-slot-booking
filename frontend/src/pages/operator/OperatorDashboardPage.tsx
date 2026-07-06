import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
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
        <Box textAlign="center" mt={5}>
          <CircularProgress />
        </Box>
    )
  }

  return (
      <>
        <Stack spacing={3}>

            <Typography
                variant="h4"
                fontWeight={700}
            >
              Operator Dashboard
            </Typography>

            {error && (
                <Alert severity="error">
                  {error}
                </Alert>
            )}

            <Card>

              <CardContent>

                <Typography
                    variant="h6"
                    gutterBottom
                >
                  Today's Queue
                </Typography>

                <TableContainer>

                  <Table>

                    <TableHead>

                      <TableRow>

                        <TableCell>Token</TableCell>

                        <TableCell>Booking Date</TableCell>

                        <TableCell>Status</TableCell>

                        <TableCell>Check In</TableCell>

                        <TableCell>Check Out</TableCell>

                        <TableCell>Cancel</TableCell>

                      </TableRow>

                    </TableHead>

                    <TableBody>

                      {queue.map((booking) => (

                          <TableRow key={booking.id}>

                            <TableCell>
                              {booking.token}
                            </TableCell>

                            <TableCell>
                              {booking.bookingDate}
                            </TableCell>

                            <TableCell>

                              <Chip
                                  label={booking.status}
                                  color={
                                    booking.status === 'BOOKED'
                                        ? 'warning'
                                        : booking.status === 'CHECKED_IN'
                                            ? 'info'
                                            : booking.status === 'CHECKED_OUT'
                                                ? 'success'
                                                : 'error'
                                  }
                              />

                            </TableCell>
                            <TableCell>

                              <Button
                                  size="small"
                                  variant="contained"
                                  disabled={booking.status !== 'BOOKED'}
                                  onClick={() =>
                                      handleCheckIn(booking.id)
                                  }
                              >
                                Check In
                              </Button>

                            </TableCell>

                            <TableCell>

                              <Button
                                  size="small"
                                  variant="outlined"
                                  disabled={
                                      booking.status !== 'CHECKED_IN'
                                  }
                                  onClick={() =>
                                      handleCheckOut(booking.id)
                                  }
                              >
                                Check Out
                              </Button>

                            </TableCell>

                            <TableCell>

                              <Button
                                  size="small"
                                  color="error"
                                  variant="outlined"
                                  disabled={
                                      booking.status === 'CHECKED_OUT' ||
                                      booking.status === 'CANCELLED'
                                  }
                                  onClick={() =>
                                      handleCancel(booking.id)
                                  }
                              >
                                Cancel
                              </Button>

                            </TableCell>

                          </TableRow>

                      ))}

                    </TableBody>

                  </Table>

                </TableContainer>

              </CardContent>

            </Card>

          <Card>

            <CardContent>

              <Typography
                  variant="h6"
                  gutterBottom
              >
                Search Booking
              </Typography>

              <Stack direction="row" spacing={2}>

                <TextField
                    fullWidth
                    label="Token / Mobile / Card Number"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <Button
                    variant="contained"
                    onClick={handleSearch}
                >
                  Search
                </Button>

                <Button
                    variant="outlined"
                    onClick={() => setOpenScanner(true)}
                >
                  Scan QR
                </Button>

              </Stack>

            </CardContent>

          </Card>

          {searchResult && (

                <Card>

                  <CardContent>

                    <Typography
                        variant="h6"
                        gutterBottom
                    >
                      Search Result
                    </Typography>

                    <Stack spacing={2}>

                      <Typography>
                        <strong>Name:</strong>{' '}
                        {searchResult.memberName}
                      </Typography>

                      <Typography>
                        <strong>Mobile:</strong>{' '}
                        {searchResult.mobileNumber}
                      </Typography>

                      <Typography>
                        <strong>Grocery Card:</strong>{' '}
                        {searchResult.groceryCardNumber || '-'}
                      </Typography>

                      <Typography>
                        <strong>Liquor Card:</strong>{' '}
                        {searchResult.liquorCardNumber || '-'}
                      </Typography>

                      <Typography>
                        <strong>Token:</strong>{' '}
                        {searchResult.token}
                      </Typography>

                      <Typography>
                        <strong>Slot:</strong>{' '}
                        {searchResult.slotLabel}
                      </Typography>

                      <Typography>
                        <strong>Booking Type:</strong>{' '}
                        {searchResult.bookingType}
                      </Typography>

                      <Box>

                        <Chip
                            label={searchResult.status}
                            color={
                              searchResult.status === 'BOOKED'
                                  ? 'warning'
                                  : searchResult.status === 'CHECKED_IN'
                                      ? 'info'
                                      : searchResult.status === 'CHECKED_OUT'
                                          ? 'success'
                                          : 'error'
                            }
                        />

                      </Box>

                      <Stack
                          direction="row"
                          spacing={2}
                          mt={2}
                      >

                        <Button
                            variant="contained"
                            disabled={
                                searchResult.status !== 'BOOKED'
                            }
                            onClick={() =>
                                handleCheckIn(
                                    searchResult.bookingId
                                )
                            }
                        >
                          Check In
                        </Button>

                        <Button
                            variant="outlined"
                            disabled={
                                searchResult.status !==
                                'CHECKED_IN'
                            }
                            onClick={() =>
                                handleCheckOut(
                                    searchResult.bookingId
                                )
                            }
                        >
                          Check Out
                        </Button>

                        <Button
                            color="error"
                            variant="outlined"
                            disabled={
                                searchResult.status ===
                                'CHECKED_OUT' ||
                                searchResult.status ===
                                'CANCELLED'
                            }
                            onClick={() =>
                                handleCancel(
                                    searchResult.bookingId
                                )
                            }
                        >
                          Cancel
                        </Button>

                      </Stack>

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
            <DialogTitle>Scan QR Code</DialogTitle>
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
