import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, TrendingUp, Users, DollarSign, ArrowRight } from 'lucide-react';
import { getTotals } from '../services/api';
import './Dashboard.css';

interface Totals {
  MEDA?: number;
  TARA?: number;
}

const Dashboard: React.FC = () => {
  const [totals, setTotals] = useState<Totals>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTotals = async () => {
      try {
        const data = await getTotals();
        setTotals(data);
      } catch (error) {
        console.error('Error fetching totals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTotals();
  }, []);

  const totalDonations = (totals.MEDA || 0) + (totals.TARA || 0);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome to Eunoia Atlas</h1>
        <p>Federated Learning for Charitable Giving</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <DollarSign />
          </div>
          <div className="stat-content">
            <h3>Total Donations</h3>
            <p className="stat-value">
              {loading ? '...' : `$${totalDonations.toFixed(2)}`}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Heart />
          </div>
          <div className="stat-content">
            <h3>Active Charities</h3>
            <p className="stat-value">2</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp />
          </div>
          <div className="stat-content">
            <h3>Growth Rate</h3>
            <p className="stat-value">+15%</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Users />
          </div>
          <div className="stat-content">
            <h3>Donors</h3>
            <p className="stat-value">24</p>
          </div>
        </div>
      </div>

      <div className="charity-breakdown">
        <h2>Charity Breakdown</h2>
        <div className="charity-cards">
          <div className="charity-card">
            <h3>MEDA</h3>
            <p className="charity-amount">${(totals.MEDA || 0).toFixed(2)}</p>
            <div className="charity-progress">
              <div 
                className="charity-progress-bar" 
                style={{ width: `${totalDonations > 0 ? ((totals.MEDA || 0) / totalDonations) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
          
          <div className="charity-card">
            <h3>TARA</h3>
            <p className="charity-amount">${(totals.TARA || 0).toFixed(2)}</p>
            <div className="charity-progress">
              <div 
                className="charity-progress-bar" 
                style={{ width: `${totalDonations > 0 ? ((totals.TARA || 0) / totalDonations) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/donate" className="action-card">
            <Heart className="action-icon" />
            <h3>Make a Donation</h3>
            <p>Support our partner charities</p>
            <ArrowRight className="action-arrow" />
          </Link>
          
          <Link to="/analytics" className="action-card">
            <TrendingUp className="action-icon" />
            <h3>View Analytics</h3>
            <p>Explore donation trends</p>
            <ArrowRight className="action-arrow" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 