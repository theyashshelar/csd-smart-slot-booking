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
    Divider,
    Stack,
    TextField,
    Typography,
} from '@mui/material'
import {
    getCustomerProfile,
    updateCustomerProfile,
} from '../../services/api'
import type { CustomerProfile } from '../../types/api'

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

        try {

            setSaving(true)

            await updateCustomerProfile(memberId, {
                fullName,
                mobileNumber,
            })

            setSuccess('Profile updated successfully.')

            setOpenEdit(false)

            await loadProfile()

        } catch (e: any) {

            setError(
                e?.response?.data?.message ||
                'Unable to update profile.'
            )

        } finally {

            setSaving(false)

        }

    }

    if (loading) {
        return (
            <CircularProgress />
        )
    }

    if (error && !profile) {
        return (
            <Alert severity="error">
                {error}
            </Alert>
        )
    }

    if (!profile) {
        return (
            <Typography>
                Profile not found.
            </Typography>
        )
    }

    return (

        <>

            <Card sx={{ maxWidth: 700 }}>

                <CardContent>

                    <Typography
                        variant="h5"
                        gutterBottom
                    >
                        My Profile
                    </Typography>

                    <Divider sx={{ mb: 3 }} />

                    {success && (
                        <Alert
                            severity="success"
                            sx={{ mb: 2 }}
                        >
                            {success}
                        </Alert>
                    )}

                    <Stack spacing={2}>

                        <Typography>
                            <strong>Full Name</strong>
                        </Typography>

                        <Typography color="text.secondary">
                            {profile.fullName}
                        </Typography>

                        <Divider />

                        <Typography>
                            <strong>Mobile Number</strong>
                        </Typography>

                        <Typography color="text.secondary">
                            {profile.mobileNumber}
                        </Typography>

                        <Divider />

                        <Typography>
                            <strong>Date of Birth</strong>
                        </Typography>

                        <Typography color="text.secondary">
                            {profile.dateOfBirth}
                        </Typography>

                        <Divider />

                        <Typography>
                            <strong>Grocery Card</strong>
                        </Typography>

                        <Typography color="text.secondary">
                            {profile.groceryCardNumber || '-'}
                        </Typography>

                        <Divider />

                        <Typography>
                            <strong>Liquor Card</strong>
                        </Typography>

                        <Typography color="text.secondary">
                            {profile.liquorCardNumber || '-'}
                        </Typography>

                        <Divider />

                        <Typography>
                            <strong>Registration Status</strong>
                        </Typography>

                        <Typography color="text.secondary">
                            {profile.registrationStatus}
                        </Typography>

                        <Button
                            variant="contained"
                            sx={{ mt: 2 }}
                            onClick={() => setOpenEdit(true)}
                        >
                            Edit Profile
                        </Button>

                    </Stack>

                </CardContent>

            </Card>

            <Dialog
                open={openEdit}
                onClose={() => setOpenEdit(false)}
                fullWidth
                maxWidth="sm"
            >

                <DialogTitle>
                    Edit Profile
                </DialogTitle>

                <DialogContent>

                    <Stack spacing={3} sx={{ mt: 2 }}>

                        <TextField
                            label="Full Name"
                            value={fullName}
                            onChange={(e) =>
                                setFullName(e.target.value)
                            }
                            fullWidth
                        />

                        <TextField
                            label="Mobile Number"
                            value={mobileNumber}
                            onChange={(e) =>
                                setMobileNumber(e.target.value)
                            }
                            fullWidth
                        />

                    </Stack>

                </DialogContent>

                <DialogActions>

                    <Button
                        onClick={() => setOpenEdit(false)}
                    >
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

        </>

    )

}