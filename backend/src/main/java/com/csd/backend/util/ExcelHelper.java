package com.csd.backend.util;

import com.csd.backend.dto.ReportResponse;
import com.csd.backend.entity.Member;
import com.csd.backend.entity.RegistrationStatus;
import com.csd.backend.entity.Role;
import com.csd.backend.entity.Slot;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Component
public class ExcelHelper {

    //IMPORT MEMBERS
    public List<Member> importMembers(MultipartFile file) throws IOException {

        List<Member> members = new ArrayList<>();

        try (InputStream inputStream = file.getInputStream();
             XSSFWorkbook workbook = new XSSFWorkbook(inputStream)) {

            Sheet sheet = workbook.getSheetAt(0);

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {

                Row row = sheet.getRow(i);

                if (row == null) {
                    continue;
                }

                Member member = Member.builder()
                        .fullName(row.getCell(0).getStringCellValue().trim())
                        .mobileNumber(row.getCell(1).getStringCellValue().trim())
                        .groceryCardNumber(row.getCell(2).getStringCellValue().trim())
                        .liquorCardNumber(row.getCell(3).getStringCellValue().trim())
                        .password("CHANGE_ME")
                        .role(Role.CUSTOMER)
                        .registrationStatus(RegistrationStatus.APPROVED)
                        .build();

                members.add(member);
            }
        }

        return members;
    }

    //EXPORT MEMBERS
    public byte[] exportMembers(List<Member> members) throws IOException {

        XSSFWorkbook workbook = new XSSFWorkbook();
        XSSFSheet sheet = workbook.createSheet("Members");

        Row header = sheet.createRow(0);

        header.createCell(0).setCellValue("Full Name");
        header.createCell(1).setCellValue("Mobile Number");
        header.createCell(2).setCellValue("Grocery Card");
        header.createCell(3).setCellValue("Liquor Card");
        header.createCell(4).setCellValue("Status");

        int rowNum = 1;

        for (Member member : members) {

            Row row = sheet.createRow(rowNum++);

            row.createCell(0).setCellValue(member.getFullName());
            row.createCell(1).setCellValue(member.getMobileNumber());
            row.createCell(2).setCellValue(member.getGroceryCardNumber());
            row.createCell(3).setCellValue(member.getLiquorCardNumber());
            row.createCell(4).setCellValue(member.getRegistrationStatus().name());
        }

        for (int i = 0; i < 7; i++) {
            sheet.autoSizeColumn(i);
        }

        ByteArrayOutputStream out = new ByteArrayOutputStream();

        workbook.write(out);
        workbook.close();

        return out.toByteArray();
    }

    //EXPORT SLOTS
    public byte[] exportSlots(List<Slot> slots) throws IOException {

        XSSFWorkbook workbook = new XSSFWorkbook();
        XSSFSheet sheet = workbook.createSheet("Slots");

        Row header = sheet.createRow(0);

        header.createCell(0).setCellValue("Label");
        header.createCell(1).setCellValue("Card Type");
        header.createCell(2).setCellValue("Start Time");
        header.createCell(3).setCellValue("End Time");
        header.createCell(4).setCellValue("Capacity");
        header.createCell(5).setCellValue("Booked");

        int rowNum = 1;

        for (Slot slot : slots) {

            Row row = sheet.createRow(rowNum++);

            row.createCell(0).setCellValue(slot.getLabel());
            row.createCell(1).setCellValue(slot.getCardType().name());
            row.createCell(2).setCellValue(slot.getStartTime());
            row.createCell(3).setCellValue(slot.getEndTime());
            row.createCell(4).setCellValue(slot.getCapacity());
            row.createCell(5).setCellValue(slot.getBookedCount());
        }

        for (int i = 0; i < 6; i++) {
            sheet.autoSizeColumn(i);
        }

        ByteArrayOutputStream out = new ByteArrayOutputStream();

        workbook.write(out);
        workbook.close();

        return out.toByteArray();
    }

