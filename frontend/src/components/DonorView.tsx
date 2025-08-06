import React, { useState, useEffect } from 'react';
import './DonorView.css';
import { Heart, TrendingUp, Users, Gift } from 'lucide-react';

interface DonationStats {
  MEDA?: number;
  TARA?: number;
}

const DonorView: React.FC = () => {
  const [totals, setTotals] = useState<DonationStats>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTotals = async () => {
      try {
        const response = await fetch('http://localhost:8000/totals');
        const data = await response.json();
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
    return <div className="donor-loading">Loading donation insights...</div>;
  }

  return (
    <div className="donor-view">
      <div className="donor-hero">
        <h1>Welcome to Eunoia Atlas</h1>
        <p>Transparent, privacy-preserving charitable giving powered by blockchain</p>
      </div>

      <div className="donor-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <Heart className="icon" />
          </div>
          <div className="stat-content">
            <h3>Total Donations</h3>
            <p className="stat-value">
              ${((totals.MEDA || 0) + (totals.TARA || 0)).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp className="icon" />
          </div>
          <div className="stat-content">
            <h3>Active Charities</h3>
            <p className="stat-value">2</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Users className="icon" />
          </div>
          <div className="stat-content">
            <h3>Donors Protected</h3>
            <p className="stat-value">4</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Gift className="icon" />
          </div>
          <div className="stat-content">
            <h3>Privacy Level</h3>
            <p className="stat-value">Maximum</p>
          </div>
        </div>
      </div>

      <div className="donor-charities">
        <h2>Supported Charities</h2>
        <div className="charity-grid">
          <div className="charity-card">
            <h3>MEDA</h3>
            <p>Mennonite Economic Development Associates</p>
            <div className="charity-stats">
              <span>Total: ${(totals.MEDA || 0).toLocaleString()}</span>
            </div>
          </div>
          <div className="charity-card">
            <h3>TARA</h3>
            <p>Technology for Rural Advancement</p>
            <div className="charity-stats">
              <span>Total: ${(totals.TARA || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="donor-features">
        <h2>Why Choose Eunoia Atlas?</h2>
        <div className="features-grid">
          <div className="feature">
            <h3>🔒 Privacy First</h3>
            <p>Your identity is protected through cryptographic hashing</p>
          </div>
          <div className="feature">
            <h3>🌐 Transparent</h3>
            <p>All transactions are publicly verifiable on the blockchain</p>
          </div>
          <div className="feature">
            <h3>🤝 Federated Learning</h3>
            <p>Charities collaborate without sharing sensitive data</p>
          </div>
          <div className="feature">
            <h3>💎 Real-time</h3>
            <p>Instant confirmation and tracking of your donations</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorView; 