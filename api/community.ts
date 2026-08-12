import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleOptions, json, logError } from './_lib/http.js';
import { ensureSchema } from './_lib/db.js';
import {
  handleCommunityDiscussions,
  handleCommunityEvents,
  handleCommunityGithub,
  handleCommunityHackathons,
  handleCommunityProjects,
} from './_lib/community/handlers.js';

/**
 * Hobby-plan-friendly community entrypoint.
 * Use: /api/community?resource=projects|hackathons|events|discussions|github|health
 *
 * Legacy path aliases (rewritten in vercel.json):
 *   /api/community/projects → resource=projects
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  try {
    const resource = typeof req.query.resource === 'string' ? req.query.resource : 'projects';

    switch (resource) {
      case 'health':
        await ensureSchema();
        return json(res, 200, { ok: true, service: 'evolw-community' });
      case 'projects':
        return handleCommunityProjects(req, res);
      case 'hackathons':
        return handleCommunityHackathons(req, res);
      case 'events':
        return handleCommunityEvents(req, res);
      case 'discussions':
        return handleCommunityDiscussions(req, res);
      case 'github':
        return handleCommunityGithub(req, res);
      default:
        return json(res, 400, {
          error:
            'Unknown resource. Use ?resource=projects|hackathons|events|discussions|github|health',
        });
    }
  } catch (error) {
    logError('community', error);
    return json(res, 500, { error: 'Failed to process community request' });
  }
}
