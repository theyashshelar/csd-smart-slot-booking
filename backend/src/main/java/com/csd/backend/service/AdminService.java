package com.csd.backend.service;

import com.csd.backend.dto.DashboardStats;
import com.csd.backend.dto.MemberRequest;
import com.csd.backend.dto.SlotRequest;
import com.csd.backend.dto.SystemSettingsResponse;
import com.csd.backend.entity.*;
import com.csd.backend.exception.BadRequestException;
import com.csd.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

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
    @Transactional(readOnly = true)
    public DashboardStats getDashboardStats() {

        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.minusDays(6);
        LocalDate monthStart = today.minusMonths(5).withDayOfMonth(1);

        List<Booking> todayBookings =
                bookingRepository.findByBookingDate(today);

        List<Booking> weeklyBookings =
                bookingRepository.findByBookingDateBetween(weekStart, today);

        List<Booking> monthlyBookings =
                bookingRepository.findByBookingDateBetween(monthStart, today);

        List<Slot> allSlots = slotRepository.findAll();
        List<Member> pendingMembers = memberRepository.findByRegistrationStatus(
                RegistrationStatus.PENDING
        );

        long registeredMembers =
                memberRepository.count();

        long activeMembers =
                memberRepository.countByRegistrationStatus(
                        RegistrationStatus.APPROVED
                );

        long pendingRegistrations =
                memberRepository.countByRegistrationStatus(
                        RegistrationStatus.PENDING
                );

        long rejectedRegistrations =
                memberRepository.countByRegistrationStatus(
                        RegistrationStatus.REJECTED
                );

        long bookings = todayBookings.size();

        long checkedIn =
                todayBookings.stream()
                        .filter(b -> b.getStatus() == BookingStatus.CHECKED_IN)
                        .count();

        long checkedOut =
                todayBookings.stream()
                        .filter(b -> b.getStatus() == BookingStatus.CHECKED_OUT)
                        .count();

        long cancelled =
                todayBookings.stream()
                        .filter(b -> b.getStatus() == BookingStatus.CANCELLED)
                        .count();

        long todayVisitors = checkedIn + checkedOut;

        long availableSlots = allSlots.stream()
                .filter(slot -> Boolean.TRUE.equals(slot.getActive()))
                .mapToLong(slot -> {
                    long bookedCount = todayBookings.stream()
                            .filter(b -> b.getSlot().getId().equals(slot.getId()) && b.getStatus() != BookingStatus.CANCELLED)
                            .count();
                    return Math.max(slot.getCapacity() - bookedCount, 0);
                })
                .sum();

        long groceryAvailable = allSlots.stream()
                .filter(slot -> Boolean.TRUE.equals(slot.getActive()))
                .filter(slot -> slot.getCardType() == CardType.GROCERY)
                .mapToLong(slot -> {
                    long bookedCount = todayBookings.stream()
                            .filter(b -> b.getSlot().getId().equals(slot.getId()) && b.getStatus() != BookingStatus.CANCELLED)
                            .count();
                    return Math.max(slot.getCapacity() - bookedCount, 0);
                })
                .sum();

        long liquorAvailable = allSlots.stream()
                .filter(slot -> Boolean.TRUE.equals(slot.getActive()))
                .filter(slot -> slot.getCardType() == CardType.LIQUOR)
                .mapToLong(slot -> {
                    long bookedCount = todayBookings.stream()
                            .filter(b -> b.getSlot().getId().equals(slot.getId()) && b.getStatus() != BookingStatus.CANCELLED)
                            .count();
                    return Math.max(slot.getCapacity() - bookedCount, 0);
                })
                .sum();

        long groceryBookings = todayBookings.stream()
                .filter(booking -> booking.getSlot().getCardType() == CardType.GROCERY)
                .count();

        long liquorBookings = todayBookings.stream()
                .filter(booking -> booking.getSlot().getCardType() == CardType.LIQUOR)
                .count();

        return new DashboardStats(
                todayVisitors,
                registeredMembers,
                bookings,
                checkedIn,
                checkedOut,
                cancelled,
                activeMembers,
                pendingRegistrations,
                rejectedRegistrations,
                availableSlots,
                allSlots.size(),
                groceryAvailable,
                liquorAvailable,
                groceryBookings,
                liquorBookings,
                bookingRepository.findTop5ByOrderByCreatedAtDesc()
                        .stream()
                        .map(booking -> new DashboardStats.BookingSummary(
                                booking.getId(),
                                booking.getBookingDate(),
                                booking.getToken(),
                                booking.getMember().getFullName(),
                                booking.getSlot().getCardType().name(),
                                booking.getBookingLabel(),
                                booking.getStatus().name()
                        ))
                        .toList(),
                pendingMembers.stream()
                        .sorted(Comparator.comparing(Member::getId).reversed())
                        .limit(5)
                        .map(member -> new DashboardStats.PendingRegistrationSummary(
                                member.getId(),
                                member.getFullName(),
                                member.getMobileNumber(),
                                member.getGroceryCardNumber(),
                                member.getLiquorCardNumber(),
                                member.getRegistrationStatus().name()
                        ))
                        .toList(),
                auditLogRepository.findTop5ByOrderByCreatedAtDesc()
                        .stream()
                        .map(log -> new DashboardStats.ActivitySummary(
                                log.getId(),
                                log.getActor(),
                                log.getAction(),
                                log.getDetails(),
                                log.getCreatedAt()
                        ))
                        .toList(),
                buildWeeklyChart(weeklyBookings, weekStart, today),
                buildMonthlyChart(monthlyBookings, monthStart, today),
                List.of(
                        new DashboardStats.ChartPoint("Grocery", groceryBookings),
                        new DashboardStats.ChartPoint("Liquor", liquorBookings)
                ),
                buildPeakHours(todayBookings)
        );
    }

    private List<DashboardStats.ChartPoint> buildWeeklyChart(
            List<Booking> bookings,
            LocalDate start,
            LocalDate end) {

        List<DashboardStats.ChartPoint> chart = new ArrayList<>();

        for (LocalDate date = start;
             !date.isAfter(end);
             date = date.plusDays(1)) {

            LocalDate current = date;

            long count = bookings.stream()
                    .filter(booking -> booking.getBookingDate().equals(current))
                    .count();

            chart.add(
                    new DashboardStats.ChartPoint(
                            current.getDayOfWeek()
                                    .getDisplayName(
                                            TextStyle.SHORT,
                                            Locale.ENGLISH),
                            count
                    )
            );
        }

        return chart;
    }

    private List<DashboardStats.ChartPoint> buildMonthlyChart(
            List<Booking> bookings,
            LocalDate start,
            LocalDate end) {

        List<DashboardStats.ChartPoint> chart = new ArrayList<>();
        YearMonth firstMonth = YearMonth.from(start);
        YearMonth lastMonth = YearMonth.from(end);

        for (YearMonth month = firstMonth;
             !month.isAfter(lastMonth);
             month = month.plusMonths(1)) {

            YearMonth current = month;

            long count = bookings.stream()
                    .filter(booking ->
                            YearMonth.from(booking.getBookingDate())
                                    .equals(current))
                    .count();

            chart.add(
                    new DashboardStats.ChartPoint(
                            current.getMonth()
                                    .getDisplayName(
                                            TextStyle.SHORT,
                                            Locale.ENGLISH),
                            count
                    )
            );
        }

        return chart;
    }

    private List<DashboardStats.ChartPoint> buildPeakHours(
            List<Booking> bookings) {

        return bookings.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        booking -> booking.getSlot().getStartTime(),
                        java.util.stream.Collectors.counting()
                ))
                .entrySet()
                .stream()
                .sorted(java.util.Map.Entry.comparingByKey())
                .map(entry -> new DashboardStats.ChartPoint(
                        entry.getKey(),
                        entry.getValue()
                ))
                .toList();
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

        if (memberRepository.existsActiveByMobileNumber(request.mobileNumber())) {
            throw new IllegalStateException("Mobile Number already exists");
        }

        if (request.groceryCardNumber() != null
                && !request.groceryCardNumber().isBlank()
                && memberRepository.existsActiveByGroceryCardNumber(request.groceryCardNumber())) {
            throw new IllegalStateException("Grocery card number is already registered.");
        }

        if (request.liquorCardNumber() != null
                && !request.liquorCardNumber().isBlank()
                && memberRepository.existsActiveByLiquorCardNumber(request.liquorCardNumber())) {
            throw new IllegalStateException("Liquor card number is already registered.");
        }

        Member member = new Member();

        member.setFullName(request.fullName());
        member.setMobileNumber(request.mobileNumber());
        member.setDateOfBirth(request.dateOfBirth());
        member.setPassword(passwordEncoder.encode(request.password()));

        String groceryCardNumber = (request.groceryCardNumber() == null || request.groceryCardNumber().isBlank()) ? null : request.groceryCardNumber();
        String liquorCardNumber = (request.liquorCardNumber() == null || request.liquorCardNumber().isBlank()) ? null : request.liquorCardNumber();
        member.setGroceryCardNumber(groceryCardNumber);
        member.setLiquorCardNumber(liquorCardNumber);

        member.setRole(Role.CUSTOMER);
        member.setRegistrationStatus(RegistrationStatus.APPROVED);
        member.setRegistrationDate(java.time.LocalDateTime.now());

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

        if (request.groceryCardNumber() != null
                && !request.groceryCardNumber().isBlank()
                && !request.groceryCardNumber().equals(member.getGroceryCardNumber())
                && memberRepository.existsActiveByGroceryCardNumber(request.groceryCardNumber())) {
            throw new IllegalStateException("Grocery card number is already registered.");
        }

        if (request.liquorCardNumber() != null
                && !request.liquorCardNumber().isBlank()
                && !request.liquorCardNumber().equals(member.getLiquorCardNumber())
                && memberRepository.existsActiveByLiquorCardNumber(request.liquorCardNumber())) {
            throw new IllegalStateException("Liquor card number is already registered.");
        }

        member.setFullName(request.fullName());
        member.setMobileNumber(request.mobileNumber());
        member.setDateOfBirth(request.dateOfBirth());

        if (request.password() != null && !request.password().isBlank()) {
            member.setPassword(passwordEncoder.encode(request.password()));
        }

        String groceryCardNumber = (request.groceryCardNumber() == null || request.groceryCardNumber().isBlank()) ? null : request.groceryCardNumber();
        String liquorCardNumber = (request.liquorCardNumber() == null || request.liquorCardNumber().isBlank()) ? null : request.liquorCardNumber();
        member.setGroceryCardNumber(groceryCardNumber);
        member.setLiquorCardNumber(liquorCardNumber);

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
                bookingRepository.existsByMemberId(id);

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

    //Get All Slots
    public List<Slot> getSlots() {
        LocalDate today = LocalDate.now();
        List<Booking> todayBookings = bookingRepository.findByBookingDate(today);
        List<Slot> slots = slotRepository.findAllByOrderByStartTimeAsc();
        slots.forEach(slot -> {
            long bookedCount = todayBookings.stream()
                    .filter(b -> b.getSlot().getId().equals(slot.getId()) && b.getStatus() != BookingStatus.CANCELLED)
                    .count();
            slot.setBookedCount((int) bookedCount);
        });
        return slots;
    }

    //Create Slots
    @Transactional
    public Slot createSlot(SlotRequest request) {

        validateSlot(request);

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

        validateSlot(request);

        Slot slot = slotRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Slot not found"));

        slot.setLabel(request.label());
        slot.setCardType(request.cardType());
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

    private void validateSlot(SlotRequest request) {
        if (request.startTime() == null || request.startTime().trim().isEmpty() ||
                request.endTime() == null || request.endTime().trim().isEmpty()) {
            throw new BadRequestException("Slot start time and end time are required");
        }

        LocalTime startTime;
        LocalTime endTime;
        try {
            startTime = LocalTime.parse(request.startTime());
            endTime = LocalTime.parse(request.endTime());
        } catch (Exception e) {
            throw new BadRequestException("Invalid slot start or end time format");
        }

        // Rule 4: Start Time must always be earlier than End Time
        if (!startTime.isBefore(endTime)) {
            throw new BadRequestException("Slot start time must be earlier than slot end time");
        }

        // Rule 1: Slot Start Time must be >= Opening Time
        String openingTimeStr = settingsRepository.findByKeyName("openingTime")
                .map(Settings::getSettingValue)
                .orElse("09:00 AM");
        LocalTime openingTime = parseTime12h(openingTimeStr);
        if (openingTime == null) openingTime = LocalTime.of(9, 0);
        if (startTime.isBefore(openingTime)) {
            throw new BadRequestException("Slot start time must be at or after opening time (" + openingTimeStr + ")");
        }

        // Rule 2: Slot End Time must be <= Closing Time
        String closingTimeStr = settingsRepository.findByKeyName("closingTime")
                .map(Settings::getSettingValue)
                .orElse("05:00 PM");
        LocalTime closingTime = parseTime12h(closingTimeStr);
        if (closingTime == null) closingTime = LocalTime.of(17, 0);
        if (endTime.isAfter(closingTime)) {
            throw new BadRequestException("Slot end time must be at or before closing time (" + closingTimeStr + ")");
        }

        // Rule 3: A slot must NOT overlap the configured Lunch Break
        String lunchStartStr = settingsRepository.findByKeyName("lunchBreakStart")
                .map(Settings::getSettingValue)
                .orElse("01:00 PM");
        String lunchEndStr = settingsRepository.findByKeyName("lunchBreakEnd")
                .map(Settings::getSettingValue)
                .orElse("02:00 PM");
        LocalTime lunchStart = parseTime12h(lunchStartStr);
        LocalTime lunchEnd = parseTime12h(lunchEndStr);
        if (lunchStart == null) lunchStart = LocalTime.of(13, 0);
        if (lunchEnd == null) lunchEnd = LocalTime.of(14, 0);
        if (startTime.isBefore(lunchEnd) && lunchStart.isBefore(endTime)) {
            throw new BadRequestException("Slot overlaps with the configured lunch break (" + lunchStartStr + " - " + lunchEndStr + ")");
        }

        // Rule 5: Capacity entered while creating/editing a slot must NOT exceed the configured capacity for that card type
        if (request.cardType() == CardType.GROCERY) {
            int maxGrocery = settingsRepository.findByKeyName("groceryCapacity")
                    .map(Settings::getSettingValue)
                    .map(val -> {
                        try { return Integer.parseInt(val); } catch (Exception e) { return 50; }
                    })
                    .orElse(50);
            if (request.capacity() > maxGrocery) {
                throw new BadRequestException("Capacity for Grocery slot cannot exceed configured maximum of " + maxGrocery);
            }
        } else if (request.cardType() == CardType.LIQUOR) {
            int maxLiquor = settingsRepository.findByKeyName("liquorCapacity")
                    .map(Settings::getSettingValue)
                    .map(val -> {
                        try { return Integer.parseInt(val); } catch (Exception e) { return 30; }
                    })
                    .orElse(30);
            if (request.capacity() > maxLiquor) {
                throw new BadRequestException("Capacity for Liquor slot cannot exceed configured maximum of " + maxLiquor);
            }
        }
    }

    private LocalTime parseTime12h(String timeStr) {
        if (timeStr == null || timeStr.trim().isEmpty()) {
            return null;
        }
        try {
            String clean = timeStr.trim().toUpperCase();
            boolean pm = clean.contains("PM");
            boolean am = clean.contains("AM");
            clean = clean.replace("AM", "").replace("PM", "").trim();
            String[] parts = clean.split(":");
            if (parts.length < 2) {
                return null;
            }
            int hour = Integer.parseInt(parts[0].trim());
            int minute = Integer.parseInt(parts[1].substring(0, 2).trim());
            if (pm && hour < 12) {
                hour += 12;
            }
            if (am && hour == 12) {
                hour = 0;
            }
            return LocalTime.of(hour, minute);
        } catch (Exception e) {
            return null;
        }
    }

    //Delete Slots
    @Transactional
    public void deleteSlot(Long id) {

        Slot slot = slotRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Slot not found"));

        boolean hasBookings = bookingRepository.findBySlotId(id).stream()
                .anyMatch(b -> b.getStatus() != BookingStatus.CANCELLED);
        if (hasBookings) {
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

        List<Settings> list = settingsRepository.findAllByKeyName(keyName);
        Settings settings;
        if (list.isEmpty()) {
            settings = new Settings();
            settings.setKeyName(keyName);
        } else {
            settings = list.get(0);
            if (list.size() > 1) {
                // Delete duplicate records to keep only one
                for (int i = 1; i < list.size(); i++) {
                    settingsRepository.delete(list.get(i));
                }
            }
        }

        settings.setSettingValue(value);
        Settings savedSetting = settingsRepository.saveAndFlush(settings);

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

    //Get Pending Approval Members
    public List<Member> getPendingMembers() {

        return memberRepository.findByRegistrationStatus(
                RegistrationStatus.PENDING
        );
    }

    //Approve Members
    @Transactional
    public Member approveMember(Long id) {

        Member member = memberRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Member not found"));

        member.setRegistrationStatus(
                RegistrationStatus.APPROVED
        );

        Member saved = memberRepository.save(member);

        auditLogRepository.save(
                log(
                        "ADMIN",
                        "APPROVE_MEMBER",
                        saved.getMobileNumber()
                )
        );

        return saved;
    }

    //Reject Members
    @Transactional
    public Member rejectMember(Long id) {

        Member member = memberRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Member not found"));

        member.setRegistrationStatus(
                RegistrationStatus.REJECTED
        );

        Member saved = memberRepository.save(member);

        auditLogRepository.save(
                log(
                        "ADMIN",
                        "REJECT_MEMBER",
                        saved.getMobileNumber()
                )
        );

        return saved;
    }

    //Settings
    private String getSetting(String key,String defaultValue){

        return settingsRepository
                .findByKeyName(key)
                .map(Settings::getSettingValue)
                .orElse(defaultValue);

    }

    @Transactional(readOnly = true)
    public SystemSettingsResponse getSystemSettings(){

        return SystemSettingsResponse.builder()

                .bookingEnabled(Boolean.parseBoolean(
                        getSetting("BOOKING_ENABLED","true")
                ))

                .bookingWindowDays(Integer.parseInt(
                        getSetting("BOOKING_WINDOW_DAYS","3")
                ))

                .groceryAvailable(Boolean.parseBoolean(
                        getSetting("GROCERY_AVAILABLE","true")
                ))

                .liquorAvailable(Boolean.parseBoolean(
                        getSetting("LIQUOR_AVAILABLE","true")
                ))

                .maxBookingPerDay(Integer.parseInt(
                        getSetting("MAX_BOOKING_PER_DAY","1")
                ))

                .cancellationEnabled(Boolean.parseBoolean(
                        getSetting("CANCELLATION_ENABLED","true")
                ))

                .cancellationHours(Integer.parseInt(
                        getSetting("CANCELLATION_HOURS","2")
                ))

                .build();

    }

    @Transactional
    public void updateSystemSettings(SystemSettingsResponse request){

        saveSettings("BOOKING_ENABLED",
                String.valueOf(request.bookingEnabled()));

        saveSettings("BOOKING_WINDOW_DAYS",
                String.valueOf(request.bookingWindowDays()));

        saveSettings("GROCERY_AVAILABLE",
                String.valueOf(request.groceryAvailable()));

        saveSettings("LIQUOR_AVAILABLE",
                String.valueOf(request.liquorAvailable()));

        saveSettings("MAX_BOOKING_PER_DAY",
                String.valueOf(request.maxBookingPerDay()));

        saveSettings("CANCELLATION_ENABLED",
                String.valueOf(request.cancellationEnabled()));

        saveSettings("CANCELLATION_HOURS",
                String.valueOf(request.cancellationHours()));

    }

}
