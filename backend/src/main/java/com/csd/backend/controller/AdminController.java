package com.csd.backend.controller;

import com.csd.backend.dto.DashboardStats;
import com.csd.backend.dto.MemberRequest;
import com.csd.backend.dto.ReportResponse;
import com.csd.backend.dto.SlotRequest;
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
    public ResponseEntity<Settings> saveSettings(
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

}