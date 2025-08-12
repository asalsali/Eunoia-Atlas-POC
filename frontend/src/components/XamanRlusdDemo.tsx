import React, { useEffect, useRef, useState } from 'react';
import { xamanCreatePayment } from '../services/api';
import { checkUserPaymentStatus } from '../services/userWalletService';
import QRModal from './common/QRModal';

type PaymentState =
  | { phase: 'idle' }
  | { phase: 'creating' }
  | { phase: 'ready'; payloadId: string; qrCode?: string; message?: string }
  | { phase: 'completed'; txid?: string }
  | { phase: 'error'; message: string };

const MEDA_ADDRESS = process.env.REACT_APP_MEDA_WALLET_ADDRESS || 'r4jSjD22z6HtEu41eh1JrkD3KAW1PyM1RH';
const RLUSD_ISSUER = 'rQhWct2fv4Vc4KRjRgMrxa8xPN9Zx9iLKV';

const XamanRlusdDemo: React.FC = () => {
  const [state, setState] = useState<PaymentState>({ phase: 'idle' });
  const [showQRModal, setShowQRModal] = useState(false);
  const pollRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (pollRef.current) window.clearTimeout(pollRef.current);
    };
  }, []);

  const startXaman = async () => {
    if (state.phase !== 'idle') return;
    setState({ phase: 'creating' });
    console.log('Starting Xaman RLUSD demo...');
    try {
      const resp = await xamanCreatePayment({
        destination: MEDA_ADDRESS,
        amount: 1,
        charity: 'MEDA',
        cause_id: 'xaman_rlusd_demo_1',
        asset: 'RLUSD',
        issuer: RLUSD_ISSUER,
      });

      console.log('Xaman response:', resp);
      
      if (!resp.success) {
        console.error('Xaman payload creation failed:', resp.error);
        setState({ phase: 'error', message: resp.error || 'Failed to create Xaman payload' });
        return;
      }
      
      if (!resp.payloadId) {
        console.error('No payloadId in response:', resp);
        setState({ phase: 'error', message: 'No payload ID received from Xaman' });
        return;
      }

      const next = { phase: 'ready' as const, payloadId: resp.payloadId, qrCode: resp.qrCode, message: 'Scan in Xaman to sign 1 RLUSD' };
      setState(next);
      setShowQRModal(true);

      // Start polling for payment status
      if (resp.payloadId) {
        pollRef.current = window.setTimeout(() => pollPaymentStatus(resp.payloadId!), 2000);
      }
    } catch (error) {
      console.error('Xaman API error:', error);
      setState({ phase: 'error', message: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const pollPaymentStatus = async (payloadId: string) => {
    try {
      const status = await checkUserPaymentStatus(payloadId);
      if (status.status === 'completed') {
        setState({ phase: 'completed', txid: status.txid });
        setShowQRModal(false);
        return;
      }
      // Continue polling
      pollRef.current = window.setTimeout(() => pollPaymentStatus(payloadId), 2000);
    } catch (error) {
      console.error('Payment status check failed:', error);
      // Continue polling even if check fails
      pollRef.current = window.setTimeout(() => pollPaymentStatus(payloadId), 2000);
    }
  };

  const resetDemo = () => {
    if (pollRef.current) {
      window.clearTimeout(pollRef.current);
      pollRef.current = null;
    }
    setState({ phase: 'idle' });
    setShowQRModal(false);
  };

  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: '0 auto', 
      padding: '40px 20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ 
        fontSize: '32px', 
        fontWeight: '700', 
        color: '#1e293b', 
        marginBottom: '8px',
        textAlign: 'center'
      }}>
        Xaman RLUSD Demo
      </h1>
      <p style={{ 
        fontSize: '16px', 
        color: '#64748b', 
        marginBottom: '32px',
        textAlign: 'center'
      }}>
        Test sending 1 RLUSD to MEDA using Xaman wallet
      </p>

      <div style={{ 
        background: '#f8fafc', 
        borderRadius: '16px', 
        padding: '32px',
        border: '1px solid #e2e8f0',
        marginBottom: '24px'
      }}>
        {state.phase === 'idle' && (
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={startXaman}
              style={{
                background: '#7c3aed',
                color: '#ffffff',
                border: 'none',
                padding: '16px 32px',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#6d28d9';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#7c3aed';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Create 1 RLUSD Xaman Payload
            </button>
          </div>
        )}

        {state.phase === 'creating' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '18px', 
              color: '#475569', 
              marginBottom: '16px' 
            }}>
              Creating Xaman payload...
            </div>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              border: '4px solid #e2e8f0', 
              borderTop: '4px solid #7c3aed', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }}></div>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

        {state.phase === 'ready' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '18px', 
              color: '#059669', 
              marginBottom: '16px',
              fontWeight: '600'
            }}>
              ✅ Payload Created Successfully!
            </div>
            <div style={{ 
              fontSize: '14px', 
              color: '#64748b',
              marginBottom: '16px'
            }}>
              Payload ID: {state.payloadId}
            </div>
            <div style={{ 
              fontSize: '16px', 
              color: '#475569',
              marginBottom: '24px'
            }}>
              {state.message}
            </div>
            <button
              onClick={() => setShowQRModal(true)}
              style={{
                background: '#059669',
                color: '#ffffff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Show QR Code
            </button>
          </div>
        )}

        {state.phase === 'completed' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '24px', 
              color: '#059669', 
              marginBottom: '16px',
              fontWeight: '700'
            }}>
              🎉 Payment Completed!
            </div>
            <div style={{ 
              fontSize: '16px', 
              color: '#475569',
              marginBottom: '16px'
            }}>
              Transaction ID: {state.txid}
            </div>
            <a
              href={`https://testnet.xrpl.org/transactions/${state.txid}`}
              target="_blank"
              rel="noreferrer"
              style={{
                color: '#7c3aed',
                textDecoration: 'none',
                fontWeight: '600'
              }}
            >
              View on XRPL Explorer →
            </a>
          </div>
        )}

        {state.phase === 'error' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '18px', 
              color: '#dc2626', 
              marginBottom: '16px',
              fontWeight: '600'
            }}>
              ❌ Error
            </div>
            <div style={{ 
              fontSize: '16px', 
              color: '#475569',
              marginBottom: '24px'
            }}>
              {state.message}
            </div>
          </div>
        )}

        {(state.phase === 'ready' || state.phase === 'completed' || state.phase === 'error') && (
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <button
              onClick={resetDemo}
              style={{
                background: '#64748b',
                color: '#ffffff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Reset Demo
            </button>
          </div>
        )}
      </div>

      <QRModal
        open={showQRModal}
        title="Scan QR Code with Xaman"
        qrUrl={state.phase === 'ready' ? state.qrCode : undefined}
        openLink={state.phase === 'ready' ? `https://xumm.app/sign/${state.payloadId}` : undefined}
        network="XRPL Testnet"
        status={state.phase === 'ready' ? "Scan QR code or click 'Open in Xaman' to sign the transaction" : undefined}
        onClose={() => setShowQRModal(false)}
      />
    </div>
  );
};

export default XamanRlusdDemo;


