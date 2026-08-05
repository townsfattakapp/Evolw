import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ensureSchema } from './_lib/db.js';
import { handleOptions, logError } from './_lib/http.js';

const SITE = 'https://www.evolw.in';

const STATIC_PATHS: { path: string; changefreq: string; priority: string }[] = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/products', changefreq: 'weekly', priority: '0.9' },
  { path: '/services', changefreq: 'weekly', priority: '0.9' },
  { path: '/about', changefreq: 'monthly', priority: '0.8' },
  { path: '/careers', changefreq: 'daily', priority: '0.8' },
  { path: '/contact', changefreq: 'monthly', priority: '0.8' },
  { path: '/verify', changefreq: 'monthly', priority: '0.5' },
  { path: '/privacy', changefreq: 'yearly', priority: '0.3' },
  { path: '/terms', changefreq: 'yearly', priority: '0.3' },
];

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  if (req.method !== 'GET') {
    res.status(405).end();
    return;
  }

  const today = new Date().toISOString().split('T')[0];
  const urls: { loc: string; lastmod: string; changefreq: string; priority: string }[] =
    STATIC_PATHS.map((p) => ({
      loc: `${SITE}${p.path === '/' ? '' : p.path}`,
      lastmod: today,
      changefreq: p.changefreq,
      priority: p.priority,
    }));

  try {
    const sql = await ensureSchema();
    const jobs = await sql`
      SELECT id, updated_at FROM jobs WHERE status = 'published' ORDER BY updated_at DESC
    `;
    for (const job of jobs) {
      urls.push({
        loc: `${SITE}/careers/${job.id}`,
        lastmod: job.updated_at
          ? new Date(String(job.updated_at)).toISOString().split('T')[0]
          : today,
        changefreq: 'weekly',
        priority: '0.7',
      });
    }
  } catch (error) {
    logError('sitemap', error);
    // Still return static URLs if DB unavailable
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.status(200).send(body);
}
