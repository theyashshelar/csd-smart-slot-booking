package com.csd.backend.service;

import com.csd.backend.entity.AuditLog;
import com.csd.backend.entity.Booking;
import com.csd.backend.entity.BookingStatus;
import com.csd.backend.repository.AuditLogRepository;
import com.csd.backend.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OperatorService {

    private final BookingRepository bookingRepository;
    private final AuditLogRepository auditLogRepository;

    /**
     * Today's Queue
     */
    public List<Booking> getQueue() {

        return bookingRepository.findByStatus(
                BookingStatus.BOOKED
        );
    }

    /**
     * Search Booking by Token
     */
    public Booking getBookingByToken(String token) {

        return bookingRepository.findByToken(token)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Booking not found"));
    }
    /**
     * Check In
     */
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

        Booking savedBooking =
                bookingRepository.save(booking);

        auditLogRepository.save(
                log(
                        "OPERATOR",
                        "CHECK_IN",
                        booking.getToken()
                )
        );

        return savedBooking;
    }

    /**
     * Check Out
     */
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

        Booking savedBooking =
                bookingRepository.save(booking);

        auditLogRepository.save(
                log(
                        "OPERATOR",
                        "CHECK_OUT",
                        booking.getToken()
                )
        );

        return savedBooking;
    }
    /**
     * Cancel Booking
     */
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

        booking.setStatus(BookingStatus.CANCELLED);

        Booking savedBooking =
                bookingRepository.save(booking);

        auditLogRepository.save(
                log(
                        "OPERATOR",
                        "CANCEL_BOOKING",
                        booking.getToken()
                )
        );

        return savedBooking;
    }

    /**
     * Audit Log
     */
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