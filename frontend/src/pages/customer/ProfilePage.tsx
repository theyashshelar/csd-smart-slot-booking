import { useEffect, useState } from 'react'
import {
    Alert,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TextField,
    Typography,
    Box,
    Grid,
} from '@mui/material'
import {
    getCustomerProfile,
    updateCustomerProfile,
} from '../../services/api'
import type { CustomerProfile } from '../../types/api'
import { toast } from 'react-hot-toast'

export default function ProfilePage() {
    const memberId = Number(localStorage.getItem('memberId'))

    const [profile, setProfile] = useState<CustomerProfile | null>(null)

    const [fullName, setFullName] = useState('')
    const [mobileNumber, setMobileNumber] = useState('')

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const [openEdit, setOpenEdit] = useState(false)

    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        loadProfile()
    }, [])

    const loadProfile = async () => {
        try {
            setLoading(true)
            const response = await getCustomerProfile(memberId)
            const data = response.data
            setProfile(data)
            setFullName(data.fullName)
            setMobileNumber(data.mobileNumber)
        } catch (e: any) {
            console.error(e)
            setError(
                e?.response?.data?.message ||
                'Unable to load profile.'
            )
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setError('')
        setSuccess('')

        if (!fullName.trim()) {
            setError('Full Name is required.')
            toast.error('Full Name is required.')
            return
        }

        if (!mobileNumber.trim()) {
            setError('Mobile Number is required.')
            toast.error('Mobile Number is required.')
            return
        }

        try {
            setSaving(true)
            await updateCustomerProfile(memberId, {
                fullName,
                mobileNumber,
            })
            setSuccess('Profile updated successfully.')
            toast.success('Profile updated successfully.')
            setOpenEdit(false)
            await loadProfile()
        } catch (e: any) {
            const errMsg = e?.response?.data?.message || 'Unable to update profile.'
            setError(errMsg)
            toast.error(errMsg)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" py={8}>
                <CircularProgress color="success" />
            </Box>
        )
    }

    if (error && !profile) {
        return (
            <Alert severity="error" sx={{ borderRadius: '10px' }}>
                {error}
            </Alert>
        )
    }

    if (!profile) {
        return (
            <Typography variant="body2" color="text.secondary">
                Profile not found.
            </Typography>
        )
    }

    return (
        <Stack spacing={2}>
            <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>
                    My Profile
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Manage your personal details, contact preferences, and card registrations.
                </Typography>
            </Box>

            {success && (
                <Alert severity="success" sx={{ borderRadius: '10px' }} onClose={() => setSuccess('')}>
                    {success}
                </Alert>
            )}

            <Card sx={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 18px rgba(0,0,0,0.06)' }}>
                <CardContent sx={{ p: 2 }}>
                    <Grid container spacing={1.5}>
                        {[
                            ['Full Name', profile.fullName],
                            ['Mobile Number', profile.mobileNumber],
                            ['Date of Birth', profile.dateOfBirth],
                            ['Grocery Card', profile.groceryCardNumber || '-'],
                            ['Liquor Card', profile.liquorCardNumber || '-'],
                            ['Registration Status', profile.registrationStatus],
                            ['Registration Date', profile.registrationDate ? new Date(profile.registrationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Not Available'],
                        ].map(([label, value]) => (
                          <Grid size={{ xs: 12, sm: 6 }} key={label}>
                            <Box sx={{ p: 1.2, borderRadius: '10px', bgcolor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                              <Typography variant="caption" color="text.secondary" fontWeight={500} display="block">
                                {label}
                              </Typography>
                              <Typography variant="body2" fontWeight={600} color="#111827">
                                {value}
                              </Typography>
                            </Box>
                          </Grid>
                        ))}
                    </Grid>

                    <Box display="flex" justifyContent="flex-end" mt={2}>
                        <Button
                            variant="contained"
                            onClick={() => setOpenEdit(true)}
                            sx={{ px: 3 }}
                        >
                            Edit Profile
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            <Dialog
                open={openEdit}
                onClose={() => setOpenEdit(false)}
                fullWidth
                maxWidth="sm"
                PaperProps={{ sx: { borderRadius: '14px' } }}
            >
                <DialogTitle sx={{ fontWeight: 600 }}>Edit Profile</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            label="Full Name"
                            size="small"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            fullWidth
                            slotProps={{ htmlInput: { style: { borderRadius: '10px' } } }}
                        />
                        <TextField
                            label="Mobile Number"
                            size="small"
                            value={mobileNumber}
                            onChange={(e) => setMobileNumber(e.target.value)}
                            fullWidth
                            slotProps={{ htmlInput: { style: { borderRadius: '10px' } } }}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setOpenEdit(false)} color="inherit">
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    )
}