import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'

type QRModalProps = {
  open: boolean
  token: string
  onClose: () => void
}

export default function QRModal({ open, token, onClose }: QRModalProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Token QR</DialogTitle>
      <DialogContent>
        <Box sx={{ width: 220, height: 220, bgcolor: 'grey.100', display: 'grid', placeItems: 'center', my: 2 }}>
          <Typography variant="h6">{token}</Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}