    //EXPORT REPORT
    public byte[] exportReport(ReportResponse report) throws IOException {

        XSSFWorkbook workbook = new XSSFWorkbook();
        XSSFSheet sheet = workbook.createSheet("Daily Report");

        Row row0 = sheet.createRow(0);
        row0.createCell(0).setCellValue("Period");
        row0.createCell(1).setCellValue(report.getPeriod());

        Row row1 = sheet.createRow(1);
        row1.createCell(0).setCellValue("Total Bookings");
        row1.createCell(1).setCellValue(report.getTotalBookings());

        Row row2 = sheet.createRow(2);
        row2.createCell(0).setCellValue("Checked In");
        row2.createCell(1).setCellValue(report.getCheckedIn());

        Row row3 = sheet.createRow(3);
        row3.createCell(0).setCellValue("Checked Out");
        row3.createCell(1).setCellValue(report.getCheckedOut());

        Row row4 = sheet.createRow(4);
        row4.createCell(0).setCellValue("Cancelled");
        row4.createCell(1).setCellValue(report.getCancelled());

        sheet.autoSizeColumn(0);
        sheet.autoSizeColumn(1);

        ByteArrayOutputStream out = new ByteArrayOutputStream();

        workbook.write(out);
        workbook.close();

        return out.toByteArray();
    }

    // EXPORT MEMBERS DIRECTORY
    public byte[] exportMembersDirectory(List<Member> members) throws IOException {
        XSSFWorkbook workbook = new XSSFWorkbook();
        XSSFSheet sheet = workbook.createSheet("Members Directory");

        Row header = sheet.createRow(0);
        String[] columns = {"Member ID", "Name", "Mobile Number", "Date of Birth", "Grocery Card", "Liquor Card", "Registration Status", "Registration Date"};
        for (int i = 0; i < columns.length; i++) {
            header.createCell(i).setCellValue(columns[i]);
        }

        int rowNum = 1;
        for (Member m : members) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(m.getId() != null ? m.getId().toString() : "");
            row.createCell(1).setCellValue(m.getFullName() != null ? m.getFullName() : "");
            row.createCell(2).setCellValue(m.getMobileNumber() != null ? m.getMobileNumber() : "");
            row.createCell(3).setCellValue(m.getDateOfBirth() != null ? m.getDateOfBirth().toString() : "");
            row.createCell(4).setCellValue(m.getGroceryCardNumber() != null ? m.getGroceryCardNumber() : "N/A");
            row.createCell(5).setCellValue(m.getLiquorCardNumber() != null ? m.getLiquorCardNumber() : "N/A");
            row.createCell(6).setCellValue(m.getRegistrationStatus() != null ? m.getRegistrationStatus().name() : "");
            row.createCell(7).setCellValue("N/A");
        }

