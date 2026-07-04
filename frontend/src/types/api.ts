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
  id: number;
  token?: string | null;
  bookingDate?: string | null;
  bookingLabel?: string | null;
  smsStatus?: string | null;
  status?: string | null;
  remarks?: string | null;
  createdAt?: string | null;
  checkedInAt?: string | null;
  checkedOutAt?: string | null;
  member?: Member;
  slot?: Slot;
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
