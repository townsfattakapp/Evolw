import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ensureSchema } from './_lib/db';
import { handleOptions, json, logError } from './_lib/http';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  try {
    await ensureSchema();
    return json(res, 200, { ok: true, service: 'evolw-api' });
  } catch (error) {
    logError('health', error);
    return json(res, 503, { ok: false, error: 'Database unavailable' });
  }
}
