package com.pitlane.pitlane.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

/** Represents alerts associated to a maintenance */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Builder
@Table(name = "alerts")
public class Alert {

    /** Alert identifier */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /** The maintenance that the alert is referring, using lazy fetch to only get the maintenance information when required */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maintenance_id", nullable = false)
    private Maintenance maintenance;

    /** The recommended km between maintenances */
    @Column(name = "interval_km")
    private Integer intervalKm;

    /** The recommended days between maintenances */
    @Column(name = "interval_days")
    private Integer intervalDays;

    /** The date when the alert was resolved */
    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    /** The date when the alert was created */
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}