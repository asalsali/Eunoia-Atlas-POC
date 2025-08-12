import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import LandingPage from './components/LandingPage';

import DonationForm from './components/DonationForm';
import CharityStaffView from './components/CharityStaffView';
import SuperAdminView from './components/SuperAdminView';

import Analytics from './components/Analytics';
import Predictive from './components/Predictive';
import DonorIntentForm from './components/DonorIntentForm';
import WhisperFlow from './components/WhisperFlow';
import RlusdDemo from './components/RlusdDemo';
import './App.css';
import { WalletProvider } from './context/WalletContext';

// Component to handle role-based navigation
const AppContent: React.FC = () => {
  const [userRole, setUserRole] = useState<'donor' | 'charity' | 'admin'>('donor');
  const navigate = useNavigate();
  const location = useLocation();

  // Function to get the default route for each role
  const getDefaultRoute = (role: 'donor' | 'charity' | 'admin') => {
    switch (role) {
      case 'donor':
        return '/';
      case 'charity':
        return '/charity';
      case 'admin':
        return '/admin';
      default:
        return '/';
    }
  };

  // Function to check if current route is valid for the selected role
  const isRouteValidForRole = (pathname: string, role: 'donor' | 'charity' | 'admin') => {
    const donorRoutes = ['/', '/donate-intent', '/whisper', '/demo-rlusd'];
    const charityRoutes = ['/charity', '/analytics', '/predictive'];
    const adminRoutes = ['/admin'];

    switch (role) {
      case 'donor':
        return donorRoutes.includes(pathname);
      case 'charity':
        return charityRoutes.includes(pathname);
      case 'admin':
        return adminRoutes.includes(pathname);
      default:
        return false;
    }
  };

  // Handle role change
  const handleRoleChange = (newRole: 'donor' | 'charity' | 'admin') => {
    setUserRole(newRole);
    
    // If current route is not valid for the new role, navigate to default route
    if (!isRouteValidForRole(location.pathname, newRole)) {
      navigate(getDefaultRoute(newRole));
    }
  };

  // Effect to handle initial navigation based on role
  useEffect(() => {
    if (!isRouteValidForRole(location.pathname, userRole)) {
      navigate(getDefaultRoute(userRole));
    }
  }, [userRole, location.pathname, navigate]);

  return (
    <div className="App">
      <Header userRole={userRole} setUserRole={handleRoleChange} />
      
      <main className="main-content">
        <Routes>
          {/* Unified Landing Page - now the main entry point */}
          <Route path="/" element={<LandingPage userRole={userRole} setUserRole={handleRoleChange} />} />
          
          {/* Donor Routes */}
          <Route path="/donate-intent" element={<DonorIntentForm />} />
          <Route path="/whisper" element={<WhisperFlow />} />
          <Route path="/demo-rlusd" element={<RlusdDemo />} />
          
          {/* Charity Routes */}
          <Route path="/charity" element={<CharityStaffView />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/predictive" element={<Predictive />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<SuperAdminView />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <WalletProvider>
        <AppContent />
      </WalletProvider>
    </Router>
  );
}

export default App; 