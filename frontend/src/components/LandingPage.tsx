import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageSquare, BarChart3, Settings, Users, Shield, ArrowRight, Globe, Zap, Eye, Wallet, CheckCircle2, Sparkles, Star, Gift, TrendingUp, ArrowDown, ChevronRight, Lock, Users2, Globe2, Award } from 'lucide-react';
import { getTotals } from '../services/api';
import './LandingPage.css';
import { useWallet } from '../context/WalletContext';

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
  const navigate = useNavigate();
  const wallet = useWallet();

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
  };

  // If not donor role, show role switcher and basic info
  if (userRole !== 'donor') {
    return (
      <div style={{ 
        minHeight: '100vh',
        background: '#ffffff',
        padding: '60px 20px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            padding: '60px 40px',
            borderRadius: '24px',
            marginBottom: '60px',
            border: '1px solid #e2e8f0'
          }}>
            <h1 style={{
              fontSize: '3.5rem',
              fontWeight: 900,
              color: '#0f172a',
              marginBottom: '20px'
            }}>
              Welcome to Eunoia Atlas
            </h1>
            <p style={{
              fontSize: '1.25rem',
              color: '#64748b',
              marginBottom: '50px',
              maxWidth: '600px',
              marginLeft: 'auto',
              marginRight: 'auto',
              lineHeight: '1.6'
            }}>
              Privacy-preserving charitable giving platform
            </p>
            
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '20px',
              marginBottom: '50px',
              flexWrap: 'wrap'
            }}>
              <button 
                onClick={() => handleRoleChange('donor')}
                style={{
                  padding: '16px 32px',
                  borderRadius: '16px',
                  border: '2px solid #7c3aed',
                  background: 'transparent',
                  color: '#7c3aed',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '1.1rem'
                }}
              >
                👤 Donor
              </button>
              <button 
                onClick={() => handleRoleChange('charity')}
                style={{
                  padding: '16px 32px',
                  borderRadius: '16px',
                  border: '2px solid #7c3aed',
                  background: userRole === 'charity' ? '#7c3aed' : 'transparent',
                  color: userRole === 'charity' ? '#fff' : '#7c3aed',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '1.1rem'
                }}
              >
                🏢 Charity
              </button>
              <button 
                onClick={() => handleRoleChange('admin')}
                style={{
                  padding: '16px 32px',
                  borderRadius: '16px',
                  border: '2px solid #7c3aed',
                  background: userRole === 'admin' ? '#7c3aed' : 'transparent',
                  color: userRole === 'admin' ? '#fff' : '#7c3aed',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '1.1rem'
                }}
              >
                ⚙️ Admin
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '30px',
              maxWidth: '900px',
              margin: '0 auto'
            }}>
              {userRole === 'charity' && (
                <>
                  <button
                    onClick={() => navigate('/analytics')}
                    style={{
                      background: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '20px',
                      padding: '32px 24px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      display: 'block',
                      width: '100%'
                    }}
                  >
                    <BarChart3 size={40} style={{ color: '#7c3aed', marginBottom: '16px' }} />
                    <h3 style={{ margin: '0 0 12px 0', color: '#0f172a', fontSize: '1.4rem', fontWeight: '700' }}>View Analytics</h3>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '1rem', lineHeight: '1.5' }}>Insights and donor engagement metrics</p>
                  </button>
                  <button
                    onClick={() => navigate('/charity')}
                    style={{
                      background: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '20px',
                      padding: '32px 24px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      display: 'block',
                      width: '100%'
                    }}
                  >
                    <Users size={40} style={{ color: '#7c3aed', marginBottom: '16px' }} />
                    <h3 style={{ margin: '0 0 12px 0', color: '#0f172a', fontSize: '1.4rem', fontWeight: '700' }}>Charity Dashboard</h3>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '1rem', lineHeight: '1.5' }}>Manage your organization's presence</p>
                  </button>
                </>
              )}
              
              {userRole === 'admin' && (
                <>
                  <button
                    onClick={() => navigate('/admin')}
                    style={{
                      background: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '20px',
                      padding: '32px 24px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      display: 'block',
                      width: '100%'
                    }}
                  >
                    <Settings size={40} style={{ color: '#7c3aed', marginBottom: '16px' }} />
                    <h3 style={{ margin: '0 0 12px 0', color: '#0f172a', fontSize: '1.4rem', fontWeight: '700' }}>Platform Management</h3>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '1rem', lineHeight: '1.5' }}>Oversee platform operations</p>
                  </button>
                  <button
                    onClick={() => navigate('/dashboard')}
                    style={{
                      background: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '20px',
                      padding: '32px 24px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      display: 'block',
                      width: '100%'
                    }}
                  >
                    <BarChart3 size={40} style={{ color: '#7c3aed', marginBottom: '16px' }} />
                    <h3 style={{ margin: '0 0 12px 0', color: '#0f172a', fontSize: '1.4rem', fontWeight: '700' }}>System Dashboard</h3>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '1rem', lineHeight: '1.5' }}>Monitor platform health</p>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '1.25rem',
        color: '#64748b',
        background: '#ffffff'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid #f3f4f6',
            borderTop: '3px solid #7c3aed',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px auto'
          }} />
          Loading Eunoia Atlas...
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: '#ffffff',
      padding: '0'
    }}>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        padding: '120px 20px 100px 20px',
        textAlign: 'center',
        color: '#0f172a',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid #e2e8f0'
      }}>
        {/* Background Pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 80%, rgba(124, 58, 237, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(124, 58, 237, 0.03) 0%, transparent 50%)',
          pointerEvents: 'none'
        }} />
        
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{
            background: 'rgba(124, 58, 237, 0.05)',
            color: '#7c3aed',
            padding: '8px 16px',
            borderRadius: '20px',
            display: 'inline-block',
            marginBottom: '30px',
            fontSize: '0.9rem',
            fontWeight: '600',
            border: '1px solid rgba(124, 58, 237, 0.1)'
          }}>
            ✨ Privacy-Preserving Platform
          </div>
          
          <h1 style={{
            fontSize: '4.5rem',
            fontWeight: 900,
            marginBottom: '30px',
            lineHeight: 1.1,
            color: '#0f172a'
          }}>
            Give with
            <span style={{
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}> Impact</span>
          </h1>
          <p style={{
            fontSize: '1.5rem',
            marginBottom: '50px',
            color: '#64748b',
            maxWidth: '700px',
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: '1.6',
            fontWeight: '400'
          }}>
            Connect your intent with real-world impact through privacy-preserving charitable giving
          </p>
          
          {/* Role Switcher */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            marginBottom: '60px',
            flexWrap: 'wrap'
          }}>
            <button 
              onClick={() => handleRoleChange('donor')}
              style={{
                padding: '18px 36px',
                borderRadius: '18px',
                border: '2px solid #7c3aed',
                background: 'rgba(124, 58, 237, 0.1)',
                color: '#7c3aed',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '1.1rem',
                boxShadow: '0 4px 20px rgba(124, 58, 237, 0.15)'
              }}
            >
              👤 Donor
            </button>
            <button 
              onClick={() => handleRoleChange('charity')}
              style={{
                padding: '18px 36px',
                borderRadius: '18px',
                border: '2px solid #e2e8f0',
                background: 'transparent',
                color: '#64748b',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '1.1rem'
              }}
            >
              🏢 Charity
            </button>
            <button 
              onClick={() => handleRoleChange('admin')}
              style={{
                padding: '18px 36px',
                borderRadius: '18px',
                border: '2px solid #e2e8f0',
                background: 'transparent',
                color: '#64748b',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '1.1rem'
              }}
            >
              ⚙️ Admin
            </button>
          </div>

          {/* Scroll Indicator */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            color: '#64748b',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}>
            <span>Explore our platform</span>
            <ArrowDown size={20} style={{ animation: 'bounce 2s infinite' }} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px'
      }}>
        {/* Primary CTA Section */}
        <div style={{ 
          padding: '100px 0',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '3.5rem',
            fontWeight: '800',
            color: '#0f172a',
            marginBottom: '30px'
          }}>
            Whisper Your Message
          </h2>
          <p style={{
            fontSize: '1.3rem',
            color: '#64748b',
            marginBottom: '60px',
            maxWidth: '700px',
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: '1.6'
          }}>
            Share your story, make a donation, and create lasting impact. Your words matter.
          </p>
          
          <button
            onClick={() => navigate('/whisper')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '15px',
              background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
              color: '#ffffff',
              padding: '24px 48px',
              borderRadius: '20px',
              fontWeight: '700',
              textDecoration: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 12px 32px rgba(124, 58, 237, 0.3)',
              fontSize: '1.3rem',
              transform: 'scale(1)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 16px 40px rgba(124, 58, 237, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(124, 58, 237, 0.3)';
            }}
          >
            <MessageSquare size={28} />
            Start Whispering Now
          </button>
        </div>

        {/* Features Section */}
        <div style={{ 
          padding: '100px 0',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          borderRadius: '24px',
          marginBottom: '100px'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '80px'
          }}>
            <h2 style={{
              fontSize: '3rem',
              fontWeight: '800',
              color: '#0f172a',
              marginBottom: '25px'
            }}>
              Why Choose Eunoia Atlas?
            </h2>
            <p style={{
              fontSize: '1.2rem',
              color: '#64748b',
              maxWidth: '600px',
              marginLeft: 'auto',
              marginRight: 'auto',
              lineHeight: '1.6'
            }}>
              Experience the future of charitable giving with privacy, transparency, and impact
            </p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '40px',
            maxWidth: '1100px',
            margin: '0 auto',
            padding: '0 40px'
          }}>
            <div style={{
              background: '#ffffff',
              padding: '50px 40px',
              borderRadius: '20px',
              textAlign: 'center',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              border: '1px solid #e2e8f0',
              transition: 'transform 0.3s ease'
            }}>
              <Lock size={60} style={{ color: '#7c3aed', marginBottom: '25px' }} />
              <h3 style={{ margin: '0 0 20px 0', color: '#0f172a', fontSize: '1.8rem', fontWeight: '700' }}>Privacy First</h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '1.1rem', lineHeight: '1.6' }}>
                Your personal information stays private while your impact remains visible. Advanced encryption ensures your data is secure.
              </p>
            </div>
            
            <div style={{
              background: '#ffffff',
              padding: '50px 40px',
              borderRadius: '20px',
              textAlign: 'center',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              border: '1px solid #e2e8f0',
              transition: 'transform 0.3s ease'
            }}>
              <Globe2 size={60} style={{ color: '#10b981', marginBottom: '25px' }} />
              <h3 style={{ margin: '0 0 20px 0', color: '#0f172a', fontSize: '1.8rem', fontWeight: '700' }}>Global Impact</h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '1.1rem', lineHeight: '1.6' }}>
                Support causes worldwide with blockchain-powered donations. Real-time tracking shows exactly how your contribution makes a difference.
              </p>
            </div>
            
            <div style={{
              background: '#ffffff',
              padding: '50px 40px',
              borderRadius: '20px',
              textAlign: 'center',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              border: '1px solid #e2e8f0',
              transition: 'transform 0.3s ease'
            }}>
              <Award size={60} style={{ color: '#f59e0b', marginBottom: '25px' }} />
              <h3 style={{ margin: '0 0 20px 0', color: '#0f172a', fontSize: '1.8rem', fontWeight: '700' }}>Verified Impact</h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '1.1rem', lineHeight: '1.6' }}>
                Every donation is verified on the blockchain. See real-time updates and receive detailed impact reports for your contributions.
              </p>
            </div>
          </div>
        </div>

        {/* Impact Stats Section */}
        <div style={{ 
          padding: '100px 0',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '3rem',
            fontWeight: '800',
            color: '#0f172a',
            marginBottom: '25px'
          }}>
            Our Impact in Numbers
          </h2>
          <p style={{
            fontSize: '1.2rem',
            color: '#64748b',
            marginBottom: '60px',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: '1.6'
          }}>
            Real numbers that show the difference we're making together
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '40px',
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
              padding: '50px 30px',
              borderRadius: '20px',
              textAlign: 'center',
              color: '#ffffff',
              boxShadow: '0 12px 32px rgba(124, 58, 237, 0.3)'
            }}>
              <div style={{
                fontSize: '3.5rem',
                fontWeight: '900',
                marginBottom: '15px'
              }}>
                ${total.toLocaleString()}
              </div>
              <div style={{
                fontWeight: '600',
                fontSize: '1.2rem',
                opacity: '0.9'
              }}>
                Total Donations
              </div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              padding: '50px 30px',
              borderRadius: '20px',
              textAlign: 'center',
              color: '#ffffff',
              boxShadow: '0 12px 32px rgba(16, 185, 129, 0.3)'
            }}>
              <div style={{
                fontSize: '3.5rem',
                fontWeight: '900',
                marginBottom: '15px'
              }}>
                2
              </div>
              <div style={{
                fontWeight: '600',
                fontSize: '1.2rem',
                opacity: '0.9'
              }}>
                Partner Charities
              </div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              padding: '50px 30px',
              borderRadius: '20px',
              textAlign: 'center',
              color: '#ffffff',
              boxShadow: '0 12px 32px rgba(245, 158, 11, 0.3)'
            }}>
              <div style={{
                fontSize: '3.5rem',
                fontWeight: '900',
                marginBottom: '15px'
              }}>
                100%
              </div>
              <div style={{
                fontWeight: '600',
                fontSize: '1.2rem',
                opacity: '0.9'
              }}>
                Privacy Protected
              </div>
            </div>
          </div>
        </div>

        {/* Partner Charities Section */}
        <div style={{ 
          padding: '100px 0',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          borderRadius: '24px',
          marginBottom: '100px'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '60px'
          }}>
            <h2 style={{
              fontSize: '3rem',
              fontWeight: '800',
              color: '#0f172a',
              marginBottom: '25px'
            }}>
              Our Partner Charities
            </h2>
            <p style={{
              fontSize: '1.2rem',
              color: '#64748b',
              maxWidth: '600px',
              marginLeft: 'auto',
              marginRight: 'auto',
              lineHeight: '1.6'
            }}>
              Supporting organizations that create lasting change in communities worldwide
            </p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '40px',
            maxWidth: '900px',
            margin: '0 auto',
            padding: '0 40px'
          }}>
            <div style={{
              background: '#ffffff',
              padding: '50px 40px',
              borderRadius: '24px',
              border: '1px solid #e2e8f0',
              textAlign: 'center',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              transition: 'transform 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '0',
                left: '0',
                right: '0',
                height: '4px',
                background: 'linear-gradient(135deg, #7c3aed, #a855f7)'
              }} />
              <h3 style={{
                color: '#0f172a',
                fontSize: '2.5rem',
                marginBottom: '20px',
                fontWeight: '800'
              }}>
                MEDA
              </h3>
              <p style={{
                color: '#64748b',
                marginBottom: '30px',
                lineHeight: '1.6',
                fontSize: '1.2rem'
              }}>
                Mennonite Economic Development Associates
              </p>
              <div style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                padding: '25px',
                borderRadius: '18px',
                fontWeight: '700',
                color: '#fff',
                fontSize: '1.4rem',
                boxShadow: '0 8px 24px rgba(124, 58, 237, 0.3)'
              }}>
                Total: ${(totals.MEDA || 0).toLocaleString()}
              </div>
            </div>
            <div style={{
              background: '#ffffff',
              padding: '50px 40px',
              borderRadius: '24px',
              border: '1px solid #e2e8f0',
              textAlign: 'center',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              transition: 'transform 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '0',
                left: '0',
                right: '0',
                height: '4px',
                background: 'linear-gradient(135deg, #10b981, #059669)'
              }} />
              <h3 style={{
                color: '#0f172a',
                fontSize: '2.5rem',
                marginBottom: '20px',
                fontWeight: '800'
              }}>
                TARA
              </h3>
              <p style={{
                color: '#64748b',
                marginBottom: '30px',
                lineHeight: '1.6',
                fontSize: '1.2rem'
              }}>
                Technology for Rural Advancement
              </p>
              <div style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                padding: '25px',
                borderRadius: '18px',
                fontWeight: '700',
                color: '#fff',
                fontSize: '1.4rem',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)'
              }}>
                Total: ${(totals.TARA || 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA Section */}
        <div style={{ 
          padding: '100px 0',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
          borderRadius: '24px',
          color: '#ffffff',
          marginBottom: '60px'
        }}>
          <h2 style={{
            fontSize: '3rem',
            fontWeight: '800',
            marginBottom: '25px'
          }}>
            Ready to Make Your Mark?
          </h2>
          <p style={{
            fontSize: '1.3rem',
            marginBottom: '50px',
            opacity: '0.9',
            maxWidth: '700px',
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: '1.6'
          }}>
            Join thousands of donors who are already creating positive change. Your whisper can change the world.
          </p>
          <button
            onClick={() => navigate('/whisper')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '15px',
              background: '#ffffff',
              color: '#7c3aed',
              padding: '20px 40px',
              borderRadius: '18px',
              fontWeight: '700',
              textDecoration: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              fontSize: '1.2rem'
            }}
          >
            <MessageSquare size={24} />
            Start Whispering Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
