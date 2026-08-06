import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'crypto';
import { requireAdmin } from '../auth.js';
import { ensureSchema } from '../db.js';
import { handleOptions, json, logError, methodNotAllowed, readBody } from '../http.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  try {
    const sql = await ensureSchema();
    const isAdmin = requireAdmin(req);

    if (!isAdmin) {
      return json(res, 401, { error: 'Unauthorized' });
    }

    if (req.method === 'GET') {
      const id = typeof req.query.id === 'string' ? req.query.id : null;
      const client_id = typeof req.query.client_id === 'string' ? req.query.client_id : null;

      if (id) {
        const rows = await sql`
          SELECT p.*, c.company_name as client_name
          FROM projects p
          LEFT JOIN clients c ON p.client_id = c.id
          WHERE p.id = ${id} LIMIT 1
        `;
        if (!rows.length) {
          return json(res, 404, { error: 'Project not found' });
        }
        return json(res, 200, rows[0]);
      }

      if (client_id) {
        const rows = await sql`
          SELECT p.*, c.company_name as client_name
          FROM projects p
          LEFT JOIN clients c ON p.client_id = c.id
          WHERE p.client_id = ${client_id}
          ORDER BY p.updated_at DESC
        `;
        return json(res, 200, rows);
      }

      const rows = await sql`
        SELECT p.*, c.company_name as client_name
        FROM projects p
        LEFT JOIN clients c ON p.client_id = c.id
        ORDER BY p.updated_at DESC
      `;
      return json(res, 200, rows);
    }

    if (req.method === 'POST') {
      const body = readBody<any>(req);

      if (!body.name?.trim()) return json(res, 400, { error: 'Project name is required' });
      if (!body.client_id?.trim()) return json(res, 400, { error: 'Client ID is required' });

      // Verify client exists
      const clients = await sql`SELECT id FROM clients WHERE id = ${body.client_id} LIMIT 1`;
      if (!clients.length) return json(res, 400, { error: 'Invalid Client ID' });

      const id = randomUUID();
      const status = body.status || 'Lead';

      await sql`
        INSERT INTO projects (
          id, client_id, name, code, description, start_date,
          expected_delivery_date, status, project_manager, estimated_value, final_value
        ) VALUES (
          ${id},
          ${body.client_id},
          ${body.name.trim()},
          ${body.code?.trim() || null},
          ${body.description?.trim() || null},
          ${body.start_date || null},
          ${body.expected_delivery_date || null},
          ${status},
          ${body.project_manager?.trim() || null},
          ${body.estimated_value || null},
          ${body.final_value || null}
        )
      `;

      const rows = await sql`SELECT * FROM projects WHERE id = ${id} LIMIT 1`;
      return json(res, 201, { success: true, project: rows[0] });
    }

    if (req.method === 'PUT') {
      const body = readBody<any>(req);

      if (!body.id) return json(res, 400, { error: 'Project ID is required' });
      if (!body.name?.trim()) return json(res, 400, { error: 'Project name is required' });
      if (!body.client_id?.trim()) return json(res, 400, { error: 'Client ID is required' });

      const existing = await sql`SELECT id FROM projects WHERE id = ${body.id} LIMIT 1`;
      if (!existing.length) return json(res, 404, { error: 'Project not found' });

      const status = body.status || 'Lead';

      await sql`
        UPDATE projects SET
          client_id = ${body.client_id},
          name = ${body.name.trim()},
          code = ${body.code?.trim() || null},
          description = ${body.description?.trim() || null},
          start_date = ${body.start_date || null},
          expected_delivery_date = ${body.expected_delivery_date || null},
          status = ${status},
          project_manager = ${body.project_manager?.trim() || null},
          estimated_value = ${body.estimated_value || null},
          final_value = ${body.final_value || null},
          updated_at = NOW()
        WHERE id = ${body.id}
      `;

      const rows = await sql`SELECT * FROM projects WHERE id = ${body.id} LIMIT 1`;
      return json(res, 200, { success: true, project: rows[0] });
    }

    if (req.method === 'DELETE') {
      const body = readBody<{ id?: string }>(req);
      const id = body.id || (typeof req.query.id === 'string' ? req.query.id : null);
      
      if (!id) return json(res, 400, { error: 'Project ID is required' });

      // Before deleting, check if there are linked quotes, invoices.
      const linkedQuotations = await sql`SELECT id FROM quotations WHERE project_id = ${id} LIMIT 1`;
      const linkedInvoices = await sql`SELECT id FROM invoices WHERE project_id = ${id} LIMIT 1`;

      if (linkedQuotations.length > 0 || linkedInvoices.length > 0) {
        // Change status to Cancelled instead of deleting
        await sql`UPDATE projects SET status = 'Cancelled', updated_at = NOW() WHERE id = ${id}`;
        return json(res, 200, { success: true, message: 'Project cancelled because it has linked financial records.' });
      }

      await sql`DELETE FROM projects WHERE id = ${id}`;
      return json(res, 200, { success: true, message: 'Project deleted successfully.' });
    }

    return methodNotAllowed(res, ['GET', 'POST', 'PUT', 'DELETE']);
  } catch (error) {
    logError('projects', error);
    return json(res, 500, { error: 'Failed to process projects request' });
  }
}
