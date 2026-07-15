import express from 'express'
import path from 'path'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import multer from 'multer'
import xlsx from 'xlsx'
import { createServer as createViteServer } from 'vite'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 3000
const JWT_SECRET = 'csd-secret-key-12345678'

app.use(cors())
app.use(express.json())

// Multer for Excel Uploads
const storage = multer.memoryStorage()
const upload = multer({ storage })

// ==========================================
// IN-MEMORY DATABASE STATE
// ==========================================

let members = []

let operators = [
  {
    id: 1,
    operatorId: 'OP001',
    fullName: 'Main Operator',
    password: bcrypt.hashSync('operator123', 10),
    role: 'OPERATOR' as const,
    active: true
  }
]

let slots = [
  // Grocery slots
  { id: 1, label: '09:00-10:00', cardType: 'GROCERY' as const, startTime: '09:00', endTime: '10:00', capacity: 30, bookedCount: 0, active: true },
  { id: 2, label: '10:00-11:00', cardType: 'GROCERY' as const, startTime: '10:00', endTime: '11:00', capacity: 30, bookedCount: 0, active: true },
  { id: 3, label: '11:00-12:00', cardType: 'GROCERY' as const, startTime: '11:00', endTime: '12:00', capacity: 30, bookedCount: 0, active: true },
  // Liquor slots
  { id: 4, label: '12:00-01:00', cardType: 'LIQUOR' as const, startTime: '12:00', endTime: '13:00', capacity: 30, bookedCount: 0, active: true },
  { id: 5, label: '02:00-03:00', cardType: 'LIQUOR' as const, startTime: '14:00', endTime: '15:00', capacity: 30, bookedCount: 0, active: true }
]

let bookings = []

let settings = [
  { id: 1, keyName: 'tokenPrefix', settingValue: 'G' }
]

let systemSettings = {
  bookingEnabled: true,
  bookingWindowDays: 7,
  groceryAvailable: true,
  liquorAvailable: true,
  maxBookingPerDay: 1,
  cancellationEnabled: true,
  cancellationHours: 24
}

let auditLogs = [
  { id: 1, actor: 'admin', action: 'System Initialized', details: 'Initial seed data and roles loaded.', createdAt: new Date().toISOString() }
]

// ==========================================
// HELPERS
// ==========================================

function getNextMemberId() {
  return members.length > 0 ? Math.max(...members.map(m => m.id)) + 1 : 1
}

function getNextSlotId() {
  return slots.length > 0 ? Math.max(...slots.map(s => s.id)) + 1 : 1
}

function getNextBookingId() {
  return bookings.length > 0 ? Math.max(...bookings.map(b => b.id)) + 1 : 1
}

function generateBookingToken(cardType: 'GROCERY' | 'LIQUOR', slotId: number) {
  const prefix = cardType === 'GROCERY' ? 'G' : 'L'
  const slotStr = `S${String(slotId).padStart(2, '0')}`
  const prefixAndSlot = `${prefix}${slotStr}`
  
  // Count matching tokens to increment
  const count = bookings.filter(b => b.token.startsWith(`${prefix}-${slotStr}-`)).length
  const queueStr = String(count + 1).padStart(3, '0')
  return `${prefix}-${slotStr}-${queueStr}`
}

function getLocalDateString() {
  return new Date().toISOString().split('T')[0]
}

// ==========================================
// SECURITY MIDDLEWARE (STUB)
// ==========================================

function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return next() // For development / easy testing, we allow bypass or optional auth
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Forbidden' })
    req.user = user
    next()
  })
}

// ==========================================
// API ROUTES
// ==========================================

// 1. AUTHENTICATION

app.post('/api/auth/register', (req, res) => {
  const { fullName, mobileNumber, dateOfBirth, password, groceryCardNumber, liquorCardNumber } = req.body
  
  if (!fullName || !mobileNumber || !password) {
    return res.status(400).json({ error: 'Please enter all required fields.' })
  }

  const sameMobile = members.filter(m => m.mobileNumber === mobileNumber)
  const activeMobile = sameMobile.find(m => m.registrationStatus === 'PENDING' || m.registrationStatus === 'APPROVED')
  if (activeMobile) {
    if (activeMobile.registrationStatus === 'PENDING') {
      return res.status(400).json({ error: 'Your registration is already pending administrator approval. Please try again after your registration has been approved.' })
    } else {
      return res.status(400).json({ error: 'Mobile number already registered.' })
    }
  }

  if (groceryCardNumber) {
    const activeGrocery = members.find(m => m.groceryCardNumber === groceryCardNumber && (m.registrationStatus === 'PENDING' || m.registrationStatus === 'APPROVED'))
    if (activeGrocery) {
      return res.status(400).json({ error: 'Grocery card number is already registered.' })
    }
  }

  if (liquorCardNumber) {
    const activeLiquor = members.find(m => m.liquorCardNumber === liquorCardNumber && (m.registrationStatus === 'PENDING' || m.registrationStatus === 'APPROVED'))
    if (activeLiquor) {
      return res.status(400).json({ error: 'Liquor card number is already registered.' })
    }
  }

  const newMember = {
    id: getNextMemberId(),
    fullName,
    mobileNumber,
    dateOfBirth: dateOfBirth || '1995-01-01',
    password: bcrypt.hashSync(password, 10),
    groceryCardNumber,
    liquorCardNumber,
    registrationStatus: 'PENDING' as const,
    role: 'CUSTOMER' as const,
    registrationDate: new Date().toISOString()
  }

  members.push(newMember)
  auditLogs.push({
    id: auditLogs.length + 1,
    actor: fullName,
    action: 'Member Registration',
    details: `Registration requested for ${fullName} (${mobileNumber})`,
    createdAt: new Date().toISOString()
  })

  res.status(200).json({
    id: newMember.id,
    fullName: newMember.fullName,
    mobileNumber: newMember.mobileNumber,
    groceryCardNumber: newMember.groceryCardNumber,
    liquorCardNumber: newMember.liquorCardNumber,
    registrationStatus: newMember.registrationStatus,
    role: newMember.role,
    registrationDate: newMember.registrationDate
  })
})

