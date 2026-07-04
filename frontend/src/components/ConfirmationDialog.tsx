import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'

type ConfirmationDialogProps = {
    open: boolean
    title: string
    message: string
    onClose: () => void
    onConfirm: () => void
}

export default function ConfirmationDialog({
                                               open,
                                               title,
                                               message,
                                               onClose,
                                               onConfirm,
                                           }: ConfirmationDialogProps) {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{title}</DialogTitle>

            <DialogContent>
                <DialogContentText>{message}</DialogContentText>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    onClick={onConfirm}
                >
                    Confirm
                </Button>
            </DialogActions>
        </Dialog>
    )
}