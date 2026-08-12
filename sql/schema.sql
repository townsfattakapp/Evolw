-- EVOLW production schema
-- Safe to run multiple times (IF NOT EXISTS). Does not drop existing data.
-- Tables are also auto-created by the API on first request via ensureSchema().

CREATE TABLE IF NOT EXISTS site_content (
  id TEXT PRIMARY KEY DEFAULT 'main',
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
);

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
);

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
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS offer_letters (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  ref_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS certificates (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  cert_id TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_projects (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT NOT NULL,
  logo_url TEXT,
  screenshots JSONB DEFAULT '[]'::jsonb,
  technologies TEXT[] DEFAULT '{}'::text[],
  github_url TEXT,
  live_url TEXT,
  status TEXT NOT NULL DEFAULT 'Building', -- Idea, Building, Beta, Live, Archived
  creator_id TEXT NOT NULL,
  team_members JSONB DEFAULT '[]'::jsonb,
  looking_for TEXT[] DEFAULT '{}',
  discourse_topic_id INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_status ON community_projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON community_projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_creator ON community_projects(creator_id);

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
  mode TEXT NOT NULL, -- Online, Offline, Hybrid
  location TEXT,
  prize_pool TEXT,
  external_registration_url TEXT NOT NULL,
  platform TEXT, -- Devfolio, Unstop, Devpost, HackerEarth
  status TEXT NOT NULL DEFAULT 'Upcoming', -- Upcoming, Registration Open, Live, Completed
  tags TEXT[] DEFAULT '{}',
  discourse_topic_id INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hackathons_status ON community_hackathons(status);
CREATE INDEX IF NOT EXISTS idx_hackathons_dates ON community_hackathons(start_date);

CREATE TABLE IF NOT EXISTS community_events (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_type TEXT NOT NULL, -- Workshop, AMA, Webinar, Meetup, Tech Talk, Open Source Sprint, Live Coding
  speaker TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  location TEXT,
  is_online BOOLEAN NOT NULL DEFAULT TRUE,
  external_registration_url TEXT,
  discourse_topic_id INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_dates ON community_events(start_date);

CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_certificates_cert_id ON certificates(cert_id);
