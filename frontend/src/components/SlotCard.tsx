import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

type SlotCardProps = {
  time: string
  capacity: number
  booked: number
  available: number
}

export default function SlotCard({ time, capacity, booked, available }: SlotCardProps) {
  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">{time}</Typography>
            <Chip label={available === 0 ? 'Full' : 'Open'} color={available === 0 ? 'error' : 'success'} />
          </Stack>
          <Box>
            <Typography variant="body2" color="text.secondary">Capacity: {capacity}</Typography>
            <Typography variant="body2" color="text.secondary">Booked: {booked}</Typography>
            <Typography variant="body2" color="text.secondary">Available: {available}</Typography>
          </Box>
          <Button variant="outlined">Manage Slot</Button>
        </Stack>
      </CardContent>
    </Card>
  )
}
