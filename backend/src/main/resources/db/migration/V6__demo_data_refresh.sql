-- ============================================================
-- V6__demo_data_refresh.sql
-- Refreshes demo account data for portfolio demonstration
-- Designed for April/May/June 2026
-- Alert strategy: km-only thresholds to avoid date-based critical
-- Civic EK4  → CRITICAL  (passou o limite de km)
-- Toyota Yaris → WARNING  (dentro da zona de aviso)
-- Honda CRX   → NONE     (confortável)
-- ============================================================

-- Update password
UPDATE users
SET password_hash = '$2a$12$uSg9gTICz5UbSwd2nd97tO8JuGeH3uegfdtqtIixwPSCjhGxdK1Wi'
WHERE email = 'demo@pitlane.com';

-- ─── Reset existing demo data ─────────────────────────────────────────────────
DELETE FROM alerts      WHERE maintenance_id IN (SELECT id FROM maintenances WHERE vehicle_id IN ('b1c2d3e4-0000-0000-0000-000000000001','b1c2d3e4-0000-0000-0000-000000000002','b1c2d3e4-0000-0000-0000-000000000003'));
DELETE FROM maintenances WHERE vehicle_id   IN ('b1c2d3e4-0000-0000-0000-000000000001','b1c2d3e4-0000-0000-0000-000000000002','b1c2d3e4-0000-0000-0000-000000000003');
DELETE FROM mileage_logs WHERE vehicle_id   IN ('b1c2d3e4-0000-0000-0000-000000000001','b1c2d3e4-0000-0000-0000-000000000002','b1c2d3e4-0000-0000-0000-000000000003');

-- Update mileages to match new scenario
UPDATE vehicles SET current_mileage = 232800 WHERE id = 'b1c2d3e4-0000-0000-0000-000000000001'; -- Civic   → passou limite oil (220000+10000=230000)
UPDATE vehicles SET current_mileage = 91400  WHERE id = 'b1c2d3e4-0000-0000-0000-000000000002'; -- Yaris   → dentro zona warning oil (83000+10000=93000, warning a 1500km)
UPDATE vehicles SET current_mileage = 54200  WHERE id = 'b1c2d3e4-0000-0000-0000-000000000003'; -- CRX     → longe do limite (45000+10000=55000, faltam 800km)

-- ─── Vehicle 1: Honda Civic EK4 — CRITICAL ───────────────────────────────────
-- currentMileage = 232800
-- OIL_CHANGE último em 220000km, intervalo 10000km → 232800 >= 230000 → CRITICAL ✓

INSERT INTO mileage_logs (id, vehicle_id, mileage_value, recorded_at) VALUES
    ('c1000001-0000-0000-0000-000000000001', 'b1c2d3e4-0000-0000-0000-000000000001', 198000, '2024-06-10 09:00:00'),
    ('c1000001-0000-0000-0000-000000000002', 'b1c2d3e4-0000-0000-0000-000000000001', 205000, '2024-10-15 17:00:00'),
    ('c1000001-0000-0000-0000-000000000003', 'b1c2d3e4-0000-0000-0000-000000000001', 213500, '2025-02-20 08:30:00'),
    ('c1000001-0000-0000-0000-000000000004', 'b1c2d3e4-0000-0000-0000-000000000001', 220000, '2025-07-05 11:00:00'),
    ('c1000001-0000-0000-0000-000000000005', 'b1c2d3e4-0000-0000-0000-000000000001', 232800, '2026-04-01 18:00:00');

