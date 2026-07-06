package com.csd.backend.service;

import com.csd.backend.dto.OperatorSearchResponse;
import com.csd.backend.entity.AuditLog;
import com.csd.backend.entity.Booking;
import com.csd.backend.entity.BookingStatus;
import com.csd.backend.entity.Slot;
import com.csd.backend.repository.AuditLogRepository;
import com.csd.backend.repository.BookingRepository;
import com.csd.backend.repository.SlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OperatorService {

    private final BookingRepository bookingRepository;
    private final AuditLogRepository auditLogRepository;
    private final SlotRepository slotRepository;

    // Today's Queue
    public List<Booking> getQueue() {

        return bookingRepository.findByStatus(
                BookingStatus.BOOKED
        );
    }

    // Search Booking (Manual + QR)
    public OperatorSearchResponse searchBooking(
            String token,
            String mobileNumber,
            String cardNumber
    ) {

        Optional<Booking> booking = Optional.empty();

        if (token != null && !token.isBlank()) {

            booking = bookingRepository.findFirstByToken(token);

        } else if (mobileNumber != null && !mobileNumber.isBlank()) {

            booking = bookingRepository
                    .findFirstByMemberMobileNumberOrderByBookingDateDesc(
                            mobileNumber
                    );

        } else if (cardNumber != null && !cardNumber.isBlank()) {

            booking = bookingRepository
                    .findFirstByMemberGroceryCardNumberOrderByBookingDateDesc(
                            cardNumber
                    );

            if (booking.isEmpty()) {

                booking = bookingRepository
                        .findFirstByMemberLiquorCardNumberOrderByBookingDateDesc(
                                cardNumber
                        );
            }
        }

        Booking result = booking.orElseThrow(
                () -> new IllegalArgumentException("Booking not found.")
        );

        return OperatorSearchResponse.builder()
                .bookingId(result.getId())
                .memberName(result.getMember().getFullName())
                .mobileNumber(result.getMember().getMobileNumber())
                .groceryCardNumber(result.getMember().getGroceryCardNumber())
                .liquorCardNumber(result.getMember().getLiquorCardNumber())
                .token(result.getToken())
                .slotLabel(result.getSlot().getLabel())
                .status(result.getStatus())
                .bookingType(result.getSlot().getCardType().name())
                .build();
    }

    // Search Booking by Token
    public Booking getBookingByToken(String token) {

        return bookingRepository.findByToken(token)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Booking not found"));
    }

    // Check In
    @Transactional
    public Booking checkIn(Long bookingId) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Booking not found"));

        if (booking.getStatus() != BookingStatus.BOOKED) {
            throw new IllegalStateException(
                    "Booking already processed");
        }

        booking.setStatus(BookingStatus.CHECKED_IN);
        booking.setCheckedInAt(LocalDateTime.now());

        Booking savedBooking = bookingRepository.save(booking);

        auditLogRepository.save(
                log(
                        "OPERATOR",
                        "CHECK_IN",
                        booking.getToken()
                )
        );

        return savedBooking;
    }

    // Check Out
    @Transactional
    public Booking checkOut(Long bookingId) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Booking not found"));

        if (booking.getStatus() != BookingStatus.CHECKED_IN) {
            throw new IllegalStateException(
                    "Customer has not checked in");
        }

        booking.setStatus(BookingStatus.CHECKED_OUT);
        booking.setCheckedOutAt(LocalDateTime.now());

        Booking savedBooking = bookingRepository.save(booking);

        auditLogRepository.save(
                log(
                        "OPERATOR",
                        "CHECK_OUT",
                        booking.getToken()
                )
        );

        return savedBooking;
    }

    // Cancel Booking
    @Transactional
    public Booking cancel(Long bookingId) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Booking not found"));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalStateException(
                    "Booking already cancelled");
        }

        if (booking.getStatus() == BookingStatus.CHECKED_OUT) {
            throw new IllegalStateException(
                    "Checked out booking cannot be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);

        Slot slot = booking.getSlot();

        if (slot.getBookedCount() > 0) {
            slot.setBookedCount(slot.getBookedCount() - 1);
            slotRepository.save(slot);
        }

        Booking savedBooking = bookingRepository.save(booking);

        auditLogRepository.save(
                log(
                        "OPERATOR",
                        "CANCEL_BOOKING",
                        booking.getToken()
                )
        );

        return savedBooking;
    }

    // Audit Log
    private AuditLog log(
            String actor,
            String action,
            String details) {

        AuditLog auditLog = new AuditLog();

        auditLog.setActor(actor);
        auditLog.setAction(action);
        auditLog.setDetails(details);

        return auditLog;
    }
}