import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  DashboardRounded,
  GroupRounded,
  CalendarMonthRounded,
  AssessmentRounded,
  SettingsRounded,
  LogoutRounded,
  QrCodeRounded,
} from '@mui/icons-material'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { getRole } from '../services/auth'

const adminItems = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: DashboardRounded },
  { label: 'Members', to: '/admin/members', icon: GroupRounded },
  { label: 'Slots', to: '/admin/slots', icon: CalendarMonthRounded },
  { label: 'Reports', to: '/admin/reports', icon: AssessmentRounded },
  { label: 'Settings', to: '/admin/settings', icon: SettingsRounded },
]

const operatorItems = [
  { label: 'Queue', to: '/operator/dashboard', icon: DashboardRounded },
]

export default function Sidebar() {
  const location = useLocation()
  const role = getRole()
  const items = role === 'OPERATOR' ? operatorItems : adminItems

  return (
    <Box sx={{ width: { xs: 0, md: 280 }, bgcolor: 'primary.main', color: 'white', display: { xs: 'none', md: 'flex' }, flexDirection: 'column' }}>
      <Box sx={{ p: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <QrCodeRounded />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{role === 'OPERATOR' ? 'Operator Console' : 'Admin Console'}</Typography>
            <Typography variant="caption" sx={{ opacity: 0.85 }}>{role === 'OPERATOR' ? 'CSD Operations' : 'CSD Operations'}</Typography>
          </Box>
        </Stack>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.14)' }} />
      <List sx={{ px: 1.5, py: 2 }}>
        {items.map((item) => {
          const Icon = item.icon
          const active = location.pathname.startsWith(item.to)
          return (
            <ListItemButton
              key={item.to}
              component={RouterLink}
              to={item.to}
              selected={active}
              sx={{ borderRadius: 2, mb: 1, '&.Mui-selected': { bgcolor: 'rgba(255,255,255,0.16)' } }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}><Icon /></ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          )
        })}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{ p: 2 }}>
        <ListItemButton component={RouterLink} to="/" sx={{ borderRadius: 2, bgcolor: 'rgba(255,255,255,0.08)' }}>
          <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}><LogoutRounded /></ListItemIcon>
          <ListItemText primary="Exit Portal" />
        </ListItemButton>
      </Box>
    </Box>
  )
}
