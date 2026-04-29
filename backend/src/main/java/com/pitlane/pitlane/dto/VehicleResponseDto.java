package com.pitlane.pitlane.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

/** The dto used for the dashboard vehicle info */
@Data
@Builder
@AllArgsConstructor
public class VehicleResponseDto {

    /** The vehicle id */
    private UUID id;

    /** The vehicle brand */
    private String brand;

    /** The vehicle model */
    private String model;

    /** The vehicle manufacturing year */
    private Short year;

    /** The vehicle license plate */
    private String plate;

    /** The vehicle current mileage */
    private Integer currentMileage;

    /** The vehicle creation date */
    private LocalDateTime createdAt;

    /** The most important alert status for the vehicle */
    private String alertStatus;

    /** The alert message for the most important status */
    private String alertMessage;

    /** Total maintenances made for the vehicle this month */
    private Short totalMonthMaintenances;

    /** The total money spent on maintenances this month for the vehicle */
    private Integer totalMonthSpent;

    /** The total alerts set for the vehicle this month */
    private Short totalMonthAlerts;
}
