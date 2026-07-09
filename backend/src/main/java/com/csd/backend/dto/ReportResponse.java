package com.csd.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponse {

    private String period;

    private long totalBookings;

    private long checkedIn;

    private long checkedOut;

    private long cancelled;

    private long activeMembers;

    private long totalMembers;

    private long totalSlots;

    private long bookedSlots;

    private long availableSlots;

    private double occupancyPercentage;
}