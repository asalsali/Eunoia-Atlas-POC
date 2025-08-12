import React from 'react';
import { CheckCircle2, Download, Share2, Heart, Calendar, DollarSign, Hash } from 'lucide-react';
import './DonationConfirmation.css';

interface DonationConfirmationProps {
  message: string;
  amount: number;
  transactionHash?: string;
  transactionUrl?: string;
  isPublic: boolean;
  onReturnHome: () => void;
}

const DonationConfirmation: React.FC<DonationConfirmationProps> = ({
  message,
  amount,
  transactionHash,
  transactionUrl,
  isPublic,
  onReturnHome
}) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const receiptNumber = `MEDA-${Date.now().toString().slice(-8)}`;
  
  const downloadReceipt = () => {
    const receiptContent = `
MEDA - Tax Receipt
Receipt #: ${receiptNumber}
Date: ${currentDate}

Thank you for your generous donation to MEDA (Mennonite Economic Development Associates).

Donation Details:
- Amount: $${amount} CAD
- Transaction: ${transactionHash || 'Processing...'}
- Message: "${message}"
- Anonymous: ${isPublic ? 'No' : 'Yes'}

This receipt serves as official documentation for tax purposes.
Your donation supports economic development initiatives worldwide.

For questions, contact: receipts@meda.org
    `;
    
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MEDA-Receipt-${receiptNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareReceipt = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My donation to MEDA',
        text: `I just donated $${amount} to MEDA with the message: "${message}"`,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`I just donated $${amount} to MEDA with the message: "${message}"`);
      alert('Receipt link copied to clipboard!');
    }
  };

  return (
    <div className="donation-confirmation">
      <div className="confirmation-container">
        {/* Success Header */}
        <div className="success-header">
          <div className="success-icon">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="success-title">Thank you for your donation!</h1>
          <p className="success-subtitle">Your support makes a real difference</p>
        </div>

        {/* Tax Receipt Card */}
        <div className="receipt-card">
          <div className="receipt-header">
            <div className="meda-logo">
              <Heart size={24} />
              <span>MEDA</span>
            </div>
            <div className="receipt-number">
              Receipt #{receiptNumber}
            </div>
          </div>

          <div className="receipt-content">
            <div className="receipt-section">
              <h3>Donation Details</h3>
              <div className="receipt-row">
                <span className="label">Amount:</span>
                <span className="value">${amount} CAD</span>
              </div>
              <div className="receipt-row">
                <span className="label">Date:</span>
                <span className="value">{currentDate}</span>
              </div>
              <div className="receipt-row">
                <span className="label">Transaction:</span>
                <span className="value">
                  {transactionHash ? (
                    <a href={transactionUrl} target="_blank" rel="noopener noreferrer" className="transaction-link">
                      {transactionHash.slice(0, 8)}...{transactionHash.slice(-8)}
                    </a>
                  ) : (
                    'Processing...'
                  )}
                </span>
              </div>
              <div className="receipt-row">
                <span className="label">Anonymous:</span>
                <span className="value">{isPublic ? 'No' : 'Yes'}</span>
              </div>
            </div>

            <div className="receipt-section">
              <h3>Your Message</h3>
              <blockquote className="donation-message">"{message}"</blockquote>
            </div>

            <div className="receipt-section">
              <h3>Tax Information</h3>
              <p className="tax-note">
                This receipt serves as official documentation for tax purposes. 
                MEDA is a registered charity in Canada (Registration #: 10762 6951 RR0001).
              </p>
            </div>

            <div className="receipt-footer">
              <p>Thank you for supporting economic development initiatives worldwide.</p>
              <p>For questions, contact: <a href="mailto:receipts@meda.org">receipts@meda.org</a></p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="action-button primary" onClick={downloadReceipt}>
            <Download size={20} />
            Download Receipt
          </button>
          <button className="action-button secondary" onClick={shareReceipt}>
            <Share2 size={20} />
            Share
          </button>
          <button className="action-button home" onClick={onReturnHome}>
            Return Home
          </button>
        </div>

        {/* Impact Statement */}
        <div className="impact-statement">
          <h3>Your Impact</h3>
          <p>
            Your donation of ${amount} helps MEDA create business solutions to poverty. 
            This could provide microloans to entrepreneurs, support agricultural training, 
            or help build sustainable businesses in developing communities.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DonationConfirmation;
