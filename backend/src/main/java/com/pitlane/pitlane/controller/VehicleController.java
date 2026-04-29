package com.pitlane.pitlane.controller;

import com.pitlane.pitlane.dto.UpdateVehicleDto;
import com.pitlane.pitlane.dto.VehicleDetailResponseDTO;
import com.pitlane.pitlane.dto.VehicleResponseDto;
import com.pitlane.pitlane.model.MileageLog;
import com.pitlane.pitlane.model.User;
import com.pitlane.pitlane.model.Vehicle;
import com.pitlane.pitlane.repository.VehicleRepository;
import com.pitlane.pitlane.service.VehiclesService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/** Vehicle Controller */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/vehicles")
public class VehicleController {

    /** The vehicle service */
    private final VehiclesService vehiclesService;

    /**
     * Creates a vehicle with the information provided
     * @param user The logged user
     * @param vehicle The information of the vehicle to create it
     * @return The created vehicle id
     */
    @PostMapping()
    public ResponseEntity<String> createVehicle(@AuthenticationPrincipal User user, @Valid @RequestBody Vehicle vehicle){
        Vehicle created = vehiclesService.createVehicle(user, vehicle);
        return ResponseEntity.ok().body(created.getId().toString());
    }

    /**
     * Updates any info of the vehicle
     * @param vehicleDto A DTO with information to be updated
     * @param user The logged user
     * @return A object with the new information to update without refresh
     */
    @PatchMapping("/{id}")
    public ResponseEntity<UpdateVehicleDto> updateVehicle(@Valid @RequestBody UpdateVehicleDto vehicleDto, @AuthenticationPrincipal User user){
        return ResponseEntity.ok().body(vehiclesService.updateVehicle(user, vehicleDto));
    }

    /**
     * Gets all vehicles that are associated with the logged user
     * @param user The logged user
     * @return A list of DTO with the needed information for the dashboard page
     */
    @GetMapping()
    public ResponseEntity<List<VehicleResponseDto>> getAllUserVehicles(@AuthenticationPrincipal User user){
        return ResponseEntity.ok(vehiclesService.getUserVehicles(user));
    }

    /**
     * Gets a vehicle from the database by receiving its id
     * @param id The vehicle id
     * @param user The user logged
     * @return A DTO with the vehicle info
     */
    @GetMapping("/{id}")
    public ResponseEntity<Optional<VehicleDetailResponseDTO>> getVehicle(@PathVariable UUID id, @AuthenticationPrincipal User user){
        return ResponseEntity.ok(vehiclesService.getUserVehicle(id, user));
    }

    /**
     * Updates the mileage of a specific vehicle
     * @param id The given vehicle to update
     * @param newMileage The new value for the mileage
     * @param user The logged user
     * @return The new mileage
     */
    @PatchMapping("/{id}/mileage")
    public ResponseEntity<Integer> getVehicle(@PathVariable UUID id, @RequestParam int newMileage, @AuthenticationPrincipal User user){
        return ResponseEntity.ok().body(vehiclesService.setNewMileage(id, user, newMileage));
    }
}
