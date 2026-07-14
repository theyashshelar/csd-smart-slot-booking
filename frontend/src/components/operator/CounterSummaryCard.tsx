import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

interface CounterSummaryCardProps {
  cardType: 'GROCERY' | 'LIQUOR'
  total: number
  waiting: number
  checkedIn: number
  completed: number
  cancelled: number
}

export default function CounterSummaryCard({
  cardType,
  total,
  waiting,
  checkedIn,
  completed,
  cancelled,
}: CounterSummaryCardProps) {
  const isGrocery = cardType === 'GROCERY'
  
  const bgColor = isGrocery ? '#E8F5E9' : '#FFF3E0'
  const borderColor = isGrocery ? '#C8E6C9' : '#FFE0B2'
  const titleColor = isGrocery ? '#1B5E20' : '#E65100'
  const iconEmoji = isGrocery ? '🥬' : '🥃'
  const titleText = isGrocery ? 'Grocery Counter Summary (Today)' : 'Liquor Counter Summary (Today)'

  const stats = [
    { label: 'Total Booked', value: total, color: '#1E293B' },
    { label: 'Waiting', value: waiting, color: '#D97706' },
    { label: 'Checked In', value: checkedIn, color: '#059669' },
    { label: 'Completed', value: completed, color: '#2563EB' },
    { label: 'Cancelled', value: cancelled, color: '#DC2626' },
  ]

  return (
    <Card id={`counter-summary-card-${cardType.toLowerCase()}`} sx={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: 'none' }}>
      <Box sx={{ bgcolor: bgColor, px: 3, py: 1.5, borderBottom: `1px solid ${borderColor}` }}>
        <Typography variant="subtitle2" fontWeight={800} color={titleColor}>
          {iconEmoji} {titleText}
        </Typography>
      </Box>
      <CardContent sx={{ p: 2 }}>
        <Grid container spacing={1}>
          {stats.map((stat) => (
            <Grid size={{ xs: 4, sm: 2.4 }} key={stat.label}>
              <Box sx={{ textAlign: 'center', p: 1, bgcolor: '#F9FAFB', borderRadius: '8px' }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ fontSize: '0.68rem' }}>
                  {stat.label}
                </Typography>
                <Typography variant="subtitle1" fontWeight={800} color={stat.color} sx={{ mt: 0.2 }}>
                  {stat.value}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  )
}
