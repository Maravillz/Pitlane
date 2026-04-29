package com.pitlane.pitlane.dto;

import com.pitlane.pitlane.model.Maintenance;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/** Dto with the basic information of a maintenance */
@Data
@Builder
@AllArgsConstructor
public class MaintenanceResponseDto {

    /** The maintenance id */
    private UUID id;

    /** The maintenance type */
    private Maintenance.MaintenanceType type;

    /** The date when the maintenance was realized */
    private LocalDate date;

    /** The vehicle mileage when the maintenance was made */
    private Integer mileage;

    /** The maintenance cost */
    private Integer costCents;

    /** The notes added to the maintenance with additional info */
    private String notes;

    /** The maintenance creation date */
    private LocalDateTime createdAt;
}