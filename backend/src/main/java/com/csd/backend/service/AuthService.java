package com.csd.backend.service;

import com.csd.backend.dto.AuthRequest;
import com.csd.backend.dto.AuthResponse;
import com.csd.backend.dto.RegisterRequest;
import com.csd.backend.dto.RegisterResponse;
import com.csd.backend.entity.Admin;
import com.csd.backend.entity.Member;
import com.csd.backend.entity.Operator;
import com.csd.backend.entity.RegistrationStatus;
import com.csd.backend.entity.Role;
import com.csd.backend.exception.ForbiddenException;
import com.csd.backend.exception.UnauthorizedException;
import com.csd.backend.repository.AdminRepository;
import com.csd.backend.repository.MemberRepository;
import com.csd.backend.repository.OperatorRepository;
import com.csd.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AdminRepository adminRepository;
    private final OperatorRepository operatorRepository;
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    //Member Registration
    public RegisterResponse register(RegisterRequest request) {

        if (!request.getPassword().matches(
                "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&^#()_+\\-=\\[\\]{};':\"\\\\|,.<>/?]).{8,}$")) {

            throw new IllegalArgumentException(
                    "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."
            );
        }

        String mobile = request.getMobileNumber();
        if (mobile == null || mobile.isBlank()) {
            throw new IllegalArgumentException("Mobile Number is required.");
        }
        String cleanedMobile = mobile.replaceAll("\\D", "");
        if (cleanedMobile.length() == 12 && cleanedMobile.startsWith("91")) {
            cleanedMobile = cleanedMobile.substring(2);
        }
        if (cleanedMobile.length() != 10) {
            throw new IllegalArgumentException("Mobile number must contain exactly 10 digits.");
        }

        if (request.getGroceryCardNumber() != null
                && !request.getGroceryCardNumber().isBlank()
                && request.getLiquorCardNumber() != null
                && !request.getLiquorCardNumber().isBlank()
                && request.getGroceryCardNumber().trim().equalsIgnoreCase(request.getLiquorCardNumber().trim())) {

            throw new IllegalArgumentException("Grocery Card Number and Liquor Card Number cannot be the same.");
        }

        if ((request.getGroceryCardNumber() == null || request.getGroceryCardNumber().isBlank())
                && (request.getLiquorCardNumber() == null || request.getLiquorCardNumber().isBlank())) {
            throw new IllegalArgumentException("Please provide at least one CSD Card Number (Grocery or Liquor).");
        }

        String groceryCardNumber =
                (request.getGroceryCardNumber() == null || request.getGroceryCardNumber().isBlank())
                                ? null
                                : request.getGroceryCardNumber().trim();

        String liquorCardNumber =
                (request.getLiquorCardNumber() == null || request.getLiquorCardNumber().isBlank())
                                ? null
                                : request.getLiquorCardNumber().trim();

        // Find existing member by mobile number, grocery card, or liquor card
        Member existingMember = memberRepository.findByMobileNumber(cleanedMobile).orElse(null);
        if (existingMember == null && groceryCardNumber != null) {
            existingMember = memberRepository.findByGroceryCardNumber(groceryCardNumber).orElse(null);
        }
        if (existingMember == null && liquorCardNumber != null) {
            existingMember = memberRepository.findByLiquorCardNumber(liquorCardNumber).orElse(null);
        }

        if (existingMember != null) {
            if (existingMember.getRegistrationStatus() == RegistrationStatus.PENDING) {
                throw new IllegalArgumentException("Your registration is under review.");
            }
            if (existingMember.getRegistrationStatus() == RegistrationStatus.APPROVED) {
                throw new IllegalArgumentException("Your account already exists.");
            }
            if (existingMember.getRegistrationStatus() == RegistrationStatus.REJECTED) {
                // Verify that new values do not conflict with other active (APPROVED/PENDING) members
                if (groceryCardNumber != null) {
                    Member other = memberRepository.findByGroceryCardNumber(groceryCardNumber).orElse(null);
                    if (other != null && !other.getId().equals(existingMember.getId())) {
                        if (other.getRegistrationStatus() == RegistrationStatus.PENDING) {
                            throw new IllegalArgumentException("Your registration is under review.");
                        } else if (other.getRegistrationStatus() == RegistrationStatus.APPROVED) {
                            throw new IllegalArgumentException("Your account already exists.");
                        }
                    }
                }
                if (liquorCardNumber != null) {
                    Member other = memberRepository.findByLiquorCardNumber(liquorCardNumber).orElse(null);
                    if (other != null && !other.getId().equals(existingMember.getId())) {
                        if (other.getRegistrationStatus() == RegistrationStatus.PENDING) {
                            throw new IllegalArgumentException("Your registration is under review.");
                        } else if (other.getRegistrationStatus() == RegistrationStatus.APPROVED) {
                            throw new IllegalArgumentException("Your account already exists.");
                        }
                    }
                }

                existingMember.setFullName(request.getFullName());
                existingMember.setMobileNumber(cleanedMobile);
                existingMember.setDateOfBirth(request.getDateOfBirth());
                existingMember.setGroceryCardNumber(groceryCardNumber);
                existingMember.setLiquorCardNumber(liquorCardNumber);
                existingMember.setPassword(passwordEncoder.encode(request.getPassword()));
                existingMember.setRegistrationStatus(RegistrationStatus.PENDING);
                existingMember.setRegistrationDate(java.time.LocalDateTime.now());

                Member savedMember = memberRepository.save(existingMember);

                return RegisterResponse.builder()
                        .memberId(savedMember.getId())
                        .message("Registration submitted successfully. Please wait for admin approval.")
                        .build();
            }
        }

        Member member = Member.builder()
                .fullName(request.getFullName())
                .mobileNumber(cleanedMobile)
                .dateOfBirth(request.getDateOfBirth())
                .password(passwordEncoder.encode(request.getPassword()))
                .groceryCardNumber(groceryCardNumber)
                .liquorCardNumber(liquorCardNumber)
                .role(Role.CUSTOMER)
                .registrationStatus(RegistrationStatus.PENDING)
                .registrationDate(java.time.LocalDateTime.now())
                .build();

        Member savedMember = memberRepository.save(member);

        return RegisterResponse.builder()
                .memberId(savedMember.getId())
                .message("Registration submitted successfully. Please wait for admin approval.")
                .build();
    }

    //Admin Login
    public AuthResponse loginAdmin(AuthRequest request) {

        Admin admin = adminRepository
                .findByUsername(request.username())
                .orElseThrow(() ->
                        new UnauthorizedException("Invalid username or password"));

        if (!passwordEncoder.matches(request.password(), admin.getPassword())) {
            throw new UnauthorizedException("Invalid username or password");
        }

        String token = jwtUtil.generateToken(
                admin.getUsername(),
                Role.ADMIN.name());

        return new AuthResponse(
                token,
                Role.ADMIN.name(),
                admin.getUsername(),
                null,
                admin.getFullName()
        );
    }

    //Operator Login
    public AuthResponse loginOperator(AuthRequest request) {

        Operator operator = operatorRepository
                .findByOperatorId(request.username())
                .orElseThrow(() ->
                        new UnauthorizedException("Invalid Operator ID or Password"));

        if (!passwordEncoder.matches(request.password(), operator.getPassword())) {
            throw new UnauthorizedException("Invalid Operator ID or Password");
        }

        String token = jwtUtil.generateToken(
                operator.getOperatorId(),
                Role.OPERATOR.name());

        return new AuthResponse(
                token,
                Role.OPERATOR.name(),
                operator.getOperatorId(),
                null,
                operator.getFullName()
        );
    }

    //Customer Login
    //Mobile No and Password
    //Customer Login
//Mobile No and Password
    public AuthResponse loginCustomer(AuthRequest request) {

        Member member = memberRepository
                .findByMobileNumber(request.username())
                .orElseThrow(() ->
                        new UnauthorizedException("Invalid mobile number or password"));

        if (!passwordEncoder.matches(request.password(), member.getPassword())) {
            throw new UnauthorizedException("Invalid mobile number or password");
        }

        if (member.getRegistrationStatus() == RegistrationStatus.PENDING) {
            throw new ForbiddenException(
                    "Your account is pending administrator approval. Please try again after your registration has been approved."
            );
        }

        if (member.getRegistrationStatus() == RegistrationStatus.REJECTED) {
            throw new ForbiddenException(
                    "Your registration was rejected. Please register again."
            );
        }

        if (member.getRegistrationStatus() != RegistrationStatus.APPROVED) {
            throw new UnauthorizedException("Invalid mobile number or password");
        }

        String token = jwtUtil.generateToken(
                member.getMobileNumber(),
                Role.CUSTOMER.name());

        return new AuthResponse(
                token,
                Role.CUSTOMER.name(),
                member.getMobileNumber(),
                member.getId(),
                member.getFullName()
        );
    }}