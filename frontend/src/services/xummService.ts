import { XummSdk } from 'xumm-sdk';
import { Client, TrustSet, Payment } from 'xrpl';

// Initialize Xumm SDK with real credentials
const xumm = new XummSdk(
  process.env.REACT_APP_XUMM_API_KEY || 'your-api-key',
  process.env.REACT_APP_XUMM_API_SECRET || 'your-api-secret'
);

// Convert string to hex for memo data
function convertStringToHex(str: string): string {
  return Buffer.from(str).toString('hex');
}

// Create RLUSD trust line using XRPL.js
export async function createRlusdTrustLine(wallet: any) {
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

// Get QR code URL for payment using real Xumm API
export async function getQRCodeURL(
  destination: string, 
  transactionId: string, 
  value: number, 
  validity: number = 129600
): Promise<string> {
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
    throw error;
  }
}

// Create donation payment using real Xumm API
export async function createDonationPayment(
  destination: string,
  transactionId: string,
  amount: number,
  charity: string,
  causeId: string
): Promise<any> {
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
  
  const amountObj = {
    value: String(amount),
    currency: '524C555344000000000000000000000000000000', // RLUSD
    issuer: 'rQhWct2fv4Vc4KRjRgMrxa8xPN9Zx9iLKV',
  };

  const request = {
    TransactionType: 'Payment' as const,
    Destination: destination,
    Memos: [memo],
    Amount: amountObj,
  };

  try {
    return await xumm.payload.create(request);
  } catch (error) {
    console.error('Error creating donation payment:', error);
    throw error;
  }
}

// Check payment status using real Xumm API
export async function checkPaymentStatus(payloadId: string): Promise<any> {
  try {
    return await xumm.payload.get(payloadId);
  } catch (error) {
    console.error('Error checking payment status:', error);
    throw error;
  }
}

// Get payment QR code using real Xumm API
export async function getPaymentQRCode(payloadId: string): Promise<string> {
  try {
    const payload = await xumm.payload.get(payloadId);
    // Handle the response structure properly
    const response = payload as any;
    return response?.refs?.qr_png || '';
  } catch (error) {
    console.error('Error getting payment QR code:', error);
    throw error;
  }
} 