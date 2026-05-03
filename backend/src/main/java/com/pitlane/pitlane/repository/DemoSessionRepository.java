package com.pitlane.pitlane.repository;

import com.pitlane.pitlane.model.DemoSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/** Demo Session Repository */
public interface DemoSessionRepository extends JpaRepository<DemoSession, UUID> {

    /**
     * Finds the most recent open session (no ended_at)
     */
    Optional<DemoSession> findTopByEndedAtIsNullOrderByStartedAtDesc();

    @Query("SELECT s FROM DemoSession s WHERE CAST(s.startedAt AS date) = CAST(:date AS date)")
    List<DemoSession> findAllByDate(@Param("date") LocalDateTime date);
}
