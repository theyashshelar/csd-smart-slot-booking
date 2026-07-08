import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

type DashboardCardProps = {
  title: string
  value: string
  icon: ReactNode
  color: string
}

export default function DashboardCard({
                                        title,
                                        value,
                                        icon,
                                        color,
                                      }: DashboardCardProps) {
  return (
      <Card>
        <CardContent>
          <Stack
              direction="row"
              sx={{
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
          >
            <Box>
              <Typography color="text.secondary">
                {title}
              </Typography>

              <Typography
                  variant="h4"
                  sx={{ fontWeight: 700 }}
              >
                {value}
              </Typography>
            </Box>

            <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: `${color}20`,
                  color,
                }}
            >
              {icon}
            </Box>
          </Stack>
        </CardContent>
      </Card>
  )
}