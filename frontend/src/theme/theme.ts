import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    primary: { main: '#355E3B' },
    secondary: { main: '#C8A951' },
    background: { default: '#F5F7FA', paper: '#FFFFFF' },
    text: { primary: '#11221A', secondary: '#5F6F6B' },
  },
  typography: {
    fontFamily: 'Inter, "Segoe UI", Roboto, sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 999,
          boxShadow: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 18px 45px rgba(17, 34, 26, 0.08)',
          border: '1px solid rgba(53, 94, 59, 0.08)',
        },
      },
    },
  },
})
