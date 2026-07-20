import { useEffect, useState, useMemo } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
  Skeleton,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import {
  getQueue,
  getSettings,
} from '../../services/api'
import type { OperatorBooking } from '../../types/api'
import {
  LocalGroceryStoreRounded,
  LocalBarRounded,
  ArrowForwardRounded,
  RefreshRounded,
  ScheduleRounded,
} from '@mui/icons-material'

function parseTimeToMinutes(timeStr: string): number | null {
  if (!timeStr) return null
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) return null
  let hours = parseInt(match[1], 10)
  const minutes = parseInt(match[2], 10)
  const ampm = match[3].toUpperCase()
  if (ampm === 'PM' && hours < 12) hours += 12
  if (ampm === 'AM' && hours === 12) hours = 0
  return hours * 60 + minutes
}

export default function OperatorDashboardPage() {
  const navigate = useNavigate()
  const [queue, setQueue] = useState<OperatorBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [settings, setSettings] = useState<Record<string, string>>({
    openingTime: '09:00 AM',
    closingTime: '05:00 PM',
    lunchBreakStart: '01:00 PM',
    lunchBreakEnd: '02:00 PM',
    weeklyHolidays: 'Sunday',
    specialHolidays: '',
  })

  const loadData = async (showSkeleton = false) => {
    if (showSkeleton) {
      setLoading(true)
    }
    setError('')
    try {
      const [queueRes, settingsRes] = await Promise.all([
        getQueue(),
        getSettings(),
      ])
      
      setQueue(queueRes.data || [])
      
      if (settingsRes.data && Array.isArray(settingsRes.data)) {
        const mapped = settingsRes.data.reduce((acc: any, item: any) => {
          if (item.keyName) acc[item.keyName] = item.settingValue
          return acc
        }, {})
        setSettings((prev) => ({ ...prev, ...mapped }))
      }
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
        'Unable to load canteen operational overview.'
      )
    } finally {
      if (showSkeleton) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    void loadData(true)

    const interval = setInterval(() => {
      void loadData(false)
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const todayStr = useMemo(() => {
    const d = new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const date = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${date}`
  }, [])

  // Live canteen operational status calculation
  const statusInfo = useMemo(() => {
    const now = new Date()
    const todayDayName = now.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'Asia/Kolkata' })
    const todayKolkata = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })

    const weeklyHolidays = settings.weeklyHolidays
      ? settings.weeklyHolidays.split(',').map((d) => d.trim()).filter(Boolean)
      : ['Sunday']
    
    const specialHolidays = settings.specialHolidays
      ? settings.specialHolidays.split(',').map((d) => d.trim()).filter(Boolean)
      : []

    if (weeklyHolidays.includes(todayDayName) || specialHolidays.includes(todayKolkata)) {
      return { label: 'Holiday', color: '#EF6C00', dot: '🟠' }
    }

    const opStr = settings.openingTime || '09:00 AM'
    const clStr = settings.closingTime || '05:00 PM'
    const lhStartStr = settings.lunchBreakStart || '01:00 PM'
    const lhEndStr = settings.lunchBreakEnd || '02:00 PM'

    const opMin = parseTimeToMinutes(opStr) ?? (9 * 60)
    const clMin = parseTimeToMinutes(clStr) ?? (17 * 60)
    const lhStartMin = parseTimeToMinutes(lhStartStr) ?? (13 * 60)
    const lhEndMin = parseTimeToMinutes(lhEndStr) ?? (14 * 60)

    const currentKolkataTimeStr = now.toLocaleTimeString('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    })
    const curMin = parseTimeToMinutes(currentKolkataTimeStr) ?? 0

    if (curMin < opMin) {
      return { label: 'Canteen Closed', color: '#D32F2F', dot: '🔴' }
    } else if (curMin >= opMin && curMin < lhStartMin) {
      return { label: 'Canteen Open', color: '#2E7D32', dot: '🟢' }
    } else if (curMin >= lhStartMin && curMin < lhEndMin) {
      return { label: 'Lunch Break', color: '#F59E0B', dot: '🟡' }
    } else if (curMin >= lhEndMin && curMin < clMin) {
      return { label: 'Canteen Open', color: '#2E7D32', dot: '🟢' }
    } else {
      return { label: 'Canteen Closed', color: '#D32F2F', dot: '🔴' }
    }
  }, [settings])

  // Split and filter data
  const todayBookings = useMemo(() => queue.filter(b => b.bookingDate === todayStr), [queue, todayStr])

  // Overall Counts
  const overallTotal = todayBookings.length
  const overallWaiting = todayBookings.filter(b => b.status === 'BOOKED').length
  const overallCheckedIn = todayBookings.filter(b => b.status === 'CHECKED_IN').length
  const overallCheckedOut = todayBookings.filter(b => b.status === 'CHECKED_OUT').length
  const overallCancelled = todayBookings.filter(b => b.status === 'CANCELLED').length

  // Grocery Split
  const groceryToday = useMemo(() => todayBookings.filter(b => b.slot?.cardType === 'GROCERY'), [todayBookings])
  const groceryWaiting = useMemo(() => groceryToday.filter(b => b.status === 'BOOKED'), [groceryToday])
  const groceryServingToken = useMemo(() => {
    const active = groceryWaiting[0]
    return active ? active.token : 'None'
  }, [groceryWaiting])

  // Liquor Split
  const liquorToday = useMemo(() => todayBookings.filter(b => b.slot?.cardType === 'LIQUOR'), [todayBookings])
  const liquorWaiting = useMemo(() => liquorToday.filter(b => b.status === 'BOOKED'), [liquorToday])
  const liquorServingToken = useMemo(() => {
    const active = liquorWaiting[0]
    return active ? active.token : 'None'
  }, [liquorWaiting])

  if (loading) {
    return (
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#111827', letterSpacing: '-0.02em', mb: 0.5 }}>
            Operator Console Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Loading counter overviews...
          </Typography>
        </Box>
        <Skeleton variant="rectangular" height={150} sx={{ borderRadius: '12px' }} />
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton variant="rectangular" height={220} sx={{ borderRadius: '12px' }} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton variant="rectangular" height={220} sx={{ borderRadius: '12px' }} />
          </Grid>
        </Grid>
      </Stack>
    )
  }

  return (
    <Stack spacing={3.5}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#111827', letterSpacing: '-0.02em', mb: 0.5 }}>
            Queue Operations Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            A bird's-eye overview of live counters and schedule status.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="success"
          startIcon={<RefreshRounded />}
          onClick={() => loadData(true)}
          sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}
        >
          Refresh Overview
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ borderRadius: '12px' }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Today's Overall Summary Card */}
      <Card id="overall-summary-card" sx={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: 'none' }}>
        <Box sx={{ bgcolor: '#F8FAFC', px: 3, py: 1.8, borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle2" fontWeight={800} color="#0F172A">
            📈 Canteen Cumulative Performance (Today)
          </Typography>
          <Chip
            icon={<ScheduleRounded />}
            label={`Current Schedule: ${settings.openingTime} - ${settings.closingTime}`}
            size="small"
            sx={{ fontWeight: 700, fontSize: '0.75rem', bgcolor: '#F1F5F9', border: '1px solid #E2E8F0' }}
          />
        </Box>
        <CardContent sx={{ p: 2.5 }}>
          <Grid container spacing={2}>
            {[
              ['Cumulative Bookings', overallTotal, '#1E293B'],
              ['Waiting in Queue', overallWaiting, '#D97706'],
              ['Checked In', overallCheckedIn, '#059669'],
              ['Completed Checkout', overallCheckedOut, '#2563EB'],
              ['Total Cancelled', overallCancelled, '#DC2626'],
            ].map(([label, val, color]) => (
              <Grid size={{ xs: 6, md: 2.4 }} key={label as string}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#F9FAFB', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={750} display="block" sx={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.02em', mb: 0.5 }}>
                    {label}
                  </Typography>
                  <Typography variant="h5" fontWeight={900} color={color as string}>
                    {val}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Counter Workspace Split Grid */}
      <Grid container spacing={3}>
        {/* Grocery Counter Status */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card id="grocery-workspace-card" sx={{ borderRadius: '12px', border: '1px solid #C8E6C9', boxShadow: 'none', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ bgcolor: '#E8F5E9', px: 3, py: 2, borderBottom: '1px solid #C8E6C9', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <LocalGroceryStoreRounded sx={{ color: '#1B5E20' }} />
              <Typography variant="subtitle1" fontWeight={855} color="#1B5E20">
                Grocery Counter Workspace
              </Typography>
            </Box>
            <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 2.5 }}>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>Operating Status</Typography>
                  <Chip
                    label={`${statusInfo.dot} ${statusInfo.label}`}
                    sx={{
                      bgcolor: statusInfo.label === 'Canteen Open' ? '#D1FAE5' : '#FFE4E6',
                      color: statusInfo.label === 'Canteen Open' ? '#065F46' : '#991B1B',
                      border: `1px solid ${statusInfo.label === 'Canteen Open' ? '#34D399' : '#F87171'}`,
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      borderRadius: '8px'
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>Now Serving Token</Typography>
                  <Typography variant="subtitle1" fontWeight={900} color="#1B5E20">
                    {groceryServingToken}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>Customers Waiting</Typography>
                  <Typography variant="subtitle1" fontWeight={900} color="#1E293B">
                    {groceryWaiting.length}
                  </Typography>
                </Box>
              </Stack>
              <Button
                variant="contained"
                color="success"
                fullWidth
                endIcon={<ArrowForwardRounded />}
                onClick={() => navigate('/operator/grocery')}
                sx={{ py: 1.2, borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
              >
                Open Grocery Workspace
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Liquor Counter Status */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card id="liquor-workspace-card" sx={{ borderRadius: '12px', border: '1px solid #FFE0B2', boxShadow: 'none', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ bgcolor: '#FFF3E0', px: 3, py: 2, borderBottom: '1px solid #FFE0B2', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <LocalBarRounded sx={{ color: '#E65100' }} />
              <Typography variant="subtitle1" fontWeight={855} color="#E65100">
                Liquor Counter Workspace
              </Typography>
            </Box>
            <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 2.5 }}>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>Operating Status</Typography>
                  <Chip
                    label={`${statusInfo.dot} ${statusInfo.label}`}
                    sx={{
                      bgcolor: statusInfo.label === 'Canteen Open' ? '#D1FAE5' : '#FFE4E6',
                      color: statusInfo.label === 'Canteen Open' ? '#065F46' : '#991B1B',
                      border: `1px solid ${statusInfo.label === 'Canteen Open' ? '#34D399' : '#F87171'}`,
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      borderRadius: '8px'
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>Now Serving Token</Typography>
                  <Typography variant="subtitle1" fontWeight={900} color="#E65100">
                    {liquorServingToken}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>Customers Waiting</Typography>
                  <Typography variant="subtitle1" fontWeight={900} color="#1E293B">
                    {liquorWaiting.length}
                  </Typography>
                </Box>
              </Stack>
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                endIcon={<ArrowForwardRounded />}
                onClick={() => navigate('/operator/liquor')}
                sx={{
                  py: 1.2,
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 700,
                  bgcolor: '#E65100',
                  '&:hover': { bgcolor: '#BF360C' }
                }}
              >
                Open Liquor Workspace
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions Panel */}
      <Card id="quick-actions-card" sx={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: 'none' }}>
        <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid #E5E7EB', bgcolor: '#F9FAFB' }}>
          <Typography variant="subtitle2" fontWeight={800} color="#111827">
            ⚡ Quick Shortcuts & Resource Links
          </Typography>
        </Box>
        <CardContent sx={{ p: 2 }}>
          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
            <Button
              variant="outlined"
              color="success"
              startIcon={<LocalGroceryStoreRounded />}
              onClick={() => navigate('/operator/grocery')}
              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
            >
              Go to Grocery Counter
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<LocalBarRounded />}
              onClick={() => navigate('/operator/liquor')}
              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px', color: '#E65100', borderColor: '#E65100', '&:hover': { borderColor: '#E65100', bgcolor: 'rgba(230,81,0,0.04)' } }}
            >
              Go to Liquor Counter
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
