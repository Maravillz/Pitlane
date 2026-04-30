-- ============================================================
-- V5__demo_account.sql
-- Demo account with realistic data for portfolio demonstration
-- Credentials: demo@pitlane.com / pitlane-demo-2024
-- ============================================================

-- Demo user (password: pitlane-demo-2024, BCrypt encoded)
INSERT INTO users (id, display_name, email, password_hash, avatar_url, created_at)
VALUES (
           'a1b2c3d4-0000-0000-0000-000000000001',
           'Miguel Santos',
           'demo@pitlane.com',
           '$2a$12$K8GjFh7LmN2pQr9sT1uVwOzXyA3bC5dE7fG9hI0jK1lM2nO4pQ6r',
           NULL,
           '2023-06-15 10:00:00'
       );

-- ─── Vehicle 1: Honda Civic EK4 ───────────────────────────────────────────────
INSERT INTO vehicles (id, user_id, brand, model, vehicle_year, plate, current_mileage, created_at)
VALUES (
           'b1c2d3e4-0000-0000-0000-000000000001',
           'a1b2c3d4-0000-0000-0000-000000000001',
           'Honda', 'Civic EK4', 1998, '42-19-GP', 228450, '2023-06-15 10:05:00'
       );

-- Mileage logs — Civic
INSERT INTO mileage_logs (id, vehicle_id, mileage_value, recorded_at)
VALUES
    ('c1000001-0000-0000-0000-000000000001', 'b1c2d3e4-0000-0000-0000-000000000001', 210000, '2023-06-15 10:05:00'),
    ('c1000001-0000-0000-0000-000000000002', 'b1c2d3e4-0000-0000-0000-000000000001', 215300, '2023-09-20 09:00:00'),
    ('c1000001-0000-0000-0000-000000000003', 'b1c2d3e4-0000-0000-0000-000000000001', 221800, '2024-01-10 08:30:00'),
    ('c1000001-0000-0000-0000-000000000004', 'b1c2d3e4-0000-0000-0000-000000000001', 228450, '2024-04-22 18:00:00');

-- Maintenances — Civic
-- d1000001-...-0004 = último OIL_CHANGE → alert activo
-- d1000001-...-0003 = último BRAKE_SERVICE → alert activo
-- d1000001-...-0002 = AIR_FILTER → alert resolvido
INSERT INTO maintenances (id, vehicle_id, type, date, mileage, cost_cents, notes, created_at)
VALUES
    ('d1000001-0000-0000-0000-000000000001', 'b1c2d3e4-0000-0000-0000-000000000001', 'OIL_CHANGE',    '2023-07-10', 211200, 4500,  'Castrol 5W40 sintético + filtro Bosch',       '2023-07-10 11:00:00'),
    ('d1000001-0000-0000-0000-000000000002', 'b1c2d3e4-0000-0000-0000-000000000001', 'AIR_FILTER',    '2023-07-10', 211200, 1800,  NULL,                                          '2023-07-10 11:30:00'),
    ('d1000001-0000-0000-0000-000000000003', 'b1c2d3e4-0000-0000-0000-000000000001', 'BRAKE_SERVICE', '2023-10-05', 216000, 28000, 'Pastilhas e discos eixo dianteiro — Brembo',  '2023-10-05 14:00:00'),
    ('d1000001-0000-0000-0000-000000000004', 'b1c2d3e4-0000-0000-0000-000000000001', 'OIL_CHANGE',    '2024-01-15', 222000, 4500,  'Castrol 5W40 sintético + filtro Bosch',       '2024-01-15 10:00:00'),
    ('d1000001-0000-0000-0000-000000000005', 'b1c2d3e4-0000-0000-0000-000000000001', 'SPARK_PLUGS',   '2024-01-15', 222000, 3200,  'NGK Iridium IX — set de 4',                   '2024-01-15 10:30:00'),
    ('d1000001-0000-0000-0000-000000000006', 'b1c2d3e4-0000-0000-0000-000000000001', 'TIMING_BELT',   '2024-02-20', 223500, 32000, 'Correia + tensor + bomba de água',            '2024-02-20 09:00:00'),
    ('d1000001-0000-0000-0000-000000000007', 'b1c2d3e4-0000-0000-0000-000000000001', 'TIRE_ROTATION', '2024-03-10', 225000, 2000,  NULL,                                          '2024-03-10 15:00:00'),
    ('d1000001-0000-0000-0000-000000000008', 'b1c2d3e4-0000-0000-0000-000000000001', 'INSPECTION',    '2024-04-01', 227000, 3500,  'IPO aprovada sem reparações',                 '2024-04-01 09:30:00');

