import { Users, TrendingUp, Activity, MessageSquare, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export function AdminDashboard() {
  const [leadCount, setLeadCount] = useState(0);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/leads')
      .then(res => res.json())
      .then(data => {
        setLeadCount(data.length || 0);
        setRecentLeads((data || []).slice(0, 3));
      })
      .catch(console.error);
  }, []);

  const stats = [
    { label: "Total Form Leads", value: leadCount.toString(), change: "Live", icon: MessageSquare },
    { label: "Platform Status", value: "Active", change: "Online", icon: Activity },
    { label: "System Uptime", value: "99.9%", change: "Stable", icon: TrendingUp },
    { label: "Team Size", value: "Growing", change: "Hiring", icon: Users },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-evolw-accent to-blue-600 rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2 text-white">Welcome back to the Command Center</h2>
          <p className="text-blue-100 max-w-xl text-lg">
            Manage your platform, review leads, generate offer letters and certificates — all from here.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-evolw-gray-900 p-6 rounded-3xl border border-evolw-gray-200 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
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
      <div className="bg-white dark:bg-evolw-gray-900 p-8 rounded-3xl border border-evolw-gray-200 dark:border-white/5 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <h3 className="font-bold text-xl text-evolw-black dark:text-white">Recent Lead Activity</h3>
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
              <div key={i} className="flex items-center space-x-5 p-5 rounded-2xl border border-evolw-gray-100 dark:border-white/5 hover:bg-evolw-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-evolw-accent border border-blue-100 dark:border-blue-800/30">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-lg text-evolw-black dark:text-white">{lead.name}</p>
                  <p className="text-sm text-evolw-gray-500 dark:text-evolw-gray-400">{lead.company} • {lead.service}</p>
                </div>
                <div className="text-sm font-medium text-evolw-gray-400 dark:text-evolw-gray-500 bg-evolw-gray-100 dark:bg-white/5 px-3 py-1 rounded-full">
                  {lead.date}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
