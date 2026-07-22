-- 0001_auth.sql — auth module schema (E01-Th03-S01-T01, FR-1).
--
-- Schema-per-module (02b §4): the auth module owns the `auth` schema and only
-- the auth schema. No other module reads or writes these tables directly.

CREATE SCHEMA IF NOT EXISTS auth;

-- A user is identified by phone number, but the number is never stored in clear:
--   * phone_ciphertext — AES-256-GCM, reversible only with the encryption key
--   * phone_blind_index — HMAC-SHA256, deterministic, the lookup key
-- (see internal/phone-crypto.ts). The unique constraint is on the blind index,
-- which is what enforces "one account per number" without a plaintext column.
CREATE TABLE auth."user" (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_ciphertext    TEXT        NOT NULL,
  phone_blind_index   TEXT        NOT NULL UNIQUE,
  consent_accepted_at TIMESTAMPTZ NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- OTP challenges. The code itself is stored only as a peppered HMAC; a DB dump
-- reveals no live codes. Challenges are short-lived and single-use.
CREATE TABLE auth.otp_challenge (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_blind_index TEXT        NOT NULL,
  code_hash         TEXT        NOT NULL,
  expires_at        TIMESTAMPTZ NOT NULL,
  attempts          INT         NOT NULL DEFAULT 0,
  consumed_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Lookups: "latest active challenge for this number" and the rate-limit window
-- counts, both filtered by blind index and ordered/bounded by created_at.
CREATE INDEX otp_challenge_lookup_idx
  ON auth.otp_challenge (phone_blind_index, created_at DESC);

-- A background job (later task) prunes expired/consumed challenges; this index
-- supports that sweep.
CREATE INDEX otp_challenge_expiry_idx
  ON auth.otp_challenge (expires_at)
  WHERE consumed_at IS NULL;
