import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Save, Loader2, ArrowLeft, FileOutput, Eye } from "lucide-react";
import { api, ApiError } from "../../lib/api";
import { estimateDocumentTotals, formatMoney } from "../../lib/billing";
import {
  LineItemsEditor,
  emptyBillingLineItem,
  type BillingLineItem,
} from "../../components/admin/LineItemsEditor";
import useSWR from "swr";
import { PDFPreviewModal } from "../../components/admin/PDFPreviewModal";
import { QuotationPDF } from "../../components/pdf/QuotationPDF";

export function QuotationEditor() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isNew = !id || id === "new";

  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [converting, setConverting] = useState(false);
  const [quotationNumber, setQuotationNumber] = useState<string | null>(null);
  const [status, setStatus] = useState("Draft");
  const [showPreview, setShowPreview] = useState(false);
  const [savedTotals, setSavedTotals] = useState<any>(null);
  const [snapshots, setSnapshots] = useState<{ client?: any; company?: any }>({});

  const { data: settings } = useSWR("billing:settings", () => api.getBillingSettings());

  const [formData, setFormData] = useState({
    client_id: "",
    project_id: "",
    date: new Date().toISOString().split("T")[0],
    valid_until: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    currency: "INR",
    place_of_supply: "",
    subject: "",
    payment_terms: "",
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
        const qtn = await api.getQuotations(id);
        setQuotationNumber(qtn.quotation_number);
        setStatus(qtn.status || "Draft");
        setSavedTotals({
          subtotal: Number(qtn.subtotal) || 0,
          overall_discount_amount: Number(qtn.overall_discount_amount) || 0,
          cgst_amount: Number(qtn.cgst_amount) || 0,
          sgst_amount: Number(qtn.sgst_amount) || 0,
          igst_amount: Number(qtn.igst_amount) || 0,
          total_tax: Number(qtn.total_tax) || 0,
          adjustment: Number(qtn.adjustment) || 0,
          grand_total: Number(qtn.grand_total) || 0,
        });
        setSnapshots({
          client: qtn.client_snapshot || undefined,
          company: qtn.company_snapshot || undefined,
        });
        setFormData({
          client_id: qtn.client_id || "",
          project_id: qtn.project_id || "",
          date: String(qtn.date || "").slice(0, 10),
          valid_until: String(qtn.valid_until || "").slice(0, 10),
          currency: qtn.currency || "INR",
          place_of_supply: qtn.place_of_supply || "",
          subject: qtn.subject || "",
          payment_terms: qtn.payment_terms || "",
          terms_conditions: qtn.terms_conditions || "",
          tax_type: qtn.tax_type || "CGST_SGST",
          discount_type: qtn.discount_type || "PERCENTAGE",
          discount_value: Number(qtn.discount_value) || 0,
          adjustment: Number(qtn.adjustment) || 0,
          items:
            Array.isArray(qtn.items) && qtn.items.length
              ? qtn.items.map((item: any) => ({
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
        if (qtn.client_id) await loadProjects(qtn.client_id);
      } else {
        try {
          const s = await api.getBillingSettings();
          setFormData((prev) => ({
            ...prev,
            payment_terms: s.default_payment_terms ? String(s.default_payment_terms) : prev.payment_terms,
            terms_conditions: s.default_terms ? String(s.default_terms) : prev.terms_conditions,
            place_of_supply: s.state ? String(s.state) : prev.place_of_supply,
            valid_until: s.default_quotation_validity
              ? new Date(Date.now() + (Number(s.default_quotation_validity) || 30) * 86400000)
                  .toISOString()
                  .split("T")[0]
              : prev.valid_until,
          }));
        } catch {
          /* settings optional */
        }
      }
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        navigate("/admin");
        return;
      }
      alert(err instanceof ApiError ? err.message : "Failed to load quotation");
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async (clientId: string) => {
    if (!clientId) {
      setProjects([]);
      return;
    }
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

  const locked = status === "Converted";

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
      const result = await api.saveQuotation({
        ...(isNew ? {} : { id }),
        ...formData,
        status,
      });
      if (isNew) navigate(`/admin/quotations/${result.id}`);
      else {
        alert("Quotation saved");
        load();
      }
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleConvert = async () => {
    if (!id || locked) return;
    if (!confirm("Convert this quotation into a draft invoice?")) return;
    setConverting(true);
    try {
      await api.updateQuotationStatus(id, "Approved");
      const result = await api.convertQuotationToInvoice(id);
      navigate(`/admin/invoices/${result.id}`);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Conversion failed");
    } finally {
      setConverting(false);
    }
  };

  const pdfDoc = {
    ...formData,
    quotation_number: quotationNumber,
    client_name: selectedClient?.company_name || "Client",
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
    items: formData.items.map((item) => ({
      ...item,
      total: Math.max(0, item.quantity * item.rate - (item.discount || 0)),
    })),
    ...(savedTotals || preview),
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
            <Link to="/admin/quotations" className="p-2 hover:bg-evolw-gray-100 dark:hover:bg-white/10 rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {isNew ? "New Quotation" : quotationNumber || "Edit Quotation"}
              </h1>
              {!isNew && <p className="text-sm text-evolw-gray-500">Status: {status}</p>}
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
            {!isNew && !locked && (
              <button
                type="button"
                onClick={handleConvert}
                disabled={converting}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 disabled:opacity-50"
              >
                {converting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileOutput className="w-4 h-4" />}
                Convert to Invoice
              </button>
            )}
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
                    <option value="">Optional project...</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Date *</label>
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
                  <label className="block text-sm font-medium mb-2">Valid Until *</label>
                  <input
                    type="date"
                    required
                    disabled={locked}
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
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
                  <label className="block text-sm font-medium mb-2">Payment Terms</label>
                  <input
                    disabled={locked}
                    value={formData.payment_terms}
                    onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                    className="w-full px-4 py-2.5 border rounded-xl dark:border-white/10 dark:bg-black/20"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-2">Subject</label>
                  <input
                    disabled={locked}
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2.5 border rounded-xl dark:border-white/10 dark:bg-black/20"
                    placeholder="e.g. Website redesign proposal"
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
                    placeholder="Shown on the PDF"
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
                {!isNew && (
                  <div>
                    <label className="block text-xs text-evolw-gray-500 mb-1">Status</label>
                    <select
                      disabled={locked}
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg dark:border-white/10 dark:bg-black/20"
                    >
                      {["Draft", "Sent", "Viewed", "Approved", "Rejected", "Expired", "Cancelled"].map((s) => (
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
                {preview.overall_discount_amount > 0 && (
                  <div className="flex justify-between text-evolw-gray-500">
                    <span>Discount</span>
                    <span>− {formatMoney(preview.overall_discount_amount, formData.currency)}</span>
                  </div>
                )}
                {preview.total_tax > 0 && (
                  <div className="flex justify-between text-evolw-gray-500">
                    <span>Tax</span>
                    <span>{formatMoney(preview.total_tax, formData.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-3 border-t border-evolw-gray-200 dark:border-white/10">
                  <span>Est. Total</span>
                  <span>{formatMoney(preview.grand_total, formData.currency)}</span>
                </div>
                <p className="text-xs text-evolw-gray-400">Server recalculates exact GST on save.</p>
              </div>
              {!locked && (
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full flex justify-center items-center gap-2 px-4 py-3 bg-evolw-accent text-white font-medium rounded-xl hover:bg-evolw-accent/90 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Save Quotation
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {showPreview && settings && (
        <PDFPreviewModal
          title={`Quotation ${quotationNumber || "Draft"}`}
          fileName={`${quotationNumber || "quotation"}.pdf`}
          document={<QuotationPDF quotation={pdfDoc} companySettings={settings} />}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
}
