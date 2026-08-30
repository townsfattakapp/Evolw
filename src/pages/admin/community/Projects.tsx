import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit3, Loader2, Plus, Trash2, X } from 'lucide-react';
import {
  api,
  ApiError,
  type CommunityProject,
} from '../../../lib/api';

type ProjectForm = {
  id?: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  technologies: string;
  github_url: string;
  live_url: string;
  status: string;
  looking_for: string;
};

const emptyForm: ProjectForm = {
  slug: '',
  name: '',
  tagline: '',
  description: '',
  technologies: '',
  github_url: '',
  live_url: '',
  status: 'Building',
  looking_for: '',
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function splitCsv(value: string) {
  return value
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

function toForm(p: CommunityProject): ProjectForm {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    tagline: p.tagline || '',
    description: p.description,
    technologies: (p.technologies || []).join(', '),
    github_url: p.github_url || '',
    live_url: p.live_url || '',
    status: p.status || 'Building',
    looking_for: (p.looking_for || []).join(', '),
  };
}

export function AdminCommunityProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<CommunityProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ProjectForm>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const handleAuthFailure = (err: unknown) => {
    if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
      navigate('/admin');
      return true;
    }
    return false;
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getCommunityProjects();
      setProjects(data.projects || []);
    } catch (err) {
      if (handleAuthFailure(err)) return;
      setError(err instanceof ApiError ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (p: CommunityProject) => {
    setForm(toForm(p));
    setShowForm(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      slug: form.slug.trim() || slugify(form.name),
      name: form.name.trim(),
      tagline: form.tagline.trim() || null,
      description: form.description.trim(),
      github_url: form.github_url.trim() || null,
      live_url: form.live_url.trim() || null,
      status: form.status,
      technologies: splitCsv(form.technologies),
      looking_for: splitCsv(form.looking_for),
    };
    try {
      if (form.id) {
        await api.updateCommunityProject({ id: form.id, ...payload });
      } else {
        await api.createCommunityProject(payload);
      }
      setShowForm(false);
      setForm(emptyForm);
      await load();
    } catch (err) {
      if (handleAuthFailure(err)) return;
      setError(err instanceof ApiError ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this project? It will disappear from the public community page.')) return;
    try {
      await api.deleteCommunityProject(id);
      await load();
    } catch (err) {
      if (handleAuthFailure(err)) return;
      setError(err instanceof ApiError ? err.message : 'Delete failed');
    }
  };

  return (
    <div className="space-y-6 text-evolw-black dark:text-white">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Community Projects</h1>
          <p className="text-sm text-evolw-gray-500">Public showcase on /community/projects</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-evolw-accent text-white text-sm font-semibold"
        >
          <Plus className="w-4 h-4" /> Add project
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-900/20 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-7 h-7 animate-spin text-evolw-accent" />
        </div>
      ) : projects.length === 0 ? (
        <p className="text-evolw-gray-500">No projects yet. Add one to show it on the public site.</p>
      ) : (
        <div className="grid gap-3">
          {projects.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-evolw-gray-200 dark:border-white/10 bg-white dark:bg-evolw-slate p-4"
            >
              <div className="min-w-0">
                <p className="font-semibold truncate">
                  {p.name}{' '}
                  <span className="text-xs font-medium text-evolw-accent">({p.status})</span>
                </p>
                <p className="text-sm text-evolw-gray-500 truncate">{p.slug}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => openEdit(p)}
                  className="p-2 rounded-lg text-evolw-gray-600 dark:text-evolw-gray-300 hover:bg-evolw-gray-100 dark:hover:bg-white/10"
                  aria-label="Edit project"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(p.id)}
                  className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                  aria-label="Delete project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <button className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} aria-label="Close" />
          <form
            onSubmit={save}
            className="relative z-10 w-full sm:max-w-lg max-h-[90dvh] overflow-y-auto bg-white dark:bg-evolw-slate rounded-t-2xl sm:rounded-2xl border border-evolw-gray-200 dark:border-white/10 p-6 space-y-3"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-bold text-lg">{form.id ? 'Edit project' : 'New project'}</h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="p-2 rounded-lg hover:bg-evolw-gray-100 dark:hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {(
              [
                ['name', 'Name *'],
                ['slug', 'Slug *'],
                ['tagline', 'Tagline'],
                ['github_url', 'GitHub URL'],
                ['live_url', 'Live URL'],
                ['technologies', 'Technologies (comma-separated)'],
                ['looking_for', 'Looking for (comma-separated)'],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-evolw-gray-500 mb-1">{label}</label>
                <input
                  required={key === 'slug' || key === 'name'}
                  value={form[key]}
                  onChange={(e) => {
                    const value = e.target.value;
                    setForm((prev) => ({
                      ...prev,
                      [key]: value,
                      ...(key === 'name' && !prev.id && !prev.slug
                        ? { slug: slugify(value) }
                        : key === 'name' && !prev.id && prev.slug === slugify(prev.name)
                          ? { slug: slugify(value) }
                          : {}),
                    }));
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-evolw-gray-200 dark:border-white/10 dark:bg-black/20"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-evolw-gray-500 mb-1">Description *</label>
              <textarea
                required
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-evolw-gray-200 dark:border-white/10 dark:bg-black/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-evolw-gray-500 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-evolw-gray-200 dark:border-white/10 dark:bg-black/20"
              >
                {['Idea', 'Building', 'Beta', 'Live', 'Archived'].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-xl bg-evolw-accent text-white font-semibold disabled:opacity-50"
            >
              {saving ? 'Saving…' : form.id ? 'Update project' : 'Create project'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
