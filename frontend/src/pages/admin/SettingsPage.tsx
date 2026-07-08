import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'
import { getSettings, saveSettings } from '../../services/api'
import type { SettingsItem } from '../../types/api'

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await getSettings()
        const mapped = ((res.data || []) as SettingsItem[]).reduce<Record<string, string>>((acc, item) => {
          if (item.keyName) acc[item.keyName] = item.settingValue || ''
          return acc
        }, {})
        setSettings(mapped)
      } catch (err: any) {
        setError(err?.response?.data || err.message || 'Failed to load settings')
      }
    }

    loadSettings()
  }, [])

  const updateSetting = async (keyName: string, value: string) => {
    setLoading(true)
    setError(null)
    try {
      await saveSettings(keyName, value)
      setSettings((prev) => ({ ...prev, [keyName]: value }))
    } catch (err: any) {
      setError(err?.response?.data || err.message || 'Failed to save setting')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>System Configuration</Typography>
        <Typography variant="body2" color="text.secondary">Manage operating hours, slot capacities, and dynamic booking configurations.</Typography>
      </Box>

      {error && <Typography color="error" sx={{ mb: 2, fontSize: '0.875rem' }}>{error}</Typography>}
      {loading && <Typography color="text.secondary" sx={{ mb: 2, fontSize: '0.875rem' }}>Saving settings…</Typography>}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: '12px' }}>
            <CardContent sx={{ p: 2 }}>
              <Stack spacing={2}>
                <Typography variant="subtitle1" fontWeight={600}>Operating Hours</Typography>
                <TextField label="Opening Time" size="small" fullWidth value={settings.openingTime || ''} onChange={(e) => updateSetting('openingTime', e.target.value)} />
                <TextField label="Closing Time" size="small" fullWidth value={settings.closingTime || ''} onChange={(e) => updateSetting('closingTime', e.target.value)} />
                <TextField label="Capacity" size="small" fullWidth value={settings.capacity || ''} onChange={(e) => updateSetting('capacity', e.target.value)} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: '12px' }}>
            <CardContent sx={{ p: 2 }}>
              <Stack spacing={2}>
                <Typography variant="subtitle1" fontWeight={600}>Booking Controls</Typography>
                <TextField label="Booking Window" size="small" fullWidth value={settings.bookingWindow || ''} onChange={(e) => updateSetting('bookingWindow', e.target.value)} />
                <TextField label="Token Prefix" size="small" fullWidth value={settings.tokenPrefix || ''} onChange={(e) => updateSetting('tokenPrefix', e.target.value)} />
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.primary" fontWeight={500}>SMS Alerts</Typography>
                  <Switch checked={Boolean(settings.smsAlerts)} onChange={(_, checked) => updateSetting('smsAlerts', checked ? 'true' : 'false')} />
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
