package com.csd.backend.controller;

import com.csd.backend.dto.OperatorSearchResponse;
import com.csd.backend.entity.Booking;
import com.csd.backend.service.OperatorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/operator")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class OperatorController {

    private final OperatorService operatorService;

    //Today's Queue
    @GetMapping("/queue")
    public ResponseEntity<List<Booking>> getQueue() {

        return ResponseEntity.ok(
                operatorService.getQueue()
        );
    }

    //Manual Search & QR Search
    @GetMapping("/search")
    public ResponseEntity<OperatorSearchResponse> searchBooking(

            @RequestParam(required = false) String token,

            @RequestParam(required = false) String mobileNumber,

            @RequestParam(required = false) String cardNumber
    ) {

        return ResponseEntity.ok(
                operatorService.searchBooking(
                        token,
                        mobileNumber,
                        cardNumber
                )
        );
    }

    //Search Booking By Token (Used by QR Scanner)
    @GetMapping("/booking/{token}")
    public ResponseEntity<Booking> getBooking(
            @PathVariable String token) {

        return ResponseEntity.ok(
                operatorService.getBookingByToken(token)
        );
    }

    //Check In
    @PostMapping("/check-in/{bookingId}")
    public ResponseEntity<Booking> checkIn(
            @PathVariable Long bookingId) {

        return ResponseEntity.ok(
                operatorService.checkIn(bookingId)
        );
    }

    //Check Out
    @PostMapping("/check-out/{bookingId}")
    public ResponseEntity<Booking> checkOut(
            @PathVariable Long bookingId) {

        return ResponseEntity.ok(
                operatorService.checkOut(bookingId)
        );
    }

    //Cancel Booking
    @PostMapping("/cancel/{bookingId}")
    public ResponseEntity<Booking> cancelBooking(
            @PathVariable Long bookingId) {

        return ResponseEntity.ok(
                operatorService.cancel(bookingId)
        );
    }
}