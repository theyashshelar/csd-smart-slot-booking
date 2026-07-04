package com.csd.backend.service;

import com.csd.backend.dto.BookingRequest;
import com.csd.backend.dto.VerificationRequest;
import com.csd.backend.dto.VerificationResponse;
import com.csd.backend.entity.*;
import com.csd.backend.repository.AuditLogRepository;
import com.csd.backend.repository.BookingRepository;
import com.csd.backend.repository.MemberRepository;
import com.csd.backend.repository.SlotRepository;
import com.csd.backend.util.QRCodeGenerator;
import com.csd.backend.util.TokenGenerator;
import lombok.RequiredArgsConstructor;
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
    private final SmsService smsService;
    private final QRCodeGenerator qrCodeGenerator;
    private final TokenGenerator tokenGenerator;

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

    //Available Slots
    public List<Slot> getAvailableSlots() {

        return slotRepository.findByActiveTrueOrderByStartTimeAsc();
    }

    //Create Booking
    @Transactional
    public Booking createBooking(BookingRequest request) {

        Member member = memberRepository.findById(request.memberId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Member not found"));

        Slot slot = slotRepository.findById(request.slotId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Slot not found"));

        boolean alreadyBooked = bookingRepository
                .existsByMemberIdAndBookingDate(
                        member.getId(),
                        LocalDate.now());

        if (alreadyBooked) {
            throw new IllegalStateException(
                    "Member has already booked today");
        }

        if (slot.getBookedCount() >= slot.getCapacity()) {
            throw new IllegalStateException(
                    "Selected slot is full");
        }

        Booking booking = new Booking();

        booking.setMember(member);
        booking.setSlot(slot);
        booking.setBookingDate(LocalDate.now());

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

        slot.setBookedCount(slot.getBookedCount() + 1);
        slotRepository.save(slot);

        auditLogRepository.save(
                log(
                        member.getMobileNumber(),
                        "BOOK_SLOT",
                        "Booked Slot : " + slot.getLabel()
                )
        );

        return savedBooking;
    }

    /**
     * Booking History
     */
    public List<Booking> getBookingsForMember(Long memberId) {

        return bookingRepository
                .findByMemberIdOrderByBookingDateDesc(memberId);
    }

    /**
     * Track Booking
     */
    public List<Booking> trackBookings(String mobileNumber) {

        Member member = memberRepository
                .findByMobileNumber(mobileNumber)
                .orElseThrow(() ->
                        new IllegalArgumentException("Member not found."));

        return bookingRepository
                .findByMemberIdOrderByBookingDateDesc(member.getId());
    }

    /**
     * Audit Log Helper
     */
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
}