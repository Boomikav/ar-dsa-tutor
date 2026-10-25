import React, { useState } from 'react';
import { useApp } from '../state/AppContext';
import { HeaderBar } from '../components/HeaderBar';
import { ProgressBar } from '../components/ProgressBar';
import { CheckCircle2, XCircle, ArrowRight, BrainCircuit, Sparkles, Award } from 'lucide-react';
import { AdaptiveDifficultyLevel } from '../models/adaptiveLearner';

interface DiagnosticQuestionItem {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  conceptArea: string;
}

const BST_DIAGNOSTIC_QUESTIONS: DiagnosticQuestionItem[] = [
  {
    id: 'diag-bst-1',
    question: 'In a Binary Search Tree (BST), if the target value to insert is strictly smaller than the current node value, which child must you visit next?',
    options: ['Left child', 'Right child', 'Parent node', 'Root node'],
    correctOptionIndex: 0,
    explanation: 'In a standard BST, the fundamental invariant is that all keys in the left subtree are strictly less than the node key.',
    conceptArea: 'BST Directional Invariant'
  },
  {
    id: 'diag-bst-2',
    question: 'Given a BST root node with key 50, and you want to insert 65. If node 50 has no right child, what is the correct action?',
    options: [
      'Attach 65 as the left child of 50',
      'Attach 65 as the right child of 50',
      'Replace node 50 with 65',
      'Discard 65 as an invalid key'
    ],
    correctOptionIndex: 1,
    explanation: 'Since 65 > 50 and the right child position is empty (null), 65 becomes the new right child of 50.',
    conceptArea: 'BST Leaf Insertion'
  },
  {
    id: 'diag-bst-3',
    question: 'Which tree traversal order visits the keys of a Binary Search Tree in strictly ascending sorted order?',
    options: ['Pre-order traversal', 'In-order traversal', 'Post-order traversal', 'Level-order traversal'],
    correctOptionIndex: 1,
    explanation: 'In-order traversal (Left Subtree -> Root -> Right Subtree) visits BST elements in strictly non-decreasing sorted order.',
    conceptArea: 'BST Ordering Properties'
  },
  {
    id: 'diag-bst-4',
    question: 'Suppose you search for key 25 in a BST. Root is 40 -> Left is 20 -> Right is 30. Between which nodes does 25 belong?',
    options: [
      'As the left child of 20',
      'As the left child of 30',
      'As the right child of 40',
      'As the right child of 30'
    ],
    correctOptionIndex: 1,
    explanation: '25 < 40 (go left to 20); 25 > 20 (go right to 30); 25 < 30 (left child of 30).',
    conceptArea: 'Multi-step Traversal Decision'
  },
  {
    id: 'diag-bst-5',
    question: 'What is the average-case time complexity of inserting an element into a balanced Binary Search Tree containing N nodes?',
    options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
    correctOptionIndex: 1,
    explanation: 'Each comparison in a balanced BST halves the remaining search space, resulting in O(log N) average-case time complexity.',
    conceptArea: 'Asymptotic Complexity'
  }
];

