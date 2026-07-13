import { useEffect, useMemo, useState } from 'react'
import {
  AssessmentRounded,
  CalendarMonthRounded,
  CheckCircleRounded,
  DashboardRounded,
  EventAvailableRounded,
  FactCheckRounded,
  GroupRounded,
  Inventory2Rounded,
  LiquorRounded,
  LocalMallRounded,
  PendingActionsRounded,
  PersonAddRounded,
  SettingsRounded,
  TodayRounded,
} from '@mui/icons-material'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import LinearProgress from '@mui/material/LinearProgress'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link as RouterLink } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { motion } from 'framer-motion'
import { formatSlotLabel } from '../../utils/timeFormatter'
import { getDashboard, getSettings } from '../../services/api'
import type { DashboardChartPoint, DashboardStats, SettingsItem } from '../../types/api'

const emptyStats: DashboardStats = {
  todayVisitors: 0,
  registeredMembers: 0,
  bookings: 0,
  checkedIn: 0,
  checkedOut: 0,
  cancelled: 0,
  activeMembers: 0,
  pendingRegistrations: 0,
  rejectedRegistrations: 0,
  availableSlots: 0,
  totalSlots: 0,
  groceryAvailable: 0,
  liquorAvailable: 0,
  groceryBookings: 0,
  liquorBookings: 0,
  recentBookings: [],
  pendingRegistrationList: [],
  recentAdminActivities: [],
  weeklyBookings: [],
  monthlyBookings: [],
  cardUsage: [],
  peakBookingHours: [],
}

const statusColors: Record<string, 'success' | 'warning' | 'info' | 'error' | 'default'> = {
  BOOKED: 'warning',
  CHECKED_IN: 'info',
  CHECKED_OUT: 'success',
  CANCELLED: 'error',
}

const chartColors = ['#2E7D32', '#C9A227', '#163B2A', '#7A8F4C']

function formatNumber(value: number) {
  return value.toLocaleString('en-IN')
}

