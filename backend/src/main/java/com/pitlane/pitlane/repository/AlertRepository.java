package com.pitlane.pitlane.repository;

import com.pitlane.pitlane.model.Alert;
import com.pitlane.pitlane.model.Maintenance;
import com.pitlane.pitlane.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

/** Alert Repository */
public interface AlertRepository extends JpaRepository<Alert, UUID> {

    /**
     * Finds an alert by the maintenance its associated
     * @param maintenance The maintenance given to find the alert
     * @return An alert if any is associated
     */
    Optional<Alert> findByMaintenance(Maintenance maintenance);

    /**
     * Finds an alert by vehicle and maintenance type to automatically resolve an alert if a maintenance is created
     * @param vehicle The vehicle that had the maintenance created
     * @param type The type of maintenance created
     * @return An alert if there is any associated
     */
    @Query("SELECT a FROM Alert a JOIN a.maintenance m " +
            "WHERE m.vehicle = :vehicle AND m.type = :type AND a.resolvedAt IS NULL")
    Optional<Alert> findActiveByVehicleAndType(@Param("vehicle") Vehicle vehicle, @Param("type") Maintenance.MaintenanceType type);

    /**
     * Deletes all alerts associated to a maintenance — used for demo account reset
     * @param maintenance The maintenance whose alerts will be deleted
     */
    void deleteAllByMaintenance(Maintenance maintenance);
}
