import initialContent from '../data/content.json';
import initialLeads from '../data/leads.json';
import initialApps from '../data/applications.json';
import initialOffers from '../data/offer-letters.json';
import initialCerts from '../data/certificates.json';

// Utility to create a Response object
const createResponse = (body: any, status = 200) => {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
};

export function setupMockApi() {
  const originalFetch = window.fetch;

  // 1. Seed localStorage with initial data if it doesn't exist
  if (!localStorage.getItem('evolw_content')) {
    localStorage.setItem('evolw_content', JSON.stringify(initialContent));
  }
  if (!localStorage.getItem('evolw_leads')) {
    localStorage.setItem('evolw_leads', JSON.stringify(initialLeads));
  }
  if (!localStorage.getItem('evolw_applications')) {
    localStorage.setItem('evolw_applications', JSON.stringify(initialApps));
  }
  if (!localStorage.getItem('evolw_offers')) {
    localStorage.setItem('evolw_offers', JSON.stringify(initialOffers));
  }
  if (!localStorage.getItem('evolw_certs')) {
    localStorage.setItem('evolw_certs', JSON.stringify(initialCerts));
  }

  // 2. Intercept global fetch
  window.fetch = async (input, init) => {
    // Determine the URL string
    let urlString = '';
    if (typeof input === 'string') {
      urlString = input;
    } else if (input instanceof URL) {
      urlString = input.toString();
    } else {
      urlString = input.url;
    }

    // Only intercept /api/ routes
    if (!urlString.includes('/api/')) {
      return originalFetch(input, init);
    }

    const method = init?.method || 'GET';
    const url = new URL(urlString, window.location.origin);
    const path = url.pathname;

    // Helper to read/write JSON body
    let parsedBody: any = null;
    if (init?.body && typeof init.body === 'string') {
      try {
        parsedBody = JSON.parse(init.body);
      } catch (e) {
        return createResponse({ error: 'Invalid JSON' }, 400);
      }
    }

    // --- /api/login ---
    if (path === '/api/login' && method === 'POST') {
      if (parsedBody?.email === 'admin@evolw.in' && parsedBody?.password === 'evolw2026') {
        return createResponse({ success: true, token: 'ey_mock_secure_token_evolw_admin' });
      }
      return createResponse({ success: false, error: 'Invalid email or password.' }, 401);
    }

    // --- /api/content ---
    if (path === '/api/content') {
      if (method === 'GET') {
        const data = JSON.parse(localStorage.getItem('evolw_content') || '{}');
        return createResponse(data);
      } else if (method === 'POST') {
        localStorage.setItem('evolw_content', JSON.stringify(parsedBody));
        return createResponse({ success: true });
      }
    }

    // --- /api/leads ---
    if (path === '/api/leads') {
      let leads = JSON.parse(localStorage.getItem('evolw_leads') || '[]');
      
      if (method === 'GET') {
        return createResponse(leads);
      } else if (method === 'POST') {
        parsedBody.id = Date.now().toString();
        parsedBody.date = new Date().toISOString().split('T')[0];
        parsedBody.status = 'New';
        leads.unshift(parsedBody);
        localStorage.setItem('evolw_leads', JSON.stringify(leads));
        return createResponse({ success: true, lead: parsedBody });
      } else if (method === 'PUT') {
        leads = leads.map((l: any) => l.id === parsedBody.id ? parsedBody : l);
        localStorage.setItem('evolw_leads', JSON.stringify(leads));
        return createResponse({ success: true });
      } else if (method === 'DELETE') {
        leads = leads.filter((l: any) => l.id !== parsedBody.id);
        localStorage.setItem('evolw_leads', JSON.stringify(leads));
        return createResponse({ success: true });
      }
    }

    // --- /api/applications ---
    if (path === '/api/applications') {
      let apps = JSON.parse(localStorage.getItem('evolw_applications') || '[]');
      
      if (method === 'GET') {
        return createResponse(apps);
      } else if (method === 'POST') {
        // Handle Base64 Resume directly as data URI instead of file upload
        if (parsedBody.resumeBase64 && parsedBody.resumeName) {
          parsedBody.resumeUrl = parsedBody.resumeBase64;
          delete parsedBody.resumeBase64;
          delete parsedBody.resumeName;
        }
        parsedBody.id = Date.now().toString();
        parsedBody.date = new Date().toISOString().split('T')[0];
        parsedBody.status = 'New';
        apps.unshift(parsedBody);
        localStorage.setItem('evolw_applications', JSON.stringify(apps));
        return createResponse({ success: true, application: parsedBody });
      } else if (method === 'PUT') {
        apps = apps.map((a: any) => a.id === parsedBody.id ? parsedBody : a);
        localStorage.setItem('evolw_applications', JSON.stringify(apps));
        return createResponse({ success: true });
      } else if (method === 'DELETE') {
        apps = apps.filter((a: any) => a.id !== parsedBody.id);
        localStorage.setItem('evolw_applications', JSON.stringify(apps));
        return createResponse({ success: true });
      }
    }

    // --- /api/offer-letters ---
    if (path === '/api/offer-letters') {
      let offers = JSON.parse(localStorage.getItem('evolw_offers') || '[]');
      
      if (method === 'GET') {
        return createResponse(offers);
      } else if (method === 'POST') {
        const year = new Date().getFullYear();
        const count = offers.length + 1;
        const paddedCount = count.toString().padStart(3, '0');
        const refId = `EV/HR/${year}/${paddedCount}`;
        
        parsedBody.id = Date.now().toString();
        parsedBody.refId = refId;
        parsedBody.createdAt = new Date().toISOString();
        
        offers.unshift(parsedBody);
        localStorage.setItem('evolw_offers', JSON.stringify(offers));
        return createResponse({ success: true, offer: parsedBody });
      }
    }

    // --- /api/certificates ---
    if (path === '/api/certificates') {
      let certs = JSON.parse(localStorage.getItem('evolw_certs') || '[]');
      
      if (method === 'GET') {
        const queryCertId = url.searchParams.get('certId');
        if (queryCertId) {
          const found = certs.find((c: any) => c.certId === queryCertId);
          if (found) {
            return createResponse({ valid: true, data: found });
          }
          return createResponse({ valid: false });
        }
        return createResponse(certs);
      } else if (method === 'POST') {
        const year = new Date().getFullYear();
        const count = certs.length + 1;
        const paddedCount = count.toString().padStart(3, '0');
        const certId = `EV/CERT/${year}/${paddedCount}`;
        
        parsedBody.id = Date.now().toString();
        parsedBody.certId = certId;
        parsedBody.createdAt = new Date().toISOString();
        
        certs.unshift(parsedBody);
        localStorage.setItem('evolw_certs', JSON.stringify(certs));
        return createResponse({ success: true, certificate: parsedBody });
      }
    }

    // Fallback for unmatched API routes
    return createResponse({ error: 'Not Found' }, 404);
  };
}
