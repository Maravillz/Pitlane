package com.pitlane.pitlane.dto;

import com.pitlane.pitlane.model.Maintenance;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

/** Dto containing the information of an alert */
@Data
@Builder
@AllArgsConstructor
public class AlertResponseDto {

    /** The id of the alert */
    private UUID id;

    /** The type of the maintenance the alert is associated with */
    private Maintenance.MaintenanceType maintenanceType;

    /** The recommended km between maintenances */
    private Integer intervalKm;

    /** The recommended days between maintenances */
    private Integer intervalDays;

    /** The date of resolution of the alert */
    private LocalDateTime resolvedAt;

    /** The day the alert was created */
    private LocalDateTime createdAt;
}