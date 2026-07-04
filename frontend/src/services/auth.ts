import { adminLogin, customerLogin, operatorLogin } from './api'

const TOKEN_KEY = 'token'
const ROLE_KEY = 'role'
const USERNAME_KEY = 'username'

export async function loginAdmin(username: string, password: string) {
  const resp = await adminLogin({ username, password })
  const token = resp.data?.token || resp.data?.accessToken || resp.data
  if (!token) throw new Error('Invalid login response')
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(ROLE_KEY, resp.data?.role || 'ADMIN')
  localStorage.setItem(USERNAME_KEY, resp.data?.username || username)
  return token
}

export async function loginOperator(username: string, password: string) {
  const resp = await operatorLogin({ username, password })
  const token = resp.data?.token || resp.data?.accessToken || resp.data
  if (!token) throw new Error('Invalid login response')
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(ROLE_KEY, resp.data?.role || 'OPERATOR')
  localStorage.setItem(USERNAME_KEY, resp.data?.username || username)
  return token
}

export async function loginCustomer(cardNumber: string, mobileNumber: string) {
  const resp = await customerLogin({ username: cardNumber, password: mobileNumber })
  const token = resp.data?.token || resp.data?.accessToken || resp.data
  if (!token) throw new Error('Invalid login response')
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(ROLE_KEY, resp.data?.role || 'CUSTOMER')
  localStorage.setItem(USERNAME_KEY, resp.data?.username || cardNumber)
  return token
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(ROLE_KEY)
  localStorage.removeItem(USERNAME_KEY)
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getRole() {
  return localStorage.getItem(ROLE_KEY) || undefined
}

export function isAuthenticated() {
  return !!getToken()
}
