package com.csd.backend.service;

import com.csd.backend.dto.*;
import com.csd.backend.entity.*;
import com.csd.backend.exception.BadRequestException;
import com.csd.backend.repository.AuditLogRepository;
import com.csd.backend.repository.BookingRepository;
import com.csd.backend.repository.MemberRepository;
import com.csd.backend.repository.SlotRepository;
import com.csd.backend.repository.SettingsRepository;
import com.csd.backend.util.QRCodeGenerator;
import com.csd.backend.util.TokenGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final MemberRepository memberRepository;
    private final SlotRepository slotRepository;
    private final BookingRepository bookingRepository;
    private final AuditLogRepository auditLogRepository;
    private final SettingsRepository settingsRepository;
    private final SmsService smsService;
    private final QRCodeGenerator qrCodeGenerator;
    private final TokenGenerator tokenGenerator;
    private final PasswordEncoder passwordEncoder;

    //Password Validation for Update Password
    @Transactional
    public void changePassword(Long memberId,
                               ChangePasswordRequest request) {

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Member not found"));

        // Old password validation
        if (!passwordEncoder.matches(
                request.oldPassword(),
                member.getPassword())) {

            throw new IllegalArgumentException(
                    "Old password is incorrect."
            );
        }

        // New password validation
        if (!request.newPassword().equals(request.confirmPassword())) {

            throw new IllegalArgumentException(
                    "New password and confirm password do not match."
            );
        }

        // Save new password
        member.setPassword(
                passwordEncoder.encode(request.newPassword())
        );

        memberRepository.save(member);

        auditLogRepository.save(
                log(
                        member.getMobileNumber(),
                        "CHANGE_PASSWORD",
                        "Customer changed password"
                )
        );
    }


    //Verify Member
    public VerificationResponse verifyMember(VerificationRequest request) {

        Member member = memberRepository
                .findByMobileNumber(request.getMobileNumber())
                .orElseThrow(() ->
                        new IllegalArgumentException("Member not found."));

        return VerificationResponse.builder()
                .id(member.getId())
                .fullName(member.getFullName())
                .mobileNumber(member.getMobileNumber())
                .groceryCardNumber(member.getGroceryCardNumber())
                .liquorCardNumber(member.getLiquorCardNumber())
                .role(member.getRole().name())
                .verified(true)
                .build();
    }

    private boolean isHolidayOrDisabled(LocalDate date) {
        // 1. Check booking enabled
        boolean bookingEnabled = settingsRepository.findByKeyName("BOOKING_ENABLED")
                .map(Settings::getSettingValue)
                .map(Boolean::parseBoolean)
                .orElse(true);
        if (!bookingEnabled) {
            return true;
        }

        // 2. Check weekly holidays
        String weeklyHolidays = settingsRepository.findByKeyName("weeklyHolidays")
                .map(Settings::getSettingValue)
                .orElse("Sunday");
        String dayOfWeek = date.getDayOfWeek().getDisplayName(java.time.format.TextStyle.FULL, java.util.Locale.ENGLISH);
        boolean isWeeklyHoliday = java.util.Arrays.stream(weeklyHolidays.split(","))
                .map(String::trim)
                .anyMatch(day -> day.equalsIgnoreCase(dayOfWeek));
        if (isWeeklyHoliday) {
            return true;
        }

        // 3. Check special holidays
        String specialHolidaysSetting = settingsRepository.findByKeyName("specialHolidays")
                .map(Settings::getSettingValue)
                .orElse("");
        boolean isSpecialHoliday = java.util.Arrays.stream(specialHolidaysSetting.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .anyMatch(dateStr -> {
                    try {
                        return LocalDate.parse(dateStr).equals(date);
                    } catch (Exception e) {
                        return false;
                    }
                });
        if (isSpecialHoliday) {
            return true;
        }

        return false;
    }

    //Available Slots
    public List<Slot> getAvailableSlots(CardType cardType) {

        return getAvailableSlots(cardType, LocalDate.now());
    }

    public List<Slot> getAvailableSlots(
            CardType cardType,
            LocalDate bookingDate) {

        LocalDate effectiveDate =
                bookingDate != null
                        ? bookingDate
                        : LocalDate.now();

        if (isHolidayOrDisabled(effectiveDate)) {
            return List.of();
        }

        return slotRepository
                .findByCardTypeAndActiveTrueOrderByStartTimeAsc(cardType)
                .stream()
                .map(slot -> {
                    Slot availableSlot = new Slot();

                    availableSlot.setId(slot.getId());
                    availableSlot.setLabel(slot.getLabel());
                    availableSlot.setCardType(slot.getCardType());
                    availableSlot.setStartTime(slot.getStartTime());
                    availableSlot.setEndTime(slot.getEndTime());
                    availableSlot.setCapacity(slot.getCapacity());
                    availableSlot.setActive(slot.getActive());
                    availableSlot.setBookedCount(
                            bookingRepository
                                    .findBySlotIdAndBookingDate(
                                             slot.getId(),
                                             effectiveDate
                                    )
                                    .stream()
                                    .filter(booking ->
                                            booking.getStatus()
                                                    != BookingStatus.CANCELLED)
                                    .toList()
                                    .size()
                    );

                    return availableSlot;
                })
                .toList();
    }

    //Create Booking
    @Transactional
    public Booking createBooking(BookingRequest request) {

        LocalDate bookingDate =
                request.bookingDate() != null
                        ? request.bookingDate()
                        : LocalDate.now();

        if (isHolidayOrDisabled(bookingDate)) {
            throw new BadRequestException(
                    "No slots available today due to holiday."
            );
        }

        if (bookingDate.isBefore(LocalDate.now())) {
            throw new BadRequestException(
                    "Booking date cannot be in the past."
            );
        }

        Member member = memberRepository.findById(request.memberId())
                .orElseThrow(() ->
                        new BadRequestException("Member not found"));

        Slot slot = slotRepository.findById(request.slotId())
                .orElseThrow(() ->
                        new BadRequestException("Slot not found"));

        if (slot.getCardType() != request.cardType()) {
            throw new BadRequestException(
                    "Selected slot does not match card type."
            );
        }

        if (request.cardType() == CardType.GROCERY
                && (member.getGroceryCardNumber() == null
                || member.getGroceryCardNumber().isBlank())) {

            throw new BadRequestException(
                    "No Grocery card is registered for this member."
            );
        }

        if (request.cardType() == CardType.LIQUOR
                && (member.getLiquorCardNumber() == null
                || member.getLiquorCardNumber().isBlank())) {

            throw new BadRequestException(
                    "No Liquor card is registered for this member."
            );
        }

        boolean alreadyBooked = bookingRepository
                .findByMemberIdOrderByBookingDateDesc(member.getId())
                .stream()
                .anyMatch(b -> b.getBookingDate().equals(bookingDate)
                        && b.getSlot().getCardType() == request.cardType()
                        && b.getStatus() != BookingStatus.CANCELLED);

        if (alreadyBooked) {
            String timeRef = bookingDate.equals(LocalDate.now()) ? "today" : "this date";
            throw new BadRequestException(
                    request.cardType() == CardType.GROCERY
                            ? "You have already booked a Grocery slot for " + timeRef + "."
                            : "You have already booked a Liquor slot for " + timeRef + "."
            );
        }

        long bookedForSelectedDate =
                bookingRepository
                        .findBySlotIdAndBookingDate(
                                slot.getId(),
                                bookingDate
                        )
                        .stream()
                        .filter(b -> b.getStatus() != BookingStatus.CANCELLED)
                        .count();

        if (bookedForSelectedDate >= slot.getCapacity()) {
            throw new BadRequestException(
                    "Selected slot is full for this date."
            );
        }

        Booking booking = new Booking();

        booking.setMember(member);
        booking.setSlot(slot);
        booking.setBookingDate(bookingDate);

        // This will compile after TokenGenerator is updated
        booking.setToken(
                tokenGenerator.generateToken(
                        request.cardType(),
                        slot.getId()
                )
        );

        booking.setBookingLabel(slot.getLabel());
        booking.setStatus(BookingStatus.BOOKED);

        Booking savedBooking = bookingRepository.save(booking);

        qrCodeGenerator.generateQRCode(savedBooking.getToken());

        smsService.sendBookingConfirmation(savedBooking);

        if (bookingDate.equals(LocalDate.now())) {
            slot.setBookedCount((int) bookedForSelectedDate + 1);
            slotRepository.save(slot);
        }

        auditLogRepository.save(
                log(
                        member.getMobileNumber(),
                        "BOOK_SLOT",
                        "Booked Slot : " + slot.getLabel()
                )
        );

        return savedBooking;
    }

    //Booking History
    public List<BookingHistoryResponse> getBookingsForMember(Long memberId) {

        return bookingRepository
                .findByMemberIdOrderByBookingDateDesc(memberId)
                .stream()
                .map(booking -> BookingHistoryResponse.builder()
                        .bookingId(booking.getId())
                        .bookingDate(booking.getBookingDate())
                        .token(booking.getToken())
                        .cardType(booking.getSlot().getCardType())
                        .slot(booking.getBookingLabel())
                        .status(booking.getStatus())
                        .checkedInAt(booking.getCheckedInAt())
                        .checkedOutAt(booking.getCheckedOutAt())
                        .build())
                .toList();
    }

    //Track Booking
    public List<BookingHistoryResponse> trackBookings(String mobileNumber) {

        Member member = memberRepository
                .findByMobileNumber(mobileNumber)
                .orElseThrow(() ->
                        new IllegalArgumentException("Member not found."));

        return bookingRepository
                .findByMemberIdOrderByBookingDateDesc(member.getId())
                .stream()
                .map(booking -> BookingHistoryResponse.builder()
                        .bookingId(booking.getId())
                        .bookingDate(booking.getBookingDate())
                        .token(booking.getToken())
                        .cardType(booking.getSlot().getCardType())
                        .slot(booking.getBookingLabel())
                        .status(booking.getStatus())
                        .checkedInAt(booking.getCheckedInAt())
                        .checkedOutAt(booking.getCheckedOutAt())
                        .build())
                .toList();
    }

    //Audit Log Helper
    private AuditLog log(
            String actor,
            String action,
            String details) {

        AuditLog auditLog = new AuditLog();

        auditLog.setActor(actor);
        auditLog.setAction(action);
        auditLog.setDetails(details);

        return auditLog;
    }

    //Get Customer Profile
    public CustomerProfileResponse getProfile(Long memberId) {

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Member not found"));

        return CustomerProfileResponse.builder()
                .id(member.getId())
                .fullName(member.getFullName())
                .mobileNumber(member.getMobileNumber())
                .dateOfBirth(member.getDateOfBirth())
                .groceryCardNumber(member.getGroceryCardNumber())
                .liquorCardNumber(member.getLiquorCardNumber())
                .registrationStatus(member.getRegistrationStatus())
                .build();
    }

    //Update Customer Profile
    @Transactional
    public CustomerProfileResponse updateProfile(Long memberId, UpdateCustomerProfileRequest request) {

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Member not found"));

        member.setFullName(request.fullName());
        member.setMobileNumber(request.mobileNumber());

        Member saved = memberRepository.save(member);

        auditLogRepository.save(
                log(
                        member.getMobileNumber(),
                        "UPDATE_PROFILE",
                        "Customer updated profile"
                )
        );

        return CustomerProfileResponse.builder()
                .id(saved.getId())
                .fullName(saved.getFullName())
                .mobileNumber(saved.getMobileNumber())
                .dateOfBirth(saved.getDateOfBirth())
                .groceryCardNumber(saved.getGroceryCardNumber())
                .liquorCardNumber(saved.getLiquorCardNumber())
                .registrationStatus(saved.getRegistrationStatus())
                .build();
    }

    //Landing Page
    public LandingPageResponse getLandingData() {

        long registeredMembers = memberRepository.count();

        long todayBookings = bookingRepository.countByBookingDate(LocalDate.now());

        List<Slot> availableSlots =
                slotRepository.findByActiveTrueOrderByStartTimeAsc();

        return new LandingPageResponse(
                registeredMembers,
                todayBookings,
                availableSlots
        );
    }
}