app.post('/api/auth/admin/login', (req, res) => {
  const { username, password } = req.body
  if (username === 'admin' && (password === 'admin123' || bcrypt.compareSync(password, bcrypt.hashSync('admin123', 10)))) {
    const token = jwt.sign({ username, role: 'ADMIN' }, JWT_SECRET)
    return res.json({
      token,
      role: 'ADMIN',
      username: 'admin',
      fullName: 'System Administrator',
      memberId: null
    })
  }
  res.status(401).json({ error: 'Invalid admin credentials' })
})

app.post('/api/auth/operator/login', (req, res) => {
  const { username, password } = req.body
  const operator = operators.find(op => op.operatorId === username && op.active)
  
  if (operator && bcrypt.compareSync(password, operator.password)) {
    const token = jwt.sign({ username: operator.operatorId, role: 'OPERATOR' }, JWT_SECRET)
    return res.json({
      token,
      role: 'OPERATOR',
      username: operator.operatorId,
      fullName: operator.fullName,
      memberId: null
    })
  }
  res.status(401).json({ error: 'Invalid operator credentials' })
})

app.post('/api/auth/customer/login', (req, res) => {
  const { username, password } = req.body // username here represents mobile number
  const matchedMembers = members.filter(m => m.mobileNumber === username)

  if (matchedMembers.length === 0) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid mobile number or password.' })
  }

  // Prioritize APPROVED > PENDING > REJECTED (and get the latest record of that status)
  let member = matchedMembers.find(m => m.registrationStatus === 'APPROVED')
  if (!member) {
    member = matchedMembers.find(m => m.registrationStatus === 'PENDING')
  }
  if (!member) {
    const rejectedList = matchedMembers.filter(m => m.registrationStatus === 'REJECTED')
    if (rejectedList.length > 0) {
      member = rejectedList[rejectedList.length - 1]
    }
  }

  if (!member) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid mobile number or password.' })
  }

  if (!bcrypt.compareSync(password, member.password)) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid mobile number or password.' })
  }

  if (member.registrationStatus === 'PENDING') {
    return res.status(403).json({ error: 'Forbidden', message: 'Your account is pending administrator approval. Please try again after your registration has been approved.' })
  }

  if (member.registrationStatus === 'REJECTED') {
    return res.status(403).json({ error: 'Forbidden', message: 'Your registration was rejected. Please register again.' })
  }

  const token = jwt.sign({ id: member.id, username: member.mobileNumber, role: 'CUSTOMER' }, JWT_SECRET)
  res.json({
    token,
    role: 'CUSTOMER',
    username: member.mobileNumber,
    memberId: member.id,
    fullName: member.fullName
  })
})

// 2. ADMIN DASHBOARD

