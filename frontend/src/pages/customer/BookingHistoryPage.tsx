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
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from '@mui/material'
import { toast } from 'react-hot-toast'
import { getMemberBookings, customerCancelBooking } from '../../services/api'
import type { Booking } from '../../types/api'

export default function BookingHistoryPage() {
    const memberId = Number(localStorage.getItem('memberId'))

    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
    const [cancelling, setCancelling] = useState(false)

    const fetchBookings = () => {
        getMemberBookings(memberId)
            .then((response) => {
                setBookings(response.data)
            })
            .finally(() => {
                setLoading(false)
            })
    }

    useEffect(() => {
        fetchBookings()
    }, [memberId])

    const handleOpenCancelDialog = (booking: Booking) => {
        setSelectedBooking(booking)
        setCancelDialogOpen(true)
    }

    const handleCloseCancelDialog = () => {
        setSelectedBooking(null)
        setCancelDialogOpen(false)
    }

    const handleConfirmCancel = async () => {
        if (!selectedBooking) return
        setCancelling(true)
        try {
            const bId = selectedBooking.bookingId || selectedBooking.id
            const mId = selectedBooking.memberId || memberId
            await customerCancelBooking(bId, mId)
            toast.success('Booking cancelled successfully.')
            setBookings(prev => prev.map(b => {
                const idToCheck = b.bookingId || b.id
                if (idToCheck === bId) {
                    return { ...b, status: 'CANCELLED' }
                }
                return b
            }))
            handleCloseCancelDialog()
        } catch (error: any) {
            console.error(error)
            toast.error(error?.response?.data?.message || 'Failed to cancel booking.')
        } finally {
            setCancelling(false)
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
                                        <TableCell sx={{ bgcolor: '#F9FAFB', fontWeight: 600 }} align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {bookings.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
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
                                                <TableCell align="right">
                                                    {booking.status === 'BOOKED' && (
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            color="error"
                                                            onClick={() => handleOpenCancelDialog(booking)}
                                                            sx={{ textTransform: 'none', borderRadius: '6px', fontWeight: 600 }}
                                                        >
                                                            Cancel Booking
                                                        </Button>
                                                    )}
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

            <Dialog
                open={cancelDialogOpen}
                onClose={handleCloseCancelDialog}
                PaperProps={{
                    sx: { borderRadius: '12px', p: 1, maxWidth: '440px' }
                }}
            >
                <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
                    Cancel Booking
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: 'text.primary' }}>
                        Are you sure you want to cancel this booking?
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={handleCloseCancelDialog}
                        variant="outlined"
                        sx={{
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontWeight: 600,
                            color: 'text.secondary',
                            borderColor: 'divider',
                            '&:hover': {
                                borderColor: 'text.secondary',
                                bgcolor: 'action.hover'
                            }
                        }}
                    >
                        No, Keep Booking
                    </Button>
                    <Button
                        onClick={handleConfirmCancel}
                        variant="contained"
                        color="error"
                        disabled={cancelling}
                        sx={{
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontWeight: 600,
                            boxShadow: 'none',
                            '&:hover': {
                                boxShadow: 'none'
                            }
                        }}
                    >
                        {cancelling ? 'Cancelling...' : 'Cancel'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    )
}