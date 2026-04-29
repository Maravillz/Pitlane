package com.pitlane.pitlane.controller;

import com.pitlane.pitlane.dto.CreateMaintenanceRequestDto;
import com.pitlane.pitlane.dto.MaintenanceResponseDto;
import com.pitlane.pitlane.model.Maintenance;
import com.pitlane.pitlane.model.User;
import com.pitlane.pitlane.model.Vehicle;
import com.pitlane.pitlane.service.MaintenanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.UUID;

/** Maintenance Controller */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/maintenance")
public class MaintenanceController {

    /** Maintenance Service */
    private final MaintenanceService maintenanceService;

    /**
     * Creates a maintenance for a given vehicle
     * @param user The logged user to validate the request
     * @param vehicleId The given vehicle to associate the maintenance
     * @param maintenanceDto The information needed to create a maintenance
     * @return Returns the id of the created maintenance
     */
    @PostMapping()
    public ResponseEntity<String> createMaintenance(@AuthenticationPrincipal User user, @RequestParam UUID vehicleId, @RequestBody CreateMaintenanceRequestDto maintenanceDto){
        Maintenance maintenance = maintenanceService.createMaintenance(vehicleId, user, maintenanceDto);
        MaintenanceResponseDto resp = MaintenanceResponseDto.builder()
                .id(maintenance.getId())
                .type(maintenance.getType())
                .date(maintenance.getDate())
                .mileage(maintenance.getMileage())
                .costCents(maintenance.getCostCents())
                .notes(maintenance.getNotes())
                .createdAt(maintenance.getCreatedAt())
                .build();
        return ResponseEntity.ok().body(resp.getId().toString());
    }
}
