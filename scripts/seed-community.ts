/**
 * Force community schema + seed (uses DATABASE_URL from env).
 * Usage: CONFIRM_SEED=1 npx tsx --env-file=.env.local scripts/seed-community.ts
 */
import { neon } from '@neondatabase/serverless';
import { createCommunitySchema } from '../api/_lib/community-schema.js';

if (process.env.CONFIRM_SEED !== '1') {
  console.error('Refusing to run. Set CONFIRM_SEED=1');
  process.exit(1);
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('Missing DATABASE_URL');
  process.exit(1);
}

async function main() {
  const sql = neon(url);

  await createCommunitySchema(sql as any);

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
  console.log('Community seed ready:', counts[0]);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
