package com.csd.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record UpdateCustomerProfileRequest(

        @NotBlank(message = "Full name is required.")
        String fullName,

        @NotBlank(message = "Mobile number is required.")
        @Pattern(regexp = "^[6-9]\\d{9}$",
                message = "Invalid mobile number.")
        String mobileNumber

) {
}