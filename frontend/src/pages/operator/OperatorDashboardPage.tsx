import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { PlayArrowRounded, CheckCircleRounded, CancelRounded, QrCodeRounded } from '@mui/icons-material'
import { useEffect, useState } from 'react'
import { getQueue, checkIn, checkOut, cancelBooking } from '../../services/api'
import type { Booking } from '../../types/api'

export default function OperatorDashboardPage() {
  const [queue, setQueue] = useState<Booking[]>([])
  const [, setLoading] = useState(false)
  const [, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await getQueue()
      setQueue(res.data || [])
    } catch (e: any) {
      setError(e?.response?.data || e?.message || 'Failed to load queue')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])
  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Operator Queue</Typography>
          <Typography color="text.secondary">Manage service flow and complete check-in actions.</Typography>
        </Box>
        <Button variant="contained" startIcon={<QrCodeRounded />}>Generate Token</Button>
      </Stack>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField fullWidth label="Search queue" />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Button variant="outlined" fullWidth onClick={load}>Refresh Queue</Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Token</TableCell>
                <TableCell>Member</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {queue.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.token}</TableCell>
                  <TableCell>{row.member?.fullName}</TableCell>
                  <TableCell><Chip label={row.token ? (row.token ? 'Assigned' : 'Pending') : 'Pending'} color={row.token ? 'success' : 'default'} /></TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button size="small" startIcon={<CheckCircleRounded />} onClick={async () => { await checkIn(row.id); await load() }}>Check In</Button>
                      <Button size="small" startIcon={<PlayArrowRounded />} onClick={async () => { await checkOut(row.id); await load() }}>Check Out</Button>
                      <Button size="small" color="error" startIcon={<CancelRounded />} onClick={async () => { await cancelBooking(row.id); await load() }}>Cancel</Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  )
}
