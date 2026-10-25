import React, { useState } from 'react';
import { useApp } from '../state/AppContext';
import { HeaderBar } from '../components/HeaderBar';
import { 
  RotateCcw, 
  Smartphone, 
  Sparkles, 
  Check, 
  Sliders,
  Eye,
  SlidersHorizontal
} from 'lucide-react';

export const SettingsScreen: React.FC = () => {
  const { 
    learnerState, 
    services, 
    refreshLearnerState, 
    navigateTo,
    accessibilitySettings,
    updateAccessibilitySettings
  } = useApp();

  const [tutoringStyle, setTutoringStyle] = useState(learnerState.profile.aiPreferences.tutoringStyle);
  const [renderQuality, setRenderQuality] = useState(learnerState.profile.arPreferences.renderQuality);
  const [prefer3DFallback, setPrefer3DFallback] = useState(() => {
    return localStorage.getItem('ar_dsa_prefer_3d') === 'true';
  });
  const [isSaved, setIsSaved] = useState(false);

  const handleSavePreferences = async () => {
    await services.learnerService.updateProfile({
      aiPreferences: {
        ...learnerState.profile.aiPreferences,
        tutoringStyle
      },
      arPreferences: {
        ...learnerState.profile.arPreferences,
        renderQuality
      }
    });

    try {
      localStorage.setItem('ar_dsa_prefer_3d', prefer3DFallback ? 'true' : 'false');
    } catch {
      // safe fallback
    }

    await refreshLearnerState();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleResetData = async () => {
    if (window.confirm('Reset all progress and learner state to initial defaults?')) {
      await services.learnerService.resetToDefault();
      localStorage.removeItem('ar_dsa_onboarding_completed');
      localStorage.removeItem('ar_dsa_diagnostic_completed');
      localStorage.removeItem('ar_dsa_prefer_3d');
      await refreshLearnerState();
      navigateTo('home');
    }
  };

  return (
    <div className="mobile-screen-content">
      <HeaderBar title="Settings" showBack onBack={() => navigateTo('profile')} />

      <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Generative AI Tutor Preferences */}
        <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="var(--accent-purple)" />
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              AI Tutor Style
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              { id: 'socratic', label: 'Socratic Dialogue', desc: 'Prompts with questions to guide discovery.' },
              { id: 'direct', label: 'Direct Technical', desc: 'Concise mathematical & operational rules.' },
              { id: 'analogical', label: 'Physical Analogies', desc: 'Relates tree algorithms to spatial real-world metaphors.' }
            ].map(style => (
              <label
                key={style.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-md)',
                  background: tutoringStyle === style.id ? 'rgba(139, 92, 246, 0.15)' : 'var(--bg-tertiary)',
                  border: tutoringStyle === style.id ? '1px solid var(--accent-purple)' : '1px solid transparent',
                  cursor: 'pointer'
                }}
              >
                <input
                  type="radio"
                  name="tutoringStyle"
                  checked={tutoringStyle === style.id}
                  onChange={() => setTutoringStyle(style.id as any)}
                  style={{ marginTop: '3px' }}
                />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{style.label}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{style.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Spatial AR Settings */}
        <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Smartphone size={16} color="var(--accent-cyan)" />
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Augmented Reality Modes
            </span>
          </div>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 10px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-tertiary)',
              cursor: 'pointer'
            }}
          >
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>Prefer 3D Canvas Fallback</div>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                Bypass camera permission and use interactive WebGL 3D mode
              </div>
            </div>
            <input
              type="checkbox"
              checked={prefer3DFallback}
              onChange={(e) => setPrefer3DFallback(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: 'var(--accent-cyan)' }}
            />
          </label>

          <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>Quality Preset:</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            {['low', 'medium', 'high'].map(q => (
              <button
                key={q}
                onClick={() => setRenderQuality(q as any)}
                className={`btn btn-sm ${renderQuality === q ? 'btn-primary' : 'btn-secondary'}`}
                style={{ textTransform: 'capitalize', fontSize: '11px' }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Accessibility Settings */}
        <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Eye size={16} color="var(--accent-emerald)" />
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Accessibility
            </span>
          </div>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 10px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-tertiary)',
              cursor: 'pointer'
            }}
          >
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>Reduced Motion</div>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                Disables spinning animations and particle effects
              </div>
            </div>
            <input
              type="checkbox"
              checked={accessibilitySettings.reducedMotion}
              onChange={(e) => updateAccessibilitySettings({ reducedMotion: e.target.checked })}
              style={{ width: '16px', height: '16px', accentColor: 'var(--accent-emerald)' }}
            />
          </label>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 10px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-tertiary)',
              cursor: 'pointer'
            }}
          >
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>High Contrast Mode</div>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                Enhances border definition and contrast ratios
              </div>
            </div>
            <input
              type="checkbox"
              checked={accessibilitySettings.highContrast}
              onChange={(e) => updateAccessibilitySettings({ highContrast: e.target.checked })}
              style={{ width: '16px', height: '16px', accentColor: 'var(--accent-emerald)' }}
            />
          </label>
        </div>

        {/* Save Changes Button */}
        <button
          onClick={handleSavePreferences}
          className="btn btn-primary btn-full"
          style={{ gap: '6px' }}
        >
          {isSaved ? <Check size={16} /> : <Sliders size={16} />}
          <span>{isSaved ? 'Preferences Applied' : 'Save Preferences'}</span>
        </button>


        {/* Reset State Action */}
        <button
          onClick={handleResetData}
          className="btn btn-secondary btn-full"
          style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)', gap: '6px', fontSize: '12px' }}
        >
          <RotateCcw size={14} />
          <span>Reset All Progress to Initial State</span>
        </button>
      </div>
    </div>
  );
};
