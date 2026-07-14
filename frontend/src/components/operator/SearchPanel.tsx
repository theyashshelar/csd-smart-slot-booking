import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import SearchIcon from '@mui/icons-material/Search'
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import CancelIcon from '@mui/icons-material/Cancel'
import type { OperatorSearchResponse } from '../../types/api'
import { formatSlotLabel } from '../../utils/timeFormatter'

interface SearchPanelProps {
  cardType: 'GROCERY' | 'LIQUOR'
  search: string
  setSearch: (val: string) => void
  searchResult: OperatorSearchResponse | null
  searchError: string
  onSearch: () => void
  onScanClick: () => void
  onCheckIn: (bookingId: number) => void
  onCheckOut: (bookingId: number) => void
  onCancel: (bookingId: number) => void
}

export default function SearchPanel({
  cardType,
  search,
  setSearch,
  searchResult,
  searchError,
  onSearch,
  onScanClick,
  onCheckIn,
  onCheckOut,
  onCancel,
}: SearchPanelProps) {
  
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

  const isGrocery = cardType === 'GROCERY'
  const brandColor = isGrocery ? '#2E7D32' : '#E65100'
  const brandBg = isGrocery ? 'rgba(46, 125, 50, 0.04)' : 'rgba(230, 81, 0, 0.04)'

  return (
    <Stack id={`search-panel-${cardType.toLowerCase()}`} spacing={3}>
      <Card sx={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: 'none' }}>
        <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid #E5E7EB', bgcolor: '#F9FAFB' }}>
          <Typography variant="subtitle2" fontWeight={800} color="#111827">
            🔍 Search & Scan Directory
          </Typography>
        </Box>
        <CardContent sx={{ p: 2 }}>
          <Stack spacing={1.5}>
            <TextField
              id="search-booking-input"
              fullWidth
              size="small"
              label="Search booking"
              placeholder="Token / Mobile / Card Number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSearch()
              }}
            />
            <Stack direction="row" spacing={1}>
              <Button
                id="search-booking-submit-btn"
                fullWidth
                variant="contained"
                onClick={onSearch}
                startIcon={<SearchIcon />}
                size="small"
                color="success"
                sx={{ textTransform: 'none', fontWeight: 600, height: 36 }}
              >
                Search
              </Button>
              <Button
                id="search-booking-scan-btn"
                fullWidth
                variant="outlined"
                onClick={onScanClick}
                startIcon={<QrCodeScannerIcon />}
                size="small"
                color="success"
                sx={{ textTransform: 'none', fontWeight: 600, height: 36 }}
              >
                Scan QR
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Search Result display */}
      {searchResult && (
        <Card sx={{ borderRadius: '12px', border: `1.5px solid ${brandColor}`, boxShadow: '0 8px 16px rgba(46, 125, 50, 0.05)', overflow: 'hidden' }}>
          <Box sx={{ bgcolor: brandBg, px: 3, py: 1.5, borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 1 }}>
            <SearchIcon sx={{ color: brandColor }} />
            <Typography variant="subtitle2" fontWeight={800} color={brandColor}>
              Booking Search Result Found
            </Typography>
          </Box>
          <CardContent sx={{ p: 2.5 }}>
            <Grid container spacing={1.5}>
              {[
                ['Name', searchResult.memberName],
                ['Mobile', searchResult.mobileNumber],
                ['Grocery Card', searchResult.groceryCardNumber || '-'],
                ['Liquor Card', searchResult.liquorCardNumber || '-'],
                ['Token', searchResult.token],
                ['Slot', formatSlotLabel(searchResult.slotLabel)],
                ['Booking Type', searchResult.bookingType],
              ].map(([label, value]) => (
                <Grid item xs={12} sm={4} md={3} key={label}>
                  <Box sx={{ p: 1.2, borderRadius: '8px', bgcolor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ textTransform: 'uppercase', letterSpacing: '0.02em', mb: 0.2, fontSize: '0.68rem' }}>
                      {label}
                    </Typography>
                    <Typography variant="body2" fontWeight={700} color="#111827">
                      {value}
                    </Typography>
                  </Box>
                </Grid>
              ))}
              <Grid item xs={12} sm={4} md={3}>
                <Box sx={{ p: 1.2, borderRadius: '8px', bgcolor: '#F9FAFB', border: '1px solid #E5E7EB', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ textTransform: 'uppercase', letterSpacing: '0.02em', mb: 0.2, fontSize: '0.68rem' }}>
                    Status
                  </Typography>
                  <Chip
                    label={searchResult.status}
                    size="small"
                    sx={{
                      ...getStatusChipStyles(searchResult.status),
                      borderRadius: '9999px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      alignSelf: 'flex-start',
                      height: 22
                    }}
                  />
                </Box>
              </Grid>
            </Grid>

            <Stack direction="row" spacing={1.5} mt={2.5}>
              <Button
                variant="contained"
                color="success"
                disabled={searchResult.status !== 'BOOKED'}
                onClick={() => onCheckIn(searchResult.bookingId)}
                sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, px: 3 }}
              >
                Check In
              </Button>
              <Button
                variant="outlined"
                disabled={searchResult.status !== 'CHECKED_IN'}
                onClick={() => onCheckOut(searchResult.bookingId)}
                sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, px: 3 }}
              >
                Check Out
              </Button>
              <Button
                color="error"
                variant="outlined"
                disabled={
                  searchResult.status === 'CHECKED_OUT' || searchResult.status === 'CANCELLED'
                }
                onClick={() => onCancel(searchResult.bookingId)}
                sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, px: 3 }}
              >
                Cancel Booking
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {searchError && (
        <Card sx={{ borderRadius: '12px', border: '1.5px dashed #EF4444', p: 3, textAlign: 'center', bgcolor: '#FEF2F2' }}>
          <Box sx={{ color: '#EF4444', mb: 1, display: 'flex', justifyContent: 'center' }}>
            <CancelIcon sx={{ fontSize: 36 }} />
          </Box>
          <Typography variant="subtitle2" fontWeight={800} color="#991B1B">
            No Booking Found
          </Typography>
          <Typography variant="caption" color="#B91C1C" sx={{ mt: 0.5, display: 'block' }}>
            {searchError}
          </Typography>
        </Card>
      )}
    </Stack>
  )
}
