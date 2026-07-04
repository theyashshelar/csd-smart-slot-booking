package com.csd.backend.controller;

import com.csd.backend.dto.BookingRequest;
import com.csd.backend.dto.VerificationRequest;
import com.csd.backend.dto.VerificationResponse;
import com.csd.backend.entity.Booking;
import com.csd.backend.entity.CardType;
import com.csd.backend.entity.Slot;
import com.csd.backend.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class CustomerController {

    private final CustomerService customerService;

    //Verify Booking
    @PostMapping("/verify")
    public ResponseEntity<VerificationResponse> verifyMember(
            @Valid @RequestBody VerificationRequest request) {

        return ResponseEntity.ok(
                customerService.verifyMember(request)
        );
    }

    //Available Slots
    @GetMapping("/slots/{cardType}")
    public ResponseEntity<List<Slot>> getAvailableSlots(
            @PathVariable CardType cardType) {

        return ResponseEntity.ok(
                customerService.getAvailableSlots(cardType)
        );
    }

    //Book Slots
    @PostMapping("/book")
    public ResponseEntity<Booking> createBooking(
            @Valid @RequestBody BookingRequest request) {

        return ResponseEntity.ok(
                customerService.createBooking(request)
        );
    }

    //Booking History
    @GetMapping("/history/{memberId}")
    public ResponseEntity<List<Booking>> getBookingHistory(
            @PathVariable Long memberId) {

        return ResponseEntity.ok(
                customerService.getBookingsForMember(memberId)
        );
    }

    //Track Booking
    @GetMapping("/track/{mobileNumber}")
    public ResponseEntity<List<Booking>> trackBookings(
            @PathVariable String mobileNumber) {

        return ResponseEntity.ok(
                customerService.trackBookings(mobileNumber)
        );
    }
}