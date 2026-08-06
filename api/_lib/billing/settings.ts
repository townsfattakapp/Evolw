import type { VercelRequest, VercelResponse } from '@vercel/node';
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
      const rows = await sql`SELECT * FROM company_settings WHERE id = 'main' LIMIT 1`;
      if (!rows.length) {
        // Return default empty state if not found
        return json(res, 200, {
          id: 'main',
          brand_name: 'EVOLW',
          legal_name: 'EVOLW',
          country: 'India',
          default_currency: 'INR',
          default_tax_rate: 18,
          financial_year_start_month: 4,
          quotation_prefix: 'EVOLW-QTN-',
          invoice_prefix: 'EVOLW-INV-',
          receipt_prefix: 'EVOLW-REC-',
          default_quotation_validity: 30,
        });
      }
      return json(res, 200, rows[0]);
    }

    if (req.method === 'PUT') {
      const body = readBody<any>(req);

      // Perform upsert
      await sql`
        INSERT INTO company_settings (
          id, brand_name, legal_name, logo_url, signature_url, address, billing_address, email, phone, website,
          gstin, pan, cin, state, state_code, country, pin_code, default_currency, default_tax_rate,
          financial_year_start_month, quotation_prefix, invoice_prefix, receipt_prefix, default_payment_terms,
          default_quotation_validity, default_notes, default_terms, bank_name, account_holder, account_number,
          ifsc_code, branch, account_type, swift_code, upi_id, upi_qr_url, updated_at
        ) VALUES (
          'main', ${body.brand_name || 'EVOLW'}, ${body.legal_name || 'EVOLW'}, ${body.logo_url || null},
          ${body.signature_url || null}, ${body.address || null}, ${body.billing_address || null},
          ${body.email || null}, ${body.phone || null}, ${body.website || null}, ${body.gstin || null},
          ${body.pan || null}, ${body.cin || null}, ${body.state || null}, ${body.state_code || null},
          ${body.country || 'India'}, ${body.pin_code || null}, ${body.default_currency || 'INR'},
          ${body.default_tax_rate !== undefined ? body.default_tax_rate : 18},
          ${body.financial_year_start_month !== undefined ? body.financial_year_start_month : 4},
          ${body.quotation_prefix || 'EVOLW-QTN-'}, ${body.invoice_prefix || 'EVOLW-INV-'},
          ${body.receipt_prefix || 'EVOLW-REC-'}, ${body.default_payment_terms || null},
          ${body.default_quotation_validity !== undefined ? body.default_quotation_validity : 30},
          ${body.default_notes || null}, ${body.default_terms || null}, ${body.bank_name || null},
          ${body.account_holder || null}, ${body.account_number || null}, ${body.ifsc_code || null},
          ${body.branch || null}, ${body.account_type || null}, ${body.swift_code || null},
          ${body.upi_id || null}, ${body.upi_qr_url || null}, NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          brand_name = EXCLUDED.brand_name,
          legal_name = EXCLUDED.legal_name,
          logo_url = EXCLUDED.logo_url,
          signature_url = EXCLUDED.signature_url,
          address = EXCLUDED.address,
          billing_address = EXCLUDED.billing_address,
          email = EXCLUDED.email,
          phone = EXCLUDED.phone,
          website = EXCLUDED.website,
          gstin = EXCLUDED.gstin,
          pan = EXCLUDED.pan,
          cin = EXCLUDED.cin,
          state = EXCLUDED.state,
          state_code = EXCLUDED.state_code,
          country = EXCLUDED.country,
          pin_code = EXCLUDED.pin_code,
          default_currency = EXCLUDED.default_currency,
          default_tax_rate = EXCLUDED.default_tax_rate,
          financial_year_start_month = EXCLUDED.financial_year_start_month,
          quotation_prefix = EXCLUDED.quotation_prefix,
          invoice_prefix = EXCLUDED.invoice_prefix,
          receipt_prefix = EXCLUDED.receipt_prefix,
          default_payment_terms = EXCLUDED.default_payment_terms,
          default_quotation_validity = EXCLUDED.default_quotation_validity,
          default_notes = EXCLUDED.default_notes,
          default_terms = EXCLUDED.default_terms,
          bank_name = EXCLUDED.bank_name,
          account_holder = EXCLUDED.account_holder,
          account_number = EXCLUDED.account_number,
          ifsc_code = EXCLUDED.ifsc_code,
          branch = EXCLUDED.branch,
          account_type = EXCLUDED.account_type,
          swift_code = EXCLUDED.swift_code,
          upi_id = EXCLUDED.upi_id,
          upi_qr_url = EXCLUDED.upi_qr_url,
          updated_at = NOW()
      `;

      const rows = await sql`SELECT * FROM company_settings WHERE id = 'main' LIMIT 1`;
      return json(res, 200, { success: true, settings: rows[0] });
    }

    return methodNotAllowed(res, ['GET', 'PUT']);
  } catch (error) {
    logError('settings', error);
    return json(res, 500, { error: 'Failed to process settings request' });
  }
}
