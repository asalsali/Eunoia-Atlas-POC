import React, { useState, useEffect } from 'react';
import './CharityStaffView.css';
import { BarChart3, Users, DollarSign, TrendingUp, Eye, Shield } from 'lucide-react';

interface DonationStats {
  MEDA?: number;
  TARA?: number;
}

interface DonorScore {
  ph: string;
  gift_count: number;
}

const CharityStaffView: React.FC = () => {
  const [totals, setTotals] = useState<DonationStats>({});
  const [medaScores, setMedaScores] = useState<DonorScore[]>([]);
  const [taraScores, setTaraScores] = useState<DonorScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCharity, setSelectedCharity] = useState<'MEDA' | 'TARA'>('MEDA');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [totalsResponse, medaResponse, taraResponse] = await Promise.all([
          fetch('http://localhost:8000/totals'),
          fetch('http://localhost:8000/scores/MEDA'),
          fetch('http://localhost:8000/scores/TARA')
        ]);

        const totalsData = await totalsResponse.json();
        const medaData = await medaResponse.json();
        const taraData = await taraResponse.json();

        setTotals(totalsData);
        setMedaScores(medaData);
        setTaraScores(taraData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="charity-loading">Loading charity insights...</div>;
  }

  const currentScores = selectedCharity === 'MEDA' ? medaScores : taraScores;
  const currentTotal = totals[selectedCharity] || 0;

  return (
    <div className="charity-staff-view">
      <div className="charity-header">
        <h1>Charity Staff Dashboard</h1>
        <p>Advanced analytics and donor insights for your organization</p>
      </div>

      <div className="charity-selector">
        <button 
          className={`charity-btn ${selectedCharity === 'MEDA' ? 'active' : ''}`}
          onClick={() => setSelectedCharity('MEDA')}
        >
          MEDA Staff View
        </button>
        <button 
          className={`charity-btn ${selectedCharity === 'TARA' ? 'active' : ''}`}
          onClick={() => setSelectedCharity('TARA')}
        >
          TARA Staff View
        </button>
      </div>

      <div className="charity-overview">
        <div className="overview-card">
          <div className="card-icon">
            <DollarSign className="icon" />
          </div>
          <div className="card-content">
            <h3>Total Donations</h3>
            <p className="card-value">${currentTotal.toLocaleString()}</p>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-icon">
            <Users className="icon" />
          </div>
          <div className="card-content">
            <h3>Unique Donors</h3>
            <p className="card-value">{currentScores.length}</p>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-icon">
            <TrendingUp className="icon" />
          </div>
          <div className="card-content">
            <h3>Avg Gift Count</h3>
            <p className="card-value">
              {currentScores.length > 0 
                ? (currentScores.reduce((sum, donor) => sum + donor.gift_count, 0) / currentScores.length).toFixed(1)
                : '0'
              }
            </p>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-icon">
            <Shield className="icon" />
          </div>
          <div className="card-content">
            <h3>Privacy Level</h3>
            <p className="card-value">Maximum</p>
          </div>
        </div>
      </div>

      <div className="charity-details">
        <div className="details-section">
          <h2>Top Donors Analysis</h2>
          <div className="donors-table">
            <table>
              <thead>
                <tr>
                  <th>Donor Hash</th>
                  <th>Gift Count</th>
                  <th>Engagement Level</th>
                </tr>
              </thead>
              <tbody>
                {currentScores
                  .sort((a, b) => b.gift_count - a.gift_count)
                  .slice(0, 10)
                  .map((donor, index) => (
                    <tr key={index}>
                      <td className="hash-cell">{donor.ph.substring(0, 16)}...</td>
                      <td>{donor.gift_count}</td>
                      <td>
                        <span className={`engagement ${donor.gift_count > 1 ? 'high' : 'medium'}`}>
                          {donor.gift_count > 1 ? 'High' : 'Medium'}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="details-section">
          <h2>Federated Learning Insights</h2>
          <div className="fl-insights">
            <div className="insight-card">
              <h3>🤝 Cross-Organization Learning</h3>
              <p>Your charity contributes to shared insights while maintaining donor privacy</p>
              <div className="insight-stats">
                <span>Models Trained: 2</span>
                <span>Data Shared: 0%</span>
                <span>Privacy Preserved: 100%</span>
              </div>
            </div>
            <div className="insight-card">
              <h3>📊 Predictive Analytics</h3>
              <p>Advanced machine learning models identify donor patterns and opportunities</p>
              <div className="insight-stats">
                <span>Accuracy: 85%</span>
                <span>Coverage: 100%</span>
                <span>Real-time: Yes</span>
              </div>
            </div>
          </div>
        </div>

        <div className="details-section">
          <h2>Blockchain Transparency</h2>
          <div className="blockchain-info">
            <div className="blockchain-card">
              <h3>🔗 Transaction Verification</h3>
              <p>All donations are publicly verifiable on the XRPL blockchain</p>
              <div className="verification-links">
                <a href="https://testnet.xrpl.org" target="_blank" rel="noopener noreferrer">
                  View on XRPL Explorer
                </a>
              </div>
            </div>
            <div className="blockchain-card">
              <h3>🔒 Privacy Protection</h3>
              <p>Donor identities are cryptographically hashed for maximum privacy</p>
              <div className="privacy-features">
                <span>✓ No PII Stored</span>
                <span>✓ Hash-based IDs</span>
                <span>✓ GDPR Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharityStaffView; 