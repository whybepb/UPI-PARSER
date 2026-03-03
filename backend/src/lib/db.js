import pg from 'pg';

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'DATABASE_URL is missing. Set it in backend/.env and restart (example: postgresql://user:pass@host:5432/db?sslmode=require).'
  );
}

function shouldUseSsl(urlString) {
  try {
    const parsed = new URL(urlString);
    const host = (parsed.hostname || '').toLowerCase();
    if (host === 'localhost' || host === '127.0.0.1' || host === '::1') return false;

    const sslMode = (parsed.searchParams.get('sslmode') || '').toLowerCase();
    if (sslMode === 'disable') return false;
    if (sslMode === 'require' || sslMode === 'verify-ca' || sslMode === 'verify-full') return true;
    return true;
  } catch {
    return false;
  }
}

export const pool = new Pool({
  connectionString,
  ssl: shouldUseSsl(connectionString) ? { rejectUnauthorized: false } : undefined,
  enableChannelBinding: true,
});

export async function initSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS encrypted_sync (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      payload TEXT NOT NULL,
      cursor TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
}
