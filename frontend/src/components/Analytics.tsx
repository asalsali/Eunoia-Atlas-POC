import React, { useState, useEffect } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { TrendingUp, DollarSign, Users, Activity } from 'lucide-react';
import { getTotals } from '../services/api';
import './Analytics.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface Totals {
  MEDA?: number;
  TARA?: number;
}

const Analytics: React.FC = () => {
  const [totals, setTotals] = useState<Totals>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getTotals();
        setTotals(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalDonations = (totals.MEDA || 0) + (totals.TARA || 0);

  // Mock data for charts
  const monthlyData = [
    { month: 'Jan', MEDA: 1200, TARA: 800 },
    { month: 'Feb', MEDA: 1500, TARA: 1200 },
    { month: 'Mar', MEDA: 1800, TARA: 1400 },
    { month: 'Apr', MEDA: 2200, TARA: 1600 },
    { month: 'May', MEDA: 2500, TARA: 1800 },
    { month: 'Jun', MEDA: 2800, TARA: 2000 },
  ];

  const chartData = {
    labels: monthlyData.map(d => d.month),
    datasets: [
      {
        label: 'MEDA',
        data: monthlyData.map(d => d.MEDA),
        backgroundColor: '#a855f7',
        borderColor: '#a855f7',
        borderWidth: 1,
      },
      {
        label: 'TARA',
        data: monthlyData.map(d => d.TARA),
        backgroundColor: '#ec4899',
        borderColor: '#ec4899',
        borderWidth: 1,
      },
    ],
  };

  const pieData = {
    labels: ['MEDA', 'TARA'],
    datasets: [
      {
        data: [totals.MEDA || 0, totals.TARA || 0],
        backgroundColor: ['#a855f7', '#ec4899'],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return '$' + value.toLocaleString();
          },
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return context.dataset.label + ': $' + context.parsed.y.toLocaleString();
          },
        },
      },
    },
  };

  return (
    <div className="analytics">
      <div className="analytics-header">
        <TrendingUp className="analytics-icon" />
        <h1>Analytics Dashboard</h1>
        <p>Comprehensive insights into donation patterns and trends</p>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading"></div>
          <p>Loading analytics...</p>
        </div>
      ) : (
        <>
          <div className="metrics-grid">
            <div className="metric-card">
              <DollarSign className="metric-icon" />
              <div className="metric-content">
                <h3>Total Donations</h3>
                <p className="metric-value">${totalDonations.toLocaleString()}</p>
                <span className="metric-change positive">+12.5% from last month</span>
              </div>
            </div>

            <div className="metric-card">
              <Users className="metric-icon" />
              <div className="metric-content">
                <h3>Active Donors</h3>
                <p className="metric-value">1,247</p>
                <span className="metric-change positive">+8.3% from last month</span>
              </div>
            </div>

            <div className="metric-card">
              <Activity className="metric-icon" />
              <div className="metric-content">
                <h3>Avg. Donation</h3>
                <p className="metric-value">$45.67</p>
                <span className="metric-change positive">+5.2% from last month</span>
              </div>
            </div>

            <div className="metric-card">
              <TrendingUp className="metric-icon" />
              <div className="metric-content">
                <h3>Growth Rate</h3>
                <p className="metric-value">15.8%</p>
                <span className="metric-change positive">+2.1% from last month</span>
              </div>
            </div>
          </div>

          <div className="charts-container">
            <div className="chart-card">
              <h3>Monthly Donation Trends</h3>
              <div className="chart-container">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>

            <div className="chart-card">
              <h3>Charity Distribution</h3>
              <div className="chart-container">
                <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>
          </div>

          <div className="charity-breakdown">
            <h3>Charity Performance</h3>
            <div className="charity-stats">
              <div className="charity-stat">
                <h4>MEDA</h4>
                <p className="charity-amount">${(totals.MEDA || 0).toLocaleString()}</p>
                <div className="charity-percentage">
                  {totalDonations > 0 ? (((totals.MEDA || 0) / totalDonations) * 100).toFixed(1) : 0}%
                </div>
                <div className="charity-trend positive">+18.2% this month</div>
              </div>

              <div className="charity-stat">
                <h4>TARA</h4>
                <p className="charity-amount">${(totals.TARA || 0).toLocaleString()}</p>
                <div className="charity-percentage">
                  {totalDonations > 0 ? (((totals.TARA || 0) / totalDonations) * 100).toFixed(1) : 0}%
                </div>
                <div className="charity-trend positive">+14.7% this month</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics; 