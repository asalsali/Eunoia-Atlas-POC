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
    const response = await api.get('/totals');
    return response.data;
  } catch (error) {
    console.error('Error fetching totals:', error);
    throw error;
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