import React, { useEffect, useMemo, useRef, useState } from 'react';
import { submitDonorIntent, getTotals } from '../services/api';
import './WhisperFlow.css';

// Helpers
const DRAFT_KEY = 'whisperDraftV1';
const PENDING_KEY = 'whisperPendingDonationV1';
const QUOTES = [
  '“Sometimes a few words can carry a lifetime.”',
  '“A small gift can change a whole day.”',
  '“Light grows where we speak hope.”',
];

const STORY_THEME: Record<string, { accent: string; soft1: string; soft2: string }> = {
  meda: { accent: '#7c3aed', soft1: '#ede9fe', soft2: '#faf5ff' },
  tara: { accent: '#ec4899', soft1: '#ffe4f1', soft2: '#fff7fb' },
  ocean: { accent: '#2563eb', soft1: '#dbeafe', soft2: '#eff6ff' },
};

function saveDraft(data: any) { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(data)); } catch {} }
function loadDraft(): any | null { try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null'); } catch { return null; } }
function savePendingDonation(data: any) { try { localStorage.setItem(PENDING_KEY, JSON.stringify(data)); } catch {} }
function getPendingDonation(): any | null { try { return JSON.parse(localStorage.getItem(PENDING_KEY) || 'null'); } catch { return null; } }
function clearPendingDonation() { try { localStorage.removeItem(PENDING_KEY); } catch {} }

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(m.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    if (m.addEventListener) m.addEventListener('change', handler);
    else m.addListener(handler as any);
    return () => {
      if (m.removeEventListener) m.removeEventListener('change', handler);
      else m.removeListener(handler as any);
    };
  }, []);
  return reduced;
}

function vibrate(ms = 10) { try { if (navigator.vibrate) navigator.vibrate(ms); } catch {} }

