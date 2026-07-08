package com.csd.backend.dto;

import lombok.Builder;

@Builder
public record SystemSettingsResponse(

        boolean bookingEnabled,

        int bookingWindowDays,

        boolean groceryAvailable,

        boolean liquorAvailable,

        int maxBookingPerDay,

        boolean cancellationEnabled,

        int cancellationHours

) {
}