package com.csd.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record MemberRequest(

        @NotBlank
        String fullName,

        @NotBlank
        String mobileNumber,

        @NotNull
        LocalDate dateOfBirth,

        @NotBlank
        String password,

        String groceryCardNumber,

        String liquorCardNumber

) {
}