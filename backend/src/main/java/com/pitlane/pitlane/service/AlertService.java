package com.pitlane.pitlane.service;

import com.pitlane.pitlane.dto.AlertResponseDto;
import com.pitlane.pitlane.model.Alert;
import com.pitlane.pitlane.model.Maintenance;
import com.pitlane.pitlane.model.User;
import com.pitlane.pitlane.model.Vehicle;
import com.pitlane.pitlane.repository.AlertRepository;
import com.pitlane.pitlane.repository.VehicleRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/** Alert Service */
@Service
@RequiredArgsConstructor
public class AlertService {

    /** Alert repository */
    private final AlertRepository alertRepository;

    /** Vehicle Repository */
    private final VehicleRepository vehicleRepository;

    /** Warning km in the settings */
    @Value("${pitlane.alerts.warning-km-threshold}")
    private int warningKmThreshold;

    /** Warning date in the settings */
    @Value("${pitlane.alerts.warning-days-threshold}")
    private int warningDaysThreshold;

    /**
     * Extracts all the vehicles from the user and uses the method getAlerts to extract alerts from the maintenances from those vehicles
     * @param user The user That made the request
     * @return A list of Alerts DTO for the alert page
     */
    @Transactional
    public List<AlertResponseDto> getAlertsByUser(User user){
        List<Vehicle> vehicles = vehicleRepository.findAllByUser(user);
        if(vehicles.isEmpty())
            return List.of();

        return vehicles.stream().flatMap(v -> getAlerts(v).stream().map(a -> AlertResponseDto.builder()
                .id(a.getId())
                .maintenanceType(a.getMaintenance().getType())
                .intervalKm(a.getIntervalKm())
                .intervalDays(a.getIntervalDays())
                .resolvedAt(a.getResolvedAt())
                .createdAt(a.getCreatedAt())
                .build())).toList();
    }

    /**
     * Checks if the user that made the request owns the alert and sets the alert resolvedAt field with the current date
     * @param alertId The identification of the alert to be resolved
     * @param user The user tht made the request
     */
    @Transactional
    public void resolveAlert(UUID alertId, User user) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found"));

        if (!alert.getMaintenance().getVehicle().getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        alert.setResolvedAt(LocalDateTime.now());
        alertRepository.save(alert);
    }

    /**
     * Gets all alerts associated to a vehicle
     * @param vehicle The vehicle with the alerts associated
     * @return A list of alerts if there is any or a empty list
     */
    private List<Alert> getAlerts(Vehicle vehicle) {
        List<Maintenance> maintenances = vehicle.getMaintenances();
        if (maintenances == null) return List.of();

        return maintenances.stream()
                .flatMap(m -> alertRepository.findByMaintenance(m).stream()).toList();
    }

    /**
     * Returns the active alerts for a vehicle. Uses the get alert method and filters the alerts without a resolved date
     * @param vehicle The vehicle with the alerts associated
     * @return A list of alerts without a resolved time
     */
    protected List<Alert> getActiveAlerts(Vehicle vehicle) {
        return getAlerts(vehicle).stream().filter(a -> a.getResolvedAt() == null).toList();
    }

    /**
     * Checks if the current km exceeds the limit km or the date is after the limit date
     * @param alert The alert being analyzed
     * @param currentMileage The current mileage of the vehicle
     * @param maintenanceDate The date when the maintenance was made
     * @param maintenanceMileage The mileage the vehicle had when the maintenance was made
     * @return True if it is critical
     */
    private boolean isCritical(Alert alert, Integer currentMileage, LocalDate maintenanceDate, Integer maintenanceMileage) {
        boolean kmCritical = alert.getIntervalKm() != null &&
                currentMileage >= maintenanceMileage + alert.getIntervalKm();
        boolean dateCritical = alert.getIntervalDays() != null &&
                maintenanceDate.plusDays(alert.getIntervalDays()).isBefore(LocalDate.now());
        return kmCritical || dateCritical;
    }

    /**
     * Checks if the current km is after the warning km but before the limit km and checks if the date is after the date km and before the limit date
     * @param alert The alert being analyzed
     * @param currentMileage The current mileage of the vehicle
     * @param maintenanceDate The date when the maintenance was made
     * @param maintenanceMileage The mileage the vehicle had when the maintenance was made
     * @return True if it is a warning
     */
    private boolean isWarning(Alert alert, Integer currentMileage, LocalDate maintenanceDate, Integer maintenanceMileage) {
        boolean kmWarning = alert.getIntervalKm() != null &&
                currentMileage >= maintenanceMileage + alert.getIntervalKm() - warningKmThreshold;
        boolean dateWarning = alert.getIntervalDays() != null &&
                maintenanceDate.plusDays(alert.getIntervalDays()).minusDays(warningDaysThreshold).isBefore(LocalDate.now());
        return kmWarning || dateWarning;
    }

    /**
     * Loops all the alerts and returns the most important status present for the vehicle CRITICAL > WARNING > NONE
     * @param vehicle The vehicle with the alerts associated
     * @return The string containing the most important status
     */
    protected String calculateAlertStatus(Vehicle vehicle) {
        List<Alert> activeAlerts = getActiveAlerts(vehicle);
        boolean hasWarning = false;

        for (Alert alert : activeAlerts) {
            Maintenance maintenance = alert.getMaintenance();
            if (isCritical(alert, vehicle.getCurrentMileage(), maintenance.getDate(), maintenance.getMileage())) return "CRITICAL";
            if (isWarning(alert, vehicle.getCurrentMileage(), maintenance.getDate(), maintenance.getMileage())) hasWarning = true;
        }

        return hasWarning ? "WARNING" : "NONE";
    }
}
