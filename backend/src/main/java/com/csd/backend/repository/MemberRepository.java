package com.csd.backend.repository;

import com.csd.backend.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {

    Optional<Member> findByMobileNumber(String mobileNumber);

    boolean existsByMobileNumber(String mobileNumber);

    boolean existsByGroceryCardNumber(String groceryCardNumber);

    boolean existsByLiquorCardNumber(String liquorCardNumber);

    List<Member> findByFullNameContainingIgnoreCaseOrMobileNumberContainingIgnoreCase(
            String fullName,
            String mobileNumber
    );
}