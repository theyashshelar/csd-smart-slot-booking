package com.csd.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VerificationRequest {

        @NotBlank(message = "Mobile Number is required")
        private String mobileNumber;
}