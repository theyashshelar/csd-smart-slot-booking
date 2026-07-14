import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import type { OperatorBooking } from '../../types/api'

interface NowServingCardProps {
  cardType: 'GROCERY' | 'LIQUOR'
  serving: OperatorBooking | null
  onCheckIn: (bookingId: number) => void
}

export default function NowServingCard({
  cardType,
  serving,
  onCheckIn,
}: NowServingCardProps) {
  const isGrocery = cardType === 'GROCERY'

  const borderStyleColor = isGrocery ? '#A5D6A7' : '#FFCC80'
  const bgStyleColor = isGrocery ? '#E8F5E9' : '#FFF3E0'
  const brandTextColor = isGrocery ? '#1B5E20' : '#E65100'
  const bubbleBgColor = isGrocery ? 'rgba(74, 222, 128, 0.15)' : 'rgba(255, 152, 0, 0.12)'
  const emojiPrefix = isGrocery ? '🥬' : '🥃'
  const labelText = isGrocery ? 'GROCERY COUNTER — NOW SERVING' : 'LIQUOR COUNTER — NOW SERVING'
  const emptyText = isGrocery ? 'No customer waiting at Grocery counter.' : 'No customer waiting at Liquor counter.'

  return (
    <Card id={`now-serving-card-${cardType.toLowerCase()}`} sx={{ borderRadius: '12px', border: `1px solid ${borderStyleColor}`, bgcolor: bgStyleColor, p: 2.5, position: 'relative', overflow: 'hidden' }}>
      <Box sx={{
        position: 'absolute',
        right: -20,
        top: -20,
        width: 100,
        height: 100,
        borderRadius: '50%',
        bgcolor: bubbleBgColor,
        zIndex: 0
      }} />

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Typography variant="caption" fontWeight={800} color={brandTextColor} sx={{ letterSpacing: '0.05em', display: 'block', mb: 1.5 }}>
          {emojiPrefix} {labelText}
        </Typography>
        {serving ? (
          <Stack spacing={2}>
            <Typography variant="h2" fontWeight={900} color={brandTextColor} sx={{ lineHeight: 1 }}>
              {serving.token}
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color={brandTextColor} fontWeight={600} display="block">Customer Name</Typography>
                <Typography variant="subtitle2" fontWeight={800} color="#111827">{serving.member?.fullName || 'Unknown'}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color={brandTextColor} fontWeight={600} display="block">Time Slot</Typography>
                <Typography variant="subtitle2" fontWeight={800} color="#111827">{serving.slot?.label || 'N/A'}</Typography>
              </Grid>
            </Grid>
            <Box sx={{ pt: 1 }}>
              <Button
                variant="contained"
                color="success"
                size="medium"
                startIcon={<CheckCircleIcon />}
                sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
                onClick={() => onCheckIn(serving.id)}
              >
                Check In Customer
              </Button>
            </Box>
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2, fontStyle: 'italic' }}>
            {emptyText}
          </Typography>
        )}
      </Box>
    </Card>
  )
}
