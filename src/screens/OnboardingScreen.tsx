import React, { useState } from 'react';
import { useApp } from '../state/AppContext';
import { HeaderBar } from '../components/HeaderBar';
import { Box, Eye, MessageSquareCode, Sliders, ArrowRight, Check } from 'lucide-react';

export const OnboardingScreen: React.FC = () => {
  const { navigateTo, setHasCompletedOnboarding } = useApp();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: <Box size={44} color="var(--accent-cyan)" />,
      badge: 'STAGE 1 • OVERVIEW',
      title: 'What AR-DSA Tutor Does',
      subtitle: 'Spatial Computing Meets Algorithmic Rigor',
      description: 'AR-DSA Tutor transforms abstract computer science data structures into interactive spatial 3D models and verified simulations. You can physically inspect, step through, and manipulate complex structures like Binary Search Trees directly in your physical environment.',
      bulletList: null,
      accent: 'cyan'
    },
    {
      icon: <Eye size={44} color="var(--accent-purple)" />,
      badge: 'STAGE 2 • INTERACTIVE VISUALIZATION',
      title: 'How Interactive Visualization Works',
      subtitle: 'Deterministic Ground Truth at Every Step',
      description: 'Unlike static textbook diagrams or video animations, our visualizer runs on an authoritative, deterministic engine. Every pointer traversal, node comparison, and tree balancing step is calculated algorithmically in pure TypeScript, giving you 100% reproducible state.',
      bulletList: null,
      accent: 'purple'
    },
    {
      icon: <MessageSquareCode size={44} color="var(--accent-indigo)" />,
      badge: 'STAGE 3 • GENERATIVE AI TUTOR',
      title: 'How AI Personalization Works',
      subtitle: 'Contextual Socratic Mentorship',
      description: 'Your embedded AI tutor inspects your active operations, current node comparisons, and misconception patterns. It guides you using Socratic questions, analogies, and invariant reminders without spoonfeeding answers or hallucinating algorithm rules.',
      disclaimer: 'Note: AI tutor responses provide advisory pedagogical guidance; deterministic engines remain the sole authority on algorithm invariants.',
      bulletList: null,
      accent: 'indigo'
    },
    {
      icon: <Sliders size={44} color="var(--accent-emerald)" />,
      badge: 'STAGE 4 • ADAPTIVE INTELLIGENCE',
      title: 'How Learner Adaptation Works',
      subtitle: 'Your learning path adapts to you',
      description: 'The system continuously evaluates your problem-solving competence and consistency:',
      bulletList: [
        'your answers & decision accuracy',
        'your recurring misconception patterns',
        'your independence (unassisted solves)',
        'your overall mastery momentum'
      ],
      closingNote: 'Then it automatically selects appropriate practice difficulty from Foundational to Challenge.',
      accent: 'emerald'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setHasCompletedOnboarding(true);
      navigateTo('diagnostic');
    }
  };

  const current = steps[currentStep];

  return (
    <div className="mobile-screen-content no-bottom-pad" style={{ background: 'var(--bg-primary)' }}>
      <HeaderBar
        title="Welcome to AR-DSA"
        showBack={currentStep > 0}
        onBack={() => setCurrentStep(prev => prev - 1)}
        rightAction={
          <button
            onClick={() => {
              setHasCompletedOnboarding(true);
              navigateTo('diagnostic');
            }}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}
          >
            Skip
          </button>
        }
      />

      <div style={{ flex: 1, padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        {/* Step Visual Hero Card */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginTop: 'var(--space-2)' }}>
          <div
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '26px',
              background: current.accent === 'purple'
                ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(99, 102, 241, 0.1) 100%)'
                : current.accent === 'emerald'
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.1) 100%)'
                : current.accent === 'indigo'
                ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%)'
                : 'linear-gradient(135deg, rgba(0, 242, 254, 0.2) 0%, rgba(14, 165, 233, 0.1) 100%)',
              border: '1px solid var(--border-card)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 'var(--space-4)',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            {current.icon}
          </div>

          <span className={`badge badge-${current.accent}`} style={{ marginBottom: 'var(--space-2)' }}>
            {current.badge}
          </span>

          <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '4px' }}>
            {current.title}
          </h2>

          <p style={{ fontSize: '12.5px', color: 'var(--accent-cyan)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
            {current.subtitle}
          </p>

          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, maxWidth: '340px', margin: 0 }}>
            {current.description}
          </p>

          {/* Special list for Stage 4 */}
          {current.bulletList && (
            <div
              style={{
                width: '100%',
                maxWidth: '320px',
                marginTop: '12px',
                padding: '12px 14px',
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
                textAlign: 'left'
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', textTransform: 'uppercase' }}>
                The system observes:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {current.bulletList.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    <Check size={14} color="var(--accent-emerald)" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              {current.closingNote && (
                <div style={{ fontSize: '11.5px', color: 'var(--accent-cyan)', marginTop: '8px', fontWeight: 600 }}>
                  {current.closingNote}
                </div>
              )}
            </div>
          )}

          {/* AI Fallibility Disclaimer for Stage 3 */}
          {current.disclaimer && (
            <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '10px', maxWidth: '320px', lineHeight: 1.4 }}>
              {current.disclaimer}
            </p>
          )}
        </div>

        {/* Step Indicator and Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', width: '100%', marginTop: 'var(--space-4)' }}>
          {/* Step Dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
            {steps.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === currentStep ? '24px' : '7px',
                  height: '7px',
                  borderRadius: 'var(--radius-full)',
                  background: i === currentStep ? 'var(--accent-cyan)' : 'var(--bg-tertiary)',
                  transition: 'all 250ms ease'
                }}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="btn btn-primary btn-full btn-lg"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <span>{currentStep === steps.length - 1 ? 'Get Started' : 'Continue'}</span>
            {currentStep === steps.length - 1 ? <Check size={18} /> : <ArrowRight size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};
