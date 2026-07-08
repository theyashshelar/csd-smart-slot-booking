package com.csd.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerificationResponse {

    private Long id;

    private String fullName;

    private String mobileNumber;

    private String groceryCardNumber;

    private String liquorCardNumber;

    private String role;

    private boolean verified;
}