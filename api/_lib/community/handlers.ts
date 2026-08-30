import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'crypto';
import { requireAdmin } from '../auth.js';
import { ensureSchema } from '../db.js';
import { json, readBody } from '../http.js';

function qstr(v: string | string[] | undefined) {
  return typeof v === 'string' ? v : Array.isArray(v) ? v[0] : undefined;
}

export async function handleCommunityProjects(req: VercelRequest, res: VercelResponse) {
  const sql = await ensureSchema();

  if (req.method === 'GET') {
    const id = qstr(req.query.id);
    const slug = qstr(req.query.slug);
    const status = qstr(req.query.status);
    const limit = Math.min(Number(qstr(req.query.limit) || 50), 100);

    if (id) {
      const rows = await sql`SELECT * FROM community_projects WHERE id = ${id} LIMIT 1`;
      if (!rows.length) return json(res, 404, { error: 'Project not found' });
      return json(res, 200, { project: rows[0] });
    }

    if (slug) {
      const rows = await sql`SELECT * FROM community_projects WHERE slug = ${slug} LIMIT 1`;
      if (!rows.length) return json(res, 404, { error: 'Project not found' });
      return json(res, 200, { project: rows[0] });
    }

    if (status) {
      const rows = await sql`
        SELECT * FROM community_projects
        WHERE status = ${status}
        ORDER BY updated_at DESC
        LIMIT ${limit}
      `;
      return json(res, 200, { projects: rows });
    }

    const rows = await sql`
      SELECT * FROM community_projects
      ORDER BY
        CASE status
          WHEN 'Live' THEN 0
          WHEN 'Beta' THEN 1
          WHEN 'Building' THEN 2
          WHEN 'Idea' THEN 3
          ELSE 4
        END,
        updated_at DESC
      LIMIT ${limit}
    `;
    return json(res, 200, { projects: rows });
  }

  if (req.method === 'POST') {
    if (!requireAdmin(req)) return json(res, 401, { error: 'Unauthorized' });
    const body = readBody<any>(req);
    if (!body?.name?.trim() || !body?.slug?.trim() || !body?.description?.trim()) {
      return json(res, 400, { error: 'name, slug, and description are required' });
    }
    const id = randomUUID();
    const rows = await sql`
      INSERT INTO community_projects (
        id, slug, name, tagline, description, logo_url, screenshots,
        technologies, github_url, live_url, status, creator_id, looking_for
      ) VALUES (
        ${id},
        ${String(body.slug).trim()},
        ${String(body.name).trim()},
        ${body.tagline || null},
        ${String(body.description).trim()},
        ${body.logo_url || null},
        ${JSON.stringify(body.screenshots || [])}::jsonb,
        ${Array.isArray(body.technologies) ? body.technologies : []},
        ${body.github_url || null},
        ${body.live_url || null},
        ${body.status || 'Building'},
        ${body.creator_id || 'evolw'},
        ${Array.isArray(body.looking_for) ? body.looking_for : []}
      )
      RETURNING *
    `;
    return json(res, 201, { project: rows[0] });
  }

  if (req.method === 'PUT') {
    if (!requireAdmin(req)) return json(res, 401, { error: 'Unauthorized' });
    const body = readBody<any>(req);
    if (!body?.id) return json(res, 400, { error: 'id is required' });
    const rows = await sql`
      UPDATE community_projects SET
        slug = COALESCE(${body.slug || null}, slug),
        name = COALESCE(${body.name || null}, name),
        tagline = COALESCE(${body.tagline ?? null}, tagline),
        description = COALESCE(${body.description || null}, description),
        logo_url = COALESCE(${body.logo_url ?? null}, logo_url),
        github_url = COALESCE(${body.github_url ?? null}, github_url),
        live_url = COALESCE(${body.live_url ?? null}, live_url),
        status = COALESCE(${body.status || null}, status),
        technologies = COALESCE(${Array.isArray(body.technologies) ? body.technologies : null}, technologies),
        looking_for = COALESCE(${Array.isArray(body.looking_for) ? body.looking_for : null}, looking_for),
        updated_at = NOW()
      WHERE id = ${body.id}
      RETURNING *
    `;
    if (!rows.length) return json(res, 404, { error: 'Project not found' });
    return json(res, 200, { project: rows[0] });
  }

  if (req.method === 'DELETE') {
    if (!requireAdmin(req)) return json(res, 401, { error: 'Unauthorized' });
    const id = qstr(req.query.id) || readBody<any>(req)?.id;
    if (!id) return json(res, 400, { error: 'id is required' });
    await sql`DELETE FROM community_projects WHERE id = ${id}`;
    return json(res, 200, { success: true });
  }

  return json(res, 405, { error: 'Method not allowed' });
}

