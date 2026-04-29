package com.pitlane.pitlane.service;

import com.pitlane.pitlane.dto.*;
import com.pitlane.pitlane.model.*;
import com.pitlane.pitlane.repository.AlertRepository;
import com.pitlane.pitlane.repository.MaintenanceRepository;
import com.pitlane.pitlane.repository.MileageLogRepository;
import com.pitlane.pitlane.repository.VehicleRepository;
import com.sun.tools.javac.Main;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Stream;

/** Vehicle Service */
@Service
@RequiredArgsConstructor
public class VehiclesService {

    /** Vehicle Repository */
    private final VehicleRepository vehicleRepository;

    /** Mileage Repository */
    private final MileageLogRepository mileageLogRepository;

    /** Alert Repository to find by maintenance */
    private final AlertRepository alertRepository;

    /** Alert Service to reuse the existing methods */
    private final AlertService alertService;

    /** Maintenance Repository */
    private final MaintenanceRepository maintenanceRepository;

    /**
     * Creates a vehicle for the logged user
     * @param user The logged user
     * @param vehicle The information necessary to create the vehicle
     * @return The created vehicle
     */
    @Transactional
    public Vehicle createVehicle(User user, Vehicle vehicle){

        Vehicle newVehicle = Vehicle.builder()
                                    .user(user)
                                    .brand(vehicle.getBrand())
                                    .model(vehicle.getModel())
                                    .year(vehicle.getYear())
                                    .plate(vehicle.getPlate())
                                    .currentMileage(vehicle.getCurrentMileage())
                                    .createdAt(LocalDateTime.now())
                                    .build();

        return vehicleRepository.save(newVehicle);
    }

    /**
     * Updates a vehicle with the provided information
     * @param user The logged user
     * @param vehicleDto The vehicle creation information
     * @return The object with the new information to update the frontend without a refresh
     */
    @Transactional
    public UpdateVehicleDto updateVehicle(User user, UpdateVehicleDto vehicleDto){
        Vehicle vehicle = vehicleRepository.findByIdAndUser(vehicleDto.getVehicleId(), user)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        if(!vehicleDto.getBrand().equalsIgnoreCase(vehicle.getBrand()))
            vehicle.setBrand(vehicleDto.getBrand());

        if(!vehicleDto.getModel().equalsIgnoreCase(vehicle.getModel()))
            vehicle.setModel(vehicleDto.getModel());

        if(vehicleDto.getYear() != vehicle.getYear())
            vehicle.setYear(vehicleDto.getYear());

        if(!vehicleDto.getPlate().equalsIgnoreCase(vehicle.getPlate()))
            vehicle.setPlate(vehicleDto.getPlate());

        vehicleRepository.save(vehicle);

        return vehicleDto;
    }

    /**
     * Gets all the vehicles for the logged user in the dashboard page
     * @param user The logged user
     * @return A list with all the user vehicles, returning empty if there is no vehicle associated to the user
     */
    @Transactional
    public List<VehicleResponseDto> getUserVehicles(User user){
        return vehicleRepository.findAllByUser(user).stream()
                .map(v ->  {

                    List<Maintenance> maintList = maintenanceRepository.findAllByVehicle(v).stream().filter((m) -> {
                        LocalDate maintenanceDate = m.getDate();
                        LocalDate currentDate = LocalDate.now();
                        return maintenanceDate.getMonth() == currentDate.getMonth() && maintenanceDate.getYear() == currentDate.getYear();
                    }).toList();

                    return VehicleResponseDto.builder()
                        .id(v.getId())
                        .brand(v.getBrand())
                        .model(v.getModel())
                        .year(v.getYear())
                        .plate(v.getPlate())
                        .currentMileage(v.getCurrentMileage())
                        .createdAt(v.getCreatedAt())
                        .alertStatus(alertService.calculateAlertStatus(v))
                        .alertMessage(calculateAlertMessage(v))
                        .totalMonthMaintenances((short) maintList.size())
                        .totalMonthSpent(maintList.stream().mapToInt(Maintenance::getCostCents).sum())
                        .totalMonthAlerts((short) (maintList.stream().filter(m -> alertRepository.findByMaintenance(m).isPresent()).map(m -> {
                            Optional<Alert> alert = alertRepository.findByMaintenance(m);
                            LocalDate alertDate = alert.get().getCreatedAt().toLocalDate();
                            int addDays = alert.get().getIntervalDays() != null ? alert.get().getIntervalDays() : 0;
                            LocalDate currentDate = LocalDate.now();
                            LocalDate alertTargetDate = alertDate.plusDays(addDays);
                            return alertTargetDate.getMonth() == currentDate.getMonth() && alertTargetDate.getYear() == currentDate.getYear() ? alert.get() : null;
                        })).toList().size())
                        .build();
                })
                .toList();
    }

