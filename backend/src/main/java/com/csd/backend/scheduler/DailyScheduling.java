package com.csd.backend.scheduler;

import com.csd.backend.entity.Booking;
import com.csd.backend.entity.BookingStatus;
import com.csd.backend.repository.BookingRepository;
import com.csd.backend.service.SmsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DailyScheduling {

    private final BookingRepository bookingRepository;
    private final SmsService smsService;

    /**
     * Runs every midnight
     */
    @Scheduled(cron = "0 0 0 * * *")
    public void dailyMaintenance() {

        log.info("Running Daily Maintenance...");

        long todayBookings =
                bookingRepository.findByBookingDate(LocalDate.now()).size();

        log.info("Today's Bookings : {}", todayBookings);

        log.info("Daily Maintenance Completed.");
    }

    /**
     * Runs every 30 minutes
     */
    @Scheduled(cron = "0 */30 * * * *")
    public void sendReminders() {

        log.info("Checking Reminder SMS...");

        List<Booking> bookings =
                bookingRepository.findByStatus(BookingStatus.BOOKED);

        for (Booking booking : bookings) {

            if (booking.getSlot() == null)
                continue;

            LocalDateTime slotTime =
                    LocalDateTime.of(
                            booking.getBookingDate(),
                            LocalTime.parse(booking.getSlot().getStartTime())
                    );

            if (slotTime.isAfter(LocalDateTime.now())
                    && slotTime.minusMinutes(30)
                    .isBefore(LocalDateTime.now())) {

                smsService.sendReminder(booking);
            }
        }

        log.info("Reminder Scheduler Finished.");
    }
}