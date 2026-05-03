package com.pitlane.pitlane.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

/** Tracks individual changes made during a demo session */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Builder
@Table(name = "demo_changes")
public class DemoChange {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /** The session this change belongs to */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private DemoSession session;

    /** When the change was made */
    @Column(name = "changed_at", nullable = false)
    private LocalDateTime changedAt;

    /** What action was performed */
    @Column(name = "action", nullable = false)
    private String action;
}
