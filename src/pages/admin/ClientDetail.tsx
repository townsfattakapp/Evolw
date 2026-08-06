import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, Mail, Phone, Globe, FileText, Plus, Loader2 } from "lucide-react";
import { api, ApiError } from "../../lib/api";
import useSWR, { useSWRConfig } from "swr";

export function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { mutate } = useSWRConfig();
  
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectForm, setProjectForm] = useState<any>({});
  const [savingProject, setSavingProject] = useState(false);

  const { data: client, isLoading: loadingClient } = useSWR(
    id ? `billing:client:${id}` : null,
    async () => {
      const result = await api.getClients(id!);
      return (Array.isArray(result) ? result[0] : result) as any;
    },
    {
      onError: (err) => {
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          navigate("/admin");
        }
      },
    }
  );

  const { data: projectsData, isLoading: loadingProjects } = useSWR(
    id ? `billing:projects:${id}` : null,
    () => api.getProjects({ client_id: id! })
  );

  const projects = Array.isArray(projectsData) ? projectsData : [];
  const loading = loadingClient || loadingProjects;

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSavingProject(true);
    try {
      await api.saveProject({ ...projectForm, client_id: id, name: projectForm.name });
      setShowProjectModal(false);
      setProjectForm({});
      mutate(id ? `billing:projects:${id}` : null);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Error saving project");
    } finally {
      setSavingProject(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-evolw-accent" /></div>;
  }

  if (!client) {
    return <div className="text-center p-12 text-red-500">Client not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/clients" className="p-2 hover:bg-evolw-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            {client.company_name}
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              client.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {client.status}
            </span>
          </h1>
          <p className="text-evolw-gray-500 flex gap-4 mt-1 text-sm">
            {client.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {client.email}</span>}
            {client.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {client.phone}</span>}
            {client.website && <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {client.website}</span>}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Client Details */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-evolw-slate rounded-2xl p-6 border border-evolw-gray-200 dark:border-white/10 shadow-sm">
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-evolw-gray-400" />
              Company Information
            </h2>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-evolw-gray-500 mb-1">Contact Person</p>
                <p className="font-medium">{client.contact_person || '-'}</p>
              </div>
              <div>
                <p className="text-evolw-gray-500 mb-1">GSTIN</p>
                <p className="font-medium">{client.gstin || '-'}</p>
              </div>
              <div>
                <p className="text-evolw-gray-500 mb-1">Billing Address</p>
                <p className="font-medium whitespace-pre-wrap">{client.billing_address || '-'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Projects & Financials */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-evolw-slate rounded-2xl border border-evolw-gray-200 dark:border-white/10 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-evolw-gray-200 dark:border-white/10 flex justify-between items-center bg-evolw-gray-50/50 dark:bg-white/5">
              <h2 className="font-bold flex items-center gap-2">
                <FileText className="w-4 h-4 text-evolw-gray-400" />
                Projects
              </h2>
              <button
                onClick={() => {
                  setProjectForm({ status: 'Lead' });
                  setShowProjectModal(true);
                }}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-evolw-accent text-white rounded-lg hover:bg-evolw-accent/90 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Project
              </button>
            </div>
            
            {projects.length === 0 ? (
              <div className="p-8 text-center text-evolw-gray-500">
                No projects found for this client.
              </div>
            ) : (
              <div className="divide-y divide-evolw-gray-200 dark:divide-white/10">
                {projects.map(project => (
                  <div key={project.id} className="p-4 hover:bg-evolw-gray-50 dark:hover:bg-white/5 transition-colors flex justify-between items-center cursor-pointer" onClick={() => {
                    setProjectForm(project);
                    setShowProjectModal(true);
                  }}>
                    <div>
                      <h3 className="font-medium text-evolw-accent hover:underline">{project.name}</h3>
                      <p className="text-xs text-evolw-gray-500 mt-1">Status: {project.status}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">₹{project.estimated_value || '0.00'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-evolw-slate rounded-2xl w-full max-w-xl shadow-xl">
            <div className="p-6 border-b border-evolw-gray-200 dark:border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-bold">{projectForm.id ? 'Edit Project' : 'Add Project'}</h2>
              <button onClick={() => setShowProjectModal(false)} className="p-2 hover:bg-evolw-gray-100 dark:hover:bg-white/10 rounded-xl">✕</button>
            </div>
            <form onSubmit={handleSaveProject} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Project Name *</label>
                <input required value={projectForm.name || ''} onChange={e => setProjectForm({...projectForm, name: e.target.value})} className="w-full px-4 py-2 border rounded-xl dark:border-white/10 dark:bg-black/20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select value={projectForm.status || 'Lead'} onChange={e => setProjectForm({...projectForm, status: e.target.value})} className="w-full px-4 py-2 border rounded-xl dark:border-white/10 dark:bg-black/20">
                    <option value="Lead">Lead</option>
                    <option value="Proposal Sent">Proposal Sent</option>
                    <option value="Approved">Approved</option>
                    <option value="In Progress">In Progress</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Estimated Value</label>
                  <input type="number" step="0.01" value={projectForm.estimated_value || ''} onChange={e => setProjectForm({...projectForm, estimated_value: e.target.value})} className="w-full px-4 py-2 border rounded-xl dark:border-white/10 dark:bg-black/20" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea value={projectForm.description || ''} onChange={e => setProjectForm({...projectForm, description: e.target.value})} className="w-full px-4 py-2 border rounded-xl dark:border-white/10 dark:bg-black/20" rows={3} />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-evolw-gray-200 dark:border-white/10">
                <button type="button" onClick={() => setShowProjectModal(false)} className="px-4 py-2 font-medium hover:bg-evolw-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={savingProject} className="px-4 py-2 bg-evolw-accent text-white font-medium rounded-xl hover:bg-evolw-accent/90 transition-colors disabled:opacity-50">
                  {savingProject ? 'Saving...' : 'Save Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
