package com.pitlane.pitlane.repository;

import com.pitlane.pitlane.model.MileageLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

/** Mileage logging repository */
public interface MileageLogRepository extends JpaRepository<MileageLog, UUID> { }
