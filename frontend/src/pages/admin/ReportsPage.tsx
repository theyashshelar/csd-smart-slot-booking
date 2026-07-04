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
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Business Reports</Typography>
          <Typography color="text.secondary">Daily, weekly, and monthly service insights.</Typography>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Button variant={period === 'daily' ? 'contained' : 'outlined'} onClick={() => handlePeriodChange('daily')}>Daily</Button>
          <Button variant={period === 'weekly' ? 'contained' : 'outlined'} onClick={() => handlePeriodChange('weekly')}>Weekly</Button>
          <Button variant={period === 'monthly' ? 'contained' : 'outlined'} onClick={() => handlePeriodChange('monthly')}>Monthly</Button>
          <Button variant="contained" startIcon={<DownloadRounded />} onClick={handleExport}>Export</Button>
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Bookings Trend</Typography>
              {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={report ? [
                    { name: 'Bookings', value: report.totalBookings },
                    { name: 'Checked In', value: report.checkedIn },
                    { name: 'Checked Out', value: report.checkedOut },
                    { name: 'Cancelled', value: report.cancelled },
                  ] : chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#355E3B" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Highlights</Typography>
              <Stack spacing={1.5}>
                <Typography><strong>Active Members:</strong> {report?.activeMembers ?? 0}</Typography>
                <Typography><strong>Total Members:</strong> {report?.totalMembers ?? 0}</Typography>
                <Typography><strong>Occupancy:</strong> {report?.occupancyPercentage ?? 0}%</Typography>
                <Typography><strong>Available Slots:</strong> {report?.availableSlots ?? 0}</Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
