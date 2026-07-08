import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function MainLayout() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Navbar />
      <Box component="main" sx={{ flex: 1 }}>
        <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
          <Outlet />
        </Container>
      </Box>
      <Footer />
    </Box>
  )
}
