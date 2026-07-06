import { adminLogin, customerLogin, operatorLogin } from './api'

const TOKEN_KEY = 'token'
const ROLE_KEY = 'role'
const USERNAME_KEY = 'username'

//Admin Login
export async function loginAdmin(username: string, password: string) {
  const resp = await adminLogin({ username, password })
  const token = resp.data?.token || resp.data?.accessToken || resp.data
  if (!token) throw new Error('Invalid login response')
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(ROLE_KEY, resp.data?.role || 'ADMIN')
  localStorage.setItem(USERNAME_KEY, resp.data?.username || username)

  if (resp.data?.fullName) {
    localStorage.setItem('fullName', resp.data.fullName)
  }
  return token
}

//Operator Login
export async function loginOperator(username: string, password: string) {
  const resp = await operatorLogin({ username, password })
  const token = resp.data?.token || resp.data?.accessToken || resp.data
  if (!token) throw new Error('Invalid login response')
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(ROLE_KEY, resp.data?.role || 'OPERATOR')
  localStorage.setItem(USERNAME_KEY, resp.data?.username || username)

  if (resp.data?.fullName) {
    localStorage.setItem('fullName', resp.data.fullName)
  }
  return token
}

//Customer Login
export async function loginCustomer(
    mobileNumber: string,
    password: string
) {

  const resp = await customerLogin({
    username: mobileNumber,
    password,
  })

  const token =
      resp.data?.token ||
      resp.data?.accessToken ||
      resp.data

  if (!token) {
    throw new Error('Invalid login response')
  }

  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(ROLE_KEY, resp.data?.role || 'CUSTOMER')
  localStorage.setItem(USERNAME_KEY, mobileNumber)

  if (resp.data?.memberId != null) {
    localStorage.setItem(
        'memberId',
        String(resp.data.memberId)
    )
  }

  if (resp.data?.fullName) {
    localStorage.setItem(
        'fullName',
        resp.data.fullName
    )
  }

  return token
}


//Customer Logout
export function logout() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(ROLE_KEY)
  localStorage.removeItem(USERNAME_KEY)
  localStorage.removeItem('memberId')
  localStorage.removeItem('fullName')
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
