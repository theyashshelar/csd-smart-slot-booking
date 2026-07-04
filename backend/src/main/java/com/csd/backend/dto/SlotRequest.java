package com.csd.backend.dto;

import com.csd.backend.entity.CardType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SlotRequest(

        @NotBlank
        String label,

        @NotNull
        CardType cardType,

        @NotBlank
        String startTime,

        @NotBlank
        String endTime,

        @NotNull
        @Min(1)
        Integer capacity

) {}