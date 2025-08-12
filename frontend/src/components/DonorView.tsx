import React, { useState, useEffect } from 'react';
import './DonorView.css';
import { Heart, TrendingUp, Users, Gift, MessageSquare } from 'lucide-react';
import { getTotals } from '../services/api';

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
    return <div className="donor-loading">Loading donation insights...</div>;
  }

  const total = ((totals.MEDA || 0) + (totals.TARA || 0));

  return (
    <div className="donor-view">
      <div className="donor-hero">
        <h1>Give from the heart</h1>
        <p>Your words and support can change a day.</p>
        <div className="hero-ctas">
          <a href="/whisper" className="btn-primary">
            <MessageSquare size={18} /> Whisper a Message
          </a>
          <a href="/donate" className="btn-secondary">
            <Heart size={18} /> Start Donating
          </a>
        </div>
      </div>

      <div className="donor-stats">
        <div className="stat-card">
          <div className="stat-icon"><Heart className="icon" /></div>
          <div className="stat-content">
            <h3>Total Donations</h3>
            <p className="stat-value">${total.toLocaleString()}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><TrendingUp className="icon" /></div>
          <div className="stat-content">
            <h3>Active Charities</h3>
            <p className="stat-value">2</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><Users className="icon" /></div>
          <div className="stat-content">
            <h3>Donors</h3>
            <p className="stat-value">{(4).toLocaleString()}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><Gift className="icon" /></div>
          <div className="stat-content">
            <h3>Impact</h3>
            <p className="stat-value">Growing</p>
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
        <h2>What makes Eunoia different</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Quiet by design</h3>
            <p>Your experience is calm, focused, and human.</p>
          </div>
          <div className="feature-card">
            <h3>Transparent outcomes</h3>
            <p>See where support flows without exposing private details.</p>
          </div>
          <div className="feature-card">
            <h3>Together, better</h3>
            <p>Charities learn collectively to serve donors more meaningfully.</p>
          </div>
          <div className="feature-card">
            <h3>Give your way</h3>
            <p>Share a message or give directly—both make a difference.</p>
          </div>
        </div>
      </div>

      <div className="donor-cta">
        <h2>Ready to make a difference?</h2>
        <p>Share your words or your gift—both are powerful.</p>
        <div className="hero-ctas">
          <a href="/whisper" className="btn-primary">
            <MessageSquare size={18} /> Whisper a Message
          </a>
          <a href="/donate" className="btn-secondary">
            <Heart size={18} /> Start Donating
          </a>
        </div>
      </div>
    </div>
  );
};

export default DonorView; 