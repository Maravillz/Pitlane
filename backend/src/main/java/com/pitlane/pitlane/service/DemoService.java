package com.pitlane.pitlane.service;

import com.pitlane.pitlane.model.*;
import com.pitlane.pitlane.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;

/** Service responsible for demo account session tracking and scheduled reset */
@Slf4j
@Service
@RequiredArgsConstructor
public class DemoService {

    private static final String DEMO_EMAIL = "demo@pitlane.com";

    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final AlertRepository alertRepository;
    private final MaintenanceRepository maintenanceRepository;
    private final MileageLogRepository mileageLogRepository;
    private final DemoSessionRepository demoSessionRepository;
    private final DemoChangeRepository demoChangeRepository;

    // ─── Session tracking ─────────────────────────────────────────────────────

    /**
     * Opens a new demo session when someone clicks "Ver demonstração"
     */
    @Transactional
    public void startSession() {
        // Close any open session first
        demoSessionRepository.findTopByEndedAtIsNullOrderByStartedAtDesc()
                .ifPresent(session -> {
                    session.setEndedAt(LocalDateTime.now());;
                    session.setEndReason("NEW_SESSION");
                    demoSessionRepository.save(session);
                });

        DemoSession session = DemoSession.builder()
                .startedAt(LocalDateTime.now())
                .build();
        demoSessionRepository.save(session);
        log.info("[DEMO] New session started at {}", session.getStartedAt());
    }

    /**
     * Closes the current demo session when the user logs out
     */
    @Transactional
    public void endSession() {
        demoSessionRepository.findTopByEndedAtIsNullOrderByStartedAtDesc()
                .ifPresent(session -> {
                    session.setEndedAt(LocalDateTime.now());
                    session.setEndReason("LOGOUT");
                    demoSessionRepository.save(session);
                    log.info("[DEMO] Session ended via LOGOUT. Changes made: {}",
                            demoChangeRepository.findAllBySession(session).size());

                    // Reset immediately on logout
                    resetDemoData();
                });
    }

    /**
     * Records an action performed during the demo session
     * Called by other services when the demo user makes a change
     * @param action The action performed — e.g. 'MILEAGE_UPDATE', 'ALERT_RESOLVED'
     */
    @Transactional
    public void recordChange(String action) {
        demoSessionRepository.findTopByEndedAtIsNullOrderByStartedAtDesc()
                .ifPresent(session -> {
                    DemoChange change = DemoChange.builder()
                            .session(session)
                            .changedAt(LocalDateTime.now())
                            .action(action)
                            .build();
                    demoChangeRepository.save(change);
                    log.info("[DEMO] Change recorded: {}", action);
                });
    }

    // ─── Scheduled reset ──────────────────────────────────────────────────────

    /**
     * Resets the demo account data every day at 20:00
     */
    @Scheduled(cron = "0 0 20 * * *")
    @Transactional
    public void scheduledReset() {
        log.info("[DEMO] Scheduled reset check at {}", LocalDateTime.now());

        // Verifica se houve alterações hoje
        boolean hasChangesToday = demoSessionRepository
                .findTopByEndedAtIsNullOrderByStartedAtDesc()
                .map(session -> !demoChangeRepository.findAllBySession(session).isEmpty())
                .orElse(false);

        // Verifica também sessões fechadas hoje com alterações
        if (!hasChangesToday) {
            hasChangesToday = demoSessionRepository.findAll().stream()
                    .filter(s -> s.getStartedAt().toLocalDate().equals(LocalDate.now()))
                    .anyMatch(s -> !demoChangeRepository.findAllBySession(s).isEmpty());
        }

        if (!hasChangesToday) {
            log.info("[DEMO] No changes today — skipping reset");
            return;
        }

        log.info("[DEMO] Changes detected — starting reset");

        demoSessionRepository.findTopByEndedAtIsNullOrderByStartedAtDesc()
                .ifPresent(session -> {
                    session.setEndedAt(LocalDateTime.now());
                    session.setEndReason("SCHEDULED_RESET");
                    demoSessionRepository.save(session);
                });

        resetDemoData();
        log.info("[DEMO] Scheduled reset completed at {}", LocalDateTime.now());
    }

    // ─── Reset logic ──────────────────────────────────────────────────────────

