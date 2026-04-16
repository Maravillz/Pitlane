ALTER TABLE equipment RENAME COLUMN display_name TO name;

ALTER TABLE mileage_logs RENAME COLUMN mileage TO value;

ALTER TABLE maintenances RENAME COLUMN maintenance_type TO type;
ALTER TABLE maintenances RENAME COLUMN service_date TO date;

ALTER TABLE maintenance_photos RENAME COLUMN photo_url TO url;

ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;