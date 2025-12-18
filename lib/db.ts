import { neon } from '@neondatabase/serverless';

type NeonSql = ReturnType<typeof neon>;

let _sql: NeonSql | null = null;

function getDatabaseUrl(): string {
  // Read from env at runtime (do not throw at module-import time; Next may import during build)
  let databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  // Clean the connection string - remove any quotes, 'psql' prefix, or whitespace
  databaseUrl = databaseUrl.trim();
  if (databaseUrl.startsWith('psql ')) {
    databaseUrl = databaseUrl.substring(5).trim();
  }

  // Remove surrounding quotes if present
  if (
    (databaseUrl.startsWith('"') && databaseUrl.endsWith('"')) ||
    (databaseUrl.startsWith("'") && databaseUrl.endsWith("'"))
  ) {
    databaseUrl = databaseUrl.slice(1, -1).trim();
  }

  // Validate it's a valid URL
  try {
    new URL(databaseUrl);
  } catch {
    throw new Error(
      `Invalid DATABASE_URL format. Expected postgresql:// URL, got: ${databaseUrl.substring(0, 50)}...`
    );
  }

  return databaseUrl;
}

function getSql(): NeonSql {
  if (_sql) return _sql;
  _sql = neon(getDatabaseUrl());
  return _sql;
}

/**
 * Neon serverless client, lazily initialized on first query.
 * Use as: await sql`SELECT ...`
 */
export const sql: NeonSql = ((...args: any[]) => getSql()(...args)) as NeonSql;
