import { StyleSheet } from '@react-pdf/renderer';

/** Shared EVOLW document PDF styles — clean black / blue professional look */
export const docStyles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 56,
    paddingHorizontal: 40,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#18181b',
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#2563eb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e4e7',
  },
  brand: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#09090b',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  brandSub: {
    fontSize: 8,
    color: '#71717a',
    lineHeight: 1.4,
    maxWidth: 220,
  },
  docTitle: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#2563eb',
    textAlign: 'right',
    marginBottom: 4,
  },
  docNumber: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#18181b',
    textAlign: 'right',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 2,
  },
  metaLabel: {
    width: 72,
    color: '#71717a',
    textAlign: 'right',
    marginRight: 8,
  },
  metaValue: {
    width: 90,
    textAlign: 'right',
    fontFamily: 'Helvetica-Bold',
  },
  parties: {
    flexDirection: 'row',
    marginBottom: 18,
    gap: 16,
  },
  partyBox: {
    flex: 1,
  },
  partyLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#2563eb',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  partyName: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 3,
  },
  partyLine: {
    fontSize: 8,
    color: '#3f3f46',
    lineHeight: 1.45,
  },
  subject: {
    marginBottom: 14,
    padding: 10,
    backgroundColor: '#f4f4f5',
    borderRadius: 2,
  },
  subjectLabel: {
    fontSize: 7,
    color: '#71717a',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  subjectText: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
  },
  table: {
    width: '100%',
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#09090b',
    color: '#ffffff',
    paddingVertical: 7,
    paddingHorizontal: 6,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 7,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e4e7',
    alignItems: 'flex-start',
  },
  tableRowAlt: {
    backgroundColor: '#fafafa',
  },
  th: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  td: {
    fontSize: 8,
    color: '#18181b',
  },
  tdMuted: {
    fontSize: 7,
    color: '#71717a',
    marginTop: 2,
  },
  colSl: { width: '5%' },
  colItem: { width: '32%' },
  colHsn: { width: '12%' },
  colQty: { width: '10%', textAlign: 'right' },
  colRate: { width: '13%', textAlign: 'right' },
  colTax: { width: '10%', textAlign: 'right' },
  colAmt: { width: '18%', textAlign: 'right' },
  totalsWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  bankBox: {
    width: '48%',
    padding: 10,
    backgroundColor: '#f4f4f5',
    borderRadius: 2,
  },
  bankTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#2563eb',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  summaryBox: {
    width: '46%',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  summaryLabel: {
    color: '#52525b',
    fontSize: 8,
  },
  summaryValue: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
  },
  grandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginTop: 4,
    borderTopWidth: 1.5,
    borderTopColor: '#09090b',
    borderBottomWidth: 1.5,
    borderBottomColor: '#09090b',
  },
  grandLabel: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
  },
  grandValue: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#2563eb',
  },
  terms: {
    marginTop: 8,
    marginBottom: 20,
  },
  termsTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#09090b',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  termsBody: {
    fontSize: 7.5,
    color: '#52525b',
    lineHeight: 1.5,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e4e4e7',
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: '#a1a1aa',
  },
});

export function formatInr(amount: number | string | null | undefined, currency = 'INR') {
  const n = Number(amount) || 0;
  const formatted = n.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currency === 'INR' ? `₹ ${formatted}` : `${currency} ${formatted}`;
}

export function formatDocDate(value?: string | null) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatAddress(parts: {
  billing_address?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pin_code?: string | null;
  country?: string | null;
}) {
  const lines: string[] = [];
  if (parts.billing_address || parts.address) lines.push(String(parts.billing_address || parts.address));
  const cityLine = [parts.city, parts.state, parts.pin_code].filter(Boolean).join(', ');
  if (cityLine) lines.push(cityLine);
  if (parts.country) lines.push(String(parts.country));
  return lines;
}

export function resolveCompany(doc: any, settings: any) {
  return doc?.company_snapshot || settings || {};
}

export function resolveClient(doc: any) {
  if (doc?.client_snapshot) return doc.client_snapshot;
  return {
    company_name: doc?.client_name || 'Client',
    contact_person: null,
    email: null,
    phone: null,
    gstin: doc?.client_gstin || null,
    billing_address: null,
    city: null,
    state: null,
    country: null,
    pin_code: null,
  };
}
