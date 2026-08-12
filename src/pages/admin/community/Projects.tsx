import { useEffect, useState } from 'react';
import { Loader2, Plus, Trash2, X } from 'lucide-react';

type Project = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string;
  technologies: string[] | null;
  github_url: string | null;
  live_url: string | null;
  status: string;
  looking_for: string[] | null;
};

const emptyForm = {
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

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('evolw_admin_auth');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export function AdminCommunityProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    try {
      const res = await fetch('/api/community?resource=projects', { headers: authHeaders() });
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/community?resource=projects', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          ...form,
          technologies: form.technologies
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
          looking_for: form.looking_for
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Save failed');
      }
      setShowForm(false);
      setForm(emptyForm);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    await fetch(`/api/community?resource=projects&id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    await load();
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
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-evolw-accent text-white text-sm font-semibold"
        >
          <Plus className="w-4 h-4" /> Add project
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-7 h-7 animate-spin text-evolw-accent" />
        </div>
      ) : projects.length === 0 ? (
        <p className="text-evolw-gray-500">No projects yet. Seed runs automatically on first API boot.</p>
      ) : (
        <div className="grid gap-3">
          {projects.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-evolw-gray-200 dark:border-white/10 bg-white dark:bg-evolw-slate p-4"
            >
              <div>
                <p className="font-semibold">
                  {p.name}{' '}
                  <span className="text-xs font-medium text-evolw-accent">({p.status})</span>
                </p>
                <p className="text-sm text-evolw-gray-500">{p.slug}</p>
              </div>
              <button
                type="button"
                onClick={() => remove(p.id)}
                className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <button className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} aria-label="Close" />
          <form
            onSubmit={save}
            className="relative z-10 w-full sm:max-w-lg bg-white dark:bg-evolw-slate rounded-t-2xl sm:rounded-2xl border border-evolw-gray-200 dark:border-white/10 p-6 space-y-3"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-bold text-lg">New project</h2>
              <button type="button" onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-evolw-gray-100 dark:hover:bg-white/10">
                <X className="w-4 h-4" />
              </button>
            </div>
            {(
              [
                ['slug', 'Slug *'],
                ['name', 'Name *'],
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
                  value={(form as any)[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
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
              {saving ? 'Saving…' : 'Create project'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
