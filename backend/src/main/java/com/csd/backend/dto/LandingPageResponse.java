package com.csd.backend.dto;

import com.csd.backend.entity.Slot;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LandingPageResponse {

    private long registeredMembers;

    private long todayBookings;

    private List<Slot> availableSlots;

    private Map<String, String> settings;

}