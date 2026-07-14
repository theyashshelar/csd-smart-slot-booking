import { useState, useMemo } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import InboxIcon from '@mui/icons-material/Inbox'
import type { OperatorBooking } from '../../types/api'

interface QueueTableProps {
  cardType: 'GROCERY' | 'LIQUOR'
  bookings: OperatorBooking[]
  onCheckIn: (bookingId: number) => void
  onCheckOut: (bookingId: number) => void
  onCancel: (bookingId: number) => void
}

export default function QueueTable({
  cardType,
  bookings,
  onCheckIn,
  onCheckOut,
  onCancel,
}: QueueTableProps) {
  const [tab, setTab] = useState<'today' | 'upcoming'>('today')
  const isGrocery = cardType === 'GROCERY'

  const getTodayString = () => {
    const d = new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const date = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${date}`
  }

  const todayStr = getTodayString()

  // Filter and sort bookings inside the component
  const filteredSortedBookings = useMemo(() => {
    if (tab === 'today') {
      return bookings
        .filter((b) => b.bookingDate === todayStr)
        .sort((a, b) => {
          const startTimeA = a.slot?.startTime || ''
          const startTimeB = b.slot?.startTime || ''
          if (startTimeA !== startTimeB) {
            return startTimeA.localeCompare(startTimeB)
          }
          return (a.token || '').localeCompare(b.token || '')
        })
    } else {
      return bookings
        .filter((b) => b.bookingDate > todayStr)
        .sort((a, b) => {
          const dateComp = (a.bookingDate || '').localeCompare(b.bookingDate || '')
          if (dateComp !== 0) return dateComp
          const startTimeA = a.slot?.startTime || ''
          const startTimeB = b.slot?.startTime || ''
          if (startTimeA !== startTimeB) {
            return startTimeA.localeCompare(startTimeB)
          }
          return (a.token || '').localeCompare(b.token || '')
        })
    }
  }, [bookings, tab, todayStr])

  const getStatusChipStyles = (status: string) => {
    switch (status) {
      case 'BOOKED':
        return {
          bgcolor: '#FEF3C7',
          color: '#B45309',
          border: '1px solid #FCD34D',
          borderRadius: '9999px',
        }
      case 'CHECKED_IN':
        return {
          bgcolor: '#D1FAE5',
          color: '#047857',
          border: '1px solid #6EE7B7',
          borderRadius: '9999px',
        }
      case 'CHECKED_OUT':
        return {
          bgcolor: '#DBEAFE',
          color: '#1D4ED8',
          border: '1px solid #93C5FD',
          borderRadius: '9999px',
        }
      case 'CANCELLED':
        return {
          bgcolor: '#FEE2E2',
          color: '#B91C1C',
          border: '1px solid #FCA5A5',
          borderRadius: '9999px',
        }
      default:
        return {
          borderRadius: '9999px',
        }
    }
  }

  const renderEmptyState = (message: string, description: string) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 3, px: 2 }}>
      <Box sx={{
        p: 1.5,
        borderRadius: '50%',
        bgcolor: '#F3F4F6',
        color: '#9CA3AF',
        mb: 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <InboxIcon sx={{ fontSize: 36 }} />
      </Box>
      <Typography variant="subtitle2" color="#111827" fontWeight={800} align="center">
        {message}
      </Typography>
      <Typography variant="caption" color="text.secondary" align="center" sx={{ mt: 0.5, maxWidth: 300 }}>
        {description}
      </Typography>
    </Box>
  )

  const tokenColor = isGrocery ? '#1B5E20' : '#E65100'
  const tabColor = isGrocery ? 'primary' : 'secondary'
  const emoji = isGrocery ? '🥬' : '🥃'
  const titleText = isGrocery ? 'Grocery Live Queue' : 'Liquor Live Queue'

  return (
    <Card id={`queue-table-card-${cardType.toLowerCase()}`} sx={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: 'none' }}>
      <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="subtitle2" fontWeight={800} color="#111827">
          {emoji} {titleText} ({filteredSortedBookings.length})
        </Typography>
        <Tabs
          value={tab}
          onChange={(_, val) => setTab(val)}
          textColor={tabColor}
          indicatorColor={tabColor}
          sx={{ minHeight: 32, '& .MuiTab-root': { py: 0.5, minHeight: 32, fontSize: '0.8rem', fontWeight: 800, textTransform: 'none' } }}
        >
          <Tab value="today" label="Today" />
          <Tab value="upcoming" label="Upcoming" />
        </Tabs>
      </Box>
      <TableContainer sx={{ maxHeight: 300 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, bgcolor: '#F9FAFB' }}>Token</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: '#F9FAFB' }}>Customer</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: '#F9FAFB' }}>Slot/Date</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: '#F9FAFB' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: '#F9FAFB', textAlign: 'center' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSortedBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  {renderEmptyState(
                    `No ${isGrocery ? 'Grocery' : 'Liquor'} Bookings Found`,
                    tab === 'today'
                      ? `There are no bookings in the ${isGrocery ? 'grocery' : 'liquor'} queue for today.`
                      : `No upcoming ${isGrocery ? 'grocery' : 'liquor'} bookings registered.`
                  )}
                </TableCell>
              </TableRow>
            ) : (
              filteredSortedBookings.map((booking) => (
                <TableRow key={booking.id} hover>
                  <TableCell sx={{ fontWeight: 800, color: tokenColor }}>{booking.token}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700} color="#111827">
                      {booking.member?.fullName || 'Unknown'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {booking.member?.mobileNumber || ''}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {tab === 'today' ? booking.slot?.label : `${booking.bookingDate} (${booking.slot?.label})`}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={booking.status}
                      size="small"
                      sx={{ ...getStatusChipStyles(booking.status), fontSize: '0.65rem', height: 20 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        disabled={booking.status !== 'BOOKED' || tab === 'upcoming'}
                        onClick={() => onCheckIn(booking.id)}
                        sx={{ fontSize: '0.7rem', px: 1, py: 0.2, minWidth: 44, textTransform: 'none', fontWeight: 600 }}
                      >
                        In
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        disabled={booking.status !== 'CHECKED_IN' || tab === 'upcoming'}
                        onClick={() => onCheckOut(booking.id)}
                        sx={{ fontSize: '0.7rem', px: 1, py: 0.2, minWidth: 44, textTransform: 'none', fontWeight: 600 }}
                      >
                        Out
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        disabled={booking.status === 'CHECKED_OUT' || booking.status === 'CANCELLED'}
                        onClick={() => onCancel(booking.id)}
                        sx={{ fontSize: '0.7rem', px: 1, py: 0.2, textTransform: 'none', minWidth: 0, fontWeight: 500 }}
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
    </Card>
  )
}
