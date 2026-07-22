import { Pool } from 'pg';

/**
 * Shared Postgres connection pool.
 *
 * One pool per process, shared by every module's repositories. A `pg.Pool` does
 * not open a connection until the first query, so constructing it at boot is
 * safe even when the database is unreachable — the health probe stays green and
 * only a real query fails. Managed-Postgres provisioning is E01-Th01-S02-T03;
 * locally and in CI this points at the ephemeral Postgres service.
 */

export const PG_POOL = Symbol('PG_POOL');

let pool: Pool | undefined;

export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env['DATABASE_URL'];
    if (!connectionString) {
      throw new Error('DATABASE_URL is not set');
    }
    pool = new Pool({ connectionString, max: 10 });
  }
  return pool;
}

/** True when a database is configured — lets modules fall back in dev/CI-lite. */
export function hasDatabase(): boolean {
  return Boolean(process.env['DATABASE_URL']);
}
