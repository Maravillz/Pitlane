package com.pitlane.pitlane.service;

import com.pitlane.pitlane.model.*;
import com.pitlane.pitlane.repository.AlertRepository;
import com.pitlane.pitlane.repository.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

/**
 * Unit tests for AlertService.
 * Tests cover alert status calculation, alert resolution and ownership validation.
 * Repositories are mocked to isolate the service logic from the database.
 */
@ExtendWith(MockitoExtension.class)
class AlertServiceTest {

    @Mock
    private AlertRepository alertRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    @InjectMocks
    private AlertService alertService;

    /** Shared test fixtures reused across tests */
    private Vehicle vehicle;
    private User user;
    private Maintenance maintenance;

    @BeforeEach
    void setUp() {
        // Inject @Value fields that Spring would normally inject from application.properties
        ReflectionTestUtils.setField(alertService, "warningKmThreshold", 500);
        ReflectionTestUtils.setField(alertService, "warningDaysThreshold", 15);

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
                .currentMileage(0)
                .createdAt(LocalDateTime.now())
                .build();

        maintenance = Maintenance.builder()
                .id(UUID.randomUUID())
                .vehicle(vehicle)
                .type(Maintenance.MaintenanceType.OIL_CHANGE)
                .date(LocalDate.now().minusMonths(6))
                .mileage(90000)
                .createdAt(LocalDateTime.now())
                .build();
    }

    // ─── calculateAlertStatus ────────────────────────────────────────────────

    /**
     * Vehicle with no maintenances should return NONE — no alerts to evaluate
     */
    @Test
    void calculateAlertStatus_noMaintenances_returnsNone() {
        vehicle.setMaintenances(List.of());

        String status = alertService.calculateAlertStatus(vehicle);

        assertThat(status).isEqualTo("NONE");
    }

    /**
     * Vehicle with maintenance but no associated alert should return NONE
     */
    @Test
    void calculateAlertStatus_maintenanceWithNoAlert_returnsNone() {
        vehicle.setMaintenances(List.of(maintenance));
        when(alertRepository.findByMaintenance(maintenance)).thenReturn(Optional.empty());

        String status = alertService.calculateAlertStatus(vehicle);

        assertThat(status).isEqualTo("NONE");
    }

    /**
     * Vehicle mileage has exceeded the maintenance mileage plus the interval — should return CRITICAL
     */
    @Test
    void calculateAlertStatus_kmExceedsInterval_returnsCritical() {
        // maintenance at 90000 km, interval 10000 km, current mileage 101000 — exceeded by 1000 km
        Alert alert = Alert.builder()
                .id(UUID.randomUUID())
                .maintenance(maintenance)
                .intervalKm(10000)
                .createdAt(LocalDateTime.now())
                .build();

        vehicle.setCurrentMileage(101000);
        vehicle.setMaintenances(List.of(maintenance));
        when(alertRepository.findByMaintenance(maintenance)).thenReturn(Optional.of(alert));

        String status = alertService.calculateAlertStatus(vehicle);

        assertThat(status).isEqualTo("CRITICAL");
    }

    /**
     * Vehicle mileage is within the warning threshold of the limit — should return WARNING
     */
    @Test
    void calculateAlertStatus_kmWithinWarningThreshold_returnsWarning() {
        // maintenance at 90000, interval 10000, current 99800 — within 500 km warning threshold
        Alert alert = Alert.builder()
                .id(UUID.randomUUID())
                .maintenance(maintenance)
                .intervalKm(10000)
                .createdAt(LocalDateTime.now())
                .build();

        vehicle.setCurrentMileage(99800);
        vehicle.setMaintenances(List.of(maintenance));
        when(alertRepository.findByMaintenance(maintenance)).thenReturn(Optional.of(alert));

        String status = alertService.calculateAlertStatus(vehicle);

        assertThat(status).isEqualTo("WARNING");
    }

    /**
     * Vehicle mileage is well below the limit — should return NONE
     */
    @Test
    void calculateAlertStatus_kmWellBelowLimit_returnsNone() {
        // maintenance at 90000, interval 10000, current 95000 — 5000 km remaining
        Alert alert = Alert.builder()
                .id(UUID.randomUUID())
                .maintenance(maintenance)
                .intervalKm(10000)
                .createdAt(LocalDateTime.now())
                .build();

        vehicle.setCurrentMileage(95000);
        vehicle.setMaintenances(List.of(maintenance));
        when(alertRepository.findByMaintenance(maintenance)).thenReturn(Optional.of(alert));

        String status = alertService.calculateAlertStatus(vehicle);

        assertThat(status).isEqualTo("NONE");
    }

