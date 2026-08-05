import type { VercelRequest, VercelResponse } from '@vercel/node';

export function setCors(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export function handleOptions(req: VercelRequest, res: VercelResponse): boolean {
  if (req.method === 'OPTIONS') {
    setCors(res);
    res.status(204).end();
    return true;
  }
  return false;
}

export function json(
  res: VercelResponse,
  status: number,
  body: unknown
): void {
  setCors(res);
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.status(status).json(body);
}

export function methodNotAllowed(res: VercelResponse, allowed: string[]): void {
  res.setHeader('Allow', allowed.join(', '));
  json(res, 405, { error: 'Method not allowed' });
}

export function readBody<T = Record<string, unknown>>(req: VercelRequest): T {
  if (req.body == null) return {} as T;
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body) as T;
    } catch {
      throw new Error('Invalid JSON body');
    }
  }
  return req.body as T;
}

export function logError(context: string, error: unknown, extra?: Record<string, unknown>): void {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[evolw-api] ${context}`, { message, ...extra });
}
