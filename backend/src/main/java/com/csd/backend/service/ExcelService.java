package com.csd.backend.service;

import com.csd.backend.dto.ReportResponse;
import com.csd.backend.entity.Member;
import com.csd.backend.entity.Slot;
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

                if (!memberRepository.existsByMobileNumber(
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
}