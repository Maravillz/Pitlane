package com.pitlane.pitlane.repository;

import com.pitlane.pitlane.model.DemoSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

/** Demo Session Repository */
public interface DemoSessionRepository extends JpaRepository<DemoSession, UUID> {

    /**
     * Finds the most recent open session (no ended_at)
     */
    Optional<DemoSession> findTopByEndedAtIsNullOrderByStartedAtDesc();
}
