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

      if (id) {
        const rows = await sql`SELECT * FROM clients WHERE id = ${id} LIMIT 1`;
        if (!rows.length) {
          return json(res, 404, { error: 'Client not found' });
        }
        return json(res, 200, rows[0]);
      }

      // List lean columns for speed (include address fields for PDF preview)
      const rows = await sql`
        SELECT id, company_name, contact_person, email, phone, gstin, status,
               billing_address, city, state, country, pin_code, updated_at
        FROM clients
        WHERE status != 'Archived'
        ORDER BY updated_at DESC
      `;
      return json(res, 200, rows);
    }

    if (req.method === 'POST') {
      const body = readBody<any>(req);

      if (!body.company_name?.trim()) {
        return json(res, 400, { error: 'Company name is required' });
      }
      if (!body.email?.trim()) {
        return json(res, 400, { error: 'Email is required' });
      }

      const id = randomUUID();
      const status = body.status || 'Active';

      await sql`
        INSERT INTO clients (
          id, company_name, contact_person, email, phone, alt_phone, website,
          gstin, pan, registration_number, billing_address, shipping_address,
          city, state, country, pin_code, notes, default_currency, payment_terms, status
        ) VALUES (
          ${id},
          ${body.company_name.trim()},
          ${body.contact_person?.trim() || null},
          ${body.email.trim()},
          ${body.phone?.trim() || null},
          ${body.alt_phone?.trim() || null},
          ${body.website?.trim() || null},
          ${body.gstin?.trim() || null},
          ${body.pan?.trim() || null},
          ${body.registration_number?.trim() || null},
          ${body.billing_address?.trim() || null},
          ${body.shipping_address?.trim() || null},
          ${body.city?.trim() || null},
          ${body.state?.trim() || null},
          ${body.country?.trim() || null},
          ${body.pin_code?.trim() || null},
          ${body.notes?.trim() || null},
          ${body.default_currency?.trim() || 'INR'},
          ${body.payment_terms?.trim() || null},
          ${status}
        )
      `;

      const rows = await sql`SELECT * FROM clients WHERE id = ${id} LIMIT 1`;
      return json(res, 201, { success: true, client: rows[0] });
    }

    if (req.method === 'PUT') {
      const body = readBody<any>(req);

      if (!body.id) return json(res, 400, { error: 'Client ID is required' });
      if (!body.company_name?.trim()) return json(res, 400, { error: 'Company name is required' });
      if (!body.email?.trim()) return json(res, 400, { error: 'Email is required' });

      const existing = await sql`SELECT id FROM clients WHERE id = ${body.id} LIMIT 1`;
      if (!existing.length) return json(res, 404, { error: 'Client not found' });

      const status = body.status || 'Active';

      await sql`
        UPDATE clients SET
          company_name = ${body.company_name.trim()},
          contact_person = ${body.contact_person?.trim() || null},
          email = ${body.email.trim()},
          phone = ${body.phone?.trim() || null},
          alt_phone = ${body.alt_phone?.trim() || null},
          website = ${body.website?.trim() || null},
          gstin = ${body.gstin?.trim() || null},
          pan = ${body.pan?.trim() || null},
          registration_number = ${body.registration_number?.trim() || null},
          billing_address = ${body.billing_address?.trim() || null},
          shipping_address = ${body.shipping_address?.trim() || null},
          city = ${body.city?.trim() || null},
          state = ${body.state?.trim() || null},
          country = ${body.country?.trim() || null},
          pin_code = ${body.pin_code?.trim() || null},
          notes = ${body.notes?.trim() || null},
          default_currency = ${body.default_currency?.trim() || 'INR'},
          payment_terms = ${body.payment_terms?.trim() || null},
          status = ${status},
          updated_at = NOW()
        WHERE id = ${body.id}
      `;

      const rows = await sql`SELECT * FROM clients WHERE id = ${body.id} LIMIT 1`;
      return json(res, 200, { success: true, client: rows[0] });
    }

    if (req.method === 'DELETE') {
      const body = readBody<{ id?: string }>(req);
      const id = body.id || (typeof req.query.id === 'string' ? req.query.id : null);
      
      if (!id) return json(res, 400, { error: 'Client ID is required' });

      // Before deleting, check if there are linked projects, quotes, invoices.
      // If there are, we should only archive, not delete.
      const linkedProjects = await sql`SELECT id FROM projects WHERE client_id = ${id} LIMIT 1`;
      const linkedQuotations = await sql`SELECT id FROM quotations WHERE client_id = ${id} LIMIT 1`;
      const linkedInvoices = await sql`SELECT id FROM invoices WHERE client_id = ${id} LIMIT 1`;

      if (linkedProjects.length > 0 || linkedQuotations.length > 0 || linkedInvoices.length > 0) {
        // Archive instead of delete
        await sql`UPDATE clients SET status = 'Archived', updated_at = NOW() WHERE id = ${id}`;
        return json(res, 200, { success: true, message: 'Client archived because it has linked records.' });
      }

      await sql`DELETE FROM clients WHERE id = ${id}`;
      return json(res, 200, { success: true, message: 'Client deleted successfully.' });
    }

    return methodNotAllowed(res, ['GET', 'POST', 'PUT', 'DELETE']);
  } catch (error) {
    logError('clients', error);
    return json(res, 500, { error: 'Failed to process clients request' });
  }
}
