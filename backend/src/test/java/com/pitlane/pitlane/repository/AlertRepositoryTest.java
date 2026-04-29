package com.pitlane.pitlane.repository;

import com.pitlane.pitlane.model.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration tests for AlertRepository using an in-memory H2 database.
 * Tests cover the custom queries that cannot be validated by unit tests alone.
 */
@DataJpaTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class AlertRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private AlertRepository alertRepository;

    private User user;
    private Vehicle vehicle;
    private Maintenance maintenance;

    @BeforeEach
    void setUp() {
        user = entityManager.persist(User.builder()
                .email("test@pitlane.com")
                .displayName("Test User")
                .passwordHash("hash")
                .createdAt(LocalDateTime.now())
                .build());

        vehicle = entityManager.persist(Vehicle.builder()
                .user(user)
                .brand("Honda")
                .model("Civic")
                .year((short) 1998)
                .currentMileage(100000)
                .createdAt(LocalDateTime.now())
                .build());

        maintenance = entityManager.persist(Maintenance.builder()
                .vehicle(vehicle)
                .type(Maintenance.MaintenanceType.OIL_CHANGE)
                .date(LocalDate.now())
                .mileage(100000)
                .createdAt(LocalDateTime.now())
                .build());

        entityManager.flush();
    }

    // ─── findByMaintenance ───────────────────────────────────────────────────

    /**
     * Finding an alert by a maintenance that has an associated alert should return the alert
     */
    @Test
    void findByMaintenance_alertExists_returnsAlert() {
        Alert alert = entityManager.persist(Alert.builder()
                .maintenance(maintenance)
                .intervalKm(10000)
                .createdAt(LocalDateTime.now())
                .build());
        entityManager.flush();

        Optional<Alert> result = alertRepository.findByMaintenance(maintenance);

        assertThat(result).isPresent();
        assertThat(result.get().getId()).isEqualTo(alert.getId());
    }

    /**
     * Finding an alert by a maintenance that has no associated alert should return empty
     */
    @Test
    void findByMaintenance_noAlert_returnsEmpty() {
        Optional<Alert> result = alertRepository.findByMaintenance(maintenance);

        assertThat(result).isEmpty();
    }

    // ─── findActiveByVehicleAndType ──────────────────────────────────────────

    /**
     * Finding an active alert by vehicle and type should return the unresolved alert
     */
    @Test
    void findActiveByVehicleAndType_activeAlertExists_returnsAlert() {
        Alert alert = entityManager.persist(Alert.builder()
                .maintenance(maintenance)
                .intervalKm(10000)
                .createdAt(LocalDateTime.now())
                .build());
        entityManager.flush();

        Optional<Alert> result = alertRepository.findActiveByVehicleAndType(
                vehicle, Maintenance.MaintenanceType.OIL_CHANGE);

        assertThat(result).isPresent();
        assertThat(result.get().getId()).isEqualTo(alert.getId());
    }

    /**
     * Finding an active alert when the alert is already resolved should return empty
     * This validates that resolved alerts are correctly excluded from the query
     */
    @Test
    void findActiveByVehicleAndType_alertResolved_returnsEmpty() {
        entityManager.persist(Alert.builder()
                .maintenance(maintenance)
                .intervalKm(10000)
                .resolvedAt(LocalDateTime.now())
                .createdAt(LocalDateTime.now())
                .build());
        entityManager.flush();

        Optional<Alert> result = alertRepository.findActiveByVehicleAndType(
                vehicle, Maintenance.MaintenanceType.OIL_CHANGE);

        assertThat(result).isEmpty();
    }

    /**
     * Finding an active alert for a different maintenance type should return empty
     * This validates that the type filter is correctly applied
     */
    @Test
    void findActiveByVehicleAndType_differentType_returnsEmpty() {
        entityManager.persist(Alert.builder()
                .maintenance(maintenance)
                .intervalKm(10000)
                .createdAt(LocalDateTime.now())
                .build());
        entityManager.flush();

        Optional<Alert> result = alertRepository.findActiveByVehicleAndType(
                vehicle, Maintenance.MaintenanceType.BRAKE_SERVICE);

        assertThat(result).isEmpty();
    }

    /**
     * Finding an active alert for a different vehicle should return empty
     * This validates that the vehicle filter prevents cross-vehicle alert leakage
     */
    @Test
    void findActiveByVehicleAndType_differentVehicle_returnsEmpty() {
        Vehicle otherVehicle = entityManager.persist(Vehicle.builder()
                .user(user)
                .brand("Honda")
                .model("CB500F")
                .year((short) 2019)
                .currentMileage(30000)
                .createdAt(LocalDateTime.now())
                .build());

        entityManager.persist(Alert.builder()
                .maintenance(maintenance)
                .intervalKm(10000)
                .createdAt(LocalDateTime.now())
                .build());
        entityManager.flush();

        Optional<Alert> result = alertRepository.findActiveByVehicleAndType(
                otherVehicle, Maintenance.MaintenanceType.OIL_CHANGE);

        assertThat(result).isEmpty();
    }
}