app.get('/api/admin/dashboard', authenticateToken, (req, res) => {
  const today = getLocalDateString()
  const todayBookings = bookings.filter(b => b.bookingDate === today)

  const recentBookingsMapped = [...bookings].reverse().slice(0, 10).map(b => {
    const m = members.find(mem => mem.id === b.memberId)
    const s = slots.find(sl => sl.id === b.slotId)
    return {
      bookingId: b.id,
      bookingDate: b.bookingDate,
      token: b.token,
      memberName: m ? m.fullName : 'Unknown Member',
      cardType: b.bookingLabel,
      slot: s ? s.label : 'N/A',
      status: b.status
    }
  })

  const pendingRegListMapped = members.filter(m => m.registrationStatus === 'PENDING').map(m => ({
    memberId: m.id,
    fullName: m.fullName,
    mobileNumber: m.mobileNumber,
    groceryCardNumber: m.groceryCardNumber || '',
    liquorCardNumber: m.liquorCardNumber || '',
    registrationStatus: m.registrationStatus
  }))

  const recentActivitiesMapped = [...auditLogs].reverse().slice(0, 10).map(a => ({
    id: a.id,
    actor: a.actor,
    action: a.action,
    details: a.details,
    createdAt: a.createdAt
  }))

  // Generate simple chart mock points
  const weeklyBookings = [
    { label: 'Mon', value: 12 },
    { label: 'Tue', value: 19 },
    { label: 'Wed', value: 15 },
    { label: 'Thu', value: 24 },
    { label: 'Fri', value: 30 },
    { label: 'Sat', value: 10 },
    { label: 'Sun', value: 5 }
  ]

  const monthlyBookings = [
    { label: 'Jan', value: 120 },
    { label: 'Feb', value: 150 },
    { label: 'Mar', value: 180 },
    { label: 'Apr', value: 220 },
    { label: 'May', value: 300 },
    { label: 'Jun', value: 250 }
  ]

  const cardUsage = [
    { label: 'GROCERY', value: bookings.filter(b => b.bookingLabel === 'GROCERY').length },
    { label: 'LIQUOR', value: bookings.filter(b => b.bookingLabel === 'LIQUOR').length }
  ]

  const peakBookingHours = slots.map(s => ({
    label: s.label,
    value: bookings.filter(b => b.slotId === s.id).length
  }))

  const stats = {
    todayVisitors: todayBookings.filter(b => b.status === 'CHECKED_IN' || b.status === 'CHECKED_OUT').length,
    registeredMembers: members.filter(m => m.role === 'CUSTOMER').length,
    bookings: bookings.length,
    checkedIn: bookings.filter(b => b.status === 'CHECKED_IN').length,
    checkedOut: bookings.filter(b => b.status === 'CHECKED_OUT').length,
    cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
    activeMembers: members.filter(m => m.registrationStatus === 'APPROVED').length,
    pendingRegistrations: members.filter(m => m.registrationStatus === 'PENDING').length,
    rejectedRegistrations: members.filter(m => m.registrationStatus === 'REJECTED').length,
    availableSlots: slots.filter(s => s.active).length,
    totalSlots: slots.length,
    groceryAvailable: slots.filter(s => s.active && s.cardType === 'GROCERY').length,
    liquorAvailable: slots.filter(s => s.active && s.cardType === 'LIQUOR').length,
    groceryBookings: bookings.filter(b => b.bookingLabel === 'GROCERY').length,
    liquorBookings: bookings.filter(b => b.bookingLabel === 'LIQUOR').length,
    recentBookings: recentBookingsMapped,
    pendingRegistrationList: pendingRegListMapped,
    recentAdminActivities: recentActivitiesMapped,
    weeklyBookings,
    monthlyBookings,
    cardUsage,
    peakBookingHours
  }

  res.json(stats)
})

// 3. ADMIN - MEMBERS CRUD & ACTIONS

app.get('/api/admin/members', (req, res) => {
  const { q } = req.query as { q?: string }
  let list = members.filter(m => m.role === 'CUSTOMER')
  if (q) {
    const query = q.toLowerCase()
    list = list.filter(m => m.fullName.toLowerCase().includes(query) || m.mobileNumber.includes(query))
  }
  res.json(list)
})

app.get('/api/admin/members/pending', (req, res) => {
  res.json(members.filter(m => m.registrationStatus === 'PENDING'))
})

app.post('/api/admin/members', (req, res) => {
  const { fullName, mobileNumber, dateOfBirth, password, groceryCardNumber, liquorCardNumber } = req.body
  const exists = members.find(m => m.mobileNumber === mobileNumber && (m.registrationStatus === 'PENDING' || m.registrationStatus === 'APPROVED'))
  if (exists) {
    return res.status(400).json({ error: 'Member already exists with this mobile number and is active or pending' })
  }

  if (groceryCardNumber) {
    const cardExists = members.find(m => m.groceryCardNumber === groceryCardNumber && (m.registrationStatus === 'PENDING' || m.registrationStatus === 'APPROVED'))
    if (cardExists) {
      return res.status(400).json({ error: 'Grocery card number is already registered.' })
    }
  }

  if (liquorCardNumber) {
    const cardExists = members.find(m => m.liquorCardNumber === liquorCardNumber && (m.registrationStatus === 'PENDING' || m.registrationStatus === 'APPROVED'))
    if (cardExists) {
      return res.status(400).json({ error: 'Liquor card number is already registered.' })
    }
  }
  const newMember = {
    id: getNextMemberId(),
    fullName,
    mobileNumber,
    dateOfBirth: dateOfBirth || '1995-01-01',
    password: bcrypt.hashSync(password || 'member123', 10),
    groceryCardNumber,
    liquorCardNumber,
    registrationStatus: 'APPROVED' as const,
    role: 'CUSTOMER' as const,
    registrationDate: new Date().toISOString()
  }
  members.push(newMember)
  
  auditLogs.push({
    id: auditLogs.length + 1,
    actor: 'admin',
    action: 'Create Member',
    details: `Created member ${fullName} (${mobileNumber})`,
    createdAt: new Date().toISOString()
  })

  res.json(newMember)
})

