package com.pitlane.pitlane.repository;

import com.pitlane.pitlane.model.Maintenance;
import com.pitlane.pitlane.model.User;
import com.pitlane.pitlane.model.Vehicle;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration tests for MaintenanceRepository using an in-memory H2 database.
 * Tests cover duplicate prevention queries that ensure the same maintenance
 * cannot be created twice for the same vehicle, type and date.
 */
@DataJpaTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class MaintenanceRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private MaintenanceRepository maintenanceRepository;

    private User user;
    private Vehicle vehicle;

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

        entityManager.flush();
    }

    // ─── findByTypeAndDateAndVehicle ─────────────────────────────────────────

    /**
     * Finding a maintenance by type, date and vehicle that exists should return the maintenance
     */
    @Test
    void findByTypeAndDateAndVehicle_exists_returnsMaintenance() {
        LocalDate date = LocalDate.now();
        entityManager.persist(Maintenance.builder()
                .vehicle(vehicle)
                .type(Maintenance.MaintenanceType.OIL_CHANGE)
                .date(date)
                .mileage(100000)
                .createdAt(LocalDateTime.now())
                .build());
        entityManager.flush();

        Optional<Maintenance> result = maintenanceRepository.findByTypeAndDateAndVehicle(
                Maintenance.MaintenanceType.OIL_CHANGE, date, vehicle);

        assertThat(result).isPresent();
    }

    /**
     * Finding a maintenance with a different type should return empty — prevents false duplicate detection
     */
    @Test
    void findByTypeAndDateAndVehicle_differentType_returnsEmpty() {
        LocalDate date = LocalDate.now();
        entityManager.persist(Maintenance.builder()
                .vehicle(vehicle)
                .type(Maintenance.MaintenanceType.OIL_CHANGE)
                .date(date)
                .mileage(100000)
                .createdAt(LocalDateTime.now())
                .build());
        entityManager.flush();

        Optional<Maintenance> result = maintenanceRepository.findByTypeAndDateAndVehicle(
                Maintenance.MaintenanceType.BRAKE_SERVICE, date, vehicle);

        assertThat(result).isEmpty();
    }

    /**
     * Finding a maintenance with a different date should return empty — same type on different day is allowed
     */
    @Test
    void findByTypeAndDateAndVehicle_differentDate_returnsEmpty() {
        entityManager.persist(Maintenance.builder()
                .vehicle(vehicle)
                .type(Maintenance.MaintenanceType.OIL_CHANGE)
                .date(LocalDate.now())
                .mileage(100000)
                .createdAt(LocalDateTime.now())
                .build());
        entityManager.flush();

        Optional<Maintenance> result = maintenanceRepository.findByTypeAndDateAndVehicle(
                Maintenance.MaintenanceType.OIL_CHANGE, LocalDate.now().minusDays(1), vehicle);

        assertThat(result).isEmpty();
    }

    // ─── findAllByVehicle ────────────────────────────────────────────────────

    /**
     * Finding all maintenances for a vehicle with records should return all of them
     */
    @Test
    void findAllByVehicle_withMaintenances_returnsAll() {
        entityManager.persist(Maintenance.builder()
                .vehicle(vehicle)
                .type(Maintenance.MaintenanceType.OIL_CHANGE)
                .date(LocalDate.now())
                .mileage(100000)
                .createdAt(LocalDateTime.now())
                .build());

        entityManager.persist(Maintenance.builder()
                .vehicle(vehicle)
                .type(Maintenance.MaintenanceType.BRAKE_SERVICE)
                .date(LocalDate.now().minusMonths(1))
                .mileage(95000)
                .createdAt(LocalDateTime.now())
                .build());
        entityManager.flush();

        List<Maintenance> result = maintenanceRepository.findAllByVehicle(vehicle);

        assertThat(result).hasSize(2);
    }

    /**
     * Finding all maintenances for a vehicle with no records should return an empty list
     */
    @Test
    void findAllByVehicle_noMaintenances_returnsEmptyList() {
        List<Maintenance> result = maintenanceRepository.findAllByVehicle(vehicle);

        assertThat(result).isEmpty();
    }
}