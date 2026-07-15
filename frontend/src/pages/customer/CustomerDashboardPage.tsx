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
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
} from '@mui/material'

import {
    CalendarMonthRounded,
    HistoryRounded,
    PersonRounded,
} from '@mui/icons-material'

import { useNavigate } from 'react-router-dom'
import { formatSlotLabel } from '../../utils/timeFormatter'

import {
    getMemberBookings,
} from '../../services/api'

import type { Booking } from '../../types/api'
import { ShoppingCart, Wine, Download, QrCode, ChevronDown, FileText, Image as ImageIcon } from 'lucide-react'
import QRCode from 'react-qr-code'
import { getQrCodeBase64, downloadPdfPass, downloadPngPass, formatDate } from '../../utils/passGenerator'

const getLocalDateString = () => {
    const d = new Date()
    const offset = d.getTimezoneOffset()
    const localDate = new Date(d.getTime() - (offset * 60 * 1000))
    return localDate.toISOString().split('T')[0]
}

export default function CustomerDashboardPage() {
    const navigate = useNavigate()
    const memberId = Number(localStorage.getItem('memberId'))
    const memberName = localStorage.getItem('fullName') || 'Valued Member'

    const [bookings, setBookings] = useState<Booking[]>([])
    const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null)
    const [selectedBookingForMenu, setSelectedBookingForMenu] = useState<Booking | null>(null)

    useEffect(() => {
        if (memberId) {
            getMemberBookings(memberId)
                .then((res) => {
                    setBookings(res.data)
                })
        }
    }, [memberId])

    const todayStr = getLocalDateString()

    // Upcoming Bookings: bookings with status 'BOOKED' or 'CHECKED_IN' (or we can define upcoming as 'BOOKED')
    const upcomingBookings = bookings.filter(
        (b) => b.status === 'BOOKED'
    )

    const upcomingCount = upcomingBookings.length

    const todayCount = bookings.filter(
        (b) => b.bookingDate === todayStr && b.status !== 'CANCELLED'
    ).length

    const completed = bookings.filter(
        (b) => b.status === 'CHECKED_OUT'
    ).length

    const cancelled = bookings.filter(
        (b) => b.status === 'CANCELLED'
    ).length

    const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, booking: Booking) => {
        setMenuAnchorEl(event.currentTarget)
        setSelectedBookingForMenu(booking)
    }

    const handleMenuClose = () => {
        setMenuAnchorEl(null)
        setSelectedBookingForMenu(null)
    }

    const handleDownloadPdf = async () => {
        if (!selectedBookingForMenu) return
        const booking = selectedBookingForMenu
        handleMenuClose()
        const qrBase64 = await getQrCodeBase64(booking.token)
        await downloadPdfPass(booking, memberName, qrBase64)
    }

    const handleDownloadPng = async () => {
        if (!selectedBookingForMenu) return
        const booking = selectedBookingForMenu
        handleMenuClose()
        const qrBase64 = await getQrCodeBase64(booking.token)
        await downloadPngPass(booking, memberName, qrBase64)
    }

    return (
        <Stack spacing={2}>
            {/* Hidden QR Codes for Pass Generation */}
            <Box sx={{ display: 'none' }}>
                {bookings.map((b) => (
                    <div key={b.token || b.id} id={`qr-container-${b.token}`}>
                        <QRCode value={b.token || ''} size={150} />
                    </div>
                ))}
            </Box>

            <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>
                    Welcome, {memberName} 👋
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Manage your bookings, profiles, and active access tokens.
                </Typography>
            </Box>

            <Grid container spacing={2}>
                {/* Upcoming Bookings Section */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 18px rgba(0,0,0,0.06)' }}>
                        <CardContent sx={{ p: 2 }}>
                            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                Upcoming Bookings
                                {upcomingCount > 0 && (
                                    <Chip label={upcomingCount} size="small" color="primary" sx={{ height: 20, fontSize: '0.75rem', fontWeight: 700 }} />
                                )}
                            </Typography>

                            {upcomingBookings.length > 0 ? (
                                <Stack spacing={2}>
                                    {upcomingBookings.map((b) => {
                                        const isGrocery = b.cardType === 'GROCERY' || b.token?.startsWith('G-');
                                        const slotLabel = b.slot || '';
                                        return (
                                            <Card
                                                key={b.id || b.bookingId}
                                                variant="outlined"
                                                sx={{
                                                    borderRadius: '10px',
                                                    borderColor: '#E5E7EB',
                                                    p: 2,
                                                    bgcolor: '#FFFFFF',
                                                    position: 'relative'
                                                }}
                                            >
                                                {/* Header Row */}
                                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                                                    <Chip
                                                        icon={isGrocery ? <ShoppingCart size={13} style={{ color: '#2E7D32' }} /> : <Wine size={13} style={{ color: '#7B1FA2' }} />}
                                                        label={isGrocery ? 'Grocery Booking' : 'Liquor Booking'}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: isGrocery ? '#E8F5E9' : '#F3E5F5',
                                                            color: isGrocery ? '#2E7D32' : '#7B1FA2',
                                                            fontWeight: 700,
                                                            borderRadius: '6px',
                                                            fontSize: '0.7rem',
                                                            height: 22,
                                                            '& .MuiChip-icon': {
                                                                color: 'inherit !important'
                                                            }
                                                        }}
                                                    />
                                                    <Chip
                                                        label={b.status}
                                                        color="warning"
                                                        size="small"
                                                        sx={{ borderRadius: '4px', fontSize: '0.65rem', height: 18, fontWeight: 700 }}
                                                    />
                                                </Stack>

                                                {/* Card Body */}
                                                <Grid container spacing={1} sx={{ mb: 1.5 }}>
                                                    <Grid size={{ xs: 6 }}>
                                                        <Box sx={{ p: 1, borderRadius: '8px', bgcolor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                                                            <Typography variant="caption" color="text.secondary" fontWeight={500} display="block">Token</Typography>
                                                            <Typography variant="body2" fontWeight={700} color="#111827" sx={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                                                                {b.token}
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                    <Grid size={{ xs: 6 }}>
                                                        <Box sx={{ p: 1, borderRadius: '8px', bgcolor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                                                            <Typography variant="caption" color="text.secondary" fontWeight={500} display="block">Date</Typography>
                                                            <Typography variant="body2" fontWeight={700} color="#111827" sx={{ fontSize: '0.85rem' }}>
                                                                {formatDate(b.bookingDate)}
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                    <Grid size={{ xs: 12 }}>
                                                        <Box sx={{ p: 1, borderRadius: '8px', bgcolor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                                                            <Typography variant="caption" color="text.secondary" fontWeight={500} display="block">Slot Time</Typography>
                                                            <Typography variant="body2" fontWeight={700} color="#111827" sx={{ fontSize: '0.85rem' }}>
                                                                {formatSlotLabel(slotLabel)}
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                </Grid>

                                                {/* Action Buttons */}
                                                <Stack direction="row" spacing={1}>
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        startIcon={<QrCode size={14} />}
                                                        fullWidth
                                                        onClick={() =>
                                                            navigate('/booking-success', {
                                                                state: {
                                                                    booking: b,
                                                                },
                                                            })
                                                        }
                                                        sx={{ height: 34, bgcolor: '#1B5E20', '&:hover': { bgcolor: '#102319' }, fontSize: '0.75rem', fontWeight: 600, borderRadius: '6px' }}
                                                    >
                                                        View QR
                                                    </Button>
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        startIcon={<Download size={14} />}
                                                        endIcon={<ChevronDown size={12} />}
                                                        fullWidth
                                                        onClick={(e) => handleMenuOpen(e, b)}
                                                        sx={{ height: 34, color: '#1B5E20', borderColor: '#1B5E20', '&:hover': { borderColor: '#102319', bgcolor: 'rgba(27,94,32,0.04)' }, fontSize: '0.75rem', fontWeight: 600, borderRadius: '6px' }}
                                                    >
                                                        Download
                                                    </Button>
                                                </Stack>
                                            </Card>
                                        )
                                    })}
                                </Stack>
                            ) : (
                                <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                                    No upcoming bookings.
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Statistics Section (Enhanced as requested in PART 6) */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 18px rgba(0,0,0,0.06)' }}>
                        <CardContent sx={{ p: 2 }}>
                            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
                                Booking Statistics
                            </Typography>

                            <Stack spacing={1}>
                                {[
                                    ['Upcoming', upcomingCount, '#E28743'],
                                    ['Today\'s Bookings', todayCount, '#2E7D32'],
                                    ['Completed', completed, '#1E4620'],
                                    ['Cancelled', cancelled, '#C62828'],
                                ].map(([label, value, color]) => (
                                    <Box
                                        key={label as string}
                                        sx={{
                                            p: 1.2,
                                            borderRadius: '10px',
                                            bgcolor: '#F9FAFB',
                                            border: '1px solid #E5E7EB',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color as string }} />
                                            <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                                {label}
                                            </Typography>
                                        </Stack>
                                        <Typography variant="body2" fontWeight={700} color="#111827">
                                            {value}
                                        </Typography>
                                    </Box>
                                ))}
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Quick Actions Card */}
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
                                    sx={{ height: 38, bgcolor: '#1B5E20', '&:hover': { bgcolor: '#102319' } }}
                                >
                                    Book Slot
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<HistoryRounded />}
                                    onClick={() => navigate('/customer/history')}
                                    sx={{ height: 38, color: '#1B5E20', borderColor: '#1B5E20', '&:hover': { borderColor: '#102319', bgcolor: 'rgba(27,94,32,0.04)' } }}
                                >
                                    Booking History
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<PersonRounded />}
                                    onClick={() => navigate('/customer/profile')}
                                    sx={{ height: 38, color: '#1B5E20', borderColor: '#1B5E20', '&:hover': { borderColor: '#102319', bgcolor: 'rgba(27,94,32,0.04)' } }}
                                >
                                    My Profile
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Recent Bookings Card (Enhanced as requested in PART 7) */}
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
                                    bookings.slice(0, 5).map((booking) => {
                                        const isGrocery = booking.cardType === 'GROCERY' || booking.token?.startsWith('G-');
                                        const slotLabel = booking.slot || '';
                                        return (
                                            <Card
                                                key={booking.bookingId || booking.id}
                                                variant="outlined"
                                                sx={{
                                                    borderRadius: '10px',
                                                    borderColor: '#E5E7EB',
                                                    transition: 'background-color 0.2s',
                                                    '&:hover': { bgcolor: '#F9FAFB' }
                                                }}
                                            >
                                                <CardContent sx={{ p: '12px !important' }}>
                                                    <Stack
                                                        direction={{ xs: 'column', sm: 'row' }}
                                                        justifyContent="space-between"
                                                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                                                        spacing={1}
                                                    >
                                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                                            {/* Grocery / Liquor Badge */}
                                                            <Chip
                                                                icon={isGrocery ? <ShoppingCart size={12} style={{ color: '#2E7D32' }} /> : <Wine size={12} style={{ color: '#7B1FA2' }} />}
                                                                label={isGrocery ? 'Grocery' : 'Liquor'}
                                                                size="small"
                                                                sx={{
                                                                    bgcolor: isGrocery ? '#E8F5E9' : '#F3E5F5',
                                                                    color: isGrocery ? '#2E7D32' : '#7B1FA2',
                                                                    fontWeight: 700,
                                                                    fontSize: '0.7rem',
                                                                    height: 22,
                                                                    borderRadius: '4px',
                                                                    '& .MuiChip-icon': {
                                                                        color: 'inherit !important'
                                                                    }
                                                                }}
                                                            />
                                                            {/* Token */}
                                                            <Typography variant="body2" fontWeight={700} color="#111827" sx={{ fontFamily: 'var(--font-mono)' }}>
                                                                {booking.token}
                                                            </Typography>
                                                        </Stack>

                                                        {/* Booking Date & Slot Time */}
                                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <span>{formatDate(booking.bookingDate)}</span>
                                                            <span>•</span>
                                                            <span>{formatSlotLabel(slotLabel)}</span>
                                                        </Typography>

                                                        {/* Status */}
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
                                                            sx={{ borderRadius: '999px', fontSize: '0.65rem', height: 18, fontWeight: 600 }}
                                                        />
                                                    </Stack>
                                                </CardContent>
                                            </Card>
                                        )
                                    })
                                )}
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Dropdown Menu for Download options */}
            <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: '8px',
                            minWidth: 220,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                            border: '1px solid #E5E7EB',
                        }
                    }
                }}
            >
                <MenuItem onClick={handleDownloadPdf} sx={{ py: 1 }}>
                    <ListItemIcon>
                        <FileText size={16} color="#1B5E20" />
                    </ListItemIcon>
                    <ListItemText primary="Download Booking Pass (PDF)" primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 500 }} />
                </MenuItem>
                <MenuItem onClick={handleDownloadPng} sx={{ py: 1 }}>
                    <ListItemIcon>
                        <ImageIcon size={16} color="#1B5E20" />
                    </ListItemIcon>
                    <ListItemText primary="Download Booking Pass (PNG)" primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 500 }} />
                </MenuItem>
            </Menu>
        </Stack>
    )
}
