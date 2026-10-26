import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ARNotificationType = 'success' | 'info' | 'warning' | 'error';

export interface ARNotificationProps {
  type: ARNotificationType;
  message: string;
  onDismiss: () => void;
  id?: string;
}

const TYPE_CONFIG = {
  success: {
    icon: CheckCircle2,
    iconColor: '#34d399',
    background: 'rgba(6, 78, 59, 0.94)',
    border: '1px solid rgba(16, 185, 129, 0.55)',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6), 0 0 15px rgba(16, 185, 129, 0.2)'
  },
  info: {
    icon: Info,
    iconColor: '#38bdf8',
    background: 'rgba(12, 74, 110, 0.94)',
    border: '1px solid rgba(56, 189, 248, 0.55)',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6), 0 0 15px rgba(56, 189, 248, 0.2)'
  },
  warning: {
    icon: AlertTriangle,
    iconColor: '#fbbf24',
    background: 'rgba(120, 53, 15, 0.94)',
    border: '1px solid rgba(245, 158, 11, 0.55)',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6), 0 0 15px rgba(245, 158, 11, 0.2)'
  },
  error: {
    icon: AlertCircle,
    iconColor: '#f87171',
    background: 'rgba(127, 29, 29, 0.94)',
    border: '1px solid rgba(239, 68, 68, 0.55)',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6), 0 0 15px rgba(239, 68, 68, 0.2)'
  }
};

/**
 * Standardized, Responsive AR Notification Toast.
 * 
 * Invariants:
 * - Constant responsive width clamped between 320px and 380px (never jumps with text length).
 * - Controlled min-height (52px) for consistent visual footprint.
 * - Icon and close buttons are anchored to top corners for natural multi-line wrapping.
 * - Sits at top (68px) so it NEVER covers bottom controls (Left, Right, Insert, Place Here).
 * - High-contrast styling with 16px backdrop blur for real camera passthrough readability.
 */
export const ARNotification: React.FC<ARNotificationProps> = ({
  type,
  message,
  onDismiss,
  id = 'ar-notification-toast'
}) => {
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.info;
  const IconComponent = config.icon;

  return (
    <div
      id={id}
      role="alert"
      aria-live="polite"
      style={{
        position: 'absolute',
        top: 'calc(env(safe-area-inset-top, 0px) + 54px)',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 40,
        width: 'min(calc(100vw - 32px), 380px)',
        maxWidth: '380px',
        minWidth: '280px',
        minHeight: '48px',
        boxSizing: 'border-box',
        padding: '8px 12px',
        borderRadius: '12px',
        background: config.background,
        border: config.border,
        boxShadow: config.boxShadow,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        animation: 'fadeIn 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: 'auto'
      }}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Visual Type Indicator Icon */}
      <div style={{ flexShrink: 0, marginTop: '1px' }}>
        <IconComponent size={18} color={config.iconColor} />
      </div>

      {/* Structured Text Content */}
      <div
        style={{
          flex: 1,
          fontSize: '12.5px',
          fontWeight: 600,
          color: '#ffffff',
          lineHeight: '1.4',
          wordBreak: 'break-word',
          letterSpacing: '-0.1px'
        }}
      >
        {message}
      </div>

      {/* Dismiss Button */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDismiss();
        }}
        onPointerDown={(e) => e.stopPropagation()}
        style={{
          flexShrink: 0,
          background: 'none',
          border: 'none',
          color: 'rgba(255, 255, 255, 0.75)',
          cursor: 'pointer',
          padding: '2px',
          margin: '-2px -2px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '4px'
        }}
        title="Dismiss Notification"
        aria-label="Dismiss Notification"
      >
        <X size={15} />
      </button>
    </div>
  );
};
