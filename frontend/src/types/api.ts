export interface Member {
  id: number;
  fullName: string;
  mobileNumber: string;
  dateOfBirth?: string;

  groceryCardNumber?: string | null;
  liquorCardNumber?: string | null;

  registrationStatus?: string;
  role?: string;
  verified?: boolean;
  registrationDate?: string | null;
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
  bookingId?: number
  memberId?: number
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
  registrationDate?: string | null
}

export interface DashboardStats {
  todayVisitors: number;
  registeredMembers: number;
  bookings: number;
  checkedIn: number;
  checkedOut: number;
  cancelled: number;
  activeMembers: number;
  pendingRegistrations: number;
  rejectedRegistrations: number;
  availableSlots: number;
  totalSlots: number;
  groceryAvailable: number;
  liquorAvailable: number;
  groceryBookings: number;
  liquorBookings: number;
  recentBookings: DashboardBookingSummary[];
  pendingRegistrationList: DashboardPendingRegistration[];
  recentAdminActivities: DashboardActivity[];
  weeklyBookings: DashboardChartPoint[];
  monthlyBookings: DashboardChartPoint[];
  cardUsage: DashboardChartPoint[];
  peakBookingHours: DashboardChartPoint[];
}

export interface DashboardBookingSummary {
  bookingId: number;
  bookingDate: string;
  token: string;
  memberName: string;
  cardType: 'GROCERY' | 'LIQUOR' | string;
  slot: string;
  status: string;
}

export interface DashboardPendingRegistration {
  memberId: number;
  fullName: string;
  mobileNumber: string;
  groceryCardNumber: string | null;
  liquorCardNumber: string | null;
  registrationStatus: string;
}

export interface DashboardActivity {
  id: number;
  actor: string;
  action: string;
  details: string;
  createdAt: string;
}

export interface DashboardChartPoint {
  label: string;
  value: number;
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

export interface VerificationResponse {
  id: number
  fullName: string
  mobileNumber: string
  groceryCardNumber: string | null
  liquorCardNumber: string | null
  role: string
  verified: boolean
}

export interface LandingPageResponse {
  registeredMembers: number;
  todayBookings: number;
  availableSlots: Slot[];
}
