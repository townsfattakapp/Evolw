import { useState, useEffect, useMemo } from "react";
import { Search, Download, Filter, Trash2, ExternalLink, RefreshCw } from "lucide-react";
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
  const [expandedMsgId, setExpandedMsgId] = useState<string | null>(null);
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
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Job Applications</h2>
          <p className="text-evolw-gray-500 mt-1">Review candidates and manage the hiring pipeline.</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchApps}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-white dark:bg-evolw-black border border-evolw-gray-200 dark:border-white/10 hover:bg-evolw-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-evolw-accent text-white hover:bg-blue-600 transition-colors shadow-sm shadow-evolw-accent/20"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-evolw-slate rounded-3xl border border-evolw-gray-200 dark:border-white/5 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-evolw-gray-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-evolw-gray-50/50 dark:bg-white/5">
          <div className="relative w-full max-w-md">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-evolw-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl text-sm bg-white dark:bg-evolw-black border border-evolw-gray-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-evolw-accent transition-all"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center space-x-2 px-4 py-3 rounded-xl text-sm font-semibold bg-white dark:bg-evolw-black border border-evolw-gray-200 dark:border-white/10 hover:bg-evolw-gray-50 dark:hover:bg-white/5 transition-colors shadow-sm"
            >
              <Filter className="w-4 h-4" />
              <span>Status: {statusFilter}</span>
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-evolw-black border border-evolw-gray-200 dark:border-white/10 rounded-xl shadow-lg z-10 overflow-hidden">
                <div className="py-1">
                  {["All", ...STATUS_OPTIONS].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status);
                        setIsFilterOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-evolw-gray-50 dark:hover:bg-white/5 ${
                        statusFilter === status
                          ? "font-bold text-evolw-accent bg-blue-50 dark:bg-blue-900/10"
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

        <div className="overflow-x-auto min-h-[400px]">
          {loadState === "loading" && (
            <div className="p-12 text-center text-evolw-gray-500">Loading applications…</div>
          )}

          {loadState === "error" && (
            <div className="p-12 text-center">
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
            <div className="p-12 text-center text-evolw-gray-500">
              No job applications have been submitted yet.
            </div>
          )}

          {apps.length > 0 && filteredApps.length === 0 && (
            <div className="p-12 text-center text-evolw-gray-500">
              No applications match your search and filter criteria.
            </div>
          )}

          {filteredApps.length > 0 && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white dark:bg-evolw-slate text-sm uppercase tracking-wider text-evolw-gray-500 border-b border-evolw-gray-200 dark:border-white/5">
                  <th className="px-8 py-5 font-semibold">Applicant</th>
                  <th className="px-8 py-5 font-semibold">Role</th>
                  <th className="px-8 py-5 font-semibold">Experience / Skills</th>
                  <th className="px-8 py-5 font-semibold">Resume & Links</th>
                  <th className="px-8 py-5 font-semibold">Cover Letter</th>
                  <th className="px-8 py-5 font-semibold">Status</th>
                  <th className="px-8 py-5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-evolw-gray-100 dark:divide-white/5">
                {filteredApps.map((app) => {
                  const status = String(app.status || "new").toLowerCase();
                  return (
                    <tr
                      key={app.id}
                      className="hover:bg-evolw-gray-50/80 dark:hover:bg-white/5 transition-colors group"
                    >
                      <td className="px-8 py-6">
                        <p className="font-bold text-base">{app.name}</p>
                        <p className="text-sm text-evolw-gray-500">{app.email}</p>
                        <p className="text-xs text-evolw-gray-400 font-mono mt-1">
                          {app.phone || "No phone"}
                        </p>
                        <p className="text-xs text-evolw-gray-400 mt-1">
                          {app.date || app.createdAt?.split("T")[0]}
                        </p>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-sm font-medium bg-evolw-gray-100 dark:bg-white/10 px-3 py-1.5 rounded-lg border border-evolw-gray-200 dark:border-white/5 shadow-sm">
                          {app.jobTitle || "Unknown role"}
                        </span>
                        {app.jobId && (
                          <p className="text-xs text-evolw-gray-400 mt-2 font-mono">ID: {app.jobId}</p>
                        )}
                      </td>
                      <td className="px-8 py-6 max-w-xs">
                        <p className="text-sm font-medium">{app.experience || "—"}</p>
                        <p className="text-xs text-evolw-gray-500 mt-1">{app.skills || "No skills listed"}</p>
                      </td>
                      <td className="px-8 py-6 space-y-2">
                        {app.resumeUrl ? (
                          <a
                            href={app.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-sm font-medium text-evolw-accent hover:underline bg-evolw-accent/10 px-2 py-1 rounded-md w-fit mb-2"
                          >
                            <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                            {app.resumeName || "View Resume"}
                          </a>
                        ) : (
                          <span className="text-xs text-evolw-gray-400">No resume</span>
                        )}
                        {app.linkedin && app.linkedin !== "Not provided" && (
                          <a
                            href={app.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-sm font-medium text-blue-600 hover:underline"
                          >
                            <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                            LinkedIn
                          </a>
                        )}
                        {app.portfolio && (
                          <a
                            href={app.portfolio}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-sm font-medium text-evolw-gray-600 dark:text-gray-400 hover:underline"
                          >
                            <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                            Portfolio
                          </a>
                        )}
                      </td>
                      <td className="px-8 py-6 max-w-xs">
                        <div
                          className="cursor-pointer group/msg relative"
                          onClick={() =>
                            setExpandedMsgId(expandedMsgId === app.id ? null : app.id)
                          }
                        >
                          <p
                            className={`text-sm text-evolw-gray-600 dark:text-evolw-gray-400 ${
                              expandedMsgId === app.id ? "whitespace-normal" : "truncate"
                            } transition-all`}
                          >
                            {app.message || "No cover letter provided."}
                          </p>
                          {expandedMsgId !== app.id && (app.message?.length || 0) > 40 && (
                            <span className="text-xs text-evolw-accent opacity-0 group-hover/msg:opacity-100 transition-opacity mt-1 inline-block">
                              Click to expand
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6">
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
                      <td className="px-8 py-6 text-right">
                        <button
                          onClick={() => deleteApp(app.id)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors text-evolw-gray-400 hover:text-red-500"
                          title="Delete Application"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
