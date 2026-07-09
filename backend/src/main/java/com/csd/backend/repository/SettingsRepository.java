package com.csd.backend.repository;

import com.csd.backend.entity.Settings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.List;

public interface SettingsRepository extends JpaRepository<Settings, Long> {

    @Query("select s from Settings s where s.keyName = :keyName")
    List<Settings> findAllByKeyName(@Param("keyName") String keyName);

    default Optional<Settings> findByKeyName(String keyName) {
        List<Settings> list = findAllByKeyName(keyName);
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }

}
