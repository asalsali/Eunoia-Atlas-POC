import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface DonationRequest {
  charity: string;
  cid: string;
  amount: number;
  donor_email?: string;
}

export interface DonationResponse {
  tx: string;
  track: string;
}

export interface TotalsResponse {
  MEDA?: number;
  TARA?: number;
}

export const getTotals = async (): Promise<TotalsResponse> => {
  try {
    // Add cache-busting parameter to ensure fresh data
    const response = await api.get('/totals', {
      params: {
        _t: Date.now()
      }
    });
    console.log('Fetched totals:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching totals:', error);
    // Return default values if API fails
    return { MEDA: 0, TARA: 0 };
  }
};

export const makeDonation = async (donation: DonationRequest): Promise<DonationResponse> => {
  try {
    const response = await api.post('/donate', donation);
    return response.data;
  } catch (error) {
    console.error('Error making donation:', error);
    throw error;
  }
};

export const requestPayout = async (charity: string): Promise<any> => {
  try {
    const response = await api.post(`/payout/${charity}`);
    return response.data;
  } catch (error) {
    console.error('Error requesting payout:', error);
    throw error;
  }
};

// New donor intent submission
export interface DonorIntentRequest {
  donorIntent: string;
  amountFiat: number;
  currency: 'CAD';
  donorEmail: string;
  isPublic: boolean;
}

export interface DonorIntentResponse {
  success?: boolean;
  transactionHash?: string;
  transactionUrl?: string;
  message?: string;
}

export const submitDonorIntent = async (
  payload: DonorIntentRequest
): Promise<DonorIntentResponse> => {
  try {
    const response = await api.post('/donations', payload);
    return response.data;
  } catch (error) {
    console.error('Error submitting donor intent:', error);
    throw error;
  }
}; 

// Server-signed demo: send 1 RLUSD from a provided user seed to a charity
export interface DemoUserToCharityRequest {
  sender_seed: string;
  charity: string; // e.g., 'MEDA'
  amount?: number; // defaults to 1
  cause_id?: string;
}

export interface DemoUserToCharityResponse {
  tx: string;
  track: string;
}

export const demoUserToCharity = async (
  payload: DemoUserToCharityRequest
): Promise<DemoUserToCharityResponse> => {
  try {
    const response = await api.post('/demo/user-to-charity', payload);
    return response.data;
  } catch (error) {
    console.error('Error calling demo user-to-charity:', error);
    throw error;
  }
};

// Xaman server-side payload creation
export interface XamanCreatePaymentRequest {
  destination: string;
  amount: number;
  charity: string;
  cause_id: string;
  asset?: string; // 'XRP' for native XRP
  issuer?: string; // optional issuer for IOU
}

export interface XamanCreatePaymentResponse {
  success: boolean;
  payloadId?: string;
  qrCode?: string;
  refs?: any;
  error?: string;
}

export const xamanCreatePayment = async (
  payload: XamanCreatePaymentRequest
): Promise<XamanCreatePaymentResponse> => {
  const resp = await api.post('/xaman/create-payment', payload);
  return resp.data;
};