    /**
     * Gets a vehicle by an id and the user who owns it
     * @param id The vehicle id
     * @param user The logged user
     * @return The vehicle detail if it is present
     */
    @Transactional
    public Optional<VehicleDetailResponseDTO> getUserVehicle(UUID id, User user) {

        return vehicleRepository.findByIdAndUser(id, user)
                .map(vehicle -> {
                    List<Maintenance> maintenances = vehicle.getMaintenances();
                    return VehicleDetailResponseDTO.builder()
                                    .model(vehicle.getModel())
                                    .brand(vehicle.getBrand())
                                    .year(vehicle.getYear())
                                    .plate(vehicle.getPlate())
                                    .lastUpdated(vehicle.getMileageLogs().stream()
                                            .max(Comparator.comparing(MileageLog::getRecordedAt))
                                            .map(MileageLog::getRecordedAt)
                                            .orElse(vehicle.getCreatedAt()))
                                    .mileage(vehicle.getCurrentMileage().toString())
                                    .nrActiveAlerts((short) alertService.getActiveAlerts(vehicle).size())
                                    .totalMaintenances((short) maintenances.size())
                                    .totalCosts(maintenances.stream()
                                            .filter(m -> m.getCostCents() != null)
                                            .mapToInt(Maintenance::getCostCents)
                                            .sum())
                                    .totalAlerts((short) maintenances.stream()
                                            .filter(m -> alertRepository.findByMaintenance(m).isPresent())
                                            .count())
                                    .alerts(alertService.getActiveAlerts(vehicle).stream()
                                            .map(a -> AlertResponseDto.builder()
                                                    .id(a.getId())
                                                    .maintenanceType(a.getMaintenance().getType())
                                                    .intervalKm(a.getIntervalKm())
                                                    .intervalDays(a.getIntervalDays())
                                                    .resolvedAt(a.getResolvedAt())
                                                    .createdAt(a.getCreatedAt())
                                                    .build())
                                            .toList())
                                    .maintenances(maintenances.stream()
                                            .map(m -> MaintenanceResponseDto.builder()
                                                    .id(m.getId())
                                                    .type(m.getType())
                                                    .date(m.getDate())
                                                    .mileage(m.getMileage())
                                                    .costCents(m.getCostCents())
                                                    .notes(m.getNotes())
                                                    .createdAt(m.getCreatedAt())
                                                    .build())
                                            .toList())
                                    .build();
                        }
                );
    }

    /**
     * Generates an alert message to show in the vehicle card based on its alerts
     * @param vehicle The vehicle in the card
     * @return A string with the message
     */
    public String calculateAlertMessage(Vehicle vehicle) {
        List<Alert> activeAlerts = alertService.getActiveAlerts(vehicle);

        return activeAlerts.stream()
                .map(alert -> {
                    Maintenance maintenance = alert.getMaintenance();
                    if (alert.getIntervalKm() != null) {
                        int kmRemaining = maintenance.getMileage() + alert.getIntervalKm() - vehicle.getCurrentMileage();
                        return maintenance.getType() + " dashboard.in " + kmRemaining + " km";
                    }
                    if (alert.getIntervalDays() != null) {
                        long daysRemaining = ChronoUnit.DAYS.between(LocalDate.now(),
                                maintenance.getDate().plusDays(alert.getIntervalDays()));
                        return maintenance.getType() + " dashboard.in " + daysRemaining + " dashboard.days";
                    }
                    return null;
                })
                .filter(Objects::nonNull)
                .findFirst()
                .orElse(null);
    }

    /**
     * Updates vehicle mileage and adds the old mileage to the logs
     * @param vehicleId The vehicle id
     * @param user The logged user
     * @param newMileage The new mileage to update
     * @return The new mileage updated
     */
    @Transactional
    public int setNewMileage (UUID vehicleId, User user, int newMileage){
        Vehicle vehicle = vehicleRepository.findByIdAndUser(vehicleId, user)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        vehicle.setCurrentMileage(newMileage);
        vehicleRepository.save(vehicle);

        mileageLogRepository.save(MileageLog.builder()
                .vehicle(vehicle)
                .value(newMileage)
                .recordedAt(LocalDateTime.now())
                .build());

        return newMileage;
    }
}
