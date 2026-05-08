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

    private final AlertRepository alertRepository;
    private final VehicleRepository vehicleRepository;
    private final DemoService demoService;

    @Value("${pitlane.alerts.warning-km-threshold}")
    private int warningKmThreshold;

    @Value("${pitlane.alerts.warning-days-threshold}")
    private int warningDaysThreshold;

    @Transactional
    public List<AlertResponseDto> getAlertsByUser(User user) {
        List<Vehicle> vehicles = vehicleRepository.findAllByUser(user);
        if (vehicles.isEmpty()) return List.of();

        return vehicles.stream().flatMap(v -> getAlerts(v).stream().map(a -> AlertResponseDto.builder()
                .id(a.getId())
                .maintenanceType(a.getMaintenance().getType())
                .intervalKm(a.getIntervalKm())
                .intervalDays(a.getIntervalDays())
                .resolvedAt(a.getResolvedAt())
                .createdAt(a.getCreatedAt())
                .build())).toList();
    }

    @Transactional
    public void resolveAlert(UUID alertId, User user) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found"));

        if (!alert.getMaintenance().getVehicle().getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        alert.setResolvedAt(LocalDateTime.now());
        alertRepository.save(alert);

        // Record demo change if demo user
        if (demoService.isDemoUser(user)) {
            demoService.recordChange("ALERT_RESOLVED");
        }
    }

    private List<Alert> getAlerts(Vehicle vehicle) {
        List<Maintenance> maintenances = vehicle.getMaintenances();
        if (maintenances == null) return List.of();
        return maintenances.stream()
                .flatMap(m -> alertRepository.findByMaintenance(m).stream()).toList();
    }

    protected List<Alert> getActiveAlerts(Vehicle vehicle) {
        return getAlerts(vehicle).stream().filter(a -> a.getResolvedAt() == null).toList();
    }

    private boolean isCritical(Alert alert, Integer currentMileage, LocalDate maintenanceDate, Integer maintenanceMileage) {
        boolean kmCritical = alert.getIntervalKm() != null &&
                currentMileage >= maintenanceMileage + alert.getIntervalKm();
        boolean dateCritical = alert.getIntervalDays() != null &&
                maintenanceDate.plusDays(alert.getIntervalDays()).isBefore(LocalDate.now());
        return kmCritical || dateCritical;
    }

    private boolean isWarning(Alert alert, Integer currentMileage, LocalDate maintenanceDate, Integer maintenanceMileage) {
        boolean kmWarning = alert.getIntervalKm() != null &&
                currentMileage >= maintenanceMileage + alert.getIntervalKm() - warningKmThreshold;
        boolean dateWarning = alert.getIntervalDays() != null &&
                maintenanceDate.plusDays(alert.getIntervalDays()).minusDays(warningDaysThreshold).isBefore(LocalDate.now());
        return kmWarning || dateWarning;
    }

    protected String calculateAlertStatus(Vehicle vehicle) {
        List<Alert> activeAlerts = getActiveAlerts(vehicle);
        boolean hasWarning = false;

        for (Alert alert : activeAlerts) {
            Maintenance maintenance = alert.getMaintenance();
            if (isCritical(alert, vehicle.getCurrentMileage(), maintenance.getDate(), maintenance.getMileage()))
                return "CRITICAL";
            if (isWarning(alert, vehicle.getCurrentMileage(), maintenance.getDate(), maintenance.getMileage()))
                hasWarning = true;
        }

        return hasWarning ? "WARNING" : "NONE";
    }
}
