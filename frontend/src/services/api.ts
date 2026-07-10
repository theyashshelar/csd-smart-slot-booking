import axios from 'axios'
import type { OperatorBooking } from "../types/api";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    let friendlyMessage = ''

    if (!error.response) {
      friendlyMessage = 'Unable to connect to server.'
    } else {
      const status = error.response.status
      const data = error.response.data
      
      const backendMsg = data?.message || data?.error || ''

      const url = error.config?.url || ''
      const isAuthRequest = url.includes('/auth/')
      const isCustomerLogin = url.includes('/auth/customer/login')

      if (isAuthRequest) {
        if (isCustomerLogin) {
          if (status === 401) {
            friendlyMessage = 'Invalid mobile number or password.'
          } else if (status === 403) {
            friendlyMessage = backendMsg
          } else {
            friendlyMessage = backendMsg || 'An error occurred during login.'
          }
        } else {
          if (status === 401) {
            friendlyMessage = backendMsg || 'Invalid credentials.'
          } else if (status === 403) {
            friendlyMessage = backendMsg || 'Access denied. You do not have permission.'
          } else {
            friendlyMessage = backendMsg || 'An error occurred.'
          }
        }
      } else {
        if (status === 401) {
          if (
            backendMsg.toLowerCase().includes('password') ||
            backendMsg.toLowerCase().includes('credentials') ||
            backendMsg.toLowerCase().includes('invalid') ||
            backendMsg.toLowerCase().includes('auth')
          ) {
            friendlyMessage = 'Invalid username or password.'
          } else {
            friendlyMessage = 'Session expired. Please login again.'
          }
        } else if (status === 403) {
          if (backendMsg.toLowerCase().includes('pending')) {
            friendlyMessage = 'Your registration is pending admin approval.'
          } else if (backendMsg.toLowerCase().includes('reject')) {
            friendlyMessage = 'Your registration was rejected by administrator.'
          } else {
            friendlyMessage = 'Access denied. You do not have permission.'
          }
        } else if (status === 400) {
          if (backendMsg.toLowerCase().includes('already exists') || backendMsg.toLowerCase().includes('duplicate') || backendMsg.toLowerCase().includes('already book')) {
            friendlyMessage = 'Booking already exists.'
          } else if (backendMsg.toLowerCase().includes('inactive') || backendMsg.toLowerCase().includes('available')) {
            friendlyMessage = 'Slot is no longer available.'
          } else {
            friendlyMessage = backendMsg || 'Invalid request.'
          }
        } else if (status === 404) {
          friendlyMessage = backendMsg || 'Requested resource not found.'
        } else if (status >= 500) {
          friendlyMessage = 'Server error occurred. Please try again later.'
        } else {
          friendlyMessage = backendMsg || 'An unexpected error occurred.'
        }
      }
    }

    if (friendlyMessage) {
      error.message = friendlyMessage
      if (!error.response) {
        error.response = {
          status: 0,
          statusText: 'Network Error',
          headers: {},
          config: error.config,
          data: { message: friendlyMessage, error: friendlyMessage }
        }
      } else {
        if (!error.response.data) {
          error.response.data = {}
        }
        error.response.data.message = friendlyMessage
        error.response.data.error = friendlyMessage
      }
    }

    return Promise.reject(error)
  }
)

export default api


// AUTH

export const adminLogin = (data: { username: string; password: string }) =>
  api.post('/auth/admin/login', data)

export const operatorLogin = (data: { username: string; password: string }) =>
  api.post('/auth/operator/login', data)

export const customerLogin = (data: { username: string; password: string }) =>
  api.post('/auth/customer/login', data)

// ADMIN DASHBOARD

export const getDashboard = () => api.get('/admin/dashboard')

// MEMBERS
export const getMembers = (q?: string) =>
  api.get('/admin/members', {
    params: { q },
  })

export const createMember = (data: unknown) => api.post('/admin/members', data)

export const updateMember = (id: number, data: unknown) =>
  api.put(`/admin/members/${id}`, data)

export const deleteMember = (id: number) => api.delete(`/admin/members/${id}`)

export const getPendingMembers = () => api.get('/admin/members/pending')

export const approveMember = (id: number) =>
  api.put(`/admin/members/${id}/approve`)

export const rejectMember = (id: number) =>
  api.put(`/admin/members/${id}/reject`)

// SLOTS

export const getSlotsAdmin = () => api.get('/admin/slots')

export const createSlot = (data: unknown) => api.post('/admin/slots', data)

