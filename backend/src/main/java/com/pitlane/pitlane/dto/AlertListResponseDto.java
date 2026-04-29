package com.pitlane.pitlane.dto;

import com.pitlane.pitlane.model.Maintenance;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/** Dto used in the alerts menu to list all the alerts */
@Data
@Builder
@AllArgsConstructor
public class AlertListResponseDto {

    /** Model of the vehicle this alert is associated */
    private String model;

    /** The type of maintenance the alert is associated with */
    private Maintenance.MaintenanceType maintenanceType;

    /** The recommended days between maintenances */
    private Integer intervalDays;

    /** The recommended km between maintenances */
    private Integer intervalKm;

    /** The severity of the alert */
    private String alertStatus;

    /** The resolved date of the alert */
    private LocalDateTime resolvedAt;
}
