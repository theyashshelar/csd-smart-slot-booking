package com.csd.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequest {

    private String fullName;

    private String mobileNumber;

    private LocalDate dateOfBirth;

    private String password;

    private String confirmPassword;

    private String groceryCardNumber;

    private String liquorCardNumber;
}
