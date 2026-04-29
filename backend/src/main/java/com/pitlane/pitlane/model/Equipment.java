package com.pitlane.pitlane.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * The model to represent the equipment a user owns for their diy projects
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Builder
@EqualsAndHashCode(exclude = {"user"})
@ToString(exclude = {"user"})
@Table(name = "equipment")
public class Equipment {

    /** An enum containing all categories of the equipments */
    public enum EquipmentCategory {
        /** All tools that require connecting to an outlet or have a battery */
        ELECTRIC_TOOLS,

        /** All products used to detail a car */
        DETAILING,

        /** All tools that do not require electricity */
        MANUAL_TOOLS,

        /** Other types of equipments */
        OTHER
    }

    /** The equipment identifier */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /** The user that owns the equipment */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** The equipment name */
    @Column(name = "name", nullable = false)
    private String name;

    /** The equipment description */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /** The equipment category */
    @Enumerated(EnumType.STRING)
    @Column(name = "category")
    private EquipmentCategory category;

    /** The equipment creation date */
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}