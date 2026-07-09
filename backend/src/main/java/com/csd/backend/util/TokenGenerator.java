package com.csd.backend.util;

import com.csd.backend.entity.Booking;
import com.csd.backend.entity.CardType;
import com.csd.backend.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.text.DecimalFormat;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
@RequiredArgsConstructor
public class TokenGenerator {

    private final BookingRepository bookingRepository;
    private final ConcurrentHashMap<String, AtomicInteger> counters = new ConcurrentHashMap<>();

    public String generateToken(CardType cardType, Long slotId) {

        String prefix = (cardType == CardType.GROCERY) ? "G" : "L";

        String slot = String.format("S%02d", slotId);

        AtomicInteger counter = counters.computeIfAbsent(
                prefix + slot,
                k -> {
                    String tokenPrefix = prefix + "-" + slot + "-";
                    List<Booking> bookings = bookingRepository.findByTokenStartingWith(tokenPrefix);
                    int maxVal = 0;
                    for (Booking b : bookings) {
                        try {
                            String t = b.getToken();
                            if (t != null && t.startsWith(tokenPrefix)) {
                                String suffix = t.substring(tokenPrefix.length());
                                int val = Integer.parseInt(suffix.trim());
                                if (val > maxVal) {
                                    maxVal = val;
                                }
                            }
                        } catch (Exception e) {
                            // ignore malformed tokens
                        }
                    }
                    return new AtomicInteger(maxVal);
                }
        );

        String finalToken;
        int maxAttempts = 100;
        do {
            String queue = new DecimalFormat("000")
                    .format(counter.incrementAndGet());
            finalToken = prefix + "-" + slot + "-" + queue;
            maxAttempts--;
        } while (bookingRepository.findByToken(finalToken).isPresent() && maxAttempts > 0);

        return finalToken;
    }
}