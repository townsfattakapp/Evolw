import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'crypto';
import { requireAdmin } from './_lib/auth.js';
import { ensureSchema } from './_lib/db.js';
import { handleOptions, json, logError, methodNotAllowed, readBody } from './_lib/http.js';
import { mapApplication, normalizeApplicationStatus } from './_lib/mappers.js';
import { deleteResume, parseDataUrl, uploadResume } from './_lib/storage.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  try {
    const sql = await ensureSchema();

    if (req.method === 'GET') {
      if (!requireAdmin(req)) {
        return json(res, 401, { error: 'Unauthorized' });
      }
      const rows = await sql`SELECT * FROM applications ORDER BY created_at DESC`;
      return json(res, 200, rows.map((r) => mapApplication(r as Record<string, unknown>)));
    }

    if (req.method === 'POST') {
      const body = readBody<{
        jobId?: string;
        jobTitle?: string;
        name?: string;
        email?: string;
        phone?: string;
        linkedin?: string;
        portfolio?: string;
        experience?: string;
        skills?: string;
        message?: string;
        resumeBase64?: string;
        resumeName?: string;
        resumeContentType?: string;
      }>(req);

      if (!body.name?.trim() || !body.email?.trim()) {
        return json(res, 400, { error: 'Name and email are required' });
      }

      if (!body.resumeBase64) {
        return json(res, 400, { error: 'Resume file is required' });
      }

      const parsed = parseDataUrl(body.resumeBase64);
      if (!parsed) {
        return json(res, 400, { error: 'Invalid resume payload' });
      }

      // Vercel serverless body limit ~4.5MB; keep a hard cap
      if (parsed.buffer.length > 4.5 * 1024 * 1024) {
        return json(res, 400, { error: 'Resume exceeds 4.5MB limit' });
      }

      let uploaded;
      try {
        uploaded = await uploadResume({
          buffer: parsed.buffer,
          filename: body.resumeName || 'resume.pdf',
          contentType: body.resumeContentType || parsed.contentType,
        });
      } catch (error) {
        logError('applications.upload', error);
        return json(res, 500, { error: 'Failed to store resume. Please try again.' });
      }

      const id = randomUUID();

      try {
        await sql`
          INSERT INTO applications (
            id, job_id, job_title, name, email, phone, linkedin, portfolio,
            experience, skills, message, resume_url, resume_name, resume_key, status
          ) VALUES (
            ${id},
            ${body.jobId || null},
            ${body.jobTitle || null},
            ${body.name.trim()},
            ${body.email.trim()},
            ${body.phone?.trim() || null},
            ${body.linkedin?.trim() || null},
            ${body.portfolio?.trim() || null},
            ${body.experience?.trim() || null},
            ${body.skills?.trim() || null},
            ${body.message?.trim() || null},
            ${uploaded.url},
            ${uploaded.name},
            ${uploaded.key},
            'new'
          )
        `;
      } catch (error) {
        await deleteResume(uploaded.url);
        throw error;
      }

      const rows = await sql`SELECT * FROM applications WHERE id = ${id} LIMIT 1`;
      return json(res, 201, {
        success: true,
        application: mapApplication(rows[0] as Record<string, unknown>),
      });
    }

    if (req.method === 'PUT') {
      if (!requireAdmin(req)) {
        return json(res, 401, { error: 'Unauthorized' });
      }

      const body = readBody<{ id?: string; status?: string; resumeSummary?: string }>(req);
      if (!body.id) return json(res, 400, { error: 'Application id is required' });

      if (body.resumeSummary !== undefined) {
        await sql`
          UPDATE applications SET resume_summary = ${body.resumeSummary}, updated_at = NOW()
          WHERE id = ${body.id}
        `;
        return json(res, 200, { success: true });
      }

      if (body.status !== undefined) {
        const status = normalizeApplicationStatus(body.status || 'new');
        await sql`
          UPDATE applications SET status = ${status}, updated_at = NOW()
          WHERE id = ${body.id}
        `;
        return json(res, 200, { success: true });
      }
      
      return json(res, 400, { error: 'No update fields provided' });
    }

    if (req.method === 'DELETE') {
      if (!requireAdmin(req)) {
        return json(res, 401, { error: 'Unauthorized' });
      }

      const body = readBody<{ id?: string }>(req);
      if (!body.id) return json(res, 400, { error: 'Application id is required' });

      const rows = await sql`
        SELECT resume_url, resume_key FROM applications WHERE id = ${body.id} LIMIT 1
      `;
      await sql`DELETE FROM applications WHERE id = ${body.id}`;

      if (rows.length) {
        await deleteResume(
          (rows[0].resume_url as string) || (rows[0].resume_key as string) || null
        );
      }

      return json(res, 200, { success: true });
    }

    return methodNotAllowed(res, ['GET', 'POST', 'PUT', 'DELETE']);
  } catch (error) {
    logError('applications', error);
    return json(res, 500, { error: 'Failed to process applications request' });
  }
}
