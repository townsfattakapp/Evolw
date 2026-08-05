import { useState, useEffect, useMemo } from "react";
import { Search, Download, Filter, Trash2, RefreshCw, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api, ApiError, type Application } from "../../lib/api";

type LoadState = "loading" | "ready" | "empty" | "auth" | "error";

const STATUS_OPTIONS = ["new", "reviewing", "shortlisted", "rejected", "hired"] as const;

export function AdminApplications() {
  const navigate = useNavigate();
  const [apps, setApps] = useState<Application[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchApps = async () => {
    setLoadState("loading");
    setErrorMessage(null);
    try {
      const data = await api.getApplications();
      setApps(data);
      setLoadState(data.length === 0 ? "empty" : "ready");
    } catch (error) {
      console.error("[admin/applications] Failed to load", error);
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        setLoadState("auth");
        navigate("/admin");
        return;
      }
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "Server error while loading applications."
      );
      setLoadState("error");
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const updateAppStatus = async (app: Application, newStatus: string) => {
    try {
      await api.updateApplicationStatus(app.id, newStatus);
      fetchApps();
    } catch (error) {
      console.error("[admin/applications] Failed to update status", error);
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        navigate("/admin");
        return;
      }
      alert(error instanceof ApiError ? error.message : "Failed to update status");
    }
  };

  const deleteApp = async (id: string) => {
    if (!confirm("Are you sure you want to delete this application? This cannot be undone.")) return;
    try {
      await api.deleteApplication(id);
      fetchApps();
    } catch (error) {
      console.error("[admin/applications] Failed to delete", error);
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        navigate("/admin");
        return;
      }
      alert(error instanceof ApiError ? error.message : "Failed to delete application");
    }
  };

  const filteredApps = useMemo(() => {
    return apps.filter((app) => {
      const matchesSearch =
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (app.jobTitle || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        statusFilter === "All" ||
        app.status === statusFilter ||
        app.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesFilter;
    });
  }, [apps, searchQuery, statusFilter]);

  const exportToCSV = () => {
    if (filteredApps.length === 0) {
      alert("No applications to export.");
      return;
    }

    const headers = [
      "Date",
      "Name",
      "Email",
      "Phone",
      "Job Title",
      "Job ID",
      "Experience",
      "Skills",
      "LinkedIn",
      "Portfolio",
      "Resume",
      "Status",
      "Cover Letter",
    ];
    const csvRows = [headers.join(",")];

    for (const app of filteredApps) {
      const values = [
        `"${app.date || app.createdAt || ""}"`,
        `"${(app.name || "").replace(/"/g, '""')}"`,
        `"${(app.email || "").replace(/"/g, '""')}"`,
        `"${(app.phone || "").replace(/"/g, '""')}"`,
        `"${(app.jobTitle || "").replace(/"/g, '""')}"`,
        `"${(app.jobId || "").replace(/"/g, '""')}"`,
        `"${(app.experience || "").replace(/"/g, '""')}"`,
        `"${(app.skills || "").replace(/"/g, '""')}"`,
        `"${(app.linkedin || "").replace(/"/g, '""')}"`,
        `"${(app.portfolio || "").replace(/"/g, '""')}"`,
        `"${(app.resumeName || app.resumeUrl || "").replace(/"/g, '""')}"`,
        `"${(app.status || "").replace(/"/g, '""')}"`,
        `"${(app.message || "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
      ];
      csvRows.push(values.join(","));
    }

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `evolw-job-applications-${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusClass = (status: string) => {
    const s = status.toLowerCase();
    if (s === "new") return "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400";
    if (s === "reviewing") return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400";
    if (s === "shortlisted") return "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400";
    if (s === "hired") return "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400";
    return "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400";
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-evolw-black dark:text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-evolw-black dark:text-white">Job Applications</h2>
          <p className="text-evolw-gray-500 dark:text-evolw-gray-400 mt-1 text-sm sm:text-base">Review candidates and manage the hiring pipeline.</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={fetchApps}
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
              placeholder="Search by name, email, or role..."
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
                  {["All", ...STATUS_OPTIONS].map((status) => (
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
            <div className="p-8 sm:p-12 text-center text-evolw-gray-500 dark:text-evolw-gray-400">Loading applications…</div>
          )}

          {loadState === "error" && (
            <div className="p-8 sm:p-12 text-center">
              <p className="text-red-600 dark:text-red-400 font-medium mb-4">
                {errorMessage || "Failed to load applications."}
              </p>
              <button
                onClick={fetchApps}
                className="px-5 py-2.5 rounded-xl bg-evolw-accent text-white text-sm font-semibold"
              >
                Retry
              </button>
            </div>
          )}

          {loadState === "empty" && (
            <div className="p-8 sm:p-12 text-center text-evolw-gray-500 dark:text-evolw-gray-400">
              No job applications have been submitted yet.
            </div>
          )}

          {apps.length > 0 && filteredApps.length === 0 && (
            <div className="p-8 sm:p-12 text-center text-evolw-gray-500 dark:text-evolw-gray-400">
              No applications match your search and filter criteria.
            </div>
          )}

          {filteredApps.length > 0 && (
            <div className="md:hidden divide-y divide-evolw-gray-100 dark:divide-white/10">
              {filteredApps.map((app) => {
                const status = String(app.status || "new").toLowerCase();
                return (
                  <div key={app.id} className="p-4 space-y-3">
                    <div className="flex justify-between items-start gap-3">
                      <div 
                        className="min-w-0 flex-1 cursor-pointer group"
                        onClick={() => navigate(`/admin/applications/${app.id}`, { state: { app } })}
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-evolw-black dark:text-white truncate group-hover:text-evolw-accent transition-colors">{app.name}</p>
                          <ChevronRight className="w-4 h-4 text-evolw-gray-400 group-hover:text-evolw-accent transition-colors" />
                        </div>
                        <p className="text-sm text-evolw-gray-500 dark:text-evolw-gray-400 truncate">{app.email}</p>
                        <p className="text-xs text-evolw-gray-400 mt-1">{app.date || app.createdAt?.split("T")[0]}</p>
                      </div>
                      <button
                        onClick={() => deleteApp(app.id)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-evolw-gray-400 hover:text-red-500 shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="inline-block text-xs font-medium bg-evolw-gray-100 dark:bg-white/10 px-2.5 py-1 rounded-lg">
                      {app.jobTitle || "Unknown role"}
                    </span>
                    <select
                      value={STATUS_OPTIONS.includes(status as (typeof STATUS_OPTIONS)[number]) ? status : "new"}
                      onChange={(e) => updateAppStatus(app, e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider appearance-none cursor-pointer outline-none ${statusClass(status)}`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          )}

          {filteredApps.length > 0 && (
            <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-white dark:bg-evolw-slate text-sm uppercase tracking-wider text-evolw-gray-500 dark:text-evolw-gray-400 border-b border-evolw-gray-200 dark:border-white/10">
                  <th className="px-6 lg:px-8 py-4 font-semibold">Applicant</th>
                  <th className="px-6 lg:px-8 py-4 font-semibold">Role & Date</th>
                  <th className="px-6 lg:px-8 py-4 font-semibold">Status</th>
                  <th className="px-6 lg:px-8 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-evolw-gray-100 dark:divide-white/10">
                {filteredApps.map((app) => {
                  const status = String(app.status || "new").toLowerCase();
                  return (
                    <tr
                      key={app.id}
                      className="hover:bg-evolw-gray-50/80 dark:hover:bg-white/5 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/admin/applications/${app.id}`, { state: { app } })}
                    >
                      <td className="px-6 lg:px-8 py-5">
                        <p className="font-bold text-base text-evolw-black dark:text-white group-hover:text-evolw-accent transition-colors">{app.name}</p>
                        <p className="text-sm text-evolw-gray-500 dark:text-evolw-gray-400">{app.email}</p>
                        <p className="text-xs text-evolw-gray-400 font-mono mt-1">
                          {app.phone || "No phone"}
                        </p>
                      </td>
                      <td className="px-6 lg:px-8 py-5">
                        <span className="text-sm font-medium bg-evolw-gray-100 dark:bg-white/10 px-3 py-1.5 rounded-lg border border-evolw-gray-200 dark:border-white/10 shadow-sm text-evolw-black dark:text-white">
                          {app.jobTitle || "Unknown role"}
                        </span>
                        <p className="text-xs text-evolw-gray-500 mt-3">
                          Applied: {app.date || app.createdAt?.split("T")[0]}
                        </p>
                      </td>
                      <td className="px-6 lg:px-8 py-5" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={STATUS_OPTIONS.includes(status as (typeof STATUS_OPTIONS)[number]) ? status : "new"}
                          onChange={(e) => updateAppStatus(app, e.target.value)}
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider appearance-none cursor-pointer outline-none shadow-sm ${statusClass(status)}`}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 lg:px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteApp(app.id);
                            }}
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors text-evolw-gray-400 hover:text-red-500"
                            title="Delete Application"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                          <ChevronRight className="w-5 h-5 text-evolw-gray-300 group-hover:text-evolw-accent transition-colors" />
                        </div>
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
