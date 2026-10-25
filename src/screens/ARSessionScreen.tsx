import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useApp } from '../state/AppContext';
import { 
  X, 
  RotateCcw, 
  Scan,
  Compass,
  CheckCircle2,
  Play,
  Pause,
  Layers,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { ARSessionState } from '../services/ar/IARService';
import { BSTPracticeEngine, PracticeSessionState } from '../services/dsa/bst/BSTPracticeEngine';
import { BSTNode } from '../models/bst';
import { TutorResponse, PedagogicalStyle, TutorNextAction, TutorHelpLevel, CurrentOperationState } from '../models/ai';
import { MisconceptionDiagnosis } from '../models/misconception';
import { OrchestrationResult } from '../models/multiAgent';
import { AdaptiveDifficultyLevel, DifficultyDecision } from '../models/adaptiveLearner';
import { AdaptiveDifficultyEngine } from '../services/adaptive/AdaptiveDifficultyEngine';
import { LearnerContextBuilder } from '../services/ai/LearnerContextBuilder';
import { LearnerAIContextBuilder } from '../services/ai/LearnerAIContextBuilder';
import { ARTutorHUD } from '../components/ar/ARTutorHUD';
import { ARNotification } from '../components/ar/ARNotification';
import { ARAlgorithmSelector } from '../components/ar/ARAlgorithmSelector';
import { BubbleSortEngine, BubbleSortState, SortDecision } from '../services/dsa/sorting/BubbleSortEngine';
import { BinarySearchEngine, BinarySearchState, BinarySearchDecision } from '../services/dsa/searching/BinarySearchEngine';
import { BFSEngine, BFSState } from '../services/dsa/graphAlgorithms/BFSEngine';
import { StackEngine, StackState } from '../services/dsa/stack/StackEngine';

export const ARSessionScreen: React.FC = () => {
  const { selectedTopic, navigateTo, services, learnerState, refreshLearnerState } = useApp();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  // Active Algorithm ID
  const [activeAlgorithmId, setActiveAlgorithmId] = useState<string>(() => {
    const valid = [
      'ds-binary-search-tree',
      'algo-bubble-sort',
      'algo-binary-search',
      'algo-breadth-first-search',
      'algo-bfs',
      'ds-stack'
    ];
    return valid.includes(selectedTopic.id)
      ? (selectedTopic.id === 'algo-bfs' ? 'algo-breadth-first-search' : selectedTopic.id)
      : 'ds-binary-search-tree';
  });
  const [showAlgorithmSelector, setShowAlgorithmSelector] = useState(false);

  // AR & Session State
  const [sessionState, setSessionState] = useState<ARSessionState>('INITIALIZING');
  const [selectedNode, setSelectedNode] = useState<BSTNode | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; isCorrect: boolean } | null>(null);

  // Deterministic candidate targets tracking for BST Try Another variation
  const previousTargetsRef = useRef<number[]>([40]);

  // Phase 5 & 6: AR-Aware AI Tutor & Multi-Agent Orchestrator State
  const [tutorResponse, setTutorResponse] = useState<TutorResponse | null>(null);
  const [orchestrationResult, setOrchestrationResult] = useState<OrchestrationResult | null>(null);
  const consecutiveMistakesRef = useRef<number>(0);
  const [adaptiveDifficulty, setAdaptiveDifficulty] = useState<AdaptiveDifficultyLevel>(() => {
    return learnerState.masteryMap[selectedTopic.id]?.currentDifficulty || 'FOUNDATIONAL';
  });
  const [difficultyDecision, setDifficultyDecision] = useState<DifficultyDecision | null>(null);
  const usedHintInCurrentStepRef = useRef(false);
  const requestedExplanationInCurrentStepRef = useRef(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [showTutorHUD, setShowTutorHUD] = useState(false);
  const [pedagogicalStyle, setPedagogicalStyle] = useState<PedagogicalStyle>(() => {
    return learnerState.profile.aiPreferences?.tutoringStyle || 'socratic';
  });

  // 1. Deterministic BST Practice Session (Target = 40)
  const [practiceSession, setPracticeSession] = useState<PracticeSessionState>(() => {
    return BSTPracticeEngine.startSession(undefined, 40);
  });

  // 2. Deterministic Bubble Sort Engine & State
  const bubbleSortEngine = useMemo(() => new BubbleSortEngine(), []);
  const [bubbleSortState, setBubbleSortState] = useState<BubbleSortState>(() => {
    return bubbleSortEngine.getInitialState([5, 2, 4, 1, 3]);
  });

  // 3. Deterministic Binary Search Engine & State
  const binarySearchEngine = useMemo(() => new BinarySearchEngine(), []);
  const [binarySearchState, setBinarySearchState] = useState<BinarySearchState>(() => {
    return binarySearchEngine.getInitialState({ array: [10, 20, 30, 40, 50, 60], target: 50 });
  });

  // 4. Deterministic Breadth-First Search Engine & State
  const bfsEngine = useMemo(() => new BFSEngine(), []);
  const [bfsState, setBfsState] = useState<BFSState>(() => {
    return bfsEngine.getInitialState({ startVertex: 'A' });
  });

  // 5. Deterministic Stack Engine & State
  const stackEngine = useMemo(() => new StackEngine(), []);
  const [stackState, setStackState] = useState<StackState>(() => {
    return stackEngine.getInitialState();
  });
  const [nextStackPushValue, setNextStackPushValue] = useState<number>(60);

  // BST Practice Mode: Insertion (default) vs Search
  const [bstMode, setBstMode] = useState<'INSERT' | 'SEARCH'>('INSERT');
  const [bstSearchTarget, setBstSearchTarget] = useState<number>(30);
  const [bstSearchCurrentNode, setBstSearchCurrentNode] = useState<BSTNode | null>(null);
  const [bstSearchPath, setBstSearchPath] = useState<number[]>([50]);
  const [bstSearchComplete, setBstSearchComplete] = useState<boolean>(false);
  const [bstSearchFound, setBstSearchFound] = useState<boolean>(false);

  // Auto-play state for algorithms
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);

  // Touch / Drag tracking for 3D Fallback Mode
  const isDraggingRef = useRef(false);
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Update 3D visualization whenever BST practice session changes
  const update3DVisualization = useCallback((session: PracticeSessionState) => {
    if (activeAlgorithmId === 'ds-binary-search-tree' || selectedTopic.id === 'ds-binary-search-tree') {
      services.arService.renderBST(session.currentTree, {
        activeNodeValue: session.currentNode?.value ?? null,
        targetValue: session.targetValue,
        highlightPathValues: session.decisionsMade.map(d => d.currentNodeValue),
        ghostInsertPosition: session.currentNode ? {
          parentValue: session.currentNode.value,
          direction: session.targetValue < session.currentNode.value ? 'LEFT' : 'RIGHT'
        } : null
      });
    }
  }, [activeAlgorithmId, selectedTopic.id, services.arService]);

  // Dedicated effects for algorithm 3D scene synchronizations
  useEffect(() => {
    if (activeAlgorithmId === 'algo-bubble-sort') {
      services.arService.renderBubbleSort?.(bubbleSortState);
    }
  }, [activeAlgorithmId, bubbleSortState, services.arService]);

  useEffect(() => {
    if (activeAlgorithmId === 'algo-binary-search') {
      services.arService.renderBinarySearch?.(binarySearchState);
    }
  }, [activeAlgorithmId, binarySearchState, services.arService]);

  useEffect(() => {
    if (activeAlgorithmId === 'algo-breadth-first-search' || activeAlgorithmId === 'algo-bfs') {
      services.arService.renderBFS?.(bfsState);
    }
  }, [activeAlgorithmId, bfsState, services.arService]);

  useEffect(() => {
    if (activeAlgorithmId === 'ds-stack') {
      services.arService.renderStack?.(stackState);
    }
  }, [activeAlgorithmId, stackState, services.arService]);

  // Dedicated effect for BST Search visualization update
  useEffect(() => {
    if (activeAlgorithmId === 'ds-binary-search-tree' && bstMode === 'SEARCH') {
      services.arService.renderBST(practiceSession.currentTree, {
        activeNodeValue: bstSearchCurrentNode ? bstSearchCurrentNode.value : (bstSearchFound ? bstSearchTarget : null),
        targetValue: bstSearchTarget,
        highlightPathValues: bstSearchPath,
        ghostInsertPosition: null
      });
    }
  }, [activeAlgorithmId, bstMode, bstSearchCurrentNode, bstSearchTarget, bstSearchPath, bstSearchFound, practiceSession.currentTree, services.arService]);

  // Dedicated effect for auto-playing algorithm steps
  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer = setInterval(() => {
      if (activeAlgorithmId === 'algo-bubble-sort') {
        setBubbleSortState(prev => {
          if (prev.isComplete) {
            setIsAutoPlaying(false);
            return prev;
          }
          const decision = bubbleSortEngine.getExpectedDecision(prev);
          const op = bubbleSortEngine.applyOperation(prev, { type: 'DECIDE', decision });
          if (op.newState.isComplete) {
            setIsAutoPlaying(false);
          }
          return op.newState;
        });
      } else if (activeAlgorithmId === 'algo-binary-search') {
        setBinarySearchState(prev => {
          if (prev.isComplete) {
            setIsAutoPlaying(false);
            return prev;
          }
          const decision = binarySearchEngine.getExpectedDecision(prev);
          const op = binarySearchEngine.applyOperation(prev, { type: 'DECIDE', decision });
          if (op.newState.isComplete) {
            setIsAutoPlaying(false);
          }
          return op.newState;
        });
      } else if (activeAlgorithmId === 'algo-breadth-first-search' || activeAlgorithmId === 'algo-bfs') {
        setBfsState(prev => {
          if (prev.isComplete || prev.queue.length === 0) {
            setIsAutoPlaying(false);
            return prev;
          }
          const op = bfsEngine.applyOperation(prev, { type: 'EXPAND' });
          if (op.newState.isComplete) {
            setIsAutoPlaying(false);
          }
          return op.newState;
        });
      } else {
        setIsAutoPlaying(false);
      }
    }, 1200);

    return () => clearInterval(timer);
  }, [isAutoPlaying, activeAlgorithmId, bubbleSortEngine, binarySearchEngine, bfsEngine]);

  // Initialize AR / 3D Canvas Context (Mount Only)
  useEffect(() => {
    let isMounted = true;

    async function init() {
      if (!canvasRef.current) return;

      await services.arService.initializeSession(canvasRef.current, overlayRef.current);
      if (!isMounted) return;

      // Subscribe to state machine
      const unsubscribe = services.arService.onStateChange(state => {
        if (isMounted) setSessionState(state);
      });

      // Initial 3D BST render
      update3DVisualization(practiceSession);

      return () => {
        unsubscribe();
      };
    }

    init();

    return () => {
      isMounted = false;
      services.arService.disposeSession();
    };
  }, [services.arService]);

  // Update 3D BST scene graph when practice state updates without restarting WebXR session
  useEffect(() => {
    update3DVisualization(practiceSession);
  }, [practiceSession, update3DVisualization]);

  // Handle Canvas Tap: Raycasts to pick a 3D element, or places object if reticle is ready
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // If waiting to place in AR mode, place object
    if (!services.arService.isObjectPlaced && (sessionState === 'PLACEMENT_READY' || sessionState === 'SURFACE_DETECTED')) {
      const placed = services.arService.placeObject();
      if (placed) {
        setFeedbackToast({
          message: 'Visualization placed in spatial reference frame! Walk around to inspect.',
          isCorrect: true
        });
        return;
      }
    }

    // Raycasting element selection
    if (activeAlgorithmId === 'ds-binary-search-tree') {
      const clickedNode = services.arService.selectNodeAt(e.clientX, e.clientY);
      if (clickedNode) {
        setSelectedNode(clickedNode);
        setFeedbackToast({
          message: `Selected Node ${clickedNode.value}. Left: ${clickedNode.left?.value ?? 'None'} | Right: ${clickedNode.right?.value ?? 'None'}`,
          isCorrect: true
        });
      }
    } else if (activeAlgorithmId === 'algo-breadth-first-search' || activeAlgorithmId === 'algo-bfs') {
      const clickedVertex = services.arService.selectElementAt?.(e.clientX, e.clientY);
      if (clickedVertex) {
        handleBFSSelectStart(clickedVertex);
      }
    }
  };

  // 3D Fallback Mouse/Touch Controls
  const handlePointerDown = (e: React.PointerEvent) => {
    if (sessionState === 'UNAVAILABLE') {
      isDraggingRef.current = true;
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDraggingRef.current && sessionState === 'UNAVAILABLE') {
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      lastMousePos.current = { x: e.clientX, y: e.clientY };

      (services.arService as any).rotateFallbackCamera?.(dx, dy);
    }
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (sessionState === 'UNAVAILABLE') {
      (services.arService as any).zoomFallbackCamera?.(e.deltaY);
    }
  };

  // Algorithm Selector Handler
  const handleSelectAlgorithm = (algoId: string) => {
    setIsAutoPlaying(false);
    const canonicalId = algoId === 'algo-bfs' ? 'algo-breadth-first-search' : algoId;
    setActiveAlgorithmId(canonicalId);
    setShowAlgorithmSelector(false);
    services.arService.setActiveAlgorithm?.(canonicalId);

    if (canonicalId === 'ds-binary-search-tree') {
      update3DVisualization(practiceSession);
    } else if (canonicalId === 'algo-bubble-sort') {
      services.arService.renderBubbleSort?.(bubbleSortState);
    } else if (canonicalId === 'algo-binary-search') {
      services.arService.renderBinarySearch?.(binarySearchState);
    } else if (canonicalId === 'algo-breadth-first-search') {
      services.arService.renderBFS?.(bfsState);
    } else if (canonicalId === 'ds-stack') {
      services.arService.renderStack?.(stackState);
    }

    setFeedbackToast({
      message: `Loaded ${getAlgorithmTitle(canonicalId)} in spatial scene.`,
      isCorrect: true
    });
  };

  // Consult Generative AI Tutor asynchronously without blocking the WebXR render loop
  const consultAITutor = useCallback(async (
    helpLevel: TutorHelpLevel,
    misconception?: MisconceptionDiagnosis | null,
    overrideStyle?: PedagogicalStyle
  ) => {
    setIsAiThinking(true);
    setShowTutorHUD(true);

    if (helpLevel === 'hint') {
      usedHintInCurrentStepRef.current = true;
    } else if (helpLevel === 'explanation' || helpLevel === 'mistake_remediation') {
      requestedExplanationInCurrentStepRef.current = true;
    }

    const styleToUse = overrideStyle || pedagogicalStyle;

    await services.analyticsService.trackEvent({
      userId: learnerState.profile.fullName || 'student',
      topicId: selectedTopic.id,
      eventType: 'ar_interaction_step',
      payload: {
        actionType: helpLevel === 'mistake_remediation' ? 'AI_MISTAKE_EXPLANATION' : 'AI_HINT_REQUEST',
        currentNode: practiceSession.currentNode?.value,
        targetValue: practiceSession.targetValue,
        style: styleToUse
      }
    });

    try {
      const currentOp: Partial<CurrentOperationState> = {
        operationType: 'insert',
        targetValue: practiceSession.targetValue,
        currentNodeValue: practiceSession.currentNode?.value,
        stepNumber: practiceSession.decisionsMade.length + 1,
        comparisonText: `${practiceSession.targetValue} ${practiceSession.targetValue < (practiceSession.currentNode?.value ?? 0) ? '<' : '>'} ${practiceSession.currentNode?.value}`,
        deterministicDecision: practiceSession.targetValue < (practiceSession.currentNode?.value ?? 0) ? 'LEFT' : 'RIGHT',
        isCompleted: practiceSession.isComplete
      };

      const tutorReq = LearnerContextBuilder.buildRequest({
        topic: selectedTopic,
        learnerState,
        helpLevel,
        currentOperation: currentOp,
        misconception: misconception || null,
        overrideStyle: styleToUse
      });

      const resp = await services.aiService.consultTutor(tutorReq);
      setTutorResponse(resp);
    } catch (err: any) {
      console.error('[ARSessionScreen] Error consulting AI Tutor:', err);
    } finally {
      setIsAiThinking(false);
    }
  }, [learnerState, pedagogicalStyle, practiceSession, selectedTopic, services.aiService, services.analyticsService]);

  // BST User Practice Decision (Deterministic BSTEngine Authority)
  const handleDecision = async (choice: 'LEFT' | 'RIGHT' | 'INSERT_HERE') => {
    if (practiceSession.isComplete) return;

    await services.analyticsService.trackEvent({
      userId: learnerState.profile.fullName || 'student',
      topicId: selectedTopic.id,
      eventType: 'ar_interaction_step',
      payload: {
        actionType: 'AR_DECISION_ATTEMPTED',
        choice,
        currentNode: practiceSession.currentNode?.value,
        targetValue: practiceSession.targetValue
      }
    });

    const result = await BSTPracticeEngine.evaluateDecision(
      practiceSession,
      choice,
      services.analyticsService
    );

    setPracticeSession({ ...result.session });
    update3DVisualization(result.session);

    if (result.isCorrect) {
      consecutiveMistakesRef.current = 0;
      setOrchestrationResult(null);

      await services.learnerService.recordPracticeStep(selectedTopic.id, true, undefined, {
        difficulty: adaptiveDifficulty,
        usedHint: usedHintInCurrentStepRef.current,
        requestedExplanation: requestedExplanationInCurrentStepRef.current
      });
      usedHintInCurrentStepRef.current = false;
      requestedExplanationInCurrentStepRef.current = false;

      const updatedTopicState = await services.learnerService.getTopicState(selectedTopic.id);
      const decision = AdaptiveDifficultyEngine.evaluateDifficulty(updatedTopicState, adaptiveDifficulty, true);
      setDifficultyDecision(decision);
      if (decision.direction !== 'MAINTAIN' && decision.recommendedDifficulty !== adaptiveDifficulty) {
        setAdaptiveDifficulty(decision.recommendedDifficulty);
        const record = AdaptiveDifficultyEngine.createAdaptationRecord(selectedTopic.id, decision, 'CORRECT_STEP');
        await services.learnerService.recordAdaptation(record);
      }
      await refreshLearnerState();

      setFeedbackToast({
        message: result.feedbackMessage,
        isCorrect: true
      });
    } else {
      consecutiveMistakesRef.current += 1;

      await services.learnerService.recordPracticeStep(selectedTopic.id, false, result.diagnosis?.type, {
        difficulty: adaptiveDifficulty,
        usedHint: usedHintInCurrentStepRef.current,
        requestedExplanation: requestedExplanationInCurrentStepRef.current
      });
      usedHintInCurrentStepRef.current = false;
      requestedExplanationInCurrentStepRef.current = false;

      const updatedTopicState = await services.learnerService.getTopicState(selectedTopic.id);
      const decision = AdaptiveDifficultyEngine.evaluateDifficulty(updatedTopicState, adaptiveDifficulty, true);
      setDifficultyDecision(decision);
      if (decision.direction !== 'MAINTAIN' && decision.recommendedDifficulty !== adaptiveDifficulty) {
        setAdaptiveDifficulty(decision.recommendedDifficulty);
        const record = AdaptiveDifficultyEngine.createAdaptationRecord(selectedTopic.id, decision, 'MISTAKE_EVALUATION');
        await services.learnerService.recordAdaptation(record);
      }
      await refreshLearnerState();

      setFeedbackToast({
        message: result.diagnosis?.pedagogicalExplanation || result.feedbackMessage,
        isCorrect: false
      });

      if (consecutiveMistakesRef.current >= 3) {
        setIsAiThinking(true);
        setShowTutorHUD(true);

        const aiContext = LearnerAIContextBuilder.buildContext({
          topic: selectedTopic,
          learnerState,
          currentOperation: {
            operationType: 'insert',
            targetValue: practiceSession.targetValue,
            currentNodeValue: practiceSession.currentNode?.value,
            stepNumber: practiceSession.decisionsMade.length + 1,
            comparisonText: `${practiceSession.targetValue} ${practiceSession.targetValue < (practiceSession.currentNode?.value ?? 0) ? '<' : '>'} ${practiceSession.currentNode?.value}`,
            deterministicDecision: practiceSession.targetValue < (practiceSession.currentNode?.value ?? 0) ? 'LEFT' : 'RIGHT',
            isCompleted: false
          },
          activeMisconception: result.diagnosis,
          overrideStyle: pedagogicalStyle,
          recentMistakesHistory: practiceSession.decisionsMade
            .filter(d => !d.isCorrect)
            .map(d => ({
              type: d.misconception?.type || 'BST_WRONG_DIRECTION',
              userChoice: d.decision,
              expectedChoice: d.misconception?.expectedChoice || 'LEFT',
              currentNodeValue: d.currentNodeValue,
              targetValue: d.targetValue
            }))
        });

        services.orchestrator.dispatchEducationalEvent('REPEATED_MISCONCEPTION', aiContext)
          .then(orchRes => {
            setOrchestrationResult(orchRes);
            if (orchRes.tutorResponse) {
              setTutorResponse(orchRes.tutorResponse);
            }
          })
          .catch(err => console.error('[ARSessionScreen] Orchestrator error:', err))
          .finally(() => setIsAiThinking(false));
      } else {
        consultAITutor('mistake_remediation', result.diagnosis);
      }
    }
  };

  // Safe Next-Action Suggestion Handler
  const handleSelectSuggestion = (action: TutorNextAction) => {
    if (action === 'MOVE_LEFT') {
      handleDecision('LEFT');
    } else if (action === 'MOVE_RIGHT') {
      handleDecision('RIGHT');
    } else if (action === 'CONFIRM_INSERT') {
      handleDecision('INSERT_HERE');
    } else if (action === 'RETRY_DECISION') {
      setFeedbackToast({
        message: `Review comparison: ${practiceSession.targetValue} vs ${practiceSession.currentNode?.value}. Select Left or Right.`,
        isCorrect: true
      });
    }
  };

  const handleTryAnother = () => {
    const nextTask = BSTPracticeEngine.generateNextTask(undefined, previousTargetsRef.current);
    previousTargetsRef.current.push(nextTask.targetValue);

    setPracticeSession(nextTask);
    setSelectedNode(null);
    setTutorResponse(null);
    setShowTutorHUD(false);
    consecutiveMistakesRef.current = 0;
    usedHintInCurrentStepRef.current = false;
    requestedExplanationInCurrentStepRef.current = false;
    setFeedbackToast(null);

    update3DVisualization(nextTask);
  };

  // --- BST Search Handlers ---
  const handleStartBstSearch = (target: number) => {
    setBstSearchTarget(target);
    const root = practiceSession.currentTree;
    setBstSearchCurrentNode(root);
    setBstSearchPath([root.value]);
    setBstSearchComplete(false);
    setBstSearchFound(false);
    setFeedbackToast({
      message: `Searching BST for ${target}. Compare target with root (${root.value}).`,
      isCorrect: true
    });
  };

  const handleBstSearchDecision = (decision: 'LEFT' | 'MATCH' | 'RIGHT') => {
    if (bstSearchComplete || !bstSearchCurrentNode) return;

    const currVal = bstSearchCurrentNode.value;

    if (decision === 'MATCH') {
      if (bstSearchTarget === currVal) {
        setBstSearchComplete(true);
        setBstSearchFound(true);
        setFeedbackToast({
          message: `Target ${bstSearchTarget} found at node ${currVal}! BST invariant holds.`,
          isCorrect: true
        });
      } else {
        setFeedbackToast({
          message: `Incorrect: Target ${bstSearchTarget} does not match node ${currVal}. Branch left or right based on value comparison.`,
          isCorrect: false
        });
      }
      return;
    }

    if (decision === 'LEFT') {
      if (bstSearchTarget < currVal) {
        if (bstSearchCurrentNode.left) {
          const nextNode = bstSearchCurrentNode.left;
          setBstSearchCurrentNode(nextNode);
          setBstSearchPath(prev => [...prev, nextNode.value]);
          setFeedbackToast({
            message: `Correct! ${bstSearchTarget} < ${currVal}. Advanced to left child ${nextNode.value}.`,
            isCorrect: true
          });
        } else {
          setBstSearchComplete(true);
          setBstSearchFound(false);
          setFeedbackToast({
            message: `Target ${bstSearchTarget} is NOT in BST: Left child is null (element absent).`,
            isCorrect: true
          });
        }
      } else {
        setFeedbackToast({
          message: `Invalid traversal: ${bstSearchTarget} is not less than ${currVal}. Cannot traverse left.`,
          isCorrect: false
        });
      }
      return;
    }

    if (decision === 'RIGHT') {
      if (bstSearchTarget > currVal) {
        if (bstSearchCurrentNode.right) {
          const nextNode = bstSearchCurrentNode.right;
          setBstSearchCurrentNode(nextNode);
          setBstSearchPath(prev => [...prev, nextNode.value]);
          setFeedbackToast({
            message: `Correct! ${bstSearchTarget} > ${currVal}. Advanced to right child ${nextNode.value}.`,
            isCorrect: true
          });
        } else {
          setBstSearchComplete(true);
          setBstSearchFound(false);
          setFeedbackToast({
            message: `Target ${bstSearchTarget} is NOT in BST: Right child is null (element absent).`,
            isCorrect: true
          });
        }
      } else {
        setFeedbackToast({
          message: `Invalid traversal: ${bstSearchTarget} is not greater than ${currVal}. Cannot traverse right.`,
          isCorrect: false
        });
      }
      return;
    }
  };

  // --- Bubble Sort Handlers ---
  const handleBubbleSortDecision = (decision: SortDecision) => {
    if (bubbleSortState.isComplete) return;

    const validation = bubbleSortEngine.validateStep(bubbleSortState, decision);
    if (!validation.isCorrect) {
      setFeedbackToast({
        message: validation.misconception?.pedagogicalExplanation || validation.feedbackMessage,
        isCorrect: false
      });
      return;
    }

    const opResult = bubbleSortEngine.applyOperation(bubbleSortState, { type: 'DECIDE', decision });
    setBubbleSortState(opResult.newState);
    setFeedbackToast({
      message: opResult.stepDescription,
      isCorrect: true
    });
  };

  const handleBubbleSortReset = () => {
    setIsAutoPlaying(false);
    const fresh = bubbleSortEngine.getInitialState([5, 2, 4, 1, 3]);
    setBubbleSortState(fresh);
    setFeedbackToast({
      message: 'Bubble Sort reset to initial array [5, 2, 4, 1, 3].',
      isCorrect: true
    });
  };

  const handleBubbleSortNewArray = () => {
    setIsAutoPlaying(false);
    const permutations = [
      [4, 1, 5, 2, 3],
      [3, 5, 1, 4, 2],
      [5, 4, 3, 2, 1],
      [2, 4, 1, 5, 3]
    ];
    const pick = permutations[Math.floor(Math.random() * permutations.length)];
    const fresh = bubbleSortEngine.getInitialState(pick);
    setBubbleSortState(fresh);
    setFeedbackToast({
      message: `New array loaded: [${pick.join(', ')}].`,
      isCorrect: true
    });
  };

  // --- Binary Search Handlers ---
  const handleBinarySearchDecision = (decision: BinarySearchDecision) => {
    if (binarySearchState.isComplete) return;

    const validation = binarySearchEngine.validateStep(binarySearchState, decision);
    if (!validation.isCorrect) {
      setFeedbackToast({
        message: validation.misconception?.pedagogicalExplanation || validation.feedbackMessage,
        isCorrect: false
      });
      return;
    }

    const opResult = binarySearchEngine.applyOperation(binarySearchState, { type: 'DECIDE', decision });
    setBinarySearchState(opResult.newState);
    setFeedbackToast({
      message: opResult.stepDescription,
      isCorrect: true
    });
  };

  const handleBinarySearchReset = (targetOverride?: number) => {
    setIsAutoPlaying(false);
    const target = targetOverride !== undefined ? targetOverride : binarySearchState.target;
    const fresh = binarySearchEngine.getInitialState({
      array: [10, 20, 30, 40, 50, 60],
      target
    });
    setBinarySearchState(fresh);
    setFeedbackToast({
      message: `Binary Search reset for target ${target}.`,
      isCorrect: true
    });
  };

  const handleBinarySearchNewTarget = () => {
    setIsAutoPlaying(false);
    const targets = [20, 30, 40, 60, 25];
    const candidates = targets.filter(t => t !== binarySearchState.target);
    const nextTarget = candidates[Math.floor(Math.random() * candidates.length)] || 20;
    const fresh = binarySearchEngine.getInitialState({
      array: [10, 20, 30, 40, 50, 60],
      target: nextTarget
    });
    setBinarySearchState(fresh);
    setFeedbackToast({
      message: `New target selected: ${nextTarget}${nextTarget === 25 ? ' (Absent from array)' : ''}. Begin midpoint comparison.`,
      isCorrect: true
    });
  };

  // --- BFS Handlers ---
  const handleBFSStep = () => {
    if (bfsState.isComplete) return;

    const opResult = bfsEngine.applyOperation(bfsState, { type: 'EXPAND' });
    setBfsState(opResult.newState);
    setFeedbackToast({
      message: opResult.stepDescription,
      isCorrect: true
    });
  };

  const handleBFSSelectStart = (vertex: string) => {
    setIsAutoPlaying(false);
    const fresh = bfsEngine.getInitialState({ startVertex: vertex });
    setBfsState(fresh);
    setFeedbackToast({
      message: `BFS initialized starting from vertex '${vertex}'.`,
      isCorrect: true
    });
  };

  const handleBFSReset = () => {
    setIsAutoPlaying(false);
    handleBFSSelectStart('A');
  };

  // --- Stack Handlers ---
  const handleStackPush = () => {
    const val = nextStackPushValue;
    const opResult = stackEngine.applyOperation(stackState, { type: 'PUSH', value: val });
    if (!opResult.success) {
      setFeedbackToast({
        message: opResult.stepDescription,
        isCorrect: false
      });
      return;
    }
    setNextStackPushValue(prev => prev + 15);
    setStackState(opResult.newState);
    setFeedbackToast({
      message: opResult.stepDescription,
      isCorrect: true
    });
  };

  const handleStackPop = () => {
    const opResult = stackEngine.applyOperation(stackState, { type: 'POP' });
    if (!opResult.success) {
      setFeedbackToast({
        message: opResult.stepDescription,
        isCorrect: false
      });
      return;
    }
    setStackState(opResult.newState);
    setFeedbackToast({
      message: opResult.stepDescription,
      isCorrect: true
    });
  };

  const handleStackPeek = () => {
    const opResult = stackEngine.applyOperation(stackState, { type: 'PEEK' });
    setFeedbackToast({
      message: opResult.stepDescription,
      isCorrect: true
    });
  };

  const handleStackReset = () => {
    const fresh = stackEngine.getInitialState();
    setNextStackPushValue(60);
    setStackState(fresh);
    setFeedbackToast({
      message: 'Stack reset to initial contents [15, 30, 45].',
      isCorrect: true
    });
  };

  // Reset Session (Resets Placement Anchor & Active Algorithm)
  const handleResetSession = () => {
    services.arService.resetAnchor();

    if (activeAlgorithmId === 'ds-binary-search-tree') {
      previousTargetsRef.current = [40];
      const fresh = BSTPracticeEngine.startSession(undefined, 40);
      setPracticeSession(fresh);
      setSelectedNode(null);
      setTutorResponse(null);
      setShowTutorHUD(false);
      consecutiveMistakesRef.current = 0;
      usedHintInCurrentStepRef.current = false;
      requestedExplanationInCurrentStepRef.current = false;
      update3DVisualization(fresh);
    } else if (activeAlgorithmId === 'algo-bubble-sort') {
      handleBubbleSortReset();
    } else if (activeAlgorithmId === 'algo-binary-search') {
      handleBinarySearchReset();
    } else if (activeAlgorithmId === 'algo-breadth-first-search' || activeAlgorithmId === 'algo-bfs') {
      handleBFSReset();
    } else if (activeAlgorithmId === 'ds-stack') {
      handleStackReset();
    }
  };

  const handleStartRealAR = async () => {
    await services.arService.startARSession(overlayRef.current);
  };

  const getCleanStateLabel = (): string => {
    switch (sessionState) {
      case 'SCANNING': return 'Scanning Surface';
      case 'SURFACE_DETECTED': return 'Surface Detected';
      case 'PLACEMENT_READY': return 'Ready to Place';
      case 'PLACED':
      case 'TRACKING': return 'AR Active';
      case 'UNAVAILABLE': return '3D Mode';
      case 'READY': return 'AR Supported';
      case 'INITIALIZING': return 'Initializing';
      default: return '3D Mode';
    }
  };

  const getAlgorithmTitle = (id: string): string => {
    switch (id) {
      case 'ds-binary-search-tree': return 'Binary Search Tree';
      case 'algo-bubble-sort': return 'Bubble Sort';
      case 'algo-binary-search': return 'Binary Search';
      case 'algo-breadth-first-search':
      case 'algo-bfs': return 'Breadth-First Search';
      case 'ds-stack': return 'Stack';
      default: return 'AR Algorithm';
    }
  };

  const isPlaced = services.arService.isObjectPlaced || sessionState === 'TRACKING' || sessionState === 'PLACED' || sessionState === 'UNAVAILABLE';

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden',
        userSelect: 'none',
        zIndex: 100
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
    >
      {/* Three.js Real 3D / WebXR Canvas */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100dvh',
          maxWidth: 'none',
          maxHeight: 'none',
          display: 'block',
          touchAction: 'none'
        }}
      />

      {/* ZONE A: TOP BAR HUD: Topic, Status Badges, Controls */}
      <header
        style={{
          position: 'relative',
          zIndex: 20,
          padding: 'calc(env(safe-area-inset-top, 0px) + 8px) 14px 8px',
          background: 'linear-gradient(180deg, rgba(8, 12, 22, 0.95) 0%, rgba(8, 12, 22, 0.70) 80%, transparent 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <span 
            className={`badge ${isPlaced ? 'badge-emerald' : ((sessionState as string) === 'UNAVAILABLE' ? 'badge-indigo' : 'badge-cyan')}`}
            style={{ fontSize: '11px', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}
          >
            {(sessionState as string) === 'UNAVAILABLE' ? <Layers size={12} /> : <Scan size={12} />}
            {getCleanStateLabel()}
          </span>
        </div>

        {/* Algorithm Switcher Pill */}
        <div style={{ flex: 1, textAlign: 'center', minWidth: 0, padding: '0 4px' }}>
          <button
            onClick={() => setShowAlgorithmSelector(true)}
            className="btn btn-secondary"
            style={{
              padding: '4px 10px',
              fontSize: 'clamp(11px, 3.2vw, 13.5px)',
              fontWeight: 800,
              color: '#f8fafc',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              maxWidth: '100%',
              borderRadius: '8px',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              background: 'rgba(15, 23, 42, 0.75)'
            }}
            title="Switch AR Algorithm"
          >
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {getAlgorithmTitle(activeAlgorithmId)}
            </span>
            <ChevronDown size={14} color="#38bdf8" style={{ flexShrink: 0 }} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {sessionState === 'READY' && (
            <button
              onClick={handleStartRealAR}
              className="btn btn-primary"
              style={{ padding: '5px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Play size={12} />
              Enter AR
            </button>
          )}

          <button
            onClick={handleResetSession}
            className="btn btn-secondary btn-icon-only"
            title="Reset / Reposition"
            style={{ width: '34px', height: '34px', borderRadius: '8px' }}
            aria-label="Reset Tree"
          >
            <RotateCcw size={15} />
          </button>

          <button
            onClick={() => navigateTo('learning-session', selectedTopic)}
            className="btn btn-secondary btn-icon-only"
            title="Exit AR"
            style={{ width: '34px', height: '34px', borderRadius: '8px' }}
            aria-label="Exit Session"
          >
            <X size={16} />
          </button>
        </div>
      </header>

      {/* PLACEMENT INSTRUCTION BANNER (Only shown before placement) */}
      {!isPlaced && (
        <div style={{ position: 'relative', zIndex: 25, padding: '0 14px', marginTop: '6px' }}>
          <div
            style={{
              maxWidth: '680px',
              margin: '0 auto',
              background: 'rgba(15, 23, 42, 0.90)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              borderRadius: '12px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              {sessionState === 'PLACEMENT_READY' || sessionState === 'SURFACE_DETECTED' ? (
                <Compass size={18} color="var(--accent-emerald)" className="pulse-cyan" style={{ flexShrink: 0 }} />
              ) : (
                <Scan size={18} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
              )}
              <div style={{ fontSize: '12px', color: '#f1f5f9', fontWeight: 600, lineHeight: 1.3 }}>
                {sessionState === 'PLACEMENT_READY' || sessionState === 'SURFACE_DETECTED'
                  ? 'Surface detected. Align the reticle and place the 3D model.'
                  : 'Scan Surface: Move camera slowly over a flat tabletop or floor.'}
              </div>
            </div>

            {(sessionState === 'PLACEMENT_READY' || sessionState === 'SURFACE_DETECTED') && (
              <button
                onClick={() => {
                  const placed = services.arService.placeObject();
                  if (placed) {
                    setFeedbackToast({
                      message: `${getAlgorithmTitle(activeAlgorithmId)} placed in spatial reference frame! Walk around to inspect.`,
                      isCorrect: true
                    });
                  }
                }}
                className="btn btn-primary"
                style={{ padding: '6px 14px', fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}
              >
                Place Here
              </button>
            )}
          </div>
        </div>
      )}

      {/* STANDARDIZED CONSISTENT AR NOTIFICATION */}
      {feedbackToast && (
        <ARNotification
          type={feedbackToast.isCorrect ? 'success' : 'error'}
          message={feedbackToast.message}
          onDismiss={() => setFeedbackToast(null)}
        />
      )}

      {/* ZONE B: OPEN AR CAMERA VIEWPORT (Spacer) */}
      <div style={{ flex: 1, pointerEvents: 'none' }} />

      {/* AR-AWARE AI TUTOR & MULTI-AGENT HUD OVERLAY */}
      {showTutorHUD && (
        <ARTutorHUD
          response={tutorResponse}
          orchestrationResult={orchestrationResult}
          currentDifficulty={adaptiveDifficulty}
          difficultyDecision={difficultyDecision}
          isThinking={isAiThinking}
          activeTarget={practiceSession.targetValue}
          currentNodeValue={practiceSession.currentNode?.value ?? null}
          currentStyle={pedagogicalStyle}
          onStyleChange={(newStyle) => {
            setPedagogicalStyle(newStyle);
            consultAITutor(
              tutorResponse?.responseType === 'MISTAKE_EXPLANATION' ? 'mistake_remediation' : 'hint',
              practiceSession.lastDiagnosis,
              newStyle
            );
          }}
          onRequestHint={() => consultAITutor('hint')}
          onRetryDecision={() => {
            setFeedbackToast({
              message: `Re-evaluating invariant: compare target ${practiceSession.targetValue} with node ${practiceSession.currentNode?.value}.`,
              isCorrect: true
            });
          }}
          onSelectSuggestion={handleSelectSuggestion}
          onDismiss={() => setShowTutorHUD(false)}
        />
      )}

      {/* ZONE C: COMPACT BOTTOM AR LEARNING HUD (Always visible once placed) */}
      {isPlaced && (
        <footer
          style={{
            position: 'relative',
            zIndex: 20,
            maxWidth: '640px',
            width: 'min(calc(100vw - 24px), 640px)',
            margin: '0 auto 12px auto',
            padding: '12px 16px calc(env(safe-area-inset-bottom, 0px) + 8px)',
            background: 'rgba(15, 23, 42, 0.90)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          {/* ========================================================= */}
          {/* 1. BST HUD */}
          {/* ========================================================= */}
          {activeAlgorithmId === 'ds-binary-search-tree' && (
            <>
              {/* Row 0: Mode Switcher (Insert vs Search) */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '2px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setBstMode('INSERT');
                      update3DVisualization(practiceSession);
                    }}
                    style={{
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontWeight: 700,
                      borderRadius: '6px',
                      background: bstMode === 'INSERT' ? 'var(--accent-cyan)' : 'transparent',
                      color: bstMode === 'INSERT' ? '#000' : '#94a3b8',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Insert Practice
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBstMode('SEARCH');
                      handleStartBstSearch(30);
                    }}
                    style={{
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontWeight: 700,
                      borderRadius: '6px',
                      background: bstMode === 'SEARCH' ? 'var(--accent-cyan)' : 'transparent',
                      color: bstMode === 'SEARCH' ? '#000' : '#94a3b8',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Search Practice
                  </button>
                </div>

                <span style={{ fontSize: '10.5px', color: '#94a3b8' }}>
                  {bstMode === 'INSERT' ? 'BST Insertion' : 'BST Search Traversal'}
                </span>
              </div>

              <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />

              {bstMode === 'INSERT' ? (
                <>
                  {/* Row 1: Target Insertion & Active Node Badges */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
                        TARGET INSERTION:
                      </span>
                      <span 
                        style={{
                          fontSize: '13px', 
                          fontWeight: 900, 
                          color: '#38bdf8', 
                          background: 'rgba(56, 189, 248, 0.18)',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          border: '1px solid rgba(56, 189, 248, 0.40)'
                        }}
                      >
                        {practiceSession.targetValue}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>Active Node:</span>
                      <span 
                        style={{
                          fontSize: '13px', 
                          fontWeight: 900, 
                          color: '#f59e0b', 
                          background: 'rgba(245, 158, 11, 0.18)',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          border: '1px solid rgba(245, 158, 11, 0.40)'
                        }}
                      >
                        {practiceSession.currentNode ? practiceSession.currentNode.value : 'Complete'}
                      </span>
                    </div>
                  </div>

                  <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />

                  {/* Row 2: Invariant Comparison & Action Buttons */}
                  {practiceSession.currentNode && !practiceSession.isComplete ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div>
                        <div style={{ fontSize: '12.5px', color: '#f1f5f9', fontWeight: 700 }}>
                          Compare: {practiceSession.targetValue} with {practiceSession.currentNode.value}
                        </div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                          {practiceSession.targetValue < practiceSession.currentNode.value
                            ? `Since ${practiceSession.targetValue} < ${practiceSession.currentNode.value}, proceed left.`
                            : `Since ${practiceSession.targetValue} > ${practiceSession.currentNode.value}, proceed right.`}
                        </div>
                      </div>

                      {/* Three Action Buttons */}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDecision('LEFT');
                          }}
                          onPointerDown={(e) => e.stopPropagation()}
                          onPointerUp={(e) => e.stopPropagation()}
                          className="btn btn-secondary"
                          style={{ flex: 1, padding: '8px 12px', fontSize: '12px', fontWeight: 700, justifyContent: 'center' }}
                        >
                          ← Left
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDecision('RIGHT');
                          }}
                          onPointerDown={(e) => e.stopPropagation()}
                          onPointerUp={(e) => e.stopPropagation()}
                          className="btn btn-secondary"
                          style={{ flex: 1, padding: '8px 12px', fontSize: '12px', fontWeight: 700, justifyContent: 'center' }}
                        >
                          Right →
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDecision('INSERT_HERE');
                          }}
                          onPointerDown={(e) => e.stopPropagation()}
                          onPointerUp={(e) => e.stopPropagation()}
                          className="btn btn-primary"
                          style={{ flex: 1, padding: '8px 12px', fontSize: '12px', fontWeight: 700, justifyContent: 'center' }}
                        >
                          Insert
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle2 size={18} color="#34d399" />
                        <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#34d399' }}>
                          Insertion of {practiceSession.targetValue} Completed!
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleTryAnother();
                        }}
                        className="btn btn-primary"
                        style={{ padding: '6px 14px', fontSize: '12px', fontWeight: 700 }}
                      >
                        Try Another
                      </button>
                    </div>
                  )}
                </>
              ) : (
                /* BST Search Practice HUD */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>TARGET SEARCH:</span>
                      <span className="badge badge-cyan" style={{ fontSize: '12px', padding: '2px 8px' }}>
                        {bstSearchTarget}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '10.5px', color: '#94a3b8' }}>Target:</span>
                      {[20, 30, 70, 45].map(tg => (
                        <button
                          key={tg}
                          type="button"
                          onClick={() => handleStartBstSearch(tg)}
                          className={`btn btn-sm ${bstSearchTarget === tg ? 'btn-primary' : 'btn-ghost'}`}
                          style={{ fontSize: '10px', padding: '2px 6px' }}
                        >
                          {tg}{tg === 45 ? ' ∅' : ''}
                        </button>
                      ))}
                    </div>
                  </div>

                  {!bstSearchComplete && bstSearchCurrentNode ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ fontSize: '12px', color: '#f1f5f9' }}>
                        Compare target <strong>{bstSearchTarget}</strong> with current node <strong>{bstSearchCurrentNode.value}</strong>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleBstSearchDecision('LEFT')}
                          className="btn btn-secondary"
                          style={{ flex: 1, padding: '7px 8px', fontSize: '11.5px', fontWeight: 700, justifyContent: 'center' }}
                        >
                          ← Search Left
                        </button>
                        <button
                          type="button"
                          onClick={() => handleBstSearchDecision('MATCH')}
                          className="btn btn-primary"
                          style={{ flex: 1, padding: '7px 8px', fontSize: '11.5px', fontWeight: 700, justifyContent: 'center' }}
                        >
                          Match Found ✓
                        </button>
                        <button
                          type="button"
                          onClick={() => handleBstSearchDecision('RIGHT')}
                          className="btn btn-secondary"
                          style={{ flex: 1, padding: '7px 8px', fontSize: '11.5px', fontWeight: 700, justifyContent: 'center' }}
                        >
                          Search Right →
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={16} color={bstSearchFound ? '#34d399' : '#f59e0b'} />
                        <span style={{ fontSize: '12px', fontWeight: 700, color: bstSearchFound ? '#34d399' : '#f59e0b' }}>
                          {bstSearchFound ? `Found ${bstSearchTarget} in BST!` : `Target ${bstSearchTarget} not in tree (hit null).`}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleStartBstSearch(bstSearchTarget === 45 ? 30 : 45)}
                        className="btn btn-primary"
                        style={{ padding: '5px 12px', fontSize: '11px', fontWeight: 700 }}
                      >
                        Try Another Search
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ========================================================= */}
          {/* 2. BUBBLE SORT HUD */}
          {/* ========================================================= */}
          {activeAlgorithmId === 'algo-bubble-sort' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
                    PASS:
                  </span>
                  <span className="badge badge-amber" style={{ fontSize: '12px', padding: '2px 8px' }}>
                    {bubbleSortState.i + 1}
                  </span>
                  <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '6px' }}>
                    Swaps: <strong style={{ color: '#38bdf8' }}>{bubbleSortState.swapsCount}</strong>
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setIsAutoPlaying(prev => !prev)}
                    className={`btn btn-sm ${isAutoPlaying ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '3px 8px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    {isAutoPlaying ? <Pause size={11} /> : <Play size={11} />} {isAutoPlaying ? 'Pause' : 'Auto Play'}
                  </button>
                  <span className="badge badge-cyan" style={{ fontSize: '11px', padding: '2px 6px' }}>
                    {!bubbleSortState.isComplete
                      ? `[${bubbleSortState.j}] & [${bubbleSortState.j + 1}]`
                      : 'Sorted'}
                  </span>
                </div>
              </div>

              <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />

              {!bubbleSortState.isComplete ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <div style={{ fontSize: '12.5px', color: '#f1f5f9', fontWeight: 700 }}>
                      Compare: arr[{bubbleSortState.j}] ({bubbleSortState.array[bubbleSortState.j]}) vs arr[{bubbleSortState.j + 1}] ({bubbleSortState.array[bubbleSortState.j + 1]})
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                      {bubbleSortState.array[bubbleSortState.j] > bubbleSortState.array[bubbleSortState.j + 1]
                        ? `${bubbleSortState.array[bubbleSortState.j]} > ${bubbleSortState.array[bubbleSortState.j + 1]}: Out of order. Swap is required.`
                        : `${bubbleSortState.array[bubbleSortState.j]} ≤ ${bubbleSortState.array[bubbleSortState.j + 1]}: In order. Keep without swapping.`}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleBubbleSortDecision('SWAP');
                      }}
                      className="btn btn-primary"
                      style={{ flex: 1, padding: '8px 12px', fontSize: '12px', fontWeight: 700, justifyContent: 'center' }}
                    >
                      Swap Elements
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleBubbleSortDecision('NO_SWAP');
                      }}
                      className="btn btn-secondary"
                      style={{ flex: 1, padding: '8px 12px', fontSize: '12px', fontWeight: 700, justifyContent: 'center' }}
                    >
                      Keep In Order
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={18} color="#34d399" />
                    <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#34d399' }}>
                      Array Fully Sorted: [{bubbleSortState.array.join(', ')}]!
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={handleBubbleSortReset}
                      className="btn btn-secondary"
                      style={{ padding: '6px 10px', fontSize: '11px', fontWeight: 700 }}
                    >
                      Restart
                    </button>
                    <button
                      type="button"
                      onClick={handleBubbleSortNewArray}
                      className="btn btn-primary"
                      style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 700 }}
                    >
                      New Array
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ========================================================= */}
          {/* 3. BINARY SEARCH HUD */}
          {/* ========================================================= */}
          {activeAlgorithmId === 'algo-binary-search' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
                    TARGET:
                  </span>
                  <span className="badge badge-cyan" style={{ fontSize: '13px', padding: '2px 8px' }}>
                    {binarySearchState.target}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setIsAutoPlaying(prev => !prev)}
                    className={`btn btn-sm ${isAutoPlaying ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '3px 8px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    {isAutoPlaying ? <Pause size={11} /> : <Play size={11} />} {isAutoPlaying ? 'Pause' : 'Auto Play'}
                  </button>
                  <span className="badge badge-amber" style={{ fontSize: '11px', padding: '2px 6px' }}>
                    [{binarySearchState.low} .. {binarySearchState.high}]
                  </span>
                </div>
              </div>

              {/* Target Quick Picker */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '10.5px', color: '#94a3b8' }}>Target:</span>
                {[20, 30, 40, 50, 60, 25].map(tVal => (
                  <button
                    key={tVal}
                    type="button"
                    onClick={() => handleBinarySearchReset(tVal)}
                    className={`btn btn-sm ${binarySearchState.target === tVal ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ fontSize: '10px', padding: '2px 6px' }}
                  >
                    {tVal}{tVal === 25 ? ' ∅' : ''}
                  </button>
                ))}
              </div>

              <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />

              {!binarySearchState.isComplete && binarySearchState.mid !== null ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <div style={{ fontSize: '12.5px', color: '#f1f5f9', fontWeight: 700 }}>
                      Compare: Target {binarySearchState.target} vs Mid arr[{binarySearchState.mid}] = {binarySearchState.array[binarySearchState.mid]}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                      {binarySearchState.target < binarySearchState.array[binarySearchState.mid]
                        ? `Target < Mid: In sorted array, target can only exist in the left half.`
                        : binarySearchState.target > binarySearchState.array[binarySearchState.mid]
                        ? `Target > Mid: In sorted array, target can only exist in the right half.`
                        : `Target == Mid: Target value found at midpoint index!`}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleBinarySearchDecision('GO_LEFT');
                      }}
                      className="btn btn-secondary"
                      style={{ flex: 1, padding: '8px 8px', fontSize: '11.5px', fontWeight: 700, justifyContent: 'center' }}
                    >
                      ← Search Left
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleBinarySearchDecision('MATCH');
                      }}
                      className="btn btn-primary"
                      style={{ flex: 1, padding: '8px 8px', fontSize: '11.5px', fontWeight: 700, justifyContent: 'center' }}
                    >
                      Match Found ✓
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleBinarySearchDecision('GO_RIGHT');
                      }}
                      className="btn btn-secondary"
                      style={{ flex: 1, padding: '8px 8px', fontSize: '11.5px', fontWeight: 700, justifyContent: 'center' }}
                    >
                      Search Right →
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={18} color="#34d399" />
                    <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#34d399' }}>
                      {binarySearchState.isFound
                        ? `Target ${binarySearchState.target} Found at Index ${binarySearchState.mid}!`
                        : `Search Concluded: Target not present in array.`}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => handleBinarySearchReset()}
                      className="btn btn-secondary"
                      style={{ padding: '6px 10px', fontSize: '11px', fontWeight: 700 }}
                    >
                      Restart
                    </button>
                    <button
                      type="button"
                      onClick={handleBinarySearchNewTarget}
                      className="btn btn-primary"
                      style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 700 }}
                    >
                      New Target
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ========================================================= */}
          {/* 4. BFS HUD */}
          {/* ========================================================= */}
          {(activeAlgorithmId === 'algo-breadth-first-search' || activeAlgorithmId === 'algo-bfs') && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
                    CURRENT:
                  </span>
                  <span className="badge badge-amber" style={{ fontSize: '13px', padding: '2px 8px' }}>
                    {bfsState.currentVertex || 'None'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setIsAutoPlaying(prev => !prev)}
                    className={`btn btn-sm ${isAutoPlaying ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '3px 8px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    {isAutoPlaying ? <Pause size={11} /> : <Play size={11} />} {isAutoPlaying ? 'Pause' : 'Auto Play'}
                  </button>
                  <span className="badge badge-cyan" style={{ fontSize: '11px', padding: '2px 6px' }}>
                    Queue: [{bfsState.queue.join(', ') || 'Empty'}]
                  </span>
                </div>
              </div>

              {/* Start Vertex Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '10.5px', color: '#94a3b8' }}>Start Vertex:</span>
                {['A', 'B', 'C', 'D', 'E', 'F'].map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => handleBFSSelectStart(v)}
                    className={`btn btn-sm ${(bfsState.visited[0] || 'A') === v ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ fontSize: '10px', padding: '2px 6px' }}
                  >
                    {v}
                  </button>
                ))}
              </div>

              <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />

              {!bfsState.isComplete && bfsState.queue.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <div style={{ fontSize: '12.5px', color: '#f1f5f9', fontWeight: 700 }}>
                      Next in Queue: Node '{bfsState.queue[0]}'
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                      Visited Path: {bfsState.traversalOrder.length > 0 ? bfsState.traversalOrder.join(' → ') : 'Not yet dequeued'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleBFSStep();
                      }}
                      className="btn btn-primary"
                      style={{ flex: 1, padding: '8px 12px', fontSize: '12px', fontWeight: 700, justifyContent: 'center' }}
                    >
                      Dequeue & Expand Neighbors ('{bfsState.queue[0]}')
                    </button>
                    <button
                      type="button"
                      onClick={handleBFSReset}
                      className="btn btn-secondary"
                      style={{ padding: '8px 12px', fontSize: '12px', fontWeight: 700 }}
                    >
                      Restart
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={18} color="#34d399" />
                    <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#34d399' }}>
                      BFS Complete: {bfsState.traversalOrder.join(' → ')}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleBFSReset}
                    className="btn btn-primary"
                    style={{ padding: '6px 14px', fontSize: '12px', fontWeight: 700 }}
                  >
                    Restart BFS
                  </button>
                </div>
              )}
            </>
          )}

          {/* ========================================================= */}
          {/* 5. STACK HUD */}
          {/* ========================================================= */}
          {activeAlgorithmId === 'ds-stack' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
                    STACK SIZE:
                  </span>
                  <span className={`badge ${stackState.items.length >= stackState.capacity ? 'badge-rose' : 'badge-indigo'}`} style={{ fontSize: '12px', padding: '2px 8px' }}>
                    {stackState.items.length} / {stackState.capacity} {stackState.items.length >= stackState.capacity ? '(MAX)' : ''}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>Top Element:</span>
                  <span className="badge badge-amber" style={{ fontSize: '12px', padding: '2px 8px' }}>
                    {stackState.items.length > 0 ? stackState.items[stackState.items.length - 1] : 'Empty'}
                  </span>
                </div>
              </div>

              <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '11.5px', color: stackState.items.length >= stackState.capacity ? 'var(--accent-rose)' : '#94a3b8' }}>
                  {stackState.items.length >= stackState.capacity 
                    ? '⚠️ Stack Overflow Prevention: Chute is full (5 items max). Pop an item to push more.' 
                    : 'LIFO Invariant: Elements are strictly added (pushed) and removed (popped) from the Top.'}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleStackPush();
                    }}
                    disabled={stackState.items.length >= stackState.capacity}
                    className="btn btn-primary"
                    style={{ 
                      flex: 1, 
                      padding: '8px 10px', 
                      fontSize: '11.5px', 
                      fontWeight: 700, 
                      justifyContent: 'center',
                      opacity: stackState.items.length >= stackState.capacity ? 0.4 : 1 
                    }}
                  >
                    Push (+{nextStackPushValue})
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleStackPop();
                    }}
                    disabled={stackState.items.length === 0}
                    className="btn btn-secondary"
                    style={{ 
                      flex: 1, 
                      padding: '8px 10px', 
                      fontSize: '11.5px', 
                      fontWeight: 700, 
                      justifyContent: 'center',
                      opacity: stackState.items.length === 0 ? 0.4 : 1 
                    }}
                  >
                    Pop Top (LIFO)
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleStackPeek();
                    }}
                    disabled={stackState.items.length === 0}
                    className="btn btn-secondary"
                    style={{ padding: '8px 12px', fontSize: '11.5px', fontWeight: 700 }}
                  >
                    Peek
                  </button>
                  <button
                    type="button"
                    onClick={handleStackReset}
                    className="btn btn-secondary"
                    style={{ padding: '8px 10px', fontSize: '11.5px', fontWeight: 700 }}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Divider */}
          <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />

          {/* Row: Quick tips & AI Tutor trigger */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
            <span style={{ color: '#64748b' }}>
              {selectedNode
                ? `Node ${selectedNode.value} (Depth: ${selectedNode.depth})`
                : 'Tip: Tap "Switch Algorithm" above to practice another topic.'}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => {
                  setShowTutorHUD(prev => {
                    const next = !prev;
                    if (next && !tutorResponse) {
                      consultAITutor('hint');
                    }
                    return next;
                  });
                }}
                style={{
                  background: showTutorHUD ? 'rgba(56, 189, 248, 0.18)' : 'none',
                  border: 'none',
                  color: 'var(--accent-cyan)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 6px',
                  borderRadius: '5px'
                }}
              >
                <Sparkles size={12} />
                {showTutorHUD ? 'Hide AI' : 'Ask AI Tutor'}
              </button>

              <button
                onClick={() => navigateTo('ai-tutor', selectedTopic)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '11px'
                }}
                title="Open full-screen AI Tutor conversation"
              >
                Full Chat
              </button>
            </div>
          </div>
        </footer>
      )}

      {/* AR ALGORITHM SELECTION MODAL */}
      {showAlgorithmSelector && (
        <ARAlgorithmSelector
          activeAlgorithmId={activeAlgorithmId}
          onSelectAlgorithm={handleSelectAlgorithm}
          onClose={() => setShowAlgorithmSelector(false)}
          isARSessionActive={isPlaced}
        />
      )}
    </div>
  );
};
