import React, { useState, useEffect } from 'react';
import { Heart, CheckCircle, AlertCircle, QrCode, Smartphone } from 'lucide-react';
import { createDonationPayment, checkPaymentStatus } from '../services/xummService';
import './DonationForm.css';

interface DonationFormData {
  charity: string;
  cid: string;
  amount: number;
  donor_email: string;
}

interface PaymentStatus {
  payloadId: string;
  qrCodeUrl: string;
  status: 'pending' | 'completed' | 'failed';
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
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Charity wallet addresses (you'll need to set these up)
  const charityWallets = {
    'MEDA': 'rQhWct2fv4Vc4KRjRgMrxa8xPN9Zx9iLKV', // Replace with actual MEDA wallet
    'TARA': 'rQhWct2fv4Vc4KRjRgMrxa8xPN9Zx9iLKV'  // Replace with actual TARA wallet
  };

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
    setPaymentStatus(null);

    try {
      const transactionId = `DONATION_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const destination = charityWallets[formData.charity as keyof typeof charityWallets];
      
      const payload = await createDonationPayment(
        destination,
        transactionId,
        formData.amount,
        formData.charity,
        formData.cid
      );

      setPaymentStatus({
        payloadId: payload.uuid,
        qrCodeUrl: payload.refs.qr_png,
        status: 'pending'
      });

      // Start polling for payment status
      pollPaymentStatus(payload.uuid);

    } catch (err) {
      setError('Failed to create payment. Please try again.');
      console.error('Payment creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const pollPaymentStatus = async (payloadId: string) => {
    const interval = setInterval(async () => {
      try {
        const status = await checkPaymentStatus(payloadId);
        
        if (status.response?.dispatched_result === 'tesSUCCESS') {
          setPaymentStatus(prev => prev ? {
            ...prev,
            status: 'completed',
            transactionHash: status.response.txid
          } : null);
          clearInterval(interval);
        } else if (status.response?.dispatched_result === 'tecPATH_DRY') {
          setPaymentStatus(prev => prev ? {
            ...prev,
            status: 'failed'
          } : null);
          clearInterval(interval);
        }
      } catch (err) {
        console.error('Error checking payment status:', err);
      }
    }, 2000); // Check every 2 seconds

    // Stop polling after 5 minutes
    setTimeout(() => clearInterval(interval), 300000);
  };

  const isValidForm = formData.cid.trim() && formData.amount > 0;

  return (
    <div className="donation-form-container">
      <div className="donation-header">
        <Heart className="donation-icon" />
        <h1>Make a Donation</h1>
        <p>Support our partner charities through secure XRPL transactions</p>
      </div>

      {!paymentStatus ? (
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
              <label htmlFor="amount">Donation Amount (RLUSD)</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                className="input"
                placeholder="Enter amount"
                min="0"
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
                placeholder="Enter your email for updates"
              />
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={!isValidForm || loading}
            >
              {loading ? 'Creating Payment...' : 'Create Xumm Payment'}
            </button>

            {error && (
              <div className="error-message">
                <AlertCircle className="error-icon" />
                {error}
              </div>
            )}
          </form>
        </div>
      ) : (
        <div className="payment-status-container">
          <div className="payment-header">
            <QrCode className="qr-icon" />
            <h2>Payment Ready</h2>
            <p>Scan the QR code with Xumm/Xaman to complete your donation</p>
          </div>

          <div className="qr-container">
            <img 
              src={paymentStatus.qrCodeUrl} 
              alt="Payment QR Code" 
              className="qr-code"
            />
          </div>

          <div className="payment-details">
            <div className="detail-item">
              <strong>Charity:</strong> {formData.charity}
            </div>
            <div className="detail-item">
              <strong>Amount:</strong> {formData.amount} RLUSD
            </div>
            <div className="detail-item">
              <strong>Cause ID:</strong> {formData.cid}
            </div>
          </div>

          <div className="payment-instructions">
            <h3>How to Pay:</h3>
            <ol>
              <li>Open Xumm/Xaman on your phone</li>
              <li>Tap the QR code scanner</li>
              <li>Scan the QR code above</li>
              <li>Review and confirm the payment</li>
            </ol>
          </div>

          {paymentStatus.status === 'completed' && (
            <div className="success-message">
              <CheckCircle className="success-icon" />
              <h3>Payment Successful!</h3>
              <p>Transaction Hash: {paymentStatus.transactionHash}</p>
              <button 
                onClick={() => setPaymentStatus(null)}
                className="new-donation-btn"
              >
                Make Another Donation
              </button>
            </div>
          )}

          {paymentStatus.status === 'failed' && (
            <div className="error-message">
              <AlertCircle className="error-icon" />
              <h3>Payment Failed</h3>
              <p>Please try again or contact support</p>
              <button 
                onClick={() => setPaymentStatus(null)}
                className="retry-btn"
              >
                Try Again
              </button>
            </div>
          )}

          <button 
            onClick={() => setPaymentStatus(null)}
            className="back-btn"
          >
            ← Back to Form
          </button>
        </div>
      )}
    </div>
  );
};

export default DonationForm; 