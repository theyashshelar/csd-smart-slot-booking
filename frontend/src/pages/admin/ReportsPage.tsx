import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import TextField from '@mui/material/TextField'
import Alert from '@mui/material/Alert'
import {
  DownloadRounded,
  AssessmentRounded,
  CalendarMonthRounded,
  GroupRounded,
  DescriptionRounded,
  HistoryRounded,
  LocalGroceryStoreRounded,
  LocalBarRounded,
  ViewWeekRounded,
  DateRangeRounded,
  ClearRounded,
} from '@mui/icons-material'
import { useEffect, useState } from 'react'
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts'
import {
  exportReport,
  getReport,
  exportMembersDirectory,
  exportBookingReport,
  exportCheckInCheckOutReport,
  exportGroceryBookingReport,
  exportLiquorBookingReport,
  exportSlotReport,
  exportHolidayReport,
  exportAuditLogReport,
} from '../../services/api'
import type { ReportResponse } from '../../types/api'

const chartData = [
  { name: 'Bookings', value: 0 },
  { name: 'Checked In', value: 0 },
  { name: 'Checked Out', value: 0 },
  { name: 'Cancelled', value: 0 },
]

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState(0)
  
  // Dashboard states
  const [period, setPeriod] = useState('daily')
  const [report, setReport] = useState<ReportResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Export Center states
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [exportError, setExportError] = useState<string | null>(null)
  const [exportSuccess, setExportSuccess] = useState<string | null>(null)

  const loadReport = async (selectedPeriod = period) => {
    setError(null)
    try {
      const res = await getReport(selectedPeriod)
      setReport(res.data)
    } catch (err: any) {
      setError(err?.response?.data || err.message || 'Failed to load report')
    }
  }

  useEffect(() => {
    loadReport('daily')
  }, [])

  const handlePeriodChange = async (nextPeriod: string) => {
    setPeriod(nextPeriod)
    await loadReport(nextPeriod)
  }

  const handleExportDashboard = async () => {
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

  // Handle Export Center downloads
  const handleExport = async (reportName: string, exportFn: (start?: string, end?: string) => any) => {
    setExportError(null)
    setExportSuccess(null)
    try {
      const res = await exportFn(startDate || undefined, endDate || undefined)
      const today = new Date().toISOString().split('T')[0]
      const filename = `${reportName}_${today}.xlsx`

      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      window.URL.revokeObjectURL(url)
      
      setExportSuccess(`Successfully downloaded ${filename}`)
    } catch (err: any) {
      setExportError(err?.response?.data || err?.message || `Failed to export ${reportName}`)
    }
  }

  // Quick Presets
  const applyPreset = (preset: string) => {
    const today = new Date()
    const formatDate = (date: Date) => date.toISOString().split('T')[0]

    if (preset === 'today') {
      setStartDate(formatDate(today))
      setEndDate(formatDate(today))
    } else if (preset === 'yesterday') {
      const yesterday = new Date()
      yesterday.setDate(today.getDate() - 1)
      setStartDate(formatDate(yesterday))
      setEndDate(formatDate(yesterday))
    } else if (preset === 'last7days') {
      const last7 = new Date()
      last7.setDate(today.getDate() - 6)
      setStartDate(formatDate(last7))
      setEndDate(formatDate(today))
    } else if (preset === 'thismonth') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
      setStartDate(formatDate(firstDay))
      setEndDate(formatDate(today))
    } else if (preset === 'clear') {
      setStartDate('')
      setEndDate('')
    }
  }

  return (
    <Box>
      {/* Upper header section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>
          Reports & Data Center
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Monitor operational performance, visualize metrics, and export spreadsheet directories.
        </Typography>
      </Box>

      {/* Tabs Layout */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)} color="primary">
          <Tab icon={<AssessmentRounded />} iconPosition="start" label="Analytics Dashboard" sx={{ fontWeight: 600 }} />
          <Tab icon={<DownloadRounded />} iconPosition="start" label="Export Center" sx={{ fontWeight: 600 }} />
        </Tabs>
      </Box>

      {/* Tab 0: Analytics Dashboard */}
      {activeTab === 0 && (
        <Box>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={1.5} sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight={600}>Service Trend Insights</Typography>
              <Typography variant="body2" color="text.secondary">Daily, weekly, and monthly service bookings.</Typography>
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ height: 38 }}>
              <Button variant={period === 'daily' ? 'contained' : 'outlined'} onClick={() => handlePeriodChange('daily')} sx={{ px: 2 }}>Daily</Button>
              <Button variant={period === 'weekly' ? 'contained' : 'outlined'} onClick={() => handlePeriodChange('weekly')} sx={{ px: 2 }}>Weekly</Button>
              <Button variant={period === 'monthly' ? 'contained' : 'outlined'} onClick={() => handlePeriodChange('monthly')} sx={{ px: 2 }}>Monthly</Button>
              <Button variant="contained" startIcon={<DownloadRounded />} onClick={handleExportDashboard} sx={{ px: 2 }}>Export</Button>
            </Stack>
          </Stack>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, lg: 8 }}>
              <Card sx={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: 'none' }}>
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
              <Card sx={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: 'none', height: '100%' }}>
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
      )}

      {/* Tab 1: Export Center */}
      {activeTab === 1 && (
        <Box>
          <Card sx={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: 'none', mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                Configure Export Filters
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Use date range filtering where applicable. Presets automatically calculate calendar dates.
              </Typography>

              {exportError && (
                <Alert severity="error" sx={{ mb: 2.5, borderRadius: '8px' }} onClose={() => setExportError(null)}>
                  {exportError}
                </Alert>
              )}

              {exportSuccess && (
                <Alert severity="success" sx={{ mb: 2.5, borderRadius: '8px' }} onClose={() => setExportSuccess(null)}>
                  {exportSuccess}
                </Alert>
              )}

              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, sm: 4, md: 3 }}>
                  <TextField
                    label="Start Date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4, md: 3 }}>
                  <TextField
                    label="End Date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4, md: 6 }}>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ gap: 1 }}>
                    <Button variant="outlined" size="small" onClick={() => applyPreset('today')} sx={{ textTransform: 'none', fontSize: '0.8rem' }}>Today</Button>
                    <Button variant="outlined" size="small" onClick={() => applyPreset('yesterday')} sx={{ textTransform: 'none', fontSize: '0.8rem' }}>Yesterday</Button>
                    <Button variant="outlined" size="small" onClick={() => applyPreset('last7days')} sx={{ textTransform: 'none', fontSize: '0.8rem' }}>Last 7 Days</Button>
                    <Button variant="outlined" size="small" onClick={() => applyPreset('thismonth')} sx={{ textTransform: 'none', fontSize: '0.8rem' }}>This Month</Button>
                    {(startDate || endDate) && (
                      <Button variant="contained" color="error" size="small" startIcon={<ClearRounded />} onClick={() => applyPreset('clear')} sx={{ textTransform: 'none', fontSize: '0.8rem' }}>
                        Clear
                      </Button>
                    )}
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Grid of exports */}
          <Grid container spacing={2}>
            {/* 1. Members Directory */}
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <Card sx={{ height: '100%', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: 'none', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 1.5 }}>
                    <Box sx={{ p: 1, borderRadius: '8px', bgcolor: 'success.light', color: 'success.dark', display: 'flex' }}>
                      <GroupRounded fontSize="small" />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#111827' }}>
                        Members Directory
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        No Date Filter Required
                      </Typography>
                    </Box>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                    Comprehensive list of canteen cardholders including IDs, full names, mobiles, DOBs, grocery/liquor card numbers, and registration details.
                  </Typography>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<DownloadRounded />}
                    onClick={() => handleExport('members', exportMembersDirectory)}
                    fullWidth
                    sx={{ textTransform: 'none', py: 1 }}
                  >
                    Export Members
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* 2. Booking Report */}
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <Card sx={{ height: '100%', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: 'none', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 1.5 }}>
                    <Box sx={{ p: 1, borderRadius: '8px', bgcolor: 'primary.light', color: 'primary.dark', display: 'flex' }}>
                      <CalendarMonthRounded fontSize="small" />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#111827' }}>
                        All Bookings Report
                      </Typography>
                      <Typography variant="caption" color="primary.dark" fontWeight={500} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <DateRangeRounded sx={{ fontSize: '0.9rem' }} /> Supports Date Filters
                      </Typography>
                    </Box>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                    Export list of all bookings including Token, Slot details, Member Name, Cards, Booking Date, and statuses.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<DownloadRounded />}
                    onClick={() => handleExport('bookings', exportBookingReport)}
                    fullWidth
                    sx={{ textTransform: 'none', py: 1 }}
                  >
                    Export Bookings
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* 3. Check-In / Check-Out Report */}
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <Card sx={{ height: '100%', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: 'none', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 1.5 }}>
                    <Box sx={{ p: 1, borderRadius: '8px', bgcolor: 'warning.light', color: 'warning.dark', display: 'flex' }}>
                      <DescriptionRounded fontSize="small" />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#111827' }}>
                        Check-In/Out Report
                      </Typography>
                      <Typography variant="caption" color="primary.dark" fontWeight={500} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <DateRangeRounded sx={{ fontSize: '0.9rem' }} /> Supports Date Filters
                      </Typography>
                    </Box>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                    Records logs of actual physical entries and departures, timestamps, and custom administrative operators' remarks.
                  </Typography>
                  <Button
                    variant="contained"
                    color="warning"
                    startIcon={<DownloadRounded />}
                    onClick={() => handleExport('checkins_checkouts', exportCheckInCheckOutReport)}
                    fullWidth
                    sx={{ textTransform: 'none', py: 1 }}
                  >
                    Export Check-Ins/Outs
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* 4. Grocery Booking Report */}
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <Card sx={{ height: '100%', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: 'none', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 1.5 }}>
                    <Box sx={{ p: 1, borderRadius: '8px', bgcolor: 'info.light', color: 'info.dark', display: 'flex' }}>
                      <LocalGroceryStoreRounded fontSize="small" />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#111827' }}>
                        Grocery Booking Report
                      </Typography>
                      <Typography variant="caption" color="primary.dark" fontWeight={500} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <DateRangeRounded sx={{ fontSize: '0.9rem' }} /> Supports Date Filters
                      </Typography>
                    </Box>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                    Filtered list focusing exclusively on Grocery counter slots, allowing inventory planning and card usage analytics.
                  </Typography>
                  <Button
                    variant="contained"
                    color="info"
                    startIcon={<DownloadRounded />}
                    onClick={() => handleExport('grocery_bookings', exportGroceryBookingReport)}
                    fullWidth
                    sx={{ textTransform: 'none', py: 1 }}
                  >
                    Export Grocery Bookings
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* 5. Liquor Booking Report */}
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <Card sx={{ height: '100%', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: 'none', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 1.5 }}>
                    <Box sx={{ p: 1, borderRadius: '8px', bgcolor: 'secondary.light', color: 'secondary.dark', display: 'flex' }}>
                      <LocalBarRounded fontSize="small" />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#111827' }}>
                        Liquor Booking Report
                      </Typography>
                      <Typography variant="caption" color="primary.dark" fontWeight={500} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <DateRangeRounded sx={{ fontSize: '0.9rem' }} /> Supports Date Filters
                      </Typography>
                    </Box>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                    Filtered list focusing exclusively on Liquor counter slots, useful for matching state quota approvals.
                  </Typography>
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<DownloadRounded />}
                    onClick={() => handleExport('liquor_bookings', exportLiquorBookingReport)}
                    fullWidth
                    sx={{ textTransform: 'none', py: 1 }}
                  >
                    Export Liquor Bookings
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* 6. Slot Report */}
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <Card sx={{ height: '100%', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: 'none', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 1.5 }}>
                    <Box sx={{ p: 1, borderRadius: '8px', bgcolor: 'grey.300', color: 'grey.800', display: 'flex' }}>
                      <ViewWeekRounded fontSize="small" />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#111827' }}>
                        Slot Report
                      </Typography>
                      <Typography variant="caption" color="primary.dark" fontWeight={500} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <DateRangeRounded sx={{ fontSize: '0.9rem' }} /> Supports Date Filters
                      </Typography>
                    </Box>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                    Overview of all booking slots, active capacities, bookings in range, available capacity, and calculated utilization %.
                  </Typography>
                  <Button
                    variant="outlined"
                    color="inherit"
                    startIcon={<DownloadRounded />}
                    onClick={() => handleExport('slots_report', exportSlotReport)}
                    fullWidth
                    sx={{ textTransform: 'none', py: 1 }}
                  >
                    Export Slot Statistics
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* 7. Holiday Report */}
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <Card sx={{ height: '100%', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: 'none', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 1.5 }}>
                    <Box sx={{ p: 1, borderRadius: '8px', bgcolor: 'error.light', color: 'error.dark', display: 'flex' }}>
                      <CalendarMonthRounded fontSize="small" />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#111827' }}>
                        Holiday Report
                      </Typography>
                      <Typography variant="caption" color="primary.dark" fontWeight={500} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <DateRangeRounded sx={{ fontSize: '0.9rem' }} /> Supports Date Filters
                      </Typography>
                    </Box>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                    Generates calendar lists of active holidays, combining weekly recurring closures with custom special holidays.
                  </Typography>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<DownloadRounded />}
                    onClick={() => handleExport('holidays', exportHolidayReport)}
                    fullWidth
                    sx={{ textTransform: 'none', py: 1 }}
                  >
                    Export Holiday List
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* 8. Audit Log Report */}
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <Card sx={{ height: '100%', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: 'none', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 1.5 }}>
                    <Box sx={{ p: 1, borderRadius: '8px', bgcolor: 'text.secondary', color: 'white', display: 'flex' }}>
                      <HistoryRounded fontSize="small" />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#111827' }}>
                        Audit Log Report
                      </Typography>
                      <Typography variant="caption" color="primary.dark" fontWeight={500} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <DateRangeRounded sx={{ fontSize: '0.9rem' }} /> Supports Date Filters
                      </Typography>
                    </Box>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                    Complete audit trail logging administrative and operator actions: actor info, event action type, descriptions, and timestamps.
                  </Typography>
                  <Button
                    variant="contained"
                    color="inherit"
                    startIcon={<DownloadRounded />}
                    onClick={() => handleExport('audit_logs', exportAuditLogReport)}
                    fullWidth
                    sx={{ textTransform: 'none', py: 1, bgcolor: '#111827', color: 'white', '&:hover': { bgcolor: '#1f2937' } }}
                  >
                    Export Audit Logs
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  )
}
