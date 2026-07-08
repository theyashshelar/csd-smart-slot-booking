import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32',
    },

    secondary: {
      main: '#D4A017',
    },

    success: {
      main: '#2E7D32',
    },

    warning: {
      main: '#D4A017',
    },

    info: {
      main: '#0B3C6F',
    },

    background: {
      default: '#F7F9FC',
      paper: '#FFFFFF',
    },

    text: {
      primary: '#111827',
      secondary: '#6B7280',
    },
  },

  typography: {
    fontFamily: 'Inter, "Segoe UI", Roboto, sans-serif',

    h1: {
      fontWeight: 800,
      fontSize: '4rem',
    },

    h2: {
      fontWeight: 800,
    },

    h3: {
      fontWeight: 700,
    },

    h4: {
      fontWeight: 700,
    },

    h5: {
      fontWeight: 700,
    },

    h6: {
      fontWeight: 700,
    },

    button: {
      fontWeight: 700,
      textTransform: 'none',
    },
  },

  shape: {
    borderRadius: 24,
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background:
              'linear-gradient(180deg,#F7F9FC 0%,#FFFFFF 60%,#F7F9FC 100%)',
          minHeight: '100vh',
        },
      },
    },

    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },

      styleOverrides: {
        root: {
          borderRadius: 16,
          padding: '12px 28px',
          fontWeight: 700,
          transition: '.3s',
          textTransform: 'none',
        },

        contained: {
          boxShadow: '0 12px 30px rgba(0,0,0,.08)',

          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: '0 20px 35px rgba(0,0,0,.15)',
          },
        },

        outlined: {
          borderWidth: 2,

          '&:hover': {
            borderWidth: 2,
            transform: 'translateY(-3px)',
          },
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          boxShadow: '0 15px 40px rgba(15,23,42,.06)',
          border: '1px solid rgba(0,0,0,.05)',
          transition: '.35s',

          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 25px 55px rgba(15,23,42,.12)',
          },
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 700,
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 24,
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },
  },
})