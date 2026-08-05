import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { setupMockApi } from './lib/mockApi.ts'

// Initialize the mock backend interceptor to handle /api/ requests in browser
setupMockApi()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