app.put('/api/admin/members/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const idx = members.findIndex(m => m.id === id)
  if (idx === -1) return res.status(404).json({ error: 'Member not found' })
  
  const { fullName, mobileNumber, dateOfBirth, groceryCardNumber, liquorCardNumber, registrationStatus } = req.body
  members[idx] = {
    ...members[idx],
    fullName: fullName || members[idx].fullName,
    mobileNumber: mobileNumber || members[idx].mobileNumber,
    dateOfBirth: dateOfBirth || members[idx].dateOfBirth,
    groceryCardNumber: groceryCardNumber !== undefined ? groceryCardNumber : members[idx].groceryCardNumber,
    liquorCardNumber: liquorCardNumber !== undefined ? liquorCardNumber : members[idx].liquorCardNumber,
    registrationStatus: registrationStatus || members[idx].registrationStatus
  }

  auditLogs.push({
    id: auditLogs.length + 1,
    actor: 'admin',
    action: 'Update Member',
    details: `Updated member ${members[idx].fullName} (${members[idx].mobileNumber})`,
    createdAt: new Date().toISOString()
  })

  res.json(members[idx])
})

app.delete('/api/admin/members/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const idx = members.findIndex(m => m.id === id)
  if (idx !== -1) {
    const m = members[idx]
    members.splice(idx, 1)
    auditLogs.push({
      id: auditLogs.length + 1,
      actor: 'admin',
      action: 'Delete Member',
      details: `Deleted member ${m.fullName}`,
      createdAt: new Date().toISOString()
    })
  }
  res.sendStatus(204)
})

app.put('/api/admin/members/:id/approve', (req, res) => {
  const id = parseInt(req.params.id)
  const idx = members.findIndex(m => m.id === id)
  if (idx === -1) return res.status(404).json({ error: 'Member not found' })
  
  members[idx].registrationStatus = 'APPROVED'
  auditLogs.push({
    id: auditLogs.length + 1,
    actor: 'admin',
    action: 'Approve Member',
    details: `Approved member ${members[idx].fullName}`,
    createdAt: new Date().toISOString()
  })
  res.json(members[idx])
})

app.put('/api/admin/members/:id/reject', (req, res) => {
  const id = parseInt(req.params.id)
  const idx = members.findIndex(m => m.id === id)
  if (idx === -1) return res.status(404).json({ error: 'Member not found' })
  
  members[idx].registrationStatus = 'REJECTED'
  auditLogs.push({
    id: auditLogs.length + 1,
    actor: 'admin',
    action: 'Reject Member',
    details: `Rejected member ${members[idx].fullName}`,
    createdAt: new Date().toISOString()
  })
  res.json(members[idx])
})

// 4. ADMIN - SLOTS CRUD & ACTIONS

app.get('/api/admin/slots', (req, res) => {
  res.json(slots)
})

app.post('/api/admin/slots', (req, res) => {
  const { label, cardType, startTime, endTime, capacity } = req.body
  const newSlot = {
    id: getNextSlotId(),
    label,
    cardType,
    startTime,
    endTime,
    capacity: parseInt(capacity) || 30,
    bookedCount: 0,
    active: true
  }
  slots.push(newSlot)

  auditLogs.push({
    id: auditLogs.length + 1,
    actor: 'admin',
    action: 'Create Slot',
    details: `Created slot ${label} for ${cardType}`,
    createdAt: new Date().toISOString()
  })

  res.json(newSlot)
})

app.put('/api/admin/slots/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const idx = slots.findIndex(s => s.id === id)
  if (idx === -1) return res.status(404).json({ error: 'Slot not found' })

  console.log(`[PUT /api/admin/slots/${id}] Incoming payload:`, req.body)

  const { label, cardType, startTime, endTime, capacity } = req.body
  slots[idx] = {
    ...slots[idx],
    label: label !== undefined ? label : slots[idx].label,
    cardType: cardType !== undefined ? cardType : slots[idx].cardType,
    startTime: startTime !== undefined ? startTime : slots[idx].startTime,
    endTime: endTime !== undefined ? endTime : slots[idx].endTime,
    capacity: capacity !== undefined ? parseInt(capacity) : slots[idx].capacity
  }

  auditLogs.push({
    id: auditLogs.length + 1,
    actor: 'admin',
    action: 'Update Slot',
    details: `Updated slot ${slots[idx].label}`,
    createdAt: new Date().toISOString()
  })

  res.json(slots[idx])
})

app.delete('/api/admin/slots/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const idx = slots.findIndex(s => s.id === id)
  if (idx !== -1) {
    const s = slots[idx]
    slots.splice(idx, 1)
    auditLogs.push({
      id: auditLogs.length + 1,
      actor: 'admin',
      action: 'Delete Slot',
      details: `Deleted slot ${s.label}`,
      createdAt: new Date().toISOString()
    })
  }
  res.sendStatus(204)
})

app.put('/api/admin/slots/:id/status', (req, res) => {
  const id = parseInt(req.params.id)
  const active = req.query.active === 'true'
  const idx = slots.findIndex(s => s.id === id)
  if (idx === -1) return res.status(404).json({ error: 'Slot not found' })

  slots[idx].active = active
  auditLogs.push({
    id: auditLogs.length + 1,
    actor: 'admin',
    action: 'Change Slot Status',
    details: `Set slot ${slots[idx].label} active status to ${active}`,
    createdAt: new Date().toISOString()
  })
  res.json(slots[idx])
})

