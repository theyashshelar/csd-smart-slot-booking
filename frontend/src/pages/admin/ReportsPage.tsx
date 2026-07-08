import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { DownloadRounded } from '@mui/icons-material'
import { useEffect, useState } from 'react'
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts'
import { exportReport, getReport } from '../../services/api'
import type { ReportResponse } from '../../types/api'

const chartData = [
  { name: 'Bookings', value: 0 },
  { name: 'Checked In', value: 0 },
  { name: 'Checked Out', value: 0 },
  { name: 'Cancelled', value: 0 },
]

export default function ReportsPage() {
  const [period, setPeriod] = useState('daily')
  const [report, setReport] = useState<ReportResponse | null>(null)
  const [, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadReport = async (selectedPeriod = period) => {
    setLoading(true)
    setError(null)
    try {
      const res = await getReport(selectedPeriod)
      setReport(res.data)
    } catch (err: any) {
      setError(err?.response?.data || err.message || 'Failed to load report')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReport('daily')
  }, [])

  const handlePeriodChange = async (nextPeriod: string) => {
    setPeriod(nextPeriod)
    await loadReport(nextPeriod)
  }

  const handleExport = async () => {
    try {
      const res = await exportReport(period)
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `${period}-report.xlsx`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      setError(err?.message || 'Export failed')
    }
  }

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={1.5} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>Business Reports</Typography>
          <Typography variant="body2" color="text.secondary">Daily, weekly, and monthly service insights.</Typography>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ height: 38 }}>
          <Button variant={period === 'daily' ? 'contained' : 'outlined'} onClick={() => handlePeriodChange('daily')} sx={{ px: 2 }}>Daily</Button>
          <Button variant={period === 'weekly' ? 'contained' : 'outlined'} onClick={() => handlePeriodChange('weekly')} sx={{ px: 2 }}>Weekly</Button>
          <Button variant={period === 'monthly' ? 'contained' : 'outlined'} onClick={() => handlePeriodChange('monthly')} sx={{ px: 2 }}>Monthly</Button>
          <Button variant="contained" startIcon={<DownloadRounded />} onClick={handleExport} sx={{ px: 2 }}>Export</Button>
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ borderRadius: '12px' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>Bookings Trend</Typography>
              {error && <Typography color="error" variant="body2" sx={{ mb: 1.5 }}>{error}</Typography>}
              <Box sx={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <LineChart data={report ? [
                    { name: 'Bookings', value: report.totalBookings },
                    { name: 'Checked In', value: report.checkedIn },
                    { name: 'Checked Out', value: report.checkedOut },
                    { name: 'Cancelled', value: report.cancelled },
                  ] : chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#2E7D32" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ borderRadius: '12px', height: '100%' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>Highlights</Typography>
              <Stack spacing={1}>
                {[
                  ['Active Members', report?.activeMembers ?? 0],
                  ['Total Members', report?.totalMembers ?? 0],
                  ['Occupancy', `${report?.occupancyPercentage ?? 0}%`],
                  ['Available Slots', report?.availableSlots ?? 0],
                ].map(([label, value]) => (
                  <Box key={label} sx={{ p: 1.2, borderRadius: '10px', bgcolor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={500} display="block">
                      {label}
                    </Typography>
                    <Typography variant="body2" fontWeight={600} color="#111827">
                      {value}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
