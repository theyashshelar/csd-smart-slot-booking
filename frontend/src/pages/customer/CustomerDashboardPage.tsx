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

        <Stack spacing={3}>

            <Typography
                variant="h4"
                fontWeight={700}
            >
                Welcome 👋
            </Typography>

            <Typography color="text.secondary">
                Manage your bookings and profile.
            </Typography>

            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>

                    <Card sx={{ height: '100%' }}>

                        <CardContent>

                            <Typography
                                variant="h6"
                                gutterBottom
                            >
                                Upcoming Booking
                            </Typography>

                            {upcoming ? (

                                <Stack spacing={1}>

                                    <Typography>
                                        <strong>Token:</strong> {upcoming.token}
                                    </Typography>

                                    <Typography>
                                        <strong>Date:</strong> {upcoming.bookingDate}
                                    </Typography>

                                    <Typography>
                                        <strong>Slot:</strong> {upcoming.slot}
                                    </Typography>

                                    <Chip
                                        label={upcoming.status}
                                        color="warning"
                                    />

                                    <Button
                                        variant="contained"
                                        onClick={() =>
                                            navigate('/booking-success', {
                                                state: {
                                                    booking: upcoming,
                                                },
                                            })
                                        }
                                    >
                                        View QR
                                    </Button>

                                </Stack>

                            ) : (

                                <Typography color="text.secondary">
                                    No upcoming bookings.
                                </Typography>

                            )}

                        </CardContent>

                    </Card>

                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>

                    <Card sx={{ height: '100%' }}>

                        <CardContent>

                            <Typography
                                variant="h6"
                                gutterBottom
                            >
                                Booking Statistics
                            </Typography>

                            <Stack spacing={2}>

                                <Typography>
                                    Total Bookings : {bookings.length}
                                </Typography>

                                <Typography>
                                    Completed : {completed}
                                </Typography>

                                <Typography>
                                    Cancelled : {cancelled}
                                </Typography>

                            </Stack>

                        </CardContent>

                    </Card>

                </Grid>
                <Grid size={{ xs: 12 }}>

                    <Card>

                        <CardContent>

                            <Typography
                                variant="h6"
                                gutterBottom
                            >
                                Quick Actions
                            </Typography>

                            <Stack
                                direction={{
                                    xs: 'column',
                                    sm: 'row',
                                }}
                                spacing={2}
                            >

                                <Button
                                    variant="contained"
                                    startIcon={<CalendarMonthRounded />}
                                    onClick={() =>
                                            navigate('/customer/book-slot')
                                    }
                                >
                                    Book Slot
                                </Button>

                                <Button
                                    variant="outlined"
                                    startIcon={<HistoryRounded />}
                                    onClick={() =>
                                        navigate('/customer/history')
                                    }
                                >
                                    Booking History
                                </Button>

                                <Button
                                    variant="outlined"
                                    startIcon={<PersonRounded />}
                                    onClick={() =>
                                        navigate('/customer/profile')
                                    }
                                >
                                    My Profile
                                </Button>

                            </Stack>

                        </CardContent>

                    </Card>

                </Grid>

                <Grid size={{ xs: 12 }}>

                    <Card>

                        <CardContent>

                            <Typography
                                variant="h6"
                                gutterBottom
                            >
                                Recent Bookings
                            </Typography>

                            <Stack spacing={2}>

                                {bookings.length === 0 && (

                                    <Typography color="text.secondary">
                                        No bookings available.
                                    </Typography>

                                )}

                                {bookings.slice(0,5).map((booking) => (

                                    <Card
                                        key={booking.id}
                                        variant="outlined"
                                    >

                                        <CardContent>

                                            <Stack
                                                direction="row"
                                                justifyContent="space-between"
                                                alignItems="center"
                                            >

                                                <Box>

                                                    <Typography
                                                        fontWeight={700}
                                                    >
                                                        {booking.token}
                                                    </Typography>

                                                    <Typography
                                                        variant="body2"
                                                    >
                                                        {booking.bookingDate}
                                                    </Typography>

                                                </Box>

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

                                            </Stack>

                                        </CardContent>

                                    </Card>

                                ))}

                            </Stack>

                        </CardContent>

                    </Card>

                </Grid>
            </Grid>

        </Stack>

    )

}
