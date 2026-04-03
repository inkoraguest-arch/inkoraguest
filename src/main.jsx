import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import './index.css'
import App from './App.jsx'

// Hardcoded production key as fallback to avoid Vercel env sync delays
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.startsWith('pk_live_') 
    ? import.meta.env.VITE_CLERK_PUBLISHABLE_KEY 
    : 'pk_live_Y2xlcmsuaW5rb3JhZ3Vlc3QuY29tJA';

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

const isProd = PUBLISHABLE_KEY.startsWith('pk_live_');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY} 
      afterSignOutUrl="/"
      // These only work with production keys (pk_live)
      clerkJSUrl={isProd ? "https://clerk.inkoraguest.com/npm/@clerk/clerk-js@5/dist/clerk.browser.js" : undefined}
      domain={isProd ? "inkoraguest.com" : undefined}
      isSatellite={false}
    >
      <App />
    </ClerkProvider>
  </StrictMode>,
)
