package com.pitlane.pitlane.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/** Tracks demo account sessions for analytics */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Builder
@Table(name = "demo_sessions")
public class DemoSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /** When the demo session started */
    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    /** When the demo session ended */
    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    /** How the session ended — LOGOUT or SCHEDULED_RESET */
    @Column(name = "end_reason")
    private String endReason;

    /** All changes made during this session */
    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DemoChange> changes;
}
