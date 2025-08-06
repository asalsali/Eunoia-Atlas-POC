import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import DonorView from './components/DonorView';
import DonationForm from './components/DonationForm';
import CharityStaffView from './components/CharityStaffView';
import SuperAdminView from './components/SuperAdminView';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import Predictive from './components/Predictive';
import './App.css';

function App() {
  const [userRole, setUserRole] = useState<'donor' | 'charity' | 'admin'>('donor');

  console.log('App component rendering with userRole:', userRole);

  return (
    <Router>
      <div className="App">
        <Header userRole={userRole} setUserRole={setUserRole} />
        
        <main className="main-content">
          <Routes>
            {/* Donor Routes */}
            <Route path="/" element={<DonorView />} />
            <Route path="/donate" element={<DonationForm />} />
            
            {/* Charity Routes */}
            <Route path="/charity" element={<CharityStaffView />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/predictive" element={<Predictive />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<SuperAdminView />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 