INSERT INTO maintenances (id, vehicle_id, type, date, mileage, cost_cents, notes, created_at) VALUES
    -- Histórico
    ('d1000001-0000-0000-0000-000000000001', 'b1c2d3e4-0000-0000-0000-000000000001', 'OIL_CHANGE',    '2024-06-12', 198200,  4800, 'Castrol 5W40 sintético + filtro Bosch',       '2024-06-12 10:00:00'),
    ('d1000001-0000-0000-0000-000000000002', 'b1c2d3e4-0000-0000-0000-000000000001', 'AIR_FILTER',    '2024-06-12', 198200,  1800, NULL,                                          '2024-06-12 10:30:00'),
    ('d1000001-0000-0000-0000-000000000003', 'b1c2d3e4-0000-0000-0000-000000000001', 'BRAKE_SERVICE', '2024-09-20', 204000, 29500, 'Pastilhas e discos dianteiros — Brembo',      '2024-09-20 14:00:00'),
    ('d1000001-0000-0000-0000-000000000004', 'b1c2d3e4-0000-0000-0000-000000000001', 'TIRE_ROTATION', '2024-11-05', 206500,  2000, NULL,                                          '2024-11-05 09:00:00'),
    ('d1000001-0000-0000-0000-000000000005', 'b1c2d3e4-0000-0000-0000-000000000001', 'OIL_CHANGE',    '2025-02-22', 213800,  4800, 'Castrol 5W40 sintético + filtro Bosch',       '2025-02-22 11:00:00'),
    ('d1000001-0000-0000-0000-000000000006', 'b1c2d3e4-0000-0000-0000-000000000001', 'SPARK_PLUGS',   '2025-02-22', 213800,  3200, 'NGK Iridium IX — set de 4',                   '2025-02-22 11:30:00'),
    -- Último OIL_CHANGE — base do alert CRITICAL
    ('d1000001-0000-0000-0000-000000000007', 'b1c2d3e4-0000-0000-0000-000000000001', 'OIL_CHANGE',    '2025-07-08', 220000,  4800, 'Castrol 5W40 sintético + filtro Bosch',       '2025-07-08 10:00:00'),
    -- Mês passado (Março 2026)
    ('d1000001-0000-0000-0000-000000000008', 'b1c2d3e4-0000-0000-0000-000000000001', 'INSPECTION',    '2026-03-15', 231000,  3500, 'IPO aprovada — travões no limite',            '2026-03-15 09:30:00'),
    -- Este mês (Abril 2026)
    ('d1000001-0000-0000-0000-000000000009', 'b1c2d3e4-0000-0000-0000-000000000001', 'TIRE_ROTATION', '2026-04-03', 232000,  2000, NULL,                                          '2026-04-03 10:00:00'),
    -- Próximo mês (Maio 2026) — agendado
    ('d1000001-0000-0000-0000-000000000010', 'b1c2d3e4-0000-0000-0000-000000000001', 'COOLANT_FLUSH', '2026-05-10', 232500,  8500, 'Flush completo + anticongelante G12',         '2026-05-10 11:00:00'),
    -- Junho 2026
    ('d1000001-0000-0000-0000-000000000011', 'b1c2d3e4-0000-0000-0000-000000000001', 'BRAKE_SERVICE', '2026-06-20', 233000, 31000, 'Discos e pastilhas traseiros',                '2026-06-20 14:00:00');

-- Alerts — Civic (CRITICAL: oil passou 232800 > 220000+10000=230000)
INSERT INTO alerts (id, maintenance_id, interval_km, interval_days, created_at, resolved_at) VALUES
    ('e1000001-0000-0000-0000-000000000001', 'd1000001-0000-0000-0000-000000000007', 10000, NULL, '2025-07-08 10:00:00', NULL),
    ('e1000001-0000-0000-0000-000000000002', 'd1000001-0000-0000-0000-000000000003', 40000, NULL, '2024-09-20 14:00:00', NULL),
    -- Resolvido
    ('e1000001-0000-0000-0000-000000000003', 'd1000001-0000-0000-0000-000000000002', 20000, NULL, '2024-06-12 10:30:00', '2025-02-22 11:00:00');

-- ─── Vehicle 2: Toyota Yaris — WARNING ───────────────────────────────────────
-- currentMileage = 91400
-- OIL_CHANGE último em 83000km, intervalo 10000km, warning a 1500km
-- 91400 >= 83000 + 10000 - 1500 = 91500 → ainda não warning mas muito perto
-- Ajuste: último OIL_CHANGE em 82000km → 91400 >= 82000+10000-1500=90500 → WARNING ✓

INSERT INTO mileage_logs (id, vehicle_id, mileage_value, recorded_at) VALUES
    ('c2000001-0000-0000-0000-000000000001', 'b1c2d3e4-0000-0000-0000-000000000002', 71000, '2024-05-01 09:00:00'),
    ('c2000001-0000-0000-0000-000000000002', 'b1c2d3e4-0000-0000-0000-000000000002', 76500, '2024-09-10 17:00:00'),
    ('c2000001-0000-0000-0000-000000000003', 'b1c2d3e4-0000-0000-0000-000000000002', 82000, '2025-01-20 08:00:00'),
    ('c2000001-0000-0000-0000-000000000004', 'b1c2d3e4-0000-0000-0000-000000000002', 91400, '2026-04-10 08:00:00');