export const updateSlot = (id: number, data: unknown) => api.put(`/admin/slots/${id}`, data)

export const deleteSlot = (id: number) => api.delete(`/admin/slots/${id}`)

export const changeSlotStatus = (id: number, active: boolean) =>
  api.put(`/admin/slots/${id}/status?active=${active}`)

// SETTINGS

export const getSettings = () => api.get('/admin/settings')

export const saveSettings = (keyName: string, value: string) =>
  api.post('/admin/settings', null, {
    params: { keyName, value },
  })

// REPORTS

export const getReport = (period: string) => api.get(`/admin/reports/${period}`)

// EXCEL

export const importMembers = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  return api.post('/admin/import-members', formData)
}

export const exportMembers = () =>
  api.get('/admin/export-members', {
    responseType: 'blob',
  })

export const exportSlots = () =>
  api.get('/admin/export-slots', {
    responseType: 'blob',
  })

export const exportReport = (period: string) =>
  api.get(`/admin/export-reports/${period}`, {
    responseType: 'blob',
  })

export const exportMembersDirectory = () =>
  api.get('/admin/export/members-directory', {
    responseType: 'blob',
  })

export const exportBookingReport = (startDate?: string, endDate?: string) =>
  api.get('/admin/export/bookings', {
    params: { startDate, endDate },
    responseType: 'blob',
  })

export const exportCheckInCheckOutReport = (startDate?: string, endDate?: string) =>
  api.get('/admin/export/checkins-checkouts', {
    params: { startDate, endDate },
    responseType: 'blob',
  })

export const exportGroceryBookingReport = (startDate?: string, endDate?: string) =>
  api.get('/admin/export/grocery-bookings', {
    params: { startDate, endDate },
    responseType: 'blob',
  })

export const exportLiquorBookingReport = (startDate?: string, endDate?: string) =>
  api.get('/admin/export/liquor-bookings', {
    params: { startDate, endDate },
    responseType: 'blob',
  })

export const exportSlotReport = (startDate?: string, endDate?: string) =>
  api.get('/admin/export/slots-report', {
    params: { startDate, endDate },
    responseType: 'blob',
  })

export const exportHolidayReport = (startDate?: string, endDate?: string) =>
  api.get('/admin/export/holidays', {
    params: { startDate, endDate },
    responseType: 'blob',
  })

export const exportAuditLogReport = (startDate?: string, endDate?: string) =>
  api.get('/admin/export/audit-logs', {
    params: { startDate, endDate },
    responseType: 'blob',
  })

// CUSTOMER

export const verifyMember = (mobileNumber: string) =>
    api.post('/customer/verify', {
        mobileNumber,
    })

export const getSlots = (
    cardType: 'GROCERY' | 'LIQUOR',
    bookingDate?: string
) =>
    api.get(`/customer/slots/${cardType}`, {
        params: { bookingDate },
    })

export const createBooking = (data: {
    memberId: number
    slotId: number
    cardType: 'GROCERY' | 'LIQUOR'
    bookingDate?: string
}) =>
    api.post('/customer/book', data)

export const getMemberBookings = (
    memberId: number
) =>
    api.get(`/customer/history/${memberId}`)

export const getCustomerProfile = (memberId: number) =>
    api.get(`/customer/profile/${memberId}`)

export const updateCustomerProfile = (
    memberId: number,
    data: {
        fullName: string
        mobileNumber: string
    }
) =>
    api.put(`/customer/profile/${memberId}`, data)

export const changePassword = (
    memberId: number,
    data: {
        oldPassword: string
        newPassword: string
        confirmPassword: string
    }
) =>
    api.put(`/customer/change-password/${memberId}`, data)


// OPERATOR

export const searchBooking = (params: {
    token?: string
    mobileNumber?: string
    cardNumber?: string
}) =>
    api.get('/operator/search', {
        params,
    })

export const getBookingByToken = (
    token: string
) =>
    api.get<OperatorBooking>(
        `/operator/booking/${token}`
    )

export const checkIn = (bookingId: number) =>
    api.post(`/operator/check-in/${bookingId}`)

export const checkOut = (bookingId: number) =>
    api.post(`/operator/check-out/${bookingId}`)

export const cancelBooking = (bookingId: number) =>
    api.post(`/operator/cancel/${bookingId}`)

export const trackBooking = (
    mobileNumber: string
) => {
    return api.get(`/customer/track/${mobileNumber}`)
}

export const getQueue = () =>
    api.get('/operator/queue')

//Landing Page
export const getLandingData = () => {
    return api.get("/customer/landing");
};
