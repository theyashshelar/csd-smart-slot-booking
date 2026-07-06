import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
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

export default api


// AUTH

export const adminLogin = (data: { username: string; password: string }) =>
  api.post('/api/auth/admin/login', data)

export const operatorLogin = (data: { username: string; password: string }) =>
  api.post('/api/auth/operator/login', data)

export const customerLogin = (data: { username: string; password: string }) =>
  api.post('/api/auth/customer/login', data)

// ADMIN DASHBOARD

export const getDashboard = () => api.get('/api/admin/dashboard')

// MEMBERS
export const getMembers = (q?: string) =>
  api.get('/api/admin/members', {
    params: { q },
  })

export const createMember = (data: unknown) => api.post('/api/admin/members', data)

export const updateMember = (id: number, data: unknown) =>
  api.put(`/api/admin/members/${id}`, data)

export const deleteMember = (id: number) => api.delete(`/api/admin/members/${id}`)

// SLOTS

export const getSlotsAdmin = () => api.get('/api/admin/slots')

export const createSlot = (data: unknown) => api.post('/api/admin/slots', data)

export const updateSlot = (id: number, data: unknown) => api.put(`/api/admin/slots/${id}`, data)

export const deleteSlot = (id: number) => api.delete(`/api/admin/slots/${id}`)

export const changeSlotStatus = (id: number, active: boolean) =>
  api.put(`/api/admin/slots/${id}/status?active=${active}`)

// SETTINGS

export const getSettings = () => api.get('/api/admin/settings')

export const saveSettings = (keyName: string, value: string) =>
  api.post(`/api/admin/settings?keyName=${keyName}&value=${value}`)

// REPORTS

export const getReport = (period: string) => api.get(`/api/admin/reports/${period}`)

// EXCEL

export const importMembers = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  return api.post('/api/admin/import-members', formData)
}

export const exportMembers = () =>
  api.get('/api/admin/export-members', {
    responseType: 'blob',
  })

export const exportSlots = () =>
  api.get('/api/admin/export-slots', {
    responseType: 'blob',
  })

export const exportReport = (period: string) =>
  api.get(`/api/admin/export-reports/${period}`, {
    responseType: 'blob',
  })

// CUSTOMER

export const verifyMember = (mobileNumber: string) =>
    api.post('/api/customer/verify', {
        mobileNumber,
    })

export const getSlots = (
    cardType: 'GROCERY' | 'LIQUOR'
) =>
    api.get(`/api/customer/slots/${cardType}`)

export const createBooking = (data: {
    memberId: number
    slotId: number
    cardType: 'GROCERY' | 'LIQUOR'
}) =>
    api.post('/api/customer/book', data)

export const getMemberBookings = (
    memberId: number
) =>
    api.get(`/api/customer/history/${memberId}`)

export const getCustomerProfile = (memberId: number) =>
    api.get(`/api/customer/profile/${memberId}`)

export const updateCustomerProfile = (
    memberId: number,
    data: {
        fullName: string
        mobileNumber: string
    }
) =>
    api.put(`/api/customer/profile/${memberId}`, data)

export const changePassword = (
    memberId: number,
    data: {
        oldPassword: string
        newPassword: string
        confirmPassword: string
    }
) =>
    api.put(`/api/customer/change-password/${memberId}`, data)


// OPERATOR

export const getQueue = () => api.get('/api/operator/queue')

export const checkIn = (bookingId: number) =>
  api.post(`/api/operator/check-in/${bookingId}`)

export const checkOut = (bookingId: number) =>
  api.post(`/api/operator/check-out/${bookingId}`)

export const cancelBooking = (bookingId: number) =>
  api.post(`/api/operator/cancel/${bookingId}`)

export const trackBooking = (
    mobileNumber: string
) => {
    return api.get(`/api/customer/track/${mobileNumber}`)
}