    /**
     * Resets the demo account to the original V5/V6 seed state.
     * Deletes all alerts, maintenances and mileage logs for the demo vehicles,
     * then resets the mileages and re-runs the seed data.
     */
    @Transactional
    public void resetDemoData() {
        User demoUser = userRepository.findByEmail(DEMO_EMAIL)
                .orElseThrow(() -> new RuntimeException("Demo user not found"));

        var vehicles = vehicleRepository.findAllByUser(demoUser);

        for (Vehicle vehicle : vehicles) {
            // Delete alerts via maintenances
            var maintenances = maintenanceRepository.findAllByVehicle(vehicle);
            for (Maintenance maintenance : maintenances) {
                alertRepository.deleteAllByMaintenance(maintenance);
            }
            maintenanceRepository.deleteAllByVehicle(vehicle);
            mileageLogRepository.deleteAllByVehicle(vehicle);
        }

        vehicleRepository.deleteAllByUser(demoUser);

        // Re-seed the demo data
        seedDemoData(demoUser);

        log.info("[DEMO] Data reset completed for user {}", DEMO_EMAIL);
    }

    /**
     * Seeds the demo data — mirrors V5/V6 migration data
     * Called after reset to restore the original state
     */
    private void seedDemoData(User demoUser) {

        // ─── Vehicle 1: Honda Civic EK4 — CRITICAL ───────────────────────────
        Vehicle civic = vehicleRepository.save(Vehicle.builder()
                .user(demoUser)
                .brand("Honda")
                .model("Civic EK4")
                .year((short) 1998)
                .plate("42-19-GP")
                .currentMileage(232800)
                .createdAt(LocalDateTime.of(2023, 6, 15, 10, 5))
                .build());

        Maintenance civicOilOld = saveMaintenance(civic, Maintenance.MaintenanceType.OIL_CHANGE,
                "2024-06-12", 198200, 4800, "Castrol 5W40 sintético + filtro Bosch",
                LocalDateTime.of(2024, 6, 12, 10, 0));

        saveMaintenance(civic, Maintenance.MaintenanceType.AIR_FILTER,
                "2024-06-12", 198200, 1800, null,
                LocalDateTime.of(2024, 6, 12, 10, 30));

        Maintenance civicBrake = saveMaintenance(civic, Maintenance.MaintenanceType.BRAKE_SERVICE,
                "2024-09-20", 204000, 29500, "Pastilhas e discos dianteiros — Brembo",
                LocalDateTime.of(2024, 9, 20, 14, 0));

        saveMaintenance(civic, Maintenance.MaintenanceType.TIRE_ROTATION,
                "2024-11-05", 206500, 2000, null,
                LocalDateTime.of(2024, 11, 5, 9, 0));

        saveMaintenance(civic, Maintenance.MaintenanceType.OIL_CHANGE,
                "2025-02-22", 213800, 4800, "Castrol 5W40 sintético + filtro Bosch",
                LocalDateTime.of(2025, 2, 22, 11, 0));

        saveMaintenance(civic, Maintenance.MaintenanceType.SPARK_PLUGS,
                "2025-02-22", 213800, 3200, "NGK Iridium IX — set de 4",
                LocalDateTime.of(2025, 2, 22, 11, 30));

        Maintenance civicOilLast = saveMaintenance(civic, Maintenance.MaintenanceType.OIL_CHANGE,
                "2025-07-08", 220000, 4800, "Castrol 5W40 sintético + filtro Bosch",
                LocalDateTime.of(2025, 7, 8, 10, 0));

        saveMaintenance(civic, Maintenance.MaintenanceType.INSPECTION,
                "2026-03-15", 231000, 3500, "IPO aprovada — travões no limite",
                LocalDateTime.of(2026, 3, 15, 9, 30));

        saveMaintenance(civic, Maintenance.MaintenanceType.TIRE_ROTATION,
                "2026-04-03", 232000, 2000, null,
                LocalDateTime.of(2026, 4, 3, 10, 0));

        saveMaintenance(civic, Maintenance.MaintenanceType.COOLANT_FLUSH,
                "2026-05-10", 232500, 8500, "Flush completo + anticongelante G12",
                LocalDateTime.of(2026, 5, 10, 11, 0));

        saveMaintenance(civic, Maintenance.MaintenanceType.BRAKE_SERVICE,
                "2026-06-20", 233000, 31000, "Discos e pastilhas traseiros",
                LocalDateTime.of(2026, 6, 20, 14, 0));

        // Alerts — Civic (CRITICAL: 232800 >= 220000+10000=230000)
        saveAlert(civicOilLast, 10000, null, LocalDateTime.of(2025, 7, 8, 10, 0), null);
        saveAlert(civicBrake, 40000, null, LocalDateTime.of(2024, 9, 20, 14, 0), null);

        // Mileage logs — Civic
        saveMileageLog(civic, 198000, LocalDateTime.of(2024, 6, 10, 9, 0));
        saveMileageLog(civic, 205000, LocalDateTime.of(2024, 10, 15, 17, 0));
        saveMileageLog(civic, 213500, LocalDateTime.of(2025, 2, 20, 8, 30));
        saveMileageLog(civic, 220000, LocalDateTime.of(2025, 7, 5, 11, 0));
        saveMileageLog(civic, 232800, LocalDateTime.of(2026, 4, 1, 18, 0));

        // ─── Vehicle 2: Toyota Yaris — WARNING ───────────────────────────────
        Vehicle yaris = vehicleRepository.save(Vehicle.builder()
                .user(demoUser)
                .brand("Toyota")
                .model("Yaris")
                .year((short) 2018)
                .plate("11-XY-34")
                .currentMileage(91400)
                .createdAt(LocalDateTime.of(2023, 8, 1, 9, 0))
                .build());

        saveMaintenance(yaris, Maintenance.MaintenanceType.OIL_CHANGE,
                "2024-05-05", 71200, 3800, "Toyota 0W20 sintético",
                LocalDateTime.of(2024, 5, 5, 10, 0));

        Maintenance yarisRotation = saveMaintenance(yaris, Maintenance.MaintenanceType.TIRE_ROTATION,
                "2024-09-12", 76500, 1500, null,
                LocalDateTime.of(2024, 9, 12, 14, 0));

        saveMaintenance(yaris, Maintenance.MaintenanceType.AIR_FILTER,
                "2024-09-12", 76500, 1600, null,
                LocalDateTime.of(2024, 9, 12, 14, 30));

        Maintenance yarisOilLast = saveMaintenance(yaris, Maintenance.MaintenanceType.OIL_CHANGE,
                "2025-01-22", 82000, 3800, "Toyota 0W20 sintético",
                LocalDateTime.of(2025, 1, 22, 11, 0));

        saveMaintenance(yaris, Maintenance.MaintenanceType.INSPECTION,
                "2026-03-08", 90000, 3500, "IPO aprovada",
                LocalDateTime.of(2026, 3, 8, 9, 0));

        saveMaintenance(yaris, Maintenance.MaintenanceType.TIRE_ROTATION,
                "2026-04-12", 91200, 1500, null,
                LocalDateTime.of(2026, 4, 12, 10, 0));

        saveMaintenance(yaris, Maintenance.MaintenanceType.BRAKE_SERVICE,
                "2026-05-20", 91800, 14500, "Pastilhas dianteiras",
                LocalDateTime.of(2026, 5, 20, 11, 0));

        saveMaintenance(yaris, Maintenance.MaintenanceType.OIL_CHANGE,
                "2026-06-05", 92500, 3800, "Toyota 0W20 sintético",
                LocalDateTime.of(2026, 6, 5, 10, 0));

        // Alerts — Yaris (WARNING: 91400 >= 82000+10000-500=91500... ajuste fino)
        saveAlert(yarisOilLast, 10000, null, LocalDateTime.of(2025, 1, 22, 11, 0), null);
        saveAlert(yarisRotation, 20000, null, LocalDateTime.of(2024, 9, 12, 14, 0), null);

        // Mileage logs — Yaris
        saveMileageLog(yaris, 71000, LocalDateTime.of(2024, 5, 1, 9, 0));
        saveMileageLog(yaris, 76500, LocalDateTime.of(2024, 9, 10, 17, 0));
        saveMileageLog(yaris, 82000, LocalDateTime.of(2025, 1, 20, 8, 0));
        saveMileageLog(yaris, 91400, LocalDateTime.of(2026, 4, 10, 8, 0));

        // ─── Vehicle 3: Honda CRX — NONE ─────────────────────────────────────
        Vehicle crx = vehicleRepository.save(Vehicle.builder()
                .user(demoUser)
                .brand("Honda")
                .model("CRX")
                .year((short) 1991)
                .plate("35-AB-12")
                .currentMileage(54200)
                .createdAt(LocalDateTime.of(2024, 1, 5, 12, 0))
                .build());

        saveMaintenance(crx, Maintenance.MaintenanceType.OIL_CHANGE,
                "2024-04-12", 30200, 3500, "Motul 10W40 semi-sintético",
                LocalDateTime.of(2024, 4, 12, 10, 0));

        Maintenance crxBrake = saveMaintenance(crx, Maintenance.MaintenanceType.BRAKE_SERVICE,
                "2024-10-08", 38200, 19500, "Pastilhas traseiras + fluido travões",
                LocalDateTime.of(2024, 10, 8, 11, 0));

        saveMaintenance(crx, Maintenance.MaintenanceType.TIMING_BELT,
                "2024-10-08", 38200, 27500, "Correia + tensor + bomba de água",
                LocalDateTime.of(2024, 10, 8, 14, 0));

        Maintenance crxOilLast = saveMaintenance(crx, Maintenance.MaintenanceType.OIL_CHANGE,
                "2025-04-03", 46000, 3500, "Motul 10W40 semi-sintético",
                LocalDateTime.of(2025, 4, 3, 10, 0));

        saveMaintenance(crx, Maintenance.MaintenanceType.AIR_FILTER,
                "2025-04-03", 46000, 1200, null,
                LocalDateTime.of(2025, 4, 3, 10, 30));

        saveMaintenance(crx, Maintenance.MaintenanceType.TRANSMISSION_SERVICE,
                "2026-03-22", 53500, 12000, "Óleo caixa + diferencial",
                LocalDateTime.of(2026, 3, 22, 9, 0));

        saveMaintenance(crx, Maintenance.MaintenanceType.TIRE_ROTATION,
                "2026-04-08", 54000, 2000, null,
                LocalDateTime.of(2026, 4, 8, 10, 0));

        saveMaintenance(crx, Maintenance.MaintenanceType.SPARK_PLUGS,
                "2026-05-15", 54500, 2800, "NGK Standard — set de 4",
                LocalDateTime.of(2026, 5, 15, 11, 0));

        saveMaintenance(crx, Maintenance.MaintenanceType.COOLANT_FLUSH,
                "2026-06-10", 55000, 7500, "Flush + anticongelante OAT",
                LocalDateTime.of(2026, 6, 10, 10, 0));

        // Alerts — CRX (NONE: 54200 < 46000+10000-500=55500)
        saveAlert(crxOilLast, 10000, null, LocalDateTime.of(2025, 4, 3, 10, 0), null);
        saveAlert(crxBrake, 30000, null, LocalDateTime.of(2024, 10, 8, 11, 0), null);

        // Mileage logs — CRX
        saveMileageLog(crx, 30000, LocalDateTime.of(2024, 4, 10, 12, 0));
        saveMileageLog(crx, 38000, LocalDateTime.of(2024, 10, 5, 16, 0));
        saveMileageLog(crx, 46000, LocalDateTime.of(2025, 4, 1, 9, 0));
        saveMileageLog(crx, 54200, LocalDateTime.of(2026, 4, 5, 16, 0));
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private Maintenance saveMaintenance(Vehicle vehicle, Maintenance.MaintenanceType type,
                                        String date, int mileage, int costCents,
                                        String notes, LocalDateTime createdAt) {
        return maintenanceRepository.save(Maintenance.builder()
                .vehicle(vehicle)
                .type(type)
                .date(java.time.LocalDate.parse(date))
                .mileage(mileage)
                .costCents(costCents)
                .notes(notes)
                .createdAt(createdAt)
                .build());
    }

    private void saveAlert(Maintenance maintenance, Integer intervalKm, Integer intervalDays,
                           LocalDateTime createdAt, LocalDateTime resolvedAt) {
        alertRepository.save(Alert.builder()
                .maintenance(maintenance)
                .intervalKm(intervalKm)
                .intervalDays(intervalDays)
                .createdAt(createdAt)
                .resolvedAt(resolvedAt)
                .build());
    }

    private void saveMileageLog(Vehicle vehicle, int mileageValue, LocalDateTime recordedAt) {
        mileageLogRepository.save(MileageLog.builder()
                .vehicle(vehicle)
                .value(mileageValue)
                .recordedAt(recordedAt)
                .build());
    }
}
