import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'crypto';
import { requireAdmin } from './_lib/auth';
import { ensureSchema } from './_lib/db';
import { handleOptions, json, logError, methodNotAllowed, readBody } from './_lib/http';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  try {
    const sql = await ensureSchema();

    if (req.method === 'GET') {
      const queryCertId =
        typeof req.query.certId === 'string' ? req.query.certId.trim() : null;

      // Public certificate verification
      if (queryCertId) {
        const rows = await sql`
          SELECT data FROM certificates WHERE cert_id = ${queryCertId} LIMIT 1
        `;
        if (!rows.length) {
          return json(res, 200, { valid: false });
        }
        return json(res, 200, { valid: true, data: rows[0].data });
      }

      if (!requireAdmin(req)) {
        return json(res, 401, { error: 'Unauthorized' });
      }

      const rows = await sql`SELECT * FROM certificates ORDER BY created_at DESC`;
      return json(
        res,
        200,
        rows.map((r) => ({
          ...(r.data as Record<string, unknown>),
          id: r.id,
          certId: r.cert_id,
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
      const countRows = await sql`SELECT COUNT(*)::int AS count FROM certificates`;
      const count = Number(countRows[0]?.count || 0) + 1;
      const certId = `EV/CERT/${year}/${count.toString().padStart(3, '0')}`;
      const id = randomUUID();
      const createdAt = new Date().toISOString();
      const certificate = { ...body, id, certId, createdAt };

      await sql.query(
        `INSERT INTO certificates (id, data, cert_id, created_at)
         VALUES ($1, $2::jsonb, $3, $4::timestamptz)`,
        [id, JSON.stringify(certificate), certId, createdAt]
      );

      return json(res, 201, { success: true, certificate });
    }

    if (req.method === 'DELETE') {
      if (!requireAdmin(req)) {
        return json(res, 401, { error: 'Unauthorized' });
      }
      const body = readBody<{ id?: string }>(req);
      if (!body.id) return json(res, 400, { error: 'Certificate id is required' });
      await sql`DELETE FROM certificates WHERE id = ${body.id}`;
      return json(res, 200, { success: true });
    }

    return methodNotAllowed(res, ['GET', 'POST', 'DELETE']);
  } catch (error) {
    logError('certificates', error);
    return json(res, 500, { error: 'Failed to process certificates request' });
  }
}
