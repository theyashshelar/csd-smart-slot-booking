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
import CustomerLoginPage from '../pages/customer/CustomerLoginPage.tsx'
import CustomerDashboardPage from '../pages/customer/CustomerDashboardPage'
import ProfilePage from '../pages/customer/ProfilePage'
import BookingHistoryPage from '../pages/customer/BookingHistoryPage'
import ChangePasswordPage from '../pages/customer/ChangePasswordPage'
import CustomerBookSlotPage from '../pages/customer/CustomerBookSlotPage'

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
      { path: '/customer/login', element: <CustomerLoginPage /> },
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
      { path: '/customer/dashboard', element: <CustomerDashboardPage /> },
      { path: '/customer/profile', element: <ProfilePage /> },
      { path: '/customer/history', element: <BookingHistoryPage /> },
      { path: '/customer/change-password', element: <ChangePasswordPage /> },
      {path: '/customer/book-slot', element: <CustomerBookSlotPage /> },
    ],
  },
])
