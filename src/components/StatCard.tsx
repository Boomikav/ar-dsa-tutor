import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  accentColor?: 'cyan' | 'purple' | 'emerald' | 'amber';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon,
  accentColor = 'cyan'
}) => {
  const getGlowClass = () => {
    if (accentColor === 'purple') return 'card-glow-purple';
    if (accentColor === 'cyan') return 'card-glow-cyan';
    return '';
  };

  const getAccentColorStyle = () => {
    if (accentColor === 'purple') return 'var(--accent-purple)';
    if (accentColor === 'emerald') return 'var(--success)';
    if (accentColor === 'amber') return 'var(--warning)';
    return 'var(--accent-cyan)';
  };

  return (
    <div className={`card ${getGlowClass()}`} style={{ flex: 1, padding: '12px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
          {label}
        </span>
        {icon && <div style={{ color: getAccentColorStyle() }}>{icon}</div>}
      </div>
      <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
        {value}
      </div>
      {subtext && (
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          {subtext}
        </div>
      )}
    </div>
  );
};
