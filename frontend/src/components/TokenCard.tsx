import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

type TokenCardProps = {
  token: string
  slot: string
  status: string
}

export default function TokenCard({ token, slot, status }: TokenCardProps) {
  return (
    <Card>
      <CardContent>
        <Stack spacing={1.5}>
          <Typography variant="h6">{token}</Typography>
          <Typography color="text.secondary">Slot: {slot}</Typography>
          <Box sx={{ width: 'fit-content', px: 1.2, py: 0.4, borderRadius: 999, bgcolor: 'primary.main', color: 'white' }}>{status}</Box>
        </Stack>
      </CardContent>
    </Card>
  )
}
