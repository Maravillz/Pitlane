package com.pitlane.pitlane.service;

import com.pitlane.pitlane.dto.UpdateVehicleDto;
import com.pitlane.pitlane.model.*;
import com.pitlane.pitlane.repository.AlertRepository;
import com.pitlane.pitlane.repository.MaintenanceRepository;
import com.pitlane.pitlane.repository.MileageLogRepository;
import com.pitlane.pitlane.repository.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for VehiclesService.
 * Tests cover vehicle creation, update, mileage update and the invariant that mileage cannot decrease.
 * Repositories and AlertService are mocked to isolate the service logic from the database.
 */
@ExtendWith(MockitoExtension.class)
class VehiclesServiceTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private MileageLogRepository mileageLogRepository;

    @Mock
    private AlertRepository alertRepository;

    @Mock
    private AlertService alertService;

    @Mock
    private MaintenanceRepository maintenanceRepository;

    @InjectMocks
    private VehiclesService vehiclesService;

    private User user;
    private Vehicle vehicle;

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
                .maintenances(List.of())
                .mileageLogs(List.of())
                .createdAt(LocalDateTime.now())
                .build();
    }

    // ─── createVehicle ───────────────────────────────────────────────────────

    /**
     * Creating a valid vehicle should save it with the correct user and return the saved entity
     */
    @Test
    void createVehicle_validRequest_savesAndReturns() {
        when(vehicleRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Vehicle result = vehiclesService.createVehicle(user, vehicle);

        assertThat(result.getBrand()).isEqualTo("Honda");
        assertThat(result.getModel()).isEqualTo("Civic");
        assertThat(result.getUser()).isEqualTo(user);
        verify(vehicleRepository).save(any(Vehicle.class));
    }

    /**
     * The created vehicle should always be associated with the requesting user, not the user in the request body
     */
    @Test
    void createVehicle_userIsAlwaysFromAuthentication_notFromBody() {
        User differentUser = User.builder().id(UUID.randomUUID()).build();
        vehicle.setUser(differentUser);

        when(vehicleRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Vehicle result = vehiclesService.createVehicle(user, vehicle);

        assertThat(result.getUser()).isEqualTo(user);
    }

    // ─── setNewMileage ───────────────────────────────────────────────────────

    /**
     * Updating mileage to a higher value should save the log and update the vehicle
     */
    @Test
    void setNewMileage_higherValue_updatesAndLogs() {
        when(vehicleRepository.findByIdAndUser(vehicle.getId(), user)).thenReturn(Optional.of(vehicle));

        int result = vehiclesService.setNewMileage(vehicle.getId(), user, 110000);

        assertThat(result).isEqualTo(110000);
        assertThat(vehicle.getCurrentMileage()).isEqualTo(110000);
        verify(mileageLogRepository).save(any(MileageLog.class));
        verify(vehicleRepository).save(vehicle);
    }

    /**
     * Updating mileage to a lower value should throw an exception — mileage cannot decrease
     * This is a domain invariant enforced by the Vehicle entity setter
     */
    @Test
    void setNewMileage_lowerValue_throwsException() {
        when(vehicleRepository.findByIdAndUser(vehicle.getId(), user)).thenReturn(Optional.of(vehicle));

        assertThatThrownBy(() -> vehiclesService.setNewMileage(vehicle.getId(), user, 90000))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Mileage cannot decrease");

        verify(mileageLogRepository, never()).save(any());
        verify(vehicleRepository, never()).save(any());
    }

    /**
     * Updating mileage for a vehicle that does not exist or does not belong to the user should throw an exception
     */
    @Test
    void setNewMileage_vehicleNotFound_throwsException() {
        when(vehicleRepository.findByIdAndUser(any(), any())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> vehiclesService.setNewMileage(UUID.randomUUID(), user, 110000))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Vehicle not found");
    }

    /**
     * Updating mileage to the same value as the current mileage should not throw — same value is allowed
     */
    @Test
    void setNewMileage_sameValue_doesNotThrow() {
        when(vehicleRepository.findByIdAndUser(vehicle.getId(), user)).thenReturn(Optional.of(vehicle));

        int result = vehiclesService.setNewMileage(vehicle.getId(), user, 100000);

        assertThat(result).isEqualTo(100000);
    }

    // ─── updateVehicle ───────────────────────────────────────────────────────

    /**
     * Updating a vehicle with new values should persist the changes and return the DTO
     */
    @Test
    void updateVehicle_validRequest_updatesFields() {
        UpdateVehicleDto dto = new UpdateVehicleDto();
        dto.setVehicleId(vehicle.getId());
        dto.setBrand("Toyota");
        dto.setModel("Corolla");
        dto.setYear((short) 2020);
        dto.setPlate("AA-00-BB");

        when(vehicleRepository.findByIdAndUser(vehicle.getId(), user)).thenReturn(Optional.of(vehicle));

        UpdateVehicleDto result = vehiclesService.updateVehicle(user, dto);

        assertThat(vehicle.getBrand()).isEqualTo("Toyota");
        assertThat(vehicle.getModel()).isEqualTo("Corolla");
        verify(vehicleRepository).save(vehicle);
        assertThat(result).isEqualTo(dto);
    }

    /**
     * Updating a vehicle that does not belong to the user should throw an exception
     */
    @Test
    void updateVehicle_vehicleNotFound_throwsException() {
        UpdateVehicleDto dto = new UpdateVehicleDto();
        dto.setVehicleId(UUID.randomUUID());
        dto.setBrand("Toyota");
        dto.setModel("Corolla");
        dto.setYear((short) 2020);
        dto.setPlate("AA-00-BB");

        when(vehicleRepository.findByIdAndUser(any(), any())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> vehiclesService.updateVehicle(user, dto))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Vehicle not found");
    }

    // ─── calculateAlertMessage ───────────────────────────────────────────────

    /**
     * A vehicle with no active alerts should return null as the alert message
     */
    @Test
    void calculateAlertMessage_noActiveAlerts_returnsNull() {
        when(alertService.getActiveAlerts(vehicle)).thenReturn(List.of());

        String result = vehiclesService.calculateAlertMessage(vehicle);

        assertThat(result).isNull();
    }

    /**
     * An active alert with a km interval should generate a message showing the remaining kilometres
     */
    @Test
    void calculateAlertMessage_kmAlert_returnsKmMessage() {
        Maintenance maintenance = Maintenance.builder()
                .id(UUID.randomUUID())
                .vehicle(vehicle)
                .type(Maintenance.MaintenanceType.OIL_CHANGE)
                .date(LocalDate.now())
                .mileage(95000)
                .createdAt(LocalDateTime.now())
                .build();

        Alert alert = Alert.builder()
                .id(UUID.randomUUID())
                .maintenance(maintenance)
                .intervalKm(10000)
                .createdAt(LocalDateTime.now())
                .build();

        // maintenance at 95000 + interval 10000 = limit 105000, current 100000 = 5000 remaining
        when(alertService.getActiveAlerts(vehicle)).thenReturn(List.of(alert));

        String result = vehiclesService.calculateAlertMessage(vehicle);

        assertThat(result).contains("5000");
        assertThat(result).contains("km");
    }
}