import React, { useEffect, useRef, useState } from 'react';
import { createUserDonationPayload, checkUserPaymentStatus, userWalletStatus } from '../services/userWalletService';
import { submitDonorIntent, xamanCreatePayment } from '../services/api';
import { isCrossmarkAvailable, signRlusdPaymentWithCrossmark, connectCrossmark } from '../services/crossmarkService';

type PaymentState =
  | { phase: 'idle' }
  | { phase: 'creating' }
  | { phase: 'ready'; payloadId: string; qrCode: string; message?: string }
  | { phase: 'completed'; txid?: string }
  | { phase: 'error'; message: string };

const MEDA_ADDRESS = process.env.REACT_APP_MEDA_WALLET_ADDRESS || 'rEtpfxtsuHGWbRYFGszE5etYNPaiogDpxC';

const RlusdDemo: React.FC = () => {
  const [state, setState] = useState<PaymentState>({ phase: 'idle' });
  const pollTimer = useRef<number | null>(null);
  const [crossmarkInfo, setCrossmarkInfo] = useState<string>('');

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollTimer.current) window.clearInterval(pollTimer.current);
    };
  }, []);

  const startPayment = async () => {
    setState({ phase: 'creating' });
    try {
      // Prefer server-side creation to avoid client SDK issues
      const srv = await xamanCreatePayment({
        destination: MEDA_ADDRESS,
        amount: 1,
        charity: 'MEDA',
        cause_id: 'demo_meda_rlusd_1'
      });

      if (!srv.success || !srv.payloadId) {
        setState({ phase: 'error', message: srv.error || 'Failed to create payment payload' });
        return;
      }

      const next = { phase: 'ready' as const, payloadId: srv.payloadId, qrCode: srv.qrCode || '', message: 'Scan to sign in Xaman' };
      setState(next);

      if (pollTimer.current) window.clearInterval(pollTimer.current);
      pollTimer.current = window.setInterval(async () => {
        try {
          const status = await checkUserPaymentStatus(next.payloadId);
          if (status?.signed) {
            if (pollTimer.current) window.clearInterval(pollTimer.current);
            setState({ phase: 'completed', txid: status?.transactionHash });
          }
        } catch {}
      }, 3000) as unknown as number;
    } catch (e: any) {
      setState({ phase: 'error', message: e?.message || 'Unexpected error' });
    }
  };

  const startCrossmark = async () => {
    setState({ phase: 'creating' });
    try {
      if (!isCrossmarkAvailable()) {
        setState({ phase: 'error', message: 'CROSSMARK extension not found' });
        return;
      }
      const conn = await connectCrossmark();
      if (!conn.ok) {
        setState({ phase: 'error', message: conn.error || 'Failed to connect CROSSMARK' });
        return;
      }
      setCrossmarkInfo(`Connected: ${conn.address}${conn.network ? ' (' + conn.network + ')' : ''}`);
      const res = await signRlusdPaymentWithCrossmark({
        destination: MEDA_ADDRESS,
        amount: 1,
        charity: 'MEDA',
        causeId: 'demo_meda_rlusd_1'
      });
      if (res.ok && res.txid) {
        setState({ phase: 'completed', txid: res.txid });
      } else {
        setState({ phase: 'error', message: res.error || 'Signing failed' });
      }
    } catch (e: any) {
      setState({ phase: 'error', message: e?.message || 'CROSSMARK flow failed' });
    }
  };

  const startXrpXaman = async () => {
    setState({ phase: 'creating' });
    try {
      const srv = await xamanCreatePayment({
        destination: MEDA_ADDRESS,
        amount: 1,
        charity: 'MEDA',
        cause_id: 'demo_xrp_to_meda',
        asset: 'XRP'
      });
      if (!srv.success || !srv.payloadId) {
        setState({ phase: 'error', message: srv.error || 'Failed to create XRP payment payload' });
        return;
      }
      const next = { phase: 'ready' as const, payloadId: srv.payloadId, qrCode: srv.qrCode || '', message: 'Scan to sign 1 XRP in Xaman' };
      setState(next);

      if (pollTimer.current) window.clearInterval(pollTimer.current);
      pollTimer.current = window.setInterval(async () => {
        try {
          const status = await checkUserPaymentStatus(next.payloadId);
          if (status?.signed) {
            if (pollTimer.current) window.clearInterval(pollTimer.current);
            setState({ phase: 'completed', txid: status?.transactionHash });
          }
        } catch {}
      }, 3000) as unknown as number;
    } catch (e: any) {
      setState({ phase: 'error', message: e?.message || 'Unexpected error' });
    }
  };

  const sendWithPlatformWallet = async () => {
    try {
      setState({ phase: 'creating' });
      const resp = await submitDonorIntent({
        donorIntent: 'Demo: 1 RLUSD to MEDA (platform wallet)',
        amountFiat: 1,
        currency: 'CAD',
        donorEmail: '',
        isPublic: false,
      });
      if (resp?.transactionHash || resp?.transactionUrl) {
        setState({ phase: 'completed', txid: resp.transactionHash });
      } else {
        setState({ phase: 'error', message: resp?.message || 'No transaction returned' });
      }
    } catch (e: any) {
      setState({ phase: 'error', message: e?.message || 'Failed to send payment' });
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: '40px auto', padding: 24 }}>
      <h1>RLUSD Demo: Send 1 RLUSD to MEDA</h1>
      <p style={{ opacity: 0.8 }}>
        You can either have the platform wallet send 1 RLUSD on your behalf (server-signed), or create a XUMM payload to sign from your own wallet.
      </p>

      <div style={{ margin: '12px 0', padding: 12, borderRadius: 8, background: userWalletStatus.isAvailable ? '#e8fff1' : '#fff6e6' }}>
        <strong>Wallet status:</strong> {userWalletStatus.message}
      </div>

      {state.phase === 'idle' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flexWrap: 'wrap' }}>
          <button onClick={sendWithPlatformWallet} style={{ padding: '10px 16px', fontWeight: 600 }}>Send with Platform Wallet (Server-signed)</button>
          <button onClick={startPayment} style={{ padding: '10px 16px', fontWeight: 600 }}>Create Xaman Payment (RLUSD, Server QR)</button>
          <button onClick={startXrpXaman} style={{ padding: '10px 16px', fontWeight: 600 }}>Create Xaman Payment (1 XRP → MEDA)</button>
          <button onClick={startCrossmark} style={{ padding: '10px 16px', fontWeight: 600 }} disabled={!isCrossmarkAvailable()}>
            {isCrossmarkAvailable() ? 'Sign with CROSSMARK (Browser)' : 'CROSSMARK not detected'}
          </button>
        </div>
      )}
      {state.phase === 'creating' && <div>Creating payment request…</div>}
      {crossmarkInfo && (
        <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>{crossmarkInfo}</div>
      )}
      {state.phase === 'error' && (
        <div style={{ color: '#b91c1c', marginTop: 12 }}>Error: {state.message}</div>
      )}
      {state.phase === 'ready' && (
        <div style={{ marginTop: 16 }}>
          <p>Scan this QR in Xaman to complete the payment:</p>
          {state.qrCode ? (
            <img src={state.qrCode} alt="Xaman QR" style={{ width: 240, height: 240, borderRadius: 8 }} />
          ) : (
            <a href={`https://xumm.app/sign/${state.payloadId}`} target="_blank" rel="noreferrer">Open in Xaman</a>
          )}
          <div style={{ marginTop: 12, opacity: 0.8 }}>{state.message}</div>
        </div>
      )}
      {state.phase === 'completed' && (
        <div style={{ marginTop: 16 }}>
          <h3>Payment Completed</h3>
          {state.txid ? (
            <a href={`https://testnet.xrpl.org/transactions/${state.txid}`} target="_blank" rel="noreferrer">
              View transaction on XRPL Testnet
            </a>
          ) : (
            <p>Signed. Waiting for transaction hash…</p>
          )}
        </div>
      )}
    </div>
  );
};

export default RlusdDemo;


