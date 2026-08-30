/**
 * LOCAL/DEV ONLY — inserts demo community projects, hackathons, and events.
 *
 * Do not run against production. Prefer a Neon development branch URL.
 *
 * Usage:
 *   SEED_DATABASE_URL=<neon-dev-branch> CONFIRM_SEED=1 \\
 *     npx tsx --env-file=.env.local scripts/seed-community.ts
 *
 * Requires SEED_DATABASE_URL (dev branch). Will not use DATABASE_URL unless
 * ALLOW_PROD_COMMUNITY_SEED=1 is set.
 */
import { neon } from '@neondatabase/serverless';
import {
  createCommunitySchema,
  seedCommunityDemo,
} from '../api/_lib/community-schema.js';

if (process.env.CONFIRM_SEED !== '1') {
  console.error('Refusing to run. Set CONFIRM_SEED=1');
  process.exit(1);
}

if (process.env.VERCEL_ENV === 'production' && process.env.ALLOW_PROD_COMMUNITY_SEED !== '1') {
  console.error(
    'Refusing to seed: VERCEL_ENV=production. Use a local/dev database, or set ALLOW_PROD_COMMUNITY_SEED=1 only if intentional.'
  );
  process.exit(1);
}

const url = process.env.SEED_DATABASE_URL;
if (!url) {
  if (process.env.DATABASE_URL && process.env.ALLOW_PROD_COMMUNITY_SEED === '1') {
    console.warn('WARNING: seeding via DATABASE_URL with ALLOW_PROD_COMMUNITY_SEED=1');
  } else {
    console.error(
      'Refusing to seed.\n' +
        'Set SEED_DATABASE_URL to a local/dev Neon branch URL.\n' +
        '(.env.local DATABASE_URL is often production — do not seed it.)\n' +
        'Override only with ALLOW_PROD_COMMUNITY_SEED=1 if you intentionally mean that database.'
    );
    process.exit(1);
  }
}

async function main() {
  const dbUrl = process.env.SEED_DATABASE_URL || process.env.DATABASE_URL!;
  const sql = neon(dbUrl);

  await createCommunitySchema(sql as any);
  await seedCommunityDemo(sql as any);

  await sql`
    INSERT INTO schema_meta (key, value, updated_at)
    VALUES ('version', 'community_v1', NOW())
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
  `;

  const counts = await sql`
    SELECT
      (SELECT COUNT(*)::int FROM community_projects) AS projects,
      (SELECT COUNT(*)::int FROM community_hackathons) AS hackathons,
      (SELECT COUNT(*)::int FROM community_events) AS events
  `;
  console.log('Community seed ready (local/dev):', counts[0]);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
