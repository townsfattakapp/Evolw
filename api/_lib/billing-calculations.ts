export function toFixed2(num: number): number {
  return Math.round(num * 100) / 100;
}

export interface LineItemInput {
  rate: number;
  quantity: number;
  discount: number; // absolute amount per item, or overall line discount? Typically rate * qty - discount. We'll treat it as total line discount.
  tax_percentage: number;
}

export function calculateLineItem(item: LineItemInput) {
  const subtotal = toFixed2(item.rate * item.quantity);
  // Prevent discount from exceeding subtotal
  const safeDiscount = Math.min(item.discount || 0, subtotal);
  const taxable_amount = toFixed2(subtotal - safeDiscount);
  const tax_amount = toFixed2(taxable_amount * (item.tax_percentage / 100));
  const total = toFixed2(taxable_amount + tax_amount);
  
  return {
    subtotal,
    discount: safeDiscount,
    taxable_amount,
    tax_amount,
    total
  };
}

export interface DocumentTotalsInput {
  items: LineItemInput[];
  tax_type: 'NONE' | 'IGST' | 'CGST_SGST';
  discount_type: 'PERCENTAGE' | 'FIXED';
  discount_value: number;
  adjustment: number;
}

export function calculateDocumentTotals(input: DocumentTotalsInput) {
  let subtotal = 0;
  let item_level_discount = 0;
  let items_taxable_amount = 0;
  let items_tax_amount = 0;

  for (const item of input.items) {
    const calc = calculateLineItem(item);
    subtotal += calc.subtotal;
    item_level_discount += calc.discount;
    items_taxable_amount += calc.taxable_amount;
    items_tax_amount += calc.tax_amount;
  }

  // We have a base taxable amount from items.
  // Now apply overall document discount.
  let overall_discount_amount = 0;
  if (input.discount_type === 'PERCENTAGE') {
    overall_discount_amount = toFixed2(items_taxable_amount * (input.discount_value / 100));
  } else {
    overall_discount_amount = toFixed2(input.discount_value || 0);
  }
  
  overall_discount_amount = Math.min(overall_discount_amount, items_taxable_amount);
  
  const final_taxable_amount = toFixed2(items_taxable_amount - overall_discount_amount);
  
  // Re-calculate tax proportionally if there's an overall discount
  // This is a simplified approach. Ideally tax is recalculated per line.
  // If there's an overall discount, the easiest compliant way is to just proportionally reduce total tax
  const tax_reduction_factor = items_taxable_amount > 0 ? final_taxable_amount / items_taxable_amount : 0;
  const total_tax = toFixed2(items_tax_amount * tax_reduction_factor);

  let cgst_amount = 0;
  let sgst_amount = 0;
  let igst_amount = 0;

  if (input.tax_type === 'CGST_SGST') {
    cgst_amount = toFixed2(total_tax / 2);
    sgst_amount = toFixed2(total_tax - cgst_amount);
  } else if (input.tax_type === 'IGST') {
    igst_amount = total_tax;
  }

  const grand_total = toFixed2(final_taxable_amount + total_tax + (input.adjustment || 0));

  return {
    subtotal: toFixed2(subtotal),
    overall_discount_amount,
    taxable_amount: final_taxable_amount,
    cgst_amount,
    sgst_amount,
    igst_amount,
    total_tax,
    adjustment: toFixed2(input.adjustment || 0),
    grand_total
  };
}
