package com.pitlane.pitlane.service;

import com.pitlane.pitlane.dto.AuthResponseDto;
import com.pitlane.pitlane.model.*;
import com.pitlane.pitlane.repository.*;
import com.pitlane.pitlane.security.JwtUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/** Service responsible for demo account session tracking and temp account management */
@Slf4j
@Service
@RequiredArgsConstructor
public class DemoService {

    private static final String DEMO_EMAIL = "demo@pitlane.com";
    private static final String DEMO_SUFFIX = "@pitlane.temp";
    private static final long DEMO_TOKEN_EXPIRATION_MS = 2 * 60 * 60 * 1000L; // 2 hours

    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final AlertRepository alertRepository;
    private final MaintenanceRepository maintenanceRepository;
    private final MileageLogRepository mileageLogRepository;
    private final DemoSessionRepository demoSessionRepository;
    private final DemoChangeRepository demoChangeRepository;
    private final JwtUtil jwtUtil;

    // ─── Public API ───────────────────────────────────────────────────────────

    /**
     * Creates a temporary demo user with copied data and returns a 2h JWT token
     */
    @Transactional
    public AuthResponseDto createDemoSession() {
        User originalDemo = userRepository.findByEmail(DEMO_EMAIL)
                .orElseThrow(() -> new RuntimeException("Demo account not configured"));

        // Create temp user
        String tempEmail = "demo_" + UUID.randomUUID() + DEMO_SUFFIX;
        User tempUser = userRepository.save(User.builder()
                .email(tempEmail)
                .displayName("User Testing")
                .passwordHash(null)
                .createdAt(LocalDateTime.now())
                .build());

        // Copy demo data to temp user
        copyDemoData(originalDemo, tempUser);

        // Open session
        demoSessionRepository.save(DemoSession.builder()
                .startedAt(LocalDateTime.now())
                .build());

        String token = jwtUtil.generateToken(tempEmail, DEMO_TOKEN_EXPIRATION_MS);
        log.info("[DEMO] Temp session created for {}", tempEmail);
        return new AuthResponseDto(token);
    }

    /**
     * Ends the demo session and deletes the temp user and all associated data
     */
    @Transactional
    public void endDemoSession(User tempUser) {
        if (!tempUser.getEmail().endsWith(DEMO_SUFFIX)) return;

        demoSessionRepository.findTopByEndedAtIsNullOrderByStartedAtDesc()
                .ifPresent(session -> {
                    session.setEndedAt(LocalDateTime.now());
                    session.setEndReason("LOGOUT");
                    demoSessionRepository.save(session);
                    log.info("[DEMO] Session ended via LOGOUT. Changes: {}",
                            demoChangeRepository.findAllBySession(session).size());
                });

        deleteTempUser(tempUser);
    }

    /**
     * Records a change made by the demo user during a session
     */
    @Transactional
    public void recordChange(String action) {
        demoSessionRepository.findTopByEndedAtIsNullOrderByStartedAtDesc()
                .ifPresent(session -> {
                    demoChangeRepository.save(DemoChange.builder()
                            .session(session)
                            .changedAt(LocalDateTime.now())
                            .action(action)
                            .build());
                    log.info("[DEMO] Change recorded: {}", action);
                });
    }

    /** Returns true if the given user is a demo temp account */
    public boolean isDemoUser(User user) {
        return user.getEmail().endsWith(DEMO_SUFFIX);
    }

    // ─── Scheduled cleanup ────────────────────────────────────────────────────

    /**
     * Runs every day at 20:00 — cleans up abandoned demo sessions older than 2 hours
     */
    @Scheduled(cron = "0 0 20 * * *")
    @Transactional
    public void scheduledCleanup() {
        log.info("[DEMO] Scheduled cleanup starting at {}", LocalDateTime.now());

        LocalDateTime expiry = LocalDateTime.now().minusHours(2);
        List<User> abandonedUsers = userRepository.findAll().stream()
                .filter(u -> u.getEmail().endsWith(DEMO_SUFFIX))
                .filter(u -> u.getCreatedAt().isBefore(expiry))
                .toList();

        abandonedUsers.forEach(user -> {
            demoSessionRepository.findTopByEndedAtIsNullOrderByStartedAtDesc()
                    .ifPresent(session -> {
                        session.setEndedAt(LocalDateTime.now());
                        session.setEndReason("SCHEDULED_RESET");
                        demoSessionRepository.save(session);
                    });
            deleteTempUser(user);
        });

        log.info("[DEMO] Cleanup completed — {} abandoned sessions removed", abandonedUsers.size());
    }

    // ─── Data copy ────────────────────────────────────────────────────────────

    private void copyDemoData(User from, User to) {
        vehicleRepository.findAllByUser(from).forEach(originalVehicle -> {
            Vehicle newVehicle = vehicleRepository.save(Vehicle.builder()
                    .user(to)
                    .brand(originalVehicle.getBrand())
                    .model(originalVehicle.getModel())
                    .year(originalVehicle.getYear())
                    .plate(originalVehicle.getPlate() + "_" + to.getId().toString().substring(0, 4))
                    .currentMileage(originalVehicle.getCurrentMileage())
                    .createdAt(originalVehicle.getCreatedAt())
                    .build());

            // Copy mileage logs
            originalVehicle.getMileageLogs().forEach(log ->
                    mileageLogRepository.save(MileageLog.builder()
                            .vehicle(newVehicle)
                            .value(log.getValue())
                            .recordedAt(log.getRecordedAt())
                            .build()));

            // Copy maintenances and alerts
            maintenanceRepository.findAllByVehicle(originalVehicle).forEach(originalMaintenance -> {
                Maintenance newMaintenance = maintenanceRepository.save(Maintenance.builder()
                        .vehicle(newVehicle)
                        .type(originalMaintenance.getType())
                        .date(originalMaintenance.getDate())
                        .mileage(originalMaintenance.getMileage())
                        .costCents(originalMaintenance.getCostCents())
                        .notes(originalMaintenance.getNotes())
                        .createdAt(originalMaintenance.getCreatedAt())
                        .build());

                alertRepository.findByMaintenance(originalMaintenance).ifPresent(originalAlert ->
                        alertRepository.save(Alert.builder()
                                .maintenance(newMaintenance)
                                .intervalKm(originalAlert.getIntervalKm())
                                .intervalDays(originalAlert.getIntervalDays())
                                .createdAt(originalAlert.getCreatedAt())
                                .resolvedAt(originalAlert.getResolvedAt())
                                .build()));
            });
        });
    }

    // ─── Delete temp user ─────────────────────────────────────────────────────

    private void deleteTempUser(User user) {
        vehicleRepository.findAllByUser(user).forEach(vehicle -> {
            maintenanceRepository.findAllByVehicle(vehicle).forEach(maintenance -> {
                alertRepository.findByMaintenance(maintenance)
                        .ifPresent(alertRepository::delete);
                maintenanceRepository.delete(maintenance);
            });
            mileageLogRepository.deleteAllByVehicle(vehicle);
        });
        vehicleRepository.deleteAllByUser(user);
        userRepository.delete(user);
        log.info("[DEMO] Temp user deleted: {}", user.getEmail());
    }
}
