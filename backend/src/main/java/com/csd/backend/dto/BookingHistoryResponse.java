package com.csd.backend.dto;

import com.csd.backend.entity.BookingStatus;
import com.csd.backend.entity.CardType;
import lombok.Builder;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Builder
public record BookingHistoryResponse(

        Long bookingId,

        LocalDate bookingDate,

        String token,

        CardType cardType,

        String slot,

        BookingStatus status,

        LocalDateTime checkedInAt,

        LocalDateTime checkedOutAt

) {
}