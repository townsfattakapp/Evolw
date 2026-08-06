import { Plus, Trash2 } from "lucide-react";
import { formatMoney } from "../../lib/billing";

export type BillingLineItem = {
  name: string;
  description: string;
  hsn_sac: string;
  quantity: number;
  rate: number;
  discount: number;
  tax_percentage: number;
  unit: string;
};

export function emptyBillingLineItem(): BillingLineItem {
  return {
    name: "",
    description: "",
    hsn_sac: "",
    quantity: 1,
    rate: 0,
    discount: 0,
    tax_percentage: 18,
    unit: "Item",
  };
}

type Props = {
  items: BillingLineItem[];
  currency?: string;
  locked?: boolean;
  onChange: (items: BillingLineItem[]) => void;
};

function lineAmount(item: BillingLineItem) {
  return Math.max(0, item.quantity * item.rate - (item.discount || 0));
}

export function LineItemsEditor({ items, currency = "INR", locked, onChange }: Props) {
  const update = (index: number, patch: Partial<BillingLineItem>) => {
    const next = items.map((item, i) => (i === index ? { ...item, ...patch } : item));
    onChange(next);
  };

  const remove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white dark:bg-evolw-slate rounded-2xl p-5 sm:p-6 border border-evolw-gray-200 dark:border-white/10 shadow-sm space-y-5 text-evolw-black dark:text-white">
      <div>
        <h2 className="font-bold text-lg tracking-tight">What are you charging for?</h2>
        <p className="text-sm text-evolw-gray-500 dark:text-evolw-gray-400 mt-1 leading-relaxed">
          Add each service or product as a separate row. Example: “Website Development” × 1 × ₹50,000.
          Amount for a row = Quantity × Unit price.
        </p>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => {
          const amount = lineAmount(item);
          return (
            <div
              key={index}
              className="rounded-2xl border border-evolw-gray-200 dark:border-white/10 bg-evolw-gray-50/70 dark:bg-black/20 p-4 sm:p-5 space-y-4"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-evolw-gray-500">
                  Item {index + 1}
                </p>
                <p className="text-sm font-semibold text-evolw-accent tabular-nums">
                  {formatMoney(amount, currency)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Service / product name <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  disabled={locked}
                  value={item.name}
                  onChange={(e) => update(index, { name: e.target.value })}
                  placeholder="e.g. Website Development, Mobile App, Consulting (40 hrs)"
                  className="w-full px-3.5 py-2.5 text-sm border border-evolw-gray-200 dark:border-white/10 rounded-xl dark:bg-evolw-black outline-none focus:ring-2 focus:ring-evolw-accent"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-evolw-gray-500 mb-1.5">
                    Quantity <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    disabled={locked}
                    value={item.quantity}
                    onChange={(e) => update(index, { quantity: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2.5 text-sm border border-evolw-gray-200 dark:border-white/10 rounded-xl dark:bg-evolw-black outline-none focus:ring-2 focus:ring-evolw-accent"
                  />
                  <p className="text-[11px] text-evolw-gray-400 mt-1">How many</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-evolw-gray-500 mb-1.5">Unit</label>
                  <select
                    disabled={locked}
                    value={item.unit}
                    onChange={(e) => update(index, { unit: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm border border-evolw-gray-200 dark:border-white/10 rounded-xl dark:bg-evolw-black outline-none focus:ring-2 focus:ring-evolw-accent"
                  >
                    {["Item", "Hour", "Day", "Month", "Project", "License"].map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-evolw-gray-400 mt-1">Unit type</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-evolw-gray-500 mb-1.5">
                    Unit price (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    disabled={locked}
                    value={item.rate}
                    onChange={(e) => update(index, { rate: parseFloat(e.target.value) || 0 })}
                    placeholder="50000"
                    className="w-full px-3 py-2.5 text-sm border border-evolw-gray-200 dark:border-white/10 rounded-xl dark:bg-evolw-black outline-none focus:ring-2 focus:ring-evolw-accent"
                  />
                  <p className="text-[11px] text-evolw-gray-400 mt-1">Price per unit</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-evolw-gray-500 mb-1.5">Tax %</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    disabled={locked}
                    value={item.tax_percentage}
                    onChange={(e) => update(index, { tax_percentage: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2.5 text-sm border border-evolw-gray-200 dark:border-white/10 rounded-xl dark:bg-evolw-black outline-none focus:ring-2 focus:ring-evolw-accent"
                  />
                  <p className="text-[11px] text-evolw-gray-400 mt-1">Usually 18</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-evolw-gray-500 mb-1.5">
                    HSN / SAC{" "}
                    <span className="font-normal text-evolw-gray-400">(for GST invoices)</span>
                  </label>
                  <input
                    disabled={locked}
                    value={item.hsn_sac}
                    onChange={(e) => update(index, { hsn_sac: e.target.value })}
                    placeholder="e.g. 998314"
                    className="w-full px-3.5 py-2.5 text-sm border border-evolw-gray-200 dark:border-white/10 rounded-xl dark:bg-evolw-black outline-none focus:ring-2 focus:ring-evolw-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-evolw-gray-500 mb-1.5">
                    Details <span className="font-normal text-evolw-gray-400">(optional)</span>
                  </label>
                  <input
                    disabled={locked}
                    value={item.description}
                    onChange={(e) => update(index, { description: e.target.value })}
                    placeholder="Scope note for the client"
                    className="w-full px-3.5 py-2.5 text-sm border border-evolw-gray-200 dark:border-white/10 rounded-xl dark:bg-evolw-black outline-none focus:ring-2 focus:ring-evolw-accent"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-evolw-gray-200 dark:border-white/10">
                <p className="text-xs text-evolw-gray-500">
                  {item.quantity || 0} × {formatMoney(item.rate || 0, currency)}
                  {item.discount > 0 ? ` − discount ${formatMoney(item.discount, currency)}` : ""} ={" "}
                  <span className="font-semibold text-evolw-black dark:text-white">
                    {formatMoney(amount, currency)}
                  </span>
                </p>
                {!locked && items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-rose-600 hover:text-rose-700 self-start sm:self-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove item
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!locked && (
        <button
          type="button"
          onClick={() => onChange([...items, emptyBillingLineItem()])}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-evolw-accent border border-evolw-accent/30 hover:bg-evolw-accent/5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add another item
        </button>
      )}
    </div>
  );
}
