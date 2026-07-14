package com.csd.backend.dto;

import com.csd.backend.entity.CardType;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record BookingRequest(

    @NotNull
    Long memberId,

    @NotNull
    Long slotId,

    @NotNull
    CardType cardType,

    LocalDate bookingDate

) {
}
