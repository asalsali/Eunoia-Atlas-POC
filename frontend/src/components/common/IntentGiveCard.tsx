import React, { useMemo, useState } from 'react';
import { submitDonorIntent } from '../../services/api';
import ReceiptModal from './ReceiptModal';

type AmountPreset = 25 | 50 | 100 | 250;

interface SubmitState {
  phase: 'idle' | 'submitting' | 'success' | 'error';
  error?: string;
  txHash?: string;
  txUrl?: string;
}

const AMOUNT_PRESETS: AmountPreset[] = [25, 50, 100, 250];

const IntentGiveCard: React.FC = () => {
  const [intent, setIntent] = useState<string>('');
  const [activePreset, setActivePreset] = useState<AmountPreset | 'custom'>(50);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isPublic, setIsPublic] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [openReceipt, setOpenReceipt] = useState<boolean>(false);
  const [submit, setSubmit] = useState<SubmitState>({ phase: 'idle' });

  const amountNumber = useMemo(() => {
    if (activePreset === 'custom') {
      const n = Number(customAmount);
      return Number.isFinite(n) ? n : 0;
    }
    return activePreset;
  }, [activePreset, customAmount]);

  const canSubmit = useMemo(() => {
    if (!intent.trim()) return false;
    if (!amountNumber || amountNumber <= 0) return false;
    if (isPublic && !email.trim()) return false;
    return submit.phase !== 'submitting';
  }, [intent, amountNumber, isPublic, email, submit.phase]);

  const handleGive = async () => {
    if (!canSubmit) return;
    setSubmit({ phase: 'submitting' });
    try {
      const resp = await submitDonorIntent({
        donorIntent: intent.trim(),
        amountFiat: amountNumber,
        currency: 'CAD',
        donorEmail: email.trim(),
        isPublic,
      });
      setSubmit({
        phase: 'success',
        txHash: resp?.transactionHash,
        txUrl: resp?.transactionUrl,
      });
      setOpenReceipt(true);
      // Persist last intent and amount for convenience
      try {
        localStorage.setItem('eunoia_last_intent', intent.trim());
        localStorage.setItem('eunoia_last_amount', String(amountNumber));
      } catch {}
    } catch (e: any) {
      setSubmit({ phase: 'error', error: e?.message || 'Failed to complete donation' });
    }
  };

  // Prefill from localStorage on first render
  React.useEffect(() => {
    try {
      const lastIntent = localStorage.getItem('eunoia_last_intent');
      const lastAmount = localStorage.getItem('eunoia_last_amount');
      if (lastIntent && !intent) setIntent(lastIntent);
      if (lastAmount && !customAmount && activePreset !== 'custom') {
        const n = Number(lastAmount);
        if (AMOUNT_PRESETS.includes(n as AmountPreset)) {
          setActivePreset(n as AmountPreset);
        } else if (Number.isFinite(n) && n > 0) {
          setActivePreset('custom');
          setCustomAmount(String(n));
        }
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section style={{ 
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', 
      borderRadius: 16, 
      border: '1px solid #e2e8f0',
      padding: 32,
      marginBottom: 24
    }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h2 style={{ 
          margin: '0 0 12px 0', 
          color: '#0f172a', 
          fontSize: '2.5rem', 
          fontWeight: 900,
          lineHeight: 1.2
        }}>
          Save on taxes today,<br />
          <span style={{ color: '#7c3aed' }}>give more tomorrow.</span>
        </h2>
        <p style={{ 
          margin: 0, 
          color: '#64748b', 
          fontSize: '1.125rem',
          lineHeight: 1.6,
          maxWidth: '600px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          Make seamless donations with verifiable receipts. Your words and support can change a day.
        </p>
      </div>

      {submit.phase === 'error' && (
        <div role="alert" style={{ 
          marginTop: 12, 
          marginBottom: 12, 
          background: '#fef2f2', 
          color: '#991b1b', 
          border: '1px solid #fecaca', 
          borderRadius: 12, 
          padding: '16px',
          textAlign: 'center'
        }}>
          {submit.error}
        </div>
      )}

      <div style={{ 
        display: 'grid', 
        gap: 24,
        maxWidth: '480px',
        margin: '0 auto'
      }}>
        <div>
          <label htmlFor="intent" style={{ 
            display: 'block', 
            fontWeight: 600, 
            fontSize: '0.875rem', 
            color: '#374151', 
            marginBottom: 8,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Your Intent
          </label>
          <textarea
            id="intent"
            rows={4}
            placeholder="For girls who never had a laptop."
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            style={{ 
              width: '100%', 
              borderRadius: 12, 
              border: '1px solid #d1d5db', 
              padding: 16, 
              fontSize: '1rem', 
              color: '#111827', 
              outlineColor: '#7c3aed',
              outlineWidth: '2px',
              transition: 'all 0.2s ease',
              backgroundColor: '#fff'
            }}
          />
        </div>

        <div>
          <span style={{ 
            display: 'block', 
            fontWeight: 600, 
            fontSize: '0.875rem', 
            color: '#374151', 
            marginBottom: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Donation Amount
          </span>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
            gap: 12 
          }}>
            {AMOUNT_PRESETS.map((preset) => {
              const active = activePreset === preset;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setActivePreset(preset)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 12,
                    border: `2px solid ${active ? '#7c3aed' : '#e5e7eb'}`,
                    background: active ? '#7c3aed' : '#fff',
                    color: active ? '#fff' : '#374151',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '1rem',
                    transition: 'all 0.2s ease',
                    boxShadow: active ? '0 4px 12px rgba(124, 58, 237, 0.3)' : 'none'
                  }}
                >
                  ${preset}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setActivePreset('custom')}
              style={{
                padding: '12px 16px',
                borderRadius: 12,
                border: `2px solid ${activePreset === 'custom' ? '#7c3aed' : '#e5e7eb'}`,
                background: activePreset === 'custom' ? '#7c3aed' : '#fff',
                color: activePreset === 'custom' ? '#fff' : '#374151',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'all 0.2s ease',
                boxShadow: activePreset === 'custom' ? '0 4px 12px rgba(124, 58, 237, 0.3)' : 'none'
              }}
            >
              Custom
            </button>
            {activePreset === 'custom' && (
              <div style={{ gridColumn: '1 / -1' }}>
                <input
                  inputMode="decimal"
                  type="number"
                  min={1}
                  step="0.01"
                  placeholder="25.00"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  style={{
                    width: '100%',
                    borderRadius: 12,
                    border: '2px solid #e5e7eb',
                    padding: '16px',
                    fontSize: '1rem',
                    outlineColor: '#7c3aed',
                    outlineWidth: '2px',
                    transition: 'all 0.2s ease',
                    backgroundColor: '#fff'
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 12,
            padding: '16px',
            borderRadius: 12,
            border: '1px solid #e5e7eb',
            backgroundColor: '#f9fafb'
          }}>
            <input 
              id="isPublic" 
              type="checkbox" 
              checked={isPublic} 
              onChange={(e) => setIsPublic(e.target.checked)}
              style={{
                width: '18px',
                height: '18px',
                accentColor: '#7c3aed'
              }}
            />
            <label htmlFor="isPublic" style={{ 
              color: '#374151',
              fontWeight: 500,
              fontSize: '0.875rem'
            }}>
              Allow this charity to know who I am
            </label>
          </div>
          <div>
            <label htmlFor="email" style={{ 
              display: 'block', 
              fontWeight: 600, 
              fontSize: '0.875rem', 
              color: '#374151', 
              marginBottom: 8,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Email for Receipt
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-describedby="email-help"
              style={{ 
                width: '100%', 
                borderRadius: 12, 
                border: '2px solid #e5e7eb', 
                padding: 16, 
                fontSize: '1rem', 
                color: '#111827', 
                outlineColor: '#7c3aed',
                outlineWidth: '2px',
                transition: 'all 0.2s ease',
                backgroundColor: '#fff'
              }}
            />
            <small id="email-help" style={{ 
              color: '#6b7280',
              fontSize: '0.75rem',
              marginTop: '4px',
              display: 'block'
            }}>
              Required only if you want your receipt emailed and to share your identity.
            </small>
          </div>
        </div>

        <div style={{ marginTop: 8 }}>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleGive}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              background: canSubmit ? 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' : '#c4b5fd',
              color: '#fff',
              padding: '16px 24px',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: '1.125rem',
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              border: 'none',
              transition: 'all 0.2s ease',
              boxShadow: canSubmit ? '0 4px 12px rgba(124, 58, 237, 0.3)' : 'none',
              transform: canSubmit ? 'translateY(0)' : 'none'
            }}
            aria-busy={submit.phase === 'submitting'}
          >
            {submit.phase === 'submitting' ? 'Processing…' : 'Give Now'}
          </button>
        </div>
      </div>

      <ReceiptModal
        open={openReceipt}
        onClose={() => setOpenReceipt(false)}
        amount={amountNumber}
        currency="CAD"
        intent={intent}
        transactionHash={submit.txHash}
        transactionUrl={submit.txUrl}
      />
    </section>
  );
};

export default IntentGiveCard;


