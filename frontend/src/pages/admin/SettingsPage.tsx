import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import { useEffect, useState, useMemo } from 'react'
import IconButton from '@mui/material/IconButton'
import {
  AccessTimeRounded,
  LocalMallRounded,
  CalendarMonthRounded,
  DeleteRounded,
  AddCircleOutlineRounded,
  ToggleOnRounded,
} from '@mui/icons-material'
import { getSettings, saveSettings } from '../../services/api'
import type { SettingsItem } from '../../types/api'

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // New special holiday inputs
  const [newSpecialHoliday, setNewSpecialHoliday] = useState('')
  const [newSpecialHolidayName, setNewSpecialHolidayName] = useState('')
  const [newSpecialHolidayDesc, setNewSpecialHolidayDesc] = useState('')

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await getSettings()
        const mapped = ((res.data || []) as SettingsItem[]).reduce<Record<string, string>>((acc, item) => {
          if (item.keyName) acc[item.keyName] = item.settingValue || ''
          return acc
        }, {})
        
        // Provide intelligent defaults if empty
        if (!mapped.BOOKING_ENABLED) mapped.BOOKING_ENABLED = 'true'
        if (!mapped.openingTime) mapped.openingTime = '09:00 AM'
        if (!mapped.closingTime) mapped.closingTime = '05:00 PM'
        if (!mapped.lunchBreakStart) mapped.lunchBreakStart = '01:00 PM'
        if (!mapped.lunchBreakEnd) mapped.lunchBreakEnd = '02:00 PM'
        if (!mapped.groceryCapacity) mapped.groceryCapacity = '50'
        if (!mapped.liquorCapacity) mapped.liquorCapacity = '30'
        if (!mapped.weeklyHolidays) mapped.weeklyHolidays = 'Sunday'
        if (!mapped.specialHolidays) mapped.specialHolidays = ''
        if (!mapped.specialHolidaysDetails) mapped.specialHolidaysDetails = '[]'
        if (!mapped.bookingWindow) mapped.bookingWindow = '3'

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
    setSuccess(null)
    try {
      await saveSettings(keyName, value)
      setSettings((prev) => ({ ...prev, [keyName]: value }))
      setSuccess('Settings updated successfully.')
    } catch (err: any) {
      setError(err?.response?.data || err.message || 'Failed to save setting')
    } finally {
      setLoading(false)
    }
  }

  // Handle Weekly Holiday selection change
  const handleWeeklyHolidayChange = (day: string, checked: boolean) => {
    const currentHolidays = settings.weeklyHolidays
      ? settings.weeklyHolidays.split(',').map((d) => d.trim()).filter(Boolean)
      : []
    
    let updated: string[]
    if (checked) {
      if (!currentHolidays.includes(day)) {
        updated = [...currentHolidays, day]
      } else {
        updated = currentHolidays
      }
    } else {
      updated = currentHolidays.filter((d) => d !== day)
    }

    const newVal = updated.join(',')
    updateSetting('weeklyHolidays', newVal)
  }

  // Add Special Holiday
  const handleAddSpecialHoliday = async () => {
    if (!newSpecialHoliday) {
      setError('Please select a date for the special holiday.')
      return
    }

    const currentDates = settings.specialHolidays
      ? settings.specialHolidays.split(',').map((d) => d.trim()).filter(Boolean)
      : []

    if (currentDates.includes(newSpecialHoliday)) {
      setError('This holiday date has already been added.')
      return
    }

    let currentDetails: { date: string; name: string; description: string }[] = []
    if (settings.specialHolidaysDetails) {
      try {
        currentDetails = JSON.parse(settings.specialHolidaysDetails)
      } catch (e) {
        console.error('Error parsing specialHolidaysDetails', e)
      }
    }

    const newDetail = {
      date: newSpecialHoliday,
      name: newSpecialHolidayName.trim() || 'Special Holiday',
      description: newSpecialHolidayDesc.trim() || 'Canteen Closed',
    }

    const updatedDates = [...currentDates, newSpecialHoliday].sort()
    const updatedDetails = [...currentDetails, newDetail]

    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const datesStr = updatedDates.join(',')
      const detailsStr = JSON.stringify(updatedDetails)

      await saveSettings('specialHolidays', datesStr)
      await saveSettings('specialHolidaysDetails', detailsStr)

      setSettings((prev) => ({
        ...prev,
        specialHolidays: datesStr,
        specialHolidaysDetails: detailsStr,
      }))
      setSuccess('Special holiday added successfully.')
      setNewSpecialHoliday('')
      setNewSpecialHolidayName('')
      setNewSpecialHolidayDesc('')
    } catch (err: any) {
      setError(err?.response?.data || err.message || 'Failed to save holiday setting')
    } finally {
      setLoading(false)
    }
  }

  // Remove Special Holiday
  const handleRemoveSpecialHoliday = async (dateToRemove: string) => {
    const currentDates = settings.specialHolidays
      ? settings.specialHolidays.split(',').map((d) => d.trim()).filter(Boolean)
      : []

    let currentDetails: { date: string; name: string; description: string }[] = []
    if (settings.specialHolidaysDetails) {
      try {
        currentDetails = JSON.parse(settings.specialHolidaysDetails)
      } catch (e) {
        console.error('Error parsing specialHolidaysDetails', e)
      }
    }

    const updatedDates = currentDates.filter((d) => d !== dateToRemove)
    const updatedDetails = currentDetails.filter((d) => d.date !== dateToRemove)

    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const datesStr = updatedDates.join(',')
      const detailsStr = JSON.stringify(updatedDetails)

      await saveSettings('specialHolidays', datesStr)
      await saveSettings('specialHolidaysDetails', detailsStr)

      setSettings((prev) => ({
        ...prev,
        specialHolidays: datesStr,
        specialHolidaysDetails: detailsStr,
      }))
      setSuccess('Special holiday removed successfully.')
    } catch (err: any) {
      setError(err?.response?.data || err.message || 'Failed to save holiday setting')
    } finally {
      setLoading(false)
    }
  }

  const activeWeeklyHolidays = settings.weeklyHolidays
    ? settings.weeklyHolidays.split(',').map((d) => d.trim())
    : []

  // Derived state for special holidays list to support date/name/description
  const specialHolidaysList = useMemo(() => {
    const dates = settings.specialHolidays
      ? settings.specialHolidays.split(',').map((d) => d.trim()).filter(Boolean)
      : []

    let details: { date: string; name: string; description: string }[] = []
    if (settings.specialHolidaysDetails) {
      try {
        details = JSON.parse(settings.specialHolidaysDetails)
      } catch (e) {
        console.error('Error parsing specialHolidaysDetails', e)
      }
    }

    const combined = dates.map((date) => {
      const found = details.find((d) => d.date === date)
      return {
        date,
        name: found?.name || 'Special Holiday',
        description: found?.description || 'Canteen Closed',
      }
    })

    return combined.sort((a, b) => a.date.localeCompare(b.date))
  }, [settings.specialHolidays, settings.specialHolidaysDetails])

  const formatHolidayDate = (dateStr: string) => {
    if (!dateStr) return ''
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return dateStr
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>
          Operational Configuration
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configure operating hours, daily slot capacities, weekly holidays, and special calendar closures.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: '10px' }}>{success}</Alert>}
      {loading && <Typography color="text.secondary" sx={{ mb: 2, fontSize: '0.875rem', fontWeight: 500 }}>Saving setting changes...</Typography>}

      <Grid container spacing={3}>
        {/* OPERATING HOURS */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: '14px', border: '1px solid #E5E7EB', boxShadow: '0 4px 18px rgba(0,0,0,0.04)' }}>
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={2.5}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <AccessTimeRounded color="success" />
                  <Typography variant="subtitle1" fontWeight={700} color="#111827">
                    Operating Hours
                  </Typography>
                </Stack>
                <Divider />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Opening Time"
                      size="small"
                      placeholder="e.g. 09:00 AM"
                      fullWidth
                      value={settings.openingTime || ''}
                      onChange={(e) => setSettings((prev) => ({ ...prev, openingTime: e.target.value }))}
                      onBlur={(e) => updateSetting('openingTime', e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Closing Time"
                      size="small"
                      placeholder="e.g. 05:00 PM"
                      fullWidth
                      value={settings.closingTime || ''}
                      onChange={(e) => setSettings((prev) => ({ ...prev, closingTime: e.target.value }))}
                      onBlur={(e) => updateSetting('closingTime', e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Lunch Break Start"
                      size="small"
                      placeholder="e.g. 01:00 PM"
                      fullWidth
                      value={settings.lunchBreakStart || ''}
                      onChange={(e) => setSettings((prev) => ({ ...prev, lunchBreakStart: e.target.value }))}
                      onBlur={(e) => updateSetting('lunchBreakStart', e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Lunch Break End"
                      size="small"
                      placeholder="e.g. 02:00 PM"
                      fullWidth
                      value={settings.lunchBreakEnd || ''}
                      onChange={(e) => setSettings((prev) => ({ ...prev, lunchBreakEnd: e.target.value }))}
                      onBlur={(e) => updateSetting('lunchBreakEnd', e.target.value)}
                    />
                  </Grid>
                </Grid>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* SLOT CAPACITIES */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: '14px', border: '1px solid #E5E7EB', boxShadow: '0 4px 18px rgba(0,0,0,0.04)' }}>
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={2.5}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <LocalMallRounded color="success" />
                  <Typography variant="subtitle1" fontWeight={700} color="#111827">
                    Slot Capacities
                  </Typography>
                </Stack>
                <Divider />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Grocery Capacity per Slot"
                      type="number"
                      size="small"
                      fullWidth
                      value={settings.groceryCapacity || ''}
                      onChange={(e) => setSettings((prev) => ({ ...prev, groceryCapacity: e.target.value }))}
                      onBlur={(e) => updateSetting('groceryCapacity', e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Liquor Capacity per Slot"
                      type="number"
                      size="small"
                      fullWidth
                      value={settings.liquorCapacity || ''}
                      onChange={(e) => setSettings((prev) => ({ ...prev, liquorCapacity: e.target.value }))}
                      onBlur={(e) => updateSetting('liquorCapacity', e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      label="Booking Window (Days in Advance)"
                      type="number"
                      size="small"
                      fullWidth
                      value={settings.bookingWindow || ''}
                      onChange={(e) => setSettings((prev) => ({ ...prev, bookingWindow: e.target.value }))}
                      onBlur={(e) => updateSetting('bookingWindow', e.target.value)}
                    />
                  </Grid>
                </Grid>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* WEEKLY HOLIDAYS */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: '14px', border: '1px solid #E5E7EB', boxShadow: '0 4px 18px rgba(0,0,0,0.04)', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CalendarMonthRounded color="success" />
                  <Typography variant="subtitle1" fontWeight={700} color="#111827">
                    Weekly Holidays
                  </Typography>
                </Stack>
                <Divider />
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Select the recurring weekdays on which the canteen will remain closed. Bookings will be disabled.
                </Typography>
                <FormGroup sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 0.5 }}>
                  {DAYS_OF_WEEK.map((day) => (
                    <FormControlLabel
                      key={day}
                      control={
                        <Checkbox
                          color="success"
                          size="small"
                          checked={activeWeeklyHolidays.includes(day)}
                          onChange={(e) => handleWeeklyHolidayChange(day, e.target.checked)}
                        />
                      }
                      label={<Typography variant="body2">{day}</Typography>}
                    />
                  ))}
                </FormGroup>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* SPECIAL HOLIDAYS */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: '14px', border: '1px solid #E5E7EB', boxShadow: '0 4px 18px rgba(0,0,0,0.04)', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CalendarMonthRounded sx={{ color: '#D4A017' }} />
                  <Typography variant="subtitle1" fontWeight={700} color="#111827">
                    Special Holidays
                  </Typography>
                </Stack>
                <Divider />
                <Typography variant="body2" color="text.secondary">
                  Add specific calendar dates on which the canteen is closed (e.g. national holidays).
                </Typography>

                <Stack spacing={1.5} sx={{ mt: 1 }}>
                  <TextField
                    label="Holiday Date"
                    type="date"
                    size="small"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={newSpecialHoliday}
                    onChange={(e) => setNewSpecialHoliday(e.target.value)}
                  />
                  <TextField
                    label="Holiday Name"
                    placeholder="e.g. Independence Day"
                    size="small"
                    fullWidth
                    value={newSpecialHolidayName}
                    onChange={(e) => setNewSpecialHolidayName(e.target.value)}
                  />
                  <TextField
                    label="Description"
                    placeholder="e.g. National Holiday"
                    size="small"
                    fullWidth
                    value={newSpecialHolidayDesc}
                    onChange={(e) => setNewSpecialHolidayDesc(e.target.value)}
                  />
                  <Button
                    variant="contained"
                    color="success"
                    onClick={handleAddSpecialHoliday}
                    startIcon={<AddCircleOutlineRounded />}
                    fullWidth
                    sx={{ height: 40 }}
                  >
                    Add Holiday
                  </Button>
                </Stack>

                <Box sx={{ mt: 2, maxHeight: 220, overflowY: 'auto', p: 0.5 }}>
                  {specialHolidaysList.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center', py: 2 }}>
                      No special holidays configured.
                    </Typography>
                  ) : (
                    <Stack spacing={1.5}>
                      {specialHolidaysList.map((holiday) => (
                        <Box
                          key={holiday.date}
                          sx={{
                            p: 2,
                            borderRadius: '10px',
                            border: '1px solid #E5E7EB',
                            bgcolor: '#F9FAFB',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Stack spacing={0.5}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#111827' }}>
                              {holiday.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#2E7D32', fontWeight: 600 }}>
                              {formatHolidayDate(holiday.date)}
                            </Typography>
                            {holiday.description && (
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                                {holiday.description}
                              </Typography>
                            )}
                          </Stack>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveSpecialHoliday(holiday.date)}
                            aria-label={`Delete ${holiday.name}`}
                          >
                            <DeleteRounded sx={{ fontSize: 20 }} />
                          </IconButton>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* BOOKING CONTROLS */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ borderRadius: '14px', border: '1px solid #E5E7EB', boxShadow: '0 4px 18px rgba(0,0,0,0.04)' }}>
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <ToggleOnRounded color="success" />
                  <Typography variant="subtitle1" fontWeight={700} color="#111827">
                    System Control Gates
                  </Typography>
                </Stack>
                <Divider />
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 1.5, border: '1px solid #E5E7EB', borderRadius: '10px' }}>
                      <Box>
                        <Typography variant="body2" color="text.primary" fontWeight={600}>
                          Slot Booking Engine Status
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Toggle whether customer booking flow is online or suspended.
                        </Typography>
                      </Box>
                      <Switch
                        color="success"
                        checked={settings.BOOKING_ENABLED === 'true'}
                        onChange={(_, checked) => updateSetting('BOOKING_ENABLED', checked ? 'true' : 'false')}
                      />
                    </Stack>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 1.5, border: '1px solid #E5E7EB', borderRadius: '10px' }}>
                      <Box>
                        <Typography variant="body2" color="text.primary" fontWeight={600}>
                          SMS Notification Broadcast
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Send automatic token confirmation SMS messages.
                        </Typography>
                      </Box>
                      <Switch
                        color="success"
                        checked={settings.smsAlerts === 'true'}
                        onChange={(_, checked) => updateSetting('smsAlerts', checked ? 'true' : 'false')}
                      />
                    </Stack>
                  </Grid>
                </Grid>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
