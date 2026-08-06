import { useMemo, useState, useEffect } from "react";
import { Plus, Loader2, Wallet, X } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api, ApiError } from "../../lib/api";
import { formatMoney, formatDate } from "../../lib/billing";
import useSWR, { useSWRConfig } from "swr";

export function Payments() {
  const navigate = useNavigate();
  const { mutate } = useSWRConfig();
  const [searchParams] = useSearchParams();
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    invoice_id: searchParams.get("invoice") || "",
    amount: "",
    payment_method: "Bank Transfer",
    date: new Date().toISOString().split("T")[0],
    transaction_id: "",
    notes: "",
  });

  useEffect(() => {
    const inv = searchParams.get("invoice");
    if (inv) {
      setForm((f) => ({ ...f, invoice_id: inv }));
      setShowModal(true);
    }
  }, [searchParams]);

  const { data: payments = [], isLoading: loadingPayments } = useSWR(
    "billing:payments",
    () => api.getPayments() as Promise<any[]>,
    {
      onError: (err) => {
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          navigate("/admin");
        }
      },
    }
  );

  const { data: invoices = [], isLoading: loadingInvoices } = useSWR(
    "billing:invoices:open",
    () => api.getInvoices(undefined, { open: true }) as Promise<any[]>
  );

  const loading = loadingPayments || loadingInvoices;
  const invoiceList = Array.isArray(invoices) ? invoices : [];
  const paymentList = Array.isArray(payments) ? payments : [];

  const selectedInvoice = useMemo(
    () => invoiceList.find((i: any) => i.id === form.invoice_id) || null,
    [invoiceList, form.invoice_id]
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.recordPayment({
        invoice_id: form.invoice_id,
        amount: Number(form.amount),
        payment_method: form.payment_method,
        date: form.date,
        transaction_id: form.transaction_id || undefined,
        notes: form.notes || undefined,
      });
      setShowModal(false);
      setForm({
        invoice_id: "",
        amount: "",
        payment_method: "Bank Transfer",
        date: new Date().toISOString().split("T")[0],
        transaction_id: "",
        notes: "",
      });
      mutate("billing:payments");
      mutate("billing:invoices:open");
      mutate("billing:invoices");
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to record payment");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-evolw-black dark:text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-evolw-accent text-white rounded-xl hover:bg-evolw-accent/90 shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Record Payment</span>
        </button>
      </div>

      <div className="bg-white dark:bg-evolw-slate rounded-2xl border border-evolw-gray-200 dark:border-white/10 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-evolw-accent" />
          </div>
        ) : paymentList.length === 0 ? (
          <div className="text-center p-12">
            <Wallet className="w-8 h-8 text-evolw-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-1">No payments found</h3>
            <p className="text-sm text-evolw-gray-500">Record a payment against a sent invoice.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-evolw-gray-50 dark:bg-white/5 text-evolw-gray-600 dark:text-evolw-gray-300 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Ref Number</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Invoice</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-evolw-gray-200 dark:divide-white/10 text-evolw-black dark:text-white">
                {paymentList.map((p: any) => (
                  <tr key={p.id} className="hover:bg-evolw-gray-50/50 dark:hover:bg-white/5">
                    <td className="px-6 py-4 font-medium text-evolw-accent">{p.reference_number}</td>
                    <td className="px-6 py-4">{formatDate(p.date)}</td>
                    <td className="px-6 py-4">{p.client_name}</td>
                    <td className="px-6 py-4">{p.invoice_number || "—"}</td>
                    <td className="px-6 py-4 font-medium">{formatMoney(p.amount, p.currency)}</td>
                    <td className="px-6 py-4">{p.payment_method}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <button className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} aria-label="Close" />
          <form
            onSubmit={handleSave}
            className="relative z-10 w-full sm:max-w-lg bg-white dark:bg-evolw-slate rounded-t-2xl sm:rounded-2xl border border-evolw-gray-200 dark:border-white/10 p-6 space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Record Payment</h2>
              <button type="button" onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-evolw-gray-100 dark:hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Invoice *</label>
              <select
                required
                value={form.invoice_id}
                onChange={(e) => {
                  const inv = invoiceList.find((i: any) => i.id === e.target.value);
                  setForm({
                    ...form,
                    invoice_id: e.target.value,
                    amount: inv ? String(inv.balance_due) : "",
                  });
                }}
                className="w-full px-4 py-2.5 border rounded-xl dark:border-white/10 dark:bg-black/20"
              >
                <option value="">Select open invoice...</option>
                {invoiceList.map((inv: any) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoice_number} — {inv.client_name} (due {formatMoney(inv.balance_due, inv.currency)})
                  </option>
                ))}
              </select>
              {invoiceList.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">No open invoices. Mark an invoice as Sent first.</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5">Amount *</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  max={selectedInvoice ? Number(selectedInvoice.balance_due) : undefined}
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full px-4 py-2.5 border rounded-xl dark:border-white/10 dark:bg-black/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Date *</label>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-4 py-2.5 border rounded-xl dark:border-white/10 dark:bg-black/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Method *</label>
              <select
                required
                value={form.payment_method}
                onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                className="w-full px-4 py-2.5 border rounded-xl dark:border-white/10 dark:bg-black/20"
              >
                {["Bank Transfer", "UPI", "Cash", "Cheque", "Card", "Other"].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Transaction ID</label>
              <input
                value={form.transaction_id}
                onChange={(e) => setForm({ ...form, transaction_id: e.target.value })}
                className="w-full px-4 py-2.5 border rounded-xl dark:border-white/10 dark:bg-black/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                className="w-full px-4 py-2.5 border rounded-xl dark:border-white/10 dark:bg-black/20 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={saving || !form.invoice_id}
              className="w-full py-3 rounded-xl bg-evolw-accent text-white font-semibold disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              Save Payment
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
