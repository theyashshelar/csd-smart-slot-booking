package com.csd.backend.repository;

import com.csd.backend.entity.Member;
import com.csd.backend.entity.RegistrationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

import java.util.List;
import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT m FROM Member m WHERE m.id = :id")
    Optional<Member> findByIdWithLock(@Param("id") Long id);

    Optional<Member> findByMobileNumber(String mobileNumber);

    Optional<Member> findByGroceryCardNumber(String groceryCardNumber);

    Optional<Member> findByLiquorCardNumber(String liquorCardNumber);

    @Query("SELECT COUNT(m) > 0 FROM Member m WHERE m.mobileNumber = :mobileNumber AND (m.registrationStatus = com.csd.backend.entity.RegistrationStatus.APPROVED OR m.registrationStatus = com.csd.backend.entity.RegistrationStatus.PENDING)")
    boolean existsActiveByMobileNumber(@Param("mobileNumber") String mobileNumber);

    @Query("SELECT COUNT(m) > 0 FROM Member m WHERE m.groceryCardNumber = :groceryCardNumber AND (m.registrationStatus = com.csd.backend.entity.RegistrationStatus.APPROVED OR m.registrationStatus = com.csd.backend.entity.RegistrationStatus.PENDING)")
    boolean existsActiveByGroceryCardNumber(@Param("groceryCardNumber") String groceryCardNumber);

    @Query("SELECT COUNT(m) > 0 FROM Member m WHERE m.liquorCardNumber = :liquorCardNumber AND (m.registrationStatus = com.csd.backend.entity.RegistrationStatus.APPROVED OR m.registrationStatus = com.csd.backend.entity.RegistrationStatus.PENDING)")
    boolean existsActiveByLiquorCardNumber(@Param("liquorCardNumber") String liquorCardNumber);

    boolean existsByMobileNumber(String mobileNumber);

    boolean existsByGroceryCardNumber(String groceryCardNumber);

    boolean existsByLiquorCardNumber(String liquorCardNumber);

    List<Member> findByFullNameContainingIgnoreCaseOrMobileNumberContainingIgnoreCase(
            String fullName,
            String mobileNumber
    );

    List<Member> findByRegistrationStatus(
            RegistrationStatus registrationStatus
    );

    long countByRegistrationStatus(
            RegistrationStatus registrationStatus
    );
}