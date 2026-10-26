import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  ChevronRight, 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Compass, 
  RotateCcw,
  Bot
} from 'lucide-react';
import { TutorResponse, TutorResponseType, PedagogicalStyle, TutorNextAction } from '../../models/ai';
import { OrchestrationResult, GeneratedAssessmentQuestion } from '../../models/multiAgent';
import { EGEAInterventionDecision } from '../../services/research/egea';

export interface ARTutorHUDProps {
  response: TutorResponse | null;
  egeaDecision?: EGEAInterventionDecision | null;
  orchestrationResult?: OrchestrationResult | null;
  currentDifficulty?: import('../../models/adaptiveLearner').AdaptiveDifficultyLevel;
  difficultyDecision?: import('../../models/adaptiveLearner').DifficultyDecision | null;
  isThinking: boolean;
  activeTarget: number;
  currentNodeValue: number | null;
  currentStyle: PedagogicalStyle;
  onStyleChange: (style: PedagogicalStyle) => void;
  onRequestHint: () => void;
  onRetryDecision?: () => void;
  onSelectSuggestion?: (action: TutorNextAction) => void;
  onDismiss?: () => void;
}

export const ARTutorHUD: React.FC<ARTutorHUDProps> = ({
  response,
  egeaDecision,
  orchestrationResult,
  currentDifficulty,
  difficultyDecision,
  isThinking,
  activeTarget,
  currentNodeValue,
  currentStyle,
  onStyleChange,
  onRequestHint,
  onRetryDecision,
  onSelectSuggestion,
  onDismiss
}) => {
  const [showReasoning, setShowReasoning] = useState(false);
  const [activeDiagnostic, setActiveDiagnostic] = useState<GeneratedAssessmentQuestion | null>(null);
  const [diagnosticSelected, setDiagnosticSelected] = useState<number | null>(null);

  // Safe visual badge configuration based on responseType
  const getTypeBadge = (type: TutorResponseType) => {
    switch (type) {
      case 'MISTAKE_EXPLANATION':
        return {
          label: 'Misconception Remediation',
          color: '#f87171',
          bg: 'rgba(239, 68, 68, 0.15)',
          border: 'rgba(239, 68, 68, 0.35)',
          icon: <AlertTriangle size={13} color="#f87171" />
        };
      case 'HINT':
        return {
          label: 'Traversal Hint',
          color: '#38bdf8',
          bg: 'rgba(56, 189, 248, 0.15)',
          border: 'rgba(56, 189, 248, 0.35)',
          icon: <Lightbulb size={13} color="#38bdf8" />
        };
      case 'ENCOURAGEMENT':
        return {
          label: 'Progress Verified',
          color: '#34d399',
          bg: 'rgba(16, 185, 129, 0.15)',
          border: 'rgba(16, 185, 129, 0.35)',
          icon: <CheckCircle2 size={13} color="#34d399" />
        };
      case 'CONCEPT_CHECK':
        return {
          label: 'Concept Check',
          color: '#fbbf24',
          bg: 'rgba(245, 158, 11, 0.15)',
          border: 'rgba(245, 158, 11, 0.35)',
          icon: <HelpCircle size={13} color="#fbbf24" />
        };
      case 'NEXT_STEP':
        return {
          label: 'Next Action',
          color: '#a78bfa',
          bg: 'rgba(139, 92, 246, 0.15)',
          border: 'rgba(139, 92, 246, 0.35)',
          icon: <Compass size={13} color="#a78bfa" />
        };
      case 'EXPLANATION':
      default:
        return {
          label: 'BST Invariant Guidance',
          color: '#818cf8',
          bg: 'rgba(99, 102, 241, 0.15)',
          border: 'rgba(99, 102, 241, 0.35)',
          icon: <Bot size={13} color="#818cf8" />
        };
    }
  };

  const badgeConfig = response ? getTypeBadge(response.responseType) : null;

  return (
    <aside
      aria-label="AI Tutor HUD"
      style={{
        position: 'absolute',
        bottom: '160px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '94%',
        maxWidth: '460px',
        zIndex: 35,
        background: 'rgba(8, 12, 26, 0.92)',
        backdropFilter: 'blur(16px)',
        borderRadius: '16px',
        border: `1px solid ${badgeConfig ? badgeConfig.border : 'rgba(56, 189, 248, 0.3)'}`,
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.65), 0 0 20px rgba(56, 189, 248, 0.15)',
        padding: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        animation: 'slideUp 250ms ease'
      }}
    >
      {/* HUD Header: Title, Mode Selector, Dismiss */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div 
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Sparkles size={14} color="#ffffff" />
          </div>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.3px' }}>
            AI TUTOR HUD
          </span>

          {/* Mode Selector Pill */}
          <div 
            style={{
              display: 'flex',
              background: 'rgba(255, 255, 255, 0.06)',
              borderRadius: '8px',
              padding: '2px',
              marginLeft: '4px'
            }}
          >
            {(['socratic', 'direct', 'analogical'] as PedagogicalStyle[]).map(style => (
              <button
                key={style}
                onClick={() => onStyleChange(style)}
                style={{
                  background: currentStyle === style ? 'var(--accent-cyan)' : 'transparent',
                  color: currentStyle === style ? '#040711' : '#94a3b8',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '2px 7px',
                  fontSize: '9.5px',
                  fontWeight: currentStyle === style ? 800 : 600,
                  textTransform: 'capitalize',
                  cursor: 'pointer',
                  transition: 'all 150ms ease'
                }}
              >
                {style}
              </button>
            ))}
          </div>

          {/* Adaptive Level Indicator */}
          {currentDifficulty && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: currentDifficulty === 'FOUNDATIONAL' 
                  ? 'rgba(234, 179, 8, 0.15)' 
                  : currentDifficulty === 'HARD' || currentDifficulty === 'CHALLENGE'
                  ? 'rgba(168, 85, 247, 0.15)'
                  : 'rgba(56, 189, 248, 0.15)',
                border: `1px solid ${
                  currentDifficulty === 'FOUNDATIONAL' 
                    ? 'rgba(234, 179, 8, 0.4)' 
                    : currentDifficulty === 'HARD' || currentDifficulty === 'CHALLENGE'
                    ? 'rgba(168, 85, 247, 0.4)'
                    : 'rgba(56, 189, 248, 0.4)'
                }`,
                borderRadius: '6px',
                padding: '2px 6px',
                fontSize: '9.5px',
                fontWeight: 700,
                color: currentDifficulty === 'FOUNDATIONAL'
                  ? '#fde047'
                  : currentDifficulty === 'HARD' || currentDifficulty === 'CHALLENGE'
                  ? '#c084fc'
                  : '#38bdf8',
                letterSpacing: '0.3px',
                marginLeft: '6px'
              }}
              title={difficultyDecision?.reasons?.join('; ') || `Current adaptive level: ${currentDifficulty}`}
            >
              <span>{currentDifficulty}</span>
              {difficultyDecision && difficultyDecision.direction !== 'MAINTAIN' && (
                <span style={{ fontSize: '8.5px', opacity: 0.8 }}>
                  ({difficultyDecision.direction})
                </span>
              )}
            </div>
          )}
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-label="Dismiss AI Tutor HUD"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Grounded Adaptive Intervention Indicator (EGEA) */}
      {egeaDecision && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '8px',
            padding: '4px 8px',
            fontSize: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ fontWeight: 800, color: '#38bdf8' }}>EGEA:</span>
            <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{egeaDecision.interventionType.replace(/_/g, ' ')}</span>
            <span style={{ color: '#94a3b8', fontSize: '9px' }}>({egeaDecision.rationaleCode})</span>
          </div>
          <span style={{ color: '#34d399', fontWeight: 700, fontSize: '9px' }}>
            {Math.round(egeaDecision.confidence * 100)}% conf
          </span>
        </div>
      )}

      {/* Body: Thinking State or Response */}
      {isThinking ? (
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 10px',
            background: 'rgba(30, 41, 59, 0.4)',
            borderRadius: '10px',
            border: '1px dashed rgba(56, 189, 248, 0.4)'
          }}
        >
          <div 
            style={{
              width: '16px',
              height: '16px',
              border: '2px solid rgba(56, 189, 248, 0.2)',
              borderTopColor: 'var(--accent-cyan)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite'
            }}
          />
          <div style={{ fontSize: '11.5px', color: '#38bdf8', fontWeight: 600 }}>
            Orchestrating specialized agents for node {currentNodeValue ?? 'active'}...
          </div>
        </div>
      ) : activeDiagnostic ? (
        /* Formative Diagnostic Check Modal from Assessment Agent */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', animation: 'fadeIn 200ms ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <HelpCircle size={13} color="#fbbf24" />
              Diagnostic Check ({activeDiagnostic.difficulty})
            </span>
            <button
              onClick={() => setActiveDiagnostic(null)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '10px', cursor: 'pointer' }}
            >
              Return to AR
            </button>
          </div>
          <div style={{ fontSize: '12px', color: '#f1f5f9', fontWeight: 600, lineHeight: 1.35 }}>
            {activeDiagnostic.question}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '2px' }}>
            {activeDiagnostic.options.map((opt, idx) => {
              const isChosen = diagnosticSelected === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setDiagnosticSelected(idx)}
                  style={{
                    background: isChosen 
                      ? (opt.isCorrect ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)')
                      : 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${isChosen ? (opt.isCorrect ? '#34d399' : '#f87171') : 'rgba(255, 255, 255, 0.1)'}`,
                    borderRadius: '8px',
                    padding: '6px 10px',
                    textAlign: 'left',
                    color: '#f8fafc',
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{opt.text}</span>
                  {isChosen && opt.explanation && (
                    <div style={{ fontSize: '10px', color: opt.isCorrect ? '#34d399' : '#fca5a5', marginTop: '3px' }}>
                      {opt.explanation}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : response ? (
        <>
          {/* Multi-Agent Orchestrated Pattern Notice if repeated misconception */}
          {orchestrationResult?.misconceptionAnalysis && orchestrationResult.misconceptionAnalysis.recurrence !== 'NONE' && (
            <div 
              style={{
                background: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                borderRadius: '8px',
                padding: '6px 10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px'
              }}
            >
              <div style={{ fontSize: '10.5px', color: '#fbbf24', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <AlertTriangle size={12} color="#fbbf24" />
                <span>Pattern: {orchestrationResult.misconceptionAnalysis.recurrence} direction errors</span>
              </div>
              {orchestrationResult.assessmentQuestion && (
                <button
                  onClick={() => {
                    setActiveDiagnostic(orchestrationResult.assessmentQuestion!);
                    setDiagnosticSelected(null);
                  }}
                  className="btn btn-secondary"
                  style={{ padding: '2px 8px', fontSize: '10px', fontWeight: 700 }}
                >
                  Try Diagnostic
                </button>
              )}
            </div>
          )}

          {/* Badge & Deterministic Invariant Box */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
            {badgeConfig && (
              <span
                style={{
                  fontSize: '10.5px',
                  fontWeight: 700,
                  color: badgeConfig.color,
                  background: badgeConfig.bg,
                  border: `1px solid ${badgeConfig.border}`,
                  padding: '2px 8px',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                {badgeConfig.icon}
                {badgeConfig.label}
              </span>
            )}

            {currentNodeValue !== null && (
              <span style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'monospace' }}>
                Comparison: {activeTarget} {activeTarget < currentNodeValue ? '<' : '>'} {currentNodeValue}
              </span>
            )}
          </div>

          {/* AI Guidance Message */}
          <div 
            style={{
              fontSize: '12.5px',
              color: '#f1f5f9',
              lineHeight: 1.45,
              fontWeight: 500,
              background: 'rgba(15, 23, 42, 0.55)',
              padding: '10px 12px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}
          >
            {response.message}
          </div>

          {/* Collapsible Reasoning & Concept */}
          {response.reasoning && (
            <div>
              <button
                onClick={() => setShowReasoning(!showReasoning)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                <ChevronRight 
                  size={12} 
                  style={{ transform: showReasoning ? 'rotate(90deg)' : 'none', transition: 'transform 150ms ease' }} 
                />
                Pedagogical Reasoning ({response.concept})
              </button>

              {showReasoning && (
                <div 
                  style={{
                    fontSize: '10.5px',
                    color: '#94a3b8',
                    fontStyle: 'italic',
                    padding: '6px 8px',
                    background: 'rgba(0, 0, 0, 0.25)',
                    borderRadius: '6px',
                    marginTop: '4px'
                  }}
                >
                  {response.reasoning}
                </div>
              )}
            </div>
          )}

          {/* Suggested Next Action & Interaction Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px', gap: '8px' }}>
            {response.nextAction && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>AI Suggestion:</span>
                <button
                  onClick={() => onSelectSuggestion?.(response.nextAction!)}
                  style={{
                    fontSize: '10.5px',
                    fontWeight: 700,
                    color: '#38bdf8',
                    background: 'rgba(56, 189, 248, 0.12)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                  title="Suggestion only; will be evaluated by BSTPracticeEngine"
                >
                  {response.nextAction.replace('_', ' ')}
                </button>
              </div>
            )}

            {orchestrationResult?.recommendation && (
              <div 
                style={{
                  fontSize: '10px',
                  color: '#a78bfa',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'rgba(139, 92, 246, 0.12)',
                  border: '1px solid rgba(139, 92, 246, 0.25)',
                  padding: '2px 8px',
                  borderRadius: '6px'
                }}
                title={orchestrationResult.recommendation.rationale}
              >
                <span>Rec: {orchestrationResult.recommendation.targetTopicTitle}</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto' }}>
              {onRetryDecision && response.responseType === 'MISTAKE_EXPLANATION' && (
                <button
                  onClick={onRetryDecision}
                  className="btn btn-secondary"
                  style={{ fontSize: '10.5px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <RotateCcw size={12} />
                  Try Again
                </button>
              )}

              <button
                onClick={onRequestHint}
                className="btn btn-secondary"
                style={{ fontSize: '10.5px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Lightbulb size={12} />
                Ask Hint
              </button>
            </div>
          </div>
        </>
      ) : (
        /* Standby state before any AI trigger */
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: '#e2e8f0', lineHeight: 1.4 }}>
            {egeaDecision?.explanationText || `Comparing target ${activeTarget} with node ${currentNodeValue ?? 'active'}. Need guidance?`}
          </span>
          <button
            onClick={onRequestHint}
            className="btn btn-secondary"
            style={{ fontSize: '10.5px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}
          >
            <Lightbulb size={12} />
            Ask Hint
          </button>
        </div>
      )}
    </aside>
  );
};
