import { CssBaseline, ThemeProvider } from '@mui/material'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { theme } from './theme/theme'
import { router } from './routes'

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </ThemeProvider>
  )
}

export default App
