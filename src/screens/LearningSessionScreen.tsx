import React, { useState, useEffect } from 'react';
import { useApp } from '../state/AppContext';
import { HeaderBar } from '../components/HeaderBar';
import { ProgressBar } from '../components/ProgressBar';
import { BSTVisualizer } from '../components/dsa/BSTVisualizer';
import { DSAUnifiedVisualizer } from '../components/dsa/DSAUnifiedVisualizer';
import { BSTEngine } from '../services/dsa/bst/BSTEngine';
import { BSTPracticeEngine, PracticeSessionState } from '../services/dsa/bst/BSTPracticeEngine';
import { DSARegistry } from '../services/dsa/core/DSARegistry';
import { DSAGuidedStep, DSAPracticeSession } from '../services/dsa/core/IDSALearningEngine';
import { BSTNode, BSTOperationStep } from '../models/bst';
import { MisconceptionDiagnosis } from '../models/misconception';
import { TopicRelationshipSummary } from '../services/knowledgeGraph/IKnowledgeGraphService';
import { AdaptiveDifficultyEngine } from '../services/adaptive/AdaptiveDifficultyEngine';
import { 
  Box, 
  CheckCircle2, 
  RotateCcw,
  Layers,
  ArrowRight,
  GitFork,
  AlertTriangle,
  Lightbulb,
  Check,
  Bot,
  RefreshCw,
  Play
} from 'lucide-react';

