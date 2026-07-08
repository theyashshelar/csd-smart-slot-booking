package com.csd.backend.util;

import com.csd.backend.entity.CardType;
import org.springframework.stereotype.Component;

import java.text.DecimalFormat;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class TokenGenerator {

    private final ConcurrentHashMap<String, AtomicInteger> counters = new ConcurrentHashMap<>();

    public String generateToken(CardType cardType, Long slotId) {

        String prefix = (cardType == CardType.GROCERY) ? "G" : "L";

        String slot = String.format("S%02d", slotId);

        AtomicInteger counter = counters.computeIfAbsent(
                prefix + slot,
                k -> new AtomicInteger(0)
        );

        String queue = new DecimalFormat("000")
                .format(counter.incrementAndGet());

        return prefix + "-" + slot + "-" + queue;
    }
}