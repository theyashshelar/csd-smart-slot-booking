import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { EditRounded } from '@mui/icons-material'
import { useEffect, useState } from 'react'
import { getSlotsAdmin } from '../../services/api'
import type { Slot } from '../../types/api'

export default function SlotsPage() {
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    getSlotsAdmin()
      .then((res) => setSlots(res.data || []))
      .catch((err) => setError(err?.response?.data || err.message || 'Failed to load slots'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Slot Management</Typography>
          <Typography color="text.secondary">Keep capacity balanced and service flow optimized.</Typography>
        </Box>
      </Stack>

      <Grid container spacing={2}>
        {loading && <Typography sx={{ p: 2 }}>Loading slots...</Typography>}
        {error && <Typography color="error">{error}</Typography>}
        {slots.map((slot) => (
          <Grid size={{ xs: 12, md: 4 }} key={slot.id}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">{`${slot.startTime || ''}-${slot.endTime || ''}`}</Typography>
                    <Chip label={!slot.active ? 'Disabled' : (slot.capacity && slot.bookedCount !== undefined ? Math.max(0, (slot.capacity - (slot.bookedCount || 0))) === 0 ? 'Full' : 'Open' : 'Open')} color={!slot.active ? 'default' : (slot.capacity && slot.bookedCount !== undefined ? (Math.max(0, (slot.capacity - (slot.bookedCount || 0))) === 0 ? 'error' : 'success') : 'success')} />
                  </Stack>
                  <Typography><strong>Capacity:</strong> {slot.capacity ?? '-'}</Typography>
                  <Typography><strong>Booked:</strong> {slot.bookedCount ?? 0}</Typography>
                  <Typography><strong>Available:</strong> {(slot.capacity ?? 0) - (slot.bookedCount ?? 0)}</Typography>
                  <Button variant="outlined" startIcon={<EditRounded />}>Edit</Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