// 5. ADMIN - SETTINGS & SYSTEM SETTINGS

app.get('/api/admin/settings', (req, res) => {
  res.json(settings)
})

app.post('/api/api/admin/settings', (req, res) => {
  const { keyName, value } = req.query as { keyName: string, value: string }
  const idx = settings.findIndex(s => s.keyName === keyName)
  if (idx !== -1) {
    settings[idx].settingValue = value
  } else {
    settings.push({ id: settings.length + 1, keyName, settingValue: value })
  }
  res.json(settings.find(s => s.keyName === keyName))
})

app.get('/api/admin/system-settings', (req, res) => {
  res.json(systemSettings)
})

app.put('/api/admin/system-settings', (req, res) => {
  systemSettings = {
    ...systemSettings,
    ...req.body
  }
  res.sendStatus(200)
})

// 6. ADMIN - EXCEL IMPORT / EXPORT

app.post('/api/admin/import-members', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' })
  }

  try {
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const rows = xlsx.utils.sheet_to_json<any[]>(sheet, { header: 1 })
    
    let count = 0
    // Skip header row
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      if (!row || row.length < 2) continue
      
      const fullName = String(row[0]).trim()
      const mobileNumber = String(row[1]).trim()
      const groceryCardNumber = row[2] ? String(row[2]).trim() : undefined
      const liquorCardNumber = row[3] ? String(row[3]).trim() : undefined

      if (!fullName || !mobileNumber) continue

      if (!members.find(m => m.mobileNumber === mobileNumber)) {
        members.push({
          id: getNextMemberId(),
          fullName,
          mobileNumber,
          dateOfBirth: '1995-01-01',
          password: bcrypt.hashSync('CHANGE_ME', 10),
          groceryCardNumber,
          liquorCardNumber,
          registrationStatus: 'APPROVED',
          role: 'CUSTOMER'
        })
        count++
      }
    }

    auditLogs.push({
      id: auditLogs.length + 1,
      actor: 'admin',
      action: 'Import Members',
      details: `Imported ${count} members from excel`,
      createdAt: new Date().toISOString()
    })

    res.status(200).send(`${count} Members Imported Successfully`)
  } catch (error) {
    res.status(500).json({ error: 'Failed to parse Excel file' })
  }
})

app.get('/api/admin/export-members', (req, res) => {
  const membersData = members.filter(m => m.role === 'CUSTOMER').map(m => ({
    'Full Name': m.fullName,
    'Mobile Number': m.mobileNumber,
    'Grocery Card': m.groceryCardNumber || '',
    'Liquor Card': m.liquorCardNumber || '',
    'Status': m.registrationStatus,
    'Registration Date': m.registrationDate ? new Date(m.registrationDate).toISOString().replace('T', ' ').substring(0, 19) : 'Not Available'
  }))

  const ws = xlsx.utils.json_to_sheet(membersData)
  const wb = xlsx.utils.book_new()
  xlsx.utils.book_append_sheet(wb, ws, 'Members')
  const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' })

  res.setHeader('Content-Disposition', 'attachment; filename=members.xlsx')
  res.setHeader('Content-Type', 'application/octet-stream')
  res.send(buffer)
})

app.get('/api/admin/export-slots', (req, res) => {
  const slotsData = slots.map(s => ({
    'Label': s.label,
    'Card Type': s.cardType,
    'Start Time': s.startTime,
    'End Time': s.endTime,
    'Capacity': s.capacity,
    'Booked': s.bookedCount
  }))

  const ws = xlsx.utils.json_to_sheet(slotsData)
  const wb = xlsx.utils.book_new()
  xlsx.utils.book_append_sheet(wb, ws, 'Slots')
  const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' })

  res.setHeader('Content-Disposition', 'attachment; filename=slots.xlsx')
  res.setHeader('Content-Type', 'application/octet-stream')
  res.send(buffer)
})

app.get('/api/admin/export-reports/:period', (req, res) => {
  const period = req.params.period
  const r = calculateReport(period)

  const reportData = [
    { 'Metric': 'Period', 'Value': r.period },
    { 'Metric': 'Total Bookings', 'Value': r.totalBookings },
    { 'Metric': 'Checked In', 'Value': r.checkedIn },
    { 'Metric': 'Checked Out', 'Value': r.checkedOut },
    { 'Metric': 'Cancelled', 'Value': r.cancelled },
    { 'Metric': 'Occupancy Percentage', 'Value': `${r.occupancyPercentage}%` }
  ]

  const ws = xlsx.utils.json_to_sheet(reportData)
  const wb = xlsx.utils.book_new()
  xlsx.utils.book_append_sheet(wb, ws, 'Report')
  const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' })

  res.setHeader('Content-Disposition', `attachment; filename=${period}-report.xlsx`)
  res.setHeader('Content-Type', 'application/octet-stream')
  res.send(buffer)
})

// 7. ADMIN - REPORTS

