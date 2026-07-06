import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { PersonRounded } from '@mui/icons-material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginCustomer } from '../../services/auth.ts'

export default function CustomerLoginPage() {

    const [mobileNumber, setMobileNumber] = useState('9876543211')
    const [password, setPassword] = useState('member123')

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const navigate = useNavigate()

    const handleSubmit = async () => {

        setError(null)
        setLoading(true)

        try {

            await loginCustomer(mobileNumber, password)

            navigate('/customer/dashboard')

        } catch (e: any) {

            setError(
                e?.response?.data?.message ||
                e?.message ||
                'Login failed'
            )

        } finally {

            setLoading(false)
        }
    }

    return (

        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>

            <Card sx={{ maxWidth: 480, width: '100%', p: 2 }}>

                <CardContent>

                    <Stack spacing={3} sx={{ alignItems: 'center' }}>

                        <Box
                            sx={{
                                p: 2,
                                borderRadius: '50%',
                                bgcolor: 'success.main',
                                color: 'white'
                            }}
                        >
                            <PersonRounded />
                        </Box>

                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                Customer Login
                            </Typography>

                            <Typography color="text.secondary">
                                Login using your registered mobile number and password.
                            </Typography>
                        </Box>

                        {error && (
                            <Typography color="error">
                                {error}
                            </Typography>
                        )}

                        <TextField
                            fullWidth
                            label="Mobile Number"
                            value={mobileNumber}
                            onChange={(e) => setMobileNumber(e.target.value)}
                        />

                        <TextField
                            fullWidth
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <Button
                            variant="contained"
                            fullWidth
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>

                    </Stack>

                </CardContent>

            </Card>

        </Box>
    )
}