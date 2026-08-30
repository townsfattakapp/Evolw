import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit3, Loader2, Plus, Trash2, X } from 'lucide-react';
import {
  api,
  ApiError,
  type CommunityEvent,
} from '../../../lib/api';

type EventForm = {
  id?: string;
  slug: string;
  title: string;
  description: string;
  event_type: string;
  speaker: string;
  start_date: string;
  end_date: string;
  timezone: string;
  location: string;
  is_online: boolean;
  external_registration_url: string;
};

const emptyForm: EventForm = {
  slug: '',
  title: '',
  description: '',
  event_type: 'Workshop',
  speaker: '',
  start_date: '',
  end_date: '',
  timezone: 'Asia/Kolkata',
  location: '',
  is_online: true,
  external_registration_url: '',
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

function toForm(ev: CommunityEvent): EventForm {
  return {
    id: ev.id,
    slug: ev.slug,
    title: ev.title,
    description: ev.description,
    event_type: ev.event_type || 'Workshop',
    speaker: ev.speaker || '',
    start_date: toLocalInput(ev.start_date),
    end_date: toLocalInput(ev.end_date),
    timezone: ev.timezone || 'Asia/Kolkata',
    location: ev.location || '',
    is_online: ev.is_online !== false,
    external_registration_url: ev.external_registration_url || '',
  };
}

export function AdminCommunityEvents() {
  const navigate = useNavigate();
  const [items, setItems] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<EventForm>(emptyForm);
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
      const data = await api.getCommunityEvents();
      setItems(data.events || []);
    } catch (err) {
      if (handleAuthFailure(err)) return;
      setError(err instanceof ApiError ? err.message : 'Failed to load events');
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

  const openEdit = (ev: CommunityEvent) => {
    setForm(toForm(ev));
    setShowForm(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const start = toIso(form.start_date);
    if (!start) {
      setError('Start date is required');
      return;
    }
    setSaving(true);
    setError(null);
    const payload = {
      slug: form.slug.trim() || slugify(form.title),
      title: form.title.trim(),
      description: form.description.trim(),
      event_type: form.event_type,
      speaker: form.speaker.trim() || null,
      start_date: start,
      end_date: toIso(form.end_date),
      timezone: form.timezone.trim() || 'Asia/Kolkata',
      location: form.location.trim() || null,
      is_online: form.is_online,
      external_registration_url: form.external_registration_url.trim() || null,
    };
    try {
      if (form.id) {
        await api.updateCommunityEvent({ id: form.id, ...payload });
      } else {
        await api.createCommunityEvent(payload);
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
    if (!confirm('Delete this event?')) return;
    try {
      await api.deleteCommunityEvent(id);
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
          <h1 className="text-2xl font-bold tracking-tight">Community Events</h1>
          <p className="text-sm text-evolw-gray-500">Public listing on /community/events</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-evolw-accent text-white text-sm font-semibold"
        >
          <Plus className="w-4 h-4" /> Add event
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
        <p className="text-evolw-gray-500">No events yet. Create one to publish it publicly.</p>
      ) : (
        <div className="grid gap-3">
          {items.map((ev) => (
            <div
              key={ev.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-evolw-gray-200 dark:border-white/10 bg-white dark:bg-evolw-slate p-4"
            >
              <div className="min-w-0">
                <p className="font-semibold truncate">
                  {ev.title}{' '}
                  <span className="text-xs font-medium text-evolw-accent">({ev.event_type})</span>
                </p>
                <p className="text-sm text-evolw-gray-500 truncate">
                  {new Date(ev.start_date).toLocaleString()}
                  {ev.is_online ? ' · Online' : ev.location ? ` · ${ev.location}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => openEdit(ev)}
                  className="p-2 rounded-lg text-evolw-gray-600 dark:text-evolw-gray-300 hover:bg-evolw-gray-100 dark:hover:bg-white/10"
                  aria-label="Edit event"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(ev.id)}
                  className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                  aria-label="Delete event"
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
              <h2 className="font-bold text-lg">{form.id ? 'Edit event' : 'New event'}</h2>
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
                <label className="block text-xs font-semibold text-evolw-gray-500 mb-1">End</label>
                <input
                  type="datetime-local"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-evolw-gray-200 dark:border-white/10 dark:bg-black/20"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-evolw-gray-500 mb-1">Type</label>
                <select
                  value={form.event_type}
                  onChange={(e) => setForm({ ...form, event_type: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-evolw-gray-200 dark:border-white/10 dark:bg-black/20"
                >
                  {['Workshop', 'AMA', 'Meetup', 'Webinar', 'Other'].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-evolw-gray-500 mb-1">Timezone</label>
                <input
                  value={form.timezone}
                  onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-evolw-gray-200 dark:border-white/10 dark:bg-black/20"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-evolw-gray-500 mb-1">Speaker</label>
              <input
                value={form.speaker}
                onChange={(e) => setForm({ ...form, speaker: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-evolw-gray-200 dark:border-white/10 dark:bg-black/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-evolw-gray-500 mb-1">Location</label>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-evolw-gray-200 dark:border-white/10 dark:bg-black/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-evolw-gray-500 mb-1">Registration URL</label>
              <input
                value={form.external_registration_url}
                onChange={(e) => setForm({ ...form, external_registration_url: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-evolw-gray-200 dark:border-white/10 dark:bg-black/20"
              />
            </div>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={form.is_online}
                onChange={(e) => setForm({ ...form, is_online: e.target.checked })}
                className="rounded border-evolw-gray-300"
              />
              Online event
            </label>
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-xl bg-evolw-accent text-white font-semibold disabled:opacity-50"
            >
              {saving ? 'Saving…' : form.id ? 'Update event' : 'Create event'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