    /**
     * Maintenance date plus interval has passed — should return CRITICAL based on date
     */
    @Test
    void calculateAlertStatus_dateExceedsInterval_returnsCritical() {
        // maintenance 400 days ago, interval 365 days — exceeded by 35 days
        Maintenance oldMaintenance = Maintenance.builder()
                .id(UUID.randomUUID())
                .vehicle(vehicle)
                .type(Maintenance.MaintenanceType.INSPECTION)
                .date(LocalDate.now().minusDays(400))
                .mileage(90000)
                .createdAt(LocalDateTime.now())
                .build();

        Alert alert = Alert.builder()
                .id(UUID.randomUUID())
                .maintenance(oldMaintenance)
                .intervalDays(365)
                .createdAt(LocalDateTime.now())
                .build();

        vehicle.setMaintenances(List.of(oldMaintenance));
        when(alertRepository.findByMaintenance(oldMaintenance)).thenReturn(Optional.of(alert));

        String status = alertService.calculateAlertStatus(vehicle);

        assertThat(status).isEqualTo("CRITICAL");
    }

    /**
     * Maintenance date is within the warning days threshold — should return WARNING
     */
    @Test
    void calculateAlertStatus_dateWithinWarningThreshold_returnsWarning() {
        // maintenance 355 days ago, interval 365 days — 10 days remaining, within 15 day threshold
        Maintenance recentMaintenance = Maintenance.builder()
                .id(UUID.randomUUID())
                .vehicle(vehicle)
                .type(Maintenance.MaintenanceType.INSPECTION)
                .date(LocalDate.now().minusDays(355))
                .mileage(90000)
                .createdAt(LocalDateTime.now())
                .build();

        Alert alert = Alert.builder()
                .id(UUID.randomUUID())
                .maintenance(recentMaintenance)
                .intervalDays(365)
                .createdAt(LocalDateTime.now())
                .build();

        vehicle.setMaintenances(List.of(recentMaintenance));
        when(alertRepository.findByMaintenance(recentMaintenance)).thenReturn(Optional.of(alert));

        String status = alertService.calculateAlertStatus(vehicle);

        assertThat(status).isEqualTo("WARNING");
    }

    /**
     * When two alerts exist and the second is CRITICAL, the status must still return CRITICAL
     * This validates that the loop does not return WARNING early when CRITICAL comes later in the list
     */
    @Test
    void calculateAlertStatus_secondAlertIsCritical_returnsCritical() {
        Maintenance warningMaintenance = Maintenance.builder()
                .id(UUID.randomUUID())
                .vehicle(vehicle)
                .type(Maintenance.MaintenanceType.AIR_FILTER)
                .date(LocalDate.now().minusDays(355))
                .mileage(99800)
                .createdAt(LocalDateTime.now())
                .build();

        Maintenance criticalMaintenance = Maintenance.builder()
                .id(UUID.randomUUID())
                .vehicle(vehicle)
                .type(Maintenance.MaintenanceType.OIL_CHANGE)
                .date(LocalDate.now().minusMonths(6))
                .mileage(90000)
                .createdAt(LocalDateTime.now())
                .build();

        // First alert is WARNING
        Alert warningAlert = Alert.builder()
                .id(UUID.randomUUID())
                .maintenance(warningMaintenance)
                .intervalDays(365)
                .createdAt(LocalDateTime.now())
                .build();

        // Second alert is CRITICAL — km exceeded
        Alert criticalAlert = Alert.builder()
                .id(UUID.randomUUID())
                .maintenance(criticalMaintenance)
                .intervalKm(10000)
                .createdAt(LocalDateTime.now())
                .build();

        vehicle.setCurrentMileage(101000);
        vehicle.setMaintenances(List.of(warningMaintenance, criticalMaintenance));
        when(alertRepository.findByMaintenance(warningMaintenance)).thenReturn(Optional.of(warningAlert));
        when(alertRepository.findByMaintenance(criticalMaintenance)).thenReturn(Optional.of(criticalAlert));

        String status = alertService.calculateAlertStatus(vehicle);

        assertThat(status).isEqualTo("CRITICAL");
    }

