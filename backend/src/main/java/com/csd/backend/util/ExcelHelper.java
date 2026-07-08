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
}