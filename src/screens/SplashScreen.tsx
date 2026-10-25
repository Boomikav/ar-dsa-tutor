import React from 'react';
import { useApp } from '../state/AppContext';
import { Sparkles, Layers, Cpu, Box, ArrowRight } from 'lucide-react';

export const SplashScreen: React.FC = () => {
  const { navigateTo, hasCompletedOnboarding, hasCompletedDiagnostic } = useApp();

  const handleStart = () => {
    if (!hasCompletedOnboarding) {
      navigateTo('onboarding');
    } else if (!hasCompletedDiagnostic) {
      navigateTo('diagnostic');
    } else {
      navigateTo('home');
    }
  };

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--space-8) var(--space-6)',
        background: 'radial-gradient(circle at 50% 30%, #172554 0%, #080c14 70%)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Cybernetic Grid Lines */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'linear-gradient(rgba(0, 242, 254, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 242, 254, 0.05) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          opacity: 0.6,
          pointerEvents: 'none'
        }}
      />

      <div style={{ zIndex: 10, marginTop: 'var(--space-6)' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--accent-cyan-dim)',
            border: '1px solid var(--border-accent)',
            marginBottom: 'var(--space-4)'
          }}
        >
          <Sparkles size={13} color="var(--accent-cyan)" />
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-cyan)', letterSpacing: '0.08em' }}>
            ACADEMIC AI + AR FRAMEWORK
          </span>
        </div>

        <h1
          style={{
            fontSize: '32px',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            marginBottom: 'var(--space-2)'
          }}
        >
          AR-DSA <span style={{ color: 'var(--accent-cyan)' }}>Tutor</span>
        </h1>
        
        {/* Core Pillars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: 'var(--space-3)' }}>
          <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
            Learn.
          </span>
          <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--accent-cyan)', letterSpacing: '0.04em' }}>
            Visualize.
          </span>
          <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--accent-purple)', letterSpacing: '0.04em' }}>
            Understand.
          </span>
          <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--accent-emerald)', letterSpacing: '0.04em' }}>
            Master.
          </span>
        </div>
      </div>

      {/* Futuristic 3D Wireframe Brand Icon */}
      <div
        style={{
          zIndex: 10,
          position: 'relative',
          width: '160px',
          height: '160px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: '2px dashed rgba(0, 242, 254, 0.4)',
            animation: 'spin 12s linear infinite'
          }}
        />
        <div
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.25) 0%, rgba(139, 92, 246, 0.25) 100%)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 35px rgba(0, 242, 254, 0.25)'
          }}
        >
          <Box size={46} color="var(--accent-cyan)" />
        </div>
      </div>

      {/* Feature Pillar Badges */}
      <div style={{ zIndex: 10, width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            padding: '10px',
            background: 'var(--bg-glass)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)' }}>
            <Box size={14} color="var(--accent-cyan)" /> Spatial AR
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)' }}>
            <Cpu size={14} color="var(--accent-purple)" /> Generative AI
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)' }}>
            <Layers size={14} color="var(--success)" /> Concept Graph
          </div>
        </div>

        <button
          onClick={handleStart}
          className="btn btn-primary btn-full btn-lg"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <span>Begin Experience</span>
          <ArrowRight size={18} />
        </button>

        <button
          onClick={() => navigateTo('home')}
          className="btn btn-ghost btn-sm"
          style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}
        >
          Skip directly to Dashboard
        </button>
      </div>
    </div>
  );
};
