import { useState, useEffect } from "react";
import { Plus, Trash2, Edit3, Save, Briefcase, Eye, EyeOff } from "lucide-react";
import { api, ApiError, type Job, type JobStatus } from "../../lib/api";
import { sanitizeRichText } from "../../lib/richText";
import { RichTextEditor } from "../../components/ui/rich-text-editor";
import { useNavigate } from "react-router-dom";

const emptyForm: Omit<Job, "id"> = {
  title: "",
  department: "",
  location: "",
  type: "Full-time",
  description: "",
  status: "published",
};

export function AdminJobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Job, "id"> & { id?: string }>({ ...emptyForm });

  const handleAuthFailure = (err: unknown) => {
    if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
      navigate("/admin");
      return true;
    }
    return false;
  };

  const loadJobs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getJobs({ auth: true });
      setJobs(Array.isArray(data) ? data : [data]);
    } catch (err) {
      if (handleAuthFailure(err)) return;
      console.error("[admin/jobs] Failed to load", err);
      setError(err instanceof ApiError ? err.message : "Failed to load jobs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleAddJob = async () => {
    if (!formData.title.trim()) return;
    setIsSaving(true);
    setError(null);
    try {
      await api.createJob({
        title: formData.title,
        department: formData.department,
        location: formData.location,
        type: formData.type,
        description: sanitizeRichText(formData.description),
        status: formData.status,
      });
      setFormData({ ...emptyForm });
      await loadJobs();
    } catch (err) {
      if (handleAuthFailure(err)) return;
      console.error("[admin/jobs] Create failed", err);
      setError(err instanceof ApiError ? err.message : "Failed to create job");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateJob = async () => {
    if (!formData.id || !formData.title.trim()) return;
    setIsSaving(true);
    setError(null);
    try {
      await api.updateJob({
        id: formData.id,
        title: formData.title,
        department: formData.department,
        location: formData.location,
        type: formData.type,
        description: sanitizeRichText(formData.description),
        status: formData.status,
      });
      setIsEditing(null);
      setFormData({ ...emptyForm });
      await loadJobs();
    } catch (err) {
      if (handleAuthFailure(err)) return;
      console.error("[admin/jobs] Update failed", err);
      setError(err instanceof ApiError ? err.message : "Failed to update job");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!confirm("Are you sure you want to remove this job opening?")) return;
    try {
      await api.deleteJob(id);
      await loadJobs();
    } catch (err) {
      if (handleAuthFailure(err)) return;
      console.error("[admin/jobs] Delete failed", err);
      setError(err instanceof ApiError ? err.message : "Failed to delete job");
    }
  };

  const togglePublish = async (job: Job) => {
    const nextStatus: JobStatus = job.status === "published" ? "draft" : "published";
    try {
      await api.updateJob({ ...job, status: nextStatus });
      await loadJobs();
    } catch (err) {
      if (handleAuthFailure(err)) return;
      console.error("[admin/jobs] Status update failed", err);
      setError(err instanceof ApiError ? err.message : "Failed to update job status");
    }
  };

  const startEdit = (job: Job) => {
    setIsEditing(job.id);
    setFormData(job);
  };

  const cancelEdit = () => {
    setIsEditing(null);
    setFormData({ ...emptyForm });
  };

  if (isLoading) {
    return <div className="p-8 text-evolw-gray-500">Loading careers editor...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 text-evolw-black dark:text-white">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2 text-evolw-black dark:text-white">Manage Careers</h2>
        <p className="text-evolw-gray-500 dark:text-evolw-gray-400 text-sm sm:text-base">
          Post and edit job openings. Published jobs appear live on the Careers page instantly.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm font-medium flex justify-between gap-4">
          <span>{error}</span>
          <button onClick={loadJobs} className="underline shrink-0">
            Retry
          </button>
        </div>
      )}

      <div className="bg-white dark:bg-evolw-slate rounded-2xl sm:rounded-3xl border border-evolw-gray-200 dark:border-white/10 overflow-hidden shadow-sm">
        <div className="p-4 sm:p-6 border-b border-evolw-gray-200 dark:border-white/10 bg-evolw-gray-50/50 dark:bg-white/5 flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
            <Briefcase className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-base sm:text-lg text-evolw-black dark:text-white">{isEditing ? "Edit Job Opening" : "Post a New Job"}</h3>
        </div>

        <div className="p-4 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Job Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border bg-evolw-gray-50 dark:bg-evolw-black focus:ring-2 focus:ring-evolw-accent border-evolw-gray-200 dark:border-white/10 outline-none"
                placeholder="e.g. Senior Frontend Engineer"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border bg-evolw-gray-50 dark:bg-evolw-black focus:ring-2 focus:ring-evolw-accent border-evolw-gray-200 dark:border-white/10 outline-none"
                placeholder="e.g. Engineering"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border bg-evolw-gray-50 dark:bg-evolw-black focus:ring-2 focus:ring-evolw-accent border-evolw-gray-200 dark:border-white/10 outline-none"
                placeholder="e.g. Remote, India"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Employment Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border bg-evolw-gray-50 dark:bg-evolw-black focus:ring-2 focus:ring-evolw-accent border-evolw-gray-200 dark:border-white/10 outline-none"
              >
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
                <option>Internship</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold">Visibility</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as JobStatus })
                }
                className="w-full px-4 py-3 rounded-xl border bg-evolw-gray-50 dark:bg-evolw-black focus:ring-2 focus:ring-evolw-accent border-evolw-gray-200 dark:border-white/10 outline-none"
              >
                <option value="published">Published (visible on /careers)</option>
                <option value="draft">Draft (admin only)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <label className="text-sm font-semibold">Job Description</label>
            <RichTextEditor
              key={isEditing ?? "new"}
              value={formData.description}
              onChange={(description) => setFormData({ ...formData, description })}
              placeholder="Paste from ChatGPT or write the full role description. Bold, lists, and headings are preserved…"
              minHeightClassName="min-h-[260px]"
            />
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

      <div>
        <h3 className="text-xl font-bold mb-4">Job Openings ({jobs.length})</h3>

        {jobs.length === 0 ? (
          <div className="bg-evolw-gray-50 dark:bg-white/5 border border-evolw-gray-200 dark:border-white/10 rounded-3xl p-12 text-center text-evolw-gray-500">
            No job openings currently posted. Add one above to see it on the website.
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white dark:bg-evolw-slate rounded-2xl border border-evolw-gray-200 dark:border-white/10 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center space-x-3 mb-2 flex-wrap">
                    <h4 className="text-lg font-bold">{job.title}</h4>
                    <span className="px-2.5 py-1 bg-evolw-gray-100 dark:bg-white/10 rounded-full text-xs font-semibold text-evolw-gray-600 dark:text-evolw-gray-300">
                      {job.department}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        job.status === "published"
                          ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                      }`}
                    >
                      {job.status}
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
                    onClick={() => togglePublish(job)}
                    className="p-2 bg-evolw-gray-50 dark:bg-white/5 hover:bg-green-50 dark:hover:bg-green-900/20 text-evolw-gray-600 dark:text-gray-300 hover:text-green-600 rounded-lg transition-colors"
                    title={job.status === "published" ? "Unpublish" : "Publish"}
                  >
                    {job.status === "published" ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
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
