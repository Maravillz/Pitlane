package com.pitlane.pitlane.dto;

import com.pitlane.pitlane.model.Maintenance;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/** Dto with the full detail of a maintenance including photos and alert */
@Data
@Builder
@AllArgsConstructor
public class MaintenanceDetailResponseDto {

    /** The maintenance id */
    private UUID id;

    /** The maintenance type */
    private Maintenance.MaintenanceType type;

    /** The date when the maintenance was realized */
    private LocalDate date;

    /** The vehicle mileage when the maintenance was made */
    private Integer mileage;

    /** The maintenance cost in cents */
    private Integer costCents;

    /** The notes added to the maintenance with additional info */
    private String notes;

    /** The maintenance creation date */
    private LocalDateTime createdAt;

    /** Photos with id and presigned URL — id needed for individual deletion */
    private List<PhotoDto> photos;

    /** The alert associated to this maintenance, if any */
    private AlertResponseDto alert;

    /** Represents a photo with its id and presigned S3 URL */
    @Data
    @Builder
    @AllArgsConstructor
    public static class PhotoDto {
        private UUID id;
        private String url;
    }
}
