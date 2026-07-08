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
      default: '#F9FAFB',
      paper: '#FFFFFF',
    },

    text: {
      primary: '#111827',
      secondary: '#4B5563',
    },
  },

  typography: {
    fontFamily: 'Inter, "Segoe UI", Roboto, sans-serif',

    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      letterSpacing: '-0.02em',
    },

    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      letterSpacing: '-0.02em',
    },

    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
      letterSpacing: '-0.015em',
    },

    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
      letterSpacing: '-0.015em',
    },

    h5: {
      fontWeight: 600,
      fontSize: '1.125rem',
    },

    h6: {
      fontWeight: 600,
      fontSize: '1rem',
    },

    button: {
      fontWeight: 500,
      textTransform: 'none',
    },
  },

  shape: {
    borderRadius: 12,
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: '#F9FAFB',
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
          borderRadius: 10,
          padding: '8px 16px',
          fontWeight: 500,
          transition: 'background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
          textTransform: 'none',
          fontSize: '0.875rem',
        },

        contained: {
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',

          '&:hover': {
            transform: 'none',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            backgroundColor: '#246327', // darker green
          },
        },

        outlined: {
          borderWidth: 1,
          borderColor: '#E5E7EB',
          color: '#374151',

          '&:hover': {
            borderWidth: 1,
            borderColor: '#D1D5DB',
            backgroundColor: '#F9FAFB',
            transform: 'none',
          },
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          boxShadow: '0 4px 18px rgba(0,0,0,0.06)',
          transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',

          '&:hover': {
            transform: 'none',
            borderColor: '#D1D5DB',
            boxShadow: '0 4px 18px rgba(0,0,0,0.06)',
          },
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 14,
          border: '1px solid #E5E7EB',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 500,
          fontSize: '0.75rem',
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 12,
        },
        elevation8: {
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
          border: '1px solid #E5E7EB',
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontSize: '0.875rem',
          backgroundColor: '#FFFFFF',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#E5E7EB',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#D1D5DB',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#2E7D32',
            borderWidth: '1.5px',
          },
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },

    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#F9FAFB',
          borderBottom: '1.5px solid #E5E7EB',
          '& th': {
            color: '#374151',
            fontWeight: 600,
            fontSize: '0.875rem',
          },
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: '#F3F4F6',
          padding: '12px 16px',
          fontSize: '0.875rem',
        },
      },
    },
  },
})
