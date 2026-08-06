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

function addDays(isoDate: string, days: number) {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
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
          SELECT i.*, c.company_name as client_name, p.name as project_name
          FROM invoices i
          JOIN clients c ON i.client_id = c.id
          LEFT JOIN projects p ON i.project_id = p.id
          WHERE i.id = ${id}
          LIMIT 1
        `;
        if (!rows.length) return json(res, 404, { error: 'Invoice not found' });

        const items = await sql`
          SELECT * FROM invoice_items WHERE invoice_id = ${id} ORDER BY sort_order ASC
        `;
        const payments = await sql`
          SELECT * FROM payments
          WHERE invoice_id = ${id} AND status = 'Completed'
          ORDER BY date DESC
        `;
        return json(res, 200, { ...rows[0], items, payments });
      }

      const openOnly = req.query.open === '1' || req.query.open === 'true';

      if (openOnly) {
        const rows = await sql`
          SELECT i.id, i.invoice_number, i.date, i.due_date, i.status, i.grand_total,
                 i.amount_paid, i.balance_due, i.currency, i.created_at,
                 c.company_name as client_name
          FROM invoices i
          JOIN clients c ON i.client_id = c.id
          WHERE i.balance_due > 0
            AND i.status NOT IN ('Draft', 'Cancelled', 'Written Off', 'Paid')
          ORDER BY i.due_date ASC
        `;
        return json(res, 200, rows);
      }

      const rows = await sql`
        SELECT i.id, i.invoice_number, i.date, i.due_date, i.status, i.grand_total,
               i.amount_paid, i.balance_due, i.currency, i.created_at,
               c.company_name as client_name
        FROM invoices i
        JOIN clients c ON i.client_id = c.id
        ORDER BY i.created_at DESC
      `;
      return json(res, 200, rows);
    }

    if (req.method === 'POST') {
      const body = readBody<any>(req);

      if (body.action === 'UPDATE_STATUS') {
        if (!body.id || !body.status) {
          return json(res, 400, { error: 'id and status are required' });
        }
        const allowed = ['Draft', 'Sent', 'Viewed', 'Cancelled', 'Written Off'];
        if (!allowed.includes(body.status)) {
          return json(res, 400, { error: 'Invalid status for manual update' });
        }
        const existing = await sql`
          SELECT id, status, client_id, client_snapshot FROM invoices WHERE id = ${body.id} LIMIT 1
        `;
        if (!existing.length) return json(res, 404, { error: 'Invoice not found' });
        if (['Paid', 'Partially Paid'].includes(String(existing[0].status)) && body.status === 'Draft') {
          return json(res, 400, { error: 'Paid invoices cannot return to Draft' });
        }

        if (shouldFreezeSnapshots(body.status, existing[0].client_snapshot)) {
          const snaps = await loadSnapshots(sql, String(existing[0].client_id));
          await sql`
            UPDATE invoices SET
              status = ${body.status},
              client_snapshot = ${snapshotJson(snaps.client_snapshot)}::jsonb,
              company_snapshot = ${snapshotJson(snaps.company_snapshot)}::jsonb,
              client_gstin = COALESCE(client_gstin, ${snaps.client_snapshot?.gstin || null}),
              updated_at = NOW()
            WHERE id = ${body.id}
          `;
        } else {
          await sql`UPDATE invoices SET status = ${body.status}, updated_at = NOW() WHERE id = ${body.id}`;
        }
        return json(res, 200, { success: true });
      }

      if (body.action === 'CONVERT_QUOTATION') {
        if (!body.quotation_id) return json(res, 400, { error: 'quotation_id is required' });

        const qtnRows = await sql`
          SELECT * FROM quotations WHERE id = ${body.quotation_id} AND status != 'Converted' LIMIT 1
        `;
        if (!qtnRows.length) {
          return json(res, 400, { error: 'Quotation not found or already converted' });
        }
        const qtn = qtnRows[0];
        const qtnItems = await sql`
          SELECT * FROM quotation_items WHERE quotation_id = ${body.quotation_id} ORDER BY sort_order ASC
        `;

        const settings = await sql`SELECT invoice_prefix FROM company_settings WHERE id = 'main' LIMIT 1`;
        const prefix = settings.length ? String(settings[0].invoice_prefix) : 'EVOLW-INV-';
        const inv_number = await getNextSequenceNumber(sql, 'INVOICE', prefix);
        const invId = randomUUID();
        const today = new Date().toISOString().split('T')[0];
        const due = addDays(today, 15);
        const snaps = await loadSnapshots(sql, String(qtn.client_id));
        const placeOfSupply =
          qtn.place_of_supply || snaps.client_snapshot?.state || snaps.company_snapshot?.state || null;

        await withTransaction(sql, async (tx) => {
          await tx`
            INSERT INTO invoices (
              id, invoice_number, client_id, project_id, linked_quotation_id, date, due_date,
              currency, place_of_supply, client_gstin, payment_terms, client_notes, terms_conditions,
              tax_type, discount_type, discount_value, subtotal, taxable_amount,
              cgst_amount, sgst_amount, igst_amount, total_tax, overall_discount_amount,
              adjustment, grand_total, amount_paid, balance_due, status,
              client_snapshot, company_snapshot
            ) VALUES (
              ${invId}, ${inv_number}, ${qtn.client_id}, ${qtn.project_id}, ${qtn.id},
              ${today}, ${due},
              ${qtn.currency}, ${placeOfSupply}, ${snaps.client_snapshot?.gstin || null},
              ${qtn.payment_terms}, ${qtn.client_notes}, ${qtn.terms_conditions},
              ${qtn.tax_type}, ${qtn.discount_type}, ${qtn.discount_value},
              ${qtn.subtotal}, ${qtn.taxable_amount}, ${qtn.cgst_amount}, ${qtn.sgst_amount},
              ${qtn.igst_amount}, ${qtn.total_tax}, ${qtn.overall_discount_amount},
              ${qtn.adjustment}, ${qtn.grand_total}, 0, ${qtn.grand_total}, 'Draft',
              ${snapshotJson(snaps.client_snapshot)}::jsonb,
              ${snapshotJson(snaps.company_snapshot)}::jsonb
            )
          `;

          for (const item of qtnItems) {
            await tx`
              INSERT INTO invoice_items (
                id, invoice_id, name, description, hsn_sac, quantity, unit, rate,
                discount, tax_percentage, tax_amount, subtotal, total, sort_order
              ) VALUES (
                ${randomUUID()}, ${invId}, ${item.name}, ${item.description},
                ${item.hsn_sac || null},
                ${item.quantity}, ${item.unit}, ${item.rate},
                ${item.discount}, ${item.tax_percentage},
                ${item.tax_amount}, ${item.subtotal}, ${item.total}, ${item.sort_order}
              )
            `;
          }

          await tx`
            UPDATE quotations
            SET status = 'Converted', converted_invoice_id = ${invId}, updated_at = NOW()
            WHERE id = ${qtn.id}
          `;
        });

        return json(res, 201, { success: true, id: invId, invoice_number: inv_number });
      }

      // Standard invoice create
      if (!body.client_id) return json(res, 400, { error: 'Client ID is required' });
      if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
        return json(res, 400, { error: 'At least one line item is required' });
      }

      const clientRows = await sql`SELECT id, gstin, state FROM clients WHERE id = ${body.client_id} LIMIT 1`;
      if (!clientRows.length) return json(res, 400, { error: 'Invalid client' });

      const settings = await sql`SELECT invoice_prefix FROM company_settings WHERE id = 'main' LIMIT 1`;
      const prefix = settings.length ? String(settings[0].invoice_prefix) : 'EVOLW-INV-';
      const inv_number = await getNextSequenceNumber(sql, 'INVOICE', prefix);
      const invId = randomUUID();
      const today = new Date().toISOString().split('T')[0];
      const status = body.status || 'Draft';
      const snaps = await loadSnapshots(sql, body.client_id);
      const freeze = shouldFreezeSnapshots(status, null);
      const placeOfSupply =
        body.place_of_supply || clientRows[0].state || snaps.company_snapshot?.state || null;
      const clientGstin = body.client_gstin || clientRows[0].gstin || null;

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

      await withTransaction(sql, async (tx) => {
        await tx`
          INSERT INTO invoices (
            id, invoice_number, client_id, project_id, linked_quotation_id, date, due_date,
            currency, place_of_supply, client_gstin, payment_terms, po_number, service_period,
            internal_notes, client_notes, terms_conditions,
            tax_type, discount_type, discount_value, subtotal, taxable_amount,
            cgst_amount, sgst_amount, igst_amount, total_tax, overall_discount_amount,
            adjustment, grand_total, amount_paid, balance_due, status,
            client_snapshot, company_snapshot
          ) VALUES (
            ${invId}, ${inv_number}, ${body.client_id}, ${body.project_id || null},
            ${body.linked_quotation_id || null},
            ${body.date || today}, ${body.due_date || addDays(body.date || today, 15)},
            ${body.currency || 'INR'}, ${placeOfSupply}, ${clientGstin},
            ${body.payment_terms || null}, ${body.po_number || null}, ${body.service_period || null},
            ${body.internal_notes || null}, ${body.client_notes || null}, ${body.terms_conditions || null},
            ${body.tax_type || 'CGST_SGST'}, ${body.discount_type || 'PERCENTAGE'},
            ${num(body.discount_value)}, ${totals.subtotal}, ${totals.taxable_amount},
            ${totals.cgst_amount}, ${totals.sgst_amount}, ${totals.igst_amount},
            ${totals.total_tax}, ${totals.overall_discount_amount}, ${totals.adjustment},
            ${totals.grand_total}, 0, ${totals.grand_total}, ${status},
            ${freeze ? snapshotJson(snaps.client_snapshot) : null}::jsonb,
            ${freeze ? snapshotJson(snaps.company_snapshot) : null}::jsonb
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
            INSERT INTO invoice_items (
              id, invoice_id, name, description, hsn_sac, quantity, unit, rate,
              discount, tax_percentage, tax_amount, subtotal, total, sort_order
            ) VALUES (
              ${randomUUID()}, ${invId}, ${String(item.name).trim()}, ${item.description || null},
              ${item.hsn_sac ? String(item.hsn_sac).trim() : null},
              ${num(item.quantity, 1)}, ${item.unit || 'Item'}, ${num(item.rate)},
              ${itemTotals.discount}, ${num(item.tax_percentage, 18)},
              ${itemTotals.tax_amount}, ${itemTotals.subtotal}, ${itemTotals.total}, ${i++}
            )
          `;
        }
      });

      return json(res, 201, { success: true, id: invId, invoice_number: inv_number });
    }

    if (req.method === 'PUT') {
      const body = readBody<any>(req);
      if (!body.id) return json(res, 400, { error: 'Invoice ID is required' });
      if (!body.client_id) return json(res, 400, { error: 'Client ID is required' });
      if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
        return json(res, 400, { error: 'At least one line item is required' });
      }

      const existingRows = await sql`SELECT * FROM invoices WHERE id = ${body.id} LIMIT 1`;
      if (!existingRows.length) return json(res, 404, { error: 'Invoice not found' });
      const existing = existingRows[0];
      if (['Paid', 'Cancelled', 'Written Off'].includes(String(existing.status))) {
        return json(res, 400, { error: `Cannot edit invoice in ${existing.status} status` });
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

      const amountPaid = num(existing.amount_paid);
      if (totals.grand_total < amountPaid) {
        return json(res, 400, { error: 'New total cannot be less than amount already paid' });
      }
      const balanceDue = totals.grand_total - amountPaid;
      let status = body.status || existing.status;
      if (amountPaid <= 0) {
        // keep draft/sent etc.
      } else if (balanceDue <= 0) {
        status = 'Paid';
      } else {
        status = 'Partially Paid';
      }

      const today = new Date().toISOString().split('T')[0];
      const snaps = shouldFreezeSnapshots(status, existing.client_snapshot)
        ? await loadSnapshots(sql, body.client_id)
        : null;
      const clientRows = await sql`SELECT gstin, state FROM clients WHERE id = ${body.client_id} LIMIT 1`;
      const placeOfSupply =
        body.place_of_supply || clientRows[0]?.state || existing.place_of_supply || null;
      const clientGstin =
        body.client_gstin || clientRows[0]?.gstin || existing.client_gstin || null;

      await withTransaction(sql, async (tx) => {
        if (snaps) {
          await tx`
            UPDATE invoices SET
              client_id = ${body.client_id},
              project_id = ${body.project_id || null},
              date = ${body.date || today},
              due_date = ${body.due_date || addDays(body.date || today, 15)},
              currency = ${body.currency || 'INR'},
              place_of_supply = ${placeOfSupply},
              client_gstin = ${clientGstin},
              payment_terms = ${body.payment_terms || null},
              po_number = ${body.po_number || null},
              service_period = ${body.service_period || null},
              internal_notes = ${body.internal_notes || null},
              client_notes = ${body.client_notes || null},
              terms_conditions = ${body.terms_conditions || null},
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
              balance_due = ${balanceDue},
              status = ${status},
              client_snapshot = ${snapshotJson(snaps.client_snapshot)}::jsonb,
              company_snapshot = ${snapshotJson(snaps.company_snapshot)}::jsonb,
              updated_at = NOW()
            WHERE id = ${body.id}
          `;
        } else {
          await tx`
            UPDATE invoices SET
              client_id = ${body.client_id},
              project_id = ${body.project_id || null},
              date = ${body.date || today},
              due_date = ${body.due_date || addDays(body.date || today, 15)},
              currency = ${body.currency || 'INR'},
              place_of_supply = ${placeOfSupply},
              client_gstin = ${clientGstin},
              payment_terms = ${body.payment_terms || null},
              po_number = ${body.po_number || null},
              service_period = ${body.service_period || null},
              internal_notes = ${body.internal_notes || null},
              client_notes = ${body.client_notes || null},
              terms_conditions = ${body.terms_conditions || null},
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
              balance_due = ${balanceDue},
              status = ${status},
              updated_at = NOW()
            WHERE id = ${body.id}
          `;
        }

        await tx`DELETE FROM invoice_items WHERE invoice_id = ${body.id}`;

        let i = 0;
        for (const item of body.items) {
          const itemTotals = calculateLineItem({
            rate: num(item.rate),
            quantity: num(item.quantity, 1),
            discount: num(item.discount),
            tax_percentage: num(item.tax_percentage, 18),
          });
          await tx`
            INSERT INTO invoice_items (
              id, invoice_id, name, description, hsn_sac, quantity, unit, rate,
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
      if (!id) return json(res, 400, { error: 'Invoice ID is required' });

      const existing = await sql`SELECT id, status, amount_paid FROM invoices WHERE id = ${id} LIMIT 1`;
      if (!existing.length) return json(res, 404, { error: 'Invoice not found' });
      if (num(existing[0].amount_paid) > 0) {
        return json(res, 400, { error: 'Cannot delete invoices with payments. Cancel instead.' });
      }

      await sql`DELETE FROM invoices WHERE id = ${id}`;
      return json(res, 200, { success: true });
    }

    return methodNotAllowed(res, ['GET', 'POST', 'PUT', 'DELETE']);
  } catch (error) {
    logError('invoices', error);
    return json(res, 500, { error: 'Failed to process request' });
  }
}
