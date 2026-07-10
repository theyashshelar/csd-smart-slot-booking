import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import { LockRounded, Visibility, VisibilityOff } from '@mui/icons-material'
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginAdmin } from '../../services/auth'
import { toast } from 'react-hot-toast'

export default function AdminLoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const usernameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    usernameRef.current?.focus()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) {
      setError('Username is required')
      toast.error('Username is required')
      usernameRef.current?.focus()
      return
    }
    if (!password) {
      setError('Password is required')
      toast.error('Password is required')
      return
    }

    setError(null)
    setLoading(true)
    try {
      await loginAdmin(username, password)
      toast.success('Logged in successfully!')
      navigate('/admin/dashboard')
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
              <Box sx={{ p: 2, borderRadius: '50%', bgcolor: 'primary.main', color: 'white' }}>
                <LockRounded />
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>Admin Access</Typography>
                <Typography color="text.secondary">Enter your credentials to manage the canteen operations.</Typography>
              </Box>
              {error && <Typography color="error" variant="body2">{error}</Typography>}
              <TextField 
                fullWidth 
                label="Username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                inputRef={usernameRef}
                disabled={loading}
              />
              <TextField
                fullWidth
                label="Password"
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
