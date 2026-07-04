package com.csd.backend.service;

import com.csd.backend.dto.DashboardStats;
import com.csd.backend.dto.MemberRequest;
import com.csd.backend.dto.SlotRequest;
import com.csd.backend.entity.*;
import com.csd.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final BookingRepository bookingRepository;
    private final MemberRepository memberRepository;
    private final SlotRepository slotRepository;
    private final SettingsRepository settingsRepository;
    private final AuditLogRepository auditLogRepository;
    private final ExcelService excelService;
    private final PasswordEncoder passwordEncoder;

    //Dashboard Statistics
    public DashboardStats getDashboardStats() {

        LocalDate today = LocalDate.now();

        long todayVisitors =
                bookingRepository.countByBookingDate(today);

        long registeredMembers =
                memberRepository.count();

        long bookings =
                bookingRepository.countByBookingDate(today);

        long checkedIn =
                bookingRepository.findByBookingDate(today)
                        .stream()
                        .filter(b -> b.getStatus() == BookingStatus.CHECKED_IN)
                        .count();

        long checkedOut =
                bookingRepository.findByBookingDate(today)
                        .stream()
                        .filter(b -> b.getStatus() == BookingStatus.CHECKED_OUT)
                        .count();

        long cancelled =
                bookingRepository.findByBookingDate(today)
                        .stream()
                        .filter(b -> b.getStatus() == BookingStatus.CANCELLED)
                        .count();

        return new DashboardStats(
                todayVisitors,
                registeredMembers,
                bookings,
                checkedIn,
                checkedOut,
                cancelled
        );
    }

    //Search Members
    public List<Member> getMembers(String query) {

        if (StringUtils.hasText(query)) {

            return memberRepository
                    .findByFullNameContainingIgnoreCaseOrMobileNumberContainingIgnoreCase(
                            query,
                            query
                    );
        }

        return memberRepository.findAll();
    }

    //Create Member
    @Transactional
    public Member createMember(MemberRequest request) {

        if (memberRepository.existsByMobileNumber(request.mobileNumber())) {
            throw new IllegalStateException("Mobile Number already exists");
        }

        Member member = new Member();

        member.setFullName(request.fullName());
        member.setMobileNumber(request.mobileNumber());
        member.setDateOfBirth(request.dateOfBirth());
        member.setPassword(passwordEncoder.encode(request.password()));
        member.setGroceryCardNumber(request.groceryCardNumber());
        member.setLiquorCardNumber(request.liquorCardNumber());

        member.setRole(Role.CUSTOMER);
        member.setRegistrationStatus(RegistrationStatus.APPROVED);

        Member savedMember = memberRepository.save(member);

        auditLogRepository.save(
                log(
                        "ADMIN",
                        "CREATE_MEMBER",
                        savedMember.getMobileNumber()
                )
        );

        return savedMember;
    }

    //Update Member
    @Transactional
    public Member updateMember(Long id, MemberRequest request) {

        Member member = memberRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Member not found"));

        member.setFullName(request.fullName());
        member.setMobileNumber(request.mobileNumber());
        member.setDateOfBirth(request.dateOfBirth());

        if (request.password() != null && !request.password().isBlank()) {
            member.setPassword(passwordEncoder.encode(request.password()));
        }

        member.setGroceryCardNumber(request.groceryCardNumber());
        member.setLiquorCardNumber(request.liquorCardNumber());

        Member updatedMember = memberRepository.save(member);

        auditLogRepository.save(
                log(
                        "ADMIN",
                        "UPDATE_MEMBER",
                        updatedMember.getMobileNumber()
                )
        );

        return updatedMember;
    }

    //Delete Member
    @Transactional
    public void deleteMember(Long id) {

        boolean hasBookings =
                bookingRepository.existsByMemberIdAndBookingDate(
                        id,
                        LocalDate.now()
                );

        if (hasBookings) {
            throw new IllegalStateException(
                    "Cannot delete member. Booking exists.");
        }

        memberRepository.deleteById(id);

        auditLogRepository.save(
                log(
                        "ADMIN",
                        "DELETE_MEMBER",
                        "Member ID : " + id
                )
        );
    }
    //Get All Active Slots
    public List<Slot> getSlots() {

        return slotRepository.findByActiveTrueOrderByStartTimeAsc();
    }

    //Create Slots
    @Transactional
    public Slot createSlot(SlotRequest request) {

        Slot slot = new Slot();

        slot.setLabel(request.label());
        slot.setCardType(request.cardType());
        slot.setStartTime(request.startTime());
        slot.setEndTime(request.endTime());
        slot.setCapacity(request.capacity());
        slot.setBookedCount(0);
        slot.setActive(true);

        Slot savedSlot = slotRepository.save(slot);

        auditLogRepository.save(
                log(
                        "ADMIN",
                        "CREATE_SLOT",
                        savedSlot.getLabel()
                )
        );

        return savedSlot;
    }

    //Update slots
    @Transactional
    public Slot updateSlot(Long id, SlotRequest request) {

        Slot slot = slotRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Slot not found"));

        slot.setLabel(request.label());
        slot.setStartTime(request.startTime());
        slot.setEndTime(request.endTime());
        slot.setCapacity(request.capacity());

        Slot updatedSlot = slotRepository.save(slot);

        auditLogRepository.save(
                log(
                        "ADMIN",
                        "UPDATE_SLOT",
                        updatedSlot.getLabel()
                )
        );

        return updatedSlot;
    }

    //Delete Slots
    @Transactional
    public void deleteSlot(Long id) {

        Slot slot = slotRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Slot not found"));

        if (slot.getBookedCount() > 0) {
            throw new IllegalStateException(
                    "Cannot delete slot with existing bookings");
        }

        slotRepository.delete(slot);

        auditLogRepository.save(
                log(
                        "ADMIN",
                        "DELETE_SLOT",
                        slot.getLabel()
                )
        );
    }

    //Enable and Delete Slots
    @Transactional
    public Slot setSlotActive(Long id, boolean active) {

        Slot slot = slotRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Slot not found"));

        slot.setActive(active);

        Slot updatedSlot = slotRepository.save(slot);

        auditLogRepository.save(
                log(
                        "ADMIN",
                        active ? "ENABLE_SLOT" : "DISABLE_SLOT",
                        updatedSlot.getLabel()
                )
        );

        return updatedSlot;
    }
    //Get all Settings
    public List<Settings> getSettings() {

        return settingsRepository.findAll();
    }

    //Save and Update Settings
    @Transactional
    public Settings saveSettings(String keyName, String value) {

        Settings settings = settingsRepository
                .findByKeyName(keyName)
                .orElse(new Settings());

        settings.setKeyName(keyName);
        settings.setSettingValue(value);

        Settings savedSetting = settingsRepository.save(settings);

        auditLogRepository.save(
                log(
                        "ADMIN",
                        "UPDATE_SETTING",
                        keyName
                )
        );

        return savedSetting;
    }

    //Import Members from Excel
    @Transactional
    public int importMembers(MultipartFile file) {

        int count = excelService.importMembers(file);

        auditLogRepository.save(
                log(
                        "ADMIN",
                        "IMPORT_MEMBERS",
                        "Imported " + count + " members"
                )
        );

        return count;
    }

    //Create Audit Log
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