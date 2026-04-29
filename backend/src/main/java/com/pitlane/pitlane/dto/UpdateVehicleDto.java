package com.pitlane.pitlane.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/** Dto used to update a vehicle */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateVehicleDto {

    /** The vehicle id */
    private UUID vehicleId;

    /** The vehicle brand */
    private String brand;

    /** The vehicle brand */
    private String model;

    /** The vehicle year */
    @Min(value = 1886, message = "Year must be after 1886")
    @Max(value = 2100, message = "Invalid year")
    private short year;

    /** The vehicle license plate */
    private String plate;
}
