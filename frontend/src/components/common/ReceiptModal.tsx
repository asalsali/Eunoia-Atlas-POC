import React from 'react';

interface ReceiptModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  amount?: number;
  currency?: string; // e.g., 'CAD'
  charity?: string;
  intent?: string;
  transactionHash?: string;
  transactionUrl?: string;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({
  open,
  onClose,
  title = 'Thank you.',
  amount,
  currency = 'CAD',
  charity,
  intent,
  transactionHash,
  transactionUrl,
}) => {
  if (!open) return null;

  const explorerUrl = transactionUrl || (transactionHash ? `https://testnet.xrpl.org/transactions/${transactionHash}` : undefined);

  return (
    <div style={{ 
      position: 'fixed', 
      inset: 0, 
      background: 'rgba(15,23,42,.6)', 
      display: 'grid', 
      placeItems: 'center', 
      zIndex: 60,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{ 
        background: '#fff', 
        borderRadius: 20, 
        padding: 32, 
        width: 'min(92vw, 560px)', 
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          marginBottom: 24 
        }}>
          <div>
            <h3 style={{ 
              margin: 0, 
              fontSize: '2rem', 
              color: '#0f172a',
              fontWeight: 900,
              lineHeight: 1.2
            }}>
              {title}
            </h3>
            <p style={{
              margin: '8px 0 0 0',
              color: '#64748b',
              fontSize: '1.125rem',
              lineHeight: 1.6
            }}>
              You just funded real change.
            </p>
          </div>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'transparent', 
              border: 'none', 
              fontSize: 24, 
              cursor: 'pointer',
              color: '#64748b',
              padding: 8,
              borderRadius: 8,
              transition: 'all 0.2s ease'
            }} 
            aria-label="Close"
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#374151';
              e.currentTarget.style.backgroundColor = '#f1f5f9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#64748b';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ×
          </button>
        </div>
        
        <div style={{ 
          color: '#374151', 
          lineHeight: 1.6,
          fontSize: '1rem'
        }}>
          {intent ? (
            <div style={{ 
              margin: '0 0 24px 0',
              padding: '20px',
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              border: '1px solid #e2e8f0',
              borderRadius: 16,
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                borderRadius: '16px 16px 0 0'
              }} />
              <blockquote style={{ 
                margin: 0,
                fontSize: '1.125rem',
                fontStyle: 'italic',
                color: '#1e293b',
                lineHeight: 1.6
              }}>
                "{intent}"
              </blockquote>
            </div>
          ) : null}
          
          {typeof amount === 'number' ? (
            <div style={{ 
              margin: '0 0 24px 0',
              padding: '16px 20px',
              background: '#f8fafc',
              borderRadius: 12,
              border: '1px solid #e2e8f0'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontWeight: 600, color: '#374151' }}>Amount:</span>
                <span style={{ 
                  fontWeight: 700, 
                  fontSize: '1.125rem',
                  color: '#0f172a'
                }}>
                  {currency} {amount.toFixed(2)}
                </span>
              </div>
              {charity && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 8
                }}>
                  <span style={{ fontWeight: 600, color: '#374151' }}>Charity:</span>
                  <span style={{ fontWeight: 500, color: '#0f172a' }}>{charity}</span>
                </div>
              )}
            </div>
          ) : null}
          
          {explorerUrl ? (
            <div style={{ 
              marginTop: 24,
              textAlign: 'center'
            }}>
              <a 
                href={explorerUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  color: '#7c3aed', 
                  fontWeight: 600, 
                  textDecoration: 'none',
                  padding: '12px 20px',
                  borderRadius: 12,
                  border: '2px solid #7c3aed',
                  transition: 'all 0.2s ease',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#7c3aed';
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#7c3aed';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                View Transaction
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 7h10v10M7 17l10-10"/>
                </svg>
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;


