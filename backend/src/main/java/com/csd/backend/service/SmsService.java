package com.csd.backend.service;

import com.csd.backend.entity.Booking;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class SmsService {

    private final RestTemplate restTemplate;

    @Value("${sms.auth.key}")
    private String authKey;

    @Value("${sms.template.id}")
    private String templateId;

    @Value("${sms.sender}")
    private String sender;

    private static final String MSG91_URL =
            "https://control.msg91.com/api/v5/flow/";

    public void sendBookingConfirmation(Booking booking) {

        try {

            HttpHeaders headers = new HttpHeaders();

            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("authkey", authKey);

            Map<String, Object> body = Map.of(
                    "template_id", templateId,
                    "sender", sender,
                    "mobiles", "91" + booking.getMember().getMobileNumber(),
                    "token", booking.getToken(),
                    "date", booking.getBookingDate().toString(),
                    "slot",
                    booking.getSlot().getStartTime() + " - "
                            + booking.getSlot().getEndTime()
            );

            HttpEntity<Map<String, Object>> request =
                    new HttpEntity<>(body, headers);

            restTemplate.postForEntity(
                    MSG91_URL,
                    request,
                    String.class
            );

            booking.setSmsStatus("SENT");

            log.info("SMS sent to {}", booking.getMember().getMobileNumber());

        } catch (Exception ex) {

            booking.setSmsStatus("FAILED");

            log.error("SMS sending failed", ex);
        }
    }

    public void sendReminder(Booking booking) {

        log.info("Reminder SMS : {}", booking.getToken());
    }

    public void sendCancellation(Booking booking) {

        log.info("Cancellation SMS : {}", booking.getToken());
    }
}