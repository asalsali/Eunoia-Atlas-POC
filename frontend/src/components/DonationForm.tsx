import React, { useState } from 'react';
import { Heart, CheckCircle, AlertCircle } from 'lucide-react';
import { makeDonation } from '../services/api';
import './DonationForm.css';

interface DonationFormData {
  charity: string;
  cid: string;
  amount: number;
  donor_email: string;
}

const DonationForm: React.FC = () => {
  const [formData, setFormData] = useState<DonationFormData>({
    charity: 'MEDA',
    cid: '',
    amount: 0,
    donor_email: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await makeDonation(formData);
      setSuccess(`Donation successful! Transaction: ${result.tx}`);
      setFormData({
        charity: 'MEDA',
        cid: '',
        amount: 0,
        donor_email: ''
      });
    } catch (err) {
      setError('Failed to process donation. Please try again.');
      console.error('Donation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const isValidForm = formData.cid.trim() && formData.amount > 0;

  return (
    <div className="donation-form-container">
      <div className="donation-header">
        <Heart className="donation-icon" />
        <h1>Make a Donation</h1>
        <p>Support our partner charities through secure blockchain transactions</p>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit} className="donation-form">
          <div className="form-group">
            <label htmlFor="charity">Select Charity</label>
            <select
              id="charity"
              name="charity"
              value={formData.charity}
              onChange={handleInputChange}
              className="input"
            >
              <option value="MEDA">MEDA - Medical Emergency Development Aid</option>
              <option value="TARA">TARA - Technology Access for Rural Areas</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="cid">Cause ID</label>
            <input
              type="text"
              id="cid"
              name="cid"
              value={formData.cid}
              onChange={handleInputChange}
              className="input"
              placeholder="Enter cause identifier"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="amount">Donation Amount (USD)</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount || ''}
              onChange={handleInputChange}
              className="input"
              placeholder="0.00"
              min="0.01"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="donor_email">Email (Optional)</label>
            <input
              type="email"
              id="donor_email"
              name="donor_email"
              value={formData.donor_email}
              onChange={handleInputChange}
              className="input"
              placeholder="your@email.com"
            />
          </div>

          {success && (
            <div className="success-message">
              <CheckCircle className="success-icon" />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="error-message">
              <AlertCircle className="error-icon" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn submit-btn"
            disabled={!isValidForm || loading}
          >
            {loading ? (
              <>
                <div className="loading"></div>
                Processing...
              </>
            ) : (
              <>
                <Heart className="btn-icon" />
                Make Donation
              </>
            )}
          </button>
        </form>

        <div className="donation-info">
          <h3>How it works</h3>
          <div className="info-steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Select Charity</h4>
                <p>Choose from our verified partner charities</p>
              </div>
            </div>
            
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Enter Details</h4>
                <p>Provide cause ID and donation amount</p>
              </div>
            </div>
            
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Blockchain Transaction</h4>
                <p>Your donation is recorded on XRPL blockchain</p>
              </div>
            </div>
            
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h4>Confirmation</h4>
                <p>Receive transaction confirmation and tracking</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationForm; 