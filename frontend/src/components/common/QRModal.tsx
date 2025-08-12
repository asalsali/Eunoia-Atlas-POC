import React from 'react';

interface QRModalProps {
  open: boolean;
  title: string;
  qrUrl?: string;
  openLink?: string;
  network?: string;
  status?: string;
  onClose: () => void;
}

const QRModal: React.FC<QRModalProps> = ({ open, title, qrUrl, openLink, network, status, onClose }) => {
  console.log('QRModal render:', { open, title, qrUrl, openLink, network, status });
  
  if (!open) {
    console.log('QRModal not open, returning null');
    return null;
  }
  
  console.log('QRModal rendering with qrUrl:', qrUrl);
  
  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      background: 'rgba(0,0,0,0.8)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      zIndex: 9999,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{ 
        background: '#ffffff', 
        borderRadius: '16px', 
        padding: '24px', 
        width: 'min(90vw, 400px)', 
        maxWidth: '400px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        border: '1px solid #e2e8f0',
        position: 'relative'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '16px' 
        }}>
          <h3 style={{ margin: 0, fontSize: '20px', color: '#1e293b', fontWeight: '600' }}>{title}</h3>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'transparent', 
              border: 'none', 
              fontSize: '24px', 
              cursor: 'pointer',
              color: '#64748b',
              padding: '4px',
              borderRadius: '4px',
              lineHeight: 1
            }}
          >
            ×
          </button>
        </div>
        
        {network && (
          <div style={{ 
            fontSize: '12px', 
            color: '#334155', 
            background: '#f1f5f9', 
            display: 'inline-flex', 
            padding: '6px 12px', 
            borderRadius: '20px', 
            border: '1px solid #e2e8f0',
            marginBottom: '16px'
          }}>
            Network: {network}
          </div>
        )}
        
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          marginTop: '16px' 
        }}>
          {qrUrl ? (
            <div style={{ textAlign: 'center' }}>
              <img 
                src={qrUrl} 
                alt="Xaman QR" 
                style={{ 
                  width: '240px', 
                  height: '240px', 
                  borderRadius: '12px',
                  border: '2px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }} 
              />
              <p style={{ 
                marginTop: '12px', 
                fontSize: '14px', 
                color: '#64748b',
                fontWeight: '500'
              }}>
                Scan with XAMAN app
              </p>
            </div>
          ) : openLink ? (
            <a 
              href={openLink} 
              target="_blank" 
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#7c3aed',
                color: '#fff',
                padding: '12px 24px',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '16px'
              }}
            >
              Open in Xaman
            </a>
          ) : (
            <div style={{ 
              padding: '40px', 
              textAlign: 'center', 
              color: '#64748b' 
            }}>
              Loading QR code...
            </div>
          )}
        </div>
        
        {status && (
          <div style={{ marginTop: '16px', textAlign: 'center' }}>
            <div style={{ color: '#475569', fontSize: '14px', fontWeight: '500' }}>{status}</div>
            {status.includes('Demo: Auto-confirmation in') && (
              <div style={{ 
                marginTop: '12px', 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: '#7c3aed',
                background: '#f3f4f6',
                padding: '12px 20px',
                borderRadius: '12px',
                display: 'inline-block'
              }}>
                ⏰ {status.split('in ')[1]}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QRModal;



