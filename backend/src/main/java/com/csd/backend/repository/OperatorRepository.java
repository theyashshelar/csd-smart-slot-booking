package com.csd.backend.repository;

import com.csd.backend.entity.Booking;
import com.csd.backend.entity.BookingStatus;
import com.csd.backend.entity.Operator;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OperatorRepository extends JpaRepository<Operator, Long> {

    Optional<Operator> findByOperatorId(String operatorId);
}