INSERT INTO maintenances (id, vehicle_id, type, date, mileage, cost_cents, notes, created_at) VALUES
    -- Histórico
    ('d2000001-0000-0000-0000-000000000001', 'b1c2d3e4-0000-0000-0000-000000000002', 'OIL_CHANGE',    '2024-05-05', 71200,  3800, 'Toyota 0W20 sintético',             '2024-05-05 10:00:00'),
    ('d2000001-0000-0000-0000-000000000002', 'b1c2d3e4-0000-0000-0000-000000000002', 'TIRE_ROTATION', '2024-09-12', 76500,  1500, NULL,                                '2024-09-12 14:00:00'),
    ('d2000001-0000-0000-0000-000000000003', 'b1c2d3e4-0000-0000-0000-000000000002', 'AIR_FILTER',    '2024-09-12', 76500,  1600, NULL,                                '2024-09-12 14:30:00'),
    -- Último OIL_CHANGE — base do alert WARNING
    ('d2000001-0000-0000-0000-000000000004', 'b1c2d3e4-0000-0000-0000-000000000002', 'OIL_CHANGE',    '2025-01-22', 82000,  3800, 'Toyota 0W20 sintético',             '2025-01-22 11:00:00'),
    -- Mês passado (Março 2026)
    ('d2000001-0000-0000-0000-000000000005', 'b1c2d3e4-0000-0000-0000-000000000002', 'INSPECTION',    '2026-03-08', 90000,  3500, 'IPO aprovada',                      '2026-03-08 09:00:00'),
    -- Este mês (Abril 2026)
    ('d2000001-0000-0000-0000-000000000006', 'b1c2d3e4-0000-0000-0000-000000000002', 'TIRE_ROTATION', '2026-04-12', 91200,  1500, NULL,                                '2026-04-12 10:00:00'),
    -- Maio 2026
    ('d2000001-0000-0000-0000-000000000007', 'b1c2d3e4-0000-0000-0000-000000000002', 'BRAKE_SERVICE', '2026-05-20', 91800, 14500, 'Pastilhas dianteiras',              '2026-05-20 11:00:00'),
    -- Junho 2026
    ('d2000001-0000-0000-0000-000000000008', 'b1c2d3e4-0000-0000-0000-000000000002', 'OIL_CHANGE',    '2026-06-05', 92500,  3800, 'Toyota 0W20 sintético',             '2026-06-05 10:00:00');

-- Alerts — Yaris (WARNING: 91400 >= 82000+10000-1500=90500)
INSERT INTO alerts (id, maintenance_id, interval_km, interval_days, created_at, resolved_at) VALUES
    ('e2000001-0000-0000-0000-000000000001', 'd2000001-0000-0000-0000-000000000004', 10000, NULL, '2025-01-22 11:00:00', NULL),
    ('e2000001-0000-0000-0000-000000000002', 'd2000001-0000-0000-0000-000000000002', 20000, NULL, '2024-09-12 14:00:00', NULL),
    -- Resolvido
    ('e2000001-0000-0000-0000-000000000003', 'd2000001-0000-0000-0000-000000000003', 15000, NULL, '2024-09-12 14:30:00', '2025-01-22 11:00:00');

-- ─── Vehicle 3: Honda CRX — NONE ─────────────────────────────────────────────
-- currentMileage = 54200
-- OIL_CHANGE último em 45000km, intervalo 10000km
-- 54200 < 45000+10000-1500=53500 → ainda NONE ✓ (faltam 800km para warning)

INSERT INTO mileage_logs (id, vehicle_id, mileage_value, recorded_at) VALUES
    ('c3000001-0000-0000-0000-000000000001', 'b1c2d3e4-0000-0000-0000-000000000003', 30000, '2024-04-10 12:00:00'),
    ('c3000001-0000-0000-0000-000000000002', 'b1c2d3e4-0000-0000-0000-000000000003', 38000, '2024-10-05 16:00:00'),
    ('c3000001-0000-0000-0000-000000000003', 'b1c2d3e4-0000-0000-0000-000000000003', 45000, '2025-04-01 09:00:00'),
    ('c3000001-0000-0000-0000-000000000004', 'b1c2d3e4-0000-0000-0000-000000000003', 54200, '2026-04-05 16:00:00');

