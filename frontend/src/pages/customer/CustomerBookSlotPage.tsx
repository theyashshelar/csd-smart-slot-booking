import { useState } from 'react'
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Stack,
    Typography,
} from '@mui/material'
import LocalMallRoundedIcon from '@mui/icons-material/LocalMallRounded'
import LiquorRoundedIcon from '@mui/icons-material/LiquorRounded'
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import { useNavigate } from 'react-router-dom'
import { createBooking, getSlots } from '../../services/api'
import type { Slot } from '../../types/api'

export default function CustomerBookSlotPage() {

    const navigate = useNavigate()

    const memberId = Number(localStorage.getItem('memberId'))

    const [cardType, setCardType] =
        useState<'GROCERY' | 'LIQUOR' | null>(null)

    const [slots, setSlots] = useState<Slot[]>([])

    const [loading, setLoading] = useState(false)

    const [selectedSlot, setSelectedSlot] =
        useState<Slot | null>(null)

    const [booking, setBooking] = useState(false)

    const [error, setError] = useState('')

    const loadSlots = async (
        type: 'GROCERY' | 'LIQUOR'
    ) => {

        setCardType(type)
        setLoading(true)
        setError('')

        try {

            const response = await getSlots(type)

            setSlots(response.data)

        } catch (e: any) {

            setError(
                e?.response?.data?.message ||
                'Unable to load slots.'
            )

        } finally {

            setLoading(false)

        }

    }

    const confirmBooking = async () => {

        if (!selectedSlot || !cardType) return

        try {

            setBooking(true)

            const response = await createBooking({

                memberId,

                slotId: selectedSlot.id,

                cardType,

            })

            navigate('/booking-success', {
                state: {
                    booking: response.data,
                    slot: selectedSlot,
                    cardType,
                },
            })

        } catch (e: any) {

            alert(
                e?.response?.data?.message ||
                'Booking failed.'
            )

        } finally {

            setBooking(false)

            setSelectedSlot(null)

        }

    }

    return (

        <Box>

            <Typography
                variant="h4"
                fontWeight={700}
                gutterBottom
            >
                Book Slot
            </Typography>

            <Typography
                color="text.secondary"
                mb={4}
            >
                Select your card type
            </Typography>

            <Grid container spacing={3}>

                <Grid size={{ xs: 12, md: 6 }}>

                    <Card
                        sx={{
                            cursor: 'pointer',
                            border:
                                cardType === 'GROCERY'
                                    ? '2px solid green'
                                    : '',
                        }}
                        onClick={() =>
                            loadSlots('GROCERY')
                        }
                    >

                        <CardContent>

                            <Stack
                                spacing={2}
                                alignItems="center"
                            >

                                <LocalMallRoundedIcon
                                    sx={{
                                        fontSize: 50,
                                    }}
                                />

                                <Typography
                                    variant="h6"
                                >
                                    Grocery Card
                                </Typography>

                            </Stack>

                        </CardContent>

                    </Card>

                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>

                    <Card
                        sx={{
                            cursor: 'pointer',
                            border:
                                cardType === 'LIQUOR'
                                    ? '2px solid green'
                                    : '',
                        }}
                        onClick={() =>
                            loadSlots('LIQUOR')
                        }
                    >

                        <CardContent>

                            <Stack
                                spacing={2}
                                alignItems="center"
                            >

                                <LiquorRoundedIcon
                                    sx={{
                                        fontSize: 50,
                                    }}
                                />

                                <Typography
                                    variant="h6"
                                >
                                    Liquor Card
                                </Typography>

                            </Stack>

                        </CardContent>

                    </Card>

                </Grid>

            </Grid>

            {loading && (

                <Box
                    mt={5}
                    textAlign="center"
                >

                    <CircularProgress />

                </Box>

            )}

            {error && (

                <Alert
                    severity="error"
                    sx={{ mt: 4 }}
                >
                    {error}
                </Alert>

            )}

            {!loading && slots.length > 0 && (

                <Box mt={5}>

                    <Typography
                        variant="h5"
                        mb={3}
                    >
                        Available Slots
                    </Typography>

                    <Grid container spacing={3}>

                        {slots.map((slot) => (

                            <Grid
                                key={slot.id}
                                size={{ xs: 12, md: 6 }}
                            >

                                <Card>

                                    <CardContent>

                                        <Stack spacing={2}>

                                            <Typography
                                                variant="h6"
                                            >
                                                {slot.label}
                                            </Typography>

                                            <Stack
                                                direction="row"
                                                spacing={1}
                                                alignItems="center"
                                            >

                                                <AccessTimeRoundedIcon />

                                                <Typography>

                                                    {slot.startTime}
                                                    {' - '}
                                                    {slot.endTime}

                                                </Typography>

                                            </Stack>

                                            <Chip
                                                label={`Capacity : ${slot.capacity}`}
                                            />

                                            <Chip
                                                color="warning"
                                                label={`Booked : ${slot.bookedCount}`}
                                            />

                                            <Chip
                                                color="success"
                                                label={`Available : ${slot.capacity - slot.bookedCount}`}
                                            />

                                            <Button
                                                variant="contained"
                                                disabled={
                                                    !slot.active ||
                                                    slot.capacity === slot.bookedCount
                                                }
                                                onClick={() =>
                                                    setSelectedSlot(slot)
                                                }
                                            >
                                                Book Now
                                            </Button>

                                        </Stack>

                                    </CardContent>

                                </Card>

                            </Grid>

                        ))}

                    </Grid>

                </Box>

            )}

            <Dialog
                open={selectedSlot != null}
                onClose={() =>
                    setSelectedSlot(null)
                }
            >

                <DialogTitle>
                    Confirm Booking
                </DialogTitle>

                <DialogContent>

                    <Typography>

                        Card Type :
                        {' '}
                        {cardType}

                    </Typography>

                    <Typography mt={2}>

                        Slot :
                        {' '}
                        {selectedSlot?.label}

                    </Typography>

                </DialogContent>

                <DialogActions>

                    <Button
                        onClick={() =>
                            setSelectedSlot(null)
                        }
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        disabled={booking}
                        onClick={confirmBooking}
                    >
                        {booking
                            ? 'Booking...'
                            : 'Confirm'}
                    </Button>

                </DialogActions>

            </Dialog>

        </Box>

    )

}