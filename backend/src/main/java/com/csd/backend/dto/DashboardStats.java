package com.csd.backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record DashboardStats(

        long todayVisitors,
        long registeredMembers,
        long bookings,
        long checkedIn,
        long checkedOut,
        long cancelled,
        long activeMembers,
        long pendingRegistrations,
        long rejectedRegistrations,
        long availableSlots,
        long totalSlots,
        long groceryAvailable,
        long liquorAvailable,
        long groceryBookings,
        long liquorBookings,
        List<BookingSummary> recentBookings,
        List<PendingRegistrationSummary> pendingRegistrationList,
        List<ActivitySummary> recentAdminActivities,
        List<ChartPoint> weeklyBookings,
        List<ChartPoint> monthlyBookings,
        List<ChartPoint> cardUsage,
        List<ChartPoint> peakBookingHours

) {
    public record BookingSummary(
            Long bookingId,
            LocalDate bookingDate,
            String token,
            String memberName,
            String cardType,
            String slot,
            String status
    ) {
    }

    public record PendingRegistrationSummary(
            Long memberId,
            String fullName,
            String mobileNumber,
            String groceryCardNumber,
            String liquorCardNumber,
            String registrationStatus
    ) {
    }

    public record ActivitySummary(
            Long id,
            String actor,
            String action,
            String details,
            LocalDateTime createdAt
    ) {
    }

    public record ChartPoint(
            String label,
            long value
    ) {
    }
}
