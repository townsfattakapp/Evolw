import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Save, Loader2, Building } from "lucide-react";
import { api, ApiError } from "../../lib/api";

export function BillingSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [settings, setSettings] = useState<any>({
    brand_name: "EVOLW",
    legal_name: "EVOLW",
    email: "hello@evolw.in",
    phone: "",
    address: "",
    gstin: "",
    pan: "",
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    upi_id: "",
    quotation_prefix: "EVOLW-QTN-",
    invoice_prefix: "EVOLW-INV-",
    receipt_prefix: "EVOLW-REC-",
    default_payment_terms: "",
    default_tax_rate: 18,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await api.getBillingSettings();
      setSettings((prev: any) => ({ ...prev, ...data }));
    } catch (err: any) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        navigate("/admin");
        return;
      }
      setError(err.message || "Failed to fetch settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await api.saveBillingSettings(settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings((prev: any) => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-evolw-accent" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-evolw-black dark:text-white">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Company & Billing Settings</h1>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 bg-evolw-accent text-white rounded-xl hover:bg-evolw-accent/90 disabled:opacity-50 transition-colors shadow-md shadow-evolw-accent/20"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span className="font-medium">Save Settings</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-900/40">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl border border-green-200 dark:border-green-900/40">
          Settings saved successfully.
        </div>
      )}

      <form className="space-y-8" onSubmit={handleSubmit}>
        <div className="bg-white dark:bg-evolw-slate rounded-2xl border border-evolw-gray-200 dark:border-white/10 p-6 shadow-sm">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
            <Building className="w-5 h-5 text-evolw-gray-500" />
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Brand Name</label>
              <input name="brand_name" value={settings.brand_name || ""} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-evolw-gray-200 dark:border-white/10 bg-evolw-gray-50 dark:bg-black/20 focus:ring-2 focus:ring-evolw-accent outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Legal Company Name</label>
              <input name="legal_name" value={settings.legal_name || ""} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-evolw-gray-200 dark:border-white/10 bg-evolw-gray-50 dark:bg-black/20 focus:ring-2 focus:ring-evolw-accent outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input type="email" name="email" value={settings.email || ""} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-evolw-gray-200 dark:border-white/10 bg-evolw-gray-50 dark:bg-black/20 focus:ring-2 focus:ring-evolw-accent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <input name="phone" value={settings.phone || ""} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-evolw-gray-200 dark:border-white/10 bg-evolw-gray-50 dark:bg-black/20 focus:ring-2 focus:ring-evolw-accent outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Address</label>
              <textarea name="address" value={settings.address || ""} onChange={handleChange} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-evolw-gray-200 dark:border-white/10 bg-evolw-gray-50 dark:bg-black/20 focus:ring-2 focus:ring-evolw-accent outline-none resize-none" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-evolw-slate rounded-2xl border border-evolw-gray-200 dark:border-white/10 p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-6">Tax & Registration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">GSTIN</label>
              <input name="gstin" value={settings.gstin || ""} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-evolw-gray-200 dark:border-white/10 bg-evolw-gray-50 dark:bg-black/20 focus:ring-2 focus:ring-evolw-accent outline-none" placeholder="e.g. 29AAAAA0000A1Z5" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">PAN Number</label>
              <input name="pan" value={settings.pan || ""} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-evolw-gray-200 dark:border-white/10 bg-evolw-gray-50 dark:bg-black/20 focus:ring-2 focus:ring-evolw-accent outline-none" placeholder="e.g. AAAAA0000A" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Default Tax Rate (%)</label>
              <input type="number" name="default_tax_rate" value={settings.default_tax_rate ?? 18} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-evolw-gray-200 dark:border-white/10 bg-evolw-gray-50 dark:bg-black/20 focus:ring-2 focus:ring-evolw-accent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Default Payment Terms</label>
              <input name="default_payment_terms" value={settings.default_payment_terms || ""} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-evolw-gray-200 dark:border-white/10 bg-evolw-gray-50 dark:bg-black/20 focus:ring-2 focus:ring-evolw-accent outline-none" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-evolw-slate rounded-2xl border border-evolw-gray-200 dark:border-white/10 p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-6">Document Prefixes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Quotation</label>
              <input name="quotation_prefix" value={settings.quotation_prefix || ""} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-evolw-gray-200 dark:border-white/10 bg-evolw-gray-50 dark:bg-black/20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Invoice</label>
              <input name="invoice_prefix" value={settings.invoice_prefix || ""} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-evolw-gray-200 dark:border-white/10 bg-evolw-gray-50 dark:bg-black/20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Receipt</label>
              <input name="receipt_prefix" value={settings.receipt_prefix || ""} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-evolw-gray-200 dark:border-white/10 bg-evolw-gray-50 dark:bg-black/20 outline-none" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-evolw-slate rounded-2xl border border-evolw-gray-200 dark:border-white/10 p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-6">Bank Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Bank Name</label>
              <input name="bank_name" value={settings.bank_name || ""} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-evolw-gray-200 dark:border-white/10 bg-evolw-gray-50 dark:bg-black/20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Account Number</label>
              <input name="account_number" value={settings.account_number || ""} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-evolw-gray-200 dark:border-white/10 bg-evolw-gray-50 dark:bg-black/20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">IFSC Code</label>
              <input name="ifsc_code" value={settings.ifsc_code || ""} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-evolw-gray-200 dark:border-white/10 bg-evolw-gray-50 dark:bg-black/20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">UPI ID</label>
              <input name="upi_id" value={settings.upi_id || ""} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-evolw-gray-200 dark:border-white/10 bg-evolw-gray-50 dark:bg-black/20 outline-none" />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
