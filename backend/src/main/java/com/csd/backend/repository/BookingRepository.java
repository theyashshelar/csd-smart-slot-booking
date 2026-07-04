package com.csd.backend.repository;

import com.csd.backend.entity.Booking;
import com.csd.backend.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    boolean existsByMemberIdAndBookingDate(
            Long memberId,
            LocalDate bookingDate
    );

    List<Booking> findByBookingDate(LocalDate bookingDate);

    List<Booking> findByBookingDateBetween(
            LocalDate startDate,
            LocalDate endDate
    );

    Optional<Booking> findByToken(String token);

    List<Booking> findByStatus(BookingStatus status);

    List<Booking> findByMemberIdOrderByBookingDateDesc(Long memberId);

    List<Booking> findByMemberMobileNumberOrderByBookingDateDesc(
            String mobileNumber
    );

    List<Booking> findBySlotId(Long slotId);

    List<Booking> findBySlotIdAndBookingDate(
            Long slotId,
            LocalDate bookingDate
    );

    List<Booking> findByBookingDateAndSlotId(
            LocalDate bookingDate,
            Long slotId
    );

    long countByBookingDate(LocalDate bookingDate);

    long countByStatus(BookingStatus status);

    List<Booking> findByBookingDateAndStatus(
            LocalDate bookingDate,
            BookingStatus status
    );
}