// User Wallet Service for XRPL Donations
import { XummSdk } from 'xumm-sdk';

// Check if XUMM SDK is available
let xumm: XummSdk | null = null;
let isXummAvailable = false;

try {
  const apiKey = process.env.REACT_APP_XUMM_API_KEY;
  const apiSecret = process.env.REACT_APP_XUMM_API_SECRET;
  
  if (apiKey && apiSecret && apiKey !== 'your-api-key' && apiSecret !== 'your-api-secret') {
    xumm = new XummSdk(apiKey, apiSecret);
    isXummAvailable = true;
    console.log('XUMM SDK initialized for user wallets');
  } else {
    console.warn('XUMM credentials not properly configured for user wallets');
  }
} catch (error) {
  console.error('Failed to initialize XUMM SDK for user wallets:', error);
  isXummAvailable = false;
}

// Convert string to hex for memo data
function convertStringToHex(str: string): string {
  return Buffer.from(str).toString('hex');
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
    console.warn('XUMM not available, returning mock payload');
    return {
      success: true,
      payloadId: `mock-user-${Date.now()}`,
      qrCode: `https://xumm.app/sign/mock-user-${Date.now()}`,
      message: 'User wallet integration disabled - using demo mode'
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
  } catch (error) {
    console.error('Error creating user donation payload:', error);
    return {
      success: false,
      error: 'Failed to create payment payload',
      fallback: true
    };
  }
}

// Check user payment status
export async function checkUserPaymentStatus(payloadId: string): Promise<any> {
  if (!isXummAvailable || !xumm) {
    console.warn('XUMM not available, returning mock status');
    return {
      status: 'pending',
      message: 'User wallet integration disabled'
    };
  }

  try {
    const payload = await xumm.payload.get(payloadId);
    return {
      status: payload?.response?.account || 'pending',
      signed: !!payload?.response,
      message: payload?.response ? 'Payment completed' : 'Payment pending',
      transactionHash: payload?.response?.txid || null
    };
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
    console.warn('XUMM not available, returning fallback QR code');
    return `https://xumm.app/sign/${payloadId}`;
  }

  try {
    const payload = await xumm.payload.get(payloadId);
    return (payload as any)?.refs?.qr_png || `https://xumm.app/sign/${payloadId}`;
  } catch (error) {
    console.error('Error getting user wallet QR code:', error);
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