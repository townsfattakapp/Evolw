import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../auth.js';
import { ensureSchema } from '../db.js';
import { handleOptions, json, logError, methodNotAllowed } from '../http.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  try {
    if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

    const sql = await ensureSchema();
    if (!requireAdmin(req)) return json(res, 401, { error: 'Unauthorized' });

    // Run all dashboard queries in parallel (was sequential — major latency win)
    const [
      invoiceStatsRows,
      quotationStatsRows,
      clientStatsRows,
      recentPayments,
      recentInvoices,
      recentQuotations,
    ] = await Promise.all([
      sql`
        SELECT
          COALESCE(SUM(grand_total) FILTER (WHERE status NOT IN ('Cancelled', 'Written Off', 'Draft')), 0) AS total_invoiced,
          COALESCE(SUM(amount_paid) FILTER (WHERE status NOT IN ('Cancelled', 'Written Off')), 0) AS total_received,
          COALESCE(SUM(balance_due) FILTER (WHERE status IN ('Sent', 'Viewed', 'Partially Paid', 'Overdue')), 0) AS outstanding,
          COUNT(*) FILTER (WHERE status IN ('Sent', 'Viewed', 'Partially Paid', 'Overdue')) AS open_invoices
        FROM invoices
      `,
      sql`
        SELECT
          COALESCE(SUM(grand_total), 0) AS total_quotation_value,
          COALESCE(SUM(grand_total) FILTER (WHERE status = 'Approved'), 0) AS approved_quotation_value,
          COUNT(*) FILTER (WHERE status IN ('Draft', 'Sent', 'Viewed')) AS pending_quotations
        FROM quotations
        WHERE status NOT IN ('Cancelled', 'Expired')
      `,
      sql`
        SELECT COUNT(*)::int AS active_clients FROM clients WHERE status = 'Active'
      `,
      sql`
        SELECT p.id, p.reference_number, p.amount, p.currency, p.date, p.created_at,
               c.company_name AS client_name, i.invoice_number
        FROM payments p
        JOIN clients c ON p.client_id = c.id
        LEFT JOIN invoices i ON p.invoice_id = i.id
        WHERE p.status = 'Completed'
        ORDER BY p.created_at DESC
        LIMIT 8
      `,
      sql`
        SELECT i.id, i.invoice_number, i.grand_total, i.currency, i.status, i.created_at,
               c.company_name AS client_name
        FROM invoices i
        JOIN clients c ON i.client_id = c.id
        ORDER BY i.created_at DESC
        LIMIT 8
      `,
      sql`
        SELECT q.id, q.quotation_number, q.grand_total, q.currency, q.status, q.created_at,
               c.company_name AS client_name
        FROM quotations q
        JOIN clients c ON q.client_id = c.id
        ORDER BY q.created_at DESC
        LIMIT 8
      `,
    ]);

    const invoiceStats = invoiceStatsRows[0] || {};
    const quotationStats = quotationStatsRows[0] || {};
    const clientStats = clientStatsRows[0] || {};

    return json(res, 200, {
      totalInvoicedAmount: Number(invoiceStats.total_invoiced) || 0,
      totalReceived: Number(invoiceStats.total_received) || 0,
      outstanding: Number(invoiceStats.outstanding) || 0,
      openInvoices: Number(invoiceStats.open_invoices) || 0,
      totalQuotationValue: Number(quotationStats.total_quotation_value) || 0,
      approvedQuotationValue: Number(quotationStats.approved_quotation_value) || 0,
      pendingQuotations: Number(quotationStats.pending_quotations) || 0,
      activeClients: Number(clientStats.active_clients) || 0,
      recentPayments,
      recentInvoices,
      recentQuotations,
    });
  } catch (error) {
    logError('billing-dashboard', error);
    return json(res, 500, { error: 'Failed to load billing dashboard' });
  }
}
