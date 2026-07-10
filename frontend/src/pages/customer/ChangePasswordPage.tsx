import { useState, useRef, useEffect } from 'react'
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
import { toast } from 'react-hot-toast'

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

    const oldPasswordRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        oldPasswordRef.current?.focus()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        if (!oldPassword) {
            setError('Old Password is required.')
            toast.error('Old Password is required.')
            oldPasswordRef.current?.focus()
            return
        }

        if (!newPassword) {
            setError('New Password is required.')
            toast.error('New Password is required.')
            return
        }

        if (!confirmPassword) {
            setError('Confirm Password is required.')
            toast.error('Confirm Password is required.')
            return
        }

        if (newPassword !== confirmPassword) {
            setError('New password and confirm password do not match.')
            toast.error('New password and confirm password do not match.')
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
            toast.success('Password changed successfully.')
            setOldPassword('')
            setNewPassword('')
            setConfirmPassword('')
        } catch (e: any) {
            const errMsg = e?.response?.data?.message || e?.message || 'Unable to change password.'
            setError(errMsg)
            toast.error(errMsg)
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
                    <Box component="form" onSubmit={handleSubmit} noValidate>
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
                                inputRef={oldPasswordRef}
                                disabled={loading}
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
                                disabled={loading}
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
                                disabled={loading}
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
                                    type="submit"
                                    variant="contained"
                                    disabled={loading}
                                    sx={{ px: 3 }}
                                >
                                    {loading ? 'Updating...' : 'Change Password'}
                                </Button>
                            </Box>
                        </Stack>
                    </Box>
                </CardContent>
            </Card>
        </Stack>
    )
}