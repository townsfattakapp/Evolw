import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

let schemaReady: Promise<void> | null = null;

export function getSql(): NeonQueryFunction<false, false> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not configured');
  }
  return neon(url);
}

export async function ensureSchema(): Promise<NeonQueryFunction<false, false>> {
  const sql = getSql();

  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS site_content (
          id TEXT PRIMARY KEY DEFAULT 'main',
          data JSONB NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;

      await sql`
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
      `;

      await sql`
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
      `;

      await sql`
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
      `;

      // Add resume_summary column to existing tables
      await sql`
        ALTER TABLE applications ADD COLUMN IF NOT EXISTS resume_summary TEXT
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS offer_letters (
          id TEXT PRIMARY KEY,
          data JSONB NOT NULL,
          ref_id TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS certificates (
          id TEXT PRIMARY KEY,
          data JSONB NOT NULL,
          cert_id TEXT UNIQUE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status)
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC)
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC)
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS idx_certificates_cert_id ON certificates(cert_id)
      `;
    })().catch((err) => {
      schemaReady = null;
      throw err;
    });
  }

  await schemaReady;
  return sql;
}
