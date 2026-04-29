package com.pitlane.pitlane.service;

import com.pitlane.pitlane.dto.CreateMaintenanceRequestDto;
import com.pitlane.pitlane.model.*;
import com.pitlane.pitlane.repository.AlertRepository;
import com.pitlane.pitlane.repository.MaintenanceRepository;
import com.pitlane.pitlane.repository.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for MaintenanceService.
 * Tests cover maintenance creation, duplicate prevention, alert creation and automatic alert resolution.
 * Repositories are mocked to isolate the service logic from the database.
 */
@ExtendWith(MockitoExtension.class)
class MaintenanceServiceTest {

    @Mock
    private MaintenanceRepository maintenanceRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private AlertRepository alertRepository;

    @InjectMocks
    private MaintenanceService maintenanceService;

    private User user;
    private Vehicle vehicle;
    private CreateMaintenanceRequestDto dto;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(UUID.randomUUID())
                .email("test@pitlane.com")
                .displayName("Test User")
                .createdAt(LocalDateTime.now())
                .build();

        vehicle = Vehicle.builder()
                .id(UUID.randomUUID())
                .user(user)
                .brand("Honda")
                .model("Civic")
                .year((short) 1998)
                .currentMileage(100000)
                .createdAt(LocalDateTime.now())
                .build();

        dto = new CreateMaintenanceRequestDto();
        dto.setMaintenanceType(Maintenance.MaintenanceType.OIL_CHANGE);
        dto.setDate(LocalDate.now());
        dto.setMileage(100000);
        dto.setCostCents(4500);
        dto.setCreateAlert(false);
    }

    // ─── createMaintenance ───────────────────────────────────────────────────

    /**
     * Creating a valid maintenance for an existing vehicle should save and return the maintenance
     */
    @Test
    void createMaintenance_validRequest_savesMaintenance() {
        when(vehicleRepository.findByIdAndUser(vehicle.getId(), user)).thenReturn(Optional.of(vehicle));
        when(maintenanceRepository.findByTypeAndDateAndVehicle(any(), any(), any())).thenReturn(Optional.empty());
        when(alertRepository.findActiveByVehicleAndType(any(), any())).thenReturn(Optional.empty());
        when(maintenanceRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Maintenance result = maintenanceService.createMaintenance(vehicle.getId(), user, dto);

        assertThat(result.getType()).isEqualTo(Maintenance.MaintenanceType.OIL_CHANGE);
        assertThat(result.getMileage()).isEqualTo(100000);
        assertThat(result.getCostCents()).isEqualTo(4500);
        verify(maintenanceRepository).save(any(Maintenance.class));
    }

    /**
     * Creating a maintenance for a vehicle that does not exist or does not belong to the user should throw an exception
     */
    @Test
    void createMaintenance_vehicleNotFound_throwsException() {
        when(vehicleRepository.findByIdAndUser(any(), any())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> maintenanceService.createMaintenance(vehicle.getId(), user, dto))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Vehicle not found");

        verify(maintenanceRepository, never()).save(any());
    }

    /**
     * Creating a maintenance with the same type and date for the same vehicle should throw an exception
     */
    @Test
    void createMaintenance_duplicateTypeAndDate_throwsException() {
        when(vehicleRepository.findByIdAndUser(vehicle.getId(), user)).thenReturn(Optional.of(vehicle));
        when(maintenanceRepository.findByTypeAndDateAndVehicle(any(), any(), any()))
                .thenReturn(Optional.of(Maintenance.builder().build()));

        assertThatThrownBy(() -> maintenanceService.createMaintenance(vehicle.getId(), user, dto))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Maintenance already exists for this type and date");

        verify(maintenanceRepository, never()).save(any());
    }

    /**
     * When createAlert is true and intervals are provided, an alert should be created alongside the maintenance
     */
    @Test
    void createMaintenance_withAlert_savesAlert() {
        dto.setCreateAlert(true);
        dto.setAlertIntervalKm(10000);
        dto.setAlertIntervalDays(365);

        Maintenance savedMaintenance = Maintenance.builder()
                .id(UUID.randomUUID())
                .vehicle(vehicle)
                .type(dto.getMaintenanceType())
                .date(dto.getDate())
                .mileage(dto.getMileage())
                .createdAt(LocalDateTime.now())
                .build();

        when(vehicleRepository.findByIdAndUser(vehicle.getId(), user)).thenReturn(Optional.of(vehicle));
        when(maintenanceRepository.findByTypeAndDateAndVehicle(any(), any(), any())).thenReturn(Optional.empty());
        when(alertRepository.findActiveByVehicleAndType(any(), any())).thenReturn(Optional.empty());
        when(maintenanceRepository.save(any())).thenReturn(savedMaintenance);

        maintenanceService.createMaintenance(vehicle.getId(), user, dto);

        verify(alertRepository).save(any(Alert.class));
    }

    /**
     * When createAlert is false, no alert should be created even if intervals are provided
     */
    @Test
    void createMaintenance_withoutAlert_doesNotSaveAlert() {
        dto.setCreateAlert(false);
        dto.setAlertIntervalKm(10000);

        Maintenance savedMaintenance = Maintenance.builder()
                .id(UUID.randomUUID())
                .vehicle(vehicle)
                .type(dto.getMaintenanceType())
                .date(dto.getDate())
                .mileage(dto.getMileage())
                .createdAt(LocalDateTime.now())
                .build();

        when(vehicleRepository.findByIdAndUser(vehicle.getId(), user)).thenReturn(Optional.of(vehicle));
        when(maintenanceRepository.findByTypeAndDateAndVehicle(any(), any(), any())).thenReturn(Optional.empty());
        when(alertRepository.findActiveByVehicleAndType(any(), any())).thenReturn(Optional.empty());
        when(maintenanceRepository.save(any())).thenReturn(savedMaintenance);

        maintenanceService.createMaintenance(vehicle.getId(), user, dto);

        verify(alertRepository, never()).save(any(Alert.class));
    }

    /**
     * When a maintenance is created for a type that already has an active alert, the existing alert should be resolved automatically
     */
    @Test
    void createMaintenance_existingActiveAlert_resolvesAutomatically() {
        Alert existingAlert = Alert.builder()
                .id(UUID.randomUUID())
                .intervalKm(10000)
                .createdAt(LocalDateTime.now())
                .build();

        Maintenance savedMaintenance = Maintenance.builder()
                .id(UUID.randomUUID())
                .vehicle(vehicle)
                .type(dto.getMaintenanceType())
                .date(dto.getDate())
                .mileage(dto.getMileage())
                .createdAt(LocalDateTime.now())
                .build();

        when(vehicleRepository.findByIdAndUser(vehicle.getId(), user)).thenReturn(Optional.of(vehicle));
        when(maintenanceRepository.findByTypeAndDateAndVehicle(any(), any(), any())).thenReturn(Optional.empty());
        when(alertRepository.findActiveByVehicleAndType(vehicle, dto.getMaintenanceType())).thenReturn(Optional.of(existingAlert));
        when(maintenanceRepository.save(any())).thenReturn(savedMaintenance);

        maintenanceService.createMaintenance(vehicle.getId(), user, dto);

        assertThat(existingAlert.getResolvedAt()).isNotNull();
        verify(alertRepository).save(existingAlert);
    }
}