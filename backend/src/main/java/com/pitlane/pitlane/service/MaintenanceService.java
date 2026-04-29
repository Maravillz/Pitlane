package com.pitlane.pitlane.service;

import com.pitlane.pitlane.dto.CreateMaintenanceRequestDto;
import com.pitlane.pitlane.model.Alert;
import com.pitlane.pitlane.model.Maintenance;
import com.pitlane.pitlane.model.User;
import com.pitlane.pitlane.model.Vehicle;
import com.pitlane.pitlane.repository.AlertRepository;
import com.pitlane.pitlane.repository.MaintenanceRepository;
import com.pitlane.pitlane.repository.VehicleRepository;
import com.sun.tools.javac.Main;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

/** Maintenance Service */
@Service
@RequiredArgsConstructor
public class MaintenanceService {

    /** Maintenance Repository */
    private final MaintenanceRepository maintenanceRepository;

    /** Vehicle Repository */
    private final VehicleRepository vehicleRepository;

    /** Alert Repository */
    private final AlertRepository alertRepository;

    /**
     * Creates a maintenance for a vehicle if it exists, creates an alert if prompted and resolved any alert pending for a previous maintenance of the same type
     * @param vehicleId The vehicle id
     * @param user The logged user
     * @param maintenanceDto The maintenance object with the information to create it
     * @return The created maintenance
     */
    @Transactional
    public Maintenance createMaintenance(UUID vehicleId, User user, CreateMaintenanceRequestDto maintenanceDto) {

        Vehicle vehicle = vehicleRepository.findByIdAndUser(vehicleId, user)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        if (maintenanceRepository.findByTypeAndDateAndVehicle(maintenanceDto.getMaintenanceType(), maintenanceDto.getDate(), vehicle).isPresent()) {
            throw new RuntimeException("Maintenance already exists for this type and date");
        }

        Maintenance newMaintenance = Maintenance.builder()
                .vehicle(vehicle)
                .type(maintenanceDto.getMaintenanceType())
                .date(maintenanceDto.getDate())
                .mileage(maintenanceDto.getMileage())
                .costCents(maintenanceDto.getCostCents())
                .notes(maintenanceDto.getNotes())
                .createdAt(LocalDateTime.now())
                .build();

        Maintenance saved = maintenanceRepository.save(newMaintenance);

        alertRepository.findActiveByVehicleAndType(vehicle, maintenanceDto.getMaintenanceType())
                .ifPresent(existingAlert -> {
                    existingAlert.setResolvedAt(LocalDateTime.now());
                    alertRepository.save(existingAlert);
                });

        if (maintenanceDto.getCreateAlert() == true &&
                (maintenanceDto.getAlertIntervalKm() != null || maintenanceDto.getAlertIntervalDays() != null)) {
            Alert alert = Alert.builder()
                    .maintenance(saved)
                    .intervalKm(maintenanceDto.getAlertIntervalKm())
                    .intervalDays(maintenanceDto.getAlertIntervalDays())
                    .createdAt(LocalDateTime.now())
                    .build();
            alertRepository.save(alert);
        }

        return saved;
    }
}
