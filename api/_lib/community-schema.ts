import { type NeonQueryFunction } from '@neondatabase/serverless';
import { randomUUID } from 'crypto';

export async function createCommunitySchema(sql: NeonQueryFunction<false, false>) {
  await Promise.all([
    sql`
      CREATE TABLE IF NOT EXISTS community_projects (
        id TEXT PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        tagline TEXT,
        description TEXT NOT NULL,
        logo_url TEXT,
        screenshots JSONB NOT NULL DEFAULT '[]'::jsonb,
        technologies TEXT[] NOT NULL DEFAULT '{}'::text[],
        github_url TEXT,
        live_url TEXT,
        status TEXT NOT NULL DEFAULT 'Building',
        creator_id TEXT NOT NULL DEFAULT 'evolw',
        team_members JSONB NOT NULL DEFAULT '[]'::jsonb,
        looking_for TEXT[] NOT NULL DEFAULT '{}'::text[],
        discourse_topic_id INTEGER,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `,
    sql`
      CREATE TABLE IF NOT EXISTS community_hackathons (
        id TEXT PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        banner_url TEXT,
        description TEXT NOT NULL,
        organizer TEXT,
        start_date TIMESTAMPTZ NOT NULL,
        end_date TIMESTAMPTZ NOT NULL,
        registration_deadline TIMESTAMPTZ,
        mode TEXT NOT NULL DEFAULT 'Online',
        location TEXT,
        prize_pool TEXT,
        external_registration_url TEXT NOT NULL DEFAULT '',
        platform TEXT,
        status TEXT NOT NULL DEFAULT 'Upcoming',
        tags TEXT[] NOT NULL DEFAULT '{}'::text[],
        discourse_topic_id INTEGER,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `,
    sql`
      CREATE TABLE IF NOT EXISTS community_events (
        id TEXT PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        event_type TEXT NOT NULL DEFAULT 'Workshop',
        speaker TEXT,
        start_date TIMESTAMPTZ NOT NULL,
        end_date TIMESTAMPTZ,
        timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
        location TEXT,
        is_online BOOLEAN NOT NULL DEFAULT TRUE,
        external_registration_url TEXT,
        discourse_topic_id INTEGER,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `,
  ]);

  await Promise.all([
    sql`CREATE INDEX IF NOT EXISTS idx_community_projects_status ON community_projects(status)`,
    sql`CREATE INDEX IF NOT EXISTS idx_community_projects_slug ON community_projects(slug)`,
    sql`CREATE INDEX IF NOT EXISTS idx_community_hackathons_status ON community_hackathons(status)`,
    sql`CREATE INDEX IF NOT EXISTS idx_community_hackathons_dates ON community_hackathons(start_date)`,
    sql`CREATE INDEX IF NOT EXISTS idx_community_events_dates ON community_events(start_date)`,
  ]);

  await seedCommunityIfEmpty(sql);
}

/** Showcase content for empty DBs — EVOLW-branded, not fake Acme data. */
async function seedCommunityIfEmpty(sql: NeonQueryFunction<false, false>) {
  const existing = await sql`SELECT COUNT(*)::int AS count FROM community_projects`;
  if (Number(existing[0]?.count) > 0) return;

  const projects = [
    {
      slug: 'evolw-website',
      name: 'EVOLW Website',
      tagline: 'Open marketing site & admin platform',
      description:
        'The public EVOLW website built with React, Vite, Neon Postgres, and Vercel. Contributions welcome across frontend, APIs, and content.',
      technologies: ['React', 'TypeScript', 'Vite', 'Neon', 'Tailwind CSS'],
      github_url: 'https://github.com/townsfattakapp/Evolw',
      live_url: 'https://www.evolw.in',
      status: 'Live',
      looking_for: ['Frontend', 'Docs'],
    },
    {
      slug: 'fattakse',
      name: 'Fattakse',
      tagline: 'A Unit of EVOLW — local commerce',
      description:
        'Consumer product from EVOLW focused on local commerce experiences. Explore the live product and share feedback with the team.',
      technologies: ['Mobile', 'React', 'APIs'],
      github_url: null,
      live_url: 'https://fattakse.in',
      status: 'Live',
      looking_for: ['Beta testers', 'Design feedback'],
    },
    {
      slug: 'good-first-issues',
      name: 'Good First Issues Hub',
      tagline: 'Start contributing to EVOLW',
      description:
        'Curated beginner-friendly tasks across EVOLW open-source work — docs, UI polish, API hardening, and community features.',
      technologies: ['Git', 'GitHub', 'TypeScript'],
      github_url: 'https://github.com/townsfattakapp',
      live_url: 'https://www.evolw.in/community/good-first-issues',
      status: 'Building',
      looking_for: ['Contributors'],
    },
  ];

  for (const p of projects) {
    await sql`
      INSERT INTO community_projects (
        id, slug, name, tagline, description, technologies,
        github_url, live_url, status, creator_id, looking_for
      ) VALUES (
        ${randomUUID()}, ${p.slug}, ${p.name}, ${p.tagline}, ${p.description},
        ${p.technologies}, ${p.github_url}, ${p.live_url}, ${p.status},
        ${'evolw'}, ${p.looking_for}
      )
      ON CONFLICT (slug) DO NOTHING
    `;
  }

  const hackCount = await sql`SELECT COUNT(*)::int AS count FROM community_hackathons`;
  if (Number(hackCount[0]?.count) === 0) {
    const start = new Date();
    start.setDate(start.getDate() + 21);
    const end = new Date(start);
    end.setDate(end.getDate() + 2);
    const deadline = new Date(start);
    deadline.setDate(deadline.getDate() - 3);

    await sql`
      INSERT INTO community_hackathons (
        id, slug, title, description, organizer, start_date, end_date,
        registration_deadline, mode, location, prize_pool,
        external_registration_url, platform, status, tags
      ) VALUES (
        ${randomUUID()},
        ${'evolw-build-sprint'},
        ${'EVOLW Build Sprint'},
        ${'A 48-hour online sprint to ship meaningful features for EVOLW community products. Teams of 1–4. Mentors on Discord/Discourse.'},
        ${'EVOLW'},
        ${start.toISOString()},
        ${end.toISOString()},
        ${deadline.toISOString()},
        ${'Online'},
        ${null},
        ${'Swag + mentorship'},
        ${'https://www.evolw.in/community'},
        ${'EVOLW'},
        ${'Registration Open'},
        ${['hackathon', 'opensource', 'web']}
      )
      ON CONFLICT (slug) DO NOTHING
    `;
  }

  const eventCount = await sql`SELECT COUNT(*)::int AS count FROM community_events`;
  if (Number(eventCount[0]?.count) === 0) {
    const when = new Date();
    when.setDate(when.getDate() + 10);
    when.setHours(18, 0, 0, 0);

    await sql`
      INSERT INTO community_events (
        id, slug, title, description, event_type, speaker,
        start_date, timezone, location, is_online, external_registration_url
      ) VALUES (
        ${randomUUID()},
        ${'ama-building-in-public'},
        ${'AMA: Building in Public with EVOLW'},
        ${'Ask the EVOLW team about shipping products, open source, and careers. Live Q&A for students and early-career engineers.'},
        ${'AMA'},
        ${'EVOLW Team'},
        ${when.toISOString()},
        ${'Asia/Kolkata'},
        ${'Online'},
        ${true},
        ${'https://www.evolw.in/community'}
      )
      ON CONFLICT (slug) DO NOTHING
    `;
  }
}
