import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'crypto';
import { requireAdmin } from './_lib/auth';
import { ensureSchema } from './_lib/db';
import { handleOptions, json, logError, methodNotAllowed, readBody } from './_lib/http';
import { mapJob, normalizeJobStatus } from './_lib/mappers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  try {
    const sql = await ensureSchema();
    const isAdmin = requireAdmin(req);

    if (req.method === 'GET') {
      const id = typeof req.query.id === 'string' ? req.query.id : null;

      if (id) {
        const rows = await sql`SELECT * FROM jobs WHERE id = ${id} LIMIT 1`;
        if (!rows.length) {
          return json(res, 404, { error: 'Job not found' });
        }
        const job = mapJob(rows[0] as Record<string, unknown>);
        if (!isAdmin && job.status !== 'published') {
          return json(res, 404, { error: 'Job not found' });
        }
        return json(res, 200, job);
      }

      if (isAdmin) {
        const rows = await sql`SELECT * FROM jobs ORDER BY updated_at DESC`;
        return json(res, 200, rows.map((r) => mapJob(r as Record<string, unknown>)));
      }

      const rows = await sql`
        SELECT * FROM jobs
        WHERE status = 'published'
        ORDER BY updated_at DESC
      `;
      return json(res, 200, rows.map((r) => mapJob(r as Record<string, unknown>)));
    }

    if (req.method === 'POST') {
      if (!isAdmin) return json(res, 401, { error: 'Unauthorized' });

      const body = readBody<{
        title?: string;
        department?: string;
        location?: string;
        type?: string;
        description?: string;
        status?: string;
      }>(req);

      if (!body.title?.trim()) {
        return json(res, 400, { error: 'Job title is required' });
      }

      const id = randomUUID();
      const status = normalizeJobStatus(body.status);

      await sql`
        INSERT INTO jobs (id, title, department, location, type, description, status)
        VALUES (
          ${id},
          ${body.title.trim()},
          ${body.department?.trim() || ''},
          ${body.location?.trim() || ''},
          ${body.type?.trim() || 'Full-time'},
          ${body.description?.trim() || ''},
          ${status}
        )
      `;

      const rows = await sql`SELECT * FROM jobs WHERE id = ${id} LIMIT 1`;
      return json(res, 201, { success: true, job: mapJob(rows[0] as Record<string, unknown>) });
    }

    if (req.method === 'PUT') {
      if (!isAdmin) return json(res, 401, { error: 'Unauthorized' });

      const body = readBody<{
        id?: string;
        title?: string;
        department?: string;
        location?: string;
        type?: string;
        description?: string;
        status?: string;
      }>(req);

      if (!body.id) return json(res, 400, { error: 'Job id is required' });

      const existing = await sql`SELECT id FROM jobs WHERE id = ${body.id} LIMIT 1`;
      if (!existing.length) return json(res, 404, { error: 'Job not found' });

      const status = normalizeJobStatus(body.status);

      await sql`
        UPDATE jobs SET
          title = ${body.title?.trim() || ''},
          department = ${body.department?.trim() || ''},
          location = ${body.location?.trim() || ''},
          type = ${body.type?.trim() || 'Full-time'},
          description = ${body.description?.trim() || ''},
          status = ${status},
          updated_at = NOW()
        WHERE id = ${body.id}
      `;

      const rows = await sql`SELECT * FROM jobs WHERE id = ${body.id} LIMIT 1`;
      return json(res, 200, { success: true, job: mapJob(rows[0] as Record<string, unknown>) });
    }

    if (req.method === 'DELETE') {
      if (!isAdmin) return json(res, 401, { error: 'Unauthorized' });

      const body = readBody<{ id?: string }>(req);
      const id = body.id || (typeof req.query.id === 'string' ? req.query.id : null);
      if (!id) return json(res, 400, { error: 'Job id is required' });

      await sql`DELETE FROM jobs WHERE id = ${id}`;
      return json(res, 200, { success: true });
    }

    return methodNotAllowed(res, ['GET', 'POST', 'PUT', 'DELETE']);
  } catch (error) {
    logError('jobs', error);
    return json(res, 500, { error: 'Failed to process jobs request' });
  }
}
