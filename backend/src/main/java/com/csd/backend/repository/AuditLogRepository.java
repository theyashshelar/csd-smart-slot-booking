package com.csd.backend.repository;

import com.csd.backend.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findTop5ByOrderByCreatedAtDesc();
}
