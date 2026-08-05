export type JobStatus = 'draft' | 'published';
export type LeadStatus = 'new' | 'read' | 'resolved';
export type ApplicationStatus =
  | 'new'
  | 'reviewing'
  | 'shortlisted'
  | 'rejected'
  | 'hired';

export interface JobRecord {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LeadRecord {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  service: string | null;
  subject: string | null;
  message: string | null;
  status: LeadStatus;
  date: string;
  createdAt: string;
}

export interface ApplicationRecord {
  id: string;
  jobId: string | null;
  jobTitle: string | null;
  name: string;
  email: string;
  phone: string | null;
  linkedin: string | null;
  portfolio: string | null;
  experience: string | null;
  skills: string | null;
  message: string | null;
  resumeUrl: string | null;
  resumeName: string | null;
  status: ApplicationStatus;
  date: string;
  createdAt: string;
}

export function mapJob(row: Record<string, unknown>): JobRecord {
  return {
    id: String(row.id),
    title: String(row.title ?? ''),
    department: String(row.department ?? ''),
    location: String(row.location ?? ''),
    type: String(row.type ?? ''),
    description: String(row.description ?? ''),
    status: (row.status as JobStatus) || 'published',
    createdAt: row.created_at ? new Date(String(row.created_at)).toISOString() : '',
    updatedAt: row.updated_at ? new Date(String(row.updated_at)).toISOString() : '',
  };
}

export function mapLead(row: Record<string, unknown>): LeadRecord {
  const createdAt = row.created_at ? new Date(String(row.created_at)).toISOString() : '';
  return {
    id: String(row.id),
    name: String(row.name ?? ''),
    email: String(row.email ?? ''),
    phone: row.phone != null ? String(row.phone) : null,
    company: row.company != null ? String(row.company) : null,
    service: row.service != null ? String(row.service) : null,
    subject: row.subject != null ? String(row.subject) : null,
    message: row.message != null ? String(row.message) : null,
    status: normalizeLeadStatus(String(row.status ?? 'new')),
    date: createdAt ? createdAt.split('T')[0] : '',
    createdAt,
  };
}

export function mapApplication(row: Record<string, unknown>): ApplicationRecord {
  const createdAt = row.created_at ? new Date(String(row.created_at)).toISOString() : '';
  return {
    id: String(row.id),
    jobId: row.job_id != null ? String(row.job_id) : null,
    jobTitle: row.job_title != null ? String(row.job_title) : null,
    name: String(row.name ?? ''),
    email: String(row.email ?? ''),
    phone: row.phone != null ? String(row.phone) : null,
    linkedin: row.linkedin != null ? String(row.linkedin) : null,
    portfolio: row.portfolio != null ? String(row.portfolio) : null,
    experience: row.experience != null ? String(row.experience) : null,
    skills: row.skills != null ? String(row.skills) : null,
    message: row.message != null ? String(row.message) : null,
    resumeUrl: row.resume_url != null ? String(row.resume_url) : null,
    resumeName: row.resume_name != null ? String(row.resume_name) : null,
    status: normalizeApplicationStatus(String(row.status ?? 'new')),
    date: createdAt ? createdAt.split('T')[0] : '',
    createdAt,
  };
}

export function normalizeLeadStatus(status: string): LeadStatus {
  const s = status.toLowerCase();
  if (s === 'contacted' || s === 'read') return 'read';
  if (s === 'closed' || s === 'resolved') return 'resolved';
  return 'new';
}

export function normalizeApplicationStatus(status: string): ApplicationStatus {
  const s = status.toLowerCase();
  if (s === 'reviewed' || s === 'reviewing') return 'reviewing';
  if (s === 'shortlisted') return 'shortlisted';
  if (s === 'rejected') return 'rejected';
  if (s === 'hired') return 'hired';
  return 'new';
}

export function normalizeJobStatus(status: string | undefined | null): JobStatus {
  if (!status) return 'published';
  return status.toLowerCase() === 'draft' ? 'draft' : 'published';
}
