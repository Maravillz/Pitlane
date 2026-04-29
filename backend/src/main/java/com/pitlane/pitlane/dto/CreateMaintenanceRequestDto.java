package com.pitlane.pitlane.dto;

import com.pitlane.pitlane.model.Maintenance;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/** Dto representing a maintenance creating with information about the maintenance and the alert */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateMaintenanceRequestDto {

    /** The type of the maintenance created */
    private Maintenance.MaintenanceType maintenanceType;

    /** The date when the maintenance was made */
    private LocalDate date;

    /** The mileage of the vehicle at the time of the maintenance */
    private Integer mileage;

    /** The total cost of the maintenance */
    private Integer costCents;

    /** Notes added relative to the maintenance */
    private String notes;

    /** A boolean that indicated if the user intends to create an alert for the maintenance */
    private Boolean createAlert;

    /** The km recommended between maintenances for that type of maintenance  */
    private Integer alertIntervalKm;

    /** The number of days recommended between maintenances for that type of maintenance */
    private Integer alertIntervalDays;
}