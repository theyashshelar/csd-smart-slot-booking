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
    IconButton,
    InputAdornment,
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { changePassword } from '../../services/api'

export default function ChangePasswordPage() {
    const memberId = Number(localStorage.getItem('memberId'))

    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const [showOldPassword, setShowOldPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
        <Stack spacing={2} sx={{ maxWidth: 600 }}>
            <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>
                    Change Password
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Secure your account by updating your login password regularly.
                </Typography>
            </Box>

            <Card sx={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 18px rgba(0,0,0,0.06)' }}>
                <CardContent sx={{ p: 2 }}>
                    <Stack spacing={2}>
                        {success && (
                            <Alert severity="success" sx={{ borderRadius: '10px' }}>
                                {success}
                            </Alert>
                        )}

                        {error && (
                            <Alert severity="error" sx={{ borderRadius: '10px' }}>
                                {error}
                            </Alert>
                        )}

                        <TextField
                            label="Old Password"
                            type={showOldPassword ? 'text' : 'password'}
                            size="small"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            fullWidth
                            slotProps={{ htmlInput: { style: { borderRadius: '10px' } } }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle old password visibility"
                                            onClick={() => setShowOldPassword(!showOldPassword)}
                                            edge="end"
                                        >
                                            {showOldPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <TextField
                            label="New Password"
                            type={showNewPassword ? 'text' : 'password'}
                            size="small"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            fullWidth
                            slotProps={{ htmlInput: { style: { borderRadius: '10px' } } }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle new password visibility"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            edge="end"
                                        >
                                            {showNewPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <TextField
                            label="Confirm Password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            size="small"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            fullWidth
                            slotProps={{ htmlInput: { style: { borderRadius: '10px' } } }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle confirm password visibility"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            edge="end"
                                        >
                                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Box display="flex" justifyContent="flex-end" mt={1}>
                            <Button
                                variant="contained"
                                onClick={handleSubmit}
                                disabled={loading}
                                sx={{ px: 3 }}
                            >
                                {loading ? 'Updating...' : 'Change Password'}
                            </Button>
                        </Box>
                    </Stack>
                </CardContent>
            </Card>
        </Stack>
    )
}