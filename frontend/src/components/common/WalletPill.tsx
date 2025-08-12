import React from 'react';

interface WalletPillProps {
  address: string;
  network?: string | null;
}

const WalletPill: React.FC<WalletPillProps> = ({ address, network }) => {
  const short = `${address.slice(0, 6)}…${address.slice(-4)}`;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      background: '#ecfdf5',
      color: '#065f46',
      padding: '8px 12px',
      borderRadius: 999,
      border: '1px solid #a7f3d0',
      fontWeight: 700,
      fontSize: 12
    }}>
      {short}
      {network ? <span style={{ opacity: 0.8 }}>({network})</span> : null}
    </span>
  );
};

export default WalletPill;



