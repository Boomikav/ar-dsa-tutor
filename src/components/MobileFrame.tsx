import React from 'react';
import { useApp } from '../state/AppContext';
import { Wifi, BatteryMedium } from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children }) => {
  const { isDeviceChassisEnabled, currentScreen } = useApp();

  if (currentScreen === 'ar-session') {
    return (
      <div
        className="ar-fullscreen-viewport"
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100dvh',
          maxWidth: 'none',
          maxHeight: 'none',
          margin: 0,
          padding: 0,
          overflow: 'hidden',
          backgroundColor: '#040711',
          zIndex: 100
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <div className="app-viewport-root">
      <div className="desktop-preview-container">
        {/* Mobile Device Enclosure */}
        <div className={`mobile-device-shell ${isDeviceChassisEnabled ? 'with-chassis' : ''}`}>
          {/* Simulated Mobile Status Bar */}
          <div className="mobile-status-bar">
            <span>09:41</span>
            <div className="status-bar-icons">
              <span style={{ fontSize: '9px', letterSpacing: '0.05em', color: 'var(--accent-cyan)' }}>5G</span>
              <Wifi size={12} />
              <BatteryMedium size={14} />
            </div>
          </div>

          {/* Screen Content Container */}
          {children}
        </div>
      </div>
    </div>
  );
};
