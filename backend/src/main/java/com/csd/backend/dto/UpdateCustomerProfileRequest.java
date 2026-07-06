package com.csd.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateCustomerProfileRequest(

        @NotBlank
        String fullName,

        @NotBlank
        String mobileNumber

) {
}