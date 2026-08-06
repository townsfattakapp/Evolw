/** Build immutable client/company snapshots for quotations & invoices. */

export type ClientSnapshot = {
  id: string;
  company_name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  gstin: string | null;
  pan: string | null;
  billing_address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  pin_code: string | null;
};

export type CompanySnapshot = {
  brand_name: string | null;
  legal_name: string | null;
  logo_url: string | null;
  address: string | null;
  billing_address: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  gstin: string | null;
  pan: string | null;
  state: string | null;
  state_code: string | null;
  country: string | null;
  pin_code: string | null;
  bank_name: string | null;
  account_holder: string | null;
  account_number: string | null;
  ifsc_code: string | null;
  branch: string | null;
  account_type: string | null;
  upi_id: string | null;
  default_terms: string | null;
};

const FREEZE_STATUSES = new Set([
  'Sent',
  'Viewed',
  'Approved',
  'Converted',
  'Partially Paid',
  'Paid',
  'Overdue',
]);

export function shouldFreezeSnapshots(status: string | null | undefined, existingSnapshot: unknown) {
  if (!status || !FREEZE_STATUSES.has(status)) return false;
  return existingSnapshot == null;
}

export function toClientSnapshot(row: Record<string, any> | null | undefined): ClientSnapshot | null {
  if (!row) return null;
  return {
    id: String(row.id),
    company_name: String(row.company_name || ''),
    contact_person: row.contact_person || null,
    email: row.email || null,
    phone: row.phone || null,
    gstin: row.gstin || null,
    pan: row.pan || null,
    billing_address: row.billing_address || null,
    city: row.city || null,
    state: row.state || null,
    country: row.country || null,
    pin_code: row.pin_code || null,
  };
}

export function toCompanySnapshot(row: Record<string, any> | null | undefined): CompanySnapshot | null {
  if (!row) return null;
  return {
    brand_name: row.brand_name || null,
    legal_name: row.legal_name || null,
    logo_url: row.logo_url || null,
    address: row.address || null,
    billing_address: row.billing_address || null,
    email: row.email || null,
    phone: row.phone || null,
    website: row.website || null,
    gstin: row.gstin || null,
    pan: row.pan || null,
    state: row.state || null,
    state_code: row.state_code || null,
    country: row.country || null,
    pin_code: row.pin_code || null,
    bank_name: row.bank_name || null,
    account_holder: row.account_holder || null,
    account_number: row.account_number || null,
    ifsc_code: row.ifsc_code || null,
    branch: row.branch || null,
    account_type: row.account_type || null,
    upi_id: row.upi_id || null,
    default_terms: row.default_terms || null,
  };
}

export async function loadSnapshots(
  sql: any,
  clientId: string
): Promise<{ client_snapshot: ClientSnapshot | null; company_snapshot: CompanySnapshot | null }> {
  const [clients, settings] = await Promise.all([
    sql`SELECT * FROM clients WHERE id = ${clientId} LIMIT 1`,
    sql`SELECT * FROM company_settings WHERE id = 'main' LIMIT 1`,
  ]);
  return {
    client_snapshot: toClientSnapshot(clients[0]),
    company_snapshot: toCompanySnapshot(settings[0]),
  };
}

export function snapshotJson(value: unknown) {
  return value == null ? null : JSON.stringify(value);
}
