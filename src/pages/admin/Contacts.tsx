import { useState, useEffect, useMemo } from "react";
import { Search, Download, Filter, Trash2 } from "lucide-react";

export function AdminContacts() {
  const [leads, setLeads] = useState<any[]>([]);
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(null);
  
  // Filter and Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/leads');
      if (response.ok) {
        const data = await response.json();
        setLeads(data);
      }
    } catch (error) {
      console.error("Failed to load leads", error);
    }
  };

  const updateLeadStatus = async (lead: any, newStatus: string) => {
    try {
      const updatedLead = { ...lead, status: newStatus };
      await fetch('/api/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedLead)
      });
      fetchLeads();
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const deleteLead = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead? This cannot be undone.")) return;
    try {
      await fetch('/api/leads', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      fetchLeads();
    } catch (error) {
      console.error("Failed to delete lead", error);
    }
  };

  // Memoized filtered leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = 
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lead.company && lead.company.toLowerCase().includes(searchQuery.toLowerCase()));
        
      const matchesFilter = statusFilter === "All" || lead.status === statusFilter;
      
      return matchesSearch && matchesFilter;
    });
  }, [leads, searchQuery, statusFilter]);

  // Export to CSV function
  const exportToCSV = () => {
    if (filteredLeads.length === 0) {
      alert("No leads to export.");
      return;
    }
    
    const headers = ["Date", "Name", "Email", "Phone", "Company", "Service", "Status", "Message"];
    const csvRows = [headers.join(",")];
    
    for (const lead of filteredLeads) {
      // Escape quotes and wrap in quotes for CSV compliance
      const values = [
        `"${lead.date || ''}"`,
        `"${(lead.name || '').replace(/"/g, '""')}"`,
        `"${(lead.email || '').replace(/"/g, '""')}"`,
        `"${(lead.phone || '').replace(/"/g, '""')}"`,
        `"${(lead.company || '').replace(/"/g, '""')}"`,
        `"${(lead.service || '').replace(/"/g, '""')}"`,
        `"${(lead.status || '').replace(/"/g, '""')}"`,
        `"${(lead.message || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`
      ];
      csvRows.push(values.join(","));
    }
    
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `evolw-leads-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Form Leads</h2>
          <p className="text-evolw-gray-500 mt-1">Manage and respond to website contact submissions.</p>
        </div>
        <div className="flex space-x-3">
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
        
        {/* Table Toolbar */}
        <div className="p-6 border-b border-evolw-gray-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-evolw-gray-50/50 dark:bg-white/5">
          <div className="relative w-full max-w-md">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-evolw-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name, email, or company..." 
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
                  {['All', 'New', 'Contacted', 'Closed'].map(status => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status);
                        setIsFilterOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-evolw-gray-50 dark:hover:bg-white/5 ${statusFilter === status ? 'font-bold text-evolw-accent bg-blue-50 dark:bg-blue-900/10' : ''}`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Data Table */}
        <div className="overflow-x-auto min-h-[400px]">
          {filteredLeads.length === 0 ? (
            <div className="p-12 text-center text-evolw-gray-500">
              {leads.length === 0 ? "No leads have been submitted yet." : "No leads match your search and filter criteria."}
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white dark:bg-evolw-slate text-sm uppercase tracking-wider text-evolw-gray-500 border-b border-evolw-gray-200 dark:border-white/5">
                  <th className="px-8 py-5 font-semibold">Lead Information</th>
                  <th className="px-8 py-5 font-semibold">Contact Details</th>
                  <th className="px-8 py-5 font-semibold">Inquiry Type</th>
                  <th className="px-8 py-5 font-semibold">Message</th>
                  <th className="px-8 py-5 font-semibold">Status</th>
                  <th className="px-8 py-5 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-evolw-gray-100 dark:divide-white/5">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-evolw-gray-50/80 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-8 py-6">
                      <p className="font-bold text-base">{lead.name}</p>
                      <p className="text-sm text-evolw-gray-500">{lead.company}</p>
                      <p className="text-xs text-evolw-gray-400 mt-1">{lead.date}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col space-y-1">
                        <span className="text-sm font-medium">{lead.email}</span>
                        <span className="text-xs text-evolw-gray-500 font-mono">{lead.phone}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-medium bg-evolw-gray-100 dark:bg-white/10 px-3 py-1.5 rounded-lg">
                        {lead.service}
                      </span>
                    </td>
                    <td className="px-8 py-6 max-w-xs">
                      <div 
                        className="cursor-pointer group/msg relative"
                        onClick={() => setExpandedMessageId(expandedMessageId === lead.id ? null : lead.id)}
                      >
                        <p className={`text-sm text-evolw-gray-600 dark:text-evolw-gray-400 ${expandedMessageId === lead.id ? 'whitespace-normal' : 'truncate'} transition-all`}>
                          {lead.message || "No message provided."}
                        </p>
                        {expandedMessageId !== lead.id && lead.message?.length > 40 && (
                          <span className="text-xs text-evolw-accent opacity-0 group-hover/msg:opacity-100 transition-opacity mt-1 inline-block">
                            Click to read more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <select
                        value={lead.status}
                        onChange={(e) => updateLeadStatus(lead, e.target.value)}
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider appearance-none cursor-pointer outline-none ${
                          lead.status === 'New' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' :
                          lead.status === 'Contacted' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                          'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                        }`}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => deleteLead(lead.id)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors text-evolw-gray-400 hover:text-red-500"
                        title="Delete Lead"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
