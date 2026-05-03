-- ============================================================
-- V7__demo_session_tracking.sql
-- Adds demo session tracking tables
-- ============================================================

UPDATE users SET display_name = 'User Testing' WHERE email = 'demo@pitlane.com';

CREATE TABLE demo_sessions (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    started_at  TIMESTAMP   NOT NULL,
    ended_at    TIMESTAMP,
    end_reason  VARCHAR(20) -- 'LOGOUT', 'SCHEDULED_RESET'
);

CREATE TABLE demo_changes (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id  UUID        REFERENCES demo_sessions(id) ON DELETE CASCADE,
    changed_at  TIMESTAMP   NOT NULL,
    action      VARCHAR(50) NOT NULL -- 'MILEAGE_UPDATE', 'ALERT_RESOLVED', 'MAINTENANCE_CREATED', etc.
);
