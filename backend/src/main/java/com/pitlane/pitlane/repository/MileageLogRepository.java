package com.pitlane.pitlane.repository;

import com.pitlane.pitlane.model.MileageLog;
import com.pitlane.pitlane.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

/** Mileage logging repository */
public interface MileageLogRepository extends JpaRepository<MileageLog, UUID> {

    /**
     * Deletes all mileage logs associated to a vehicle — used for demo account reset
     * @param vehicle The vehicle whose mileage logs will be deleted
     */
    void deleteAllByVehicle(Vehicle vehicle);
}
