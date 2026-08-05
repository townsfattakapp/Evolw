import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'crypto';
import { requireAdmin } from './_lib/auth.js';
import { ensureSchema } from './_lib/db.js';
import { handleOptions, json, logError, methodNotAllowed, readBody } from './_lib/http.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  try {
    const sql = await ensureSchema();

    if (req.method === 'GET') {
      if (!requireAdmin(req)) {
        return json(res, 401, { error: 'Unauthorized' });
      }
      const rows = await sql`SELECT * FROM offer_letters ORDER BY created_at DESC`;
      return json(
        res,
        200,
        rows.map((r) => ({
          ...(r.data as Record<string, unknown>),
          id: r.id,
          refId: r.ref_id,
          createdAt: r.created_at,
        }))
      );
    }

    if (req.method === 'POST') {
      if (!requireAdmin(req)) {
        return json(res, 401, { error: 'Unauthorized' });
      }

      const body = readBody<Record<string, unknown>>(req);
      const year = new Date().getFullYear();
      const countRows = await sql`SELECT COUNT(*)::int AS count FROM offer_letters`;
      const count = Number(countRows[0]?.count || 0) + 1;
      const refId = `EV/HR/${year}/${count.toString().padStart(3, '0')}`;
      const id = randomUUID();
      const createdAt = new Date().toISOString();
      const offer = { ...body, id, refId, createdAt };

      await sql.query(
        `INSERT INTO offer_letters (id, data, ref_id, created_at)
         VALUES ($1, $2::jsonb, $3, $4::timestamptz)`,
        [id, JSON.stringify(offer), refId, createdAt]
      );

      return json(res, 201, { success: true, offer });
    }

    if (req.method === 'DELETE') {
      if (!requireAdmin(req)) {
        return json(res, 401, { error: 'Unauthorized' });
      }
      const body = readBody<{ id?: string }>(req);
      if (!body.id) return json(res, 400, { error: 'Offer id is required' });
      await sql`DELETE FROM offer_letters WHERE id = ${body.id}`;
      return json(res, 200, { success: true });
    }

    return methodNotAllowed(res, ['GET', 'POST', 'DELETE']);
  } catch (error) {
    logError('offer-letters', error);
    return json(res, 500, { error: 'Failed to process offer letters request' });
  }
}