export async function handleCommunityHackathons(req: VercelRequest, res: VercelResponse) {
  const sql = await ensureSchema();

  if (req.method === 'GET') {
    const slug = qstr(req.query.slug);
    const status = qstr(req.query.status);
    const limit = Math.min(Number(qstr(req.query.limit) || 50), 100);

    if (slug) {
      const rows = await sql`SELECT * FROM community_hackathons WHERE slug = ${slug} LIMIT 1`;
      if (!rows.length) return json(res, 404, { error: 'Hackathon not found' });
      return json(res, 200, { hackathon: rows[0] });
    }

    if (status) {
      const rows = await sql`
        SELECT * FROM community_hackathons
        WHERE status = ${status}
        ORDER BY start_date ASC
        LIMIT ${limit}
      `;
      return json(res, 200, { hackathons: rows });
    }

    const rows = await sql`
      SELECT * FROM community_hackathons
      ORDER BY start_date DESC
      LIMIT ${limit}
    `;
    return json(res, 200, { hackathons: rows });
  }

  if (req.method === 'POST') {
    if (!requireAdmin(req)) return json(res, 401, { error: 'Unauthorized' });
    const body = readBody<any>(req);
    if (!body?.title || !body?.slug || !body?.description || !body?.start_date || !body?.end_date) {
      return json(res, 400, { error: 'title, slug, description, start_date, end_date required' });
    }
    const rows = await sql`
      INSERT INTO community_hackathons (
        id, slug, title, description, organizer, start_date, end_date,
        registration_deadline, mode, location, prize_pool,
        external_registration_url, platform, status, tags
      ) VALUES (
        ${randomUUID()}, ${body.slug}, ${body.title}, ${body.description},
        ${body.organizer || 'EVOLW'}, ${body.start_date}, ${body.end_date},
        ${body.registration_deadline || null}, ${body.mode || 'Online'},
        ${body.location || null}, ${body.prize_pool || null},
        ${body.external_registration_url || ''}, ${body.platform || null},
        ${body.status || 'Upcoming'}, ${Array.isArray(body.tags) ? body.tags : []}
      )
      RETURNING *
    `;
    return json(res, 201, { hackathon: rows[0] });
  }

  if (req.method === 'PUT') {
    if (!requireAdmin(req)) return json(res, 401, { error: 'Unauthorized' });
    const body = readBody<any>(req);
    if (!body?.id) return json(res, 400, { error: 'id is required' });
    const rows = await sql`
      UPDATE community_hackathons SET
        slug = COALESCE(${body.slug || null}, slug),
        title = COALESCE(${body.title || null}, title),
        description = COALESCE(${body.description || null}, description),
        organizer = COALESCE(${body.organizer ?? null}, organizer),
        start_date = COALESCE(${body.start_date || null}, start_date),
        end_date = COALESCE(${body.end_date || null}, end_date),
        registration_deadline = COALESCE(${body.registration_deadline ?? null}, registration_deadline),
        mode = COALESCE(${body.mode || null}, mode),
        location = COALESCE(${body.location ?? null}, location),
        prize_pool = COALESCE(${body.prize_pool ?? null}, prize_pool),
        external_registration_url = COALESCE(${body.external_registration_url ?? null}, external_registration_url),
        platform = COALESCE(${body.platform ?? null}, platform),
        status = COALESCE(${body.status || null}, status),
        tags = COALESCE(${Array.isArray(body.tags) ? body.tags : null}, tags),
        updated_at = NOW()
      WHERE id = ${body.id}
      RETURNING *
    `;
    if (!rows.length) return json(res, 404, { error: 'Hackathon not found' });
    return json(res, 200, { hackathon: rows[0] });
  }

  if (req.method === 'DELETE') {
    if (!requireAdmin(req)) return json(res, 401, { error: 'Unauthorized' });
    const id = qstr(req.query.id) || readBody<any>(req)?.id;
    if (!id) return json(res, 400, { error: 'id is required' });
    await sql`DELETE FROM community_hackathons WHERE id = ${id}`;
    return json(res, 200, { success: true });
  }

  return json(res, 405, { error: 'Method not allowed' });
}

