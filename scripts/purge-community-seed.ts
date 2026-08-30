/**
 * Removes demo/seed community rows from the database.
 *
 * Usage:
 *   CONFIRM_PURGE=1 npx tsx --env-file=.env.local scripts/purge-community-seed.ts
 */
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL');
  process.exit(1);
}

if (process.env.CONFIRM_PURGE !== '1') {
  console.error('Refusing to run. Set CONFIRM_PURGE=1 to delete community seed data.');
  process.exit(1);
}

/** Known demo slugs from auto-seed / older seed scripts. */
const PROJECT_SLUGS = [
  'evolw-bootcamp',
  'open-source-basics',
  'ai-workshop',
  'evolw-website',
  'fattakse',
  'good-first-issues',
] as const;

const HACKATHON_SLUGS = ['hack-fullstack', 'hack-graphql', 'evolw-build-sprint'] as const;

const EVENT_SLUGS = [
  'open-source-ama',
  'nextjs-workshop',
  'ama-building-in-public',
] as const;

const sql = neon(DATABASE_URL);

async function purge() {
  console.log('Purging community seed data...');

  const projects = await sql`
    DELETE FROM community_projects
    WHERE slug = ANY(${PROJECT_SLUGS as unknown as string[]})
    RETURNING slug, name
  `;
  console.log(
    projects.length
      ? `Deleted projects: ${projects.map((p: any) => p.slug).join(', ')}`
      : 'No seed projects matched.'
  );

  const hackathons = await sql`
    DELETE FROM community_hackathons
    WHERE slug = ANY(${HACKATHON_SLUGS as unknown as string[]})
    RETURNING slug, title
  `;
  console.log(
    hackathons.length
      ? `Deleted hackathons: ${hackathons.map((h: any) => h.slug).join(', ')}`
      : 'No seed hackathons matched.'
  );

  const events = await sql`
    DELETE FROM community_events
    WHERE slug = ANY(${EVENT_SLUGS as unknown as string[]})
    RETURNING slug, title
  `;
  console.log(
    events.length
      ? `Deleted events: ${events.map((e: any) => e.slug).join(', ')}`
      : 'No seed events matched.'
  );

  const remaining = await sql`
    SELECT
      (SELECT COUNT(*)::int FROM community_projects) AS projects,
      (SELECT COUNT(*)::int FROM community_hackathons) AS hackathons,
      (SELECT COUNT(*)::int FROM community_events) AS events
  `;
  console.log('Remaining community rows:', remaining[0]);
}

purge().catch((err) => {
  console.error(err);
  process.exit(1);
});