export const DiagnosticScreen: React.FC = () => {
  const { navigateTo, services, refreshLearnerState, setHasCompletedDiagnostic } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<boolean[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [assignedDifficulty, setAssignedDifficulty] = useState<AdaptiveDifficultyLevel>('EASY');
  const [finalScore, setFinalScore] = useState(0);

  const currentQ = BST_DIAGNOSTIC_QUESTIONS[currentIndex];
  const totalQuestions = BST_DIAGNOSTIC_QUESTIONS.length;

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;
    const isCorrect = selectedOption === currentQ.correctOptionIndex;
    setIsAnswerSubmitted(true);
    setUserAnswers(prev => [...prev, isCorrect]);
  };

  const handleNextQuestion = async () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      // Diagnostic complete - calculate deterministic outcome
      const correctCount = userAnswers.filter(Boolean).length;
      const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
      setFinalScore(scorePercentage);

      // Determine initial difficulty level based on diagnostic score
      let initialDiff: AdaptiveDifficultyLevel = 'FOUNDATIONAL';
      if (scorePercentage >= 80) {
        initialDiff = 'MEDIUM';
      } else if (scorePercentage >= 60) {
        initialDiff = 'EASY';
      } else {
        initialDiff = 'FOUNDATIONAL';
      }
      setAssignedDifficulty(initialDiff);

      // Record performance evidence in authoritative learner service
      await services.learnerService.recordAssessmentResult({
        id: `diag-asmt-${Date.now()}`,
        topicId: 'ds-binary-search-tree',
        timestamp: new Date().toISOString(),
        totalQuestions,
        correctCount,
        scorePercentage,
        timeSpentSeconds: 90,
        conceptWeaknesses: scorePercentage < 60 ? ['BST Directional Invariant'] : []
      });

      await services.learnerService.recordPerformanceEvidence({
        topicId: 'ds-binary-search-tree',
        eventType: 'ASSESSMENT_ATTEMPT',
        correct: scorePercentage >= 60,
        difficulty: 'FOUNDATIONAL',
        usedHint: false,
        requestedExplanation: false,
        misconceptionDetected: scorePercentage < 60,
        assessmentScore: scorePercentage
      });

      // Update topic difficulty
      await services.learnerService.updateTopicDifficulty('ds-binary-search-tree', initialDiff);

      setHasCompletedDiagnostic(true);
      await refreshLearnerState();
      setIsComplete(true);
    }
  };

  if (isComplete) {
    return (
      <div className="mobile-screen-content" style={{ background: 'var(--bg-primary)' }}>
        <HeaderBar title="Diagnostic Results" />

        <div style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', textAlign: 'center' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(14, 165, 233, 0.2) 100%)',
              border: '1px solid var(--accent-emerald)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: 'var(--space-4) auto 0'
            }}
          >
            <Award size={40} color="var(--accent-emerald)" />
          </div>

          <div>
            <span className="badge badge-emerald" style={{ marginBottom: '8px' }}>
              DIAGNOSTIC COMPLETE
            </span>
            <h2 style={{ fontSize: '22px', fontWeight: 800 }}>Baseline Evaluated</h2>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Your preliminary BST conceptual baseline has been recorded into the adaptive learner model.
            </p>
          </div>

          <div
            className="card"
            style={{
              padding: '16px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              textAlign: 'center'
            }}
          >
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                Diagnostic Score
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                {finalScore}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                Starting Difficulty
              </div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-purple)' }}>
                {assignedDifficulty}
              </div>
            </div>
          </div>

          <div
            style={{
              padding: '14px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <BrainCircuit size={15} color="var(--accent-cyan)" />
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Adaptive Learning Path Recommendation
              </span>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              {finalScore >= 80
                ? 'Strong understanding of BST invariants. We recommend starting with Medium practice with multi-step insertions and AR spatial verification.'
                : finalScore >= 60
                ? 'Solid foundational intuition. We recommend starting at Easy difficulty to reinforce edge-case comparisons.'
                : 'Foundational concepts need reinforcement. We have prepared guided step-by-step invariant traces and visual tree practice.'}
            </p>
          </div>

          <button
            onClick={() => navigateTo('home')}
            className="btn btn-primary btn-lg"
            style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <span>Continue to Home Dashboard</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  const isCorrect = isAnswerSubmitted && selectedOption === currentQ.correctOptionIndex;

  return (
    <div className="mobile-screen-content" style={{ background: 'var(--bg-primary)' }}>
      <HeaderBar
        title="First-Use Diagnostic"
        rightAction={
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600 }}>
            {currentIndex + 1} of {totalQuestions}
          </span>
        }
      />

      <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', flex: 1 }}>
        {/* Topic & Coverage Banner */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent-cyan)', fontWeight: 700 }}>
              BST Diagnostic • Vertical Slice
            </span>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
              Question {currentIndex + 1} of {totalQuestions}
            </h3>
          </div>
          <span className="badge badge-purple" style={{ fontSize: '10px' }}>
            {currentQ.conceptArea}
          </span>
        </div>

        <ProgressBar
          progressPercentage={((currentIndex + 1) / totalQuestions) * 100}
          height={6}
          color="cyan"
        />

        {/* Question Prompt */}
        <div
          className="card"
          style={{
            padding: '16px',
            fontSize: '14.5px',
            lineHeight: 1.5,
            fontWeight: 600,
            color: 'var(--text-primary)',
            background: 'var(--bg-card)'
          }}
        >
          {currentQ.question}
        </div>

        {/* Options List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            let borderStyle = '1px solid var(--border-card)';
            let bgStyle = 'var(--bg-card)';

            if (isAnswerSubmitted) {
              if (idx === currentQ.correctOptionIndex) {
                borderStyle = '1px solid var(--accent-emerald)';
                bgStyle = 'rgba(16, 185, 129, 0.15)';
              } else if (isSelected) {
                borderStyle = '1px solid var(--accent-rose)';
                bgStyle = 'rgba(239, 68, 68, 0.15)';
              }
            } else if (isSelected) {
              borderStyle = '1px solid var(--accent-cyan)';
              bgStyle = 'var(--accent-cyan-dim)';
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                disabled={isAnswerSubmitted}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-lg)',
                  background: bgStyle,
                  border: borderStyle,
                  color: 'var(--text-primary)',
                  textAlign: 'left',
                  cursor: isAnswerSubmitted ? 'default' : 'pointer',
                  transition: 'all 150ms ease'
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: isSelected ? 'var(--accent-cyan)' : 'var(--bg-tertiary)',
                    color: isSelected ? '#000' : 'var(--text-secondary)'
                  }}
                >
                  {String.fromCharCode(65 + idx)}
                </div>
                <span style={{ fontSize: '13.5px', flex: 1 }}>{option}</span>
                {isAnswerSubmitted && idx === currentQ.correctOptionIndex && (
                  <CheckCircle2 size={18} color="var(--accent-emerald)" />
                )}
                {isAnswerSubmitted && isSelected && idx !== currentQ.correctOptionIndex && (
                  <XCircle size={18} color="var(--accent-rose)" />
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback Section when submitted */}
        {isAnswerSubmitted && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              background: isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${isCorrect ? 'var(--accent-emerald)' : 'var(--accent-rose)'}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '13px', color: isCorrect ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
              {isCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              <span>{isCorrect ? 'Correct Decision' : 'Conceptual Misunderstanding'}</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
              {currentQ.explanation}
            </p>
          </div>
        )}

        {/* Action Button */}
        <div style={{ marginTop: 'auto', paddingTop: 'var(--space-2)' }}>
          {!isAnswerSubmitted ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedOption === null}
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <span>{currentIndex < totalQuestions - 1 ? 'Next Question' : 'Complete Diagnostic'}</span>
              <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
