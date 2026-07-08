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
import { loginOperator } from '../../services/auth'

export default function OperatorLoginPage() {
  const [username, setUsername] = useState('operator')
  const [password, setPassword] = useState('operator123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleSubmit = async () => {
    setError(null)
    setLoading(true)
    try {
      await loginOperator(username, password)
      navigate('/operator/dashboard')
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
      <Card sx={{ maxWidth: 480, width: '100%', p: 2 }}>
        <CardContent>
          <Stack spacing={3} sx={{ alignItems: 'center' }}>
            <Box sx={{ p: 2, borderRadius: '50%', bgcolor: 'secondary.main', color: 'white' }}>
              <PersonRounded />
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>Operator Access</Typography>
              <Typography color="text.secondary">Authenticate for queue and check-in operations.</Typography>
            </Box>
            {error && <Typography color="error">{error}</Typography>}
            <TextField fullWidth label="Operator ID" value={username} onChange={(e) => setUsername(e.target.value)} />
            <TextField fullWidth label="PIN" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Button onClick={handleSubmit} variant="contained" fullWidth disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
