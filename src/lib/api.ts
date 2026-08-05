/**
 * Centralized API client for EVOLW.
 * Uses same-origin `/api/*` routes (Vercel serverless in production).
 */

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('evolw_admin_auth');
}

export function clearAuthToken(): void {
  localStorage.removeItem('evolw_admin_auth');
}

export type JobStatus = 'draft' | 'published';
export type LeadStatus = 'new' | 'read' | 'resolved';
export type ApplicationStatus =
  | 'new'
  | 'reviewing'
  | 'shortlisted'
  | 'rejected'
  | 'hired';

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  status: JobStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  service?: string | null;
  subject?: string | null;
  message?: string | null;
  status: LeadStatus | string;
  date?: string;
  createdAt?: string;
}

export interface Application {
  id: string;
  jobId?: string | null;
  jobTitle?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  linkedin?: string | null;
  portfolio?: string | null;
  experience?: string | null;
  skills?: string | null;
  message?: string | null;
  resumeUrl?: string | null;
  resumeName?: string | null;
  status: ApplicationStatus | string;
  date?: string;
  createdAt?: string;
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  signal?: AbortSignal;
};

async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (options.auth) {
    const token = getAuthToken();
    if (!token) {
      throw new ApiError('Not authenticated', 401);
    }
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(path, {
      method: options.method || 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
    });
  } catch (error) {
    console.error('[evolw] Network error', { path, error });
    throw new ApiError('Network error. Please check your connection and try again.', 0);
  }

  let data: unknown = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      if (options.auth) {
        clearAuthToken();
      }
    }
    const message =
      typeof data === 'object' && data && 'error' in data
        ? (typeof (data as { error: unknown }).error === 'string' 
            ? (data as { error: string }).error 
            : JSON.stringify((data as { error: unknown }).error))
        : `Request failed (${response.status})`;
    console.error('[evolw] API error', { path, status: response.status, message });
    throw new ApiError(message, response.status, data);
  }

  return data as T;
}

export const api = {
  login(email: string, password: string) {
    return apiRequest<{ success: boolean; token?: string; error?: string }>('/api/login', {
      method: 'POST',
      body: { email, password },
    });
  },

  getContent() {
    return apiRequest<Record<string, unknown>>('/api/content');
  },

  saveContent(content: unknown) {
    return apiRequest<{ success: boolean }>('/api/content', {
      method: 'POST',
      body: content,
      auth: true,
    });
  },

  getJobs(opts?: { auth?: boolean; id?: string }) {
    const q = opts?.id ? `?id=${encodeURIComponent(opts.id)}` : '';
    return apiRequest<Job | Job[]>(`/api/jobs${q}`, { auth: opts?.auth });
  },

  createJob(job: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) {
    return apiRequest<{ success: boolean; job: Job }>('/api/jobs', {
      method: 'POST',
      body: job,
      auth: true,
    });
  },

  updateJob(job: Job) {
    return apiRequest<{ success: boolean; job: Job }>('/api/jobs', {
      method: 'PUT',
      body: job,
      auth: true,
    });
  },

  deleteJob(id: string) {
    return apiRequest<{ success: boolean }>('/api/jobs', {
      method: 'DELETE',
      body: { id },
      auth: true,
    });
  },

  getLeads() {
    return apiRequest<Lead[]>('/api/leads', { auth: true });
  },

  createLead(lead: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    service?: string;
    subject?: string;
    message: string;
  }) {
    return apiRequest<{ success: boolean; lead: Lead }>('/api/leads', {
      method: 'POST',
      body: lead,
    });
  },

  updateLeadStatus(id: string, status: string) {
    return apiRequest<{ success: boolean }>('/api/leads', {
      method: 'PUT',
      body: { id, status },
      auth: true,
    });
  },

  deleteLead(id: string) {
    return apiRequest<{ success: boolean }>('/api/leads', {
      method: 'DELETE',
      body: { id },
      auth: true,
    });
  },

  getApplications() {
    return apiRequest<Application[]>('/api/applications', { auth: true });
  },

  createApplication(payload: {
    jobId: string;
    jobTitle: string;
    name: string;
    email: string;
    phone?: string;
    linkedin?: string;
    portfolio?: string;
    experience?: string;
    skills?: string;
    message?: string;
    resumeBase64: string;
    resumeName: string;
    resumeContentType?: string;
  }) {
    return apiRequest<{ success: boolean; application: Application }>('/api/applications', {
      method: 'POST',
      body: payload,
    });
  },

  updateApplicationStatus(id: string, status: string) {
    return apiRequest<{ success: boolean }>('/api/applications', {
      method: 'PUT',
      body: { id, status },
      auth: true,
    });
  },

  deleteApplication(id: string) {
    return apiRequest<{ success: boolean }>('/api/applications', {
      method: 'DELETE',
      body: { id },
      auth: true,
    });
  },

  getOfferLetters() {
    return apiRequest<unknown[]>('/api/offer-letters', { auth: true });
  },

  createOfferLetter(payload: unknown) {
    return apiRequest<{ success: boolean; offer: unknown }>('/api/offer-letters', {
      method: 'POST',
      body: payload,
      auth: true,
    });
  },

  deleteOfferLetter(id: string) {
    return apiRequest<{ success: boolean }>('/api/offer-letters', {
      method: 'DELETE',
      body: { id },
      auth: true,
    });
  },

  getCertificates() {
    return apiRequest<unknown[]>('/api/certificates', { auth: true });
  },

  verifyCertificate(certId: string) {
    return apiRequest<{ valid: boolean; data?: unknown }>(
      `/api/certificates?certId=${encodeURIComponent(certId)}`
    );
  },

  createCertificate(payload: unknown) {
    return apiRequest<{ success: boolean; certificate: unknown }>('/api/certificates', {
      method: 'POST',
      body: payload,
      auth: true,
    });
  },

  deleteCertificate(id: string) {
    return apiRequest<{ success: boolean }>('/api/certificates', {
      method: 'DELETE',
      body: { id },
      auth: true,
    });
  },

  parseResume(payload: { resumeText: string }) {
    return apiRequest<{ data: Record<string, string> }>('/api/parse-resume', {
      method: 'POST',
      body: payload,
    });
  },

  generateCoverLetter(payload: { resumeData: Record<string, string>; jobTitle: string; jobDescription: string; department?: string }) {
    return apiRequest<{ coverLetter: string }>('/api/generate-cover-letter', {
      method: 'POST',
      body: payload,
    });
  },
};

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('Failed to read file'));
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
