package com.pitlane.pitlane.repository;

import com.pitlane.pitlane.model.DemoChange;
import com.pitlane.pitlane.model.DemoSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

/** Demo Change Repository */
public interface DemoChangeRepository extends JpaRepository<DemoChange, UUID> {

    /**
     * Finds all changes for a given session
     */
    List<DemoChange> findAllBySession(DemoSession session);
}
