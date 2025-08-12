import React, { useState } from 'react';
import { createUserDonationPayload, checkUserPaymentStatus, userWalletStatus } from '../services/userWalletService';
import { Heart, CheckCircle, AlertCircle, QrCode, Wallet } from 'lucide-react';
import './DonationForm.css';

interface DonationFormData {
  charity: string;
  cid: string;
  amount: number;
  donor_email: string;
}

interface PaymentStatus {
  payloadId: string;
  qrCode: string;
  status: 'pending' | 'completed' | 'error';
  message: string;
  transactionHash?: string;
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
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);

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
    setPaymentStatus(null);
    setShowQRCode(false);

    try {
      // Get charity wallet address based on selection
      const charityAddress = formData.charity === 'MEDA' 
        ? 'r4jSjD22z6HtEu41eh1JrkD3KAW1PyM1RH' 
        : 'rJXhFfZVLKBUfNQMZqssdqG3xj5JZFdqYm';

      // Create user donation payload
      const payload = await createUserDonationPayload(
        charityAddress,
        formData.amount,
        formData.charity,
        formData.cid,
        formData.donor_email
      );

      if (payload.success) {
        setPaymentStatus({
          payloadId: payload.payloadId,
          qrCode: payload.qrCode,
          status: 'pending',
          message: payload.message
        });
        setShowQRCode(true);
      } else {
        setError(payload.error || 'Failed to create payment payload');
      }
    } catch (err) {
      setError('Failed to process donation. Please try again.');
      console.error('Donation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!paymentStatus) return;

    try {
      const status = await checkUserPaymentStatus(paymentStatus.payloadId);
      
      if (status.status === 'completed' || status.signed) {
        setPaymentStatus(prev => prev ? {
          ...prev,
          status: 'completed',
          message: 'Payment completed successfully!',
          transactionHash: status.transactionHash
        } : null);
        setSuccess(`Donation successful! Transaction: ${status.transactionHash || 'Completed'}`);
        setShowQRCode(false);
      } else if (status.status === 'error') {
        setPaymentStatus(prev => prev ? {
          ...prev,
          status: 'error',
          message: status.message
        } : null);
        setError('Payment failed. Please try again.');
      }
    } catch (err) {
      console.error('Error checking payment status:', err);
    }
  };

  const isValidForm = formData.cid.trim() && formData.amount > 0;

  return (
    <div className="donation-form-container">
      <div className="donation-header">
        <Heart className="donation-icon" />
        <h1>Make a Donation</h1>
        <p>Support our partner charities through secure blockchain transactions</p>
        
        {/* User Wallet Integration Status */}
        <div className={`xumm-status ${userWalletStatus.isAvailable ? 'available' : 'fallback'}`}>
          <span className="status-indicator"></span>
          <Wallet className="wallet-icon" />
          {userWalletStatus.message}
        </div>
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

          {paymentStatus && showQRCode && (
            <div className="payment-qr-section">
              <h3>Complete Your Donation</h3>
              <p>Scan this QR code with your XUMM wallet to complete the payment:</p>
              <div className="qr-container">
                <img src={paymentStatus.qrCode} alt="Payment QR Code" className="qr-code" />
              </div>
              <div className="payment-actions">
                <button
                  type="button"
                  onClick={checkPaymentStatus}
                  className="btn check-status-btn"
                >
                  Check Payment Status
                </button>
                <a 
                  href={paymentStatus.qrCode} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn open-xumm-btn"
                >
                  Open in XUMM
                </a>
              </div>
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
                Creating Payment...
              </>
            ) : (
              <>
                <Heart className="btn-icon" />
                Create Donation Payment
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
                <h4>Connect Wallet</h4>
                <p>Scan QR code with your XUMM wallet</p>
              </div>
            </div>
            
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h4>Confirm Payment</h4>
                <p>Sign and confirm the blockchain transaction</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationForm; 