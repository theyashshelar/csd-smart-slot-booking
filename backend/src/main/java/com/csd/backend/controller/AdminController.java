package com.csd.backend.controller;

import com.csd.backend.dto.*;
import com.csd.backend.entity.Member;
import com.csd.backend.entity.Settings;
import com.csd.backend.entity.Slot;
import com.csd.backend.service.AdminService;
import com.csd.backend.service.ExcelService;
import com.csd.backend.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    private final AdminService adminService;
    private final ReportService reportService;
    private final ExcelService excelService;

    private final com.csd.backend.repository.BookingRepository bookingRepository;
    private final com.csd.backend.repository.MemberRepository memberRepository;
    private final com.csd.backend.repository.SlotRepository slotRepository;
    private final com.csd.backend.repository.AuditLogRepository auditLogRepository;
    private final com.csd.backend.repository.SettingsRepository settingsRepository;

    //Dashboard
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStats> dashboard() {

        return ResponseEntity.ok(
                adminService.getDashboardStats()
        );
    }

    //Members
    @GetMapping("/members")
    public ResponseEntity<List<Member>> members(
            @RequestParam(required = false) String q) {

        return ResponseEntity.ok(
                adminService.getMembers(q)
        );
    }

    @PostMapping("/members")
    public ResponseEntity<Member> createMember(
            @RequestBody MemberRequest request) {

        return ResponseEntity.ok(
                adminService.createMember(request)
        );
    }

    @PutMapping("/members/{id}")
    public ResponseEntity<Member> updateMember(
            @PathVariable Long id,
            @RequestBody MemberRequest request) {

        return ResponseEntity.ok(
                adminService.updateMember(id, request)
        );
    }

    @DeleteMapping("/members/{id}")
    public ResponseEntity<Void> deleteMember(
            @PathVariable Long id) {

        adminService.deleteMember(id);

        return ResponseEntity.noContent().build();
    }

    //Slots
    @GetMapping("/slots")
    public ResponseEntity<List<Slot>> slots() {

        return ResponseEntity.ok(
                adminService.getSlots()
        );
    }

    @PostMapping("/slots")
    public ResponseEntity<Slot> createSlot(
            @RequestBody SlotRequest request) {

        return ResponseEntity.ok(
                adminService.createSlot(request)
        );
    }

    @PutMapping("/slots/{id}")
    public ResponseEntity<Slot> updateSlot(
            @PathVariable Long id,
            @RequestBody SlotRequest request) {

        return ResponseEntity.ok(
                adminService.updateSlot(id, request)
        );
    }

    @DeleteMapping("/slots/{id}")
    public ResponseEntity<Void> deleteSlot(
            @PathVariable Long id) {

        adminService.deleteSlot(id);

        return ResponseEntity.noContent().build();
    }

    @PutMapping("/slots/{id}/status")
    public ResponseEntity<Slot> updateStatus(
            @PathVariable Long id,
            @RequestParam boolean active) {

        return ResponseEntity.ok(
                adminService.setSlotActive(id, active)
        );
    }

    //Settings
    @GetMapping("/settings")
    public ResponseEntity<List<Settings>> settings() {

        return ResponseEntity.ok(
                adminService.getSettings()
        );
    }

    @PostMapping("/settings")
    public ResponseEntity<Settings> saveSetting(
            @RequestParam String keyName,
            @RequestParam String value) {

        return ResponseEntity.ok(
                adminService.saveSettings(keyName, value)
        );
    }

    //Import Members
    @PostMapping("/import-members")
    public ResponseEntity<String> importMembers(
            @RequestParam MultipartFile file) {

        int count = adminService.importMembers(file);

        return ResponseEntity.ok(
                count + " Members Imported Successfully"
        );
    }

    //Export Members
    @GetMapping("/export-members")
    public ResponseEntity<byte[]> exportMembers()
            throws IOException {

        byte[] data = excelService.exportMembers(
                adminService.getMembers(null));

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=members.xlsx")
                .contentType(
                        MediaType.APPLICATION_OCTET_STREAM)
                .body(data);
    }

    //Export Slots
    @GetMapping("/export-slots")
    public ResponseEntity<byte[]> exportSlots()
            throws IOException {

        byte[] data = excelService.exportSlots(
                adminService.getSlots());

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=slots.xlsx")
                .contentType(
                        MediaType.APPLICATION_OCTET_STREAM)
                .body(data);
    }

    //Reports
    @GetMapping("/reports/{period}")
    public ResponseEntity<ReportResponse> reports(
            @PathVariable String period) {

        return ResponseEntity.ok(
                reportService.getReport(period)
        );
    }

    @GetMapping("/export-reports/{period}")
    public ResponseEntity<byte[]> exportReport(
            @PathVariable String period)
            throws IOException {

        byte[] data = excelService.exportReport(
                reportService.getReport(period));

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=" + period + "-report.xlsx")
                .contentType(
                        MediaType.APPLICATION_OCTET_STREAM)
                .body(data);
    }

    //Get Pending Approval Members
    @GetMapping("/members/pending")
    public ResponseEntity<List<Member>> getPendingMembers() {

        return ResponseEntity.ok(
                adminService.getPendingMembers()
        );
    }

    //Approve Members
    @PutMapping("/members/{id}/approve")
    public ResponseEntity<Member> approveMember(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                adminService.approveMember(id)
        );
    }

    //Reject Members
    @PutMapping("/members/{id}/reject")
    public ResponseEntity<Member> rejectMember(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                adminService.rejectMember(id)
        );
    }

    @GetMapping("/system-settings")
    public ResponseEntity<SystemSettingsResponse> getSystemSettings(){

        return ResponseEntity.ok(
                adminService.getSystemSettings()
        );

    }

    @PutMapping("/system-settings")
    public ResponseEntity<Void> updateSystemSettings(

            @RequestBody SystemSettingsResponse request){

        adminService.updateSystemSettings(request);

        return ResponseEntity.ok().build();

    }

    // Export Members Directory
    @GetMapping("/export/members-directory")
    public ResponseEntity<byte[]> exportMembersDirectory() throws IOException {
        List<com.csd.backend.entity.Member> members = memberRepository.findAll();
        byte[] data = excelService.exportMembersDirectory(members);
        String today = java.time.LocalDate.now().toString();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=members_" + today + ".xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(data);
    }

    // Export Booking Report
    @GetMapping("/export/bookings")
    public ResponseEntity<byte[]> exportBookings(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) throws IOException {
        
        List<com.csd.backend.entity.Booking> bookings;
        if (startDate != null && !startDate.isEmpty() && endDate != null && !endDate.isEmpty()) {
            java.time.LocalDate start = java.time.LocalDate.parse(startDate);
            java.time.LocalDate end = java.time.LocalDate.parse(endDate);
            bookings = bookingRepository.findByBookingDateBetween(start, end);
        } else {
            bookings = bookingRepository.findAll();
        }

        byte[] data = excelService.exportBookings(bookings);
        String today = java.time.LocalDate.now().toString();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=bookings_" + today + ".xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(data);
    }

    // Export Check-In / Check-Out Report
    @GetMapping("/export/checkins-checkouts")
    public ResponseEntity<byte[]> exportCheckInCheckOut(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) throws IOException {
        
        List<com.csd.backend.entity.Booking> bookings;
        if (startDate != null && !startDate.isEmpty() && endDate != null && !endDate.isEmpty()) {
            java.time.LocalDate start = java.time.LocalDate.parse(startDate);
            java.time.LocalDate end = java.time.LocalDate.parse(endDate);
            bookings = bookingRepository.findByBookingDateBetween(start, end);
        } else {
            bookings = bookingRepository.findAll();
        }

        byte[] data = excelService.exportCheckInCheckOut(bookings);
        String today = java.time.LocalDate.now().toString();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=checkins_checkouts_" + today + ".xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(data);
    }

    // Export Grocery Booking Report
    @GetMapping("/export/grocery-bookings")
    public ResponseEntity<byte[]> exportGroceryBookings(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) throws IOException {
        
        List<com.csd.backend.entity.Booking> bookings;
        if (startDate != null && !startDate.isEmpty() && endDate != null && !endDate.isEmpty()) {
            java.time.LocalDate start = java.time.LocalDate.parse(startDate);
            java.time.LocalDate end = java.time.LocalDate.parse(endDate);
            bookings = bookingRepository.findByBookingDateBetween(start, end);
        } else {
            bookings = bookingRepository.findAll();
        }

        List<com.csd.backend.entity.Booking> groceryBookings = bookings.stream()
                .filter(b -> b.getSlot() != null && b.getSlot().getCardType() == com.csd.backend.entity.CardType.GROCERY)
                .collect(java.util.stream.Collectors.toList());

        byte[] data = excelService.exportGroceryBookings(groceryBookings);        String today = java.time.LocalDate.now().toString();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=grocery_bookings_" + today + ".xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(data);
    }

    // Export Liquor Booking Report
    @GetMapping("/export/liquor-bookings")
    public ResponseEntity<byte[]> exportLiquorBookings(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) throws IOException {
        
        List<com.csd.backend.entity.Booking> bookings;
        if (startDate != null && !startDate.isEmpty() && endDate != null && !endDate.isEmpty()) {
            java.time.LocalDate start = java.time.LocalDate.parse(startDate);
            java.time.LocalDate end = java.time.LocalDate.parse(endDate);
            bookings = bookingRepository.findByBookingDateBetween(start, end);
        } else {
            bookings = bookingRepository.findAll();
        }

        List<com.csd.backend.entity.Booking> liquorBookings = bookings.stream()
                .filter(b -> b.getSlot() != null && b.getSlot().getCardType() == com.csd.backend.entity.CardType.LIQUOR)
                .collect(java.util.stream.Collectors.toList());

        byte[] data = excelService.exportLiquorBookings(liquorBookings);        String today = java.time.LocalDate.now().toString();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=liquor_bookings_" + today + ".xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(data);
    }

    // Export Slot Report
    @GetMapping("/export/slots-report")
    public ResponseEntity<byte[]> exportSlotsReport(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) throws IOException {
        
        List<com.csd.backend.entity.Slot> slots = slotRepository.findAll();
        List<com.csd.backend.entity.Booking> bookings;
        if (startDate != null && !startDate.isEmpty() && endDate != null && !endDate.isEmpty()) {
            java.time.LocalDate start = java.time.LocalDate.parse(startDate);
            java.time.LocalDate end = java.time.LocalDate.parse(endDate);
            bookings = bookingRepository.findByBookingDateBetween(start, end);
        } else {
            bookings = bookingRepository.findAll();
        }

        byte[] data = excelService.exportSlotsReport(slots, bookings);
        String today = java.time.LocalDate.now().toString();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=slots_report_" + today + ".xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(data);
    }

    // Export Holiday Report
    @GetMapping("/export/holidays")
    public ResponseEntity<byte[]> exportHolidaysReport(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) throws IOException {
        
        String weeklyHolidays = settingsRepository.findByKeyName("weeklyHolidays")
                .map(com.csd.backend.entity.Settings::getSettingValue).orElse("");
        String specialHolidaysDetails = settingsRepository.findByKeyName("specialHolidaysDetails")
                .map(com.csd.backend.entity.Settings::getSettingValue).orElse("");

        java.time.LocalDate start = (startDate != null && !startDate.isEmpty()) ? java.time.LocalDate.parse(startDate) : null;
        java.time.LocalDate end = (endDate != null && !endDate.isEmpty()) ? java.time.LocalDate.parse(endDate) : null;

        byte[] data = excelService.exportHolidaysReport(weeklyHolidays, specialHolidaysDetails, start, end);
        String today = java.time.LocalDate.now().toString();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=holidays_" + today + ".xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(data);
    }

    // Export Audit Log Report (if audit logs exist)
    @GetMapping("/export/audit-logs")
    public ResponseEntity<byte[]> exportAuditLogs(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) throws IOException {
        
        List<com.csd.backend.entity.AuditLog> logs = auditLogRepository.findAll();
        if (startDate != null && !startDate.isEmpty() && endDate != null && !endDate.isEmpty()) {
            java.time.LocalDate start = java.time.LocalDate.parse(startDate);
            java.time.LocalDate end = java.time.LocalDate.parse(endDate);
            logs = logs.stream()
                .filter(l -> {
                    if (l.getCreatedAt() == null) return false;
                    java.time.LocalDate logDate = l.getCreatedAt().toLocalDate();
                    return !logDate.isBefore(start) && !logDate.isAfter(end);
                })
                .collect(java.util.stream.Collectors.toList());
        }

        byte[] data = excelService.exportAuditLogs(logs);
        String today = java.time.LocalDate.now().toString();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=audit_logs_" + today + ".xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(data);
    }

}