/**
 * Removes demo/seed billing data from the database.
 * Targets known seed clients (Acme Corp, Stark Industries, Globex Corporation)
 * and seed document numbers. Keeps company_settings intact.
 *
 * Usage:
 *   CONFIRM_PURGE=1 npx tsx --env-file=.env.local scripts/purge-billing-seed.ts
 */
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL');
  process.exit(1);
}

if (process.env.CONFIRM_PURGE !== '1') {
  console.error('Refusing to run. Set CONFIRM_PURGE=1 to delete seed billing data.');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function purge() {
  console.log('Purging demo billing seed data...');

  const clients = await sql`
    SELECT id, company_name FROM clients
    WHERE company_name IN ('Acme Corp', 'Stark Industries', 'Globex Corporation')
  `;

  console.log(
    clients.length
      ? `Found ${clients.length} demo client(s): ${clients.map((c: any) => c.company_name).join(', ')}`
      : 'No demo-named clients found; cleaning seed document numbers if present.'
  );

  // Payments tied to seed invoices (by number or demo clients)
  await sql`
    DELETE FROM payments
    WHERE invoice_id IN (
      SELECT id FROM invoices
      WHERE invoice_number IN ('EVOLW-INV-1001', 'EVOLW-INV-1002')
         OR client_id IN (
           SELECT id FROM clients
           WHERE company_name IN ('Acme Corp', 'Stark Industries', 'Globex Corporation')
         )
    )
    OR client_id IN (
      SELECT id FROM clients
      WHERE company_name IN ('Acme Corp', 'Stark Industries', 'Globex Corporation')
    )
    OR reference_number IN ('EVOLW-REC-1001', 'EVOLW-REC-1002')
  `;
  console.log('Cleared seed payments');

  await sql`
    DELETE FROM invoice_items
    WHERE invoice_id IN (
      SELECT id FROM invoices
      WHERE invoice_number IN ('EVOLW-INV-1001', 'EVOLW-INV-1002')
         OR client_id IN (
           SELECT id FROM clients
           WHERE company_name IN ('Acme Corp', 'Stark Industries', 'Globex Corporation')
         )
    )
  `;

  await sql`
    DELETE FROM invoices
    WHERE invoice_number IN ('EVOLW-INV-1001', 'EVOLW-INV-1002')
       OR client_id IN (
         SELECT id FROM clients
         WHERE company_name IN ('Acme Corp', 'Stark Industries', 'Globex Corporation')
       )
  `;
  console.log('Cleared seed invoices');

  await sql`
    DELETE FROM quotation_milestones
    WHERE quotation_id IN (
      SELECT id FROM quotations
      WHERE quotation_number IN ('EVOLW-QTN-1001', 'EVOLW-QTN-1002')
         OR client_id IN (
           SELECT id FROM clients
           WHERE company_name IN ('Acme Corp', 'Stark Industries', 'Globex Corporation')
         )
    )
  `;

  await sql`
    DELETE FROM quotation_items
    WHERE quotation_id IN (
      SELECT id FROM quotations
      WHERE quotation_number IN ('EVOLW-QTN-1001', 'EVOLW-QTN-1002')
         OR client_id IN (
           SELECT id FROM clients
           WHERE company_name IN ('Acme Corp', 'Stark Industries', 'Globex Corporation')
         )
    )
  `;

  await sql`
    DELETE FROM quotations
    WHERE quotation_number IN ('EVOLW-QTN-1001', 'EVOLW-QTN-1002')
       OR client_id IN (
         SELECT id FROM clients
         WHERE company_name IN ('Acme Corp', 'Stark Industries', 'Globex Corporation')
       )
  `;
  console.log('Cleared seed quotations');

  await sql`
    DELETE FROM projects
    WHERE client_id IN (
      SELECT id FROM clients
      WHERE company_name IN ('Acme Corp', 'Stark Industries', 'Globex Corporation')
    )
  `;

  await sql`
    DELETE FROM clients
    WHERE company_name IN ('Acme Corp', 'Stark Industries', 'Globex Corporation')
  `;
  console.log('Cleared demo clients + projects');

  await sql`
    UPDATE document_sequences
    SET current_value = 0, updated_at = NOW()
    WHERE id IN ('QUOTATION_2026', 'INVOICE_2026', 'RECEIPT_2026')
      AND current_value <= 2
  `;

  const remaining = await sql`
    SELECT
      (SELECT COUNT(*)::int FROM clients) AS clients,
      (SELECT COUNT(*)::int FROM quotations) AS quotations,
      (SELECT COUNT(*)::int FROM invoices) AS invoices,
      (SELECT COUNT(*)::int FROM payments) AS payments
  `;

  console.log('Done. Remaining counts:', remaining[0]);
  console.log('company_settings left untouched.');
}

purge().catch((err) => {
  console.error('Purge failed:', err);
  process.exit(1);
});
