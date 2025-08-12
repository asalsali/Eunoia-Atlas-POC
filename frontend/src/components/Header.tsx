import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, BarChart3, Brain, Settings, Building, MessageSquare } from 'lucide-react';
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
      <Link to="/whisper" className={`nav-link ${isActive('/whisper') ? 'active' : ''}`}>
        <MessageSquare size={20} />
        Share Story
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

          <div className="user-info">
            <span className="current-role">
              {userRole === 'donor' ? '👤 Donor' : 
               userRole === 'charity' ? '🏢 Charity' : '⚙️ Admin'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 