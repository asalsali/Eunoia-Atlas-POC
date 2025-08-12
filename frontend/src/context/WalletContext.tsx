import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { connectCrossmark, isCrossmarkAvailable } from '../services/crossmarkService';

type WalletProviderName = 'CROSSMARK' | 'XAMAN' | 'NONE';

interface WalletState {
  address?: string;
  network?: string;
  provider: WalletProviderName;
}

interface WalletContextValue extends WalletState {
  connectCrossmark: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

const STORAGE_KEY = 'eunoia_wallet_state_v1';

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<WalletState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return { provider: 'NONE' };
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }, [state]);

  const handleConnectCrossmark = async () => {
    if (!isCrossmarkAvailable()) throw new Error('CROSSMARK extension not found');
    const resp = await connectCrossmark();
    if (!resp.ok || !resp.address) throw new Error(resp.error || 'Failed to connect');
    setState({ provider: 'CROSSMARK', address: resp.address, network: resp.network || 'testnet' });
  };

  const disconnect = () => setState({ provider: 'NONE' });

  const value = useMemo<WalletContextValue>(() => ({
    provider: state.provider,
    address: state.address,
    network: state.network,
    connectCrossmark: handleConnectCrossmark,
    disconnect,
  }), [state]);

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextValue => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
};