INSERT INTO maintenances (id, vehicle_id, type, date, mileage, cost_cents, notes, created_at) VALUES
    -- Histórico
    ('d3000001-0000-0000-0000-000000000001', 'b1c2d3e4-0000-0000-0000-000000000003', 'OIL_CHANGE',          '2024-04-12', 30200,  3500, 'Motul 10W40 semi-sintético',            '2024-04-12 10:00:00'),
    ('d3000001-0000-0000-0000-000000000002', 'b1c2d3e4-0000-0000-0000-000000000003', 'BRAKE_SERVICE',       '2024-10-08', 38200, 19500, 'Pastilhas traseiras + fluido travões',  '2024-10-08 11:00:00'),
    ('d3000001-0000-0000-0000-000000000003', 'b1c2d3e4-0000-0000-0000-000000000003', 'TIMING_BELT',         '2024-10-08', 38200, 27500, 'Correia + tensor + bomba de água',      '2024-10-08 14:00:00'),
    -- Último OIL_CHANGE — base do alert NONE
    ('d3000001-0000-0000-0000-000000000004', 'b1c2d3e4-0000-0000-0000-000000000003', 'OIL_CHANGE',          '2025-04-03', 45000,  3500, 'Motul 10W40 semi-sintético',            '2025-04-03 10:00:00'),
    ('d3000001-0000-0000-0000-000000000005', 'b1c2d3e4-0000-0000-0000-000000000003', 'AIR_FILTER',          '2025-04-03', 45000,  1200, NULL,                                    '2025-04-03 10:30:00'),
    -- Mês passado (Março 2026)
    ('d3000001-0000-0000-0000-000000000006', 'b1c2d3e4-0000-0000-0000-000000000003', 'TRANSMISSION_SERVICE','2026-03-22', 53500, 12000, 'Óleo caixa + diferencial',              '2026-03-22 09:00:00'),
    -- Este mês (Abril 2026)
    ('d3000001-0000-0000-0000-000000000007', 'b1c2d3e4-0000-0000-0000-000000000003', 'TIRE_ROTATION',       '2026-04-08', 54000,  2000, NULL,                                    '2026-04-08 10:00:00'),
    -- Maio 2026
    ('d3000001-0000-0000-0000-000000000008', 'b1c2d3e4-0000-0000-0000-000000000003', 'SPARK_PLUGS',         '2026-05-15', 54500,  2800, 'NGK Standard — set de 4',              '2026-05-15 11:00:00'),
    -- Junho 2026
    ('d3000001-0000-0000-0000-000000000009', 'b1c2d3e4-0000-0000-0000-000000000003', 'COOLANT_FLUSH',       '2026-06-10', 55000,  7500, 'Flush + anticongelante OAT',           '2026-06-10 10:00:00');

-- Alerts — CRX (NONE: 54200 < 45000+10000-1500=53500... espera, 54200 > 53500)
-- Ajuste: warning threshold não activo porque 54200 < 45000+10000=55000 (não passou limite)
-- mas warningKmThreshold default é provavelmente 1500 → 54200 >= 53500 → WARNING
-- Para garantir NONE: último OIL_CHANGE em 46000km → 54200 < 46000+10000-1500=54500 → NONE ✓
UPDATE maintenances SET mileage = 46000 WHERE id = 'd3000001-0000-0000-0000-000000000004';
UPDATE mileage_logs SET mileage_value = 46000 WHERE id = 'c3000001-0000-0000-0000-000000000003';

INSERT INTO alerts (id, maintenance_id, interval_km, interval_days, created_at, resolved_at) VALUES
    ('e3000001-0000-0000-0000-000000000001', 'd3000001-0000-0000-0000-000000000004', 10000, NULL, '2025-04-03 10:00:00', NULL),
    ('e3000001-0000-0000-0000-000000000002', 'd3000001-0000-0000-0000-000000000002', 30000, NULL, '2024-10-08 11:00:00', NULL),
    -- Resolvido
    ('e3000001-0000-0000-0000-000000000003', 'd3000001-0000-0000-0000-000000000001', 10000, NULL, '2024-04-12 10:00:00', '2025-04-03 10:00:00');