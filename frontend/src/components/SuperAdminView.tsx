import React, { useState, useEffect } from 'react';
import './SuperAdminView.css';
import { Settings, Users, Shield, Activity, Plus, Eye, Database, Network } from 'lucide-react';

interface FLClient {
  name: string;
  status: 'online' | 'offline' | 'training';
  lastSeen: string;
  modelsTrained: number;
  dataPoints: number;
}

interface Organization {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'suspended';
  joinedDate: string;
  totalDonations: number;
  donorsCount: number;
}

const SuperAdminView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'onboarding' | 'fl-monitor' | 'organizations'>('overview');
  const [flClients, setFlClients] = useState<FLClient[]>([
    {
      name: 'meda-client',
      status: 'online',
      lastSeen: '2 minutes ago',
      modelsTrained: 3,
      dataPoints: 150
    },
    {
      name: 'tara-client',
      status: 'online',
      lastSeen: '1 minute ago',
      modelsTrained: 2,
      dataPoints: 75
    }
  ]);
  const [organizations, setOrganizations] = useState<Organization[]>([
    {
      id: 'meda-001',
      name: 'MEDA',
      status: 'active',
      joinedDate: '2024-01-15',
      totalDonations: 5000,
      donorsCount: 3
    },
    {
      id: 'tara-001',
      name: 'TARA',
      status: 'active',
      joinedDate: '2024-02-01',
      totalDonations: 2500,
      donorsCount: 1
    }
  ]);

  const [newOrg, setNewOrg] = useState({
    name: '',
    contactEmail: '',
    description: ''
  });

  const handleAddOrganization = () => {
    if (newOrg.name && newOrg.contactEmail) {
      const org: Organization = {
        id: `${newOrg.name.toLowerCase()}-${Date.now()}`,
        name: newOrg.name,
        status: 'pending',
        joinedDate: new Date().toISOString().split('T')[0],
        totalDonations: 0,
        donorsCount: 0
      };
      setOrganizations([...organizations, org]);
      setNewOrg({ name: '', contactEmail: '', description: '' });
    }
  };

  return (
    <div className="super-admin-view">
      <div className="admin-header">
        <h1>Super Admin Dashboard</h1>
        <p>Platform administration and federated learning monitoring</p>
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <Activity className="icon" />
          Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'onboarding' ? 'active' : ''}`}
          onClick={() => setActiveTab('onboarding')}
        >
          <Plus className="icon" />
          Onboarding
        </button>
        <button 
          className={`tab-btn ${activeTab === 'fl-monitor' ? 'active' : ''}`}
          onClick={() => setActiveTab('fl-monitor')}
        >
          <Network className="icon" />
          FL Monitor
        </button>
        <button 
          className={`tab-btn ${activeTab === 'organizations' ? 'active' : ''}`}
          onClick={() => setActiveTab('organizations')}
        >
          <Users className="icon" />
          Organizations
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="admin-overview">
          <div className="overview-stats">
            <div className="stat-card">
              <div className="stat-icon">
                <Users className="icon" />
              </div>
              <div className="stat-content">
                <h3>Active Organizations</h3>
                <p className="stat-value">{organizations.filter(org => org.status === 'active').length}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Network className="icon" />
              </div>
              <div className="stat-content">
                <h3>FL Clients Online</h3>
                <p className="stat-value">{flClients.filter(client => client.status === 'online').length}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Database className="icon" />
              </div>
              <div className="stat-content">
                <h3>Total Data Points</h3>
                <p className="stat-value">{flClients.reduce((sum, client) => sum + client.dataPoints, 0)}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Shield className="icon" />
              </div>
              <div className="stat-content">
                <h3>Privacy Level</h3>
                <p className="stat-value">Maximum</p>
              </div>
            </div>
          </div>

          <div className="overview-charts">
            <div className="chart-card">
              <h3>Platform Health</h3>
              <div className="health-indicators">
                <div className="indicator">
                  <span className="status online"></span>
                  <span>API Server</span>
                </div>
                <div className="indicator">
                  <span className="status online"></span>
                  <span>Database</span>
                </div>
                <div className="indicator">
                  <span className="status online"></span>
                  <span>XRPL Listener</span>
                </div>
                <div className="indicator">
                  <span className="status online"></span>
                  <span>FL Server</span>
                </div>
              </div>
            </div>

            <div className="chart-card">
              <h3>Recent Activity</h3>
              <div className="activity-list">
                <div className="activity-item">
                  <span className="activity-time">2 min ago</span>
                  <span className="activity-text">MEDA client completed training round</span>
                </div>
                <div className="activity-item">
                  <span className="activity-time">5 min ago</span>
                  <span className="activity-text">New donation processed via XRPL</span>
                </div>
                <div className="activity-item">
                  <span className="activity-time">10 min ago</span>
                  <span className="activity-text">TARA client joined federated learning</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'onboarding' && (
        <div className="admin-onboarding">
          <div className="onboarding-form">
            <h2>Add New Organization</h2>
            <div className="form-group">
              <label>Organization Name</label>
              <input 
                type="text" 
                value={newOrg.name}
                onChange={(e) => setNewOrg({...newOrg, name: e.target.value})}
                placeholder="Enter organization name"
              />
            </div>
            <div className="form-group">
              <label>Contact Email</label>
              <input 
                type="email" 
                value={newOrg.contactEmail}
                onChange={(e) => setNewOrg({...newOrg, contactEmail: e.target.value})}
                placeholder="Enter contact email"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea 
                value={newOrg.description}
                onChange={(e) => setNewOrg({...newOrg, description: e.target.value})}
                placeholder="Brief description of the organization"
                rows={3}
              />
            </div>
            <button className="add-org-btn" onClick={handleAddOrganization}>
              <Plus className="icon" />
              Add Organization
            </button>
          </div>

          <div className="onboarding-info">
            <h3>Onboarding Process</h3>
            <div className="process-steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Organization Registration</h4>
                  <p>Add organization details and contact information</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>FL Client Setup</h4>
                  <p>Deploy federated learning client for the organization</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Data Integration</h4>
                  <p>Connect organization's donation data to the platform</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h4>Training & Validation</h4>
                  <p>Validate FL client and begin collaborative training</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'fl-monitor' && (
        <div className="admin-fl-monitor">
          <h2>Federated Learning Monitor</h2>
          <div className="fl-clients">
            {flClients.map((client, index) => (
              <div key={index} className="fl-client-card">
                <div className="client-header">
                  <h3>{client.name}</h3>
                  <span className={`status-badge ${client.status}`}>
                    {client.status}
                  </span>
                </div>
                <div className="client-stats">
                  <div className="stat">
                    <span className="label">Status:</span>
                    <span className="value">{client.status}</span>
                  </div>
                  <div className="stat">
                    <span className="label">Last Seen:</span>
                    <span className="value">{client.lastSeen}</span>
                  </div>
                  <div className="stat">
                    <span className="label">Models Trained:</span>
                    <span className="value">{client.modelsTrained}</span>
                  </div>
                  <div className="stat">
                    <span className="label">Data Points:</span>
                    <span className="value">{client.dataPoints}</span>
                  </div>
                </div>
                <div className="client-actions">
                  <button className="action-btn">
                    <Eye className="icon" />
                    View Details
                  </button>
                  <button className="action-btn">
                    <Settings className="icon" />
                    Configure
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="fl-metrics">
            <h3>FL Performance Metrics</h3>
            <div className="metrics-grid">
              <div className="metric-card">
                <h4>Model Accuracy</h4>
                <p className="metric-value">85.2%</p>
                <p className="metric-trend">+2.1% from last week</p>
              </div>
              <div className="metric-card">
                <h4>Training Rounds</h4>
                <p className="metric-value">12</p>
                <p className="metric-trend">This month</p>
              </div>
              <div className="metric-card">
                <h4>Data Privacy</h4>
                <p className="metric-value">100%</p>
                <p className="metric-trend">No data shared</p>
              </div>
              <div className="metric-card">
                <h4>Uptime</h4>
                <p className="metric-value">99.8%</p>
                <p className="metric-trend">Last 30 days</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'organizations' && (
        <div className="admin-organizations">
          <h2>Organization Management</h2>
          <div className="orgs-table">
            <table>
              <thead>
                <tr>
                  <th>Organization</th>
                  <th>Status</th>
                  <th>Joined Date</th>
                  <th>Total Donations</th>
                  <th>Donors</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {organizations.map((org) => (
                  <tr key={org.id}>
                    <td>{org.name}</td>
                    <td>
                      <span className={`status-badge ${org.status}`}>
                        {org.status}
                      </span>
                    </td>
                    <td>{org.joinedDate}</td>
                    <td>${org.totalDonations.toLocaleString()}</td>
                    <td>{org.donorsCount}</td>
                    <td>
                      <div className="org-actions">
                        <button className="action-btn small">
                          <Eye className="icon" />
                        </button>
                        <button className="action-btn small">
                          <Settings className="icon" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminView; 