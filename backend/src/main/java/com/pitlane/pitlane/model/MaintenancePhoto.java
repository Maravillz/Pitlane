package com.pitlane.pitlane.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

/** The maintenance photos model */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Builder
@EqualsAndHashCode(exclude = {"maintenance"})
@ToString(exclude = {"maintenance"})
@Table(name = "maintenance_photos")
public class MaintenancePhoto {

    /** The photo id */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /** The maintenance associated to the photos */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maintenance_id", nullable = false)
    private Maintenance maintenance;

    /** The photo url */
    @Column(name = "url", nullable = false)
    private String url;

    /** The photo creation date */
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}