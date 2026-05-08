package com.pitlane.pitlane.controller;

import com.pitlane.pitlane.dto.CreateMaintenanceRequestDto;
import com.pitlane.pitlane.dto.MaintenanceDetailResponseDto;
import com.pitlane.pitlane.dto.UpdateMaintenanceRequestDto;
import com.pitlane.pitlane.model.Maintenance;
import com.pitlane.pitlane.model.User;
import com.pitlane.pitlane.service.MaintenanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

/** Maintenance Controller */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/maintenance")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    /**
     * Creates a maintenance for a given vehicle, optionally with photos
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> createMaintenance(
            @AuthenticationPrincipal User user,
            @RequestParam UUID vehicleId,
            @RequestPart("maintenance") CreateMaintenanceRequestDto maintenanceDto,
            @RequestPart(value = "photos", required = false) List<MultipartFile> photos
    ) {
        Maintenance maintenance = maintenanceService.createMaintenance(vehicleId, user, maintenanceDto, photos);
        return ResponseEntity.ok(maintenance.getId().toString());
    }

    /**
     * Gets the full detail of a maintenance including photos and associated alert
     */
    @GetMapping("/{id}")
    public ResponseEntity<MaintenanceDetailResponseDto> getMaintenanceDetail(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(maintenanceService.getMaintenanceDetail(id, user));
    }

    /**
     * Updates the fields of an existing maintenance and optionally adds new photos
     */
    @PatchMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MaintenanceDetailResponseDto> updateMaintenance(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id,
            @RequestPart("maintenance") UpdateMaintenanceRequestDto dto,
            @RequestPart(value = "photos", required = false) List<MultipartFile> newPhotos
    ) {
        return ResponseEntity.ok(maintenanceService.updateMaintenance(id, user, dto, newPhotos));
    }

    /**
     * Deletes a maintenance and all its associated photos from S3 and DB
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMaintenance(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id
    ) {
        maintenanceService.deleteMaintenance(id, user);
        return ResponseEntity.noContent().build();
    }

    /**
     * Deletes a single photo from a maintenance
     */
    @DeleteMapping("/photo/{photoId}")
    public ResponseEntity<Void> deletePhoto(
            @AuthenticationPrincipal User user,
            @PathVariable UUID photoId
    ) {
        maintenanceService.deletePhoto(photoId, user);
        return ResponseEntity.noContent().build();
    }
}
