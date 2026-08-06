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
  resumeSummary?: string | null;
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

  updateApplicationSummary(id: string, resumeSummary: string) {
    return apiRequest<{ success: boolean }>('/api/applications', {
      method: 'PUT',
      body: { id, resumeSummary },
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
    return apiRequest<{ data: Record<string, string> }>('/api/ai?action=parse', {
      method: 'POST',
      body: payload,
    });
  },

  summarizeResume(payload: { resumeText: string }) {
    return apiRequest<{ html: string }>('/api/ai?action=summarize', {
      method: 'POST',
      body: payload,
      auth: true,
    });
  },

  generateCoverLetter(payload: { resumeData: Record<string, string>; jobTitle: string; jobDescription: string; department?: string }) {
    return apiRequest<{ coverLetter: string }>('/api/ai?action=cover-letter', {
      method: 'POST',
      body: payload,
    });
  },

  // ── Billing & Finance ──────────────────────────────────────────

  getBillingDashboard() {
    return apiRequest<BillingDashboardStats>('/api/billing?resource=dashboard', { auth: true });
  },

  getBillingSettings() {
    return apiRequest<CompanySettings>('/api/billing?resource=settings', { auth: true });
  },

  saveBillingSettings(settings: Partial<CompanySettings>) {
    return apiRequest<{ success: boolean; settings: CompanySettings }>('/api/billing?resource=settings', {
      method: 'PUT',
      body: settings,
      auth: true,
    });
  },

  getClients(id?: string) {
    const q = id
      ? `?resource=clients&id=${encodeURIComponent(id)}`
      : '?resource=clients';
    return apiRequest<BillingClient | BillingClient[]>(`/api/billing${q}`, { auth: true });
  },

  saveClient(client: Partial<BillingClient> & { company_name: string; email: string }) {
    return apiRequest<{ success: boolean; client: BillingClient }>('/api/billing?resource=clients', {
      method: client.id ? 'PUT' : 'POST',
      body: client,
      auth: true,
    });
  },

  deleteClient(id: string) {
    return apiRequest<{ success: boolean; message?: string }>('/api/billing?resource=clients', {
      method: 'DELETE',
      body: { id },
      auth: true,
    });
  },

  getProjects(opts?: { id?: string; client_id?: string }) {
    const params = new URLSearchParams({ resource: 'projects' });
    if (opts?.id) params.set('id', opts.id);
    if (opts?.client_id) params.set('client_id', opts.client_id);
    return apiRequest<BillingProject | BillingProject[]>(`/api/billing?${params}`, { auth: true });
  },

  saveProject(project: Partial<BillingProject> & { name: string; client_id: string }) {
    return apiRequest<{ success: boolean; project?: BillingProject }>('/api/billing?resource=projects', {
      method: project.id ? 'PUT' : 'POST',
      body: project,
      auth: true,
    });
  },

  getQuotations(id?: string) {
    const q = id
      ? `?resource=quotations&id=${encodeURIComponent(id)}`
      : '?resource=quotations';
    return apiRequest<any>(`/api/billing${q}`, { auth: true });
  },

  saveQuotation(payload: Record<string, unknown>) {
    return apiRequest<{ success: boolean; id: string; quotation_number?: string }>(
      '/api/billing?resource=quotations',
      {
        method: payload.id ? 'PUT' : 'POST',
        body: payload,
        auth: true,
      }
    );
  },

  updateQuotationStatus(id: string, status: string) {
    return apiRequest<{ success: boolean }>('/api/billing?resource=quotations', {
      method: 'POST',
      body: { action: 'UPDATE_STATUS', id, status },
      auth: true,
    });
  },

  deleteQuotation(id: string) {
    return apiRequest<{ success: boolean }>('/api/billing?resource=quotations', {
      method: 'DELETE',
      body: { id },
      auth: true,
    });
  },

  getInvoices(id?: string, opts?: { open?: boolean }) {
    const params = new URLSearchParams({ resource: 'invoices' });
    if (id) params.set('id', id);
    if (opts?.open) params.set('open', '1');
    return apiRequest<any>(`/api/billing?${params}`, { auth: true });
  },

  saveInvoice(payload: Record<string, unknown>) {
    return apiRequest<{ success: boolean; id: string; invoice_number?: string }>(
      '/api/billing?resource=invoices',
      {
        method: payload.id ? 'PUT' : 'POST',
        body: payload,
        auth: true,
      }
    );
  },

  convertQuotationToInvoice(quotation_id: string) {
    return apiRequest<{ success: boolean; id: string; invoice_number: string }>(
      '/api/billing?resource=invoices',
      {
        method: 'POST',
        body: { action: 'CONVERT_QUOTATION', quotation_id },
        auth: true,
      }
    );
  },

  updateInvoiceStatus(id: string, status: string) {
    return apiRequest<{ success: boolean }>('/api/billing?resource=invoices', {
      method: 'POST',
      body: { action: 'UPDATE_STATUS', id, status },
      auth: true,
    });
  },

  deleteInvoice(id: string) {
    return apiRequest<{ success: boolean }>('/api/billing?resource=invoices', {
      method: 'DELETE',
      body: { id },
      auth: true,
    });
  },

  getPayments(invoice_id?: string) {
    const params = new URLSearchParams({ resource: 'payments' });
    if (invoice_id) params.set('invoice_id', invoice_id);
    return apiRequest<any[]>(`/api/billing?${params}`, { auth: true });
  },

  recordPayment(payload: {
    invoice_id: string;
    amount: number;
    payment_method: string;
    date?: string;
    transaction_id?: string;
    notes?: string;
  }) {
    return apiRequest<{ success: boolean; id: string; reference_number: string }>(
      '/api/billing?resource=payments',
      {
        method: 'POST',
        body: payload,
        auth: true,
      }
    );
  },
};

export interface CompanySettings {
  id?: string;
  brand_name?: string;
  legal_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  billing_address?: string;
  website?: string;
  gstin?: string;
  pan?: string;
  state?: string;
  country?: string;
  pin_code?: string;
  default_currency?: string;
  default_tax_rate?: number;
  quotation_prefix?: string;
  invoice_prefix?: string;
  receipt_prefix?: string;
  default_payment_terms?: string;
  default_quotation_validity?: number;
  default_notes?: string;
  default_terms?: string;
  bank_name?: string;
  account_holder?: string;
  account_number?: string;
  ifsc_code?: string;
  upi_id?: string;
  [key: string]: unknown;
}

export interface BillingClient {
  id?: string;
  company_name: string;
  contact_person?: string | null;
  email: string;
  phone?: string | null;
  website?: string | null;
  gstin?: string | null;
  pan?: string | null;
  billing_address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  pin_code?: string | null;
  notes?: string | null;
  payment_terms?: string | null;
  status?: string;
  [key: string]: unknown;
}

export interface BillingProject {
  id?: string;
  client_id: string;
  name: string;
  code?: string | null;
  description?: string | null;
  status?: string;
  estimated_value?: number | null;
  [key: string]: unknown;
}

export interface BillingDashboardStats {
  totalInvoicedAmount: number;
  totalReceived: number;
  outstanding: number;
  openInvoices: number;
  totalQuotationValue: number;
  approvedQuotationValue: number;
  pendingQuotations: number;
  activeClients: number;
  recentPayments: any[];
  recentInvoices: any[];
  recentQuotations: any[];
}

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
