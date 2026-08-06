import { type NeonQueryFunction } from '@neondatabase/serverless';

export async function createBillingSchema(sql: NeonQueryFunction<false, false>) {
  // 1. Company Settings
  await sql`
    CREATE TABLE IF NOT EXISTS company_settings (
      id TEXT PRIMARY KEY DEFAULT 'main',
      brand_name TEXT NOT NULL DEFAULT 'EVOLW',
      legal_name TEXT NOT NULL DEFAULT 'EVOLW',
      logo_url TEXT,
      signature_url TEXT,
      address TEXT,
      billing_address TEXT,
      email TEXT,
      phone TEXT,
      website TEXT,
      gstin TEXT,
      pan TEXT,
      cin TEXT,
      state TEXT,
      state_code TEXT,
      country TEXT DEFAULT 'India',
      pin_code TEXT,
      default_currency TEXT DEFAULT 'INR',
      default_tax_rate DECIMAL(5,2) DEFAULT 18.00,
      financial_year_start_month INTEGER DEFAULT 4,
      quotation_prefix TEXT DEFAULT 'EVOLW-QTN-',
      invoice_prefix TEXT DEFAULT 'EVOLW-INV-',
      receipt_prefix TEXT DEFAULT 'EVOLW-REC-',
      default_payment_terms TEXT,
      default_quotation_validity INTEGER DEFAULT 30,
      default_notes TEXT,
      default_terms TEXT,
      bank_name TEXT,
      account_holder TEXT,
      account_number TEXT,
      ifsc_code TEXT,
      branch TEXT,
      account_type TEXT,
      swift_code TEXT,
      upi_id TEXT,
      upi_qr_url TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  // 2. Clients
  await sql`
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      company_name TEXT NOT NULL,
      contact_person TEXT,
      email TEXT NOT NULL,
      phone TEXT,
      alt_phone TEXT,
      website TEXT,
      gstin TEXT,
      pan TEXT,
      registration_number TEXT,
      billing_address TEXT,
      shipping_address TEXT,
      city TEXT,
      state TEXT,
      country TEXT,
      pin_code TEXT,
      notes TEXT,
      default_currency TEXT DEFAULT 'INR',
      payment_terms TEXT,
      status TEXT NOT NULL DEFAULT 'Active', -- Active, Inactive, Archived
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  // 3. Projects
  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
      name TEXT NOT NULL,
      code TEXT,
      description TEXT,
      start_date DATE,
      expected_delivery_date DATE,
      status TEXT NOT NULL DEFAULT 'Lead', -- Lead, Proposal Sent, Approved, In Progress, On Hold, Completed, Cancelled
      project_manager TEXT,
      estimated_value DECIMAL(12,2),
      final_value DECIMAL(12,2),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  // 4. Document Sequences (For safe auto-increment generation)
  await sql`
    CREATE TABLE IF NOT EXISTS document_sequences (
      id TEXT PRIMARY KEY, -- e.g. 'QUOTATION_2026', 'INVOICE_2026_27'
      type TEXT NOT NULL,
      prefix TEXT NOT NULL,
      current_value INTEGER NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  // 5. Quotations
  await sql`
    CREATE TABLE IF NOT EXISTS quotations (
      id TEXT PRIMARY KEY,
      quotation_number TEXT NOT NULL UNIQUE,
      client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
      project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
      date DATE NOT NULL,
      valid_until DATE NOT NULL,
      currency TEXT NOT NULL DEFAULT 'INR',
      place_of_supply TEXT,
      subject TEXT,
      intro_message TEXT,
      scope_of_work TEXT,
      terms_conditions TEXT,
      internal_notes TEXT,
      client_notes TEXT,
      payment_terms TEXT,
      estimated_delivery TEXT,
      tax_type TEXT NOT NULL DEFAULT 'CGST_SGST', -- NONE, IGST, CGST_SGST
      discount_type TEXT NOT NULL DEFAULT 'PERCENTAGE', -- PERCENTAGE, FIXED
      discount_value DECIMAL(12,2) DEFAULT 0,
      
      -- Totals
      subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
      taxable_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
      cgst_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
      sgst_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
      igst_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
      total_tax DECIMAL(12,2) NOT NULL DEFAULT 0,
      overall_discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
      adjustment DECIMAL(12,2) NOT NULL DEFAULT 0,
      grand_total DECIMAL(12,2) NOT NULL DEFAULT 0,
      advance_required DECIMAL(12,2) NOT NULL DEFAULT 0,
      
      status TEXT NOT NULL DEFAULT 'Draft', -- Draft, Sent, Viewed, Approved, Rejected, Expired, Cancelled, Converted
      converted_invoice_id TEXT,
      
      -- Snapshot fields for immutability
      client_snapshot JSONB,
      company_snapshot JSONB,
      
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  // 6. Quotation Items
  await sql`
    CREATE TABLE IF NOT EXISTS quotation_items (
      id TEXT PRIMARY KEY,
      quotation_id TEXT NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      hsn_sac TEXT,
      quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
      unit TEXT NOT NULL DEFAULT 'Item',
      rate DECIMAL(12,2) NOT NULL DEFAULT 0,
      discount DECIMAL(12,2) NOT NULL DEFAULT 0,
      tax_percentage DECIMAL(5,2) NOT NULL DEFAULT 18.00,
      tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
      subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
      total DECIMAL(12,2) NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0
    )
  `;

  // 7. Quotation Milestones
  await sql`
    CREATE TABLE IF NOT EXISTS quotation_milestones (
      id TEXT PRIMARY KEY,
      quotation_id TEXT NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      percentage DECIMAL(5,2) NOT NULL,
      amount DECIMAL(12,2) NOT NULL,
      expected_date DATE,
      sort_order INTEGER NOT NULL DEFAULT 0
    )
  `;

  // 8. Invoices
  await sql`
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      invoice_number TEXT NOT NULL UNIQUE,
      client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
      project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
      linked_quotation_id TEXT REFERENCES quotations(id) ON DELETE SET NULL,
      linked_milestone_id TEXT REFERENCES quotation_milestones(id) ON DELETE SET NULL,
      date DATE NOT NULL,
      due_date DATE NOT NULL,
      currency TEXT NOT NULL DEFAULT 'INR',
      place_of_supply TEXT,
      client_gstin TEXT,
      payment_terms TEXT,
      po_number TEXT,
      service_period TEXT,
      internal_notes TEXT,
      client_notes TEXT,
      terms_conditions TEXT,
      
      -- Totals (Same as Quotations)
      tax_type TEXT NOT NULL DEFAULT 'CGST_SGST',
      discount_type TEXT NOT NULL DEFAULT 'PERCENTAGE',
      discount_value DECIMAL(12,2) DEFAULT 0,
      subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
      taxable_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
      cgst_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
      sgst_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
      igst_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
      total_tax DECIMAL(12,2) NOT NULL DEFAULT 0,
      overall_discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
      adjustment DECIMAL(12,2) NOT NULL DEFAULT 0,
      grand_total DECIMAL(12,2) NOT NULL DEFAULT 0,
      
      -- Payment Tracking
      amount_paid DECIMAL(12,2) NOT NULL DEFAULT 0,
      balance_due DECIMAL(12,2) NOT NULL DEFAULT 0,
      
      status TEXT NOT NULL DEFAULT 'Draft', -- Draft, Sent, Viewed, Partially Paid, Paid, Overdue, Cancelled, Written Off, Refunded
      
      -- Snapshot fields for immutability
      client_snapshot JSONB,
      company_snapshot JSONB,
      
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  // 9. Invoice Items
  await sql`
    CREATE TABLE IF NOT EXISTS invoice_items (
      id TEXT PRIMARY KEY,
      invoice_id TEXT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      hsn_sac TEXT,
      quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
      unit TEXT NOT NULL DEFAULT 'Item',
      rate DECIMAL(12,2) NOT NULL DEFAULT 0,
      discount DECIMAL(12,2) NOT NULL DEFAULT 0,
      tax_percentage DECIMAL(5,2) NOT NULL DEFAULT 18.00,
      tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
      subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
      total DECIMAL(12,2) NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0
    )
  `;

  // 10. Payments
  await sql`
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      reference_number TEXT NOT NULL UNIQUE,
      invoice_id TEXT REFERENCES invoices(id) ON DELETE SET NULL,
      client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
      project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
      date DATE NOT NULL,
      amount DECIMAL(12,2) NOT NULL,
      currency TEXT NOT NULL DEFAULT 'INR',
      payment_method TEXT NOT NULL,
      transaction_id TEXT,
      bank_reference TEXT,
      notes TEXT,
      proof_url TEXT,
      recorded_by TEXT,
      status TEXT NOT NULL DEFAULT 'Completed', -- Completed, Reversed, Failed
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  // 11. Audit Logs
  await sql`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      user_email TEXT,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      previous_values JSONB,
      new_values JSONB,
      ip_address TEXT,
      user_agent TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  // Seed default company settings so billing works out of the box
  await sql`
    INSERT INTO company_settings (
      id, brand_name, legal_name, email, phone, website, country,
      default_currency, default_tax_rate, financial_year_start_month,
      quotation_prefix, invoice_prefix, receipt_prefix, default_quotation_validity,
      default_payment_terms, default_terms
    ) VALUES (
      'main', 'EVOLW', 'EVOLW', 'hello@evolw.in', '+91 92092 50725', 'https://www.evolw.in', 'India',
      'INR', 18.00, 4,
      'EVOLW-QTN-', 'EVOLW-INV-', 'EVOLW-REC-', 30,
      '50% advance, balance on delivery',
      'This quotation is valid for the period stated. Prices are in INR unless otherwise noted. GST as applicable.'
    )
    ON CONFLICT (id) DO NOTHING
  `;

  await Promise.all([
    sql`CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status)`,
    sql`CREATE INDEX IF NOT EXISTS idx_quotations_client ON quotations(client_id)`,
    sql`CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status)`,
    sql`CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id)`,
    sql`CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status)`,
    sql`CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id)`,
  ]);
}
