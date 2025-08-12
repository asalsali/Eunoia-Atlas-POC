import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageSquare, BarChart3, Settings, Users, Shield, ArrowRight, Globe, Zap, Eye, ChevronDown } from 'lucide-react';
import { getTotals } from '../services/api';
import './LandingPage.css';

interface DonationStats {
  MEDA?: number;
  TARA?: number;
}

interface LandingPageProps {
  userRole: 'donor' | 'charity' | 'admin';
  setUserRole: (role: 'donor' | 'charity' | 'admin') => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ userRole, setUserRole }) => {
  const [totals, setTotals] = useState<DonationStats>({});
  const [loading, setLoading] = useState(true);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTotals = async () => {
      try {
        const data = await getTotals();
        setTotals(data);
      } catch (error) {
        console.error('Failed to fetch totals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTotals();
  }, []);

  const total = (totals.MEDA || 0) + (totals.TARA || 0);

  const handleRoleChange = (newRole: 'donor' | 'charity' | 'admin') => {
    setUserRole(newRole);
    setShowRoleSelector(false);
    
    // Stay on landing page for all roles to show the role change effect
    // Users can navigate to specific dashboards using the action cards
  };

  const primaryActions = {
    donor: [
      {
        title: "Share Your Story",
        description: "Express why you're giving with our guided experience",
        icon: <MessageSquare size={24} />,
        action: () => navigate('/whisper'),
        primary: true,
        color: "purple"
      },
      {
        title: "Make a Donation",
        description: "Direct donation with XRPL blockchain transparency",
        icon: <Heart size={24} />,
        action: () => navigate('/donate'),
        primary: false,
        color: "blue"
      }
    ],
    charity: [
      {
        title: "View Analytics",
        description: "Insights and donor engagement metrics",
        icon: <BarChart3 size={24} />,
        action: () => navigate('/analytics'),
        primary: true,
        color: "green"
      },
      {
        title: "Charity Dashboard",
        description: "Manage your organization's presence",
        icon: <Users size={24} />,
        action: () => navigate('/charity'),
        primary: false,
        color: "blue"
      }
    ],
    admin: [
      {
        title: "Platform Management",
        description: "Oversee platform operations and organizations",
        icon: <Settings size={24} />,
        action: () => navigate('/admin'),
        primary: true,
        color: "red"
      },
      {
        title: "System Dashboard",
        description: "Monitor platform health and federated learning",
        icon: <BarChart3 size={24} />,
        action: () => navigate('/dashboard'),
        primary: false,
        color: "purple"
      }
    ]
  };

  const features = [
    {
      icon: <Shield size={32} />,
      title: "Privacy First",
      description: "Your identity is protected through cryptographic hashing while maintaining full transparency"
    },
    {
      icon: <Globe size={32} />,
      title: "Blockchain Verified",
      description: "All donations are publicly verifiable on the XRPL blockchain for complete transparency"
    },
    {
      icon: <Zap size={32} />,
      title: "Instant Impact",
      description: "Real-time donation processing with immediate confirmation and tracking"
    },
    {
      icon: <Eye size={32} />,
      title: "Federated Learning",
      description: "Charities collaborate on insights without sharing sensitive donor data"
    }
  ];

  if (loading) {
    return (
      <div className="landing-loading">
        <div className="loading-spinner"></div>
        <p>Loading Eunoia Atlas...</p>
      </div>
    );
  }

  return (
    <div className="landing-page">
      {/* Floating Role Switcher */}
      <div className="floating-role-switcher">
        <div className="role-tabs">
          <button 
            className={`role-tab ${userRole === 'donor' ? 'active' : ''}`}
            onClick={() => handleRoleChange('donor')}
          >
            👤 Donor
          </button>
          <button 
            className={`role-tab ${userRole === 'charity' ? 'active' : ''}`}
            onClick={() => handleRoleChange('charity')}
          >
            🏢 Charity
          </button>
          <button 
            className={`role-tab ${userRole === 'admin' ? 'active' : ''}`}
            onClick={() => handleRoleChange('admin')}
          >
            ⚙️ Admin
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          <div className="hero-blob hero-blob-1"></div>
          <div className="hero-blob hero-blob-2"></div>
        </div>
        
        <div className="hero-content">
          <div className="hero-badge">
            Privacy-Preserving Charitable Giving
          </div>
          
          <h1 className="hero-title">
            Give from the heart,<br />
            <span className="hero-gradient">powered by purpose</span>
          </h1>
          
          <p className="hero-description">
            Eunoia Atlas combines blockchain transparency with privacy protection, 
            enabling meaningful charitable giving while preserving donor anonymity through federated learning.
          </p>

          {/* Role Selector */}
          <div className="role-selector-section">
            <p className="role-prompt">I want to...</p>
            <div className="role-selector-wrapper">
              <button 
                className={`role-selector-btn ${showRoleSelector ? 'active' : ''}`}
                onClick={() => setShowRoleSelector(!showRoleSelector)}
              >
                <span className="role-icon">
                  {userRole === 'donor' ? '👤' : userRole === 'charity' ? '🏢' : '⚙️'}
                </span>
                <span className="role-text">
                  {userRole === 'donor' ? 'Give & Support' : 
                   userRole === 'charity' ? 'Manage Charity' : 'Administer Platform'}
                </span>
                <ChevronDown size={16} className={`chevron ${showRoleSelector ? 'rotated' : ''}`} />
              </button>
              
              {showRoleSelector && (
                <div className="role-dropdown">
                  <button 
                    className={`role-option ${userRole === 'donor' ? 'selected' : ''}`}
                    onClick={() => handleRoleChange('donor')}
                  >
                    <span className="role-option-icon">👤</span>
                    <div className="role-option-content">
                      <span className="role-option-title">Give & Support</span>
                      <span className="role-option-desc">Make donations and share your story</span>
                    </div>
                  </button>
                  <button 
                    className={`role-option ${userRole === 'charity' ? 'selected' : ''}`}
                    onClick={() => handleRoleChange('charity')}
                  >
                    <span className="role-option-icon">🏢</span>
                    <div className="role-option-content">
                      <span className="role-option-title">Manage Charity</span>
                      <span className="role-option-desc">Access analytics and donor insights</span>
                    </div>
                  </button>
                  <button 
                    className={`role-option ${userRole === 'admin' ? 'selected' : ''}`}
                    onClick={() => handleRoleChange('admin')}
                  >
                    <span className="role-option-icon">⚙️</span>
                    <div className="role-option-content">
                      <span className="role-option-title">Administer Platform</span>
                      <span className="role-option-desc">Manage organizations and monitor systems</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Primary Actions */}
          <div className="primary-actions">
            {primaryActions[userRole].map((action, index) => (
              <button
                key={index}
                className={`action-card ${action.primary ? 'primary' : 'secondary'} ${action.color}`}
                onClick={action.action}
              >
                <div className="action-icon">
                  {action.icon}
                </div>
                <div className="action-content">
                  <h3 className="action-title">{action.title}</h3>
                  <p className="action-description">{action.description}</p>
                </div>
                <ArrowRight size={20} className="action-arrow" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">${total.toLocaleString()}</div>
            <div className="stat-label">Total Donations</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">2</div>
            <div className="stat-label">Partner Charities</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">100%</div>
            <div className="stat-label">Privacy Protected</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">Real-time</div>
            <div className="stat-label">Blockchain Verified</div>
          </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
          <h2 className="section-title">Why Eunoia Atlas?</h2>
          <p className="section-description">
            Experience charitable giving reimagined with privacy, transparency, and collaborative intelligence.
          </p>
        </div>
        
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">
                {feature.icon}
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
        </div>
      </section>

      {/* Charities Section */}
      <section className="charities-section">
        <div className="container">
          <div className="section-header">
          <h2 className="section-title">Partner Charities</h2>
          <p className="section-description">
            Supporting organizations making real impact around the world.
          </p>
        </div>
        
        <div className="charities-grid">
          <div className="charity-card">
            <div className="charity-logo">MEDA</div>
            <h3 className="charity-name">Mennonite Economic Development Associates</h3>
            <p className="charity-description">
              Creating business solutions to poverty by partnering with entrepreneurs and communities.
            </p>
            <div className="charity-stats">
              <div className="charity-stat">
                <span className="charity-stat-value">${(totals.MEDA || 0).toLocaleString()}</span>
                <span className="charity-stat-label">Raised</span>
              </div>
            </div>
          </div>
          
          <div className="charity-card">
            <div className="charity-logo">TARA</div>
            <h3 className="charity-name">Technology for Rural Advancement</h3>
            <p className="charity-description">
              Bridging the digital divide by bringing technology solutions to rural communities.
            </p>
            <div className="charity-stats">
              <div className="charity-stat">
                <span className="charity-stat-value">${(totals.TARA || 0).toLocaleString()}</span>
                <span className="charity-stat-label">Raised</span>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
          <h2 className="cta-title">Ready to make a difference?</h2>
          <p className="cta-description">
            Join our community of privacy-conscious donors making transparent, verifiable impact.
          </p>
          <div className="cta-actions">
            <button 
              className="cta-btn primary"
              onClick={() => navigate('/whisper')}
            >
              <MessageSquare size={20} />
              Start with Your Story
            </button>
            <button 
              className="cta-btn secondary"
              onClick={() => navigate('/donate')}
            >
              <Heart size={20} />
              Make a Donation
            </button>
          </div>
        </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
