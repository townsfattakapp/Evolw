import { useState, useEffect, useMemo } from "react";
import { Search, Download, Filter, Trash2, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api, ApiError, type Lead } from "../../lib/api";

type LoadState = "loading" | "ready" | "empty" | "auth" | "error";

export function AdminContacts() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchLeads = async () => {
    setLoadState("loading");
    setErrorMessage(null);
    try {
      const data = await api.getLeads();
      setLeads(data);
      setLoadState(data.length === 0 ? "empty" : "ready");
    } catch (error) {
      console.error("[admin/contacts] Failed to load leads", error);
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        setLoadState("auth");
        navigate("/admin");
        return;
      }
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : error instanceof Error && error.message.includes("Network")
            ? "Network error. Please check your connection."
            : "Server error while loading contacts."
      );
      setLoadState("error");
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const updateLeadStatus = async (lead: Lead, newStatus: string) => {
    try {
      await api.updateLeadStatus(lead.id, newStatus);
      fetchLeads();
    } catch (error) {
      console.error("[admin/contacts] Failed to update status", error);
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        navigate("/admin");
        return;
      }
      alert(error instanceof ApiError ? error.message : "Failed to update status");
    }
  };

  const deleteLead = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead? This cannot be undone.")) return;
    try {
      await api.deleteLead(id);
      fetchLeads();
    } catch (error) {
      console.error("[admin/contacts] Failed to delete lead", error);
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        navigate("/admin");
        return;
      }
      alert(error instanceof ApiError ? error.message : "Failed to delete lead");
    }
  };

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lead.company && lead.company.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesFilter =
        statusFilter === "All" ||
        lead.status === statusFilter ||
        lead.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesFilter;
    });
  }, [leads, searchQuery, statusFilter]);

  const exportToCSV = () => {
    if (filteredLeads.length === 0) {
      alert("No leads to export.");
      return;
    }

    const headers = ["Date", "Name", "Email", "Phone", "Company", "Subject", "Service", "Status", "Message"];
    const csvRows = [headers.join(",")];

    for (const lead of filteredLeads) {
      const values = [
        `"${lead.date || lead.createdAt || ""}"`,
        `"${(lead.name || "").replace(/"/g, '""')}"`,
        `"${(lead.email || "").replace(/"/g, '""')}"`,
        `"${(lead.phone || "").replace(/"/g, '""')}"`,
        `"${(lead.company || "").replace(/"/g, '""')}"`,
        `"${(lead.subject || "").replace(/"/g, '""')}"`,
        `"${(lead.service || "").replace(/"/g, '""')}"`,
        `"${(lead.status || "").replace(/"/g, '""')}"`,
        `"${(lead.message || "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
      ];
      csvRows.push(values.join(","));
    }

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `evolw-leads-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusLabel = (status: string) => {
    const s = status.toLowerCase();
    if (s === "new") return "new";
    if (s === "read" || s === "contacted") return "read";
    return "resolved";
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-evolw-black dark:text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-evolw-black dark:text-white">Form Leads</h2>
          <p className="text-evolw-gray-500 dark:text-evolw-gray-400 mt-1 text-sm sm:text-base">Manage and respond to website contact submissions.</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={fetchLeads}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-white dark:bg-evolw-slate border border-evolw-gray-200 dark:border-white/10 hover:bg-evolw-gray-50 dark:hover:bg-white/5 transition-colors text-evolw-black dark:text-white"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={exportToCSV}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-evolw-accent text-white hover:bg-blue-600 transition-colors shadow-sm shadow-evolw-accent/20"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-evolw-slate rounded-2xl sm:rounded-3xl border border-evolw-gray-200 dark:border-white/10 overflow-hidden shadow-sm">
        <div className="p-4 sm:p-6 border-b border-evolw-gray-200 dark:border-white/10 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 sm:gap-4 bg-evolw-gray-50/50 dark:bg-white/5">
          <div className="relative w-full max-w-md">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-evolw-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl text-sm bg-white dark:bg-evolw-black border border-evolw-gray-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-evolw-accent transition-all text-evolw-black dark:text-white"
            />
          </div>

          <div className="relative w-full md:w-auto">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="w-full md:w-auto flex items-center justify-center space-x-2 px-4 py-3 rounded-xl text-sm font-semibold bg-white dark:bg-evolw-black border border-evolw-gray-200 dark:border-white/10 hover:bg-evolw-gray-50 dark:hover:bg-white/5 transition-colors shadow-sm text-evolw-black dark:text-white"
            >
              <Filter className="w-4 h-4" />
              <span>Status: {statusFilter}</span>
            </button>

            {isFilterOpen && (
              <div className="absolute left-0 md:left-auto md:right-0 mt-2 w-full md:w-48 bg-white dark:bg-evolw-black border border-evolw-gray-200 dark:border-white/10 rounded-xl shadow-lg z-10 overflow-hidden">
                <div className="py-1">
                  {["All", "new", "read", "resolved"].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status);
                        setIsFilterOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-evolw-gray-50 dark:hover:bg-white/5 text-evolw-black dark:text-white ${
                        statusFilter === status
                          ? "font-bold text-evolw-accent bg-blue-50 dark:bg-blue-900/20"
                          : ""
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="min-h-[280px]">
          {loadState === "loading" && (
            <div className="p-8 sm:p-12 text-center text-evolw-gray-500 dark:text-evolw-gray-400">Loading contact submissions…</div>
          )}

          {loadState === "error" && (
            <div className="p-8 sm:p-12 text-center">
              <p className="text-red-600 dark:text-red-400 font-medium mb-4">
                {errorMessage || "Failed to load contacts."}
              </p>
              <button
                onClick={fetchLeads}
                className="px-5 py-2.5 rounded-xl bg-evolw-accent text-white text-sm font-semibold"
              >
                Retry
              </button>
            </div>
          )}

          {loadState === "empty" && (
            <div className="p-8 sm:p-12 text-center text-evolw-gray-500 dark:text-evolw-gray-400">
              No leads have been submitted yet.
            </div>
          )}

          {(loadState === "ready" || (loadState !== "loading" && loadState !== "error" && loadState !== "empty")) &&
            filteredLeads.length === 0 &&
            leads.length > 0 && (
              <div className="p-8 sm:p-12 text-center text-evolw-gray-500 dark:text-evolw-gray-400">
                No leads match your search and filter criteria.
              </div>
            )}

          {/* Mobile cards */}
          {filteredLeads.length > 0 && (
            <div className="md:hidden divide-y divide-evolw-gray-100 dark:divide-white/10">
              {filteredLeads.map((lead) => {
                const status = statusLabel(String(lead.status || "new"));
                return (
                  <div key={lead.id} className="p-4 space-y-3">
                    <div className="flex justify-between items-start gap-3">
                      <div className="min-w-0">
                        <p className="font-bold text-evolw-black dark:text-white truncate">{lead.name}</p>
                        <p className="text-sm text-evolw-gray-500 dark:text-evolw-gray-400 truncate">{lead.company || "—"}</p>
                        <p className="text-xs text-evolw-gray-400 mt-1">{lead.date || lead.createdAt?.split("T")[0]}</p>
                      </div>
                      <button
                        onClick={() => deleteLead(lead.id)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-evolw-gray-400 hover:text-red-500 shrink-0"
                        title="Delete Lead"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-sm text-evolw-black dark:text-white break-all">{lead.email}</div>
                    <div className="text-xs text-evolw-gray-500 dark:text-evolw-gray-400 font-mono">{lead.phone || "No phone"}</div>
                    <span className="inline-block text-xs font-medium bg-evolw-gray-100 dark:bg-white/10 px-2.5 py-1 rounded-lg text-evolw-black dark:text-white">
                      {lead.subject || lead.service || "General"}
                    </span>
                    <p
                      className={`text-sm text-evolw-gray-600 dark:text-evolw-gray-400 ${
                        expandedMessageId === lead.id ? "" : "line-clamp-2"
                      }`}
                      onClick={() =>
                        setExpandedMessageId(expandedMessageId === lead.id ? null : lead.id)
                      }
                    >
                      {lead.message || "No message provided."}
                    </p>
                    <select
                      value={status}
                      onChange={(e) => updateLeadStatus(lead, e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider appearance-none cursor-pointer outline-none border-0 ${
                        status === "new"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
                          : status === "read"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                            : "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                      }`}
                    >
                      <option value="new">New</option>
                      <option value="read">Read</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                );
              })}
            </div>
          )}

          {/* Desktop table */}
          {filteredLeads.length > 0 && (
            <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-white dark:bg-evolw-slate text-sm uppercase tracking-wider text-evolw-gray-500 dark:text-evolw-gray-400 border-b border-evolw-gray-200 dark:border-white/10">
                  <th className="px-6 lg:px-8 py-4 font-semibold">Lead Information</th>
                  <th className="px-6 lg:px-8 py-4 font-semibold">Contact Details</th>
                  <th className="px-6 lg:px-8 py-4 font-semibold">Subject / Service</th>
                  <th className="px-6 lg:px-8 py-4 font-semibold">Message</th>
                  <th className="px-6 lg:px-8 py-4 font-semibold">Status</th>
                  <th className="px-6 lg:px-8 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-evolw-gray-100 dark:divide-white/10">
                {filteredLeads.map((lead) => {
                  const status = statusLabel(String(lead.status || "new"));
                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-evolw-gray-50/80 dark:hover:bg-white/5 transition-colors group"
                    >
                      <td className="px-6 lg:px-8 py-5">
                        <p className="font-bold text-base text-evolw-black dark:text-white">{lead.name}</p>
                        <p className="text-sm text-evolw-gray-500 dark:text-evolw-gray-400">{lead.company}</p>
                        <p className="text-xs text-evolw-gray-400 mt-1">
                          {lead.date || lead.createdAt?.split("T")[0]}
                        </p>
                      </td>
                      <td className="px-6 lg:px-8 py-5">
                        <div className="flex flex-col space-y-1">
                          <span className="text-sm font-medium text-evolw-black dark:text-white">{lead.email}</span>
                          <span className="text-xs text-evolw-gray-500 dark:text-evolw-gray-400 font-mono">
                            {lead.phone || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 lg:px-8 py-5">
                        <span className="text-sm font-medium bg-evolw-gray-100 dark:bg-white/10 px-3 py-1.5 rounded-lg text-evolw-black dark:text-white">
                          {lead.subject || lead.service || "General"}
                        </span>
                      </td>
                      <td className="px-6 lg:px-8 py-5 max-w-xs">
                        <div
                          className="cursor-pointer group/msg relative"
                          onClick={() =>
                            setExpandedMessageId(
                              expandedMessageId === lead.id ? null : lead.id
                            )
                          }
                        >
                          <p
                            className={`text-sm text-evolw-gray-600 dark:text-evolw-gray-400 ${
                              expandedMessageId === lead.id ? "whitespace-normal" : "truncate"
                            } transition-all`}
                          >
                            {lead.message || "No message provided."}
                          </p>
                          {expandedMessageId !== lead.id &&
                            (lead.message?.length || 0) > 40 && (
                              <span className="text-xs text-evolw-accent opacity-0 group-hover/msg:opacity-100 transition-opacity mt-1 inline-block">
                                Click to read more
                              </span>
                            )}
                        </div>
                      </td>
                      <td className="px-6 lg:px-8 py-5">
                        <select
                          value={status}
                          onChange={(e) => updateLeadStatus(lead, e.target.value)}
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider appearance-none cursor-pointer outline-none ${
                            status === "new"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
                              : status === "read"
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                                : "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                          }`}
                        >
                          <option value="new">New</option>
                          <option value="read">Read</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </td>
                      <td className="px-6 lg:px-8 py-5 text-right">
                        <button
                          onClick={() => deleteLead(lead.id)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors text-evolw-gray-400 hover:text-red-500"
                          title="Delete Lead"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
