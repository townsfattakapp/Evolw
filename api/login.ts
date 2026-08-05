import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createAdminToken, getAdminCredentials } from './_lib/auth.js';
import { handleOptions, json, logError, methodNotAllowed, readBody } from './_lib/http.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  if (req.method !== 'POST') {
    return methodNotAllowed(res, ['POST']);
  }

  try {
    const body = readBody<{ email?: string; password?: string }>(req);
    const { email: adminEmail, password: adminPassword } = getAdminCredentials();

    if (
      body.email?.trim().toLowerCase() === adminEmail.trim().toLowerCase() &&
      body.password === adminPassword
    ) {
      const token = createAdminToken(adminEmail);
      return json(res, 200, { success: true, token });
    }

    return json(res, 401, { success: false, error: 'Invalid email or password.' });
  } catch (error) {
    logError('login', error);
    return json(res, 500, { success: false, error: 'Authentication service unavailable.' });
  }
}
