package com.csd.backend.service;

import com.csd.backend.dto.ReportResponse;
import com.csd.backend.entity.Booking;
import com.csd.backend.entity.BookingStatus;
import com.csd.backend.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final BookingRepository bookingRepository;

    public ReportResponse getReport(String period) {

        LocalDate date;

        switch (period.toLowerCase()) {

            case "yesterday":
                date = LocalDate.now().minusDays(1);
                break;

            case "today":
            default:
                date = LocalDate.now();
                break;
        }

        List<Booking> bookings =
                bookingRepository.findByBookingDate(date);

        long totalBookings = bookings.size();

        long checkedIn = bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CHECKED_IN)
                .count();

        long checkedOut = bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CHECKED_OUT)
                .count();

        long cancelled = bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CANCELLED)
                .count();

        return ReportResponse.builder()
                .period(period)
                .totalBookings(totalBookings)
                .checkedIn(checkedIn)
                .checkedOut(checkedOut)
                .cancelled(cancelled)
                .build();
    }

    public ReportResponse getTodayReport() {
        return getReport("today");
    }

    public ReportResponse getYesterdayReport() {
        return getReport("yesterday");
    }
}