package com.csd.backend.security;

import com.csd.backend.entity.Admin;
import com.csd.backend.entity.Member;
import com.csd.backend.entity.Operator;
import com.csd.backend.repository.AdminRepository;
import com.csd.backend.repository.MemberRepository;
import com.csd.backend.repository.OperatorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final AdminRepository adminRepository;
    private final OperatorRepository operatorRepository;
    private final MemberRepository memberRepository;

    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        Admin admin = adminRepository.findByUsername(username).orElse(null);

        if (admin != null) {
            return new User(
                    admin.getUsername(),
                    admin.getPassword(),
                    List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
            );
        }

        Operator operator = operatorRepository.findByOperatorId(username).orElse(null);

        if (operator != null) {
            return new User(
                    operator.getOperatorId(),
                    operator.getPassword(),
                    List.of(new SimpleGrantedAuthority("ROLE_OPERATOR"))
            );
        }

        Member member = memberRepository.findByMobileNumber(username).orElse(null);

        if (member != null) {
            return new User(
                    member.getMobileNumber(),
                    member.getPassword(),
                    List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"))
            );
        }

        throw new UsernameNotFoundException("User not found");
    }
}