import Box from '@mui/material/Box'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { isAuthenticated, getRole } from '../services/auth'

export default function DashboardLayout() {

  const navigate = useNavigate()
  const location = useLocation()
  const role = getRole()

  useEffect(() => {

    if (!isAuthenticated()) {

      if (location.pathname.startsWith('/admin')) {
        navigate('/admin/login')
      }

      else if (location.pathname.startsWith('/operator')) {
        navigate('/operator/login')
      }

      else if (location.pathname.startsWith('/customer')) {
        navigate('/customer/login')
      }

      return
    }

    if (
        location.pathname.startsWith('/admin') &&
        role !== 'ADMIN'
    ) {
      navigate('/admin/login')
      return
    }

    if (
        location.pathname.startsWith('/operator') &&
        role !== 'OPERATOR'
    ) {
      navigate('/operator/login')
      return
    }

    if (
        location.pathname.startsWith('/customer') &&
        role !== 'CUSTOMER'
    ) {
      navigate('/customer/login')
      return
    }

  }, [location.pathname, navigate, role])

  return (
      <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            bgcolor: 'background.default',
          }}
      >
        <Sidebar />

        <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
            }}
        >
          <Navbar />

          <Box
              component="main"
              sx={{
                flex: 1,
                p: {
                  xs: 2,
                  md: 3,
                },
              }}
          >
            <Outlet />
          </Box>

        </Box>

      </Box>
  )
}