import { put, del } from '@vercel/blob';
import { randomUUID } from 'crypto';

export interface UploadedFile {
  url: string;
  key: string;
  name: string;
  contentType: string;
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120);
}

/**
 * Permanent resume storage via Vercel Blob.
 * Uses unguessable object keys. Requires BLOB_READ_WRITE_TOKEN.
 */
export async function uploadResume(params: {
  buffer: Buffer;
  filename: string;
  contentType?: string;
}): Promise<UploadedFile> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error('BLOB_READ_WRITE_TOKEN is not configured');
  }

  const safeName = sanitizeFilename(params.filename || 'resume.pdf');
  const key = `resumes/${randomUUID()}-${safeName}`;

  const blob = await put(key, params.buffer, {
    access: 'public',
    contentType: params.contentType || 'application/octet-stream',
    token,
    addRandomSuffix: false,
  });

  return {
    url: blob.url,
    key: blob.pathname || key,
    name: params.filename,
    contentType: params.contentType || 'application/octet-stream',
  };
}

export async function deleteResume(urlOrKey: string | null | undefined): Promise<void> {
  if (!urlOrKey) return;
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return;
  try {
    await del(urlOrKey, { token });
  } catch (error) {
    console.error('[evolw-api] Failed to delete resume blob', {
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

export function parseDataUrl(dataUrl: string): { buffer: Buffer; contentType: string } | null {
  const match = /^data:([^;]+);base64,(.+)$/s.exec(dataUrl);
  if (!match) return null;
  return {
    contentType: match[1],
    buffer: Buffer.from(match[2], 'base64'),
  };
}
