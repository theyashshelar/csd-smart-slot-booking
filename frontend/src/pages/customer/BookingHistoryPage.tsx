import { useEffect, useState } from 'react'
import {
    Box,
    Card,
    CardContent,
    Typography,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Stack,
} from '@mui/material'
import { getMemberBookings } from '../../services/api'
import type { Booking } from '../../types/api'

export default function BookingHistoryPage() {
    const memberId = Number(localStorage.getItem('memberId'))

    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getMemberBookings(memberId)
            .then((response) => {
                setBookings(response.data)
            })
            .finally(() => {
                setLoading(false)
            })
    }, [memberId])

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" py={8}>
                <CircularProgress color="success" />
            </Box>
        )
    }

    return (
        <Stack spacing={2}>
            <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>
                    Booking History
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    View your past bookings, check-in statuses, and active reservations.
                </Typography>
            </Box>

            <Card sx={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 18px rgba(0,0,0,0.06)' }}>
                <CardContent sx={{ p: 2 }}>
                    <Box sx={{ border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' }}>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ bgcolor: '#F9FAFB', fontWeight: 600 }}>Token</TableCell>
                                        <TableCell sx={{ bgcolor: '#F9FAFB', fontWeight: 600 }}>Card Type</TableCell>
                                        <TableCell sx={{ bgcolor: '#F9FAFB', fontWeight: 600 }}>Date</TableCell>
                                        <TableCell sx={{ bgcolor: '#F9FAFB', fontWeight: 600 }}>Slot</TableCell>
                                        <TableCell sx={{ bgcolor: '#F9FAFB', fontWeight: 600 }}>Status</TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {bookings.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                                No bookings found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        bookings.map((booking) => (
                                            <TableRow key={booking.bookingId || booking.id} hover>
                                                <TableCell sx={{ fontWeight: 700, color: '#111827' }}>
                                                    {booking.token}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={booking.cardType || 'GENERAL'}
                                                        size="small"
                                                        color={booking.cardType === 'GROCERY' ? 'primary' : 'secondary'}
                                                        sx={{ borderRadius: '999px', fontSize: '0.65rem', height: 18 }}
                                                    />
                                                </TableCell>
                                                <TableCell>{booking.bookingDate}</TableCell>
                                                <TableCell>{booking.slot}</TableCell>
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
                                                        sx={{ borderRadius: '999px', fontSize: '0.65rem', height: 18 }}
                                                    />
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
        </Stack>
    )
}