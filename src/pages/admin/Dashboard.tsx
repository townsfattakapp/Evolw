import { Users, TrendingUp, Activity, MessageSquare, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { api, ApiError, type Lead } from "../../lib/api";

export function AdminDashboard() {
  const navigate = useNavigate();
  const [leadCount, setLeadCount] = useState(0);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getLeads()
      .then((data) => {
        setLeadCount(data.length || 0);
        setRecentLeads((data || []).slice(0, 3));
      })
      .catch((err) => {
        console.error("[admin/dashboard] Failed to load leads", err);
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          navigate("/admin");
          return;
        }
        setError(err instanceof ApiError ? err.message : "Failed to load dashboard data");
      });
  }, [navigate]);

  const stats = [
    { label: "Total Form Leads", value: leadCount.toString(), change: "Live", icon: MessageSquare },
    { label: "Platform Status", value: "Active", change: "Online", icon: Activity },
    { label: "System Uptime", value: "99.9%", change: "Stable", icon: TrendingUp },
    { label: "Team Size", value: "Growing", change: "Hiring", icon: Users },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto text-evolw-black dark:text-white">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-evolw-accent to-blue-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-white">Welcome back to the Command Center</h2>
          <p className="text-blue-100 max-w-xl text-base sm:text-lg">
            Manage your platform, review leads, generate offer letters and certificates — all from here.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-evolw-slate p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-evolw-gray-200 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-evolw-gray-50 dark:bg-white/5 rounded-xl border border-evolw-gray-100 dark:border-white/5">
                <stat.icon className="w-6 h-6 text-evolw-accent" />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-evolw-accent/10 text-evolw-accent">
                {stat.change}
              </span>
            </div>
            <h3 className="text-3xl font-bold mb-1 tracking-tight text-evolw-black dark:text-white">{stat.value}</h3>
            <p className="text-evolw-gray-500 dark:text-evolw-gray-400 font-medium text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Activity Section */}
      <div className="bg-white dark:bg-evolw-slate p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-evolw-gray-200 dark:border-white/10 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 sm:mb-8">
          <h3 className="font-bold text-lg sm:text-xl text-evolw-black dark:text-white">Recent Lead Activity</h3>
          <Link to="/admin/contacts" className="text-evolw-accent font-medium hover:underline flex items-center text-sm">
            View All <ArrowRight className="ml-1 w-4 h-4" />
          </Link>
        </div>
        {recentLeads.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare className="w-10 h-10 text-evolw-gray-300 dark:text-evolw-gray-700 mx-auto mb-4" />
            <p className="text-evolw-gray-500 dark:text-evolw-gray-400 font-medium">No leads yet. They will appear here when someone submits the contact form.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentLeads.map((lead, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 p-4 sm:p-5 rounded-2xl border border-evolw-gray-100 dark:border-white/10 hover:bg-evolw-gray-50 dark:hover:bg-white/5 transition-colors">
                <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-evolw-accent border border-blue-100 dark:border-blue-800/30 shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-base sm:text-lg text-evolw-black dark:text-white truncate">{lead.name}</p>
                  <p className="text-sm text-evolw-gray-500 dark:text-evolw-gray-400 truncate">{lead.company} • {lead.service || lead.subject}</p>
                </div>
                <div className="text-sm font-medium text-evolw-gray-400 dark:text-evolw-gray-500 bg-evolw-gray-100 dark:bg-white/5 px-3 py-1 rounded-full w-fit">
                  {lead.date || lead.createdAt?.split("T")[0]}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
