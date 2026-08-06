import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, Loader2, Building2, Edit2, Trash2 } from "lucide-react";
import { api, ApiError } from "../../lib/api";
import useSWR, { useSWRConfig } from "swr";

export function Clients() {
  const navigate = useNavigate();
  const { mutate } = useSWRConfig();
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const { data: clients = [], isLoading: loading } = useSWR(
    "billing:clients",
    () => api.getClients() as Promise<any[]>,
    {
      onError: (err) => {
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          navigate("/admin");
        }
        console.error(err);
      },
    }
  );

  const filteredClients = (Array.isArray(clients) ? clients : []).filter(
    (c: any) =>
      c.company_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenModal = (client?: any) => {
    if (client) setFormData(client);
    else setFormData({ status: "Active" });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({});
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.saveClient({
        ...formData,
        company_name: formData.company_name,
        email: formData.email,
      });
      handleCloseModal();
      await mutate("billing:clients");
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Error saving client");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this client?")) return;
    try {
      const result = await api.deleteClient(id);
      if (result.message) alert(result.message);
      await mutate("billing:clients");
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-evolw-black dark:text-white">Clients</h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-evolw-accent text-white rounded-xl hover:bg-evolw-accent/90 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Add Client</span>
        </button>
      </div>

      <div className="bg-white dark:bg-evolw-slate rounded-2xl border border-evolw-gray-200 dark:border-white/10 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-evolw-gray-200 dark:border-white/10">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-evolw-gray-400" />
            <input
              type="text"
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-evolw-gray-50 dark:bg-black/20 border border-evolw-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-evolw-accent outline-none transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-evolw-accent" />
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center p-12">
            <div className="w-16 h-16 bg-evolw-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-evolw-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-evolw-gray-900 dark:text-white mb-1">No clients found</h3>
            <p className="text-evolw-gray-500">Get started by creating your first client.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-evolw-gray-50 dark:bg-white/5 text-evolw-gray-600 dark:text-evolw-gray-300 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Contact Person</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-evolw-gray-200 dark:divide-white/10 text-evolw-black dark:text-white">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-evolw-gray-50/50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium text-evolw-black dark:text-white">
                      <Link to={`/admin/clients/${client.id}`} className="hover:text-evolw-accent hover:underline">
                        {client.company_name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-evolw-gray-600 dark:text-evolw-gray-300">
                      {client.contact_person || '-'}
                    </td>
                    <td className="px-6 py-4 text-evolw-gray-600 dark:text-evolw-gray-300">
                      {client.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        client.status === 'Active' ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-500/30 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-400/40' :
                        client.status === 'Inactive' ? 'bg-amber-100 text-amber-950 dark:bg-amber-500/30 dark:text-amber-200 border border-amber-300 dark:border-amber-400/40' :
                        'bg-evolw-gray-200 text-evolw-gray-800 dark:bg-white/15 dark:text-white border border-evolw-gray-300 dark:border-white/20'
                      }`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleOpenModal(client)} className="p-2 text-evolw-gray-400 hover:text-evolw-accent transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(client.id)} className="p-2 text-evolw-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-evolw-slate rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6 border-b border-evolw-gray-200 dark:border-white/10 flex justify-between items-center sticky top-0 bg-white dark:bg-evolw-slate z-10">
              <h2 className="text-xl font-bold">{formData.id ? 'Edit Client' : 'Add Client'}</h2>
              <button onClick={handleCloseModal} className="p-2 hover:bg-evolw-gray-100 dark:hover:bg-white/10 rounded-xl">
                ✕
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Company Name *</label>
                  <input
                    required
                    value={formData.company_name || ''}
                    onChange={e => setFormData({...formData, company_name: e.target.value})}
                    className="w-full px-4 py-2 border rounded-xl dark:border-white/10 dark:bg-black/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Contact Person</label>
                  <input
                    value={formData.contact_person || ''}
                    onChange={e => setFormData({...formData, contact_person: e.target.value})}
                    className="w-full px-4 py-2 border rounded-xl dark:border-white/10 dark:bg-black/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email || ''}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-2 border rounded-xl dark:border-white/10 dark:bg-black/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <input
                    value={formData.phone || ''}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-2 border rounded-xl dark:border-white/10 dark:bg-black/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">GSTIN</label>
                  <input
                    value={formData.gstin || ''}
                    onChange={e => setFormData({...formData, gstin: e.target.value})}
                    className="w-full px-4 py-2 border rounded-xl dark:border-white/10 dark:bg-black/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    value={formData.status || 'Active'}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-2 border rounded-xl dark:border-white/10 dark:bg-black/20"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-2">Billing Address</label>
                  <textarea
                    value={formData.billing_address || ''}
                    onChange={e => setFormData({...formData, billing_address: e.target.value})}
                    className="w-full px-4 py-2 border rounded-xl dark:border-white/10 dark:bg-black/20"
                    rows={2}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-evolw-gray-200 dark:border-white/10">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 font-medium hover:bg-evolw-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-evolw-accent text-white font-medium rounded-xl hover:bg-evolw-accent/90 transition-colors disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
