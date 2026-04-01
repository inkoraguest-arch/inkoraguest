import { useState, useEffect } from 'react';
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
import { RegisterClient } from './pages/RegisterClient';
import { RegisterArtist } from './pages/RegisterArtist';
import { RegisterStudio } from './pages/RegisterStudio';
import { SearchClient } from './pages/SearchClient';
import { AdminDashboard } from './pages/AdminDashboard';
import { Pricing } from './pages/Pricing';
import { BottomNav } from './components/BottomNav';

// Protected Route Component (Clerk version)
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isLoaded } = useUser();
  const location = useLocation();

  if (!isLoaded) return null;

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

  const isAuthRoute = location.pathname === '/login' || location.pathname.startsWith('/register') || location.pathname === '/';
  
  if (!isLoaded) return null;

  const activeRole = user?.publicMetadata?.role || localStorage.getItem('inkoraRole') || 'client';

  // Define the 'Home' component based on role
  const RoleHome = activeRole === 'client' ? Home : HomeArtist;

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/planos" element={<Pricing />} />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterRole />} />
        <Route path="/register/client" element={<RegisterClient />} />
        <Route path="/register/artist" element={<RegisterArtist />} />
        <Route path="/register/studio" element={<RegisterStudio />} />

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
      <div className="container">
        <AppContent />
      </div>
    </Router>
  );
}

export default App;
