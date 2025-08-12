import React, { PropsWithChildren } from 'react';

interface ActionCardProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  onClick?: () => void;
  as?: 'button' | 'div';
}

const ActionCard: React.FC<PropsWithChildren<ActionCardProps>> = ({ icon, title, description, onClick, as = 'button', children }) => {
  const Element: any = as;
  return (
    <Element
      onClick={onClick}
      style={{
        background: '#fff',
        borderRadius: 12,
        padding: 16,
        boxShadow: '0 1px 3px rgba(0,0,0,.1), 0 1px 2px rgba(0,0,0,.06)',
        border: '1px solid #f3e8ff',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {icon ? <div style={{ color: '#7c3aed' }}>{icon}</div> : null}
      <div style={{ flex: 1 }}>
        <div style={{ color: '#1e293b', fontWeight: 700 }}>{title}</div>
        {description ? <div style={{ color: '#64748b', fontSize: 14 }}>{description}</div> : null}
        {children}
      </div>
      <div style={{ color: '#7c3aed' }}>›</div>
    </Element>
  );
};

export default ActionCard;



