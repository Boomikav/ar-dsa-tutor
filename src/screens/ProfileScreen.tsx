import React, { useState, useEffect } from 'react';
import { useApp } from '../state/AppContext';
import { HeaderBar } from '../components/HeaderBar';
import { ARCapabilities } from '../services/ar/IARService';
import { ARCapabilityDiagnostic, ARCapabilityReport } from '../services/ar/ARCapabilityDiagnostic';
import { 
  User, 
  Award, 
  Smartphone, 
  CheckCircle2, 
  XCircle,
  AlertTriangle,
  Flame, 
  ShieldCheck,
  Settings as SettingsIcon
} from 'lucide-react';

export const ProfileScreen: React.FC = () => {
  const { learnerState, services, navigateTo } = useApp();
  const [capabilities, setCapabilities] = useState<ARCapabilities | null>(null);
  const [diagReport, setDiagReport] = useState<ARCapabilityReport | null>(null);

  useEffect(() => {
    services.arService.checkCapabilities().then(caps => {
      setCapabilities(caps);
    });
    ARCapabilityDiagnostic.evaluateEnvironment().then(rep => {
      setDiagReport(rep);
    });
  }, [services]);

  const profile = learnerState.profile;

  return (
    <div className="mobile-screen-content">
      <HeaderBar
        title="Student Profile"
        rightAction={
          <button
            onClick={() => navigateTo('settings')}
            className="btn btn-ghost btn-icon-only"
            aria-label="Settings"
          >
            <SettingsIcon size={18} />
          </button>
        }
      />

      <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* User Card */}
        <div
          className="card card-glow-cyan"
          style={{
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '10px'
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-indigo) 100%)',
              padding: '3px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: 'var(--bg-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-cyan)'
              }}
            >
              <User size={34} />
            </div>
          </div>

          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800 }}>{profile.fullName}</h2>
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
              @{profile.username} • {profile.academicLevel}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <span className="badge badge-cyan">{profile.preferredLearningPace}</span>
            <span className="badge badge-emerald">Enrolled 2026</span>
          </div>
        </div>

        {/* Device & AR Hardware Diagnostics */}
        <div className="card" style={{ padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Smartphone size={16} color="var(--accent-cyan)" />
              <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                AR System Capabilities
              </span>
            </div>
            <span className={`badge ${diagReport?.immersiveARSupported ? 'badge-emerald' : 'badge-cyan'}`} style={{ fontSize: '10px' }}>
              {diagReport?.immersiveARSupported ? 'WebXR AR Ready' : 'Interactive 3D Ready'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Platform / OS</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {diagReport?.platform || 'Detecting...'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Browser Runtime</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {diagReport ? `${diagReport.browserName} ${diagReport.browserVersion}` : 'Detecting...'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Secure Context (HTTPS)</span>
              {diagReport?.secureContext ? (
                <span style={{ color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={13} /> Active (Secure)
                </span>
              ) : (
                <span style={{ color: 'var(--warning)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <AlertTriangle size={13} /> Insecure Context
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>WebXR Device API</span>
              {diagReport?.navigatorXRAvailable ? (
                <span style={{ color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={13} /> Supported
                </span>
              ) : (
                <span style={{ color: 'var(--text-tertiary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <XCircle size={13} /> Desktop / Web Fallback
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Immersive-AR Session</span>
              {diagReport?.immersiveARSupported ? (
                <span style={{ color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={13} /> Supported
                </span>
              ) : (
                <span style={{ color: 'var(--warning)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  3D Fallback Mode
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Real-World Surface Hit-Testing</span>
              {diagReport?.hitTestSupported ? (
                <span style={{ color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={13} /> Active (XRHitTestSource)
                </span>
              ) : (
                <span style={{ color: 'var(--text-tertiary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  Touch / Orbit Fallback
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>AR Quality Target</span>
              <span className="badge badge-cyan">{profile.arPreferences.renderQuality}</span>
            </div>
          </div>
        </div>

        {/* Academic Milestones & Badges */}
        <div className="card" style={{ padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Award size={16} color="var(--accent-purple)" />
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Mastery Badges
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div style={{ padding: '10px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <Flame size={20} color="var(--warning)" style={{ margin: '0 auto 4px auto' }} />
              <div style={{ fontSize: '11px', fontWeight: 700 }}>6-Day Streak</div>
              <div style={{ fontSize: '9.5px', color: 'var(--text-tertiary)' }}>Consistent Learner</div>
            </div>

            <div style={{ padding: '10px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <ShieldCheck size={20} color="var(--success)" style={{ margin: '0 auto 4px auto' }} />
              <div style={{ fontSize: '11px', fontWeight: 700 }}>Array Master</div>
              <div style={{ fontSize: '9.5px', color: 'var(--text-tertiary)' }}>92% Score</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
