package com.pitlane.pitlane.repository;

import com.pitlane.pitlane.model.Maintenance;
import com.pitlane.pitlane.model.MaintenancePhoto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

/** Maintenance Photo Repository */
public interface MaintenancePhotoRepository extends JpaRepository<MaintenancePhoto, UUID> {

    /**
     * Finds all photos associated to a maintenance
     * @param maintenance The maintenance to find photos for
     * @return A list of photos
     */
    List<MaintenancePhoto> findAllByMaintenance(Maintenance maintenance);

    /**
     * Deletes all photos associated to a maintenance
     * @param maintenance The maintenance whose photos will be deleted
     */
    void deleteAllByMaintenance(Maintenance maintenance);
}
