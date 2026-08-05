import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'crypto';
import { requireAdmin } from './_lib/auth';
import { ensureSchema } from './_lib/db';
import { handleOptions, json, logError, methodNotAllowed, readBody } from './_lib/http';
import { mapLead, normalizeLeadStatus } from './_lib/mappers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  try {
    const sql = await ensureSchema();

    if (req.method === 'GET') {
      if (!requireAdmin(req)) {
        return json(res, 401, { error: 'Unauthorized' });
      }
      const rows = await sql`SELECT * FROM leads ORDER BY created_at DESC`;
      return json(res, 200, rows.map((r) => mapLead(r as Record<string, unknown>)));
    }

    if (req.method === 'POST') {
      const body = readBody<{
        name?: string;
        email?: string;
        phone?: string;
        company?: string;
        service?: string;
        subject?: string;
        help?: string;
        message?: string;
      }>(req);

      if (!body.name?.trim() || !body.email?.trim() || !body.message?.trim()) {
        return json(res, 400, { error: 'Name, email, and message are required' });
      }

      const id = randomUUID();
      const service = body.service?.trim() || body.help?.trim() || body.subject?.trim() || null;
      const subject = body.subject?.trim() || service;

      await sql`
        INSERT INTO leads (id, name, email, phone, company, service, subject, message, status)
        VALUES (
          ${id},
          ${body.name.trim()},
          ${body.email.trim()},
          ${body.phone?.trim() || null},
          ${body.company?.trim() || null},
          ${service},
          ${subject},
          ${body.message.trim()},
          'new'
        )
      `;

      const rows = await sql`SELECT * FROM leads WHERE id = ${id} LIMIT 1`;
      return json(res, 201, { success: true, lead: mapLead(rows[0] as Record<string, unknown>) });
    }

    if (req.method === 'PUT') {
      if (!requireAdmin(req)) {
        return json(res, 401, { error: 'Unauthorized' });
      }

      const body = readBody<{ id?: string; status?: string }>(req);
      if (!body.id) return json(res, 400, { error: 'Lead id is required' });

      const status = normalizeLeadStatus(body.status || 'new');
      await sql`
        UPDATE leads SET status = ${status}, updated_at = NOW()
        WHERE id = ${body.id}
      `;
      return json(res, 200, { success: true });
    }

    if (req.method === 'DELETE') {
      if (!requireAdmin(req)) {
        return json(res, 401, { error: 'Unauthorized' });
      }

      const body = readBody<{ id?: string }>(req);
      if (!body.id) return json(res, 400, { error: 'Lead id is required' });

      await sql`DELETE FROM leads WHERE id = ${body.id}`;
      return json(res, 200, { success: true });
    }

    return methodNotAllowed(res, ['GET', 'POST', 'PUT', 'DELETE']);
  } catch (error) {
    logError('leads', error);
    return json(res, 500, { error: 'Failed to process leads request' });
  }
}
