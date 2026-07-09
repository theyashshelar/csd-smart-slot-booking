package com.csd.backend.controller;

import com.csd.backend.dto.*;
import com.csd.backend.entity.Booking;
import com.csd.backend.entity.CardType;
import com.csd.backend.entity.Slot;
import com.csd.backend.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
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
            @PathVariable CardType cardType,
            @RequestParam(required = false) LocalDate bookingDate) {

        return ResponseEntity.ok(
                customerService.getAvailableSlots(cardType, bookingDate)
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
    public ResponseEntity<List<BookingHistoryResponse>> getBookingHistory(
            @PathVariable Long memberId) {

        return ResponseEntity.ok(
                customerService.getBookingsForMember(memberId)
        );
    }

    //Track Booking
    @GetMapping("/track/{mobileNumber}")
    public ResponseEntity<List<BookingHistoryResponse>> trackBookings(
            @PathVariable String mobileNumber) {

        return ResponseEntity.ok(
                customerService.trackBookings(mobileNumber)
        );
    }

    //Get Customer Profile
    @GetMapping("/profile/{memberId}")
    public ResponseEntity<CustomerProfileResponse> getProfile(
            @PathVariable Long memberId) {

        return ResponseEntity.ok(
                customerService.getProfile(memberId)
        );
    }

    //Update Customer Profile
    @PutMapping("/profile/{memberId}")
    public ResponseEntity<CustomerProfileResponse> updateProfile(
            @PathVariable Long memberId,
            @Valid @RequestBody UpdateCustomerProfileRequest request) {

        return ResponseEntity.ok(
                customerService.updateProfile(memberId, request)
        );
    }

    //Change Password
    @PutMapping("/change-password/{memberId}")
    public ResponseEntity<String> changePassword(
            @PathVariable Long memberId,
            @Valid @RequestBody ChangePasswordRequest request) {

        customerService.changePassword(memberId, request);

        return ResponseEntity.ok("Password changed successfully.");
    }

    //Landing Page
    @GetMapping("/landing")
    public ResponseEntity<LandingPageResponse> landing() {

        return ResponseEntity.ok(
                customerService.getLandingData()
        );

    }
}
