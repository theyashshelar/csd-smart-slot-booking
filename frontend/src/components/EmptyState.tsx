import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

type EmptyStateProps = {
  title: string
  message: string
  actionLabel?: string
  onAction?: () => void
}

export default function EmptyState({
                                     title,
                                     message,
                                     actionLabel,
                                     onAction,
                                   }: EmptyStateProps) {
  return (
      <Card>
        <CardContent
            sx={{
              textAlign: 'center',
              py: 6,
            }}
        >
          <Typography
              variant="h6"
              sx={{ mb: 1 }}
          >
            {title}
          </Typography>

          <Typography
              color="text.secondary"
              sx={{ mb: 2 }}
          >
            {message}
          </Typography>

          {actionLabel && (
              <Button
                  variant="contained"
                  onClick={onAction}
              >
                {actionLabel}
              </Button>
          )}
        </CardContent>
      </Card>
  )
}