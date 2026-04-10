CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    display_name  VARCHAR NOT NULL,
    email         VARCHAR NOT NULL UNIQUE,
    password_hash VARCHAR NOT NULL,
    avatar_url    VARCHAR,
    created_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE vehicles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    brand           VARCHAR NOT NULL,
    model           VARCHAR NOT NULL,
    year            INTEGER NOT NULL,
    plate           VARCHAR,
    current_mileage INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE mileage_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id  UUID NOT NULL REFERENCES vehicles(id),
    mileage     INTEGER NOT NULL,
    recorded_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE maintenances (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id       UUID NOT NULL REFERENCES vehicles(id),
    maintenance_type VARCHAR NOT NULL,
    service_date     DATE NOT NULL,
    mileage          INTEGER NOT NULL,
    cost_cents       INTEGER,
    notes            TEXT,
    created_at       TIMESTAMP DEFAULT NOW()
);

CREATE TABLE maintenance_photos (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    maintenance_id UUID NOT NULL REFERENCES maintenances(id),
    photo_url      VARCHAR NOT NULL,
    created_at     TIMESTAMP DEFAULT NOW()
);

CREATE TABLE alerts (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    maintenance_id UUID NOT NULL REFERENCES maintenances(id),
    interval_km    INTEGER,
    interval_days  INTEGER,
    resolved_at    TIMESTAMP,
    created_at     TIMESTAMP DEFAULT NOW()
);

CREATE TABLE equipment (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES users(id),
    display_name VARCHAR NOT NULL,
    description  TEXT,
    category     VARCHAR,
    created_at   TIMESTAMP DEFAULT NOW()
);