    /**
     * Resolved alerts must be ignored when calculating the vehicle status
     */
    @Test
    void calculateAlertStatus_resolvedAlert_isIgnored() {
        Alert resolvedAlert = Alert.builder()
                .id(UUID.randomUUID())
                .maintenance(maintenance)
                .intervalKm(10000)
                .resolvedAt(LocalDateTime.now()) // already resolved
                .createdAt(LocalDateTime.now())
                .build();

        vehicle.setCurrentMileage(101000);
        vehicle.setMaintenances(List.of(maintenance));
        when(alertRepository.findByMaintenance(maintenance)).thenReturn(Optional.of(resolvedAlert));

        String status = alertService.calculateAlertStatus(vehicle);

        assertThat(status).isEqualTo("NONE");
    }

    // ─── resolveAlert ────────────────────────────────────────────────────────

    /**
     * Resolving an alert that belongs to the requesting user should set the resolvedAt field
     */
    @Test
    void resolveAlert_ownedByUser_setsResolvedAt() {
        Alert alert = Alert.builder()
                .id(UUID.randomUUID())
                .maintenance(maintenance)
                .intervalKm(10000)
                .createdAt(LocalDateTime.now())
                .build();

        when(alertRepository.findById(alert.getId())).thenReturn(Optional.of(alert));

        alertService.resolveAlert(alert.getId(), user);

        assertThat(alert.getResolvedAt()).isNotNull();
        verify(alertRepository).save(alert);
    }

    /**
     * Resolving an alert that belongs to a different user should throw an exception
     */
    @Test
    void resolveAlert_notOwnedByUser_throwsException() {
        User otherUser = User.builder()
                .id(UUID.randomUUID())
                .email("other@pitlane.com")
                .displayName("Other User")
                .createdAt(LocalDateTime.now())
                .build();

        Alert alert = Alert.builder()
                .id(UUID.randomUUID())
                .maintenance(maintenance) // maintenance belongs to original user
                .intervalKm(10000)
                .createdAt(LocalDateTime.now())
                .build();

        when(alertRepository.findById(alert.getId())).thenReturn(Optional.of(alert));

        assertThatThrownBy(() -> alertService.resolveAlert(alert.getId(), otherUser))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Unauthorized");

        verify(alertRepository, never()).save(any());
    }

    /**
     * Resolving an alert that does not exist should throw an exception
     */
    @Test
    void resolveAlert_alertNotFound_throwsException() {
        UUID nonExistentId = UUID.randomUUID();
        when(alertRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> alertService.resolveAlert(nonExistentId, user))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Alert not found");
    }

    // ─── getAlertsByUser ─────────────────────────────────────────────────────

    /**
     * User with no vehicles should return an empty list without querying the alert repository
     */
    @Test
    void getAlertsByUser_noVehicles_returnsEmptyList() {
        when(vehicleRepository.findAllByUser(user)).thenReturn(List.of());

        var result = alertService.getAlertsByUser(user);

        assertThat(result).isEmpty();
        verifyNoInteractions(alertRepository);
    }

    /**
     * User with vehicles but no alerts should return an empty list
     */
    @Test
    void getAlertsByUser_vehiclesWithNoAlerts_returnsEmptyList() {
        vehicle.setMaintenances(List.of(maintenance));
        when(vehicleRepository.findAllByUser(user)).thenReturn(List.of(vehicle));
        when(alertRepository.findByMaintenance(maintenance)).thenReturn(Optional.empty());

        var result = alertService.getAlertsByUser(user);

        assertThat(result).isEmpty();
    }

    /**
     * User with vehicles and alerts should return the correct alert DTOs
     */
    @Test
    void getAlertsByUser_withAlerts_returnsMappedDtos() {
        Alert alert = Alert.builder()
                .id(UUID.randomUUID())
                .maintenance(maintenance)
                .intervalKm(10000)
                .createdAt(LocalDateTime.now())
                .build();

        vehicle.setMaintenances(List.of(maintenance));
        when(vehicleRepository.findAllByUser(user)).thenReturn(List.of(vehicle));
        when(alertRepository.findByMaintenance(maintenance)).thenReturn(Optional.of(alert));

        var result = alertService.getAlertsByUser(user);

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().getId()).isEqualTo(alert.getId());
        assertThat(result.getFirst().getMaintenanceType()).isEqualTo(Maintenance.MaintenanceType.OIL_CHANGE);
        assertThat(result.getFirst().getIntervalKm()).isEqualTo(10000);
    }
}