export const LearningSessionScreen: React.FC = () => {
  const { selectedTopic, navigateTo, navigateToTutor, learnerState, services, refreshLearnerState } = useApp();
  const [activeTab, setActiveTab] = useState<'guided' | 'practice' | 'theory'>('guided');

  const isBST = selectedTopic.id === 'ds-binary-search-tree';
  const engine = DSARegistry.getEngine(selectedTopic.id);

  // BST Guided Lesson State (Phases 2-8 Reference)
  const [guidedTree, setGuidedTree] = useState<BSTNode>(() => BSTEngine.createSampleTree());
  const [guidedSteps, setGuidedSteps] = useState<BSTOperationStep[]>([]);
  const [guidedStepIndex, setGuidedStepIndex] = useState(0);

  // Generic Guided Lesson State (Phase 9 Multi-Topic)
  const [genericGuidedSteps, setGenericGuidedSteps] = useState<DSAGuidedStep[]>([]);
  const [genericGuidedIndex, setGenericGuidedIndex] = useState(0);

  // AI Support State
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // BST Practice Mode State (Phases 2-8 Reference)
  const [practiceSession, setPracticeSession] = useState<PracticeSessionState>(() => 
    BSTPracticeEngine.startSession(undefined, 40)
  );

  // Generic Practice Mode State (Phase 9 Multi-Topic)
  const [genericPracticeSession, setGenericPracticeSession] = useState<DSAPracticeSession | null>(null);

  // Unified Feedback State
  const [practiceFeedback, setPracticeFeedback] = useState<{
    message: string;
    isCorrect: boolean;
    diagnosis: MisconceptionDiagnosis | null;
  } | null>(null);

  // Knowledge Graph relationships
  const [relSummary, setRelSummary] = useState<TopicRelationshipSummary | null>(null);

  // Synchronize on topic change (CRITICAL STATE ISOLATION)
  useEffect(() => {
    // Reset all ephemeral session feedback to guarantee zero leakage between topics
    setAiExplanation(null);
    setPracticeFeedback(null);
    setGuidedStepIndex(0);
    setGenericGuidedIndex(0);

    const currentDiff = learnerState.masteryMap[selectedTopic.id]?.currentDifficulty || 'MEDIUM';

    if (selectedTopic.id === 'ds-binary-search-tree') {
      const sample = BSTEngine.createSampleTree();
      setGuidedTree(sample);
      const res = BSTEngine.insert(sample, 40);
      setGuidedSteps(res.steps);
      setPracticeSession(BSTPracticeEngine.startSession(undefined, 40));
      setGenericPracticeSession(null);
      setGenericGuidedSteps([]);
    } else {
      const eng = DSARegistry.getEngine(selectedTopic.id);
      if (eng) {
        if (eng.getGuidedSteps) {
          setGenericGuidedSteps(eng.getGuidedSteps());
        } else {
          setGenericGuidedSteps([]);
        }

        if (eng.startPracticeSession) {
          setGenericPracticeSession(eng.startPracticeSession(currentDiff));
        } else {
          setGenericPracticeSession(null);
        }
      }
    }

    services.knowledgeGraphService.getRelationshipsForTopic(selectedTopic.id).then(summary => {
      setRelSummary(summary);
    });
  }, [selectedTopic.id, services]);

  // Guided Lesson Step Controls
  const handleGuidedNext = () => {
    if (isBST) {
      if (guidedStepIndex < guidedSteps.length - 1) {
        const nextIdx = guidedStepIndex + 1;
        setGuidedStepIndex(nextIdx);
        if (guidedSteps[nextIdx].treeSnapshot) {
          setGuidedTree(guidedSteps[nextIdx].treeSnapshot!);
        }
      }
    } else {
      if (genericGuidedIndex < genericGuidedSteps.length - 1) {
        setGenericGuidedIndex(genericGuidedIndex + 1);
      }
    }
  };

  const handleGuidedPrev = () => {
    if (isBST) {
      if (guidedStepIndex > 0) {
        const prevIdx = guidedStepIndex - 1;
        setGuidedStepIndex(prevIdx);
        if (guidedSteps[prevIdx].treeSnapshot) {
          setGuidedTree(guidedSteps[prevIdx].treeSnapshot!);
        }
      }
    } else {
      if (genericGuidedIndex > 0) {
        setGenericGuidedIndex(genericGuidedIndex - 1);
      }
    }
  };

  const handleResetGuided = () => {
    setAiExplanation(null);
    if (isBST) {
      const sample = BSTEngine.createSampleTree();
      setGuidedTree(sample);
      const res = BSTEngine.insert(sample, 40);
      setGuidedSteps(res.steps);
      setGuidedStepIndex(0);
    } else {
      setGenericGuidedIndex(0);
      const eng = DSARegistry.getEngine(selectedTopic.id);
      if (eng && eng.getGuidedSteps) {
        setGenericGuidedSteps(eng.getGuidedSteps());
      }
    }
  };

  // AI Socratic Explanation / Hint in Guided Mode
  const handleAskAIExplain = async () => {
    setIsAiLoading(true);
    let stepMsg: string | undefined;
    if (isBST) {
      const step = guidedSteps[guidedStepIndex];
      stepMsg = step?.message;
    } else {
      const step = genericGuidedSteps[genericGuidedIndex];
      stepMsg = step ? `${step.title}: ${step.description}. ${step.invariantExplanation}` : undefined;
    }

    const explanation = await services.aiService.explainConcept({
      topic: selectedTopic,
      learnerState,
      stepContext: stepMsg
    });
    setAiExplanation(explanation);
    setIsAiLoading(false);
  };

  const handleAskAIHint = async () => {
    setIsAiLoading(true);
    let hint: string;
    if (isBST) {
      const step = guidedSteps[guidedStepIndex];
      hint = await services.aiService.requestHint({
        topic: selectedTopic,
        currentStepIndex: guidedStepIndex,
        currentNodeValue: step?.currentNodeValue || undefined,
        targetValue: step?.targetValue || 40
      });
    } else {
      hint = await services.aiService.requestHint({
        topic: selectedTopic,
        currentStepIndex: genericGuidedIndex,
        currentNodeValue: undefined,
        targetValue: undefined
      });
    }
    setAiExplanation(hint);
    setIsAiLoading(false);
  };

  // Practice Mode Decision Evaluator: BST
  const handleBSTPracticeDecision = async (choice: 'LEFT' | 'RIGHT' | 'INSERT_HERE') => {
    const evalResult = await BSTPracticeEngine.evaluateDecision(
      practiceSession,
      choice,
      services.analyticsService
    );

    setPracticeSession(evalResult.session);
    setPracticeFeedback({
      message: evalResult.feedbackMessage,
      isCorrect: evalResult.isCorrect,
      diagnosis: evalResult.diagnosis
    });

    if (services.learnerService.recordPerformanceEvidence) {
      await services.learnerService.recordPerformanceEvidence({
        topicId: selectedTopic.id,
        eventType: 'PRACTICE_ATTEMPT',
        correct: evalResult.isCorrect,
        difficulty: learnerState.masteryMap[selectedTopic.id]?.currentDifficulty || 'MEDIUM',
        usedHint: false,
        requestedExplanation: false,
        misconceptionDetected: !evalResult.isCorrect,
        misconceptionType: evalResult.diagnosis?.type as any
      });
    }

    if (evalResult.session.isComplete) {
      await services.learnerService.recordPracticeCompletion(
        selectedTopic.id,
        evalResult.session.mistakesCount,
        evalResult.session.scorePercentage
      );
      await refreshLearnerState();
    }
  };

  // Practice Mode Decision Evaluator: Generic DSA Engine
  const handleGenericPracticeDecision = async (userDecision: any) => {
    if (!engine || !genericPracticeSession) return;
    const currentDiff = learnerState.masteryMap[selectedTopic.id]?.currentDifficulty || 'MEDIUM';

    if (engine.evaluatePracticeStep) {
      const { updatedSession, validation } = engine.evaluatePracticeStep(genericPracticeSession, userDecision);
      setGenericPracticeSession(updatedSession);
      setPracticeFeedback({
        message: validation.feedbackMessage,
        isCorrect: validation.isCorrect,
        diagnosis: validation.misconception || null
      });

      if (services.learnerService.recordPerformanceEvidence) {
        await services.learnerService.recordPerformanceEvidence({
          topicId: selectedTopic.id,
          eventType: 'PRACTICE_ATTEMPT',
          correct: validation.isCorrect,
          difficulty: currentDiff,
          usedHint: false,
          requestedExplanation: false,
          misconceptionDetected: !validation.isCorrect,
          misconceptionType: validation.misconception?.type as any
        });
      }

      if (updatedSession.isComplete) {
        const score = updatedSession.mistakesCount === 0 ? 100 : Math.max(0, 100 - updatedSession.mistakesCount * 25);
        await services.learnerService.recordPracticeCompletion(
          selectedTopic.id,
          updatedSession.mistakesCount,
          score
        );
        await refreshLearnerState();
      }
    } else {
      const validation = engine.validateStep(genericPracticeSession.currentState, userDecision);
      const isCorrect = validation.isCorrect;
      let nextState = genericPracticeSession.currentState;
      if (isCorrect) {
        const opRes = engine.applyOperation(genericPracticeSession.currentState, userDecision);
        nextState = opRes.newState;
      }
      const updated: DSAPracticeSession = {
        ...genericPracticeSession,
        currentState: nextState,
        mistakesCount: isCorrect ? genericPracticeSession.mistakesCount : genericPracticeSession.mistakesCount + 1,
        stepIndex: genericPracticeSession.stepIndex + 1,
        isComplete: genericPracticeSession.stepIndex + 1 >= genericPracticeSession.maxSteps
      };
      setGenericPracticeSession(updated);
      setPracticeFeedback({
        message: validation.feedbackMessage,
        isCorrect,
        diagnosis: validation.misconception || null
      });

      if (services.learnerService.recordPerformanceEvidence) {
        await services.learnerService.recordPerformanceEvidence({
          topicId: selectedTopic.id,
          eventType: 'PRACTICE_ATTEMPT',
          correct: isCorrect,
          difficulty: currentDiff,
          usedHint: false,
          requestedExplanation: false,
          misconceptionDetected: !isCorrect,
          misconceptionType: validation.misconception?.type as any
        });
      }

      if (updated.isComplete) {
        const score = updated.mistakesCount === 0 ? 100 : Math.max(0, 100 - updated.mistakesCount * 25);
        await services.learnerService.recordPracticeCompletion(
          selectedTopic.id,
          updated.mistakesCount,
          score
        );
        await refreshLearnerState();
      }
    }
  };

  const handleRestartPractice = () => {
    setPracticeFeedback(null);
    if (isBST) {
      setPracticeSession(BSTPracticeEngine.startSession(undefined, 40));
    } else {
      const eng = DSARegistry.getEngine(selectedTopic.id);
      const currentDiff = learnerState.masteryMap[selectedTopic.id]?.currentDifficulty || 'MEDIUM';
      if (eng && eng.startPracticeSession) {
        setGenericPracticeSession(eng.startPracticeSession(currentDiff));
      }
    }
  };

  const currentGuidedStep = isBST ? guidedSteps[guidedStepIndex] : genericGuidedSteps[genericGuidedIndex];
  const mastery = learnerState.masteryMap[selectedTopic.id]?.masteryPercentage || 0;
  const currentDifficulty = learnerState.masteryMap[selectedTopic.id]?.currentDifficulty || 'MEDIUM';
  const taskSpec = AdaptiveDifficultyEngine.getTaskSpecification(currentDifficulty, selectedTopic.id);

  // Determine visualization data for Guided Mode
  const guidedVisData = isBST 
    ? guidedTree 
    : (engine && genericGuidedSteps[genericGuidedIndex] ? engine.getVisualizationData(genericGuidedSteps[genericGuidedIndex].stateSnapshot) : null);

  // Determine visualization data for Practice Mode
  const practiceVisData = isBST
    ? practiceSession.currentTree
    : (engine && genericPracticeSession ? engine.getVisualizationData(genericPracticeSession.currentState) : null);

  return (
    <div className="mobile-screen-content">
      <HeaderBar
        title={selectedTopic.title}
        showBack
        rightAction={
          <button
            onClick={() => navigateTo('ar-session', selectedTopic)}
            className="btn btn-primary btn-sm"
            style={{ padding: '4px 10px', fontSize: '11px', gap: '4px' }}
          >
            <Box size={13} /> AR View
          </button>
        }
      />

      <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Topic Header & Live Mastery */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span className="badge badge-cyan">{selectedTopic.category === 'data-structure' ? 'Data Structure' : 'Algorithm'}</span>
            <span className="badge badge-emerald">{selectedTopic.difficulty}</span>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800 }}>{selectedTopic.title}</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px', marginBottom: '4px' }}>
            <span>Curriculum Mastery</span>
            <span>{mastery}%</span>
          </div>
          <ProgressBar progressPercentage={mastery} color="cyan" height={5} />
        </div>

        {/* Mode Navigation Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', background: 'var(--bg-tertiary)', padding: '4px', borderRadius: 'var(--radius-lg)' }}>
          <button
            onClick={() => setActiveTab('guided')}
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-md)',
              background: activeTab === 'guided' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'guided' ? 'var(--accent-cyan)' : 'var(--text-tertiary)',
              fontWeight: 700,
              fontSize: '11.5px',
              border: activeTab === 'guided' ? '1px solid var(--border-accent)' : '1px solid transparent'
            }}
          >
            Guided Learn
          </button>

          <button
            onClick={() => setActiveTab('practice')}
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-md)',
              background: activeTab === 'practice' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'practice' ? 'var(--accent-purple)' : 'var(--text-tertiary)',
              fontWeight: 700,
              fontSize: '11.5px',
              border: activeTab === 'practice' ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid transparent'
            }}
          >
            Practice Game
          </button>

          <button
            onClick={() => setActiveTab('theory')}
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-md)',
              background: activeTab === 'theory' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'theory' ? 'var(--success)' : 'var(--text-tertiary)',
              fontWeight: 700,
              fontSize: '11.5px',
              border: activeTab === 'theory' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent'
            }}
          >
            Architecture
          </button>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: GUIDED LESSON MODE                                */}
        {/* ========================================================= */}
        {activeTab === 'guided' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Objective Banner */}
            <div className="card" style={{ padding: '12px 14px', borderLeft: '3px solid var(--accent-cyan)' }}>
              <div style={{ fontSize: '10px', color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
                Current Lesson Objective
              </div>
              <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                {isBST 
                  ? 'Learn how BST insertion places value 40' 
                  : (genericGuidedSteps[genericGuidedIndex]?.title || `Mastering ${selectedTopic.title}`)}
              </div>
              <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                {isBST 
                  ? 'Follow the step-by-step path from root to leaf to preserve the ordering invariant.' 
                  : (genericGuidedSteps[genericGuidedIndex]?.invariantExplanation || selectedTopic.shortDescription)}
              </p>
            </div>

            {/* Visualizer */}
            {isBST ? (
              <BSTVisualizer
                initialTree={guidedTree}
                activeStepOverride={currentGuidedStep as BSTOperationStep}
                readOnly={true}
              />
            ) : (
              <DSAUnifiedVisualizer
                topicId={selectedTopic.id}
                data={guidedVisData}
                interactive={false}
              />
            )}

            {/* Step Walker Controls */}
            {((isBST && guidedSteps.length > 0) || (!isBST && genericGuidedSteps.length > 0)) && (
              <div className="card" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="badge badge-purple" style={{ fontSize: '10px' }}>
                    Step {(isBST ? guidedStepIndex : genericGuidedIndex) + 1} of {isBST ? guidedSteps.length : genericGuidedSteps.length}
                  </span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={handleGuidedPrev}
                      className="btn btn-secondary btn-sm"
                      disabled={isBST ? guidedStepIndex === 0 : genericGuidedIndex === 0}
                      style={{ padding: '3px 8px', fontSize: '11px' }}
                    >
                      Back
                    </button>
                    <button
                      onClick={handleGuidedNext}
                      className="btn btn-primary btn-sm"
                      disabled={isBST ? guidedStepIndex === guidedSteps.length - 1 : genericGuidedIndex === genericGuidedSteps.length - 1}
                      style={{ padding: '3px 10px', fontSize: '11px' }}
                    >
                      Continue
                    </button>
                  </div>
                </div>

                <div style={{ fontSize: '12.5px', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                  {isBST 
                    ? (guidedSteps[guidedStepIndex] ? guidedSteps[guidedStepIndex].message : 'Tracing...')
                    : (genericGuidedSteps[genericGuidedIndex] ? genericGuidedSteps[genericGuidedIndex].description : 'Tracing...')}
                </div>

                {/* Socratic AI Support Buttons */}
                <div style={{ display: 'flex', gap: '6px', marginTop: '4px', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
                  <button
                    onClick={handleAskAIExplain}
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: '11px', color: 'var(--accent-purple)', gap: '4px' }}
                    disabled={isAiLoading}
                  >
                    <Bot size={13} /> Socratic Explanation
                  </button>
                  <button
                    onClick={handleAskAIHint}
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: '11px', color: 'var(--warning)', gap: '4px' }}
                    disabled={isAiLoading}
                  >
                    <Lightbulb size={13} /> Socratic Hint
                  </button>
                  <button
                    onClick={handleResetGuided}
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginLeft: 'auto' }}
                  >
                    <RotateCcw size={12} />
                  </button>
                </div>

                {/* AI Explanation Box */}
                {aiExplanation && (
                  <div
                    style={{
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(139, 92, 246, 0.1)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      fontSize: '11px',
                      color: 'var(--text-primary)',
                      lineHeight: 1.45,
                      whiteSpace: 'pre-line'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span style={{ fontWeight: 700, color: 'var(--accent-purple)' }}>AI Tutor Guidance</span>
                      <button onClick={() => setAiExplanation(null)} style={{ color: 'var(--text-tertiary)' }}>✕</button>
                    </div>
                    {aiExplanation}
                  </div>
                )}
              </div>
            )}

            {/* CTA to Practice Mode */}
            <button
              onClick={() => setActiveTab('practice')}
              className="btn btn-primary btn-full"
              style={{ gap: '6px', padding: '12px' }}
            >
              <span>Ready: Practice {selectedTopic.title}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: INTERACTIVE PRACTICE MODE                          */}
        {/* ========================================================= */}
        {activeTab === 'practice' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Practice Goal Header */}
            <div className="card" style={{ padding: '12px 14px', borderLeft: '3px solid var(--accent-purple)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="badge badge-purple" style={{ fontSize: '9px' }}>
                    LEVEL: {currentDifficulty}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
                    {taskSpec.label}
                  </span>
                </div>
                {(isBST ? practiceSession.targetValue : genericPracticeSession?.target) !== undefined && (
                  <span className="badge badge-cyan" style={{ fontSize: '9px' }}>
                    Target: {isBST ? practiceSession.targetValue : genericPracticeSession?.target}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                {isBST 
                  ? `Insert value ${practiceSession.targetValue} into the BST` 
                  : `Execute step for ${selectedTopic.title}`}
              </div>
              <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                {taskSpec.description}
              </p>
              {taskSpec.showInvariantGuidance && (
                <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--accent-cyan)', background: 'var(--bg-tertiary)', padding: '4px 8px', borderRadius: 'var(--radius-sm)' }}>
                  💡 Invariant Guidance: {isBST 
                    ? 'If Target < Node → Left Subtree; if Target > Node → Right Subtree.' 
                    : (selectedTopic.shortDescription || 'Preserve topic structural invariants.')}
                </div>
              )}
            </div>

            {/* Visualizer */}
            {isBST ? (
              <BSTVisualizer
                initialTree={practiceSession.currentTree}
                readOnly={true}
              />
            ) : (
              <DSAUnifiedVisualizer
                topicId={selectedTopic.id}
                data={practiceVisData}
                interactive={true}
              />
            )}

            {/* BST Practice Decision Interface */}
            {isBST && (
              !practiceSession.isComplete ? (
                <div className="card" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                      Current Node: <strong style={{ color: 'var(--accent-cyan)' }}>{practiceSession.currentNode.value}</strong>
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                      Target: <strong>{practiceSession.targetValue}</strong>
                    </span>
                  </div>

                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Which direction should target {practiceSession.targetValue} go from node {practiceSession.currentNode.value}?
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button
                      onClick={() => handleBSTPracticeDecision('LEFT')}
                      className="btn btn-secondary"
                      style={{ fontSize: '12px', padding: '10px', flexDirection: 'column', gap: '2px' }}
                    >
                      <span style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>GO LEFT</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
                        ({practiceSession.targetValue} &lt; {practiceSession.currentNode.value})
                      </span>
                    </button>

                    <button
                      onClick={() => handleBSTPracticeDecision('RIGHT')}
                      className="btn btn-secondary"
                      style={{ fontSize: '12px', padding: '10px', flexDirection: 'column', gap: '2px' }}
                    >
                      <span style={{ fontWeight: 700, color: 'var(--accent-purple)' }}>GO RIGHT</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
                        ({practiceSession.targetValue} &gt; {practiceSession.currentNode.value})
                      </span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleBSTPracticeDecision('INSERT_HERE')}
                    className="btn btn-ghost"
                    style={{
                      border: '1px dashed var(--border-card)',
                      fontSize: '11.5px',
                      padding: '8px',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    Attach & Insert Here
                  </button>
                </div>
              ) : (
                <div
                  className="card"
                  style={{
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: '10px',
                    border: '1px solid var(--success)',
                    background: 'var(--success-dim)'
                  }}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--success)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={26} />
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Insertion Mastered!
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                    You successfully inserted {practiceSession.targetValue} while maintaining the BST invariant. Mistakes: {practiceSession.mistakesCount}. Score: {practiceSession.scorePercentage}%.
                  </p>

                  <div style={{ display: 'flex', gap: '8px', width: '100%', marginTop: '4px' }}>
                    <button
                      onClick={handleRestartPractice}
                      className="btn btn-secondary btn-full btn-sm"
                    >
                      Practice Another
                    </button>
                    <button
                      onClick={() => navigateTo('assessment', selectedTopic)}
                      className="btn btn-primary btn-full btn-sm"
                    >
                      Take Assessment
                    </button>
                  </div>
                </div>
              )
            )}

            {/* Non-BST Generic Practice Decision Interface */}
            {!isBST && genericPracticeSession && (
              !genericPracticeSession.isComplete ? (
                <div className="card" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                      Step: {genericPracticeSession.stepIndex + 1}
                    </span>
                    {genericPracticeSession.target !== undefined && (
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                        Target: <strong>{genericPracticeSession.target}</strong>
                      </span>
                    )}
                  </div>

                  {/* 1. Binary Search Decisions */}
                  {selectedTopic.id === 'algo-binary-search' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Target is {genericPracticeSession.target}. Middle element at index {genericPracticeSession.currentState.mid} is {genericPracticeSession.currentState.mid !== null ? genericPracticeSession.currentState.array[genericPracticeSession.currentState.mid] : '?'}. What is the correct next step?
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                        <button
                          onClick={() => handleGenericPracticeDecision('GO_LEFT')}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '8px', fontWeight: 700, color: 'var(--accent-cyan)' }}
                        >
                          GO LEFT
                        </button>
                        <button
                          onClick={() => handleGenericPracticeDecision('MATCH')}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '8px', fontWeight: 700, color: 'var(--success)' }}
                        >
                          MATCH
                        </button>
                        <button
                          onClick={() => handleGenericPracticeDecision('GO_RIGHT')}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '8px', fontWeight: 700, color: 'var(--accent-purple)' }}
                        >
                          GO RIGHT
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 2. Sorting (Bubble Sort) Decisions */}
                  {selectedTopic.id.startsWith('algo-bubble') && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Comparing A[{genericPracticeSession.currentState.comparingIndex}] ({genericPracticeSession.currentState.array[genericPracticeSession.currentState.comparingIndex]}) and A[{genericPracticeSession.currentState.comparingIndex + 1}] ({genericPracticeSession.currentState.array[genericPracticeSession.currentState.comparingIndex + 1]}). Should they be swapped?
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <button
                          onClick={() => handleGenericPracticeDecision('SWAP')}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '10px', fontWeight: 700, color: 'var(--warning)' }}
                        >
                          SWAP
                        </button>
                        <button
                          onClick={() => handleGenericPracticeDecision('NO_SWAP')}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '10px', fontWeight: 700, color: 'var(--accent-cyan)' }}
                        >
                          NO SWAP
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 3. BFS Decisions */}
                  {selectedTopic.id === 'algo-bfs' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Current Queue: [{genericPracticeSession.currentState.queue.join(', ')}]. Visited: [{genericPracticeSession.currentState.visitedOrder.join(', ')}]. Next neighbor to enqueue:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {['A', 'B', 'C', 'D', 'E'].map(v => (
                          <button
                            key={v}
                            onClick={() => handleGenericPracticeDecision(v)}
                            className="btn btn-secondary btn-sm"
                            style={{ minWidth: '40px', fontWeight: 700 }}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4. Other DSA Topics Standard Operations */}
                  {selectedTopic.id !== 'algo-binary-search' && !selectedTopic.id.startsWith('algo-bubble') && selectedTopic.id !== 'algo-bfs' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Select deterministic operation to execute:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {(engine?.getAvailableOperations(genericPracticeSession.currentState) || ['STEP']).map(op => (
                          <button
                            key={op}
                            onClick={() => handleGenericPracticeDecision(op)}
                            className="btn btn-secondary btn-sm"
                            style={{ fontWeight: 700, fontSize: '11px' }}
                          >
                            <Play size={10} style={{ marginRight: '4px' }} /> {op}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className="card"
                  style={{
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: '10px',
                    border: '1px solid var(--success)',
                    background: 'var(--success-dim)'
                  }}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--success)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={26} />
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {selectedTopic.title} Practice Completed!
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                    Session finished with {genericPracticeSession.mistakesCount} mistake(s). Invariants verified deterministically.
                  </p>

                  <div style={{ display: 'flex', gap: '8px', width: '100%', marginTop: '4px' }}>
                    <button
                      onClick={handleRestartPractice}
                      className="btn btn-secondary btn-full btn-sm"
                    >
                      Practice Another
                    </button>
                    <button
                      onClick={() => navigateTo('assessment', selectedTopic)}
                      className="btn btn-primary btn-full btn-sm"
                    >
                      Take Assessment
                    </button>
                  </div>
                </div>
              )
            )}

            {/* Structured Misconception & Diagnostic Alert Box */}
            {practiceFeedback && (
              <div
                className="card"
                style={{
                  padding: '12px',
                  borderLeft: `3px solid ${practiceFeedback.isCorrect ? 'var(--success)' : 'var(--danger)'}`,
                  background: practiceFeedback.isCorrect ? 'var(--success-dim)' : 'var(--danger-dim)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: practiceFeedback.isCorrect ? 'var(--success)' : 'var(--danger)' }}>
                  {practiceFeedback.isCorrect ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                  <span>{practiceFeedback.isCorrect ? 'Correct Decision' : `Misconception: ${practiceFeedback.diagnosis?.type || 'Incorrect'}`}</span>
                </div>

                <p style={{ fontSize: '12px', color: 'var(--text-primary)', margin: 0, lineHeight: 1.4 }}>
                  {practiceFeedback.message}
                </p>

                {practiceFeedback.diagnosis && (
                  <div style={{ marginTop: '4px', fontSize: '10.5px', color: 'var(--text-secondary)', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '4px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div>
                      <strong>Expected:</strong> {String(practiceFeedback.diagnosis.expectedChoice)} | <strong>Guidance:</strong> {practiceFeedback.diagnosis.correctiveGuidance}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => setPracticeFeedback(null)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '6px 12px', fontSize: '11px', gap: '4px' }}
                      >
                        <RefreshCw size={12} /> Try Again
                      </button>
                      <button
                        onClick={() => {
                          navigateToTutor({
                            topic: selectedTopic,
                            operation: {
                              operationType: isBST ? 'insert' : (genericPracticeSession?.currentState?.lastAction || 'step'),
                              targetValue: isBST ? practiceSession.targetValue : (genericPracticeSession?.target as number | undefined),
                              currentNodeValue: isBST ? practiceSession.currentNode?.value : (genericPracticeSession?.currentState?.mid ?? undefined),
                              deterministicDecision: practiceFeedback.diagnosis?.expectedChoice,
                              comparisonText: practiceFeedback.diagnosis ? `${practiceFeedback.diagnosis.userChoice} vs expected ${practiceFeedback.diagnosis.expectedChoice}` : undefined
                            },
                            misconception: practiceFeedback.diagnosis,
                            helpLevel: 'mistake_remediation'
                          });
                        }}
                        className="btn btn-purple btn-sm"
                        style={{ padding: '6px 12px', fontSize: '11px', gap: '6px' }}
                      >
                        <Bot size={13} /> Ask AI Tutor
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: ARCHITECTURE & THEORY TAB                          */}
        {/* ========================================================= */}
        {activeTab === 'theory' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Knowledge Graph Connections */}
            {relSummary && (
              <div className="card" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <GitFork size={15} color="var(--accent-cyan)" />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Knowledge Graph Position
                  </span>
                </div>

                {relSummary.prerequisites.length > 0 && (
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Mandatory Conceptual Prerequisite:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                      {relSummary.prerequisites.map(p => (
                        <span key={p.node.id} className="badge badge-emerald">
                          ✓ {p.node.title} (Satisfied)
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {relSummary.supportingConcepts.length > 0 && (
                  <div style={{ marginTop: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Supporting Concepts:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                      {relSummary.supportingConcepts.map(s => (
                        <span key={s.node.id} className="badge badge-cyan" title={s.relationship.rationale}>
                          <Layers size={10} style={{ marginRight: '3px' }} />
                          {s.node.title}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Asymptotic Complexity Card */}
            <div className="card" style={{ padding: '14px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Asymptotic Time Complexity
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
                <div style={{ padding: '8px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>AVERAGE CASE</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                    {selectedTopic.timeComplexity?.average || 'O(1)'}
                  </div>
                  <div style={{ fontSize: '9.5px', color: 'var(--text-secondary)' }}>Typical execution profile</div>
                </div>
                <div style={{ padding: '8px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>WORST CASE</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--warning)' }}>
                    {selectedTopic.timeComplexity?.worst || 'O(N)'}
                  </div>
                  <div style={{ fontSize: '9.5px', color: 'var(--text-secondary)' }}>Adverse boundary condition</div>
                </div>
              </div>
            </div>

            {/* Theory Text */}
            <div className="card" style={{ padding: '14px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {selectedTopic.detailedConcept}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
