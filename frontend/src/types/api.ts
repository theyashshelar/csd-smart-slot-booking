export interface Member {
  id: number;
  cardNumber: string;
  fullName: string;
  mobileNumber: string;
  rank?: string | null;
  category?: string | null;
  unit?: string | null;
  status?: string | null;
  email?: string | null;
  role?: string | null;
  verified?: boolean;
}

export interface Slot {
  id: number
  label: string
  cardType: 'GROCERY' | 'LIQUOR'
  startTime: string
  endTime: string
  capacity: number
  bookedCount: number
  active: boolean
}

export interface Booking {
  id: number
  bookingDate: string
  token: string
  cardType: 'GROCERY' | 'LIQUOR'
  slot: string
  status: string
  checkedInAt: string | null
  checkedOutAt: string | null
}

export interface CustomerProfile {
  id: number
  fullName: string
  mobileNumber: string
  dateOfBirth: string
  groceryCardNumber: string | null
  liquorCardNumber: string | null
  registrationStatus: string
}

export interface DashboardStats {
  todayVisitors: number;
  registeredMembers: number;
  bookings: number;
  checkedIn: number;
  checkedOut: number;
  cancelled: number;
}

export interface ReportResponse {
  period: string;
  totalBookings: number;
  checkedIn: number;
  checkedOut: number;
  cancelled: number;
  activeMembers: number;
  totalMembers: number;
  totalSlots: number;
  bookedSlots: number;
  availableSlots: number;
  occupancyPercentage: number;
}

export interface SettingsItem {
  id?: number;
  keyName: string;
  settingValue?: string | null;
}

export interface OperatorSearchResponse {
  bookingId: number
  memberName: string
  mobileNumber: string
  groceryCardNumber: string
  liquorCardNumber: string
  token: string
  slotLabel: string
  status: string
  bookingType: string
}

export interface OperatorBooking {
  id: number
  token: string
  bookingDate: string
  status: string
  member: {
    id: number
    fullName: string
    mobileNumber: string
    groceryCardNumber: string
    liquorCardNumber: string
  }

  slot: {
    id: number
    label: string
    cardType: string
    startTime: string
    endTime: string
  }

}
