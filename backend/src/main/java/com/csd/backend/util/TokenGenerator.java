package com.csd.backend.util;

import com.csd.backend.entity.Booking;
import com.csd.backend.entity.CardType;
import com.csd.backend.entity.Slot;
import com.csd.backend.repository.BookingRepository;
import com.csd.backend.repository.SlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.text.DecimalFormat;
import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class TokenGenerator {

    private final BookingRepository bookingRepository;
    private final SlotRepository slotRepository;
    private final ConcurrentHashMap<String, AtomicInteger> counters = new ConcurrentHashMap<>();

    public String generateToken(CardType cardType, Long slotId, LocalDate bookingDate) {

        String prefix = (cardType == CardType.GROCERY) ? "G" : "L";

        // Determine the 1-based index of this slot among active/all slots of this cardType
        List<Slot> allSlotsOfCardType = slotRepository.findAll().stream()
                .filter(s -> s.getCardType() == cardType)
                .sorted((s1, s2) -> {
                    int comp = s1.getStartTime().compareTo(s2.getStartTime());
                    if (comp != 0) return comp;
                    return s1.getId().compareTo(s2.getId());
                })
                .collect(Collectors.toList());

        int slotIndex = 1;
        for (int i = 0; i < allSlotsOfCardType.size(); i++) {
            if (allSlotsOfCardType.get(i).getId().equals(slotId)) {
                slotIndex = i + 1;
                break;
            }
        }

        String slot = String.format("S%02d", slotIndex);
        String counterKey = bookingDate.toString() + "_" + prefix + "_" + slot;

        AtomicInteger counter = counters.computeIfAbsent(
                counterKey,
                k -> {
                    String tokenPrefix = prefix + "-" + slot + "-";
                    List<Booking> bookings = bookingRepository.findByBookingDate(bookingDate);
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