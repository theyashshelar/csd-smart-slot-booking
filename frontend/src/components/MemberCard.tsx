import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

type MemberCardProps = {
  name: string
  rank: string
  unit: string
  phone: string
  status: string
}

export default function MemberCard({ name, rank, unit, phone, status }: MemberCardProps) {
  return (
    <Card>
      <CardContent>
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">{name}</Typography>
            <Chip label={status} color={status === 'Active' ? 'success' : 'warning'} />
          </Stack>
          <Typography color="text.secondary">{rank}</Typography>
          <Typography color="text.secondary">{unit}</Typography>
          <Typography color="text.secondary">{phone}</Typography>
        </Stack>
      </CardContent>
    </Card>
  )
}
