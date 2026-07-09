package com.csd.backend.controller;

import com.csd.backend.dto.AuthRequest;
import com.csd.backend.dto.AuthResponse;
import com.csd.backend.dto.RegisterRequest;
import com.csd.backend.dto.RegisterResponse;
import com.csd.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthService authService;

    //Customer Registration
    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(
            @Valid @RequestBody RegisterRequest request) {

        return ResponseEntity.ok(
                authService.register(request)
        );
    }

    //Admin Login
    @PostMapping("/admin/login")
    public ResponseEntity<AuthResponse> adminLogin(
            @Valid @RequestBody AuthRequest request) {

        return ResponseEntity.ok(
                authService.loginAdmin(request)
        );
    }

    //Operator Login
    @PostMapping("/operator/login")
    public ResponseEntity<AuthResponse> operatorLogin(
            @Valid @RequestBody AuthRequest request) {

        return ResponseEntity.ok(
                authService.loginOperator(request)
        );
    }

    //Customer Login
    @PostMapping("/customer/login")
    public ResponseEntity<AuthResponse> customerLogin(
            @Valid @RequestBody AuthRequest request) {

        return ResponseEntity.ok(
                authService.loginCustomer(request)
        );
    }
}