import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'crypto';
import { requireAdmin } from '../auth.js';
import { ensureSchema } from '../db.js';
import { handleOptions, json, logError, methodNotAllowed, readBody } from '../http.js';
import { getNextSequenceNumber } from '../sequences.js';
import { calculateLineItem, calculateDocumentTotals } from '../billing-calculations.js';
import { withTransaction } from '../tx.js';
import {
  loadSnapshots,
  shouldFreezeSnapshots,
  snapshotJson,
} from './snapshots.js';

function num(v: unknown, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  try {
    const sql = await ensureSchema();
    if (!requireAdmin(req)) return json(res, 401, { error: 'Unauthorized' });

    if (req.method === 'GET') {
      const id = typeof req.query.id === 'string' ? req.query.id : null;

      if (id) {
        const rows = await sql`
          SELECT q.*, c.company_name as client_name, p.name as project_name
          FROM quotations q
          JOIN clients c ON q.client_id = c.id
          LEFT JOIN projects p ON q.project_id = p.id
          WHERE q.id = ${id}
          LIMIT 1
        `;
        if (!rows.length) return json(res, 404, { error: 'Quotation not found' });

        const items = await sql`
          SELECT * FROM quotation_items WHERE quotation_id = ${id} ORDER BY sort_order ASC
        `;
        const milestones = await sql`
          SELECT * FROM quotation_milestones WHERE quotation_id = ${id} ORDER BY sort_order ASC
        `;
        return json(res, 200, { ...rows[0], items, milestones });
      }

      const rows = await sql`
        SELECT q.id, q.quotation_number, q.date, q.valid_until, q.status, q.grand_total,
               q.currency, q.subject, q.created_at, c.company_name as client_name
        FROM quotations q
        JOIN clients c ON q.client_id = c.id
        ORDER BY q.created_at DESC
      `;
      return json(res, 200, rows);
    }

    if (req.method === 'POST') {
      const body = readBody<any>(req);

      if (body.action === 'UPDATE_STATUS') {
        if (!body.id || !body.status) {
          return json(res, 400, { error: 'id and status are required' });
        }
        const allowed = ['Draft', 'Sent', 'Viewed', 'Approved', 'Rejected', 'Expired', 'Cancelled'];
        if (!allowed.includes(body.status)) {
          return json(res, 400, { error: 'Invalid status' });
        }
        const existing = await sql`
          SELECT id, status, client_id, client_snapshot FROM quotations WHERE id = ${body.id} LIMIT 1
        `;
        if (!existing.length) return json(res, 404, { error: 'Quotation not found' });
        if (existing[0].status === 'Converted') {
          return json(res, 400, { error: 'Converted quotations cannot change status' });
        }

        if (shouldFreezeSnapshots(body.status, existing[0].client_snapshot)) {
          const snaps = await loadSnapshots(sql, String(existing[0].client_id));
          await sql`
            UPDATE quotations SET
              status = ${body.status},
              client_snapshot = ${snapshotJson(snaps.client_snapshot)}::jsonb,
              company_snapshot = ${snapshotJson(snaps.company_snapshot)}::jsonb,
              updated_at = NOW()
            WHERE id = ${body.id}
          `;
        } else {
          await sql`
            UPDATE quotations SET status = ${body.status}, updated_at = NOW() WHERE id = ${body.id}
          `;
        }
        return json(res, 200, { success: true });
      }

      if (!body.client_id) return json(res, 400, { error: 'Client ID is required' });
      if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
        return json(res, 400, { error: 'At least one line item is required' });
      }
      for (const item of body.items) {
        if (!String(item.name || '').trim()) {
          return json(res, 400, { error: 'Each line item needs a name' });
        }
      }

      const clientRows = await sql`SELECT id FROM clients WHERE id = ${body.client_id} LIMIT 1`;
      if (!clientRows.length) return json(res, 400, { error: 'Invalid client' });

      const settings = await sql`SELECT quotation_prefix FROM company_settings WHERE id = 'main' LIMIT 1`;
      const prefix = settings.length ? String(settings[0].quotation_prefix) : 'EVOLW-QTN-';

      const totals = calculateDocumentTotals({
        items: body.items.map((item: any) => ({
          rate: num(item.rate),
          quantity: num(item.quantity, 1),
          discount: num(item.discount),
          tax_percentage: num(item.tax_percentage, 18),
        })),
        tax_type: body.tax_type || 'CGST_SGST',
        discount_type: body.discount_type || 'PERCENTAGE',
        discount_value: num(body.discount_value),
        adjustment: num(body.adjustment),
      });

      const id = randomUUID();
      const qtn_number = await getNextSequenceNumber(sql, 'QUOTATION', prefix);
      const today = new Date().toISOString().split('T')[0];
      const status = body.status || 'Draft';
      const snaps = shouldFreezeSnapshots(status, null)
        ? await loadSnapshots(sql, body.client_id)
        : { client_snapshot: null, company_snapshot: null };

      await withTransaction(sql, async (tx) => {
        await tx`
          INSERT INTO quotations (
            id, quotation_number, client_id, project_id, date, valid_until,
            currency, place_of_supply, subject, intro_message, scope_of_work, terms_conditions,
            internal_notes, client_notes, payment_terms, estimated_delivery,
            tax_type, discount_type, discount_value, subtotal, taxable_amount,
            cgst_amount, sgst_amount, igst_amount, total_tax, overall_discount_amount,
            adjustment, grand_total, advance_required, status,
            client_snapshot, company_snapshot
          ) VALUES (
            ${id}, ${qtn_number}, ${body.client_id}, ${body.project_id || null},
            ${body.date || today},
            ${body.valid_until || today},
            ${body.currency || 'INR'}, ${body.place_of_supply || null},
            ${body.subject || null}, ${body.intro_message || null},
            ${body.scope_of_work || null}, ${body.terms_conditions || null},
            ${body.internal_notes || null}, ${body.client_notes || null},
            ${body.payment_terms || null}, ${body.estimated_delivery || null},
            ${body.tax_type || 'CGST_SGST'}, ${body.discount_type || 'PERCENTAGE'},
            ${num(body.discount_value)}, ${totals.subtotal}, ${totals.taxable_amount},
            ${totals.cgst_amount}, ${totals.sgst_amount}, ${totals.igst_amount},
            ${totals.total_tax}, ${totals.overall_discount_amount}, ${totals.adjustment},
            ${totals.grand_total}, ${num(body.advance_required)}, ${status},
            ${snapshotJson(snaps.client_snapshot)}::jsonb,
            ${snapshotJson(snaps.company_snapshot)}::jsonb
          )
        `;

        let i = 0;
        for (const item of body.items) {
          const itemTotals = calculateLineItem({
            rate: num(item.rate),
            quantity: num(item.quantity, 1),
            discount: num(item.discount),
            tax_percentage: num(item.tax_percentage, 18),
          });
          await tx`
            INSERT INTO quotation_items (
              id, quotation_id, name, description, hsn_sac, quantity, unit, rate,
              discount, tax_percentage, tax_amount, subtotal, total, sort_order
            ) VALUES (
              ${randomUUID()}, ${id}, ${String(item.name).trim()}, ${item.description || null},
              ${item.hsn_sac ? String(item.hsn_sac).trim() : null},
              ${num(item.quantity, 1)}, ${item.unit || 'Item'}, ${num(item.rate)},
              ${itemTotals.discount}, ${num(item.tax_percentage, 18)},
              ${itemTotals.tax_amount}, ${itemTotals.subtotal}, ${itemTotals.total}, ${i++}
            )
          `;
        }
      });

      return json(res, 201, { success: true, id, quotation_number: qtn_number });
    }

    if (req.method === 'PUT') {
      const body = readBody<any>(req);
      if (!body.id) return json(res, 400, { error: 'Quotation ID is required' });
      if (!body.client_id) return json(res, 400, { error: 'Client ID is required' });
      if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
        return json(res, 400, { error: 'At least one line item is required' });
      }

      const existing = await sql`
        SELECT id, status, client_snapshot FROM quotations WHERE id = ${body.id} LIMIT 1
      `;
      if (!existing.length) return json(res, 404, { error: 'Quotation not found' });
      if (existing[0].status === 'Converted') {
        return json(res, 400, { error: 'Converted quotations cannot be edited' });
      }

      const totals = calculateDocumentTotals({
        items: body.items.map((item: any) => ({
          rate: num(item.rate),
          quantity: num(item.quantity, 1),
          discount: num(item.discount),
          tax_percentage: num(item.tax_percentage, 18),
        })),
        tax_type: body.tax_type || 'CGST_SGST',
        discount_type: body.discount_type || 'PERCENTAGE',
        discount_value: num(body.discount_value),
        adjustment: num(body.adjustment),
      });

      const today = new Date().toISOString().split('T')[0];
      const status = body.status || existing[0].status;
      const snaps = shouldFreezeSnapshots(status, existing[0].client_snapshot)
        ? await loadSnapshots(sql, body.client_id)
        : null;

      await withTransaction(sql, async (tx) => {
        if (snaps) {
          await tx`
            UPDATE quotations SET
              client_id = ${body.client_id},
              project_id = ${body.project_id || null},
              date = ${body.date || today},
              valid_until = ${body.valid_until || today},
              currency = ${body.currency || 'INR'},
              place_of_supply = ${body.place_of_supply || null},
              subject = ${body.subject || null},
              intro_message = ${body.intro_message || null},
              scope_of_work = ${body.scope_of_work || null},
              terms_conditions = ${body.terms_conditions || null},
              internal_notes = ${body.internal_notes || null},
              client_notes = ${body.client_notes || null},
              payment_terms = ${body.payment_terms || null},
              estimated_delivery = ${body.estimated_delivery || null},
              tax_type = ${body.tax_type || 'CGST_SGST'},
              discount_type = ${body.discount_type || 'PERCENTAGE'},
              discount_value = ${num(body.discount_value)},
              subtotal = ${totals.subtotal},
              taxable_amount = ${totals.taxable_amount},
              cgst_amount = ${totals.cgst_amount},
              sgst_amount = ${totals.sgst_amount},
              igst_amount = ${totals.igst_amount},
              total_tax = ${totals.total_tax},
              overall_discount_amount = ${totals.overall_discount_amount},
              adjustment = ${totals.adjustment},
              grand_total = ${totals.grand_total},
              advance_required = ${num(body.advance_required)},
              status = ${status},
              client_snapshot = ${snapshotJson(snaps.client_snapshot)}::jsonb,
              company_snapshot = ${snapshotJson(snaps.company_snapshot)}::jsonb,
              updated_at = NOW()
            WHERE id = ${body.id}
          `;
        } else {
          await tx`
            UPDATE quotations SET
              client_id = ${body.client_id},
              project_id = ${body.project_id || null},
              date = ${body.date || today},
              valid_until = ${body.valid_until || today},
              currency = ${body.currency || 'INR'},
              place_of_supply = ${body.place_of_supply || null},
              subject = ${body.subject || null},
              intro_message = ${body.intro_message || null},
              scope_of_work = ${body.scope_of_work || null},
              terms_conditions = ${body.terms_conditions || null},
              internal_notes = ${body.internal_notes || null},
              client_notes = ${body.client_notes || null},
              payment_terms = ${body.payment_terms || null},
              estimated_delivery = ${body.estimated_delivery || null},
              tax_type = ${body.tax_type || 'CGST_SGST'},
              discount_type = ${body.discount_type || 'PERCENTAGE'},
              discount_value = ${num(body.discount_value)},
              subtotal = ${totals.subtotal},
              taxable_amount = ${totals.taxable_amount},
              cgst_amount = ${totals.cgst_amount},
              sgst_amount = ${totals.sgst_amount},
              igst_amount = ${totals.igst_amount},
              total_tax = ${totals.total_tax},
              overall_discount_amount = ${totals.overall_discount_amount},
              adjustment = ${totals.adjustment},
              grand_total = ${totals.grand_total},
              advance_required = ${num(body.advance_required)},
              status = ${status},
              updated_at = NOW()
            WHERE id = ${body.id}
          `;
        }

        await tx`DELETE FROM quotation_items WHERE quotation_id = ${body.id}`;

        let i = 0;
        for (const item of body.items) {
          const itemTotals = calculateLineItem({
            rate: num(item.rate),
            quantity: num(item.quantity, 1),
            discount: num(item.discount),
            tax_percentage: num(item.tax_percentage, 18),
          });
          await tx`
            INSERT INTO quotation_items (
              id, quotation_id, name, description, hsn_sac, quantity, unit, rate,
              discount, tax_percentage, tax_amount, subtotal, total, sort_order
            ) VALUES (
              ${randomUUID()}, ${body.id}, ${String(item.name).trim()}, ${item.description || null},
              ${item.hsn_sac ? String(item.hsn_sac).trim() : null},
              ${num(item.quantity, 1)}, ${item.unit || 'Item'}, ${num(item.rate)},
              ${itemTotals.discount}, ${num(item.tax_percentage, 18)},
              ${itemTotals.tax_amount}, ${itemTotals.subtotal}, ${itemTotals.total}, ${i++}
            )
          `;
        }
      });

      return json(res, 200, { success: true, id: body.id });
    }

    if (req.method === 'DELETE') {
      const body = readBody<{ id?: string }>(req);
      const id = body.id || (typeof req.query.id === 'string' ? req.query.id : null);
      if (!id) return json(res, 400, { error: 'Quotation ID is required' });

      const existing = await sql`SELECT id, status FROM quotations WHERE id = ${id} LIMIT 1`;
      if (!existing.length) return json(res, 404, { error: 'Quotation not found' });
      if (existing[0].status === 'Converted') {
        return json(res, 400, { error: 'Converted quotations cannot be deleted' });
      }

      await sql`DELETE FROM quotations WHERE id = ${id}`;
      return json(res, 200, { success: true });
    }

    return methodNotAllowed(res, ['GET', 'POST', 'PUT', 'DELETE']);
  } catch (error) {
    logError('quotations', error);
    return json(res, 500, { error: 'Failed to process request' });
  }
}
