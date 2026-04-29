package com.pitlane.pitlane.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

/** A record of logs for the different mileage changes */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Builder
@EqualsAndHashCode(exclude = {"vehicle"})
@ToString(exclude = {"vehicle"})
@Table(name = "mileage_logs")
public class MileageLog {

    /** The log id */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /** The vehicle that had the mileage updated */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    /** The mileage at the time of update */
    @Column(name = "mileage_value", nullable = false)
    private Integer value;

    /** The creation date of the log */
    @Column(name = "recorded_at", nullable = false)
    private LocalDateTime recordedAt;
}