package com.csd.backend.dto;

public record DashboardStats(

        long todayVisitors,
        long registeredMembers,
        long bookings,
        long checkedIn,
        long checkedOut,
        long cancelled

) {
}