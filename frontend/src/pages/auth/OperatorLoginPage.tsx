import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import { PersonRounded, Visibility, VisibilityOff } from '@mui/icons-material'
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginOperator } from '../../services/auth'
import { toast } from 'react-hot-toast'

export default function OperatorLoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const operatorIdRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    operatorIdRef.current?.focus()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) {
      setError('Operator ID is required')
      toast.error('Operator ID is required')
      operatorIdRef.current?.focus()
      return
    }
    if (!password) {
      setError('PIN is required')
      toast.error('PIN is required')
      return
    }

    setError(null)
    setLoading(true)
    try {
      await loginOperator(username, password)
      toast.success('Operator logged in successfully!')
      navigate('/operator/dashboard')
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Login failed'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
      <Card sx={{ maxWidth: 480, width: '100%', p: 2 }}>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={3} sx={{ alignItems: 'center' }}>
              <Box sx={{ p: 2, borderRadius: '50%', bgcolor: 'secondary.main', color: 'white' }}>
                <PersonRounded />
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>Operator Access</Typography>
                <Typography color="text.secondary">Authenticate for queue and check-in operations.</Typography>
              </Box>
              {error && <Typography color="error" variant="body2">{error}</Typography>}
              <TextField 
                fullWidth 
                label="Operator ID" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                inputRef={operatorIdRef}
                disabled={loading}
              />
              <TextField
                fullWidth
                label="PIN"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button type="submit" variant="contained" fullWidth disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
