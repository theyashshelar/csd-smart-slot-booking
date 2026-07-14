import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

interface CounterHeaderProps {
  title: string
  description: string
  onRefresh: () => void
}

export default function CounterHeader({ title, description, onRefresh }: CounterHeaderProps) {
  return (
    <Box id="counter-header-container" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#111827', letterSpacing: '-0.02em', mb: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Box>
      <Button
        id="counter-header-refresh-btn"
        variant="outlined"
        color="success"
        onClick={onRefresh}
        sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}
      >
        Refresh Queue
      </Button>
    </Box>
  )
}
