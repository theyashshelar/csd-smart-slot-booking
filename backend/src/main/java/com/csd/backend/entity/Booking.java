package com.csd.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "slot_id", nullable = false)
    private Slot slot;

    @Column(nullable = false, unique = true)
    private String token;

    @Column(nullable = false)
    private LocalDate bookingDate;

    private String bookingLabel;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private BookingStatus status = BookingStatus.BOOKED;

    @Builder.Default
    private String smsStatus = "PENDING";

    private LocalDateTime createdAt;

    private LocalDateTime checkedInAt;

    private LocalDateTime checkedOutAt;

    private String remarks;

    @PrePersist
    public void prePersist() {

        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }

        if (bookingDate == null) {
            bookingDate = LocalDate.now();
        }
    }

    @Transient
    public Long getVisitDurationMinutes() {

        if (checkedInAt == null || checkedOutAt == null) {
            return null;
        }

        return Duration.between(
                checkedInAt,
                checkedOutAt
        ).toMinutes();
    }
}