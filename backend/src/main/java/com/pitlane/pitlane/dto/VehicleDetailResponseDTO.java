package com.pitlane.pitlane.dto;

import com.pitlane.pitlane.model.Alert;
import com.pitlane.pitlane.model.Maintenance;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/** Dto representing the vehicle info for the vehicle detail page */
@Data
@Builder
@AllArgsConstructor
public class VehicleDetailResponseDTO {

    /** The vehicle model */
    private String model;

    /** The vehicle brand */
    private String brand;

    /** The vehicle year */
    private short year;

    /** The vehicle license plate */
    private String plate;

    /** The vehicle mileage */
    private String mileage;

    /** Last date the vehicle mileage was updated */
    private LocalDateTime lastUpdated;

    /** The number of active alerts for maintenances for the vehicle */
    private short nrActiveAlerts;

    /** The total number of all maintenances for the vehicle */
    private short totalMaintenances;

    /** The total cost of all maintenances related to the vehicle */
    private Integer totalCosts;

    /** The total number of all alerts for the vehicle */
    private short totalAlerts;

    /** A list of dto alerts with the necessary info */
    private List<AlertResponseDto> alerts;

    /** A list of dto maintenances with the necessary info */
    private List<MaintenanceResponseDto> maintenances;
}
