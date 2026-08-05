import { createHmac, timingSafeEqual } from 'crypto';
import type { VercelRequest } from '@vercel/node';

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function getSecret(): string {
  const secret = process.env.ADMIN_TOKEN_SECRET || process.env.ADMIN_PASSWORD;
  if (!secret) {
    throw new Error('ADMIN_TOKEN_SECRET (or ADMIN_PASSWORD) is not configured');
  }
  return secret;
}

export function getAdminCredentials(): { email: string; password: string } {
  const email = process.env.ADMIN_EMAIL || 'admin@evolw.in';
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error('ADMIN_PASSWORD is not configured');
  }
  return { email, password };
}

export function createAdminToken(email: string): string {
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const payload = `${email}:${expiresAt}`;
  const signature = createHmac('sha256', getSecret()).update(payload).digest('hex');
  return Buffer.from(`${payload}:${signature}`).toString('base64url');
}

export function verifyAdminToken(token: string | null | undefined): boolean {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const parts = decoded.split(':');
    if (parts.length !== 3) return false;
    const [email, expiresAtStr, signature] = parts;
    const expiresAt = Number(expiresAtStr);
    if (!email || !Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

    const payload = `${email}:${expiresAtStr}`;
    const expected = createHmac('sha256', getSecret()).update(payload).digest('hex');
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function getBearerToken(req: VercelRequest): string | null {
  const header = req.headers.authorization;
  if (typeof header === 'string' && header.startsWith('Bearer ')) {
    return header.slice(7).trim();
  }
  return null;
}

export function requireAdmin(req: VercelRequest): boolean {
  return verifyAdminToken(getBearerToken(req));
}
