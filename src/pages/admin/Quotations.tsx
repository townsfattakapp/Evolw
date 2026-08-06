import { useState } from "react";
import { Plus, Search, Loader2, FileSpreadsheet, FileOutput } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { api, ApiError } from "../../lib/api";
import { formatMoney, formatDate, docStatusClass } from "../../lib/billing";
import useSWR, { useSWRConfig } from "swr";

export function Quotations() {
  const navigate = useNavigate();
  const { mutate } = useSWRConfig();
  const [search, setSearch] = useState("");
  const [convertingId, setConvertingId] = useState<string | null>(null);

  const { data: quotations = [], isLoading: loading } = useSWR(
    "billing:quotations",
    () => api.getQuotations() as Promise<any[]>,
    {
      onError: (err) => {
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          navigate("/admin");
        }
      },
    }
  );

  const convert = async (id: string) => {
    if (!confirm("Convert this quotation to a draft invoice?")) return;
    try {
      setConvertingId(id);
      await api.updateQuotationStatus(id, "Approved");
      const result = await api.convertQuotationToInvoice(id);
      mutate("billing:quotations");
      navigate(`/admin/invoices/${result.id}`);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Conversion failed");
    } finally {
      setConvertingId(null);
    }
  };

  const list = Array.isArray(quotations) ? quotations : [];
  const filtered = list.filter(
    (q: any) =>
      q.quotation_number?.toLowerCase().includes(search.toLowerCase()) ||
      q.client_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 text-evolw-black dark:text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Quotations</h1>
        <Link
          to="/admin/quotations/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-evolw-accent text-white rounded-xl hover:bg-evolw-accent/90 shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Create Quotation</span>
        </Link>
      </div>

      <div className="bg-white dark:bg-evolw-slate rounded-2xl border border-evolw-gray-200 dark:border-white/10 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-evolw-gray-200 dark:border-white/10">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-evolw-gray-400" />
            <input
              type="text"
              placeholder="Search quotations..."
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
            <FileSpreadsheet className="w-8 h-8 text-evolw-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-1">No quotations found</h3>
            <p className="text-evolw-gray-500 text-sm">Create a client first, then add a quotation.</p>
          </div>
        ) : (
          <>
            <div className="md:hidden divide-y divide-evolw-gray-100 dark:divide-white/10">
              {filtered.map((qtn: any) => (
                <div key={qtn.id} className="p-4 space-y-2">
                  <Link to={`/admin/quotations/${qtn.id}`} className="font-semibold text-evolw-accent">
                    {qtn.quotation_number}
                  </Link>
                  <p className="font-medium">{qtn.client_name}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span>{formatMoney(qtn.grand_total, qtn.currency)}</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${docStatusClass(qtn.status)}`}>
                      {qtn.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-evolw-gray-50 dark:bg-white/5 text-evolw-gray-600 dark:text-evolw-gray-300 font-semibold text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Number</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-evolw-gray-200 dark:divide-white/10 text-evolw-black dark:text-white">
                  {filtered.map((qtn: any) => (
                    <tr key={qtn.id} className="hover:bg-evolw-gray-50/50 dark:hover:bg-white/5">
                      <td className="px-6 py-4 font-medium text-evolw-accent">
                        <Link to={`/admin/quotations/${qtn.id}`} className="hover:underline">
                          {qtn.quotation_number}
                        </Link>
                      </td>
                      <td className="px-6 py-4 font-medium">{qtn.client_name}</td>
                      <td className="px-6 py-4 text-evolw-gray-600 dark:text-evolw-gray-300">
                        {formatDate(qtn.date)}
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {formatMoney(qtn.grand_total, qtn.currency)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${docStatusClass(qtn.status)}`}>
                          {qtn.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {qtn.status !== "Converted" && (
                          <button
                            onClick={() => convert(qtn.id)}
                            disabled={convertingId === qtn.id}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:underline disabled:opacity-50"
                          >
                            {convertingId === qtn.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <FileOutput className="w-3.5 h-3.5" />
                            )}
                            Convert
                          </button>
                        )}
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
