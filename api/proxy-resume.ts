import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleOptions, json, methodNotAllowed } from './_lib/http.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  if (req.method !== 'GET') {
    return methodNotAllowed(res, ['GET']);
  }

  const { url } = req.query;
  
  if (!url || typeof url !== 'string' || !url.includes('blob.vercel-storage.com')) {
    return json(res, 400, { error: 'Invalid or missing blob URL' });
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch from blob: ${response.statusText}`);
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="resume.pdf"');
    // We intentionally omit X-Frame-Options here to allow the iframe on our admin panel to render it.

    const arrayBuffer = await response.arrayBuffer();
    return res.status(200).send(Buffer.from(arrayBuffer));
  } catch (error) {
    console.error('[evolw-api] Proxy error:', error);
    return json(res, 500, { error: 'Failed to proxy resume' });
  }
}
