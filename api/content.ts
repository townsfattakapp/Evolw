import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from './_lib/auth';
import { ensureSchema } from './_lib/db';
import { handleOptions, json, logError, methodNotAllowed, readBody } from './_lib/http';

const DEFAULT_CONTENT = {
  hero: {
    badge: 'Software • Products • Technology',
    titleLine1: 'We build technology',
    titleLine2: 'that moves businesses',
    titleHighlight: 'forward.',
    subtitle:
      'EVOLW designs and builds modern software products, digital platforms and technology infrastructure for businesses ready to scale.',
  },
  products: [
    {
      id: 'fattakse',
      name: 'Fattakse',
      tagline: 'A Unit of Evolw',
      description:
        'A connected commerce platform designed to bring local businesses, customers and commerce infrastructure together natively.',
      websiteUrl: 'https://fattakse.in',
      appStoreUrl: 'https://apps.apple.com/in/app/fattakse/id6785628271',
      playStoreUrl: 'https://play.google.com/store/apps/details?id=com.fattakse.user&hl=en_IN',
      features: [
        'Local Commerce',
        'Business OS',
        'Smart Ordering',
        'Live Inventory',
        'Mobile POS',
        'Real-time Data',
      ],
      status: 'live',
      isFeatured: true,
    },
  ],
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  try {
    const sql = await ensureSchema();

    if (req.method === 'GET') {
      const rows = await sql`SELECT data FROM site_content WHERE id = 'main' LIMIT 1`;
      if (!rows.length) {
        return json(res, 200, DEFAULT_CONTENT);
      }
      return json(res, 200, rows[0].data);
    }

    if (req.method === 'POST') {
      if (!requireAdmin(req)) {
        return json(res, 401, { error: 'Unauthorized' });
      }
      const body = readBody(req);
      await sql.query(
        `INSERT INTO site_content (id, data, updated_at)
         VALUES ('main', $1::jsonb, NOW())
         ON CONFLICT (id) DO UPDATE
         SET data = EXCLUDED.data, updated_at = NOW()`,
        [JSON.stringify(body)]
      );
      return json(res, 200, { success: true });
    }

    return methodNotAllowed(res, ['GET', 'POST']);
  } catch (error) {
    logError('content', error);
    return json(res, 500, { error: 'Failed to process content request' });
  }
}
