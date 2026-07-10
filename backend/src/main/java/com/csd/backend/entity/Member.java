package com.csd.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "members")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Member {

    @Id
    // GenerationType.IDENTITY uses PostgreSQL's underlying IDENTITY column / sequence.
    // PostgreSQL sequences are not transaction-bound and do not roll back upon transaction failure,
    // nor do they automatically reset when rows are cleared via DELETE. This guarantees non-blocking,
    // safe concurrent sequence allocation, and is correct and expected production behavior.
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true, length = 10)
    private String mobileNumber;

    @Column(nullable = false)
    private LocalDate dateOfBirth;

    @Column(nullable = false)
    private String password;

    @Column(unique = true)
    private String groceryCardNumber;

    @Column(unique = true)
    private String liquorCardNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private RegistrationStatus registrationStatus = RegistrationStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Role role = Role.CUSTOMER;

    @Column(name = "registration_date")
    private java.time.LocalDateTime registrationDate;

}