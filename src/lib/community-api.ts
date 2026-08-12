/** Shared community API helpers for the public site. */

const BASE = '/api/community';

async function getJson<T>(resource: string, params?: Record<string, string>): Promise<T> {
  const qs = new URLSearchParams({ resource, ...(params || {}) });
  const res = await fetch(`${BASE}?${qs.toString()}`);
  if (!res.ok) {
    throw new Error(`Community API ${resource} failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export const communityApi = {
  projects: (params?: Record<string, string>) =>
    getJson<{ projects?: any[]; project?: any }>('projects', params),
  hackathons: () => getJson<{ hackathons: any[] }>('hackathons'),
  events: () => getJson<{ events: any[] }>('events'),
  discussions: (type: string, limit = '6') =>
    getJson<{ topics: any[]; degraded?: boolean; message?: string }>('discussions', {
      type,
      limit,
    }),
  github: (action: string, extra?: Record<string, string>) =>
    getJson<{
      repos?: any[];
      issues?: any[];
      degraded?: boolean;
      message?: string;
      error?: string;
    }>('github', {
      action,
      ...(extra || {}),
    }),
};
