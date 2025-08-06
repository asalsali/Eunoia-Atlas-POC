import { XummSdk } from 'xumm-sdk';

// Initialize Xumm SDK
const xumm = new XummSdk(
  process.env.REACT_APP_XUMM_API_KEY || 'your-api-key',
  process.env.REACT_APP_XUMM_API_SECRET || 'your-api-secret'
);

// Convert string to hex for memo data
function convertStringToHex(str: string): string {
  return Buffer.from(str).toString('hex');
}

// Create RLUSD trust line
export async function createRlusdTrustLine(wallet: any) {
  const client = new (window as any).xrpl.Client('wss://s.altnet.rippletest.net:51233');
  await client.connect();

  let transaction = {
    TransactionType: "TrustSet",
    Account: wallet.classicAddress,
    LimitAmount: {
      currency: '524C555344000000000000000000000000000000',  // RLUSD
      issuer: 'rQhWct2fv4Vc4KRjRgMrxa8xPN9Zx9iLKV',  // Ripple
      value: '100000000'
    }
  };

  transaction = await client.autofill(transaction);

  const result = await client.submitAndWait(transaction, {
    wallet: wallet
  });
  client.disconnect();

  return result.result.meta.TransactionResult === "tesSuccess";
}

// Get QR code URL for payment
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
    txjson: {
      TransactionType: 'Payment',
      Destination: destination,
      Memos: [memo],
      Amount: amount,
    },
    options: {
      expire: validity,
    },
  };

  const payload = await xumm.payload.create(request, true);
  return payload.refs.qr_png;
}

// Create donation payment
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
    txjson: {
      TransactionType: 'Payment',
      Destination: destination,
      Memos: [memo],
      Amount: amountObj,
    },
    options: {
      expire: 129600, // 90 days
    },
  };

  return await xumm.payload.create(request, true);
}

// Check payment status
export async function checkPaymentStatus(payloadId: string): Promise<any> {
  return await xumm.payload.get(payloadId);
}

// Get payment QR code
export async function getPaymentQRCode(payloadId: string): Promise<string> {
  const payload = await xumm.payload.get(payloadId);
  return payload.refs.qr_png;
} 