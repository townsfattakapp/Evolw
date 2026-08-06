import { neon } from '@neondatabase/serverless';

/**
 * LOCAL DEMO SEED ONLY — never run against production without CONFIRM_SEED=1.
 * Prefer: CONFIRM_SEED=1 npx tsx --env-file=.env.local scripts/seed-billing.ts
 */

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("Missing DATABASE_URL");
  process.exit(1);
}

if (process.env.CONFIRM_SEED !== '1') {
  console.error(
    "Refusing to seed. This inserts fake clients (Acme/Stark/Globex).\n" +
      "Set CONFIRM_SEED=1 only for local/dev databases."
  );
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function seed() {
  console.log("Seeding Billing Data...");

  // Generate IDs
  const genId = (prefix: string) => `${prefix}_${Math.random().toString(36).substr(2, 9)}`;

  // 1. Create Clients
  const clients = [
    {
      id: genId('client'),
      company_name: "Acme Corp",
      email: "billing@acmecorp.com",
      phone: "+91 9876543210",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      status: "Active"
    },
    {
      id: genId('client'),
      company_name: "Stark Industries",
      email: "tony@stark.com",
      phone: "+1 555-0199",
      city: "New York",
      state: "NY",
      country: "USA",
      status: "Active"
    },
    {
      id: genId('client'),
      company_name: "Globex Corporation",
      email: "finance@globex.com",
      phone: "+44 20 7946 0958",
      city: "London",
      state: "London",
      country: "UK",
      status: "Active"
    }
  ];

  for (const client of clients) {
    await sql`
      INSERT INTO clients (id, company_name, email, phone, city, state, country, status)
      VALUES (${client.id}, ${client.company_name}, ${client.email}, ${client.phone}, ${client.city}, ${client.state}, ${client.country}, ${client.status})
      ON CONFLICT (id) DO NOTHING
    `;
  }
  console.log("✅ Clients seeded");

  // 2. Create Projects
  const projects = [
    { id: genId('proj'), client_id: clients[0].id, name: "E-commerce Website Redesign", status: "In Progress", estimated_value: 150000 },
    { id: genId('proj'), client_id: clients[1].id, name: "AI Assistant Integration", status: "Approved", estimated_value: 450000 },
    { id: genId('proj'), client_id: clients[2].id, name: "Mobile App MVP", status: "Completed", estimated_value: 300000 },
  ];

  for (const project of projects) {
    await sql`
      INSERT INTO projects (id, client_id, name, status, estimated_value)
      VALUES (${project.id}, ${project.client_id}, ${project.name}, ${project.status}, ${project.estimated_value})
      ON CONFLICT (id) DO NOTHING
    `;
  }
  console.log("✅ Projects seeded");

  // 3. Create Quotations
  const quotations = [
    {
      id: genId('quot'),
      quotation_number: "EVOLW-QTN-1001",
      client_id: clients[0].id,
      project_id: projects[0].id,
      date: new Date().toISOString(),
      valid_until: new Date(Date.now() + 30 * 86400000).toISOString(),
      tax_type: 'CGST_SGST',
      subtotal: 150000,
      taxable_amount: 150000,
      cgst_amount: 13500,
      sgst_amount: 13500,
      total_tax: 27000,
      grand_total: 177000,
      status: 'Approved'
    },
    {
      id: genId('quot'),
      quotation_number: "EVOLW-QTN-1002",
      client_id: clients[1].id,
      project_id: projects[1].id,
      date: new Date().toISOString(),
      valid_until: new Date(Date.now() + 30 * 86400000).toISOString(),
      tax_type: 'IGST',
      subtotal: 450000,
      taxable_amount: 450000,
      igst_amount: 81000,
      total_tax: 81000,
      grand_total: 531000,
      status: 'Sent'
    }
  ];

  for (const q of quotations) {
    await sql`
      INSERT INTO quotations (
        id, quotation_number, client_id, project_id, date, valid_until, tax_type, 
        subtotal, taxable_amount, cgst_amount, sgst_amount, igst_amount, total_tax, grand_total, status
      ) VALUES (
        ${q.id}, ${q.quotation_number}, ${q.client_id}, ${q.project_id}, ${q.date}, ${q.valid_until}, ${q.tax_type},
        ${q.subtotal}, ${q.taxable_amount}, ${q.cgst_amount || 0}, ${q.sgst_amount || 0}, ${q.igst_amount || 0}, ${q.total_tax}, ${q.grand_total}, ${q.status}
      ) ON CONFLICT (id) DO NOTHING
    `;

    // Quotation Items
    await sql`
      INSERT INTO quotation_items (id, quotation_id, name, quantity, rate, subtotal, tax_amount, total)
      VALUES (${genId('item')}, ${q.id}, 'Web Development Services', 1, ${q.subtotal}, ${q.subtotal}, ${q.total_tax}, ${q.grand_total})
    `;
  }
  console.log("✅ Quotations seeded");

  // 4. Create Invoices
  const invoices = [
    {
      id: genId('inv'),
      invoice_number: "EVOLW-INV-1001",
      client_id: clients[0].id,
      project_id: projects[0].id,
      linked_quotation_id: quotations[0].id,
      date: new Date().toISOString(),
      due_date: new Date(Date.now() + 15 * 86400000).toISOString(),
      tax_type: 'CGST_SGST',
      subtotal: 150000,
      taxable_amount: 150000,
      cgst_amount: 13500,
      sgst_amount: 13500,
      total_tax: 27000,
      grand_total: 177000,
      amount_paid: 177000,
      balance_due: 0,
      status: 'Paid'
    },
    {
      id: genId('inv'),
      invoice_number: "EVOLW-INV-1002",
      client_id: clients[2].id,
      project_id: projects[2].id,
      date: new Date(Date.now() - 5 * 86400000).toISOString(),
      due_date: new Date(Date.now() + 10 * 86400000).toISOString(),
      tax_type: 'IGST',
      subtotal: 300000,
      taxable_amount: 300000,
      igst_amount: 54000,
      total_tax: 54000,
      grand_total: 354000,
      amount_paid: 100000,
      balance_due: 254000,
      status: 'Partially Paid'
    }
  ];

  for (const inv of invoices) {
    await sql`
      INSERT INTO invoices (
        id, invoice_number, client_id, project_id, linked_quotation_id, date, due_date, tax_type,
        subtotal, taxable_amount, cgst_amount, sgst_amount, igst_amount, total_tax, grand_total, 
        amount_paid, balance_due, status
      ) VALUES (
        ${inv.id}, ${inv.invoice_number}, ${inv.client_id}, ${inv.project_id}, ${inv.linked_quotation_id || null}, ${inv.date}, ${inv.due_date}, ${inv.tax_type},
        ${inv.subtotal}, ${inv.taxable_amount}, ${inv.cgst_amount || 0}, ${inv.sgst_amount || 0}, ${inv.igst_amount || 0}, ${inv.total_tax}, ${inv.grand_total},
        ${inv.amount_paid}, ${inv.balance_due}, ${inv.status}
      ) ON CONFLICT (id) DO NOTHING
    `;

    // Invoice Items
    await sql`
      INSERT INTO invoice_items (id, invoice_id, name, quantity, rate, subtotal, tax_amount, total)
      VALUES (${genId('item')}, ${inv.id}, 'Project Implementation Phase 1', 1, ${inv.subtotal}, ${inv.subtotal}, ${inv.total_tax}, ${inv.grand_total})
    `;
  }
  console.log("✅ Invoices seeded");

  // 5. Create Payments
  const payments = [
    {
      id: genId('pay'),
      reference_number: "EVOLW-REC-1001",
      invoice_id: invoices[0].id,
      client_id: clients[0].id,
      project_id: projects[0].id,
      date: new Date().toISOString(),
      amount: 177000,
      payment_method: "Bank Transfer",
      transaction_id: "TXN987654321",
      status: "Completed"
    },
    {
      id: genId('pay'),
      reference_number: "EVOLW-REC-1002",
      invoice_id: invoices[1].id,
      client_id: clients[2].id,
      project_id: projects[2].id,
      date: new Date().toISOString(),
      amount: 100000,
      payment_method: "Credit Card",
      transaction_id: "TXN123456789",
      status: "Completed"
    }
  ];

  for (const pay of payments) {
    await sql`
      INSERT INTO payments (
        id, reference_number, invoice_id, client_id, project_id, date, amount, payment_method, transaction_id, status
      ) VALUES (
        ${pay.id}, ${pay.reference_number}, ${pay.invoice_id}, ${pay.client_id}, ${pay.project_id}, ${pay.date}, ${pay.amount}, ${pay.payment_method}, ${pay.transaction_id}, ${pay.status}
      ) ON CONFLICT (id) DO NOTHING
    `;
  }
  console.log("✅ Payments seeded");

  // Ensure Sequences are correct
  await sql`
    INSERT INTO document_sequences (id, type, prefix, current_value)
    VALUES 
      ('QUOTATION_2026', 'QUOTATION', 'EVOLW-QTN-', 2),
      ('INVOICE_2026', 'INVOICE', 'EVOLW-INV-', 2),
      ('RECEIPT_2026', 'RECEIPT', 'EVOLW-REC-', 2)
    ON CONFLICT (id) DO UPDATE SET current_value = EXCLUDED.current_value
  `;
  console.log("✅ Sequences updated");

  console.log("🎉 Seeding complete!");
}

seed().catch(err => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
