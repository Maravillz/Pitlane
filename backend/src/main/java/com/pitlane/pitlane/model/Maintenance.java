package com.pitlane.pitlane.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/** The maintenance associated to a vehicle */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Builder
@EqualsAndHashCode(exclude = {"vehicle", "photos"})
@ToString(exclude = {"vehicle", "photos"})
@Table(name = "maintenances")
public class Maintenance {

    /** All the maintenances types */
    public enum MaintenanceType {
        /** Enum representing a oil chance service */
        OIL_CHANGE,
        /** Enum representing a tire rotation service */
        TIRE_ROTATION,

        /** Enum representing a brake service */
        BRAKE_SERVICE,

        /** Enum representing an air filter chance */
        AIR_FILTER,

        /** Enum representing changing spark plugs */
        SPARK_PLUGS,

        /** Enum representing replacing the timing belt */
        TIMING_BELT,

        /** Enum representing vehicle coolant flush */
        COOLANT_FLUSH,

        /** Enum representing a transmission service */
        TRANSMISSION_SERVICE,

        /** Enum representing a battery change */
        BATTERY,

        /** Enum representing the periodic vehicle inspection */
        INSPECTION,

        /** Enum representing other services not included on the enums */
        OTHER
    }

    /** The maintenance id */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /** The vehicle associated to the maintenance */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    /** The maintenance type */
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private MaintenanceType type;

    /** The maintenance date */
    @Column(name = "date", nullable = false)
    private LocalDate date;

    /** The maintenance mileage */
    @Column(name = "mileage", nullable = false)
    private Integer mileage;

    /** The maintenance cost */
    @Column(name = "cost_cents")
    private Integer costCents;

    /** The maintenance notes */
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    /** The maintenance creation date */
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    /** The list of photos uploaded to the app */
    @OneToMany(mappedBy = "maintenance", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MaintenancePhoto> photos;
}