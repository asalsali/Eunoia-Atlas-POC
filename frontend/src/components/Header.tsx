import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, BarChart3, Home, Brain, Users, Settings, Building } from 'lucide-react';
import './Header.css';

interface HeaderProps {
  userRole?: 'donor' | 'charity' | 'admin';
  setUserRole?: (role: 'donor' | 'charity' | 'admin') => void;
}

const Header: React.FC<HeaderProps> = ({ userRole = 'donor', setUserRole }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const renderDonorNav = () => (
    <>
      <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
        <Home size={20} />
        Home
      </Link>
      <Link to="/donate" className={`nav-link ${isActive('/donate') ? 'active' : ''}`}>
        <Heart size={20} />
        Donate
      </Link>
    </>
  );

  const renderCharityNav = () => (
    <>
      <Link to="/charity" className={`nav-link ${isActive('/charity') ? 'active' : ''}`}>
        <Building size={20} />
        Charity Dashboard
      </Link>
      <Link to="/analytics" className={`nav-link ${isActive('/analytics') ? 'active' : ''}`}>
        <BarChart3 size={20} />
        Analytics
      </Link>
      <Link to="/predictive" className={`nav-link ${isActive('/predictive') ? 'active' : ''}`}>
        <Brain size={20} />
        Predictive
      </Link>
    </>
  );

  const renderAdminNav = () => (
    <>
      <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>
        <Settings size={20} />
        Admin
      </Link>
      <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
        <BarChart3 size={20} />
        Dashboard
      </Link>
    </>
  );

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <Heart className="logo-icon" />
            <span>Eunoia Atlas</span>
          </Link>
          
          <nav className="nav">
            {userRole === 'donor' && renderDonorNav()}
            {userRole === 'charity' && renderCharityNav()}
            {userRole === 'admin' && renderAdminNav()}
          </nav>

          <div className="role-selector">
            <select 
              value={userRole} 
              onChange={(e) => setUserRole?.(e.target.value as 'donor' | 'charity' | 'admin')}
              className="role-select"
            >
              <option value="donor">👤 Donor View</option>
              <option value="charity">🏢 Charity Staff</option>
              <option value="admin">⚙️ Super Admin</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 