package com.csd.backend.dto;

public record AuthResponse(

        String token,
        String role,
        String username,
        Long memberId,
        String fullName

) {
}