-- Alerts — Civic
-- Alert aponta para maintenance_id — o tipo vem via JOIN com maintenance
-- OIL_CHANGE activo (último OIL_CHANGE em 222000km, intervalo 10000km, agora em 228450 → CRITICAL)
-- BRAKE_SERVICE activo (intervalo 40000km, em 216000km → WARNING a 228450)
-- AIR_FILTER resolvido (primeiro AIR_CHANGE)
INSERT INTO alerts (id, maintenance_id, interval_km, interval_days, created_at, resolved_at)
VALUES
    ('e1000001-0000-0000-0000-000000000001', 'd1000001-0000-0000-0000-000000000004', 10000, 365, '2024-01-15 10:00:00', NULL),
    ('e1000001-0000-0000-0000-000000000002', 'd1000001-0000-0000-0000-000000000003', 40000, 730, '2023-10-05 14:00:00', NULL),
    ('e1000001-0000-0000-0000-000000000003', 'd1000001-0000-0000-0000-000000000002', 20000, 730, '2023-07-10 11:30:00', '2024-01-15 10:00:00');

-- ─── Vehicle 2: Toyota Yaris ──────────────────────────────────────────────────
INSERT INTO vehicles (id, user_id, brand, model, vehicle_year, plate, current_mileage, created_at)
VALUES (
           'b1c2d3e4-0000-0000-0000-000000000002',
           'a1b2c3d4-0000-0000-0000-000000000001',
           'Toyota', 'Yaris', 2018, '11-XY-34', 87300, '2023-08-01 09:00:00'
       );

-- Mileage logs — Yaris
INSERT INTO mileage_logs (id, vehicle_id, mileage_value, recorded_at)
VALUES
    ('c2000001-0000-0000-0000-000000000001', 'b1c2d3e4-0000-0000-0000-000000000002', 72000, '2023-08-01 09:00:00'),
    ('c2000001-0000-0000-0000-000000000002', 'b1c2d3e4-0000-0000-0000-000000000002', 79500, '2023-12-10 17:00:00'),
    ('c2000001-0000-0000-0000-000000000003', 'b1c2d3e4-0000-0000-0000-000000000002', 87300, '2024-04-15 08:00:00');

-- Maintenances — Yaris
INSERT INTO maintenances (id, vehicle_id, type, date, mileage, cost_cents, notes, created_at)
VALUES
    ('d2000001-0000-0000-0000-000000000001', 'b1c2d3e4-0000-0000-0000-000000000002', 'OIL_CHANGE',    '2023-08-15', 72500, 3800, 'Toyota 0W20 sintético',          '2023-08-15 10:00:00'),
    ('d2000001-0000-0000-0000-000000000002', 'b1c2d3e4-0000-0000-0000-000000000002', 'TIRE_ROTATION', '2023-12-12', 79500, 1500, NULL,                             '2023-12-12 14:00:00'),
    ('d2000001-0000-0000-0000-000000000003', 'b1c2d3e4-0000-0000-0000-000000000002', 'OIL_CHANGE',    '2024-02-10', 83000, 3800, 'Toyota 0W20 sintético',          '2024-02-10 11:00:00'),
    ('d2000001-0000-0000-0000-000000000004', 'b1c2d3e4-0000-0000-0000-000000000002', 'INSPECTION',    '2024-03-20', 85500, 3500, 'IPO aprovada — pneus no limite', '2024-03-20 09:00:00');

