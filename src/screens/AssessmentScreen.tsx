import React, { useState, useEffect } from 'react';
import { useApp } from '../state/AppContext';
import { HeaderBar } from '../components/HeaderBar';
import { ProgressBar } from '../components/ProgressBar';
import { DiagnosticQuestion } from '../services/ai/IAIService';
import { 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Award,
  Sparkles
} from 'lucide-react';

export const AssessmentScreen: React.FC = () => {
  const { selectedTopic, services, navigateTo, refreshLearnerState } = useApp();
  const [questions, setQuestions] = useState<DiagnosticQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true);
      const qList = await services.aiService.generateDiagnosticQuestions(selectedTopic, 5);
      setQuestions(qList);
      setIsLoading(false);
    };
    fetchQuestions();
  }, [selectedTopic, services]);

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;
    setIsAnswerSubmitted(true);

    const isCorrect = selectedOption === questions[currentIndex].correctOptionIndex;
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    }

    // Record quiz telemetry in AnalyticsService
    services.analyticsService.recordQuizAttempt({
      topicId: selectedTopic.id,
      questionId: questions[currentIndex].id,
      selectedOptionIndex: selectedOption,
      isCorrect,
      responseTimeMs: 8200,
      hintUsed: false
    });
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      // Finished all questions
      setIsComplete(true);
      const scorePct = Math.round(((correctCount + (selectedOption === questions[currentIndex].correctOptionIndex ? 1 : 0)) / questions.length) * 100);

      await services.learnerService.recordAssessmentResult({
        id: `asmt-${Date.now()}`,
        topicId: selectedTopic.id,
        timestamp: new Date().toISOString(),
        totalQuestions: questions.length,
        correctCount: correctCount + (selectedOption === questions[currentIndex].correctOptionIndex ? 1 : 0),
        scorePercentage: scorePct,
        timeSpentSeconds: 65,
        conceptWeaknesses: scorePct < 70 ? ['asymptotic-invariants'] : []
      });

      await refreshLearnerState();
    }
  };

  if (isLoading) {
    return (
      <div className="mobile-screen-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <HeaderBar title="Assessment" showBack />
        <div style={{ textAlign: 'center', color: 'var(--accent-cyan)' }}>
          <Sparkles size={24} />
          <p style={{ marginTop: '8px', fontSize: '13px' }}>Generating diagnostic questions...</p>
        </div>
      </div>
    );
  }

  if (isComplete) {
    const finalScore = Math.round((correctCount / questions.length) * 100);
    const passed = finalScore >= 70;

    return (
      <div className="mobile-screen-content">
        <HeaderBar title="Assessment Complete" showBack />
        <div style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 'var(--space-4)' }}>
          <div
            style={{
              width: '90px',
              height: '90px',
              borderRadius: '24px',
              background: passed ? 'var(--success-dim)' : 'var(--warning-dim)',
              border: `2px solid ${passed ? 'var(--success)' : 'var(--warning)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <Award size={44} color={passed ? 'var(--success)' : 'var(--warning)'} />
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: 800 }}>
            {passed ? 'Concept Validated!' : 'Review Recommended'}
          </h2>

          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            You scored <strong style={{ color: 'var(--text-primary)' }}>{finalScore}%</strong> ({correctCount}/{questions.length} correct) for <strong>{selectedTopic.title}</strong>.
          </p>

          <div className="card" style={{ width: '100%', padding: '14px', textAlign: 'left' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              Learner State Impact
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
              {passed ? (
                <span style={{ color: 'var(--success)' }}>✓ Mastery increased & downstream dependent concepts unlocked!</span>
              ) : (
                <span style={{ color: 'var(--warning)' }}>Concept retention flagged for adaptive spaced repetition.</span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginTop: '8px' }}>
            <button
              onClick={() => navigateTo('progress')}
              className="btn btn-primary btn-full"
            >
              View Updated Analytics & Mastery
            </button>
            <button
              onClick={() => navigateTo('home')}
              className="btn btn-secondary btn-full"
            >
              Return to Dashboard
            </button>
            <button
              onClick={() => {
                setIsComplete(false);
                setCurrentIndex(0);
                setSelectedOption(null);
                setIsAnswerSubmitted(false);
                setCorrectCount(0);
              }}
              className="btn btn-ghost btn-full"
              style={{ gap: '6px' }}
            >
              <RotateCcw size={14} /> Retake Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const isCorrectChoice = selectedOption === currentQ.correctOptionIndex;

  const getCategoryDetails = (cat?: string) => {
    switch (cat) {
      case 'conceptual':
        return { label: 'Conceptual Invariant', badge: 'badge-purple' };
      case 'prediction':
        return { label: 'Structure Prediction', badge: 'badge-cyan' };
      case 'sequence':
        return { label: 'Trace Sequence', badge: 'badge-amber' };
      case 'error_detection':
        return { label: 'Invariant Violation Check', badge: 'badge-rose' };
      case 'operation_reasoning':
        return { label: 'Algorithmic Reasoning', badge: 'badge-emerald' };
      default:
        return { label: 'Diagnostic Check', badge: 'badge-purple' };
    }
  };

  const catDetails = getCategoryDetails(currentQ.category);

  return (
    <div className="mobile-screen-content">
      <HeaderBar
        title={`${selectedTopic.title} Quiz`}
        showBack
      />

      <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Question Counter & Progress */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span>{Math.round(((currentIndex + 1) / questions.length) * 100)}%</span>
          </div>
          <ProgressBar progressPercentage={((currentIndex + 1) / questions.length) * 100} color="purple" height={5} />
        </div>

        {/* Question Card */}
        <div className="card" style={{ padding: '16px' }}>
          <span className={`badge ${catDetails.badge}`} style={{ marginBottom: '8px' }}>
            {catDetails.label}
          </span>
          <h3 style={{ fontSize: '15.5px', fontWeight: 700, lineHeight: 1.4, color: 'var(--text-primary)' }}>
            {currentQ.question}
          </h3>
        </div>

        {/* Options List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {currentQ.options.map((opt, i) => {
            const isSelected = selectedOption === i;
            let borderStyle = 'var(--border-card)';
            let bgStyle = 'var(--bg-card)';

            if (isAnswerSubmitted) {
              if (i === currentQ.correctOptionIndex) {
                borderStyle = 'var(--success)';
                bgStyle = 'var(--success-dim)';
              } else if (isSelected && !isCorrectChoice) {
                borderStyle = 'var(--danger)';
                bgStyle = 'var(--danger-dim)';
              }
            } else if (isSelected) {
              borderStyle = 'var(--accent-cyan)';
              bgStyle = 'var(--accent-cyan-dim)';
            }

            return (
              <button
                key={i}
                onClick={() => handleSelectOption(i)}
                className="card card-interactive"
                style={{
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  textAlign: 'left',
                  border: `1.5px solid ${borderStyle}`,
                  background: bgStyle,
                  transition: 'all 150ms ease'
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: '1.5px solid var(--border-card)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: isSelected ? 'var(--accent-cyan)' : 'var(--text-tertiary)'
                  }}
                >
                  {String.fromCharCode(65 + i)}
                </div>
                <span style={{ fontSize: '13px', color: 'var(--text-primary)', flex: 1 }}>
                  {opt}
                </span>
                {isAnswerSubmitted && i === currentQ.correctOptionIndex && (
                  <CheckCircle2 size={18} color="var(--success)" />
                )}
                {isAnswerSubmitted && isSelected && !isCorrectChoice && (
                  <XCircle size={18} color="var(--danger)" />
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback / Explanation Box (Visible once submitted) */}
        {isAnswerSubmitted && (
          <div
            className="card"
            style={{
              padding: '12px 14px',
              borderLeft: `3px solid ${isCorrectChoice ? 'var(--success)' : 'var(--danger)'}`,
              background: isCorrectChoice ? 'var(--success-dim)' : 'var(--danger-dim)'
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: isCorrectChoice ? 'var(--success)' : 'var(--danger)', marginBottom: '4px' }}>
              {isCorrectChoice ? '✓ Correct Rationale' : '✗ Misconception Analysis'}
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-primary)', margin: 0, lineHeight: 1.45 }}>
              {currentQ.explanation}
            </p>
          </div>
        )}

        {/* Next / Submit Button */}
        <div style={{ marginTop: '8px' }}>
          {!isAnswerSubmitted ? (
            <button
              onClick={handleSubmitAnswer}
              className="btn btn-primary btn-full"
              disabled={selectedOption === null}
            >
              Verify Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="btn btn-primary btn-full"
              style={{ gap: '6px' }}
            >
              <span>{currentIndex < questions.length - 1 ? 'Next Question' : 'Complete Quiz'}</span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
