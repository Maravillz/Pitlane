package com.pitlane.pitlane.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

/** Dto used to transmit information about the maintenance costs for the user dashboard */
@Data
@Builder
@AllArgsConstructor
public class CostsSummaryDto {

    /** Total money spent on maintenance */
    private Integer totalCents;

    /** A list of costs organized by category */
    private List<CategoryCostDto> byCategory;

    /** A list of costs organized by vehicles */
    private List<VehicleCostDto> byVehicle;

    /** A Dto that organizes costs by category with total spent and the percentage of the total spent */
    @Data
    @Builder
    @AllArgsConstructor
    public static class CategoryCostDto {
        /** The category name */
        private String category;

        /** Total money spend on that category */
        private Integer totalCents;

        /** Percentage of total spent on all categories */
        private Integer percentage;
    }

    /** A Dto that organizes costs by vehicle with the vehicle id and name, the total spent and the percentage of the total spent */
    @Data
    @Builder
    @AllArgsConstructor
    public static class VehicleCostDto {
        /** The vehicle id */
        private UUID vehicleId;

        /** The vehicle name */
        private String vehicleName;

        /** Total money spent on the vehicle */
        private Integer totalCents;

        /** The percentage of all money spent on all the user vehicles */
        private Integer percentage;
    }
}