function calculateReport(period: string) {
  const totalBookings = bookings.length
  const checkedIn = bookings.filter(b => b.status === 'CHECKED_IN').length
  const checkedOut = bookings.filter(b => b.status === 'CHECKED_OUT').length
  const cancelled = bookings.filter(b => b.status === 'CANCELLED').length
  const totalSlots = slots.length
  
  const totalCapacity = slots.reduce((acc, s) => acc + s.capacity, 0)
  const occupancyPercentage = totalCapacity > 0 ? parseFloat(((bookings.filter(b => b.status !== 'CANCELLED').length / totalCapacity) * 100).toFixed(2)) : 0

  return {
    period,
    totalBookings,
    checkedIn,
    checkedOut,
    cancelled,
    activeMembers: members.filter(m => m.registrationStatus === 'APPROVED').length,
    totalMembers: members.length,
    totalSlots,
    bookedSlots: bookings.filter(b => b.status !== 'CANCELLED').length,
    availableSlots: slots.filter(s => s.active).length,
    occupancyPercentage
  }
}

app.get('/api/admin/reports/:period', (req, res) => {
  res.json(calculateReport(req.params.period))
})

// 8. CUSTOMER APIS

app.post('/api/customer/verify', (req, res) => {
  const { mobileNumber } = req.body
  const member = members.find(m => m.mobileNumber === mobileNumber && m.registrationStatus === 'APPROVED')
  
  if (member && member.registrationStatus === 'APPROVED') {
    return res.json({
      id: member.id,
      fullName: member.fullName,
      mobileNumber: member.mobileNumber,
      groceryCardNumber: member.groceryCardNumber,
      liquorCardNumber: member.liquorCardNumber,
      role: member.role,
      verified: true
    })
  }

  res.json({ verified: false })
})

app.get('/api/customer/slots/:cardType', (req, res) => {
  const cardType = req.params.cardType.toUpperCase() as 'GROCERY' | 'LIQUOR'
  const bookingDate = (req.query.bookingDate as string) || getLocalDateString()

  const limitTime = new Date(Date.now() + 30 * 60 * 1000)

  // For each active slot of this card type, count how many bookings exist for this slot on the given bookingDate
  const filteredSlots = slots
    .filter(s => {
      if (!s.active || s.cardType !== cardType) {
        return false
      }
      const slotDateTime = new Date(`${bookingDate}T${s.startTime}:00`)
      return slotDateTime.getTime() >= limitTime.getTime()
    })
    .map(s => {
      const bookedCountOnDate = bookings.filter(b => b.slotId === s.id && b.bookingDate === bookingDate && b.status !== 'CANCELLED').length
      return {
        ...s,
        bookedCount: bookedCountOnDate
      }
    })

  res.json(filteredSlots)
})

app.post('/api/customer/book', (req, res) => {
  const { memberId, slotId, cardType, bookingDate } = req.body
  const bDate = bookingDate || getLocalDateString()

  const member = members.find(m => m.id === Number(memberId))
  const slot = slots.find(s => s.id === Number(slotId))

  if (!member) return res.status(404).json({ error: 'Member not found' })
  if (!slot) return res.status(404).json({ error: 'Slot not found' })

  if (!slot.active) {
    return res.status(400).json({ error: 'This time slot is currently inactive.' })
  }

  // Validate slot expiration
  const limitTime = new Date(Date.now() + 30 * 60 * 1000)
  const slotDateTime = new Date(`${bDate}T${slot.startTime}:00`)
  if (slotDateTime.getTime() < limitTime.getTime()) {
    return res.status(400).json({ error: 'This time slot has already expired or is too close to start.' })
  }

  // Check if slot capacity is full
  const bookedOnDate = bookings.filter(b => b.slotId === slot.id && b.bookingDate === bDate && b.status !== 'CANCELLED').length
  if (bookedOnDate >= slot.capacity) {
    return res.status(400).json({ error: 'This time slot is fully booked.' })
  }

  // Check if customer already has a booking for this cardType on this date
  const alreadyBooked = bookings.find(b => b.memberId === member.id && b.bookingDate === bDate && b.bookingLabel === cardType && b.status !== 'CANCELLED')
  if (alreadyBooked) {
    return res.status(400).json({ error: `You have already booked a ${cardType} slot for this date.` })
  }

  const token = generateBookingToken(cardType, slot.id)

  const newBooking = {
    id: getNextBookingId(),
    memberId: member.id,
    slotId: slot.id,
    token,
    bookingDate: bDate,
    bookingLabel: cardType,
    status: 'BOOKED' as const,
    smsStatus: 'SENT',
    createdAt: new Date().toISOString()
  }

  bookings.push(newBooking)

  // Track slot occupancy
  slot.bookedCount = bookings.filter(b => b.slotId === slot.id && b.bookingDate === bDate && b.status !== 'CANCELLED').length

  res.json(newBooking)
})

