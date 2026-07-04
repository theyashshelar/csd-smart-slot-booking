package com.csd.backend.service;

import com.csd.backend.entity.*;
import com.csd.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final OperatorRepository operatorRepository;
    private final MemberRepository memberRepository;
    private final SlotRepository slotRepository;
    private final SettingsRepository settingsRepository;

    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {

        seedAdmin();
        seedOperator();
        seedMembers();
        seedSlots();
        seedSettings();

        System.out.println("=======================================");
        System.out.println(" Initial Data Loaded Successfully");
        System.out.println("=======================================");
    }

    private void seedAdmin() {

        if (adminRepository.count() > 0)
            return;

        Admin admin = new Admin();

        admin.setUsername("admin");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setFullName("System Administrator");
        admin.setEmail("admin@csd.in");
        admin.setRole(Role.ADMIN);

        adminRepository.save(admin);
    }

    private void seedOperator() {

        if (operatorRepository.count() > 0)
            return;

        Operator operator = new Operator();

        operator.setOperatorId("OP001");
        operator.setPassword(passwordEncoder.encode("operator123"));
        operator.setFullName("Main Operator");
        operator.setRole(Role.OPERATOR);
        operator.setActive(true);

        operatorRepository.save(operator);
    }

    private void seedMembers() {

        if (memberRepository.count() > 0)
            return;

        for (int i = 1; i <= 5; i++) {

            Member member = new Member();

            member.setFullName("Member " + i);
            member.setMobileNumber("987654321" + i);
            member.setDateOfBirth(java.time.LocalDate.of(1995, 1, i));

            member.setPassword(
                    passwordEncoder.encode("member123")
            );

            member.setGroceryCardNumber("GRC100" + i);
            member.setLiquorCardNumber("LQC100" + i);

            member.setRole(Role.CUSTOMER);
            member.setRegistrationStatus(
                    RegistrationStatus.APPROVED
            );

            memberRepository.save(member);
        }
    }

    private void seedSlots() {

        if (slotRepository.count() > 0)
            return;

        // Grocery Slots
        createSlot(CardType.GROCERY, "09:00-10:00", "09:00", "10:00");
        createSlot(CardType.GROCERY, "10:00-11:00", "10:00", "11:00");
        createSlot(CardType.GROCERY, "11:00-12:00", "11:00", "12:00");

        // Liquor Slots
        createSlot(CardType.LIQUOR, "12:00-01:00", "12:00", "13:00");
        createSlot(CardType.LIQUOR, "02:00-03:00", "14:00", "15:00");
    }

    private void createSlot(
            CardType cardType,
            String label,
            String start,
            String end) {

        Slot slot = new Slot();

        slot.setCardType(cardType);
        slot.setLabel(label);
        slot.setStartTime(start);
        slot.setEndTime(end);
        slot.setCapacity(30);
        slot.setBookedCount(0);
        slot.setActive(true);

        slotRepository.save(slot);
    }

    private void seedSettings() {

        if (settingsRepository.count() > 0)
            return;

        Settings prefix = new Settings();
        prefix.setKeyName("tokenPrefix");
        prefix.setSettingValue("G");

        settingsRepository.save(prefix);
    }

}