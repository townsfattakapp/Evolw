import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'crypto';
import { requireAdmin } from '../auth.js';
import { ensureSchema } from '../db.js';
import { handleOptions, json, logError, methodNotAllowed, readBody } from '../http.js';
import { getNextSequenceNumber } from '../sequences.js';
import { withTransaction } from '../tx.js';

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
      const invoice_id = typeof req.query.invoice_id === 'string' ? req.query.invoice_id : null;

      if (invoice_id) {
        const rows = await sql`
          SELECT p.*, i.invoice_number, c.company_name as client_name
          FROM payments p
          LEFT JOIN invoices i ON p.invoice_id = i.id
          JOIN clients c ON p.client_id = c.id
          WHERE p.invoice_id = ${invoice_id}
          ORDER BY p.created_at DESC
        `;
        return json(res, 200, rows);
      }

      const rows = await sql`
        SELECT p.*, i.invoice_number, c.company_name as client_name
        FROM payments p
        LEFT JOIN invoices i ON p.invoice_id = i.id
        JOIN clients c ON p.client_id = c.id
        ORDER BY p.created_at DESC
      `;
      return json(res, 200, rows);
    }

    if (req.method === 'POST') {
      const body = readBody<any>(req);

      if (!body.invoice_id) return json(res, 400, { error: 'Invoice ID is required' });
      if (!body.amount || num(body.amount) <= 0) {
        return json(res, 400, { error: 'Valid positive amount is required' });
      }
      if (!body.payment_method?.trim()) {
        return json(res, 400, { error: 'Payment method is required' });
      }

      const invRows = await sql`SELECT * FROM invoices WHERE id = ${body.invoice_id} LIMIT 1`;
      if (!invRows.length) return json(res, 404, { error: 'Invoice not found' });
      const invoice = invRows[0];

      if (['Cancelled', 'Written Off', 'Draft'].includes(String(invoice.status))) {
        return json(res, 400, {
          error: `Cannot record payment against ${invoice.status} invoice. Mark it as Sent first.`,
        });
      }

      const amount = num(body.amount);
      if (amount > num(invoice.balance_due) + 0.001) {
        return json(res, 400, { error: 'Payment amount cannot exceed balance due' });
      }

      const settings = await sql`SELECT receipt_prefix FROM company_settings WHERE id = 'main' LIMIT 1`;
      const prefix = settings.length ? String(settings[0].receipt_prefix) : 'EVOLW-REC-';
      const ref_number = await getNextSequenceNumber(sql, 'RECEIPT', prefix);
      const paymentId = randomUUID();
      const today = new Date().toISOString().split('T')[0];

      await withTransaction(sql, async (tx) => {
        await tx`
          INSERT INTO payments (
            id, reference_number, invoice_id, client_id, project_id, date,
            amount, currency, payment_method, transaction_id, notes, status
          ) VALUES (
            ${paymentId}, ${ref_number}, ${invoice.id}, ${invoice.client_id}, ${invoice.project_id},
            ${body.date || today}, ${amount},
            ${invoice.currency}, ${body.payment_method.trim()},
            ${body.transaction_id || null}, ${body.notes || null}, 'Completed'
          )
        `;

        const newBalance = Math.max(0, num(invoice.balance_due) - amount);
        const newAmountPaid = num(invoice.amount_paid) + amount;
        const newStatus = newBalance <= 0.001 ? 'Paid' : 'Partially Paid';

        await tx`
          UPDATE invoices SET
            amount_paid = ${newAmountPaid},
            balance_due = ${newBalance},
            status = ${newStatus},
            updated_at = NOW()
          WHERE id = ${invoice.id}
        `;
      });

      return json(res, 201, { success: true, id: paymentId, reference_number: ref_number });
    }

    return methodNotAllowed(res, ['GET', 'POST']);
  } catch (error) {
    logError('payments', error);
    return json(res, 500, { error: 'Failed to process payment request' });
  }
}
