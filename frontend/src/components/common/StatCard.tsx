import React from 'react';

interface StatCardProps {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value }) => {
  return (
    <div style={{
      background: '#fff',
      padding: 20,
      borderRadius: 12,
      boxShadow: '0 1px 3px rgba(0,0,0,.1), 0 1px 2px rgba(0,0,0,.06)',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      border: '1px solid #f3e8ff'
    }}>
      {icon ? <div style={{ background: '#7c3aed', width: 48, height: 48, borderRadius: 12, display: 'grid', placeItems: 'center', color: '#fff' }}>{icon}</div> : null}
      <div>
        <div style={{ color: '#64748b', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
        <div style={{ color: '#1e293b', fontSize: 22, fontWeight: 800 }}>{value}</div>
      </div>
    </div>
  );
};

export default StatCard;