export async function handleCommunityEvents(req: VercelRequest, res: VercelResponse) {
  const sql = await ensureSchema();

  if (req.method === 'GET') {
    const slug = qstr(req.query.slug);
    const eventType = qstr(req.query.event_type);
    const limit = Math.min(Number(qstr(req.query.limit) || 50), 100);

    if (slug) {
      const rows = await sql`SELECT * FROM community_events WHERE slug = ${slug} LIMIT 1`;
      if (!rows.length) return json(res, 404, { error: 'Event not found' });
      return json(res, 200, { event: rows[0] });
    }

    if (eventType) {
      const rows = await sql`
        SELECT * FROM community_events
        WHERE event_type = ${eventType}
        ORDER BY start_date ASC
        LIMIT ${limit}
      `;
      return json(res, 200, { events: rows });
    }

    const rows = await sql`
      SELECT * FROM community_events
      ORDER BY start_date DESC
      LIMIT ${limit}
    `;
    return json(res, 200, { events: rows });
  }

  if (req.method === 'POST') {
    if (!requireAdmin(req)) return json(res, 401, { error: 'Unauthorized' });
    const body = readBody<any>(req);
    if (!body?.title || !body?.slug || !body?.description || !body?.start_date) {
      return json(res, 400, { error: 'title, slug, description, start_date required' });
    }
    const rows = await sql`
      INSERT INTO community_events (
        id, slug, title, description, event_type, speaker,
        start_date, end_date, timezone, location, is_online, external_registration_url
      ) VALUES (
        ${randomUUID()}, ${body.slug}, ${body.title}, ${body.description},
        ${body.event_type || 'Workshop'}, ${body.speaker || null},
        ${body.start_date}, ${body.end_date || null},
        ${body.timezone || 'Asia/Kolkata'}, ${body.location || null},
        ${body.is_online !== false}, ${body.external_registration_url || null}
      )
      RETURNING *
    `;
    return json(res, 201, { event: rows[0] });
  }

  if (req.method === 'PUT') {
    if (!requireAdmin(req)) return json(res, 401, { error: 'Unauthorized' });
    const body = readBody<any>(req);
    if (!body?.id) return json(res, 400, { error: 'id is required' });
    const rows = await sql`
      UPDATE community_events SET
        slug = COALESCE(${body.slug || null}, slug),
        title = COALESCE(${body.title || null}, title),
        description = COALESCE(${body.description || null}, description),
        event_type = COALESCE(${body.event_type || null}, event_type),
        speaker = COALESCE(${body.speaker ?? null}, speaker),
        start_date = COALESCE(${body.start_date || null}, start_date),
        end_date = COALESCE(${body.end_date ?? null}, end_date),
        timezone = COALESCE(${body.timezone || null}, timezone),
        location = COALESCE(${body.location ?? null}, location),
        is_online = COALESCE(${typeof body.is_online === 'boolean' ? body.is_online : null}, is_online),
        external_registration_url = COALESCE(${body.external_registration_url ?? null}, external_registration_url),
        updated_at = NOW()
      WHERE id = ${body.id}
      RETURNING *
    `;
    if (!rows.length) return json(res, 404, { error: 'Event not found' });
    return json(res, 200, { event: rows[0] });
  }

  if (req.method === 'DELETE') {
    if (!requireAdmin(req)) return json(res, 401, { error: 'Unauthorized' });
    const id = qstr(req.query.id) || readBody<any>(req)?.id;
    if (!id) return json(res, 400, { error: 'id is required' });
    await sql`DELETE FROM community_events WHERE id = ${id}`;
    return json(res, 200, { success: true });
  }

  return json(res, 405, { error: 'Method not allowed' });
}

