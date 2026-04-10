CREATE TABLE refresh_token (
    id         UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    token      VARCHAR NOT NULL UNIQUE,
    user_id    UUID    NOT NULL REFERENCES users(id),
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP        DEFAULT NOW(),
    expires_at TIMESTAMP        NOT NULL
);