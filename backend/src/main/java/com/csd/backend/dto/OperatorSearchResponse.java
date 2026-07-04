package com.csd.backend.dto;

import com.csd.backend.entity.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OperatorSearchResponse {

    private Long bookingId;

    private String memberName;

    private String mobileNumber;

    private String groceryCardNumber;

    private String liquorCardNumber;

    private String token;

    private String slotLabel;

    private BookingStatus status;

    private String bookingType;
}