import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleOptions, json } from './_lib/http.js';

import clients from './_lib/billing/clients.js';
import projects from './_lib/billing/projects.js';
import quotations from './_lib/billing/quotations.js';
import invoices from './_lib/billing/invoices.js';
import payments from './_lib/billing/payments.js';
import settings from './_lib/billing/settings.js';
import dashboard from './_lib/billing/dashboard.js';

/**
 * Single Hobby-plan-friendly billing entrypoint.
 * Frontend calls: /api/billing?resource=clients|projects|quotations|invoices|payments|settings|dashboard
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  const resource = typeof req.query.resource === 'string' ? req.query.resource : '';

  switch (resource) {
    case 'clients':
      return clients(req, res);
    case 'projects':
      return projects(req, res);
    case 'quotations':
      return quotations(req, res);
    case 'invoices':
      return invoices(req, res);
    case 'payments':
      return payments(req, res);
    case 'settings':
      return settings(req, res);
    case 'dashboard':
      return dashboard(req, res);
    default:
      if (!resource) {
        return json(res, 400, {
          error: 'Missing resource. Use ?resource=clients|projects|quotations|invoices|payments|settings|dashboard',
        });
      }
      return json(res, 404, { error: `Unknown billing resource: ${resource}` });
  }
}