export async function handleCommunityDiscussions(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' });

  const { getDiscourse } = await import('../discourse.js');
  const discourse = getDiscourse();
  const type = qstr(req.query.type) || 'latest';
  const limit = Math.min(Number(qstr(req.query.limit) || 10), 30);
  const category = qstr(req.query.category);
  const period = (qstr(req.query.period) as any) || 'weekly';

  if (!discourse.isConfigured()) {
    return json(res, 200, {
      topics: [],
      degraded: true,
      message: 'Discourse is not configured yet. Set DISCOURSE_BASE_URL and DISCOURSE_API_KEY.',
    });
  }

  let topics = [];
  if (type === 'top') topics = await discourse.getTopTopics(period, limit);
  else if (type === 'category' && category) topics = await discourse.getCategoryTopics(category, limit);
  else topics = await discourse.getLatestTopics(limit);

  return json(res, 200, { topics, degraded: false });
}

export async function handleCommunityGithub(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' });

  const token = process.env.GITHUB_TOKEN || '';
  const org = process.env.GITHUB_ORG || 'townsfattakapp';
  const action = qstr(req.query.action) || 'repos';
  const repo = qstr(req.query.repo);
  const labels = qstr(req.query.labels);

  if (!token) {
    // Fallback: expose curated projects from DB as "repos-like" cards
    const sql = await ensureSchema();
    const projects = await sql`
      SELECT name, tagline, description, github_url, live_url, technologies, status, slug
      FROM community_projects
      WHERE github_url IS NOT NULL
      ORDER BY updated_at DESC
      LIMIT 20
    `;
    return json(res, 200, {
      degraded: true,
      repos: projects.map((p: any) => ({
        id: p.slug,
        name: p.name,
        full_name: p.name,
        description: p.tagline || p.description,
        html_url: p.github_url,
        homepage: p.live_url,
        language: Array.isArray(p.technologies) ? p.technologies[0] : null,
        stargazers_count: 0,
        forks_count: 0,
        topics: p.technologies || [],
        from_community_db: true,
      })),
      message: 'GITHUB_TOKEN not set — showing curated community projects instead.',
    });
  }

  const { createGitHubAPI } = await import('../github.js');
  const github = createGitHubAPI(org, token);

  try {
    switch (action) {
      case 'repos':
        return json(res, 200, { repos: await github.getOrgRepos(), degraded: false });
      case 'repo':
        if (!repo) return json(res, 400, { error: 'repo required' });
        return json(res, 200, { repo: await github.getRepo(repo), degraded: false });
      case 'issues': {
        const labelList = labels ? labels.split(',').map((s) => s.trim()).filter(Boolean) : undefined;
        if (repo) {
          return json(res, 200, {
            issues: await github.getRepoIssues(repo, 'open', labelList),
            degraded: false,
          });
        }
        const q = labelList?.length
          ? `org:${org} is:issue is:open label:${labelList[0]}`
          : `org:${org} is:issue is:open label:"good first issue"`;
        const search = await github.searchIssues(q);
        return json(res, 200, { issues: search.items || [], degraded: false });
      }
      case 'languages':
        if (!repo) return json(res, 400, { error: 'repo required' });
        return json(res, 200, { languages: await github.getRepoLanguages(repo), degraded: false });
      default:
        return json(res, 400, { error: 'Invalid action' });
    }
  } catch (error: any) {
    return json(res, 200, {
      degraded: true,
      repos: [],
      issues: [],
      error: error?.message || 'GitHub unavailable',
    });
  }
}