function normalizeChart(data: DashboardChartPoint[]) {
  return data.map((item) => ({
    name: item.label,
    value: item.value,
  }))
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(emptyStats)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [settings, setSettings] = useState<Record<string, string>>({})

  useEffect(() => {
    let mounted = true

    setLoading(true)
    getDashboard()
      .then((response) => {
        if (mounted) {
          setStats({ ...emptyStats, ...response.data })
          setError('')
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err?.response?.data?.message || err.message || 'Unable to load admin dashboard.')
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false)
        }
      })

    getSettings()
      .then((res) => {
        if (mounted) {
          const mapped = ((res.data || []) as SettingsItem[]).reduce<Record<string, string>>((acc, item) => {
            if (item.keyName) acc[item.keyName] = item.settingValue || ''
            return acc
          }, {})
          setSettings(mapped)
        }
      })
      .catch((err) => console.error('Failed to load settings on dashboard', err))

    return () => {
      mounted = false
    }
  }, [])

  const occupancy = useMemo(() => {
    const totalCapacity = stats.availableSlots + stats.bookings
    return totalCapacity > 0 ? Math.round((stats.bookings / totalCapacity) * 100) : 0
  }, [stats.availableSlots, stats.bookings])

  // Helper to compute operational status
  const todayStatus = useMemo(() => {
    const isBookingEnabled = settings.BOOKING_ENABLED !== 'false'
    if (!isBookingEnabled) return { label: 'Suspended (Offline)', color: '#D32F2F' }

    const todayDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' })
    const weeklyHolidays = settings.weeklyHolidays
      ? settings.weeklyHolidays.split(',').map((d) => d.trim()).filter(Boolean)
      : ['Sunday']
    if (weeklyHolidays.includes(todayDayName)) {
      return { label: 'Closed (Weekly Holiday)', color: '#D32F2F' }
    }

    const todayStr = new Date().toISOString().slice(0, 10)
    const specialHolidays = settings.specialHolidays
      ? settings.specialHolidays.split(',').map((d) => d.trim()).filter(Boolean)
      : []
    if (specialHolidays.includes(todayStr)) {
      return { label: 'Closed (Special Holiday)', color: '#D32F2F' }
    }

    return { label: 'Open & Active', color: '#2E7D32' }
  }, [settings])

  // Helper to compute next holiday
  const nextHoliday = useMemo(() => {
    const today = new Date()
    const specialHolidays = settings.specialHolidays
      ? settings.specialHolidays.split(',').map((d) => d.trim()).filter(Boolean)
      : []
    const weeklyHolidays = settings.weeklyHolidays
      ? settings.weeklyHolidays.split(',').map((d) => d.trim()).filter(Boolean)
      : ['Sunday']

    for (let i = 1; i <= 30; i++) {
      const nextDate = new Date()
      nextDate.setDate(today.getDate() + i)
      const nextDateStr = nextDate.toISOString().slice(0, 10)
      const nextDayName = nextDate.toLocaleDateString('en-US', { weekday: 'long' })

      if (specialHolidays.includes(nextDateStr)) {
        return `${nextDateStr} (Special)`
      }
      if (weeklyHolidays.includes(nextDayName)) {
        return `${nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} (${nextDayName.substring(0, 3)})`
      }
    }
    return 'None scheduled'
  }, [settings])

  const lunchTimings = useMemo(() => {
    const start = settings.lunchBreakStart || '01:00 PM'
    const end = settings.lunchBreakEnd || '02:00 PM'
    return `${start} - ${end}`
  }, [settings])

  const metricCards = [
    { label: 'Total Members', value: stats.registeredMembers, icon: GroupRounded, color: '#1E3A8A' },
    { label: 'Active Members', value: stats.activeMembers, icon: CheckCircleRounded, color: '#10B981' },
    { label: 'Pending Registrations', value: stats.pendingRegistrations, icon: PendingActionsRounded, color: '#F59E0B' },
    { label: "Today's Bookings", value: stats.bookings, icon: CalendarMonthRounded, color: '#3B82F6' },
    { label: "Today's Visitors", value: stats.todayVisitors, icon: TodayRounded, color: '#4F46E5' },
    { label: 'Available Slots', value: stats.availableSlots, icon: EventAvailableRounded, color: '#059669' },
    { label: 'Total Slots', value: stats.totalSlots, icon: DashboardRounded, color: '#6B7280' },
    { label: 'Next Holiday', value: nextHoliday, icon: SettingsRounded, color: '#EF4444' },
    { label: 'Grocery Availability', value: stats.groceryAvailable, icon: LocalMallRounded, color: '#10B981' },
    { label: 'Liquor Availability', value: stats.liquorAvailable, icon: LiquorRounded, color: '#F59E0B' },
  ]

  return (
    <Box>
      <Stack spacing={2}>
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', lg: 'center' }}
          spacing={1.5}
        >
          <Box>
            <Chip label="Admin command center" color="success" variant="outlined" sx={{ mb: 1, borderRadius: '999px', fontSize: '0.75rem', height: 22 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>
              Operations Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Live visibility across members, bookings, slots, approvals, and operational activity.
            </Typography>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button component={RouterLink} to="/admin/members" variant="contained" startIcon={<PersonAddRounded />} sx={{ height: 38 }}>
              Review Members
            </Button>
            <Button component={RouterLink} to="/admin/slots" variant="outlined" startIcon={<Inventory2Rounded />} sx={{ height: 38 }}>
              Manage Slots
            </Button>
          </Stack>
        </Stack>

        {error && <Alert severity="error" sx={{ borderRadius: '10px' }}>{error}</Alert>}

        {/* TODAY'S OPERATIONAL STATUS PANEL */}
        <Card sx={{ borderRadius: '14px', border: '1px solid #E5E7EB', boxShadow: '0 4px 18px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
          <Box sx={{ p: 2.5, bgcolor: '#F9FAFB' }}>
            <Grid container spacing={3} alignItems="center">
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Canteen Status Today
                </Typography>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 0.5 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: todayStatus.color, boxShadow: `0 0 8px ${todayStatus.color}` }} />
                  <Typography variant="h6" fontWeight={700} sx={{ color: '#111827' }}>
                    {todayStatus.label}
                  </Typography>
                </Stack>
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Lunch Break Hours
                </Typography>
                <Typography variant="body1" fontWeight={600} color="#374151" sx={{ mt: 0.5 }}>
                  {lunchTimings}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Next Scheduled Holiday
                </Typography>
                <Typography variant="body1" fontWeight={600} color="#374151" sx={{ mt: 0.5 }}>
                  {nextHoliday}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Card>

        <Grid container spacing={2}>
          {metricCards.map((card, index) => {
            const Icon = card.icon

            return (
              <Grid key={card.label} size={{ xs: 12, sm: 6, lg: 3, xl: index < 8 ? 3 : 6 }}>
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: index * 0.02 }}>
                  <Card sx={{ height: '100%', borderRadius: '14px', border: '1px solid #E5E7EB', boxShadow: '0 4px 18px rgba(0,0,0,0.06)', '&:hover': { transform: 'none' } }}>
                    <CardContent sx={{ p: 2 }}>
                      <Stack direction="row" justifyContent="space-between" spacing={2} alignItems="center">
                        <Box>
                          <Typography variant="body2" color="text.secondary" fontWeight={500}>
                            {card.label}
                          </Typography>
                          <Typography variant="h5" sx={{ mt: 0.4, fontWeight: 700, color: '#111827' }}>
                            {loading ? <Skeleton width={60} /> : typeof card.value === 'number' ? formatNumber(card.value) : card.value}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '10px',
                            display: 'grid',
                            placeItems: 'center',
                            bgcolor: `${card.color}0D`,
                            color: card.color,
                            flexShrink: 0,
                          }}
                        >
                          <Icon sx={{ fontSize: '1.25rem' }} />
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            )
          })}
        </Grid>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Card sx={{ height: '100%', borderRadius: '12px' }}>
              <CardContent sx={{ p: 2 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      Weekly Bookings
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Last seven days from confirmed booking records.
                    </Typography>
                  </Box>
                  <Chip label={`${occupancy}% utilized today`} color="success" variant="outlined" sx={{ borderRadius: '999px', height: 24, fontSize: '0.75rem' }} />
                </Stack>

                <Box sx={{ height: 260 }}>
                  {loading ? (
                    <Skeleton variant="rounded" height="100%" />
                  ) : (
                    <ResponsiveContainer>
                      <BarChart data={normalizeChart(stats.weeklyBookings)}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} allowDecimals={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="#2E7D32" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Card sx={{ height: '100%', borderRadius: '12px' }}>
              <CardContent sx={{ p: 2 }}>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      Today&apos;s Flow
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Booked, checked in, completed, and cancelled.
                    </Typography>
                  </Box>

                  {[
                    ['Bookings', stats.bookings],
                    ['Checked In', stats.checkedIn],
                    ['Checked Out', stats.checkedOut],
                    ['Cancelled', stats.cancelled],
                  ].map(([label, value]) => (
                    <Box key={label}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="body2" fontWeight={500}>{label}</Typography>
                        <Typography variant="body2" fontWeight={600} color="#111827">{formatNumber(Number(value))}</Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={stats.bookings > 0 ? Math.min((Number(value) / stats.bookings) * 100, 100) : 0}
                        sx={{
                          height: 6,
                          borderRadius: '6px',
                          bgcolor: '#F3F4F6',
                          '& .MuiLinearProgress-bar': { bgcolor: '#2E7D32' },
                        }}
                      />
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 4 }}>
            <ChartCard title="Monthly Bookings" subtitle="Six month booking trend.">
              <LineChart data={normalizeChart(stats.monthlyBookings)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} allowDecimals={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#2E7D32" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ChartCard>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <ChartCard title="Grocery vs Liquor" subtitle="Today&apos;s card usage split.">
              <PieChart>
                <Pie data={normalizeChart(stats.cardUsage)} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={4}>
                  {stats.cardUsage.map((_, index) => (
                    <Cell key={index} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ChartCard>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <ChartCard title="Peak Booking Hours" subtitle="Bookings grouped by slot start time.">
              <BarChart data={normalizeChart(stats.peakBookingHours)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} allowDecimals={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="#C9A227" />
              </BarChart>
            </ChartCard>
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 5 }}>
            <DashboardListCard title="Recent Bookings" action={<Button component={RouterLink} to="/admin/reports" size="small">Reports</Button>}>
              {loading ? (
                <Stack spacing={1}>{[1, 2, 3].map((item) => <Skeleton key={item} height={45} />)}</Stack>
              ) : stats.recentBookings.length === 0 ? (
                <EmptyPanel title="No recent bookings" message="Bookings will appear here once customers reserve slots." />
              ) : (
                <Stack spacing={1}>
                  {stats.recentBookings.map((booking) => (
                    <Box key={booking.bookingId} sx={{ p: 1.2, borderRadius: '10px', bgcolor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                      <Stack direction="row" justifyContent="space-between" spacing={2} alignItems="center">
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{booking.token}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {booking.memberName} • {formatSlotLabel(booking.slot)}
                          </Typography>
                        </Box>
                        <Chip size="small" label={booking.status} color={statusColors[booking.status] ?? 'default'} sx={{ borderRadius: '999px', fontSize: '0.7rem' }} />
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}
            </DashboardListCard>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <DashboardListCard title="Pending Registrations" action={<Button component={RouterLink} to="/admin/members" size="small">Members</Button>}>
              {loading ? (
                <Stack spacing={1}>{[1, 2, 3].map((item) => <Skeleton key={item} height={45} />)}</Stack>
              ) : stats.pendingRegistrationList.length === 0 ? (
                <EmptyPanel title="No pending reviews" message="New customer registrations will queue here for approval." />
              ) : (
                <Stack spacing={1}>
                  {stats.pendingRegistrationList.map((member) => (
                    <Box key={member.memberId} sx={{ p: 1.2, borderRadius: '10px', bgcolor: '#FFFDF5', border: '1px solid #F6E1B4' }}>
                      <Typography variant="body2" fontWeight={600}>{member.fullName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {member.mobileNumber}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </DashboardListCard>
          </Grid>

          <Grid size={{ xs: 12, lg: 3 }}>
            <DashboardListCard title="Recent Admin Activities" action={<SettingsRounded sx={{ color: 'success.main', fontSize: '1.25rem' }} />}>
              {loading ? (
                <Stack spacing={1}>{[1, 2, 3].map((item) => <Skeleton key={item} height={45} />)}</Stack>
              ) : stats.recentAdminActivities.length === 0 ? (
                <EmptyPanel title="No activity yet" message="Admin changes will appear as audit records." />
              ) : (
                <Stack spacing={1}>
                  {stats.recentAdminActivities.map((activity) => (
                    <Box key={activity.id} sx={{ p: 1.2, borderRadius: '10px', bgcolor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                      <Typography variant="body2" fontWeight={600}>{activity.action.replaceAll('_', ' ')}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {activity.details}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </DashboardListCard>
          </Grid>
        </Grid>

        <Card sx={{ borderRadius: '12px' }}>
          <CardContent sx={{ p: 2 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }}>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  Quick Actions
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Jump into the operational pages without changing dashboard context.
                </Typography>
              </Box>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
                <Button component={RouterLink} to="/admin/members" variant="outlined" startIcon={<GroupRounded />}>Members</Button>
                <Button component={RouterLink} to="/admin/slots" variant="outlined" startIcon={<EventAvailableRounded />}>Slots</Button>
                <Button component={RouterLink} to="/admin/reports" variant="outlined" startIcon={<AssessmentRounded />}>Reports</Button>
                <Button component={RouterLink} to="/admin/settings" variant="outlined" startIcon={<FactCheckRounded />}>Settings</Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  )
}

type ChartCardProps = {
  title: string
  subtitle: string
  children: React.ReactElement
}

function ChartCard({ title, subtitle, children }: ChartCardProps) {
  return (
    <Card sx={{ height: '100%', borderRadius: '12px' }}>
      <CardContent sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={600}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {subtitle}
        </Typography>
        <Box sx={{ height: 200 }}>
          <ResponsiveContainer>{children}</ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  )
}

type DashboardListCardProps = {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}

function DashboardListCard({ title, action, children }: DashboardListCardProps) {
  return (
    <Card sx={{ height: '100%', borderRadius: '12px' }}>
      <CardContent sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            {title}
          </Typography>
          {action}
        </Stack>
        {children}
      </CardContent>
    </Card>
  )
}

type EmptyPanelProps = {
  title: string
  message: string
}

function EmptyPanel({ title, message }: EmptyPanelProps) {
  return (
    <Box sx={{ p: 2, borderRadius: '10px', bgcolor: '#F9FAFB', border: '1px dashed #D1D5DB' }}>
      <Typography variant="body2" fontWeight={600}>{title}</Typography>
      <Typography color="text.secondary" variant="caption" display="block" sx={{ mt: 0.5 }}>
        {message}
      </Typography>
    </Box>
  )
}
