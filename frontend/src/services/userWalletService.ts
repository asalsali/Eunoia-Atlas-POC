// User Wallet Service for XRPL Donations
import { XummSdk } from 'xumm-sdk';

// Check if XUMM SDK is available
let xumm: XummSdk | null = null;
let isXummAvailable = false;

try {
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
    console.log('Xaman (XUMM) SDK initialized for user wallets');
  } else {
    console.warn('Xaman credentials not properly configured for user wallets');
  }
} catch (error) {
  console.error('Failed to initialize Xaman SDK for user wallets:', error);
  isXummAvailable = false;
}

// Convert string to hex for memo data (browser-safe, no Node Buffer)
function convertStringToHex(str: string): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  let hex = '';
  for (const b of bytes) hex += b.toString(16).padStart(2, '0');
  return hex;
}

// User wallet status
export const userWalletStatus = {
  isAvailable: isXummAvailable,
  message: isXummAvailable ? 'User wallet integration active' : 'User wallet integration disabled - using demo mode'
};

// Create a donation payload for user to sign
export async function createUserDonationPayload(
  destination: string,
  amount: number,
  charity: string,
  causeId: string,
  donorEmail?: string
): Promise<any> {
  if (!isXummAvailable || !xumm) {
    console.warn('Xaman not available, returning mock payload');
    return {
      success: true,
      payloadId: `mock-user-${Date.now()}`,
      qrCode: `https://xumm.app/sign/mock-user-${Date.now()}`,
      message: 'User wallet (Xaman) integration disabled - using demo mode'
    };
  }

  const memo = {
    Memo: {
      MemoData: convertStringToHex(JSON.stringify({
        charity,
        causeId,
        donorEmail,
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
        message: 'Payment payload created successfully'
      };
    } else {
      throw new Error('Failed to create payload');
    }
  } catch (error: any) {
    console.error('Error creating user donation payload (Xaman):', error);
    const message = error?.response?.data?.error || error?.message || 'Failed to create payment payload';
    return {
      success: false,
      error: message,
      fallback: true
    };
  }
}

// Check user payment status
export async function checkUserPaymentStatus(payloadId: string): Promise<any> {
  try {
    const response = await fetch(`/xaman/payload/${payloadId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      return {
        status: data.status,
        completed: data.completed,
        txid: data.txid,
        account: data.account,
        message: data.completed ? 'Payment completed' : 'Payment pending'
      };
    } else {
      throw new Error(data.error || 'Failed to check payment status');
    }
  } catch (error) {
    console.error('Error checking user payment status:', error);
    return {
      status: 'error',
      message: 'Failed to check payment status'
    };
  }
}

// Get user wallet QR code
export async function getUserWalletQRCode(payloadId: string): Promise<string> {
  if (!isXummAvailable || !xumm) {
    console.warn('Xaman not available, returning fallback QR code');
    return `https://xumm.app/sign/${payloadId}`;
  }

  try {
    const payload = await xumm.payload.get(payloadId);
    return (payload as any)?.refs?.qr_png || `https://xumm.app/sign/${payloadId}`;
  } catch (error) {
    console.error('Error getting user wallet QR code (Xaman):', error);
    return `https://xumm.app/sign/${payloadId}`;
  }
}

// Create a simple user wallet (for demo purposes)
export function createDemoUserWallet(): { address: string; seed: string } {
  // This is a demo wallet - in production, users would create their own
  const demoAddress = 'rDemoUser123456789012345678901234567890';
  const demoSseed = 'sDemoSeed123456789012345678901234567890';
  
  return {
    address: demoAddress,
    seed: demoSseed
  };
} 