        for (int i = 0; i < columns.length; i++) {
            sheet.autoSizeColumn(i);
        }

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        workbook.write(out);
        workbook.close();
        return out.toByteArray();
    }

    // EXPORT BOOKINGS
    public byte[] exportBookings(List<Booking> bookings) throws IOException {
        XSSFWorkbook workbook = new XSSFWorkbook();
        XSSFSheet sheet = workbook.createSheet("Booking Report");

        Row header = sheet.createRow(0);
        String[] columns = {"Booking ID", "Booking Date", "Member Name", "Member ID", "Mobile Number", "Card Type", "Slot", "Token", "Booking Status"};
        for (int i = 0; i < columns.length; i++) {
            header.createCell(i).setCellValue(columns[i]);
        }

        int rowNum = 1;
        for (Booking b : bookings) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(b.getId() != null ? b.getId().toString() : "");
            row.createCell(1).setCellValue(b.getBookingDate() != null ? b.getBookingDate().toString() : "");
            row.createCell(2).setCellValue(b.getMember() != null ? b.getMember().getFullName() : "");
            row.createCell(3).setCellValue(b.getMember() != null && b.getMember().getId() != null ? b.getMember().getId().toString() : "");
            row.createCell(4).setCellValue(b.getMember() != null ? b.getMember().getMobileNumber() : "");
            row.createCell(5).setCellValue(b.getSlot() != null && b.getSlot().getCardType() != null ? b.getSlot().getCardType().name() : "");
            row.createCell(6).setCellValue(b.getSlot() != null ? b.getSlot().getLabel() : "");
            row.createCell(7).setCellValue(b.getToken() != null ? b.getToken() : "");
            row.createCell(8).setCellValue(b.getStatus() != null ? b.getStatus().name() : "");
        }

        for (int i = 0; i < columns.length; i++) {
            sheet.autoSizeColumn(i);
        }

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        workbook.write(out);
        workbook.close();
        return out.toByteArray();
    }

    // EXPORT CHECK-IN CHECK-OUT
    public byte[] exportCheckInCheckOut(List<Booking> bookings) throws IOException {
        XSSFWorkbook workbook = new XSSFWorkbook();
        XSSFSheet sheet = workbook.createSheet("Check-In Check-Out Report");

        Row header = sheet.createRow(0);
        String[] columns = {"Member Name", "Member ID", "Mobile Number", "Booking Date", "Token", "Slot", "Check-In Time", "Check-Out Time", "Remarks"};
        for (int i = 0; i < columns.length; i++) {
            header.createCell(i).setCellValue(columns[i]);
        }

        int rowNum = 1;
        for (Booking b : bookings) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(b.getMember() != null ? b.getMember().getFullName() : "");
            row.createCell(1).setCellValue(b.getMember() != null && b.getMember().getId() != null ? b.getMember().getId().toString() : "");
            row.createCell(2).setCellValue(b.getMember() != null ? b.getMember().getMobileNumber() : "");
            row.createCell(3).setCellValue(b.getBookingDate() != null ? b.getBookingDate().toString() : "");
            row.createCell(4).setCellValue(b.getToken() != null ? b.getToken() : "");
            row.createCell(5).setCellValue(b.getSlot() != null ? b.getSlot().getLabel() : "");
            row.createCell(6).setCellValue(b.getCheckedInAt() != null ? b.getCheckedInAt().toString() : "N/A");
            row.createCell(7).setCellValue(b.getCheckedOutAt() != null ? b.getCheckedOutAt().toString() : "N/A");
            row.createCell(8).setCellValue(b.getRemarks() != null ? b.getRemarks() : "");
        }

        for (int i = 0; i < columns.length; i++) {
            sheet.autoSizeColumn(i);
        }

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        workbook.write(out);
        workbook.close();
        return out.toByteArray();
    }

    // EXPORT SLOTS REPORT (WITH LIVE UTILIZATION IN DATE RANGE)
    public byte[] exportSlotsReport(List<Slot> slots, List<Booking> bookings) throws IOException {
        XSSFWorkbook workbook = new XSSFWorkbook();
        XSSFSheet sheet = workbook.createSheet("Slots Report");

        Row header = sheet.createRow(0);
        String[] columns = {"Slot", "Card Type", "Capacity", "Booked", "Available", "Utilization %"};
        for (int i = 0; i < columns.length; i++) {
            header.createCell(i).setCellValue(columns[i]);
        }

        java.util.Map<Long, Long> bookingCounts = bookings.stream()
                .filter(b -> b.getSlot() != null)
                .collect(java.util.stream.Collectors.groupingBy(b -> b.getSlot().getId(), java.util.stream.Collectors.counting()));

        int rowNum = 1;
        for (Slot slot : slots) {
            Row row = sheet.createRow(rowNum++);
            long booked = bookingCounts.getOrDefault(slot.getId(), 0L);
            long capacity = slot.getCapacity() != null ? slot.getCapacity() : 0;
            long available = Math.max(0, capacity - booked);
            double utilization = capacity > 0 ? ((double) booked / capacity) * 100.0 : 0.0;

            row.createCell(0).setCellValue(slot.getLabel() != null ? slot.getLabel() : "");
            row.createCell(1).setCellValue(slot.getCardType() != null ? slot.getCardType().name() : "");
            row.createCell(2).setCellValue(capacity);
            row.createCell(3).setCellValue(booked);
            row.createCell(4).setCellValue(available);
            row.createCell(5).setCellValue(String.format("%.1f%%", utilization));
        }

        for (int i = 0; i < columns.length; i++) {
            sheet.autoSizeColumn(i);
        }

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        workbook.write(out);
        workbook.close();
        return out.toByteArray();
    }

    // EXPORT HOLIDAYS REPORT
    public byte[] exportHolidaysReport(String weeklyHolidays, String specialHolidaysDetails, java.time.LocalDate startDate, java.time.LocalDate endDate) throws IOException {
        XSSFWorkbook workbook = new XSSFWorkbook();
        XSSFSheet sheet = workbook.createSheet("Holidays Report");

        Row header = sheet.createRow(0);
        String[] columns = {"Holiday Date", "Holiday Description", "Holiday Type"};
        for (int i = 0; i < columns.length; i++) {
            header.createCell(i).setCellValue(columns[i]);
        }

        int rowNum = 1;

        List<com.fasterxml.jackson.databind.JsonNode> specialList = new ArrayList<>();
        if (specialHolidaysDetails != null && !specialHolidaysDetails.trim().isEmpty()) {
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(specialHolidaysDetails);
                if (root.isArray()) {
                    for (com.fasterxml.jackson.databind.JsonNode node : root) {
                        specialList.add(node);
                    }
                }
            } catch (Exception e) {
                // Ignore parsing errors
            }
        }

        List<String> weeklyDays = new ArrayList<>();
        if (weeklyHolidays != null && !weeklyHolidays.trim().isEmpty()) {
            for (String day : weeklyHolidays.split(",")) {
                weeklyDays.add(day.trim().toLowerCase());
            }
        }

        if (startDate != null && endDate != null) {
            java.time.LocalDate current = startDate;
            while (!current.isAfter(endDate)) {
                final java.time.LocalDate checkDate = current;
                boolean isHoliday = false;
                String desc = "";
                String type = "";

                com.fasterxml.jackson.databind.JsonNode foundSpecial = null;
                for (com.fasterxml.jackson.databind.JsonNode node : specialList) {
                    if (node.has("date") && node.get("date").asText().equals(checkDate.toString())) {
                        foundSpecial = node;
                        break;
                    }
                }

                if (foundSpecial != null) {
                    String name = foundSpecial.has("name") ? foundSpecial.get("name").asText() : "Special Holiday";
                    String reason = foundSpecial.has("description") ? foundSpecial.get("description").asText() : "Canteen Closed";
                    desc = name + " - " + reason;
                    type = "Special Holiday";
                    isHoliday = true;
                } else {
                    String dayName = checkDate.getDayOfWeek().name().toLowerCase();
                    if (weeklyDays.contains(dayName)) {
                        desc = "Weekly Holiday (" + checkDate.getDayOfWeek().name() + ")";
                        type = "Weekly Holiday";
                        isHoliday = true;
                    }
                }

                if (isHoliday) {
                    Row row = sheet.createRow(rowNum++);
                    row.createCell(0).setCellValue(checkDate.toString());
                    row.createCell(1).setCellValue(desc);
                    row.createCell(2).setCellValue(type);
                }

                current = current.plusDays(1);
            }
        } else {
            for (com.fasterxml.jackson.databind.JsonNode node : specialList) {
                Row row = sheet.createRow(rowNum++);
                String date = node.has("date") ? node.get("date").asText() : "N/A";
                String name = node.has("name") ? node.get("name").asText() : "Special Holiday";
                String reason = node.has("description") ? node.get("description").asText() : "Canteen Closed";
                row.createCell(0).setCellValue(date);
                row.createCell(1).setCellValue(name + " - " + reason);
                row.createCell(2).setCellValue("Special Holiday");
            }

            for (String day : weeklyDays) {
                if (!day.isEmpty()) {
                    Row row = sheet.createRow(rowNum++);
                    row.createCell(0).setCellValue("Every " + day.substring(0, 1).toUpperCase() + day.substring(1));
                    row.createCell(1).setCellValue("Weekly Canteen Closure");
                    row.createCell(2).setCellValue("Weekly Holiday");
                }
            }
        }

        for (int i = 0; i < columns.length; i++) {
            sheet.autoSizeColumn(i);
        }

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        workbook.write(out);
        workbook.close();
        return out.toByteArray();
    }

    // EXPORT AUDIT LOGS
    public byte[] exportAuditLogs(List<com.csd.backend.entity.AuditLog> auditLogs) throws IOException {
        XSSFWorkbook workbook = new XSSFWorkbook();
        XSSFSheet sheet = workbook.createSheet("Audit Log Report");

        Row header = sheet.createRow(0);
        String[] columns = {"Log ID", "Actor", "Action", "Details", "Created At"};
        for (int i = 0; i < columns.length; i++) {
            header.createCell(i).setCellValue(columns[i]);
        }

        int rowNum = 1;
        for (com.csd.backend.entity.AuditLog log : auditLogs) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(log.getId() != null ? log.getId().toString() : "");
            row.createCell(1).setCellValue(log.getActor() != null ? log.getActor() : "");
            row.createCell(2).setCellValue(log.getAction() != null ? log.getAction() : "");
            row.createCell(3).setCellValue(log.getDetails() != null ? log.getDetails() : "");
            row.createCell(4).setCellValue(log.getCreatedAt() != null ? log.getCreatedAt().toString() : "");
        }

        for (int i = 0; i < columns.length; i++) {
            sheet.autoSizeColumn(i);
        }

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        workbook.write(out);
        workbook.close();
        return out.toByteArray();
    }
}