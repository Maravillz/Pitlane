package com.pitlane.pitlane.repository;

import com.pitlane.pitlane.model.Maintenance;
import com.pitlane.pitlane.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/** Maintenance Repository */
public interface MaintenanceRepository extends JpaRepository<Maintenance, UUID> {

    /**
     * Finds all maintenances associated to a vehicle
     * @param vehicle The given vehicle
     * @return A list with all maintenances associated. Can be empty if there isn't any
     */
    List<Maintenance> findAllByVehicle(Vehicle vehicle);

    /**
     * Finds a maintenance for a specific vehicle, date and type, assuring the user can't create the same maintenance twice
     * @param type The type of the maintenance
     * @param date The date when the maintenance occurred
     * @param vehicle The given vehicle associated to the maintenance
     * @return A maintenance if any is present
     */
    Optional<Maintenance> findByTypeAndDateAndVehicle(Maintenance.MaintenanceType type, LocalDate date, Vehicle vehicle);

    /**
     * Deletes all maintenances associated to a vehicle — used for demo account reset
     * @param vehicle The vehicle whose maintenances will be deleted
     */
    void deleteAllByVehicle(Vehicle vehicle);
}
