import { createBrowserRouter } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import DashboardLayout from '../layouts/DashboardLayout'
import LandingPage from '../pages/LandingPage'
import BookSlotPage from '../pages/BookSlotPage'
import BookingSuccessPage from '../pages/BookingSuccessPage'
import TrackBookingPage from '../pages/TrackBookingPage'
import AdminLoginPage from '../pages/auth/AdminLoginPage'
import OperatorLoginPage from '../pages/auth/OperatorLoginPage'
import AdminDashboardPage from '../pages/admin/AdminDashboardPage'
import MembersPage from '../pages/admin/MembersPage'
import SlotsPage from '../pages/admin/SlotsPage'
import ReportsPage from '../pages/admin/ReportsPage'
import SettingsPage from '../pages/admin/SettingsPage'
import OperatorDashboardPage from '../pages/operator/OperatorDashboardPage'
import NotFoundPage from '../pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/book-slot', element: <BookSlotPage /> },
      { path: '/booking-success', element: <BookingSuccessPage /> },
      { path: '/track-booking', element: <TrackBookingPage /> },
      { path: '/admin/login', element: <AdminLoginPage /> },
      { path: '/operator/login', element: <OperatorLoginPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    element: <DashboardLayout />,
    children: [
      { path: '/admin/dashboard', element: <AdminDashboardPage /> },
      { path: '/admin/members', element: <MembersPage /> },
      { path: '/admin/slots', element: <SlotsPage /> },
      { path: '/admin/reports', element: <ReportsPage /> },
      { path: '/admin/settings', element: <SettingsPage /> },
      { path: '/operator/dashboard', element: <OperatorDashboardPage /> },
    ],
  },
])
