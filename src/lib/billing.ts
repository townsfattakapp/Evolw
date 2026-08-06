export function formatMoney(amount: number | string | null | undefined, currency = 'INR') {
  const n = Number(amount) || 0;
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${currency} ${n.toLocaleString('en-IN')}`;
  }
}

export function formatDate(value?: string | null) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function relativeTime(value?: string | null) {
  if (!value) return '';
  const d = new Date(value);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(value);
}

export function docStatusClass(status: string) {
  const s = (status || '').toLowerCase();
  if (s === 'draft')
    return 'bg-evolw-gray-200 text-evolw-gray-800 dark:bg-white/15 dark:text-white border border-evolw-gray-300 dark:border-white/20';
  if (s === 'sent' || s === 'viewed')
    return 'bg-sky-100 text-sky-900 dark:bg-sky-500/30 dark:text-sky-200 border border-sky-300 dark:border-sky-400/40';
  if (s === 'approved' || s === 'paid' || s === 'completed' || s === 'active')
    return 'bg-emerald-100 text-emerald-900 dark:bg-emerald-500/30 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-400/40';
  if (s === 'partially paid' || s === 'inactive')
    return 'bg-amber-100 text-amber-950 dark:bg-amber-500/30 dark:text-amber-200 border border-amber-300 dark:border-amber-400/40';
  if (s === 'converted')
    return 'bg-violet-100 text-violet-950 dark:bg-violet-500/30 dark:text-violet-200 border border-violet-300 dark:border-violet-400/40';
  if (s === 'rejected' || s === 'cancelled' || s === 'overdue' || s === 'expired' || s === 'archived') {
    return 'bg-rose-100 text-rose-950 dark:bg-rose-500/30 dark:text-rose-200 border border-rose-300 dark:border-rose-400/40';
  }
  return 'bg-evolw-gray-200 text-evolw-gray-800 dark:bg-white/15 dark:text-white border border-evolw-gray-300 dark:border-white/20';
}

/** Live estimate for PDF preview (server still authoritative on save). */
export function estimateDocumentTotals(input: {
  items: Array<{ quantity: number; rate: number; discount?: number; tax_percentage?: number }>;
  tax_type: string;
  discount_type: string;
  discount_value: number;
  adjustment?: number;
}) {
  let subtotal = 0;
  let itemsTaxable = 0;
  let itemsTax = 0;

  for (const item of input.items) {
    const lineSub = Math.max(0, item.quantity * item.rate - (item.discount || 0));
    subtotal += item.quantity * item.rate;
    itemsTaxable += lineSub;
    itemsTax += lineSub * ((item.tax_percentage ?? 18) / 100);
  }

  let overallDiscount = 0;
  if (input.discount_type === 'PERCENTAGE') {
    overallDiscount = itemsTaxable * (input.discount_value / 100);
  } else {
    overallDiscount = input.discount_value || 0;
  }
  overallDiscount = Math.min(overallDiscount, itemsTaxable);
  const taxable = itemsTaxable - overallDiscount;
  const factor = itemsTaxable > 0 ? taxable / itemsTaxable : 0;
  const totalTax = input.tax_type === 'NONE' ? 0 : itemsTax * factor;
  const cgst = input.tax_type === 'CGST_SGST' ? totalTax / 2 : 0;
  const sgst = input.tax_type === 'CGST_SGST' ? totalTax - cgst : 0;
  const igst = input.tax_type === 'IGST' ? totalTax : 0;
  const adjustment = input.adjustment || 0;
  const grand_total = taxable + totalTax + adjustment;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    overall_discount_amount: Math.round(overallDiscount * 100) / 100,
    taxable_amount: Math.round(taxable * 100) / 100,
    cgst_amount: Math.round(cgst * 100) / 100,
    sgst_amount: Math.round(sgst * 100) / 100,
    igst_amount: Math.round(igst * 100) / 100,
    total_tax: Math.round(totalTax * 100) / 100,
    adjustment,
    grand_total: Math.round(grand_total * 100) / 100,
    total: Math.round(grand_total * 100) / 100,
  };
}

