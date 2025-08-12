// XUMM Service with Error Handling and Fallbacks
import { XummSdk } from 'xumm-sdk';
import { Client, TrustSet, Payment } from 'xrpl';

// Check if XUMM SDK is available and properly configured
let xumm: XummSdk | null = null;
let isXummAvailable = false;

try {
  // Only initialize if environment variables are properly set
  let apiKey = process.env.REACT_APP_XAMAN_API_KEY || process.env.REACT_APP_XUMM_API_KEY;
  let apiSecret = process.env.REACT_APP_XAMAN_API_SECRET || process.env.REACT_APP_XUMM_API_SECRET;
  if (!apiKey || !apiSecret) {
    // Fallback for demo if build-time env didn’t inject
    apiKey = 'ba1b287b-3c39-4db2-a5d3-78e5d9ce61d5';
    apiSecret = 'a23f1e70-bb23-4e3f-98e5-b2ef3ad02d1c';
  }
  
  if (apiKey && apiSecret && apiKey !== 'your-api-key' && apiSecret !== 'your-api-secret') {
    xumm = new XummSdk(apiKey, apiSecret);
    isXummAvailable = true;
    console.log('Xaman (XUMM) SDK initialized successfully');
  } else {
    console.warn('Xaman credentials not properly configured, using fallback mode');
  }
} catch (error) {
  console.error('Failed to initialize Xaman SDK:', error);
  isXummAvailable = false;
}

// Convert string to hex for memo data (browser-safe)
function convertStringToHex(str: string): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  let hex = '';
  for (const b of bytes) hex += b.toString(16).padStart(2, '0');
  return hex;
}

// Create RLUSD trust line using XRPL.js with error handling
export async function createRlusdTrustLine(wallet: any) {
  if (!isXummAvailable) {
    console.warn('Xaman not available, skipping trust line creation');
    return false;
  }

  try {
    const client = new Client('wss://s.altnet.rippletest.net:51233');
    await client.connect();

    const transaction: TrustSet = {
      TransactionType: "TrustSet",
      Account: wallet.classicAddress,
      LimitAmount: {
        currency: '524C555344000000000000000000000000000000',  // RLUSD
        issuer: 'rQhWct2fv4Vc4KRjRgMrxa8xPN9Zx9iLKV',  // Ripple
        value: '100000000'
      }
    };

    const prepared = await client.autofill(transaction);
    const result = await client.submitAndWait(prepared, { wallet });
    client.disconnect();

    // Check if the transaction was successful
    const meta = result.result.meta;
    if (typeof meta === 'string') {
      return meta === "tesSuccess";
    } else if (meta && 'TransactionResult' in meta) {
      return meta.TransactionResult === "tesSuccess";
    }
    return false;
  } catch (error) {
    console.error('Error creating trust line:', error);
    return false;
  }
}

// Get QR code URL for payment with fallback
export async function getQRCodeURL(
  destination: string, 
  transactionId: string, 
  value: number, 
  validity: number = 129600
): Promise<string> {
  if (!isXummAvailable || !xumm) {
    console.warn('Xaman not available, returning fallback QR code');
    return `https://xumm.app/sign/${transactionId}`;
  }

  const memo = {
    Memo: {
      MemoData: convertStringToHex(transactionId),
    },
  };
  
  const amount = {
    value: String(value),
    currency: '524C555344000000000000000000000000000000', // RLUSD
    issuer: 'rQhWct2fv4Vc4KRjRgMrxa8xPN9Zx9iLKV',
  };

  const request = {
    TransactionType: 'Payment' as const,
    Destination: destination,
    Memos: [memo],
    Amount: amount,
  };

  try {
    const payload = await xumm.payload.create(request);
    return payload?.refs?.qr_png || '';
  } catch (error: any) {
    console.error('Error creating Xaman payload:', error);
    const message = error?.response?.data?.error || error?.message || 'Failed to create payment';
    // Return fallback URL
    return `https://xumm.app/sign/${transactionId}`;
  }
}

// Create donation payment with comprehensive error handling
export async function createDonationPayment(
  destination: string,
  transactionId: string,
  amount: number,
  charity: string,
  causeId: string
): Promise<any> {
  if (!isXummAvailable || !xumm) {
    console.warn('Xaman not available, returning mock payment data');
    return {
      success: true,
      payloadId: `mock-${transactionId}`,
      qrCode: `https://xumm.app/sign/${transactionId}`,
      message: 'Xaman integration disabled - using fallback mode'
    };
  }

  const memo = {
    Memo: {
      MemoData: convertStringToHex(JSON.stringify({
        transactionId,
        charity,
        causeId,
        timestamp: new Date().toISOString()
      })),
    },
  };

  const paymentAmount = {
    value: String(amount),
    currency: '524C555344000000000000000000000000000000', // RLUSD
    issuer: 'rQhWct2fv4Vc4KRjRgMrxa8xPN9Zx9iLKV',
  };

  const request = {
    TransactionType: 'Payment' as const,
    Destination: destination,
    Memos: [memo],
    Amount: paymentAmount,
  };

  try {
    const payload = await xumm.payload.create(request);
    
    if (payload && payload.uuid) {
      return {
        success: true,
        payloadId: payload.uuid,
        qrCode: payload.refs?.qr_png || '',
        message: 'Payment created successfully'
      };
    } else {
      throw new Error('Failed to create payload');
    }
  } catch (error: any) {
    console.error('Error creating donation payment:', error);
    const message = error?.response?.data?.error || error?.message || 'Failed to create payment';
    return {
      success: false,
      error: message,
      fallback: true
    };
  }
}

// Check payment status with error handling
export async function checkPaymentStatus(payloadId: string): Promise<any> {
  if (!isXummAvailable || !xumm) {
    console.warn('Xaman not available, returning mock status');
    return {
      status: 'pending',
      message: 'Xaman integration disabled'
    };
  }

  try {
    const payload = await xumm.payload.get(payloadId);
    return {
      status: payload?.response?.account || 'pending',
      signed: !!payload?.response,
      message: payload?.response ? 'Payment completed' : 'Payment pending'
    };
  } catch (error) {
    console.error('Error checking payment status:', error);
    return {
      status: 'error',
      message: 'Failed to check payment status'
    };
  }
}

// Get payment QR code with fallback
export async function getPaymentQRCode(payloadId: string): Promise<string> {
  if (!isXummAvailable || !xumm) {
    console.warn('Xaman not available, returning fallback QR code');
    return `https://xumm.app/sign/${payloadId}`;
  }

  try {
    const payload = await xumm.payload.get(payloadId);
    // Use type assertion to access refs property
    return (payload as any)?.refs?.qr_png || `https://xumm.app/sign/${payloadId}`;
  } catch (error) {
    console.error('Error getting QR code:', error);
    return `https://xumm.app/sign/${payloadId}`;
  }
}

// Export availability status for components to check
export const xummStatus = {
  isAvailable: isXummAvailable,
  message: isXummAvailable ? 'XUMM integration active' : 'XUMM integration disabled - using fallback mode'
}; 