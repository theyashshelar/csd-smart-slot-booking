package com.csd.backend.dto;

import com.csd.backend.entity.CardType;
import jakarta.validation.constraints.NotNull;

public record BookingRequest(

        @NotNull
        Long memberId,

        @NotNull
        Long slotId,

        @NotNull
        CardType cardType

) {
}