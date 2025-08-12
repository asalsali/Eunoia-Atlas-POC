import React, { useState, useEffect, useRef } from 'react';
import { Heart, Mic, ArrowLeft, ArrowRight, Eye, EyeOff, Send, CreditCard } from 'lucide-react';
import { xamanCreatePayment } from '../services/api';
import { checkUserPaymentStatus } from '../services/userWalletService';
import { isCrossmarkAvailable, connectCrossmark, signRlusdPaymentWithCrossmark } from '../services/crossmarkService';
import QRModal from './common/QRModal';
import DonationConfirmation from './DonationConfirmation';
import './WhisperFlow.css';

const QUOTES = [
  '"Sometimes a few words can carry a lifetime."',
  '"A small gift can change a whole day."',
  '"Light grows where we speak hope."',
  '"Your words have power beyond measure."',
  '"Every whisper of kindness echoes forever."',
];

const WhisperFlow: React.FC = () => {
  const [step, setStep] = useState(0);
  const [message, setMessage] = useState('');
  const [amount, setAmount] = useState<number | 'other' | ''>('');
  const [otherAmount, setOtherAmount] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [email, setEmail] = useState('');
  const [listening, setListening] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [transactionUrl, setTransactionUrl] = useState<string | null>(null);
  
  const [xamanState, setXamanState] = useState<
    | { phase: 'idle' }
    | { phase: 'creating' }
    | { phase: 'ready'; payloadId: string; qrCode?: string }
    | { phase: 'completed'; txid?: string }
    | { phase: 'error'; message: string }
  >({ phase: 'idle' });

  const [fiatState, setFiatState] = useState<
    | { phase: 'idle' }
    | { phase: 'processing' }
    | { phase: 'completed'; txid?: string }
    | { phase: 'error'; message: string }
  >({ phase: 'idle' });

  const [crossmarkBusy, setCrossmarkBusy] = useState(false);
  const [crossmarkError, setCrossmarkError] = useState<string | null>(null);
  const xamanPollRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);

  const MEDA_ADDRESS = 'r4jSjD22z6HtEu41eh1JrkD3KAW1PyM1RH';
  const RLUSD_ISSUER = 'rQhWct2fv4Vc4KRjRgMrxa8xPN9Zx9iLKV';

  // Quote rotation
  useEffect(() => {
    if (step === 0) {
      const interval = setInterval(() => {
        setQuoteIdx((prev) => (prev + 1) % QUOTES.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [step]);

  // Voice recognition setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new (window as any).webkitSpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => setListening(true);
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setMessage(transcript);
      };
      recognitionRef.current.onerror = () => setListening(false);
      recognitionRef.current.onend = () => setListening(false);
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;
    
    setSubmitting(true);
    setError(null);
    
    const finalAmount = amount === 'other' ? Number(otherAmount) : Number(amount);
    
    if (!finalAmount || finalAmount <= 0) {
      setError('Please enter a valid amount');
      setSubmitting(false);
      return;
    }

    // Go to payment method selection instead of directly processing
    setStep(4);
    setSubmitting(false);
  };

  const testQRModal = () => {
    console.log('Testing QR modal...');
    const mockPayloadId = 'test-payload-' + Date.now().toString().slice(-8);
    const qrData = `https://xumm.app/sign/${mockPayloadId}`;
    const mockQrCode = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}&format=png&margin=10&ecc=M`;
    
    console.log('Test QR code URL:', mockQrCode);
    
    setXamanState({ 
      phase: 'ready', 
      payloadId: mockPayloadId,
      qrCode: mockQrCode
    });
    
    console.log('Test QR modal state set to ready');
  };

  const testButtonClick = () => {
    console.log('Test button clicked!');
    alert('Button is working!');
  };

  const forceShowQRModal = () => {
    console.log('Force showing QR modal...');
    const mockPayloadId = 'force-test-' + Date.now().toString().slice(-8);
    const qrData = `https://xumm.app/sign/${mockPayloadId}`;
    const mockQrCode = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}&format=png&margin=10&ecc=M`;
    
    console.log('Force QR code URL:', mockQrCode);
    
    setXamanState({ 
      phase: 'ready', 
      payloadId: mockPayloadId,
      qrCode: mockQrCode
    });
    
    console.log('Force QR modal state set to ready');
  };

  const startRlusdXamanFromWhisper = async () => {
    console.log('XAMAN button clicked!');
    if (xamanState.phase !== 'idle') return;
    
    setXamanState({ phase: 'creating' });
    
    try {
      // For demo purposes, create a mock QR code and payload
      const mockPayloadId = 'demo-payload-' + Date.now().toString().slice(-8);
      
      // Use a more reliable QR code generator with better error handling
      const qrData = `https://xumm.app/sign/${mockPayloadId}`;
      const mockQrCode = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}&format=png&margin=10&ecc=M`;
      
      console.log('Creating XAMAN payment with QR code:', mockQrCode);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setXamanState({ 
        phase: 'ready', 
        payloadId: mockPayloadId,
        qrCode: mockQrCode
      });
      
      console.log('XAMAN payment ready, showing QR code');
      
      // Auto-show confirmation after 10 seconds for demo purposes
      setTimeout(() => {
        if (xamanPollRef.current) clearInterval(xamanPollRef.current);
        setXamanState({ 
          phase: 'completed', 
          txid: 'demo-tx-' + Date.now().toString().slice(-8)
        });
        setTransactionUrl('https://testnet.xrpl.org/transactions/demo-tx-' + Date.now().toString().slice(-8));
        setStep(5);
      }, 10000); // 10 seconds for demo
      
      // Poll for completion (simulated for demo)
      xamanPollRef.current = window.setInterval(async () => {
        try {
          // Simulate random completion
          if (Math.random() > 0.7) {
            if (xamanPollRef.current) clearInterval(xamanPollRef.current);
            setXamanState({ 
              phase: 'completed', 
              txid: 'demo-tx-' + Date.now().toString().slice(-8)
            });
            setTransactionUrl('https://testnet.xrpl.org/transactions/demo-tx-' + Date.now().toString().slice(-8));
            setStep(5);
          }
        } catch (error) {
          console.error('Payment status check failed:', error);
        }
      }, 2000);
      
    } catch (error) {
      console.error('Xaman payment creation failed:', error);
      setXamanState({ phase: 'error', message: 'Failed to create payment. Please try again.' });
    }
  };

  const startRlusdCrossmarkFromWhisper = async () => {
    if (crossmarkBusy) return;
    
    setCrossmarkBusy(true);
    setCrossmarkError(null);
    
    try {
      if (!isCrossmarkAvailable()) {
        throw new Error('CROSSMARK extension not found');
      }
      
      await connectCrossmark();
      const finalAmount = amount === 'other' ? Number(otherAmount) : Number(amount);
      
      const result = await signRlusdPaymentWithCrossmark({
        amount: finalAmount,
        destination: MEDA_ADDRESS,
        charity: 'MEDA',
        causeId: 'whisper',
        issuer: RLUSD_ISSUER
      });
      
      if (result.ok) {
        setTransactionUrl(result.explorer || null);
        setStep(5);
      } else {
        setCrossmarkError(result.error || 'Payment failed');
      }
    } catch (error) {
      console.error('CROSSMARK payment failed:', error);
      setCrossmarkError(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setCrossmarkBusy(false);
    }
  };

  const startFiatTransaction = async () => {
    try {
      setFiatState({ phase: 'processing' });
      
      // Simulate fiat transaction processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const txid = 'fiat-tx-' + Date.now().toString().slice(-8);
      setFiatState({ phase: 'completed', txid });
      setTransactionUrl(`https://testnet.xrpl.org/transactions/${txid}`);
      setStep(5);
    } catch (error) {
      console.error('Fiat transaction error:', error);
      setFiatState({ phase: 'error', message: 'Fiat transaction failed. Please try again.' });
    }
  };

  // Step 0: Landing page with quotes
  if (step === 0) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Enhanced Background Pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 80%, rgba(124, 58, 237, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(124, 58, 237, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(139, 92, 246, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 90% 90%, rgba(168, 85, 247, 0.06) 0%, transparent 50%)
          `,
          pointerEvents: 'none'
        }} />
        
        {/* Large decorative circles */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: '200px',
          height: '200px',
          background: 'linear-gradient(45deg, rgba(124, 58, 237, 0.1), rgba(139, 92, 246, 0.1))',
          borderRadius: '50%',
          filter: 'blur(40px)',
          animation: 'pulse 4s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '10%',
          right: '5%',
          width: '300px',
          height: '300px',
          background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(196, 181, 253, 0.1))',
          borderRadius: '50%',
          filter: 'blur(50px)',
          animation: 'pulse 4s ease-in-out infinite 2s'
        }} />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '400px',
          height: '400px',
          background: 'linear-gradient(90deg, rgba(124, 58, 237, 0.03), rgba(139, 92, 246, 0.03))',
          borderRadius: '50%',
          filter: 'blur(60px)',
          animation: 'pulse 6s ease-in-out infinite 1s'
        }} />
        
        {/* Floating decorative elements */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          fontSize: '32px',
          color: 'rgba(124, 58, 237, 0.4)',
          animation: 'float 6s ease-in-out infinite',
          filter: 'drop-shadow(0 4px 8px rgba(124, 58, 237, 0.2))'
        }}>
          ✨
        </div>
        <div style={{
          position: 'absolute',
          top: '15%',
          right: '15%',
          fontSize: '28px',
          color: 'rgba(139, 92, 246, 0.4)',
          animation: 'float 6s ease-in-out infinite 1s',
          filter: 'drop-shadow(0 4px 8px rgba(139, 92, 246, 0.2))'
        }}>
          ⭐
        </div>
        <div style={{
          position: 'absolute',
          bottom: '30%',
          left: '20%',
          fontSize: '30px',
          color: 'rgba(168, 85, 247, 0.4)',
          animation: 'float 6s ease-in-out infinite 2s',
          filter: 'drop-shadow(0 4px 8px rgba(168, 85, 247, 0.2))'
        }}>
          ⚡
        </div>
        <div style={{
          position: 'absolute',
          top: '60%',
          right: '10%',
          fontSize: '24px',
          color: 'rgba(124, 58, 237, 0.4)',
          animation: 'float 6s ease-in-out infinite 3s',
          filter: 'drop-shadow(0 4px 8px rgba(124, 58, 237, 0.2))'
        }}>
          🌍
        </div>
        <div style={{
          position: 'absolute',
          bottom: '20%',
          right: '25%',
          fontSize: '22px',
          color: 'rgba(139, 92, 246, 0.4)',
          animation: 'float 6s ease-in-out infinite 4s',
          filter: 'drop-shadow(0 4px 8px rgba(139, 92, 246, 0.2))'
        }}>
          🛡️
        </div>
        <div style={{
          position: 'absolute',
          top: '40%',
          left: '5%',
          fontSize: '26px',
          color: 'rgba(168, 85, 247, 0.4)',
          animation: 'float 6s ease-in-out infinite 5s',
          filter: 'drop-shadow(0 4px 8px rgba(168, 85, 247, 0.2))'
        }}>
          💫
        </div>
        <div style={{
          position: 'absolute',
          bottom: '40%',
          right: '5%',
          fontSize: '20px',
          color: 'rgba(124, 58, 237, 0.4)',
          animation: 'float 6s ease-in-out infinite 6s',
          filter: 'drop-shadow(0 4px 8px rgba(124, 58, 237, 0.2))'
        }}>
          🔮
        </div>
        
        {/* People in need images */}
        <div style={{
          position: 'absolute',
          top: '30%',
          left: '5%',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '20px',
          textAlign: 'center',
          boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
          border: '2px solid rgba(124, 58, 237, 0.3)',
          backdropFilter: 'blur(10px)',
          animation: 'gentleFloat 8s ease-in-out infinite 0.5s',
          fontSize: '32px'
        }}>
          👥<br/>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#7c3aed', textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>People in need</span>
        </div>
        <div style={{
          position: 'absolute',
          top: '25%',
          right: '5%',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '20px',
          textAlign: 'center',
          boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
          border: '2px solid rgba(124, 58, 237, 0.3)',
          backdropFilter: 'blur(10px)',
          animation: 'gentleFloat 8s ease-in-out infinite 1.5s',
          fontSize: '32px'
        }}>
          ❤️<br/>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#7c3aed', textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>Your impact</span>
        </div>
        <div style={{
          position: 'absolute',
          bottom: '20%',
          left: '15%',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '20px',
          textAlign: 'center',
          boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
          border: '2px solid rgba(124, 58, 237, 0.3)',
          backdropFilter: 'blur(10px)',
          animation: 'gentleFloat 8s ease-in-out infinite 2.5s',
          fontSize: '32px'
        }}>
          🎁<br/>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#7c3aed', textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>Real change</span>
        </div>
        
        <div style={{
          maxWidth: '800px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '40px',
            borderRadius: '24px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
            marginBottom: '32px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#1e293b',
              marginBottom: '16px',
              lineHeight: '1.3'
            }}>
              {QUOTES[quoteIdx]}
            </h1>
            <p style={{
              fontSize: '1.2rem',
              color: '#64748b',
              margin: 0
            }}>
              Share your story and make a difference
            </p>
          </div>
          
          <button 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '16px',
              padding: '16px 32px',
              fontWeight: '600',
              fontSize: '1.125rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 24px rgba(124, 58, 237, 0.3)',
              margin: '0 auto'
            }}
            onClick={() => setStep(1)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(124, 58, 237, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(124, 58, 237, 0.3)';
            }}
          >
            <Send size={20} />
            Whisper a Message
          </button>
        </div>
        
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            33% { transform: translateY(-10px) rotate(5deg); }
            66% { transform: translateY(5px) rotate(-3deg); }
          }
          @keyframes gentleFloat {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            25% { transform: translateY(-8px) rotate(2deg); }
            50% { transform: translateY(-4px) rotate(-1deg); }
            75% { transform: translateY(-12px) rotate(1deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.1); }
          }
        `}</style>
      </div>
    );
  }

  // Step 1: Message input
  if (step === 1) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px'
      }}>
        <div style={{
          maxWidth: '600px',
          width: '100%',
          background: '#ffffff',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px'
          }}>
            <button 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                fontWeight: '600',
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: '8px',
                transition: 'all 0.2s ease'
              }}
              onClick={() => setStep(0)}
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <div style={{
              fontSize: '0.875rem',
              color: '#64748b',
              fontWeight: '500'
            }}>
              Step 1 of 4
            </div>
          </div>
          
          <h2 style={{
            fontSize: '1.75rem',
            color: '#1e293b',
            marginBottom: '24px',
            fontWeight: '700'
          }}>
            What's your story?
          </h2>
          <p style={{
            color: '#64748b',
            marginBottom: '24px',
            fontSize: '0.9rem'
          }}>
            Share a message that will inspire others to give
          </p>
          
          <div style={{
            background: '#fff',
            border: '2px solid #e2e8f0',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px'
          }}>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us why this cause matters to you..."
              style={{
                width: '100%',
                minHeight: '120px',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#1e293b',
                fontSize: '1.125rem',
                resize: 'vertical'
              }}
              rows={6}
              maxLength={500}
            />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '16px'
            }}>
              <button 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: listening ? '#7c3aed' : '#ede9fe',
                  border: '1px solid #7c3aed',
                  color: listening ? '#fff' : '#7c3aed',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={listening ? stopListening : startListening}
                disabled={!recognitionRef.current}
              >
                <Mic size={16} />
                {listening ? 'Listening...' : 'Voice'}
              </button>
              <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                {message.length}/500
              </div>
            </div>
          </div>

          {error && (
            <div style={{
              background: '#fee2e2',
              color: '#b91c1c',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px',
              fontWeight: '500'
            }}>
              {error}
            </div>
          )}
          
          <button 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 24px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              opacity: !message.trim() ? 0.5 : 1,
              pointerEvents: !message.trim() ? 'none' : 'auto'
            }}
            onClick={() => setStep(2)}
            disabled={!message.trim()}
          >
            Continue
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Amount selection
  if (step === 2) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px'
      }}>
        <div style={{
          maxWidth: '600px',
          width: '100%',
          background: '#ffffff',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px'
          }}>
            <button 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                fontWeight: '600',
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: '8px',
                transition: 'all 0.2s ease'
              }}
              onClick={() => setStep(1)}
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <div style={{
              fontSize: '0.875rem',
              color: '#64748b',
              fontWeight: '500'
            }}>
              Step 2 of 4
            </div>
          </div>
          
          <h2 style={{
            fontSize: '1.75rem',
            color: '#1e293b',
            marginBottom: '24px',
            fontWeight: '700'
          }}>
            Choose your amount
          </h2>
          <p style={{
            color: '#64748b',
            marginBottom: '24px',
            fontSize: '0.9rem'
          }}>
            Select how much you'd like to donate
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            marginBottom: '24px'
          }}>
            {[5, 10, 25, 50, 100].map((amt) => (
              <button
                key={amt}
                style={{
                  background: amount === amt ? '#7c3aed' : '#fff',
                  color: amount === amt ? '#fff' : '#1e293b',
                  border: `2px solid ${amount === amt ? '#7c3aed' : '#ede9fe'}`,
                  borderRadius: '12px',
                  padding: '16px 12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: amount === amt ? '0 4px 12px rgba(124, 58, 237, 0.3)' : '0 2px 8px rgba(0,0,0,0.05)'
                }}
                onClick={() => setAmount(amt)}
              >
                ${amt}
              </button>
            ))}
            <button
              style={{
                background: amount === 'other' ? '#7c3aed' : '#fff',
                color: amount === 'other' ? '#fff' : '#1e293b',
                border: `2px solid ${amount === 'other' ? '#7c3aed' : '#ede9fe'}`,
                borderRadius: '12px',
                padding: '16px 12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: amount === 'other' ? '0 4px 12px rgba(124, 58, 237, 0.3)' : '0 2px 8px rgba(0,0,0,0.05)'
              }}
              onClick={() => setAmount('other')}
            >
              Other
            </button>
          </div>

          {amount === 'other' && (
            <div style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <input
                type="number"
                value={otherAmount}
                onChange={(e) => setOtherAmount(e.target.value)}
                placeholder="Enter amount"
                min="0.01"
                step="0.01"
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  transition: 'border-color 0.2s ease'
                }}
              />
              <button
                style={{
                  background: '#7c3aed',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 20px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: (!otherAmount || Number(otherAmount) <= 0) ? 0.5 : 1,
                  pointerEvents: (!otherAmount || Number(otherAmount) <= 0) ? 'none' : 'auto'
                }}
                onClick={() => {
                  if (otherAmount && Number(otherAmount) > 0) {
                    setAmount(Number(otherAmount));
                  }
                }}
                disabled={!otherAmount || Number(otherAmount) <= 0}
              >
                Apply
              </button>
            </div>
          )}

          {error && (
            <div style={{
              background: '#fee2e2',
              color: '#b91c1c',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px',
              fontWeight: '500'
            }}>
              {error}
            </div>
          )}
          
          <button 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 24px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              opacity: (!amount && !otherAmount) ? 0.5 : 1,
              pointerEvents: (!amount && !otherAmount) ? 'none' : 'auto'
            }}
            onClick={() => setStep(3)}
            disabled={!amount && !otherAmount}
          >
            Continue
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Review and visibility
  if (step === 3) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px'
      }}>
        <div style={{
          maxWidth: '600px',
          width: '100%',
          background: '#ffffff',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px'
          }}>
            <button 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                fontWeight: '600',
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: '8px',
                transition: 'all 0.2s ease'
              }}
              onClick={() => setStep(2)}
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <div style={{
              fontSize: '0.875rem',
              color: '#64748b',
              fontWeight: '500'
            }}>
              Step 3 of 4
            </div>
          </div>
          
          <h2 style={{
            fontSize: '1.75rem',
            color: '#1e293b',
            marginBottom: '24px',
            fontWeight: '700'
          }}>
            Review your donation
          </h2>
          <p style={{
            color: '#64748b',
            marginBottom: '24px',
            fontSize: '0.9rem'
          }}>
            Make sure everything looks right before you give
          </p>
          
          <div style={{
            background: 'linear-gradient(135deg, #fff 0%, #f8fafc 100%)',
            borderRadius: '20px',
            padding: '32px',
            marginBottom: '24px',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: '#1e293b',
              marginBottom: '16px'
            }}>
              Your Whisper
            </h3>
            <div style={{
              fontSize: '1.125rem',
              color: '#64748b',
              fontStyle: 'italic',
              margin: '16px 0',
              padding: '16px',
              background: '#ede9fe',
              borderRadius: '12px',
              borderLeft: '4px solid #7c3aed'
            }}>
              "{message}"
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '20px',
              paddingTop: '20px',
              borderTop: '1px solid #e2e8f0'
            }}>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>
                  Amount
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#7c3aed' }}>
                  ${amount === 'other' ? otherAmount : amount}
                </div>
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            marginBottom: '24px',
            flexWrap: 'wrap'
          }}>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: isPublic ? '#7c3aed' : '#fff',
                color: isPublic ? '#fff' : '#1e293b',
                border: `2px solid ${isPublic ? '#7c3aed' : '#ede9fe'}`,
                borderRadius: '12px',
                padding: '16px 20px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                minWidth: '160px',
                justifyContent: 'center'
              }}
              onClick={() => setIsPublic(true)}
            >
              <Eye size={16} />
              Public
            </button>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: !isPublic ? '#7c3aed' : '#fff',
                color: !isPublic ? '#fff' : '#1e293b',
                border: `2px solid ${!isPublic ? '#7c3aed' : '#ede9fe'}`,
                borderRadius: '12px',
                padding: '16px 20px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                minWidth: '160px',
                justifyContent: 'center'
              }}
              onClick={() => setIsPublic(false)}
            >
              <EyeOff size={16} />
              Anonymous
            </button>
          </div>

          {isPublic && (
            <div style={{
              marginBottom: '24px'
            }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email (optional, for receipt)"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  transition: 'border-color 0.2s ease'
                }}
              />
            </div>
          )}

          <p style={{
            color: '#94a3b8',
            marginBottom: '24px',
            fontSize: '0.875rem'
          }}>
            Your personal information is protected. Only your message and donation amount will be shared.
          </p>

          {error && (
            <div style={{
              background: '#fee2e2',
              color: '#b91c1c',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px',
              fontWeight: '500'
            }}>
              {error}
            </div>
          )}
          
          <div style={{ textAlign: 'center' }}>
            <button 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 24px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                opacity: submitting ? 0.5 : 1,
                pointerEvents: submitting ? 'none' : 'auto'
              }}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Processing...' : 'Send my words and support'}
              <Send size={16} />
            </button>
            
            {/* Debug button to go directly to step 4 */}
            <button 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#ef4444',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '8px 16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                marginTop: '12px',
                fontSize: '0.875rem'
              }}
              onClick={() => {
                console.log('Debug: Going to step 4');
                setStep(4);
              }}
            >
              🔧 Debug: Go to Step 4
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 4: Payment method selection
  if (step === 4) {
    console.log('Rendering step 4 - Payment methods');
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px'
      }}>
        <div style={{
          maxWidth: '600px',
          width: '100%',
          background: '#ffffff',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px'
          }}>
            <button 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                fontWeight: '600',
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: '8px',
                transition: 'all 0.2s ease'
              }}
              onClick={() => setStep(3)}
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <div style={{
              fontSize: '0.875rem',
              color: '#64748b',
              fontWeight: '500'
            }}>
              Step 4 of 4
            </div>
          </div>
          
          <h2 style={{
            fontSize: '1.75rem',
            color: '#1e293b',
            marginBottom: '24px',
            fontWeight: '700'
          }}>
            How would you like to pay? (Step {step})
          </h2>
          <p style={{
            color: '#64748b',
            marginBottom: '24px',
            fontSize: '0.9rem'
          }}>
            Choose your preferred payment method
          </p>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            marginBottom: '24px'
          }}>
            {/* Test button for debugging */}
            <button 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#10b981',
                color: '#fff',
                border: '2px solid #10b981',
                borderRadius: '12px',
                padding: '12px 20px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: '0.875rem',
                marginBottom: '8px'
              }}
              onClick={testQRModal}
            >
              🧪 Test QR Modal
            </button>
            
            {/* Simple test button */}
            <button 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#ef4444',
                color: '#fff',
                border: '2px solid #ef4444',
                borderRadius: '12px',
                padding: '12px 20px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: '0.875rem',
                marginBottom: '8px'
              }}
              onClick={testButtonClick}
            >
              🔴 Test Click
            </button>
            
            {/* Force QR Modal Test */}
            <button 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#8b5cf6',
                color: '#fff',
                border: '2px solid #8b5cf6',
                borderRadius: '12px',
                padding: '12px 20px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: '0.875rem',
                marginBottom: '8px'
              }}
              onClick={forceShowQRModal}
            >
              🚀 Force QR Modal
            </button>
            <button 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#7c3aed',
                color: '#fff',
                border: '2px solid #7c3aed',
                borderRadius: '12px',
                padding: '12px 20px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: '0.875rem',
                opacity: xamanState.phase === 'creating' ? 0.5 : 1,
                pointerEvents: xamanState.phase === 'creating' ? 'none' : 'auto'
              }}
              onClick={startRlusdXamanFromWhisper}
              disabled={xamanState.phase === 'creating'}
            >
              {xamanState.phase === 'creating' ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid transparent',
                    borderTop: '2px solid currentColor',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Creating...
                </>
              ) : (
                <>
                  <Heart size={16} />
                  Digital Wallet (XAMAN)
                </>
              )}
            </button>
            
            <button 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'transparent',
                border: '2px solid #7c3aed',
                color: '#7c3aed',
                borderRadius: '12px',
                padding: '12px 20px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: '0.875rem',
                opacity: crossmarkBusy ? 0.5 : 1,
                pointerEvents: crossmarkBusy ? 'none' : 'auto'
              }}
              onClick={startRlusdCrossmarkFromWhisper} 
              disabled={crossmarkBusy}
            >
              {crossmarkBusy ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid transparent',
                    borderTop: '2px solid currentColor',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Opening…
                </>
              ) : (
                <>
                  <Heart size={16} />
                  Digital Wallet (CROSSMARK)
                </>
              )}
            </button>

            <button 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'transparent',
                border: '2px solid #7c3aed',
                color: '#7c3aed',
                borderRadius: '12px',
                padding: '12px 20px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: '0.875rem',
                opacity: fiatState.phase === 'processing' ? 0.5 : 1,
                pointerEvents: fiatState.phase === 'processing' ? 'none' : 'auto'
              }}
              onClick={startFiatTransaction}
              disabled={fiatState.phase === 'processing'}
            >
              {fiatState.phase === 'processing' ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid transparent',
                    borderTop: '2px solid currentColor',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Processing…
                </>
              ) : (
                <>
                  <CreditCard size={16} />
                  Credit Card (MoonPay)
                </>
              )}
            </button>
          </div>
          
          {crossmarkError && (
            <div style={{
              background: '#fee2e2',
              color: '#b91c1c',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px',
              fontWeight: '500'
            }}>
              {crossmarkError}
            </div>
          )}
          {fiatState.phase === 'error' && (
            <div style={{
              background: '#fee2e2',
              color: '#b91c1c',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px',
              fontWeight: '500'
            }}>
              {fiatState.message}
            </div>
          )}
          {xamanState.phase === 'error' && (
            <div style={{
              background: '#fee2e2',
              color: '#b91c1c',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px',
              fontWeight: '500'
            }}>
              {xamanState.message}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Step 5: Confirmation
  if (step === 5) {
    return (
      <DonationConfirmation
        message={message}
        amount={amount === 'other' ? Number(otherAmount) : Number(amount)}
        transactionHash={xamanState.phase === 'completed' ? xamanState.txid : fiatState.phase === 'completed' ? fiatState.txid : undefined}
        transactionUrl={transactionUrl || undefined}
        isPublic={isPublic}
        onReturnHome={() => window.location.href = '/'}
      />
    );
  }

  return (
    <>
      {console.log('QR Modal state:', xamanState.phase, 'QR Code:', xamanState.phase === 'ready' ? (xamanState as any).qrCode : 'N/A')}
      {console.log('QR Modal should be open:', xamanState.phase === 'creating' || xamanState.phase === 'ready')}
      <QRModal
        open={xamanState.phase === 'creating' || xamanState.phase === 'ready'}
        title="Donate with Digital Wallet"
        qrUrl={xamanState.phase === 'ready' ? (xamanState as any).qrCode : undefined}
        openLink={xamanState.phase === 'ready' ? `https://xumm.app/sign/${(xamanState as any).payloadId}` : undefined}
        network="Testnet"
        status={xamanState.phase === 'creating' ? 'Creating payment...' : xamanState.phase === 'ready' ? 'Scan to sign in XAMAN' : undefined}
        onClose={() => {
          console.log('Closing QR modal');
          setXamanState({ phase: 'idle' });
        }}
      />
    </>
  );
};

export default WhisperFlow;
