import { neon } from '@neondatabase/serverless';

// Get database URL from environment variables
let databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Clean the connection string - remove any quotes, 'psql' prefix, or whitespace
databaseUrl = databaseUrl.trim();
// Remove 'psql' prefix if present
if (databaseUrl.startsWith('psql ')) {
  databaseUrl = databaseUrl.substring(5).trim();
}
// Remove surrounding quotes if present
if ((databaseUrl.startsWith('"') && databaseUrl.endsWith('"')) || 
    (databaseUrl.startsWith("'") && databaseUrl.endsWith("'"))) {
  databaseUrl = databaseUrl.slice(1, -1).trim();
}

// Validate it's a valid URL
try {
  new URL(databaseUrl);
} catch {
  throw new Error(`Invalid DATABASE_URL format. Expected postgresql:// URL, got: ${databaseUrl.substring(0, 50)}...`);
}

// Create Neon serverless client
// Use sql`` template literals for queries (this provides SQL injection protection)
export const sql = neon(databaseUrl);
