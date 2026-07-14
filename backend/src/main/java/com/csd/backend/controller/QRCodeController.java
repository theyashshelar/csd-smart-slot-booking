package com.csd.backend.controller;

import com.csd.backend.util.QRCodeGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpHeaders;

@RestController
@RequestMapping("/api/qr")
@RequiredArgsConstructor
public class QRCodeController {

    private final QRCodeGenerator qrCodeGenerator;

    @GetMapping("/{token}")
    public ResponseEntity<byte[]> generate(
            @PathVariable String token) {

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + token + ".png\""
                )
                .contentType(MediaType.IMAGE_PNG)
                .body(qrCodeGenerator.generateQRCode(token));
    }
}