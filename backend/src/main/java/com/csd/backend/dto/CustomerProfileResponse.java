package com.csd.backend.dto;

import com.csd.backend.entity.RegistrationStatus;
import lombok.Builder;

import java.time.LocalDate;

@Builder
public record CustomerProfileResponse(

        Long id,

        String fullName,

        String mobileNumber,

        LocalDate dateOfBirth,

        String groceryCardNumber,

        String liquorCardNumber,

        RegistrationStatus registrationStatus,

        java.time.Instant registrationDate

) {
}