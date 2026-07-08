import { useEffect, useState } from 'react'
import {
    Box,
    Card,
    CardContent,
    Grid,
    Stack,
    Typography,
    Chip,
    Button,
} from '@mui/material'

import {
    CalendarMonthRounded,
    HistoryRounded,
    PersonRounded,
} from '@mui/icons-material'

import { useNavigate } from 'react-router-dom'

import {
    getMemberBookings,
} from '../../services/api'

import type { Booking } from '../../types/api'

export default function CustomerDashboardPage() {

    const navigate = useNavigate()

    const memberId = Number(localStorage.getItem('memberId'))

    const [bookings, setBookings] = useState<Booking[]>([])

    useEffect(() => {

        if (memberId) {

            getMemberBookings(memberId)
                .then((res) => {

                    setBookings(res.data)

                })

        }

    }, [])

    const upcoming = bookings.find(
        (b) => b.status === 'BOOKED'
    )

    const completed =
        bookings.filter(
            (b) => b.status === 'CHECKED_OUT'
        ).length

    const cancelled =
        bookings.filter(
            (b) => b.status === 'CANCELLED'
        ).length

    return (
        <Stack spacing={2}>
            <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>
                    Welcome 👋
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Manage your bookings, profiles, and active access tokens.
                </Typography>
            </Box>

            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 18px rgba(0,0,0,0.06)' }}>
                        <CardContent sx={{ p: 2 }}>
                            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
                                Upcoming Booking
                            </Typography>

                            {upcoming ? (
                                <Stack spacing={1}>
                                    <Grid container spacing={1}>
                                        <Grid size={{ xs: 6 }}>
                                            <Box sx={{ p: 1, borderRadius: '10px', bgcolor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                                                <Typography variant="caption" color="text.secondary" fontWeight={500} display="block">Token</Typography>
                                                <Typography variant="body2" fontWeight={600} color="#111827">{upcoming.token}</Typography>
                                            </Box>
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <Box sx={{ p: 1, borderRadius: '10px', bgcolor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                                                <Typography variant="caption" color="text.secondary" fontWeight={500} display="block">Status</Typography>
                                                <Chip
                                                    label={upcoming.status}
                                                    color="warning"
                                                    size="small"
                                                    sx={{ borderRadius: '999px', fontSize: '0.65rem', height: 18 }}
                                                />
                                            </Box>
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <Box sx={{ p: 1, borderRadius: '10px', bgcolor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                                                <Typography variant="caption" color="text.secondary" fontWeight={500} display="block">Date & Slot</Typography>
                                                <Typography variant="body2" fontWeight={600} color="#111827">{upcoming.bookingDate} ({upcoming.slot})</Typography>
                                            </Box>
                                        </Grid>
                                    </Grid>

                                    <Button
                                        variant="contained"
                                        size="small"
                                        fullWidth
                                        onClick={() =>
                                            navigate('/booking-success', {
                                                state: {
                                                    booking: upcoming,
                                                },
                                            })
                                        }
                                        sx={{ mt: 1, height: 36 }}
                                    >
                                        View QR Code
                                    </Button>
                                </Stack>
                            ) : (
                                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                                    No upcoming bookings.
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 18px rgba(0,0,0,0.06)' }}>
                        <CardContent sx={{ p: 2 }}>
                            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
                                Booking Statistics
                            </Typography>

                            <Stack spacing={1}>
                                {[
                                    ['Total Bookings', bookings.length],
                                    ['Completed', completed],
                                    ['Cancelled', cancelled],
                                ].map(([label, value]) => (
                                    <Box key={label} sx={{ p: 1.2, borderRadius: '10px', bgcolor: '#F9FAFB', border: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2" color="text.secondary" fontWeight={500}>{label}</Typography>
                                        <Typography variant="body2" fontWeight={600} color="#111827">{value}</Typography>
                                    </Box>
                                ))}
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <Card sx={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 18px rgba(0,0,0,0.06)' }}>
                        <CardContent sx={{ p: 2 }}>
                            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
                                Quick Actions
                            </Typography>

                            <Stack
                                direction={{
                                    xs: 'column',
                                    sm: 'row',
                                }}
                                spacing={1}
                            >
                                <Button
                                    variant="contained"
                                    startIcon={<CalendarMonthRounded />}
                                    onClick={() => navigate('/customer/book-slot')}
                                    sx={{ height: 38 }}
                                >
                                    Book Slot
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<HistoryRounded />}
                                    onClick={() => navigate('/customer/history')}
                                    sx={{ height: 38 }}
                                >
                                    Booking History
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<PersonRounded />}
                                    onClick={() => navigate('/customer/profile')}
                                    sx={{ height: 38 }}
                                >
                                    My Profile
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <Card sx={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 18px rgba(0,0,0,0.06)' }}>
                        <CardContent sx={{ p: 2 }}>
                            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
                                Recent Bookings
                            </Typography>

                            <Stack spacing={1}>
                                {bookings.length === 0 ? (
                                    <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                                        No bookings available.
                                    </Typography>
                                ) : (
                                    bookings.slice(0, 5).map((booking) => (
                                        <Card
                                            key={booking.id}
                                            variant="outlined"
                                            sx={{ borderRadius: '10px', borderColor: '#E5E7EB', transition: 'background-color 0.2s', '&:hover': { bgcolor: '#F9FAFB' } }}
                                        >
                                            <CardContent sx={{ p: '12px !important' }}>
                                                <Stack
                                                    direction="row"
                                                    justifyContent="space-between"
                                                    alignItems="center"
                                                >
                                                    <Box>
                                                        <Typography variant="body2" fontWeight={600} color="#111827">
                                                            {booking.token}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {booking.bookingDate}
                                                        </Typography>
                                                    </Box>

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
                                                </Stack>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Stack>
    )
}
