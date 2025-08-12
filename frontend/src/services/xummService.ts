// XUMM Service with Error Handling and Fallbacks
import { XummSdk } from 'xumm-sdk';
import { Client, TrustSet, Payment } from 'xrpl';

// Check if XUMM SDK is available and properly configured
let xumm: XummSdk | null = null;
let isXummAvailable = false;

try {
  // Only initialize if environment variables are properly set
  const apiKey = process.env.REACT_APP_XUMM_API_KEY;
  const apiSecret = process.env.REACT_APP_XUMM_API_SECRET;
  
  if (apiKey && apiSecret && apiKey !== 'your-api-key' && apiSecret !== 'your-api-secret') {
    xumm = new XummSdk(apiKey, apiSecret);
    isXummAvailable = true;
    console.log('XUMM SDK initialized successfully');
  } else {
    console.warn('XUMM credentials not properly configured, using fallback mode');
  }
} catch (error) {
  console.error('Failed to initialize XUMM SDK:', error);
  isXummAvailable = false;
}

// Convert string to hex for memo data
function convertStringToHex(str: string): string {
  return Buffer.from(str).toString('hex');
}

// Create RLUSD trust line using XRPL.js with error handling
export async function createRlusdTrustLine(wallet: any) {
  if (!isXummAvailable) {
    console.warn('XUMM not available, skipping trust line creation');
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
    console.warn('XUMM not available, returning fallback QR code');
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
  } catch (error) {
    console.error('Error creating Xumm payload:', error);
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
    console.warn('XUMM not available, returning mock payment data');
    return {
      success: true,
      payloadId: `mock-${transactionId}`,
      qrCode: `https://xumm.app/sign/${transactionId}`,
      message: 'XUMM integration disabled - using fallback mode'
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
  } catch (error) {
    console.error('Error creating donation payment:', error);
    return {
      success: false,
      error: 'Failed to create payment',
      fallback: true
    };
  }
}

// Check payment status with error handling
export async function checkPaymentStatus(payloadId: string): Promise<any> {
  if (!isXummAvailable || !xumm) {
    console.warn('XUMM not available, returning mock status');
    return {
      status: 'pending',
      message: 'XUMM integration disabled'
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
    console.warn('XUMM not available, returning fallback QR code');
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