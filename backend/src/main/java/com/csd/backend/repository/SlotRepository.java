package com.csd.backend.repository;

import com.csd.backend.entity.Slot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SlotRepository extends JpaRepository<Slot, Long> {

    List<Slot> findByActiveTrueOrderByStartTimeAsc();

}