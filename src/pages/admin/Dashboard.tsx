import { Users, TrendingUp, Activity, MessageSquare, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export function AdminDashboard() {
  const [leadCount, setLeadCount] = useState(0);

  useEffect(() => {
    fetch('/api/leads')
      .then(res => res.json())
      .then(data => setLeadCount(data.length || 0))
      .catch(console.error);
  }, []);

  const stats = [
    { label: "Total Form Leads", value: leadCount.toString(), change: "+14%", icon: MessageSquare },
    { label: "Site Visitors (30d)", value: "8,234", change: "+23%", icon: Users },
    { label: "Conversion Rate", value: "3.2%", change: "+1.2%", icon: TrendingUp },
    { label: "System Uptime", value: "99.9%", change: "0%", icon: Activity },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-evolw-accent to-blue-600 rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Welcome back to the Command Center</h2>
          <p className="text-blue-100 max-w-xl text-lg">
            Here's what's happening with your platform today. You have 3 new leads waiting for your response.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-evolw-slate p-6 rounded-3xl border border-evolw-gray-200 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-evolw-gray-50 dark:bg-white/5 rounded-xl border border-evolw-gray-100 dark:border-white/5">
                <stat.icon className="w-6 h-6 text-evolw-accent" />
              </div>
              <span className={`text-sm font-semibold px-2.5 py-1 rounded-full ${stat.change.startsWith("+") ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400" : "bg-evolw-gray-100 text-evolw-gray-600"}`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-4xl font-bold mb-1 tracking-tight">{stat.value}</h3>
            <p className="text-evolw-gray-500 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Activity Section */}
      <div className="bg-white dark:bg-evolw-slate p-8 rounded-3xl border border-evolw-gray-200 dark:border-white/5 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <h3 className="font-bold text-xl">Recent Lead Activity</h3>
          <Link to="/admin/contacts" className="text-evolw-accent font-medium hover:underline flex items-center">
            View All <ArrowRight className="ml-1 w-4 h-4" />
          </Link>
        </div>
        <div className="space-y-4">
          {[
            { name: "Rahul Sharma", company: "Tech Solutions", time: "2 hours ago" },
            { name: "Priya Patel", company: "Retail Connect", time: "5 hours ago" },
            { name: "Amit Kumar", company: "Startup Inc", time: "Yesterday" }
          ].map((lead, i) => (
            <div key={i} className="flex items-center space-x-5 p-5 rounded-2xl border border-evolw-gray-100 dark:border-white/5 hover:bg-evolw-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-evolw-accent border border-blue-100 dark:border-blue-800/30">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-lg">{lead.name}</p>
                <p className="text-sm text-evolw-gray-500">{lead.company}</p>
              </div>
              <div className="text-sm font-medium text-evolw-gray-400 bg-evolw-gray-100 dark:bg-white/5 px-3 py-1 rounded-full">
                {lead.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
