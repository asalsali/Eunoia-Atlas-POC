import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import DonationForm from './components/DonationForm';
import Analytics from './components/Analytics';
import Predictive from './components/Predictive';
import DonorView from './components/DonorView';
import CharityStaffView from './components/CharityStaffView';
import SuperAdminView from './components/SuperAdminView';
import './App.css';

function App() {
  const [userRole, setUserRole] = useState<'donor' | 'charity' | 'admin'>('donor');

  return (
    <Router>
      <div className="App">
        <Header userRole={userRole} setUserRole={setUserRole} />
        <main className="container">
          <Routes>
            {/* Public Donor Routes */}
            <Route path="/" element={<DonorView />} />
            <Route path="/donate" element={<DonationForm />} />
            
            {/* Charity Staff Routes */}
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