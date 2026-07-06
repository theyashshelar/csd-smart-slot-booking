import { useState } from 'react'
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Stack,
    TextField,
    Typography,
} from '@mui/material'
import { changePassword } from '../../services/api'

export default function ChangePasswordPage() {

    const memberId = Number(localStorage.getItem('memberId'))

    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = async () => {

        setError('')
        setSuccess('')

        if (newPassword !== confirmPassword) {
            setError('New password and confirm password do not match.')
            return
        }

        try {

            setLoading(true)

            await changePassword(memberId, {
                oldPassword,
                newPassword,
                confirmPassword,
            })

            setSuccess('Password changed successfully.')

            setOldPassword('')
            setNewPassword('')
            setConfirmPassword('')

        } catch (e: any) {

            setError(
                e?.response?.data?.message ||
                e?.message ||
                'Unable to change password.'
            )

        } finally {

            setLoading(false)

        }
    }

    return (

        <Card sx={{ maxWidth: 600 }}>

            <CardContent>

                <Typography
                    variant="h5"
                    gutterBottom
                >
                    Change Password
                </Typography>

                <Stack spacing={3} mt={2}>

                    {success && (
                        <Alert severity="success">
                            {success}
                        </Alert>
                    )}

                    {error && (
                        <Alert severity="error">
                            {error}
                        </Alert>
                    )}

                    <TextField
                        label="Old Password"
                        type="password"
                        value={oldPassword}
                        onChange={(e) =>
                            setOldPassword(e.target.value)
                        }
                        fullWidth
                    />

                    <TextField
                        label="New Password"
                        type="password"
                        value={newPassword}
                        onChange={(e) =>
                            setNewPassword(e.target.value)
                        }
                        fullWidth
                    />

                    <TextField
                        label="Confirm Password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) =>
                            setConfirmPassword(e.target.value)
                        }
                        fullWidth
                    />

                    <Box>

                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading
                                ? 'Updating...'
                                : 'Change Password'}
                        </Button>

                    </Box>

                </Stack>

            </CardContent>

        </Card>
    )
}