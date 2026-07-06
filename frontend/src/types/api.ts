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
  id: number;
  label?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  capacity?: number | null;
  bookedCount?: number | null;
  active?: boolean | null;
}

export interface Booking {
  bookingId: number
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
