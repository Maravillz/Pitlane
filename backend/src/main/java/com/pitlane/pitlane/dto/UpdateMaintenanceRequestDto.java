package com.pitlane.pitlane.dto;

import com.pitlane.pitlane.model.Maintenance;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

/** Dto with the information to update a maintenance */
@Data
public class UpdateMaintenanceRequestDto {

    /** The maintenance type */
    @NotNull
    private Maintenance.MaintenanceType maintenanceType;

    /** The date when the maintenance was realized */
    @NotNull
    private LocalDate date;

    /** The vehicle mileage when the maintenance was made */
    @NotNull
    private Integer mileage;

    /** The maintenance cost in euros — converted to cents in the service */
    private Integer costCents;

    /** The maintenance notes */
    private String notes;
}
