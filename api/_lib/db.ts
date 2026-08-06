import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

const SCHEMA_VERSION = 'billing_v3';

let schemaReady: Promise<void> | null = null;

export function getSql(): NeonQueryFunction<false, false> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not configured');
  }
  return neon(url);
}

/**
 * Returns a SQL client after ensuring schema exists.
 * Fast path: one lightweight SELECT against schema_meta — skips all DDL
 * on warm instances and after the first successful migrate on cold starts.
 */
export async function ensureSchema(): Promise<NeonQueryFunction<false, false>> {
  const sql = getSql();

  if (!schemaReady) {
    schemaReady = bootstrapSchema(sql).catch((err) => {
      schemaReady = null;
      throw err;
    });
  }

  await schemaReady;
  return sql;
}

async function bootstrapSchema(sql: NeonQueryFunction<false, false>): Promise<void> {
  // Fast path — schema already migrated
  try {
    const rows = await sql`
      SELECT value FROM schema_meta WHERE key = 'version' LIMIT 1
    `;
    if (rows.length && String(rows[0].value) === SCHEMA_VERSION) {
      return;
    }
  } catch {
    // schema_meta missing — fall through to full migrate
  }

  await migrateCore(sql);

  const { createBillingSchema } = await import('./billing-schema.js');
  await createBillingSchema(sql);
  await migrateBillingV3Columns(sql);

  await sql`
    CREATE TABLE IF NOT EXISTS schema_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    INSERT INTO schema_meta (key, value, updated_at)
    VALUES ('version', ${SCHEMA_VERSION}, NOW())
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
  `;
}

/** Additive columns for existing DBs (CREATE TABLE IF NOT EXISTS won't alter). */
async function migrateBillingV3Columns(sql: NeonQueryFunction<false, false>): Promise<void> {
  await Promise.all([
    sql`ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS hsn_sac TEXT`,
    sql`ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS hsn_sac TEXT`,
    sql`ALTER TABLE quotations ADD COLUMN IF NOT EXISTS place_of_supply TEXT`,
  ]);
}

async function migrateCore(sql: NeonQueryFunction<false, false>): Promise<void> {
  // Run independent CREATE TABLEs in parallel batches to cut cold-start latency
  await Promise.all([
    sql`
      CREATE TABLE IF NOT EXISTS site_content (
        id TEXT PRIMARY KEY DEFAULT 'main',
        data JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `,
    sql`
      CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        department TEXT NOT NULL DEFAULT '',
        location TEXT NOT NULL DEFAULT '',
        type TEXT NOT NULL DEFAULT 'Full-time',
        description TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'published',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `,
    sql`
      CREATE TABLE IF NOT EXISTS leads (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        company TEXT,
        service TEXT,
        subject TEXT,
        message TEXT,
        status TEXT NOT NULL DEFAULT 'new',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `,
    sql`
      CREATE TABLE IF NOT EXISTS applications (
        id TEXT PRIMARY KEY,
        job_id TEXT,
        job_title TEXT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        linkedin TEXT,
        portfolio TEXT,
        experience TEXT,
        skills TEXT,
        message TEXT,
        resume_url TEXT,
        resume_name TEXT,
        resume_key TEXT,
        resume_summary TEXT,
        status TEXT NOT NULL DEFAULT 'new',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `,
    sql`
      CREATE TABLE IF NOT EXISTS offer_letters (
        id TEXT PRIMARY KEY,
        data JSONB NOT NULL,
        ref_id TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `,
    sql`
      CREATE TABLE IF NOT EXISTS certificates (
        id TEXT PRIMARY KEY,
        data JSONB NOT NULL,
        cert_id TEXT UNIQUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `,
    sql`
      CREATE TABLE IF NOT EXISTS schema_meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `,
  ]);

  await Promise.all([
    sql`ALTER TABLE applications ADD COLUMN IF NOT EXISTS resume_summary TEXT`,
    sql`CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status)`,
    sql`CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC)`,
    sql`CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC)`,
    sql`CREATE INDEX IF NOT EXISTS idx_certificates_cert_id ON certificates(cert_id)`,
  ]);
}
