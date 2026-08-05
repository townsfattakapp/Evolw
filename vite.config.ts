import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

// Custom Vite plugin to act as a local CMS API for development
const localCmsPlugin = () => {
  return {
    name: 'local-cms-api',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.url === '/api/content') {
          const contentPath = path.resolve(process.cwd(), 'src/data/content.json')

          if (req.method === 'GET') {
            if (fs.existsSync(contentPath)) {
              const data = fs.readFileSync(contentPath, 'utf-8')
              res.setHeader('Content-Type', 'application/json')
              res.end(data)
            } else {
              res.statusCode = 404
              res.end(JSON.stringify({ error: 'Content not found' }))
            }
          } else if (req.method === 'POST') {
            let body = ''
            req.on('data', (chunk: any) => {
              body += chunk.toString()
            })
            req.on('end', () => {
              try {
                const parsedBody = JSON.parse(body)
                fs.writeFileSync(contentPath, JSON.stringify(parsedBody, null, 2))
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ success: true }))
              } catch (e) {
                res.statusCode = 400
                res.end(JSON.stringify({ error: 'Invalid JSON' }))
              }
            })
          } else {
            res.statusCode = 405
            res.end()
          }
        } else if (req.url === '/api/leads') {
          const leadsPath = path.resolve(process.cwd(), 'src/data/leads.json')
          
          if (req.method === 'GET') {
            if (fs.existsSync(leadsPath)) {
              const data = fs.readFileSync(leadsPath, 'utf-8')
              res.setHeader('Content-Type', 'application/json')
              res.end(data)
            } else {
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify([]))
            }
          } else if (req.method === 'POST') {
            let body = ''
            req.on('data', (chunk: any) => { body += chunk.toString() })
            req.on('end', () => {
              try {
                const newLead = JSON.parse(body)
                let leads = []
                if (fs.existsSync(leadsPath)) {
                  leads = JSON.parse(fs.readFileSync(leadsPath, 'utf-8'))
                }
                newLead.id = Date.now().toString()
                newLead.date = new Date().toISOString().split('T')[0]
                newLead.status = 'New'
                leads.unshift(newLead)
                fs.writeFileSync(leadsPath, JSON.stringify(leads, null, 2))
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ success: true, lead: newLead }))
              } catch (e) {
                res.statusCode = 400
                res.end(JSON.stringify({ error: 'Invalid JSON' }))
              }
            })
          } else if (req.method === 'PUT') {
            let body = ''
            req.on('data', (chunk: any) => { body += chunk.toString() })
            req.on('end', () => {
              try {
                const updatedLead = JSON.parse(body)
                let leads = []
                if (fs.existsSync(leadsPath)) {
                  leads = JSON.parse(fs.readFileSync(leadsPath, 'utf-8'))
                }
                leads = leads.map((l: any) => l.id === updatedLead.id ? updatedLead : l)
                fs.writeFileSync(leadsPath, JSON.stringify(leads, null, 2))
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ success: true }))
              } catch (e) {
                res.statusCode = 400
                res.end(JSON.stringify({ error: 'Invalid JSON' }))
              }
            })
          } else if (req.method === 'DELETE') {
            let body = ''
            req.on('data', (chunk: any) => { body += chunk.toString() })
            req.on('end', () => {
              try {
                const { id } = JSON.parse(body)
                let leads = []
                if (fs.existsSync(leadsPath)) {
                  leads = JSON.parse(fs.readFileSync(leadsPath, 'utf-8'))
                }
                leads = leads.filter((l: any) => l.id !== id)
                fs.writeFileSync(leadsPath, JSON.stringify(leads, null, 2))
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ success: true }))
              } catch (e) {
                res.statusCode = 400
                res.end(JSON.stringify({ error: 'Invalid JSON' }))
              }
            })
          } else {
            res.statusCode = 405
            res.end()
          }
        } else if (req.url === '/api/applications') {
          const appsPath = path.resolve(process.cwd(), 'src/data/applications.json')
          
          if (req.method === 'GET') {
            if (fs.existsSync(appsPath)) {
              const data = fs.readFileSync(appsPath, 'utf-8')
              res.setHeader('Content-Type', 'application/json')
              res.end(data)
            } else {
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify([]))
            }
          } else if (req.method === 'POST') {
            let body = ''
            req.on('data', (chunk: any) => { body += chunk.toString() })
            req.on('end', () => {
              try {
                const newApp = JSON.parse(body)
                
                // Handle Base64 Resume Upload
                if (newApp.resumeBase64 && newApp.resumeName) {
                  const base64Data = newApp.resumeBase64.replace(/^data:.*?;base64,/, "");
                  const buffer = Buffer.from(base64Data, 'base64');
                  
                  const uploadsDir = path.resolve(process.cwd(), 'public/uploads');
                  if (!fs.existsSync(uploadsDir)) {
                    fs.mkdirSync(uploadsDir, { recursive: true });
                  }
                  
                  const safeName = newApp.resumeName.replace(/[^a-zA-Z0-9.-]/g, '_');
                  const fileName = `${Date.now()}-${safeName}`;
                  const filePath = path.join(uploadsDir, fileName);
                  
                  fs.writeFileSync(filePath, buffer);
                  
                  newApp.resumeUrl = `/uploads/${fileName}`;
                  delete newApp.resumeBase64;
                  delete newApp.resumeName;
                }
                
                let apps = []
                if (fs.existsSync(appsPath)) {
                  apps = JSON.parse(fs.readFileSync(appsPath, 'utf-8'))
                }
                newApp.id = Date.now().toString()
                newApp.date = new Date().toISOString().split('T')[0]
                newApp.status = 'New'
                apps.unshift(newApp)
                fs.writeFileSync(appsPath, JSON.stringify(apps, null, 2))
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ success: true, application: newApp }))
              } catch (e) {
                res.statusCode = 400
                res.end(JSON.stringify({ error: 'Invalid JSON' }))
              }
            })
          } else if (req.method === 'PUT') {
            let body = ''
            req.on('data', (chunk: any) => { body += chunk.toString() })
            req.on('end', () => {
              try {
                const updatedApp = JSON.parse(body)
                let apps = []
                if (fs.existsSync(appsPath)) {
                  apps = JSON.parse(fs.readFileSync(appsPath, 'utf-8'))
                }
                apps = apps.map((a: any) => a.id === updatedApp.id ? updatedApp : a)
                fs.writeFileSync(appsPath, JSON.stringify(apps, null, 2))
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ success: true }))
              } catch (e) {
                res.statusCode = 400
                res.end(JSON.stringify({ error: 'Invalid JSON' }))
              }
            })
          } else if (req.method === 'DELETE') {
            let body = ''
            req.on('data', (chunk: any) => { body += chunk.toString() })
            req.on('end', () => {
              try {
                const { id } = JSON.parse(body)
                let apps = []
                if (fs.existsSync(appsPath)) {
                  apps = JSON.parse(fs.readFileSync(appsPath, 'utf-8'))
                }
                apps = apps.filter((a: any) => a.id !== id)
                fs.writeFileSync(appsPath, JSON.stringify(apps, null, 2))
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ success: true }))
              } catch (e) {
                res.statusCode = 400
                res.end(JSON.stringify({ error: 'Invalid JSON' }))
              }
            })
          } else {
            res.statusCode = 405
            res.end()
          }
        } else if (req.url?.startsWith('/api/offer-letters')) {
          const offersPath = path.resolve(process.cwd(), 'src/data/offer-letters.json')
          
          if (req.method === 'GET') {
            if (fs.existsSync(offersPath)) {
              res.setHeader('Content-Type', 'application/json')
              res.end(fs.readFileSync(offersPath, 'utf-8'))
            } else {
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify([]))
            }
          } else if (req.method === 'POST') {
            let body = ''
            req.on('data', (chunk: any) => { body += chunk.toString() })
            req.on('end', () => {
              try {
                const newOffer = JSON.parse(body)
                let offers = []
                if (fs.existsSync(offersPath)) {
                  offers = JSON.parse(fs.readFileSync(offersPath, 'utf-8'))
                }
                
                // Generate sequential ID
                const year = new Date().getFullYear();
                const count = offers.length + 1;
                const paddedCount = count.toString().padStart(3, '0');
                const refId = `EV/HR/${year}/${paddedCount}`;
                
                newOffer.id = Date.now().toString();
                newOffer.refId = refId;
                newOffer.createdAt = new Date().toISOString();
                
                offers.unshift(newOffer)
                fs.writeFileSync(offersPath, JSON.stringify(offers, null, 2))
                
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ success: true, offer: newOffer }))
              } catch (e) {
                res.statusCode = 400
                res.end(JSON.stringify({ error: 'Invalid JSON' }))
              }
            })
          } else {
            res.statusCode = 405
            res.end()
          }
        } else if (req.url?.startsWith('/api/certificates')) {
          const certsPath = path.resolve(process.cwd(), 'src/data/certificates.json')
          
          if (req.method === 'GET') {
            const urlObj = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`)
            const queryCertId = urlObj.searchParams.get('certId')

            if (fs.existsSync(certsPath)) {
              const allCerts = JSON.parse(fs.readFileSync(certsPath, 'utf-8'))
              res.setHeader('Content-Type', 'application/json')
              
              if (queryCertId) {
                const found = allCerts.find((c: any) => c.certId === queryCertId)
                if (found) {
                  res.end(JSON.stringify({ valid: true, data: found }))
                } else {
                  res.end(JSON.stringify({ valid: false }))
                }
              } else {
                res.end(JSON.stringify(allCerts))
              }
            } else {
              res.setHeader('Content-Type', 'application/json')
              if (queryCertId) {
                res.end(JSON.stringify({ valid: false }))
              } else {
                res.end(JSON.stringify([]))
              }
            }
          } else if (req.method === 'POST') {
            let body = ''
            req.on('data', (chunk: any) => { body += chunk.toString() })
            req.on('end', () => {
              try {
                const newCert = JSON.parse(body)
                let certs = []
                if (fs.existsSync(certsPath)) {
                  certs = JSON.parse(fs.readFileSync(certsPath, 'utf-8'))
                }
                
                // Generate sequential ID
                const year = new Date().getFullYear();
                const count = certs.length + 1;
                const paddedCount = count.toString().padStart(3, '0');
                const certId = `EV/CERT/${year}/${paddedCount}`;
                
                newCert.id = Date.now().toString();
                newCert.certId = certId;
                newCert.createdAt = new Date().toISOString();
                
                certs.unshift(newCert)
                fs.writeFileSync(certsPath, JSON.stringify(certs, null, 2))
                
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ success: true, certificate: newCert }))
              } catch (e) {
                res.statusCode = 400
                res.end(JSON.stringify({ error: 'Invalid JSON' }))
              }
            })
          } else {
            res.statusCode = 405
            res.end()
          }
        } else if (req.url === '/api/login' && req.method === 'POST') {
          let body = ''
          req.on('data', (chunk: any) => { body += chunk.toString() })
          req.on('end', () => {
            try {
              const { email, password } = JSON.parse(body)
              
              // Hardcoded secure credentials for this project
              if (email === 'admin@evolw.in' && password === 'evolw2026') {
                res.setHeader('Content-Type', 'application/json')
                // Issue a mock secure token
                res.end(JSON.stringify({ success: true, token: 'ey_mock_secure_token_evolw_admin' }))
              } else {
                res.statusCode = 401
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ success: false, error: 'Invalid email or password.' }))
              }
            } catch (e) {
              res.statusCode = 400
              res.end(JSON.stringify({ error: 'Invalid JSON' }))
            }
          })
        } else {
          next()
        }
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), localCmsPlugin()],
  server: {
    watch: {
      ignored: ['**/src/data/**']
    }
  }
})
