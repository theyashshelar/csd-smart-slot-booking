import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { GroupRounded, EventAvailableRounded, FactCheckRounded, CancelRounded, AddRounded } from '@mui/icons-material'
import { Link as RouterLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts'
import { getDashboard } from '../../services/api'
import type { DashboardStats } from '../../types/api'

const initialStats: DashboardStats = {
  todayVisitors: 0,
  registeredMembers: 0,
  bookings: 0,
  checkedIn: 0,
  checkedOut: 0,
  cancelled: 0,
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(initialStats)
  const [loading, setLoading] = useState(false)
  const [, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    getDashboard()
      .then((res) => {
        if (mounted) setStats(res.data)
      })
      .catch((err) => setError(err?.response?.data || err.message || 'Failed to load'))
      .finally(() => setLoading(false))
    return () => { mounted = false }
  }, [])

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Operations Overview</Typography>
          <Typography color="text.secondary">Command center for bookings, members, and service flow.</Typography>
        </Box>
        <Button component={RouterLink} to="/admin/members" variant="contained" startIcon={<AddRounded />}>Add Member</Button>
      </Stack>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary">Today's Visitors</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{loading ? '...' : stats.todayVisitors}</Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `primary.main20`, color: 'primary.main' }}>
                  <GroupRounded />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary">Registered Members</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{loading ? '...' : stats.registeredMembers}</Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `secondary.main20`, color: 'secondary.main' }}>
                  <EventAvailableRounded />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary">Checked In</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{loading ? '...' : stats.checkedIn}</Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `success.main20`, color: 'success.main' }}>
                  <FactCheckRounded />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary">Cancelled</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{loading ? '...' : stats.cancelled}</Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `error.main20`, color: 'error.main' }}>
                  <CancelRounded />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Weekly Booking Trend</Typography>
              <Box sx={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                  <BarChart data={[{ name: 'Today', bookings: stats.bookings || 0 }]}> 
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="bookings" fill="#355E3B" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Quick Actions</Typography>
              <Stack spacing={1.5}>
                <Button component={RouterLink} to="/admin/slots" variant="outlined">Manage Slots</Button>
                <Button component={RouterLink} to="/admin/reports" variant="outlined">View Reports</Button>
                <Button component={RouterLink} to="/admin/settings" variant="outlined">Update Settings</Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Recent Bookings</Typography>
          <Typography color="text.secondary">Recent bookings are available in the Reports section.</Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
