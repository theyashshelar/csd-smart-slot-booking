package com.csd.backend.dto;

import com.csd.backend.entity.Slot;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class LandingPageResponse {

    private long registeredMembers;

    private long todayBookings;

    private List<Slot> availableSlots;

}