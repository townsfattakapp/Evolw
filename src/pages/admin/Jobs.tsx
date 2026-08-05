import { useState, useEffect } from "react";
import { Plus, Trash2, Edit3, Save, Briefcase } from "lucide-react";
import { useContent, type Job } from "../../context/ContentContext";

export function AdminJobs() {
  const { content, updateContent, isLoading } = useContent();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);

  // Form state for new/edit job
  const [formData, setFormData] = useState<Job>({
    id: "",
    title: "",
    department: "",
    location: "",
    type: "Full-time",
    description: ""
  });

  useEffect(() => {
    if (!isLoading && content.jobs) {
      setJobs(content.jobs);
    }
  }, [content, isLoading]);

  const handleSaveToCMS = async (newJobsList: Job[]) => {
    setIsSaving(true);
    await updateContent({
      ...content,
      jobs: newJobsList
    });
    setJobs(newJobsList);
    setIsSaving(false);
  };

  const handleAddJob = () => {
    const newJob = {
      ...formData,
      id: Date.now().toString()
    };
    handleSaveToCMS([...jobs, newJob]);
    setFormData({ id: "", title: "", department: "", location: "", type: "Full-time", description: "" });
  };

  const handleUpdateJob = () => {
    const updatedJobs = jobs.map(j => j.id === formData.id ? formData : j);
    handleSaveToCMS(updatedJobs);
    setIsEditing(null);
    setFormData({ id: "", title: "", department: "", location: "", type: "Full-time", description: "" });
  };

  const handleDeleteJob = (id: string) => {
    if(confirm("Are you sure you want to remove this job opening?")) {
      handleSaveToCMS(jobs.filter(j => j.id !== id));
    }
  };

  const startEdit = (job: Job) => {
    setIsEditing(job.id);
    setFormData(job);
  };

  const cancelEdit = () => {
    setIsEditing(null);
    setFormData({ id: "", title: "", department: "", location: "", type: "Full-time", description: "" });
  };

  if (isLoading) {
    return <div className="p-8 text-evolw-gray-500">Loading careers editor...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Manage Careers</h2>
        <p className="text-evolw-gray-500">Post and edit job openings. They will appear live on the Careers page instantly.</p>
      </div>

      <div className="bg-white dark:bg-evolw-slate rounded-3xl border border-evolw-gray-200 dark:border-white/5 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-evolw-gray-200 dark:border-white/5 bg-evolw-gray-50/50 dark:bg-white/5 flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
            <Briefcase className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-lg">{isEditing ? "Edit Job Opening" : "Post a New Job"}</h3>
        </div>
        
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Job Title</label>
              <input 
                type="text" 
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border bg-evolw-gray-50 dark:bg-evolw-black focus:ring-2 focus:ring-evolw-accent border-evolw-gray-200 dark:border-white/10 outline-none"
                placeholder="e.g. Senior Frontend Engineer"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Department</label>
              <input 
                type="text" 
                value={formData.department}
                onChange={e => setFormData({...formData, department: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border bg-evolw-gray-50 dark:bg-evolw-black focus:ring-2 focus:ring-evolw-accent border-evolw-gray-200 dark:border-white/10 outline-none"
                placeholder="e.g. Engineering"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Location</label>
              <input 
                type="text" 
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border bg-evolw-gray-50 dark:bg-evolw-black focus:ring-2 focus:ring-evolw-accent border-evolw-gray-200 dark:border-white/10 outline-none"
                placeholder="e.g. Remote, India"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Employment Type</label>
              <select 
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border bg-evolw-gray-50 dark:bg-evolw-black focus:ring-2 focus:ring-evolw-accent border-evolw-gray-200 dark:border-white/10 outline-none"
              >
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
                <option>Internship</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-2 mb-6">
            <label className="text-sm font-semibold">Short Description</label>
            <textarea 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border bg-evolw-gray-50 dark:bg-evolw-black focus:ring-2 focus:ring-evolw-accent border-evolw-gray-200 dark:border-white/10 outline-none resize-none"
              placeholder="Brief overview of the role..."
            ></textarea>
          </div>

          <div className="flex space-x-4">
            {isEditing ? (
              <>
                <button 
                  onClick={handleUpdateJob}
                  disabled={isSaving || !formData.title}
                  className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl flex items-center space-x-2 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>Update Job</span>
                </button>
                <button 
                  onClick={cancelEdit}
                  className="px-6 py-3 bg-evolw-gray-100 dark:bg-white/5 hover:bg-evolw-gray-200 dark:hover:bg-white/10 font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button 
                onClick={handleAddJob}
                disabled={isSaving || !formData.title}
                className="px-6 py-3 bg-evolw-accent hover:bg-blue-600 text-white font-semibold rounded-xl flex items-center space-x-2 transition-colors disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>Post Job</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active Jobs List */}
      <div>
        <h3 className="text-xl font-bold mb-4">Active Openings ({jobs.length})</h3>
        
        {jobs.length === 0 ? (
          <div className="bg-evolw-gray-50 dark:bg-white/5 border border-evolw-gray-200 dark:border-white/10 rounded-3xl p-12 text-center text-evolw-gray-500">
            No job openings currently posted. Add one above to see it on the website.
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map(job => (
              <div key={job.id} className="bg-white dark:bg-evolw-slate rounded-2xl border border-evolw-gray-200 dark:border-white/10 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-bold">{job.title}</h4>
                    <span className="px-2.5 py-1 bg-evolw-gray-100 dark:bg-white/10 rounded-full text-xs font-semibold text-evolw-gray-600 dark:text-evolw-gray-300">
                      {job.department}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-evolw-gray-500">
                    <span>{job.location}</span>
                    <span>•</span>
                    <span>{job.type}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => startEdit(job)}
                    className="p-2 bg-evolw-gray-50 dark:bg-white/5 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-evolw-gray-600 dark:text-gray-300 hover:text-evolw-accent rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteJob(job.id)}
                    className="p-2 bg-evolw-gray-50 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-900/20 text-evolw-gray-600 dark:text-gray-300 hover:text-red-500 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