-- Alerts — Yaris
-- OIL_CHANGE activo (último em 83000km, intervalo 10000km, agora em 87300 → WARNING)
-- TIRE_ROTATION activo (intervalo 365 dias desde 2023-12-12 → WARNING)
INSERT INTO alerts (id, maintenance_id, interval_km, interval_days, created_at, resolved_at)
VALUES
    ('e2000001-0000-0000-0000-000000000001', 'd2000001-0000-0000-0000-000000000003', 10000, 365, '2024-02-10 11:00:00', NULL),
    ('e2000001-0000-0000-0000-000000000002', 'd2000001-0000-0000-0000-000000000002',  NULL, 365, '2023-12-12 14:00:00', NULL);

-- ─── Vehicle 3: Honda CRX ─────────────────────────────────────────────────────
INSERT INTO vehicles (id, user_id, brand, model, vehicle_year, plate, current_mileage, created_at)
VALUES (
           'b1c2d3e4-0000-0000-0000-000000000003',
           'a1b2c3d4-0000-0000-0000-000000000001',
           'Honda', 'CRX', 1991, '35-AB-12', 231000, '2024-01-05 12:00:00'
       );

-- Mileage logs — CRX
INSERT INTO mileage_logs (id, vehicle_id, mileage_value, recorded_at)
VALUES
    ('c3000001-0000-0000-0000-000000000001', 'b1c2d3e4-0000-0000-0000-000000000003', 225000, '2024-01-05 12:00:00'),
    ('c3000001-0000-0000-0000-000000000002', 'b1c2d3e4-0000-0000-0000-000000000003', 231000, '2024-04-10 16:00:00');

-- Maintenances — CRX
INSERT INTO maintenances (id, vehicle_id, type, date, mileage, cost_cents, notes, created_at)
VALUES
    ('d3000001-0000-0000-0000-000000000001', 'b1c2d3e4-0000-0000-0000-000000000003', 'OIL_CHANGE',    '2024-01-10', 225200, 3500,  'Motul 10W40 semi-sintético',           '2024-01-10 10:00:00'),
    ('d3000001-0000-0000-0000-000000000002', 'b1c2d3e4-0000-0000-0000-000000000003', 'BRAKE_SERVICE', '2024-02-05', 226000, 18500, 'Pastilhas traseiras + fluido travões', '2024-02-05 11:00:00'),
    ('d3000001-0000-0000-0000-000000000003', 'b1c2d3e4-0000-0000-0000-000000000003', 'AIR_FILTER',    '2024-02-05', 226000, 1200,  NULL,                                   '2024-02-05 11:30:00'),
    ('d3000001-0000-0000-0000-000000000004', 'b1c2d3e4-0000-0000-0000-000000000003', 'TIMING_BELT',   '2022-06-01', 198000, 28000, 'Correia + tensor originais',           '2022-06-01 10:00:00');

-- Alerts — CRX
-- OIL_CHANGE activo (em 225200km, intervalo 8000km, agora em 231000 → CRITICAL)
-- TIMING_BELT activo (intervalo 730 dias desde 2022-06-01 → CRITICAL por data)
-- BRAKE_SERVICE activo (intervalo 30000km desde 226000 → NONE ainda)
INSERT INTO alerts (id, maintenance_id, interval_km, interval_days, created_at, resolved_at)
VALUES
    ('e3000001-0000-0000-0000-000000000001', 'd3000001-0000-0000-0000-000000000001', 8000,  180,  '2024-01-10 10:00:00', NULL),
    ('e3000001-0000-0000-0000-000000000002', 'd3000001-0000-0000-0000-000000000004', NULL,  730,  '2022-06-01 10:00:00', NULL),
    ('e3000001-0000-0000-0000-000000000003', 'd3000001-0000-0000-0000-000000000002', 30000, NULL, '2024-02-05 11:00:00', NULL);