app.post('/api/customer/cancel/:bookingId/:memberId', (req, res) => {
  const bookingId = Number(req.params.bookingId)
  const memberId = Number(req.params.memberId)

  const booking = bookings.find(b => b.id === bookingId)
  if (!booking) {
    return res.status(404).json({ error: 'NotFound', message: 'Booking not found.' })
  }

  if (booking.memberId !== memberId) {
    return res.status(400).json({ error: 'BadRequest', message: 'You can only cancel your own bookings.' })
  }

  if (booking.status !== 'BOOKED') {
    return res.status(400).json({ error: 'BadRequest', message: 'Only bookings with status BOOKED can be cancelled.' })
  }

  booking.status = 'CANCELLED'

  // Update slot bookedCount
  const slot = slots.find(s => s.id === booking.slotId)
  if (slot) {
    slot.bookedCount = bookings.filter(b => b.slotId === slot.id && b.bookingDate === booking.bookingDate && b.status !== 'CANCELLED').length
  }

  // Create audit log
  const member = members.find(m => m.id === memberId)
  auditLogs.push({
    id: auditLogs.length + 1,
    actor: member ? member.fullName : 'customer',
    action: 'CANCEL_BOOKING',
    details: `Cancelled Booking ID : ${booking.id} for slot : ${booking.bookingLabel}`,
    createdAt: new Date().toISOString()
  })

  res.send('Booking cancelled successfully.')
})

app.get('/api/customer/history/:memberId', (req, res) => {
  const memberId = Number(req.params.memberId)
  const history = bookings.filter(b => b.memberId === memberId).map(b => {
    const s = slots.find(sl => sl.id === b.slotId)
    return {
      bookingId: b.id,
      bookingDate: b.bookingDate,
      token: b.token,
      cardType: b.bookingLabel as any,
      slot: s ? s.label : 'N/A',
      status: b.status,
      checkedInAt: b.checkedInAt,
      checkedOutAt: b.checkedOutAt
    }
  })
  res.json(history)
})

app.get('/api/customer/track/:mobileNumber', (req, res) => {
  const { mobileNumber } = req.params
  const member = members.find(m => m.mobileNumber === mobileNumber && m.registrationStatus === 'APPROVED') || members.find(m => m.mobileNumber === mobileNumber)
  if (!member) return res.json([])

  const history = bookings.filter(b => b.memberId === member.id).map(b => {
    const s = slots.find(sl => sl.id === b.slotId)
    return {
      bookingId: b.id,
      bookingDate: b.bookingDate,
      token: b.token,
      cardType: b.bookingLabel as any,
      slot: s ? s.label : 'N/A',
      status: b.status,
      checkedInAt: b.checkedInAt,
      checkedOutAt: b.checkedOutAt
    }
  })
  res.json(history)
})

app.get('/api/customer/profile/:memberId', (req, res) => {
  const memberId = Number(req.params.memberId)
  const m = members.find(mem => mem.id === memberId)
  if (!m) return res.status(404).json({ error: 'Member not found' })

  res.json({
    id: m.id,
    fullName: m.fullName,
    mobileNumber: m.mobileNumber,
    dateOfBirth: m.dateOfBirth,
    groceryCardNumber: m.groceryCardNumber || '',
    liquorCardNumber: m.liquorCardNumber || '',
    registrationStatus: m.registrationStatus,
    registrationDate: m.registrationDate || null
  })
})

app.put('/api/customer/profile/:memberId', (req, res) => {
  const memberId = Number(req.params.memberId)
  const idx = members.findIndex(mem => mem.id === memberId)
  if (idx === -1) return res.status(404).json({ error: 'Member not found' })

  const { fullName, mobileNumber } = req.body
  members[idx].fullName = fullName || members[idx].fullName
  members[idx].mobileNumber = mobileNumber || members[idx].mobileNumber

  res.json({
    id: members[idx].id,
    fullName: members[idx].fullName,
    mobileNumber: members[idx].mobileNumber,
    dateOfBirth: members[idx].dateOfBirth,
    groceryCardNumber: members[idx].groceryCardNumber || '',
    liquorCardNumber: members[idx].liquorCardNumber || '',
    registrationStatus: members[idx].registrationStatus
  })
})

app.put('/api/customer/change-password/:memberId', (req, res) => {
  const memberId = Number(req.params.memberId)
  const idx = members.findIndex(mem => mem.id === memberId)
  if (idx === -1) return res.status(404).json({ error: 'Member not found' })

  const { oldPassword, newPassword } = req.body
  if (!bcrypt.compareSync(oldPassword, members[idx].password)) {
    return res.status(400).json({ error: 'Invalid old password' })
  }

  members[idx].password = bcrypt.hashSync(newPassword, 10)
  res.send('Password changed successfully.')
})

app.get('/api/customer/landing', (req, res) => {
  const today = getLocalDateString()
  res.json({
    registeredMembers: members.filter(m => m.role === 'CUSTOMER').length,
    todayBookings: bookings.filter(b => b.bookingDate === today).length,
    availableSlots: slots.filter(s => s.active)
  })
})

// 9. OPERATOR APIS

app.get('/api/operator/queue', (req, res) => {
  const today = getLocalDateString()
  const queueBookings = bookings.filter(b => b.bookingDate === today && b.status !== 'CANCELLED')
  res.json(queueBookings)
})

