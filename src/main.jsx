import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import './index.css'
import App from './App.jsx'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY} 
      afterSignOutUrl="/"
      clerkJSUrl="https://clerk.inkoraguest.com/npm/@clerk/clerk-js@5/dist/clerk.browser.js"
      domain="clerk.inkoraguest.com"
      isSatellite={false}
    >
      <App />
    </ClerkProvider>
  </StrictMode>,
)
