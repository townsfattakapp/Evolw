import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit3, Loader2, Plus, Trash2, X } from 'lucide-react';
import {
  api,
  ApiError,
  type CommunityHackathon,
} from '../../../lib/api';

type HackathonForm = {
  id?: string;
  slug: string;
  title: string;
  description: string;
  organizer: string;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  mode: string;
  location: string;
  prize_pool: string;
  external_registration_url: string;
  platform: string;
  status: string;
  tags: string;
};

const emptyForm: HackathonForm = {
  slug: '',
  title: '',
  description: '',
  organizer: 'EVOLW',
  start_date: '',
  end_date: '',
  registration_deadline: '',
  mode: 'Online',
  location: '',
  prize_pool: '',
  external_registration_url: '',
  platform: '',
  status: 'Upcoming',
  tags: '',
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toLocalInput(iso?: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toIso(local: string) {
  if (!local) return null;
  const d = new Date(local);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function toForm(h: CommunityHackathon): HackathonForm {
  return {
    id: h.id,
    slug: h.slug,
    title: h.title,
    description: h.description,
    organizer: h.organizer || 'EVOLW',
    start_date: toLocalInput(h.start_date),
    end_date: toLocalInput(h.end_date),
    registration_deadline: toLocalInput(h.registration_deadline),
    mode: h.mode || 'Online',
    location: h.location || '',
    prize_pool: h.prize_pool || '',
    external_registration_url: h.external_registration_url || '',
    platform: h.platform || '',
    status: h.status || 'Upcoming',
    tags: (h.tags || []).join(', '),
  };
}

export function AdminCommunityHackathons() {
  const navigate = useNavigate();
  const [items, setItems] = useState<CommunityHackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<HackathonForm>(emptyForm);
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
      const data = await api.getCommunityHackathons();
      setItems(data.hackathons || []);
    } catch (err) {
      if (handleAuthFailure(err)) return;
      setError(err instanceof ApiError ? err.message : 'Failed to load hackathons');
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

  const openEdit = (h: CommunityHackathon) => {
    setForm(toForm(h));
    setShowForm(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const start = toIso(form.start_date);
    const end = toIso(form.end_date);
    if (!start || !end) {
      setError('Start and end dates are required');
      return;
    }
    setSaving(true);
    setError(null);
    const payload = {
      slug: form.slug.trim() || slugify(form.title),
      title: form.title.trim(),
      description: form.description.trim(),
      organizer: form.organizer.trim() || 'EVOLW',
      start_date: start,
      end_date: end,
      registration_deadline: toIso(form.registration_deadline),
      mode: form.mode,
      location: form.location.trim() || null,
      prize_pool: form.prize_pool.trim() || null,
      external_registration_url: form.external_registration_url.trim(),
      platform: form.platform.trim() || null,
      status: form.status,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };
    try {
      if (form.id) {
        await api.updateCommunityHackathon({ id: form.id, ...payload });
      } else {
        await api.createCommunityHackathon(payload);
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
    if (!confirm('Delete this hackathon?')) return;
    try {
      await api.deleteCommunityHackathon(id);
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
          <h1 className="text-2xl font-bold tracking-tight">Community Hackathons</h1>
          <p className="text-sm text-evolw-gray-500">Public listing on /community/hackathons</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-evolw-accent text-white text-sm font-semibold"
        >
          <Plus className="w-4 h-4" /> Add hackathon
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
      ) : items.length === 0 ? (
        <p className="text-evolw-gray-500">No hackathons yet. Create one to publish it publicly.</p>
      ) : (
        <div className="grid gap-3">
          {items.map((h) => (
            <div
              key={h.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-evolw-gray-200 dark:border-white/10 bg-white dark:bg-evolw-slate p-4"
            >
              <div className="min-w-0">
                <p className="font-semibold truncate">
                  {h.title}{' '}
                  <span className="text-xs font-medium text-evolw-accent">({h.status})</span>
                </p>
                <p className="text-sm text-evolw-gray-500 truncate">
                  {new Date(h.start_date).toLocaleDateString()} –{' '}
                  {new Date(h.end_date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => openEdit(h)}
                  className="p-2 rounded-lg text-evolw-gray-600 dark:text-evolw-gray-300 hover:bg-evolw-gray-100 dark:hover:bg-white/10"
                  aria-label="Edit hackathon"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(h.id)}
                  className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                  aria-label="Delete hackathon"
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
              <h2 className="font-bold text-lg">{form.id ? 'Edit hackathon' : 'New hackathon'}</h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="p-2 rounded-lg hover:bg-evolw-gray-100 dark:hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-evolw-gray-500 mb-1">Title *</label>
              <input
                required
                value={form.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setForm((prev) => ({
                    ...prev,
                    title,
                    ...(!prev.id && (!prev.slug || prev.slug === slugify(prev.title))
                      ? { slug: slugify(title) }
                      : {}),
                  }));
                }}
                className="w-full px-3 py-2 rounded-xl border border-evolw-gray-200 dark:border-white/10 dark:bg-black/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-evolw-gray-500 mb-1">Slug *</label>
              <input
                required
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-evolw-gray-200 dark:border-white/10 dark:bg-black/20"
              />
            </div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-evolw-gray-500 mb-1">Start *</label>
                <input
                  required
                  type="datetime-local"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-evolw-gray-200 dark:border-white/10 dark:bg-black/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-evolw-gray-500 mb-1">End *</label>
                <input
                  required
                  type="datetime-local"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-evolw-gray-200 dark:border-white/10 dark:bg-black/20"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-evolw-gray-500 mb-1">Registration deadline</label>
              <input
                type="datetime-local"
                value={form.registration_deadline}
                onChange={(e) => setForm({ ...form, registration_deadline: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-evolw-gray-200 dark:border-white/10 dark:bg-black/20"
              />
            </div>
            {(
              [
                ['organizer', 'Organizer'],
                ['prize_pool', 'Prize pool'],
                ['location', 'Location'],
                ['platform', 'Platform'],
                ['external_registration_url', 'Registration URL'],
                ['tags', 'Tags (comma-separated)'],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-evolw-gray-500 mb-1">{label}</label>
                <input
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-evolw-gray-200 dark:border-white/10 dark:bg-black/20"
                />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-evolw-gray-500 mb-1">Mode</label>
                <select
                  value={form.mode}
                  onChange={(e) => setForm({ ...form, mode: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-evolw-gray-200 dark:border-white/10 dark:bg-black/20"
                >
                  {['Online', 'Hybrid', 'Offline'].map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-evolw-gray-500 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-evolw-gray-200 dark:border-white/10 dark:bg-black/20"
                >
                  {['Upcoming', 'Registration Open', 'Live', 'Completed', 'Cancelled'].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-xl bg-evolw-accent text-white font-semibold disabled:opacity-50"
            >
              {saving ? 'Saving…' : form.id ? 'Update hackathon' : 'Create hackathon'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
