package com.csd.backend.repository;

import com.csd.backend.entity.CardType;
import com.csd.backend.entity.Slot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

import java.util.List;
import java.util.Optional;

public interface SlotRepository extends JpaRepository<Slot, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Slot s WHERE s.id = :id")
    Optional<Slot> findByIdWithLock(@Param("id") Long id);

    List<Slot> findByActiveTrueOrderByStartTimeAsc();

    List<Slot> findByCardTypeAndActiveTrueOrderByStartTimeAsc(
            CardType cardType
    );

    List<Slot> findAllByOrderByStartTimeAsc();
}