const WhisperFlow: React.FC = () => {
  const [step, setStep] = useState<number>(0);

  // data
  const [message, setMessage] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [otherAmount, setOtherAmount] = useState<string>('');
  const [isPublic, setIsPublic] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');

  // ui
  const [typing, setTyping] = useState(false);
  const typingTimer = useRef<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [liveMessage, setLiveMessage] = useState<string>('');
  const [showUndo, setShowUndo] = useState<boolean>(false);
  const undoTimerRef = useRef<number | null>(null);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [transactionUrl, setTransactionUrl] = useState<string | null>(null);

  const reducedMotion = useReducedMotion();

  // Voice
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Deep link
  const searchParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const storyId = (searchParams.get('story') || '').toLowerCase();
  const prefillAmount = searchParams.get('amount');
  const prefillMessage = searchParams.get('message');

  // Theme
  const theme = STORY_THEME[storyId] || STORY_THEME['meda'];

  useEffect(() => {
    const el = document.querySelector('.whisper') as HTMLElement | null;
    if (el) {
      el.style.setProperty('--accent', theme.accent);
      el.style.setProperty('--soft1', theme.soft1);
      el.style.setProperty('--soft2', theme.soft2);
      el.style.setProperty('--accent-contrast', '#ffffff');
    }
  }, [theme]);

  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setMessage(draft.message || '');
      const amt = draft.amount ?? '';
      setAmount(amt);
      setOtherAmount(amt && typeof amt === 'number' ? String(amt) : '');
      setIsPublic(!!draft.isPublic);
      setEmail(draft.email || '');
    }
    if (prefillAmount && !Number.isNaN(Number(prefillAmount))) setAmount(Number(prefillAmount));
    if (prefillMessage) setMessage(prefillMessage);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { saveDraft({ message, amount, isPublic, email }); }, [message, amount, isPublic, email]);

  useEffect(() => {
    const map: Record<number, string> = {
      0: storyId ? 'Story loaded' : 'Welcome',
      1: 'I am giving because…',
      2: 'How much do you want to give?',
      3: 'Would you like the story to know who you are?',
      4: 'Ready to send your message and gift',
      5: 'Thank you. Your message has been sent',
    };
    setLiveMessage(map[step] || '');
  }, [step, storyId]);

  // Rotating quotes (hero)
  useEffect(() => {
    if (step !== 0 || reducedMotion) return;
    const id = window.setInterval(() => setQuoteIdx((i) => (i + 1) % QUOTES.length), 9000);
    return () => window.clearInterval(id);
  }, [step, reducedMotion]);

  // Pointer light pool
  useEffect(() => {
    if (reducedMotion) return;
    const onMove = (e: PointerEvent) => {
      const x = e.clientX / window.innerWidth * 100;
      const y = e.clientY / window.innerHeight * 100;
      document.documentElement.style.setProperty('--x', `${x}%`);
      document.documentElement.style.setProperty('--y', `${y}%`);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove as any);
  }, [reducedMotion]);

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);
    setTyping(true);
    if (typingTimer.current) window.clearTimeout(typingTimer.current);
    typingTimer.current = window.setTimeout(() => {
      setTyping(false);
      if (value.trim().length > 5) { setStep(2); vibrate(); }
    }, 1200);
  };

  const selectAmount = (val: number | 'other') => {
    setError(null);
    if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current);
    if (val === 'other') {
      setAmount(''); setOtherAmount(''); setShowUndo(false);
    } else {
      setAmount(val); setOtherAmount(''); setShowUndo(true);
      undoTimerRef.current = window.setTimeout(() => setShowUndo(false), 3000);
      try { localStorage.setItem('whisperLastAmount', String(val)); } catch {}
      setStep(3); vibrate();
    }
  };

  const undoAmount = () => { setAmount(''); setShowUndo(false); };
  const handleOtherAmount = (e: React.ChangeEvent<HTMLInputElement>) => setOtherAmount(e.target.value);
  useEffect(() => { const num = Number(otherAmount); if (otherAmount && !Number.isNaN(num) && num > 0) setAmount(num); }, [otherAmount]);

  const handleIdentityChoice = (choice: boolean) => { setIsPublic(choice); if (!choice) { setEmail(''); setStep(4); } vibrate(); };
  const proceedFromIdentity = () => { setStep(4); vibrate(); };

  useEffect(() => { if (step === 2) { getTotals().catch(() => {}); } }, [step]);

  useEffect(() => {
    const onOnline = async () => {
      const pending = getPendingDonation();
      if (pending) {
        try { await submitDonorIntent(pending); clearPendingDonation(); } catch { /* keep pending */ }
      }
    };
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, []);

  const handleSubmit = async () => {
    setError(null);
    if (!message.trim() || !amount || Number(amount) <= 0) { setError('Please share a message and choose an amount.'); return; }
    if (isPublic && !email.trim()) { setError('Please add your email so we can send your receipt.'); return; }

    const payload = { donorIntent: message.trim(), amountFiat: Number(amount), currency: 'CAD' as const, donorEmail: isPublic ? email.trim() : '', isPublic };
    setStep(5); vibrate(20); // Optimistic
    if (!reducedMotion) {
      setShowConfetti(true);
      window.setTimeout(() => setShowConfetti(false), 1400);
    }
    setSubmitting(true);
    try { 
      const response = await submitDonorIntent(payload); 
      if (response.transactionUrl) {
        setTransactionUrl(response.transactionUrl);
      }
      clearPendingDonation(); 
    } catch { 
      savePendingDonation(payload); 
    } finally { 
      setSubmitting(false); 
    }
  };

  const toggleMic = () => {
    if (listening) { try { recognitionRef.current?.stop(); } catch {}; setListening(false); return; }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const rec = new SpeechRecognition(); recognitionRef.current = rec;
    rec.lang = 'en-US'; rec.continuous = true; rec.interimResults = true;
    rec.onresult = (event: any) => { let transcript = ''; for (let i = event.resultIndex; i < event.results.length; i++) { transcript += event.results[i][0].transcript; } setMessage((m) => (m ? m + ' ' : '') + transcript.trim()); };
    rec.onend = () => setListening(false);
    try { rec.start(); setListening(true); } catch {}
  };

  const lastAmount = useMemo(() => { try { const v = localStorage.getItem('whisperLastAmount'); return v ? Number(v) : null; } catch { return null; } }, [step]);

  // Confetti pieces
  const pieces = Array.from({ length: 7 }).map((_, i) => ({
    left: `${15 + i * 12}%`,
    bottom: '20px',
    background: i % 2 ? theme.accent : theme.soft1,
  }));

  return (
    <div className={`whisper ${reducedMotion ? 'reduced-motion' : ''}`}>
      <div className="visually-hidden" aria-live="polite">{liveMessage}</div>

      {step === 0 && (
        <div className={`stage full ${reducedMotion ? '' : 'fade-in'}`}>
          <div className="story-hero" role="img" aria-label={storyId ? `Story ${storyId}` : 'Story image'}>
            <div className="overlay" />
            <div className="hero-content">
              <blockquote key={quoteIdx} className={`hero-quote ${reducedMotion ? '' : 'quote-fade'}`}>{QUOTES[quoteIdx]}</blockquote>
              <button className="soft-btn" onClick={() => { setStep(1); vibrate(); }}>Whisper a Message</button>
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className={`stage center ${reducedMotion ? '' : 'fade-in'}`} aria-live="polite">
          <div className="prompt glow type-on">I’m giving because…</div>
          <textarea className="whisper-input" placeholder="For girls who never had a laptop." value={message} onChange={handleMessageChange} autoFocus />
          <div className="hint">{listening ? 'Listening… speak your message' : 'Pause to continue'}</div>
          <div className="actions">
            <button className="soft-btn secondary" onClick={() => { setStep(0); vibrate(); }}>Back</button>
            <button className="soft-btn" onClick={() => (message.trim().length > 0 ? (setStep(2), vibrate()) : null)} aria-disabled={message.trim().length === 0}>Next</button>
          </div>
          <div className="mic-row">
            <button className="mic-btn" onClick={toggleMic} aria-pressed={listening}>{listening ? 'Stop voice input' : 'Speak instead'}</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className={`stage center ${reducedMotion ? '' : 'fade-in'}`} aria-live="polite">
          <div className="prompt">How much do you want to give?</div>
          <div className="amount-grid">
            {[10, 25, 50].map((v) => (
              <button key={v} className={`pill ${lastAmount === v ? 'suggested' : ''}`} onClick={() => selectAmount(v)}>${v}</button>
            ))}
            <button className={`pill ${lastAmount && ![10,25,50].includes(lastAmount) ? 'suggested' : ''}`} onClick={() => selectAmount('other')}>Other</button>
          </div>

          {showUndo && (<div className="hint">Amount selected. <button className="link-btn" onClick={undoAmount}>Undo</button></div>)}

          {amount === '' && (
            <div className={`other-row ${reducedMotion ? '' : 'slide-up'}`}>
              <input type="number" inputMode="decimal" min={1} step="0.01" placeholder="Enter amount" className="other-input" value={otherAmount} onChange={handleOtherAmount} />
              <button className="soft-btn" onClick={() => (Number(amount) > 0 ? (setStep(3), vibrate()) : null)} aria-disabled={!amount || Number(amount) <= 0}>Apply</button>
            </div>
          )}

          <div className="actions">
            <button className="soft-btn secondary" onClick={() => { setStep(1); vibrate(); }}>Back</button>
            {amount !== '' && (<button className="soft-btn" onClick={() => { setStep(3); vibrate(); }}>Next</button>)}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className={`stage center ${reducedMotion ? '' : 'fade-in'}`} aria-live="polite">
          <div className="prompt">Would you like the story to know who you are?</div>
          <div className="toggle-row">
            <button className={`toggle ${isPublic ? 'active' : ''}`} onClick={() => handleIdentityChoice(true)}>Yes</button>
            <button className={`toggle ${!isPublic ? 'active' : ''}`} onClick={() => handleIdentityChoice(false)}>No</button>
          </div>

          {isPublic && (
            <div className={`identity-email ${reducedMotion ? '' : 'slide-up'}`}>
              <input type="email" placeholder="you@example.com" className="email-input" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email address" />
              <button className="soft-btn" onClick={proceedFromIdentity}>Continue</button>
            </div>
          )}

          <div className="privacy-note">We’ll only use your email to send your receipt.</div>

          <div className="actions">
            <button className="soft-btn secondary" onClick={() => { setStep(2); vibrate(); }}>Back</button>
            {!isPublic && (<button className="soft-btn" onClick={proceedFromIdentity}>Next</button>)}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className={`stage center ${reducedMotion ? '' : 'fade-in'}`} aria-live="polite">
          {error && <div className="intent-error" role="alert">{error}</div>}
          <button className={`cta ${submitting ? 'disabled' : ''}`} onClick={handleSubmit} disabled={submitting}>{submitting ? 'Sending…' : 'Send my words and support'}</button>
          <div className="actions">
            <button className="soft-btn secondary" onClick={() => { setStep(3); vibrate(); }}>Back</button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className={`stage center ${reducedMotion ? '' : 'fade-in'}`} aria-live="polite">
          <h1 className="thanks-title">Your message has been sent.</h1>
          <p className="thanks-sub">And so has your support.</p>
          <blockquote className="intent-quote">“{message}”</blockquote>
          {transactionUrl && (
            <a href={transactionUrl} target="_blank" rel="noopener noreferrer" className="intent-link">View your receipt details</a>
          )}
          {!transactionUrl && (
            <p className="intent-note">Your transaction is being processed...</p>
          )}
        </div>
      )}

      {!reducedMotion && showConfetti && (
        <div className="confetti" aria-hidden>
          {pieces.map((p, i) => (
            <div key={i} className="piece" style={{ left: p.left, bottom: p.bottom, background: p.background }} />
          ))}
        </div>
      )}
    </div>
  );
};

export default WhisperFlow;
