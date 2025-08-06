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

  console.log('DonorView component rendering...');

  useEffect(() => {
    const fetchTotals = async () => {
      try {
        console.log('Fetching totals from API...');
        const response = await fetch('http://localhost:8000/totals');
        const data = await response.json();
        console.log('Totals received:', data);
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

  console.log('Rendering DonorView with totals:', totals);

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
          <div className="feature-card">
            <h3>🔒 Privacy First</h3>
            <p>Your identity is protected through cryptographic hashing. No personal data is ever shared between organizations.</p>
          </div>
          <div className="feature-card">
            <h3>🌐 Blockchain Transparency</h3>
            <p>All donations are publicly verifiable on the XRPL blockchain while maintaining donor privacy.</p>
          </div>
          <div className="feature-card">
            <h3>🤝 Collaborative Insights</h3>
            <p>Charities can share donor patterns and insights without compromising individual privacy.</p>
          </div>
          <div className="feature-card">
            <h3>📱 Mobile Payments</h3>
            <p>Scan QR codes with Xumm/Xaman for secure, instant donations using RLUSD tokens.</p>
          </div>
        </div>
      </div>

      <div className="donor-cta">
        <h2>Ready to Make a Difference?</h2>
        <p>Join our community of donors and help create positive change through privacy-preserving charitable giving.</p>
        <a href="/donate" className="cta-button">Start Donating</a>
      </div>
    </div>
  );
};

export default DonorView; 