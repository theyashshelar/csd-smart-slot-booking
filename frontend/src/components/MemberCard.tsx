import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

type MemberCardProps = {
  name: string
  phone: string
  status: string
  groceryCardNumber?: string | null
  liquorCardNumber?: string | null
}

export default function MemberCard({
  name,
  phone,
  status,
  groceryCardNumber,
  liquorCardNumber,
}: MemberCardProps) {
  return (
    <Card>
      <CardContent>
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">{name}</Typography>
            <Chip label={status} color={status === 'APPROVED' || status === 'Active' ? 'success' : 'warning'} />
          </Stack>
          <Typography color="text.secondary">{phone}</Typography>
          <Typography color="text.secondary">
            Grocery: {groceryCardNumber || 'Not registered'}
          </Typography>
          <Typography color="text.secondary">
            Liquor: {liquorCardNumber || 'Not registered'}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  )
}
