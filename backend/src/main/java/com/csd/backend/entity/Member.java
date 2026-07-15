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
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true, length = 50)
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

    public String getMobileNumber() {
        if (mobileNumber != null && mobileNumber.contains("_REJ_")) {
            return mobileNumber.split("_REJ_")[0];
        }
        return mobileNumber;
    }

    public String getGroceryCardNumber() {
        if (groceryCardNumber != null && groceryCardNumber.contains("_REJ_")) {
            return groceryCardNumber.split("_REJ_")[0];
        }
        return groceryCardNumber;
    }

    public String getLiquorCardNumber() {
        if (liquorCardNumber != null && liquorCardNumber.contains("_REJ_")) {
            return liquorCardNumber.split("_REJ_")[0];
        }
        return liquorCardNumber;
    }

}