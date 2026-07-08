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
import { getDashboard } from '../../services/api'
import type { DashboardChartPoint, DashboardStats } from '../../types/api'

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

    return () => {
      mounted = false
    }
  }, [])

  const occupancy = useMemo(() => {
    const totalCapacity = stats.availableSlots + stats.bookings
    return totalCapacity > 0 ? Math.round((stats.bookings / totalCapacity) * 100) : 0
  }, [stats.availableSlots, stats.bookings])

  const metricCards = [
    { label: 'Total Members', value: stats.registeredMembers, icon: GroupRounded, color: '#2E7D32' },
    { label: 'Active Members', value: stats.activeMembers, icon: CheckCircleRounded, color: '#1B5E20' },
    { label: 'Pending Registrations', value: stats.pendingRegistrations, icon: PendingActionsRounded, color: '#C9A227' },
    { label: "Today's Bookings", value: stats.bookings, icon: CalendarMonthRounded, color: '#2E7D32' },
    { label: "Today's Visitors", value: stats.todayVisitors, icon: TodayRounded, color: '#163B2A' },
    { label: 'Available Slots', value: stats.availableSlots, icon: EventAvailableRounded, color: '#2E7D32' },
    { label: 'Total Slots', value: stats.totalSlots, icon: DashboardRounded, color: '#163B2A' },
    { label: 'Holidays', value: 'Not configured', icon: SettingsRounded, color: '#7A8F4C' },
    { label: 'Grocery Availability', value: stats.groceryAvailable, icon: LocalMallRounded, color: '#2E7D32' },
    { label: 'Liquor Availability', value: stats.liquorAvailable, icon: LiquorRounded, color: '#C9A227' },
  ]

  return (
    <Box>
      <Stack spacing={3}>
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', lg: 'center' }}
          spacing={2}
        >
          <Box>
            <Chip label="Admin command center" color="success" variant="outlined" sx={{ mb: 1.5 }} />
            <Typography variant="h3" sx={{ fontWeight: 850, color: '#102319', lineHeight: 1.05 }}>
              Operations Dashboard
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1, fontSize: 16 }}>
              Live visibility across members, bookings, slots, approvals, and operational activity.
            </Typography>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
            <Button component={RouterLink} to="/admin/members" variant="contained" startIcon={<PersonAddRounded />}>
              Review Members
            </Button>
            <Button component={RouterLink} to="/admin/slots" variant="outlined" startIcon={<Inventory2Rounded />}>
              Manage Slots
            </Button>
          </Stack>
        </Stack>

        {error && <Alert severity="error">{error}</Alert>}

        <Grid container spacing={2}>
          {metricCards.map((card, index) => {
            const Icon = card.icon

            return (
              <Grid key={card.label} size={{ xs: 12, sm: 6, lg: 3, xl: index < 8 ? 3 : 6 }}>
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: index * 0.03 }}>
                  <Card sx={{ height: '100%', borderRadius: 4, boxShadow: '0 16px 40px rgba(15,23,42,0.07)' }}>
                    <CardContent sx={{ p: 2.6 }}>
                      <Stack direction="row" justifyContent="space-between" spacing={2}>
                        <Box>
                          <Typography variant="body2" color="text.secondary" fontWeight={700}>
                            {card.label}
                          </Typography>
                          <Typography variant="h4" sx={{ mt: 0.8, fontWeight: 850, color: '#102319' }}>
                            {loading ? <Skeleton width={78} /> : typeof card.value === 'number' ? formatNumber(card.value) : card.value}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 3,
                            display: 'grid',
                            placeItems: 'center',
                            bgcolor: `${card.color}14`,
                            color: card.color,
                            flexShrink: 0,
                          }}
                        >
                          <Icon />
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            )
          })}
        </Grid>

        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Card sx={{ height: '100%', borderRadius: 4 }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 2.5 }}>
                  <Box>
                    <Typography variant="h5" fontWeight={850}>
                      Weekly Bookings
                    </Typography>
                    <Typography color="text.secondary">
                      Last seven days from confirmed booking records.
                    </Typography>
                  </Box>
                  <Chip label={`${occupancy}% utilized today`} color="success" variant="outlined" />
                </Stack>

                <Box sx={{ height: 320 }}>
                  {loading ? (
                    <Skeleton variant="rounded" height="100%" />
                  ) : (
                    <ResponsiveContainer>
                      <BarChart data={normalizeChart(stats.weeklyBookings)}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7ECE8" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="#2E7D32" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Card sx={{ height: '100%', borderRadius: 4, color: '#fff', background: 'linear-gradient(135deg, #102319 0%, #1B5E20 64%, #C9A227 100%)' }}>
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={2.5}>
                  <Box>
                    <Typography variant="h5" fontWeight={850}>
                      Today&apos;s Flow
                    </Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.72)' }}>
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
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.8 }}>
                        <Typography>{label}</Typography>
                        <Typography fontWeight={850}>{formatNumber(Number(value))}</Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={stats.bookings > 0 ? Math.min((Number(value) / stats.bookings) * 100, 100) : 0}
                        sx={{
                          height: 8,
                          borderRadius: 99,
                          bgcolor: 'rgba(255,255,255,0.22)',
                          '& .MuiLinearProgress-bar': { bgcolor: '#FFFFFF' },
                        }}
                      />
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, lg: 4 }}>
            <ChartCard title="Monthly Bookings" subtitle="Six month booking trend.">
              <LineChart data={normalizeChart(stats.monthlyBookings)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7ECE8" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#2E7D32" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ChartCard>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <ChartCard title="Grocery vs Liquor" subtitle="Today&apos;s card usage split.">
              <PieChart>
                <Pie data={normalizeChart(stats.cardUsage)} dataKey="value" nameKey="name" innerRadius={58} outerRadius={96} paddingAngle={4}>
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
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7ECE8" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="#C9A227" />
              </BarChart>
            </ChartCard>
          </Grid>
        </Grid>

        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, lg: 5 }}>
            <DashboardListCard title="Recent Bookings" action={<Button component={RouterLink} to="/admin/reports" size="small">Reports</Button>}>
              {loading ? (
                <Stack spacing={1.2}>{[1, 2, 3].map((item) => <Skeleton key={item} height={58} />)}</Stack>
              ) : stats.recentBookings.length === 0 ? (
                <EmptyPanel title="No recent bookings" message="Bookings will appear here once customers reserve slots." />
              ) : (
                <Stack spacing={1.3}>
                  {stats.recentBookings.map((booking) => (
                    <Box key={booking.bookingId} sx={{ p: 1.6, borderRadius: 3, bgcolor: '#F8FAF8', border: '1px solid rgba(17,24,39,0.06)' }}>
                      <Stack direction="row" justifyContent="space-between" spacing={2}>
                        <Box>
                          <Typography fontWeight={850}>{booking.token}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {booking.memberName} • {booking.slot}
                          </Typography>
                        </Box>
                        <Chip size="small" label={booking.status} color={statusColors[booking.status] ?? 'default'} />
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
                <Stack spacing={1.2}>{[1, 2, 3].map((item) => <Skeleton key={item} height={58} />)}</Stack>
              ) : stats.pendingRegistrationList.length === 0 ? (
                <EmptyPanel title="No pending reviews" message="New customer registrations will queue here for approval." />
              ) : (
                <Stack spacing={1.3}>
                  {stats.pendingRegistrationList.map((member) => (
                    <Box key={member.memberId} sx={{ p: 1.6, borderRadius: 3, bgcolor: '#FFFDF6', border: '1px solid rgba(201,162,39,0.22)' }}>
                      <Typography fontWeight={850}>{member.fullName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {member.mobileNumber}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </DashboardListCard>
          </Grid>

          <Grid size={{ xs: 12, lg: 3 }}>
            <DashboardListCard title="Recent Admin Activities" action={<SettingsRounded color="success" />}>
              {loading ? (
                <Stack spacing={1.2}>{[1, 2, 3].map((item) => <Skeleton key={item} height={58} />)}</Stack>
              ) : stats.recentAdminActivities.length === 0 ? (
                <EmptyPanel title="No activity yet" message="Admin changes will appear as audit records." />
              ) : (
                <Stack spacing={1.3}>
                  {stats.recentAdminActivities.map((activity) => (
                    <Box key={activity.id} sx={{ p: 1.6, borderRadius: 3, bgcolor: '#F8FAF8', border: '1px solid rgba(17,24,39,0.06)' }}>
                      <Typography fontWeight={850}>{activity.action.replaceAll('_', ' ')}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {activity.details}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </DashboardListCard>
          </Grid>
        </Grid>

        <Card sx={{ borderRadius: 4 }}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }}>
              <Box>
                <Typography variant="h5" fontWeight={850}>
                  Quick Actions
                </Typography>
                <Typography color="text.secondary">
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
    <Card sx={{ height: '100%', borderRadius: 4 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={850}>
          {title}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {subtitle}
        </Typography>
        <Box sx={{ height: 260 }}>
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
    <Card sx={{ height: '100%', borderRadius: 4 }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={850}>
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
    <Box sx={{ p: 2.2, borderRadius: 3, bgcolor: '#F8FAF8', border: '1px dashed rgba(46,125,50,0.26)' }}>
      <Typography fontWeight={850}>{title}</Typography>
      <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
        {message}
      </Typography>
    </Box>
  )
}
