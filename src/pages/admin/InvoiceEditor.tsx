import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Save, Loader2, ArrowLeft, Eye } from "lucide-react";
import { api, ApiError } from "../../lib/api";
import { estimateDocumentTotals, formatMoney } from "../../lib/billing";
import {
  LineItemsEditor,
  emptyBillingLineItem,
  type BillingLineItem,
} from "../../components/admin/LineItemsEditor";
import useSWR from "swr";
import { PDFPreviewModal } from "../../components/admin/PDFPreviewModal";
import { InvoicePDF } from "../../components/pdf/InvoicePDF";

export function InvoiceEditor() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isNew = !id || id === "new";

  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState<string | null>(null);
  const [status, setStatus] = useState("Draft");
  const [amountPaid, setAmountPaid] = useState(0);
  const [balanceDue, setBalanceDue] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [snapshots, setSnapshots] = useState<{ client?: any; company?: any }>({});

  const { data: settings } = useSWR("billing:settings", () => api.getBillingSettings());

  const [formData, setFormData] = useState({
    client_id: "",
    project_id: "",
    date: new Date().toISOString().split("T")[0],
    due_date: new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0],
    currency: "INR",
    place_of_supply: "",
    payment_terms: "",
    po_number: "",
    terms_conditions: "",
    tax_type: "CGST_SGST",
    discount_type: "PERCENTAGE",
    discount_value: 0,
    adjustment: 0,
    items: [emptyBillingLineItem()] as BillingLineItem[],
  });

  useEffect(() => {
    load();
  }, [id]);

  const load = async () => {
    try {
      setLoading(true);
      const clientData = await api.getClients();
      const list = Array.isArray(clientData) ? clientData : [];
      setClients(list.filter((c) => c.status !== "Archived"));

      if (!isNew && id) {
        const inv = await api.getInvoices(id);
        setInvoiceNumber(inv.invoice_number);
        setStatus(inv.status || "Draft");
        setAmountPaid(Number(inv.amount_paid) || 0);
        setBalanceDue(Number(inv.balance_due) || 0);
        setSnapshots({
          client: inv.client_snapshot || undefined,
          company: inv.company_snapshot || undefined,
        });
        setFormData({
          client_id: inv.client_id || "",
          project_id: inv.project_id || "",
          date: String(inv.date || "").slice(0, 10),
          due_date: String(inv.due_date || "").slice(0, 10),
          currency: inv.currency || "INR",
          place_of_supply: inv.place_of_supply || "",
          payment_terms: inv.payment_terms || "",
          po_number: inv.po_number || "",
          terms_conditions: inv.terms_conditions || "",
          tax_type: inv.tax_type || "CGST_SGST",
          discount_type: inv.discount_type || "PERCENTAGE",
          discount_value: Number(inv.discount_value) || 0,
          adjustment: Number(inv.adjustment) || 0,
          items:
            Array.isArray(inv.items) && inv.items.length
              ? inv.items.map((item: any) => ({
                  name: item.name || "",
                  description: item.description || "",
                  hsn_sac: item.hsn_sac || "",
                  quantity: Number(item.quantity) || 1,
                  rate: Number(item.rate) || 0,
                  discount: Number(item.discount) || 0,
                  tax_percentage: Number(item.tax_percentage) || 18,
                  unit: item.unit || "Item",
                }))
              : [emptyBillingLineItem()],
        });
        if (inv.client_id) await loadProjects(inv.client_id);
      } else {
        try {
          const s = await api.getBillingSettings();
          setFormData((prev) => ({
            ...prev,
            payment_terms: s.default_payment_terms ? String(s.default_payment_terms) : prev.payment_terms,
            terms_conditions: s.default_terms ? String(s.default_terms) : prev.terms_conditions,
            place_of_supply: s.state ? String(s.state) : prev.place_of_supply,
          }));
        } catch {
          /* optional */
        }
      }
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        navigate("/admin");
        return;
      }
      alert(err instanceof ApiError ? err.message : "Failed to load invoice");
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async (clientId: string) => {
    if (!clientId) return setProjects([]);
    try {
      const data = await api.getProjects({ client_id: clientId });
      setProjects(Array.isArray(data) ? data : []);
    } catch {
      setProjects([]);
    }
  };

  const selectedClient = clients.find((c) => c.id === formData.client_id);

  const preview = useMemo(
    () =>
      estimateDocumentTotals({
        items: formData.items,
        tax_type: formData.tax_type,
        discount_type: formData.discount_type,
        discount_value: formData.discount_value,
        adjustment: formData.adjustment,
      }),
    [formData]
  );

  const locked = ["Paid", "Cancelled", "Written Off"].includes(status);

  const handleClientChange = (client_id: string) => {
    const client = clients.find((c) => c.id === client_id);
    setFormData((prev) => ({
      ...prev,
      client_id,
      project_id: "",
      place_of_supply: client?.state || prev.place_of_supply || settings?.state || "",
    }));
    loadProjects(client_id);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (locked) return;
    setSaving(true);
    try {
      const result = await api.saveInvoice({
        ...(isNew ? {} : { id }),
        ...formData,
        status: ["Partially Paid", "Paid"].includes(status) ? status : status,
      });
      if (isNew) navigate(`/admin/invoices/${result.id}`);
      else {
        alert("Invoice saved");
        load();
      }
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const pdfDoc = {
    ...formData,
    invoice_number: invoiceNumber,
    client_name: selectedClient?.company_name || "Client",
    client_gstin: selectedClient?.gstin,
    client_snapshot: snapshots.client ||
      (selectedClient
        ? {
            company_name: selectedClient.company_name,
            contact_person: selectedClient.contact_person,
            email: selectedClient.email,
            phone: selectedClient.phone,
            gstin: selectedClient.gstin,
            billing_address: selectedClient.billing_address,
            city: selectedClient.city,
            state: selectedClient.state,
            country: selectedClient.country,
            pin_code: selectedClient.pin_code,
          }
        : undefined),
    company_snapshot: snapshots.company,
    amount_paid: amountPaid,
    balance_due: Math.max(0, preview.grand_total - amountPaid),
    items: formData.items.map((item) => ({
      ...item,
      total: Math.max(0, item.quantity * item.rate - (item.discount || 0)),
    })),
    ...preview,
  };

  if (loading) {
    return (
      <div className="p-12 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-evolw-accent" />
      </div>
    );
  }

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-6 pb-24 text-evolw-black dark:text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/admin/invoices" className="p-2 hover:bg-evolw-gray-100 dark:hover:bg-white/10 rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {isNew ? "New Invoice" : invoiceNumber || "Edit Invoice"}
              </h1>
              {!isNew && (
                <p className="text-sm text-evolw-gray-500">
                  {status} · Paid {formatMoney(amountPaid)} · Due {formatMoney(balanceDue)}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-evolw-slate border border-evolw-gray-200 dark:border-white/10 text-evolw-black dark:text-white text-sm font-semibold hover:bg-evolw-gray-50 dark:hover:bg-white/5"
            >
              <Eye className="w-4 h-4" />
              Preview PDF
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-evolw-slate rounded-2xl p-6 border border-evolw-gray-200 dark:border-white/10 shadow-sm space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Client *</label>
                  <select
                    required
                    disabled={locked}
                    value={formData.client_id}
                    onChange={(e) => handleClientChange(e.target.value)}
                    className="w-full px-4 py-2.5 border rounded-xl dark:border-white/10 dark:bg-black/20"
                  >
                    <option value="">Select a client...</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.company_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Project</label>
                  <select
                    disabled={locked || !formData.client_id}
                    value={formData.project_id}
                    onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                    className="w-full px-4 py-2.5 border rounded-xl dark:border-white/10 dark:bg-black/20"
                  >
                    <option value="">Optional...</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Invoice Date *</label>
                  <input
                    type="date"
                    required
                    disabled={locked}
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2.5 border rounded-xl dark:border-white/10 dark:bg-black/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Due Date *</label>
                  <input
                    type="date"
                    required
                    disabled={locked}
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full px-4 py-2.5 border rounded-xl dark:border-white/10 dark:bg-black/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Place of supply</label>
                  <input
                    disabled={locked}
                    value={formData.place_of_supply}
                    onChange={(e) => setFormData({ ...formData, place_of_supply: e.target.value })}
                    placeholder="e.g. Madhya Pradesh"
                    className="w-full px-4 py-2.5 border rounded-xl dark:border-white/10 dark:bg-black/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">PO Number</label>
                  <input
                    disabled={locked}
                    value={formData.po_number}
                    onChange={(e) => setFormData({ ...formData, po_number: e.target.value })}
                    className="w-full px-4 py-2.5 border rounded-xl dark:border-white/10 dark:bg-black/20"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-2">Payment Terms</label>
                  <input
                    disabled={locked}
                    value={formData.payment_terms}
                    onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                    className="w-full px-4 py-2.5 border rounded-xl dark:border-white/10 dark:bg-black/20"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-2">Terms & conditions</label>
                  <textarea
                    disabled={locked}
                    rows={3}
                    value={formData.terms_conditions}
                    onChange={(e) => setFormData({ ...formData, terms_conditions: e.target.value })}
                    className="w-full px-4 py-2.5 border rounded-xl dark:border-white/10 dark:bg-black/20 resize-none"
                  />
                </div>
              </div>
            </div>

            <LineItemsEditor
              items={formData.items}
              currency={formData.currency}
              locked={locked}
              onChange={(items) => setFormData({ ...formData, items })}
            />
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-evolw-slate rounded-2xl p-6 border border-evolw-gray-200 dark:border-white/10 shadow-sm sticky top-24 space-y-5">
              <h2 className="font-bold text-lg border-b border-evolw-gray-200 dark:border-white/10 pb-4">Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-evolw-gray-500">Subtotal</span>
                  <span>{formatMoney(preview.subtotal, formData.currency)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-evolw-gray-500 mb-1">Discount type</label>
                    <select
                      disabled={locked}
                      value={formData.discount_type}
                      onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg dark:border-white/10 dark:bg-black/20"
                    >
                      <option value="PERCENTAGE">%</option>
                      <option value="FIXED">Fixed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-evolw-gray-500 mb-1">Discount</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      disabled={locked}
                      value={formData.discount_value}
                      onChange={(e) =>
                        setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 border rounded-lg dark:border-white/10 dark:bg-black/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-evolw-gray-500 mb-1">Tax Type</label>
                  <select
                    disabled={locked}
                    value={formData.tax_type}
                    onChange={(e) => setFormData({ ...formData, tax_type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:border-white/10 dark:bg-black/20"
                  >
                    <option value="CGST_SGST">CGST + SGST</option>
                    <option value="IGST">IGST</option>
                    <option value="NONE">No Tax</option>
                  </select>
                </div>
                {!isNew && !["Partially Paid", "Paid"].includes(status) && (
                  <div>
                    <label className="block text-xs text-evolw-gray-500 mb-1">Status</label>
                    <select
                      disabled={locked}
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg dark:border-white/10 dark:bg-black/20"
                    >
                      {["Draft", "Sent", "Viewed", "Cancelled"].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-evolw-gray-400 mt-1">
                      Marking Sent freezes client & company details on the PDF.
                    </p>
                  </div>
                )}
                {preview.total_tax > 0 && (
                  <div className="flex justify-between text-evolw-gray-500">
                    <span>Tax</span>
                    <span>{formatMoney(preview.total_tax, formData.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-3 border-t border-evolw-gray-200 dark:border-white/10">
                  <span>Total</span>
                  <span>{formatMoney(preview.grand_total, formData.currency)}</span>
                </div>
              </div>
              {!locked && (
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full flex justify-center items-center gap-2 px-4 py-3 bg-evolw-accent text-white font-medium rounded-xl disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Save Invoice
                </button>
              )}
              {!isNew && balanceDue > 0 && status !== "Draft" && (
                <Link
                  to={`/admin/payments?invoice=${id}`}
                  className="block text-center text-sm font-semibold text-evolw-accent hover:underline"
                >
                  Record a payment →
                </Link>
              )}
            </div>
          </div>
        </form>
      </div>

      {showPreview && settings && (
        <PDFPreviewModal
          title={`Invoice ${invoiceNumber || "Draft"}`}
          fileName={`${invoiceNumber || "invoice"}.pdf`}
          document={<InvoicePDF invoice={pdfDoc} companySettings={settings} />}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
}
