import axios from 'axios'
import type { OperatorBooking } from "../types/api";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
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
  api.post(`/admin/settings?keyName=${keyName}&value=${value}`)

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

// CUSTOMER

export const verifyMember = (mobileNumber: string) =>
    api.post('/customer/verify', {
        mobileNumber,
    })

export const getSlots = (
    cardType: 'GROCERY' | 'LIQUOR'
) =>
    api.get(`/customer/slots/${cardType}`)

export const createBooking = (data: {
    memberId: number
    slotId: number
    cardType: 'GROCERY' | 'LIQUOR'
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
