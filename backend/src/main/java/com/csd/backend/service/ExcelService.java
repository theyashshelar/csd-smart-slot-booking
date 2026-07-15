package com.csd.backend.service;

import com.csd.backend.dto.ReportResponse;
import com.csd.backend.entity.Member;
import com.csd.backend.entity.Slot;
import com.csd.backend.entity.Booking;
import com.csd.backend.entity.AuditLog;
import com.csd.backend.repository.MemberRepository;
import com.csd.backend.util.ExcelHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExcelService {

    private final ExcelHelper excelHelper;
    private final MemberRepository memberRepository;

    //Import Members from Excel
    public int importMembers(MultipartFile file) {

        try {

            List<Member> members =
                    excelHelper.importMembers(file);

            int imported = 0;

            for (Member member : members) {

                if (!memberRepository.existsActiveByMobileNumber(
                        member.getMobileNumber())) {

                    memberRepository.save(member);

                    imported++;
                }
            }

            return imported;

        } catch (IOException e) {
            throw new RuntimeException(
                    "Failed to import members from Excel",
                    e
            );
        }
    }

    //Export Members
    public byte[] exportMembers(List<Member> members) {

        try {

            return excelHelper.exportMembers(members);

        } catch (IOException e) {
            throw new RuntimeException(
                    "Failed to export members",
                    e
            );
        }
    }

    //Export Slots
    public byte[] exportSlots(List<Slot> slots) {

        try {

            return excelHelper.exportSlots(slots);

        } catch (IOException e) {
            throw new RuntimeException(
                    "Failed to export slots",
                    e
            );
        }
    }

    //Export Report
    public byte[] exportReport(ReportResponse report) {

        try {

            return excelHelper.exportReport(report);

        } catch (IOException e) {
            throw new RuntimeException(
                    "Failed to export report",
                    e
            );
        }
    }

    // Export Members Directory
    public byte[] exportMembersDirectory(List<Member> members) {
        try {
            return excelHelper.exportMembersDirectory(members);
        } catch (IOException e) {
            throw new RuntimeException("Failed to export members directory", e);
        }
    }

    // Export Bookings
    public byte[] exportBookings(List<Booking> bookings) {
        try {
            return excelHelper.exportBookings(bookings);
        } catch (IOException e) {
            throw new RuntimeException("Failed to export bookings", e);
        }
    }

    // Export Check-In Check-Out
    public byte[] exportCheckInCheckOut(List<Booking> bookings) {
        try {
            return excelHelper.exportCheckInCheckOut(bookings);
        } catch (IOException e) {
            throw new RuntimeException("Failed to export check-in check-out report", e);
        }
    }

    // Export Slots Report
    public byte[] exportSlotsReport(List<Slot> slots, List<Booking> bookings) {
        try {
            return excelHelper.exportSlotsReport(slots, bookings);
        } catch (IOException e) {
            throw new RuntimeException("Failed to export slots report", e);
        }
    }

    // Export Holidays Report
    public byte[] exportHolidaysReport(String weeklyHolidays, String specialHolidaysDetails, java.time.LocalDate startDate, java.time.LocalDate endDate) {
        try {
            return excelHelper.exportHolidaysReport(weeklyHolidays, specialHolidaysDetails, startDate, endDate);
        } catch (IOException e) {
            throw new RuntimeException("Failed to export holidays report", e);
        }
    }

    // Export Audit Logs
    public byte[] exportAuditLogs(List<AuditLog> auditLogs) {
        try {
            return excelHelper.exportAuditLogs(auditLogs);
        } catch (IOException e) {
            throw new RuntimeException("Failed to export audit logs", e);
        }
    }
}