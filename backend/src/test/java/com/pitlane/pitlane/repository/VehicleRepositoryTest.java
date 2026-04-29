package com.pitlane.pitlane.repository;

import com.pitlane.pitlane.model.User;
import com.pitlane.pitlane.model.Vehicle;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration tests for VehicleRepository using an in-memory H2 database.
 * Tests cover ownership validation queries that are critical for security —
 * a user must never be able to access vehicles that belong to another user.
 */
@DataJpaTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class VehicleRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private VehicleRepository vehicleRepository;

    private User user;
    private User otherUser;
    private Vehicle vehicle;

    @BeforeEach
    void setUp() {
        user = entityManager.persist(User.builder()
                .email("test@pitlane.com")
                .displayName("Test User")
                .passwordHash("hash")
                .createdAt(LocalDateTime.now())
                .build());

        otherUser = entityManager.persist(User.builder()
                .email("other@pitlane.com")
                .displayName("Other User")
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

    // ─── findByIdAndUser ─────────────────────────────────────────────────────

    /**
     * Finding a vehicle by id and the correct owner should return the vehicle
     */
    @Test
    void findByIdAndUser_correctOwner_returnsVehicle() {
        Optional<Vehicle> result = vehicleRepository.findByIdAndUser(vehicle.getId(), user);

        assertThat(result).isPresent();
        assertThat(result.get().getBrand()).isEqualTo("Honda");
    }

    /**
     * Finding a vehicle by id with a different user should return empty
     * This is the critical security test — users must not access other users' vehicles
     */
    @Test
    void findByIdAndUser_wrongOwner_returnsEmpty() {
        Optional<Vehicle> result = vehicleRepository.findByIdAndUser(vehicle.getId(), otherUser);

        assertThat(result).isEmpty();
    }

    /**
     * Finding a vehicle with a non-existent id should return empty
     */
    @Test
    void findByIdAndUser_nonExistentId_returnsEmpty() {
        Optional<Vehicle> result = vehicleRepository.findByIdAndUser(UUID.randomUUID(), user);

        assertThat(result).isEmpty();
    }

    // ─── findAllByUser ───────────────────────────────────────────────────────

    /**
     * Finding all vehicles for a user with vehicles should return only their vehicles
     */
    @Test
    void findAllByUser_userWithVehicles_returnsOnlyUserVehicles() {
        entityManager.persist(Vehicle.builder()
                .user(otherUser)
                .brand("Volkswagen")
                .model("Golf")
                .year((short) 2020)
                .currentMileage(50000)
                .createdAt(LocalDateTime.now())
                .build());
        entityManager.flush();

        List<Vehicle> result = vehicleRepository.findAllByUser(user);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getBrand()).isEqualTo("Honda");
    }

    /**
     * Finding all vehicles for a user with no vehicles should return an empty list
     */
    @Test
    void findAllByUser_userWithNoVehicles_returnsEmptyList() {
        List<Vehicle> result = vehicleRepository.findAllByUser(otherUser);

        assertThat(result).isEmpty();
    }

    /**
     * Finding all vehicles for a user with multiple vehicles should return all of them
     */
    @Test
    void findAllByUser_userWithMultipleVehicles_returnsAll() {
        entityManager.persist(Vehicle.builder()
                .user(user)
                .brand("Honda")
                .model("CB500F")
                .year((short) 2019)
                .currentMileage(30000)
                .createdAt(LocalDateTime.now())
                .build());
        entityManager.flush();

        List<Vehicle> result = vehicleRepository.findAllByUser(user);

        assertThat(result).hasSize(2);
    }
}