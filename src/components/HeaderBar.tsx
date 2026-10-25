import React from 'react';
import { useApp } from '../state/AppContext';
import { ChevronLeft, Sparkles, Settings as SettingsIcon } from 'lucide-react';

interface HeaderBarProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  title,
  showBack = false,
  onBack,
  rightAction
}) => {
  const { navigateTo, previousScreen } = useApp();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (previousScreen) {
      navigateTo(previousScreen);
    } else {
      navigateTo('home');
    }
  };

  return (
    <header className="top-header-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {showBack ? (
          <button
            onClick={handleBack}
            className="btn btn-ghost btn-icon-only"
            aria-label="Go back"
            style={{ color: 'var(--text-primary)' }}
          >
            <ChevronLeft size={22} />
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={18} color="var(--accent-cyan)" />
            <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em', color: 'var(--accent-cyan)' }}>
              AR-DSA
            </span>
          </div>
        )}
        <h1 className="header-title" style={{ fontSize: '15px', margin: 0, fontWeight: 700 }}>
          {title || 'AR-DSA Tutor'}
        </h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {rightAction ? (
          rightAction
        ) : (
          <button
            onClick={() => navigateTo('settings')}
            className="btn btn-ghost btn-icon-only"
            aria-label="Settings"
            style={{ color: 'var(--text-secondary)' }}
          >
            <SettingsIcon size={18} />
          </button>
        )}
      </div>
    </header>
  );
};
