import { useState } from "react";
import { Plus, Search, Loader2, Receipt } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { api, ApiError } from "../../lib/api";
import { formatMoney, formatDate, docStatusClass } from "../../lib/billing";
import useSWR from "swr";

export function Invoices() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data: invoices = [], isLoading: loading } = useSWR(
    "/api/invoices",
    () => api.getInvoices(),
    {
      onError: (err) => {
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          navigate("/admin");
        }
      },
    }
  );

  const filtered = invoices.filter(
    (i) =>
      i.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
      i.client_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 text-evolw-black dark:text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
        <Link
          to="/admin/invoices/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-evolw-accent text-white rounded-xl hover:bg-evolw-accent/90 shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Create Invoice</span>
        </Link>
      </div>

      <div className="bg-white dark:bg-evolw-slate rounded-2xl border border-evolw-gray-200 dark:border-white/10 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-evolw-gray-200 dark:border-white/10">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-evolw-gray-400" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-evolw-gray-50 dark:bg-black/20 border border-evolw-gray-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-evolw-accent"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-evolw-accent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center p-12">
            <Receipt className="w-8 h-8 text-evolw-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-1">No invoices found</h3>
            <p className="text-sm text-evolw-gray-500">Create one or convert an approved quotation.</p>
          </div>
        ) : (
          <>
            <div className="md:hidden divide-y divide-evolw-gray-100 dark:divide-white/10">
              {filtered.map((inv) => (
                <Link key={inv.id} to={`/admin/invoices/${inv.id}`} className="block p-4 space-y-2">
                  <p className="font-semibold text-evolw-accent">{inv.invoice_number}</p>
                  <p className="font-medium">{inv.client_name}</p>
                  <div className="flex justify-between text-sm">
                    <span>{formatMoney(inv.grand_total, inv.currency)}</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${docStatusClass(inv.status)}`}>
                      {inv.status}
                    </span>
                  </div>
                  <p className="text-xs text-evolw-gray-500">
                    Balance {formatMoney(inv.balance_due, inv.currency)} · Due {formatDate(inv.due_date)}
                  </p>
                </Link>
              ))}
            </div>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-evolw-gray-50 dark:bg-white/5 text-evolw-gray-600 dark:text-evolw-gray-300 font-semibold text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Number</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Due Date</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Balance</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-evolw-gray-200 dark:divide-white/10 text-evolw-black dark:text-white">
                  {filtered.map((inv) => (
                    <tr
                      key={inv.id}
                      className="hover:bg-evolw-gray-50/50 dark:hover:bg-white/5 cursor-pointer"
                      onClick={() => navigate(`/admin/invoices/${inv.id}`)}
                    >
                      <td className="px-6 py-4 font-medium text-evolw-accent">{inv.invoice_number}</td>
                      <td className="px-6 py-4 font-medium">{inv.client_name}</td>
                      <td className="px-6 py-4">{formatDate(inv.due_date)}</td>
                      <td className="px-6 py-4">{formatMoney(inv.grand_total, inv.currency)}</td>
                      <td className="px-6 py-4">{formatMoney(inv.balance_due, inv.currency)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${docStatusClass(inv.status)}`}>
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