app.get('/api/operator/search', (req, res) => {
  const { token, mobileNumber, cardNumber } = req.query as { token?: string, mobileNumber?: string, cardNumber?: string }
  let matchedBooking = null

  if (token) {
    matchedBooking = bookings.find(b => b.token.toLowerCase() === token.toLowerCase())
  } else if (mobileNumber) {
    const member = members.find(m => m.mobileNumber === mobileNumber && m.registrationStatus === 'APPROVED') || members.find(m => m.mobileNumber === mobileNumber)
    if (member) {
      matchedBooking = bookings.find(b => b.memberId === member.id && b.bookingDate === getLocalDateString())
    }
  } else if (cardNumber) {
    const member = members.find(m => (m.groceryCardNumber === cardNumber || m.liquorCardNumber === cardNumber) && m.registrationStatus === 'APPROVED') || members.find(m => m.groceryCardNumber === cardNumber || m.liquorCardNumber === cardNumber)
    if (member) {
      matchedBooking = bookings.find(b => b.memberId === member.id && b.bookingDate === getLocalDateString())
    }
  }

  if (matchedBooking) {
    const member = members.find(m => m.id === matchedBooking.memberId)
    const slot = slots.find(s => s.id === matchedBooking.slotId)
    return res.json({
      bookingId: matchedBooking.id,
      memberName: member ? member.fullName : 'Unknown Member',
      mobileNumber: member ? member.mobileNumber : '',
      groceryCardNumber: member ? member.groceryCardNumber || '' : '',
      liquorCardNumber: member ? member.liquorCardNumber || '' : '',
      token: matchedBooking.token,
      slotLabel: slot ? slot.label : 'N/A',
      status: matchedBooking.status,
      bookingType: matchedBooking.bookingLabel
    })
  }

  res.status(404).json({ error: 'No booking found matching criteria' })
})

app.get('/api/operator/booking/:token', (req, res) => {
  const { token } = req.params
  const booking = bookings.find(b => b.token.toLowerCase() === token.toLowerCase())
  if (!booking) return res.status(404).json({ error: 'Booking not found' })
  res.json(booking)
})

app.post('/api/operator/check-in/:bookingId', (req, res) => {
  const bookingId = Number(req.params.bookingId)
  const idx = bookings.findIndex(b => b.id === bookingId)
  if (idx === -1) return res.status(404).json({ error: 'Booking not found' })

  if (bookings[idx].status !== 'BOOKED') {
    return res.status(400).json({ error: 'BadRequest', message: 'Booking already processed or cancelled.' })
  }

  bookings[idx].status = 'CHECKED_IN'
  bookings[idx].checkedInAt = new Date().toISOString()
  res.json(bookings[idx])
})

app.post('/api/operator/check-out/:bookingId', (req, res) => {
  const bookingId = Number(req.params.bookingId)
  const idx = bookings.findIndex(b => b.id === bookingId)
  if (idx === -1) return res.status(404).json({ error: 'Booking not found' })

  if (bookings[idx].status !== 'CHECKED_IN') {
    return res.status(400).json({ error: 'BadRequest', message: 'Customer has not checked in.' })
  }

  bookings[idx].status = 'CHECKED_OUT'
  bookings[idx].checkedOutAt = new Date().toISOString()
  res.json(bookings[idx])
})

app.post('/api/operator/cancel/:bookingId', (req, res) => {
  const bookingId = Number(req.params.bookingId)
  const idx = bookings.findIndex(b => b.id === bookingId)
  if (idx === -1) return res.status(404).json({ error: 'Booking not found' })

  if (bookings[idx].status === 'CANCELLED') {
    return res.status(400).json({ error: 'BadRequest', message: 'Booking already cancelled.' })
  }
  if (bookings[idx].status === 'CHECKED_OUT') {
    return res.status(400).json({ error: 'BadRequest', message: 'Checked out booking cannot be cancelled.' })
  }

  bookings[idx].status = 'CANCELLED'

  // Update slot bookedCount
  const booking = bookings[idx]
  const slot = slots.find(s => s.id === booking.slotId)
  if (slot) {
    slot.bookedCount = bookings.filter(b => b.slotId === slot.id && b.bookingDate === booking.bookingDate && b.status !== 'CANCELLED').length
  }

  auditLogs.push({
    id: auditLogs.length + 1,
    actor: 'OPERATOR',
    action: 'CANCEL_BOOKING',
    details: booking.token,
    createdAt: new Date().toISOString()
  })

  res.json(bookings[idx])
})

// 10. QR CODE PNG REDIRECT / PROXY

app.get('/api/qr/:token', async (req, res) => {
  const { token } = req.params
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(token)}`
  try {
    const response = await fetch(qrUrl)
    const arrayBuffer = await response.arrayBuffer()
    res.setHeader('Content-Type', 'image/png')
    res.send(Buffer.from(arrayBuffer))
  } catch (error) {
    res.status(500).send('Error generating QR')
  }
})

// ==========================================
// VITE DEV SERVER & STATIC MIDDLEWARE
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
      root: path.resolve(__dirname, 'frontend')
    })
    app.use(vite.middlewares)
  } else {
    const distPath = path.resolve(__dirname, 'dist')
    app.use(express.static(distPath))
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'))
    })
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`)
  })
}

startServer()
