import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from '@clerk/clerk-react';
import { LandingPage } from './pages/LandingPage';
import { Home } from './pages/Home';
import { HomeArtist } from './pages/HomeArtist';
import { StoreArtist } from './pages/StoreArtist';
import { ArtistProfile } from './pages/ArtistProfile';
import { ClientProfile } from './pages/ClientProfile';
import { Login } from './pages/Login';
import { RegisterRole } from './pages/RegisterRole';
import { SearchClient } from './pages/SearchClient';
import { AdminDashboard } from './pages/AdminDashboard';
import { Pricing } from './pages/Pricing';
import { BottomNav } from './components/BottomNav';
import { useSyncUser } from './lib/useSyncUser';
import { PaymentSuccess } from './pages/PaymentSuccess';
import { ExploreJobs } from './pages/ExploreJobs';
import { ManageJobs } from './pages/ManageJobs';
import { JobApplications } from './pages/JobApplications';
import { AuthProvider } from './lib/AuthContext';

console.log('[Inkora Boot] Arquivo App.jsx carregado');

// Error Boundary Component to catch fatal React crashes
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    console.error('[Inkora Fatal Error]', error);
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ background: '#000', color: '#E52020', padding: '20px', height: '100vh', overflow: 'auto', textAlign: 'center' }}>
          <h2>Erro Fatal Detectado ❌</h2>
          <pre style={{ background: '#111', padding: '10px', borderRadius: '4px' }}>{this.state.error?.toString()}</pre>
          <p>Se o erro persistir, nos avise!</p>
          <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', background: '#E52020', color: '#fff', border: 'none', borderRadius: '4px' }}>Recarregar Site</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Protected Route Component (Clerk version)
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isLoaded } = useUser();
  console.log('[Inkora Auth] ProtectedRoute - isLoaded:', isLoaded);

  if (!isLoaded) return (
    <div style={{ background: '#000', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E52020', fontWeight: 'bold' }}>
      Carregando Segurança...
    </div>
  );

  if (!user) {
    return <RedirectToSignIn />;
  }

  const userRole = user.publicMetadata?.role || localStorage.getItem('inkoraRole') || 'client';

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

function AppContent() {
  const location = useLocation();
  const { user, isLoaded } = useUser();
  
  // Custom hook to automatically create Supabase profile on first sign-in
  useSyncUser();

  const isAuthRoute = location.pathname === '/login' || location.pathname.startsWith('/register') || location.pathname === '/';
  
  if (!isLoaded) return (
    <div style={{ background: '#000', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E52020', fontWeight: 'bold' }}>
      Carregando Inkora...
    </div>
  );

  const activeRole = user?.publicMetadata?.role || localStorage.getItem('inkoraRole') || 'client';

  // Define the 'Home' component based on role
  const RoleHome = activeRole === 'client' ? Home : HomeArtist;

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/planos" element={<Pricing />} />
        <Route path="/success" element={<PaymentSuccess />} />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register/*" element={<RegisterRole />} />

        {/* Main Interface Routes (Protected) */}
        <Route 
          path="/home" 
          element={
            <SignedIn>
              <RoleHome />
            </SignedIn>
          } 
        />
        <Route path="/artist/:id" element={<ArtistProfile />} />
        <Route 
          path="/profile" 
          element={
            <SignedIn>
              <ClientProfile />
            </SignedIn>
          } 
        />

        <Route path="/search" element={<SearchClient />} />
        <Route 
          path="/store" 
          element={
            <SignedIn>
              <StoreArtist />
            </SignedIn>
          } 
        />
        <Route 
          path="/saved" 
          element={
            <SignedIn>
              <ClientProfile />
            </SignedIn>
          } 
        />

        {/* Guest Jobs Routes */}
        <Route 
          path="/jobs/explore" 
          element={
            <SignedIn>
              <ExploreJobs />
            </SignedIn>
          } 
        />
        <Route 
          path="/jobs/manage" 
          element={
            <SignedIn>
              <ManageJobs />
            </SignedIn>
          } 
        />
        <Route 
          path="/jobs/applications/:id" 
          element={
            <SignedIn>
              <JobApplications />
            </SignedIn>
          } 
        />

        {/* Admin Route */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>

      {!isAuthRoute && <SignedIn><BottomNav /></SignedIn>}
    </>
  );
}

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <AuthProvider>
          <div className="container">
            <AppContent />
          </div>
        </AuthProvider>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
