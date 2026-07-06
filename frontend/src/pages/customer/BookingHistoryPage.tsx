import { useEffect, useState } from 'react'
import {
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
    Paper,
} from '@mui/material'
import { getMemberBookings } from '../../services/api'
import type {Booking} from '../../types/api'

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
        return <CircularProgress />
    }

    return (
        <Card>

            <CardContent>

                <Typography variant="h5" gutterBottom>
                    Booking History
                </Typography>

                <TableContainer component={Paper}>

                    <Table>

                        <TableHead>
                            <TableRow>
                                <TableCell>Token</TableCell>
                                <TableCell>Card Type</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Slot</TableCell>
                                <TableCell>Status</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>

                            {bookings.length === 0 ? (

                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        No bookings found.
                                    </TableCell>
                                </TableRow>

                            ) : (

                                bookings.map((booking) => (

                                    <TableRow key={booking.bookingId}>

                                        <TableCell>{booking.token}</TableCell>

                                        <TableCell>{booking.cardType}</TableCell>

                                        <TableCell>{booking.bookingDate}</TableCell>

                                        <TableCell>{booking.slot}</TableCell>

                                        <TableCell>{booking.status}</TableCell>

                                    </TableRow>

                                ))

                            )}

                        </TableBody>

                    </Table>

                </TableContainer>

            </CardContent>

        </Card>
    )
}