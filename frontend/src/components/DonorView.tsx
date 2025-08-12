import React, { useState, useEffect } from 'react';
import './DonorView.css';
import { Heart, TrendingUp, Users, Gift, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getTotals } from '../services/api';
import { useWallet } from '../context/WalletContext';
import StatCard from './common/StatCard';
import ActionCard from './common/ActionCard';
import IntentGiveCard from './common/IntentGiveCard';

interface DonationStats {
  MEDA?: number;
  TARA?: number;
}

const DonorView: React.FC = () => {
  const [totals, setTotals] = useState<DonationStats>({});
  const [loading, setLoading] = useState(true);
  const { address, network } = useWallet();

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

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        fontSize: '1.125rem',
        color: '#64748b'
      }}>
        Loading donation insights...
      </div>
    );
  }

  const total = ((totals.MEDA || 0) + (totals.TARA || 0));

  return (
    <div className="donor-view">
      <div style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        borderRadius: 20,
        border: '1px solid #e2e8f0',
        padding: '40px 32px',
        marginBottom: 32,
        textAlign: 'center'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          marginBottom: 16
        }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            display: 'grid',
            placeItems: 'center',
            background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
            color: '#fff',
            fontSize: '1.5rem',
            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
          }}>
            💜
          </div>
          <div>
            <h1 style={{
              margin: 0,
              fontSize: '2.5rem',
              fontWeight: 900,
              color: '#0f172a',
              lineHeight: 1.2
            }}>
              {address ? 'Welcome back' : 'Next-Generation Charitable Giving'}
            </h1>
            <p style={{
              margin: '8px 0 0 0',
              fontSize: '1.125rem',
              color: '#64748b',
              lineHeight: 1.6
            }}>
              {address
                ? `Connected: ${address.substring(0, 6)}...${address.substring(address.length - 4)}${network ? ` · ${network}` : ''}`
                : 'Seamless philanthropic tools for donors and institutions'}
            </p>
          </div>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 16,
          marginTop: 24
        }}>
          <Link to="/whisper" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: 12,
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
          }}>
            <MessageSquare size={18} />
            Share Story
          </Link>
        </div>
      </div>

      <IntentGiveCard />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 24,
        marginBottom: 40
      }}>
        <StatCard icon={<Heart size={24} />} label="Total Donations" value={`$${total.toLocaleString()}`} />
        <StatCard icon={<TrendingUp size={24} />} label="Active Charities" value={2} />
        <StatCard icon={<Users size={24} />} label="Donors" value={4} />
        <StatCard icon={<Gift size={24} />} label="Impact" value={'Growing'} />
      </div>

      <div style={{ marginBottom: 40 }}>
        <h2 style={{
          textAlign: 'center',
          marginBottom: 24,
          color: '#0f172a',
          fontSize: '2rem',
          fontWeight: 800
        }}>
          Quick Actions
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 20
        }}>
          <ActionCard 
            icon={<MessageSquare size={24} />} 
            title="Share Story" 
            description="Send a note of encouragement" 
            onClick={() => {}}
          >
            <Link to="/whisper" style={{ position: 'absolute', inset: 0 }} aria-label="Go to Whisper" />
          </ActionCard>
          <ActionCard 
            icon={<Gift size={24} />} 
            title="RLUSD Demo" 
            description="Try a token transfer demo" 
            onClick={() => {}}
          >
            <Link to="/demo-rlusd" style={{ position: 'absolute', inset: 0 }} aria-label="Open RLUSD Demo" />
          </ActionCard>
        </div>
      </div>

      <div style={{ marginBottom: 40 }}>
        <h2 style={{
          textAlign: 'center',
          marginBottom: 24,
          color: '#0f172a',
          fontSize: '2rem',
          fontWeight: 800
        }}>
          Supported Charities
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 24
        }}>
          <div style={{
            background: '#fff',
            padding: 32,
            borderRadius: 16,
            border: '1px solid #e2e8f0',
            textAlign: 'center',
            transition: 'all 0.2s ease',
            boxShadow: '0 1px 3px rgba(0,0,0,.1)'
          }}>
            <h3 style={{
              color: '#0f172a',
              fontSize: '1.5rem',
              marginBottom: 8,
              fontWeight: 700
            }}>
              MEDA
            </h3>
            <p style={{
              color: '#64748b',
              marginBottom: 16,
              lineHeight: 1.6
            }}>
              Mennonite Economic Development Associates
            </p>
            <div style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              padding: 16,
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              fontWeight: 700,
              color: '#0f172a',
              fontSize: '1.125rem'
            }}>
              Total: ${(totals.MEDA || 0).toLocaleString()}
            </div>
          </div>
          <div style={{
            background: '#fff',
            padding: 32,
            borderRadius: 16,
            border: '1px solid #e2e8f0',
            textAlign: 'center',
            transition: 'all 0.2s ease',
            boxShadow: '0 1px 3px rgba(0,0,0,.1)'
          }}>
            <h3 style={{
              color: '#0f172a',
              fontSize: '1.5rem',
              marginBottom: 8,
              fontWeight: 700
            }}>
              TARA
            </h3>
            <p style={{
              color: '#64748b',
              marginBottom: 16,
              lineHeight: 1.6
            }}>
              Technology for Rural Advancement
            </p>
            <div style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              padding: 16,
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              fontWeight: 700,
              color: '#0f172a',
              fontSize: '1.125rem'
            }}>
              Total: ${(totals.TARA || 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 40 }}>
        <h2 style={{
          textAlign: 'center',
          marginBottom: 24,
          color: '#0f172a',
          fontSize: '2rem',
          fontWeight: 800
        }}>
          What makes Eunoia different
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 24
        }}>
          <div style={{
            background: '#fff',
            padding: 24,
            borderRadius: 16,
            border: '1px solid #e2e8f0',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,.1)'
          }}>
            <h3 style={{
              color: '#0f172a',
              marginBottom: 8,
              fontSize: '1.25rem',
              fontWeight: 700
            }}>
              Quiet by design
            </h3>
            <p style={{
              color: '#64748b',
              lineHeight: 1.6
            }}>
              Your experience is calm, focused, and human.
            </p>
          </div>
          <div style={{
            background: '#fff',
            padding: 24,
            borderRadius: 16,
            border: '1px solid #e2e8f0',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,.1)'
          }}>
            <h3 style={{
              color: '#0f172a',
              marginBottom: 8,
              fontSize: '1.25rem',
              fontWeight: 700
            }}>
              Transparent outcomes
            </h3>
            <p style={{
              color: '#64748b',
              lineHeight: 1.6
            }}>
              See where support flows without exposing private details.
            </p>
          </div>
          <div style={{
            background: '#fff',
            padding: 24,
            borderRadius: 16,
            border: '1px solid #e2e8f0',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,.1)'
          }}>
            <h3 style={{
              color: '#0f172a',
              marginBottom: 8,
              fontSize: '1.25rem',
              fontWeight: 700
            }}>
              Together, better
            </h3>
            <p style={{
              color: '#64748b',
              lineHeight: 1.6
            }}>
              Charities learn collectively to serve donors more meaningfully.
            </p>
          </div>
          <div style={{
            background: '#fff',
            padding: 24,
            borderRadius: 16,
            border: '1px solid #e2e8f0',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,.1)'
          }}>
            <h3 style={{
              color: '#0f172a',
              marginBottom: 8,
              fontSize: '1.25rem',
              fontWeight: 700
            }}>
              Give your way
            </h3>
            <p style={{
              color: '#64748b',
              lineHeight: 1.6
            }}>
              Share a message or give directly—both make a difference.
            </p>
          </div>
        </div>
      </div>

      <div style={{
        textAlign: 'center',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        padding: 40,
        borderRadius: 20,
        border: '1px solid #e2e8f0'
      }}>
        <h2 style={{
          color: '#0f172a',
          marginBottom: 12,
          fontSize: '2rem',
          fontWeight: 800
        }}>
          Ready to make a difference?
        </h2>
        <p style={{
          color: '#64748b',
          marginBottom: 24,
          fontSize: '1.125rem',
          lineHeight: 1.6
        }}>
          Share your words or your gift—both are powerful.
        </p>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 16
        }}>
          <Link to="/whisper" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: 12,
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
          }}>
            <MessageSquare size={18} />
            Share Story
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DonorView; 