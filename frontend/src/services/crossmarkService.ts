// CROSSMARK (browser extension) helper for XRPL Testnet payments

// Declare extension shape
declare global {
  interface Window {
    crossmark?: {
      request: (args: any) => Promise<any>
    }
  }
}

// Convert string to hex (browser-safe)
function toHex(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let hex = '';
  for (const b of bytes) hex += b.toString(16).padStart(2, '0');
  return hex;
}

export const RLUSD_HEX = '524C555344000000000000000000000000000000';
export const RLUSD_ISSUER_TESTNET = 'rQhWct2fv4Vc4KRjRgMrxa8xPN9Zx9iLKV';

export function isCrossmarkAvailable(): boolean {
  return typeof window !== 'undefined' && !!window.crossmark?.request;
}

export async function connectCrossmark(): Promise<{ ok: boolean; address?: string; network?: string; error?: string; raw?: any }> {
  if (!isCrossmarkAvailable()) return { ok: false, error: 'CROSSMARK extension not found' };
  try {
    // 1) Ping to wake up the extension (some builds lazy-load)
    try { await window.crossmark!.request({ command: 'ping' }); } catch {}

    // 2) Try to get accounts directly (prompts connect on some versions)
    let resp: any = null;
    try { resp = await window.crossmark!.request({ command: 'accounts' }); } catch {}

    // 3) Explicit login if no accounts
    if (!resp || (!resp.address && !resp.accounts)) {
      try { resp = await window.crossmark!.request({ command: 'crossmark_login' }); } catch {}
    }

    // 4) Fallback to explicit getAddress
    if (!resp || (!resp.address && !resp.accounts)) {
      try { resp = await window.crossmark!.request({ command: 'crossmark_getAddress' }); } catch {}
    }

    const address = resp?.address || resp?.result?.account || resp?.accounts?.[0];
    const network = resp?.network || resp?.result?.network;
    if (!address) return { ok: false, error: 'Unable to retrieve address from CROSSMARK', raw: resp };
    return { ok: true, address, network, raw: resp };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Failed to connect CROSSMARK', raw: e };
  }
}

export async function signRlusdPaymentWithCrossmark(params: {
  destination: string;
  amount: number;
  charity: string;
  causeId: string;
  issuer?: string;
}): Promise<{ ok: boolean; txid?: string; explorer?: string; error?: string; raw?: any }> {
  if (!isCrossmarkAvailable()) {
    return { ok: false, error: 'CROSSMARK extension not found' };
  }

  const issuer = params.issuer || RLUSD_ISSUER_TESTNET;

  const txjson = {
    TransactionType: 'Payment' as const,
    Destination: params.destination,
    Amount: {
      value: String(params.amount),
      currency: RLUSD_HEX,
      issuer
    },
    Memos: [
      {
        Memo: {
          MemoData: toHex(
            JSON.stringify({
              charity: params.charity,
              causeId: params.causeId,
              timestamp: new Date().toISOString()
            })
          )
        }
      }
    ]
  };

  try {
    const result = await window.crossmark!.request({
      command: 'signAndSubmit',
      network: 'testnet',
      txjson
    });

    const txid = result?.txid || result?.hash || result?.result?.hash;
    return {
      ok: !!txid,
      txid,
      explorer: txid ? `https://testnet.xrpl.org/transactions/${txid}` : undefined,
      raw: result,
      error: txid ? undefined : 'Signing failed or was rejected'
    };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Crossmark sign failed', raw: e };
  }
}


