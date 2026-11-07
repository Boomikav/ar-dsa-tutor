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
  ChevronDown,
  ChevronUp,
  Info
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
import { MergeSortEngine, MergeSortState } from '../services/dsa/sorting/MergeSortEngine';
import { AVLTreeEngine, AVLTreeState } from '../services/dsa/tree/AVLTreeEngine';
import { DijkstraEngine, DijkstraState } from '../services/dsa/graphAlgorithms/DijkstraEngine';
import { 
  EGEAEventAdapter, 
  EGEAPolicyEngine, 
  EGEAInterventionDecision, 
  EGEAAlgorithmId,
  VALID_EGEA_ALGORITHM_IDS
} from '../services/research/egea';

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
      'ds-stack',
      'algo-merge-sort',
      'ds-avl-tree',
      'algo-dijkstras-algorithm'
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
  const [isHudCollapsed, setIsHudCollapsed] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [liveDiagnostics, setLiveDiagnostics] = useState<{
    hitPos?: { x: number; y: number; z: number } | null;
    placedPos?: { x: number; y: number; z: number } | null;
    meshCount?: number;
    fps?: number;
  }>({});

  useEffect(() => {
    if (!showDiagnostics) return;
    const interval = setInterval(() => {
      const hit = services.arService.getLastHitPosition?.() || null;
      const placed = services.arService.getPlacedPosition?.() || null;
      const meshes = services.arService.getActiveMeshCount?.() || 0;
      const tele = services.arService.getPerformanceTelemetry?.();
      setLiveDiagnostics({
        hitPos: hit,
        placedPos: placed,
        meshCount: meshes,
        fps: tele?.approximateFPS
      });
    }, 400);
    return () => clearInterval(interval);
  }, [showDiagnostics, services.arService]);

  // Auto-dismiss placement and interaction feedback toasts so they do not block the 3D scene
  useEffect(() => {
    if (!feedbackToast) return;
    const timer = setTimeout(() => {
      setFeedbackToast(null);
    }, 2800);
    return () => clearTimeout(timer);
  }, [feedbackToast]);

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

  // Phase 7: Deterministic EGEA Policy Engine & Interaction Adapter
  const [egeaDecision, setEgeaDecision] = useState<EGEAInterventionDecision | null>(() => {
    return EGEAPolicyEngine.evaluateIntervention([]);
  });
  const egeaAdapterRef = useRef<EGEAEventAdapter | null>(null);

  const resolveEgeaAlgorithmId = useCallback((id: string): EGEAAlgorithmId | null => {
    if (id === 'algo-bfs') return 'algo-breadth-first-search';
    if ((VALID_EGEA_ALGORITHM_IDS as readonly string[]).includes(id)) {
      return id as EGEAAlgorithmId;
    }
    return null;
  }, []);

  useEffect(() => {
    const egeaAlgoId = resolveEgeaAlgorithmId(activeAlgorithmId);
    if (!egeaAlgoId) {
      egeaAdapterRef.current = null;
      setEgeaDecision(null);
      return;
    }
    if (!egeaAdapterRef.current || egeaAdapterRef.current.getAlgorithmId() !== egeaAlgoId) {
      const adapter = new EGEAEventAdapter(`session-${Date.now()}`, egeaAlgoId, {
        debounceIntervalMs: 250,
        suppressDuplicateEvents: false
      });
      egeaAdapterRef.current = adapter;
    }
  }, [activeAlgorithmId, resolveEgeaAlgorithmId]);

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

  // 6. Deterministic Merge Sort Engine & State
  const mergeSortEngine = useMemo(() => new MergeSortEngine(), []);
  const [mergeSortState, setMergeSortState] = useState<MergeSortState>(() => {
    return mergeSortEngine.initialize([38, 27, 43, 3, 9, 82, 10]);
  });

  // 7. Deterministic AVL Tree Engine & State
  const avlTreeEngine = useMemo(() => new AVLTreeEngine(), []);
  const [avlTreeState, setAvlTreeState] = useState<AVLTreeState>(() => {
    return avlTreeEngine.initialize([10, 20, 30, 40, 50, 25]);
  });
  const [nextAvlInsertValue, setNextAvlInsertValue] = useState<number>(35);

  // 8. Deterministic Dijkstra Shortest Path Engine & State
  const dijkstraEngine = useMemo(() => new DijkstraEngine(), []);
  const [dijkstraState, setDijkstraState] = useState<DijkstraState>(() => {
    return dijkstraEngine.initialize();
  });

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
  const dragStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasExceededDeadzoneRef = useRef(false);

  // Update 3D visualization whenever BST practice session changes
  const update3DVisualization = useCallback((session: PracticeSessionState) => {
    if (activeAlgorithmId === 'ds-binary-search-tree') {
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
  }, [activeAlgorithmId, services.arService]);

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

  useEffect(() => {
    if (activeAlgorithmId === 'algo-merge-sort') {
      services.arService.renderMergeSort?.(mergeSortState);
    }
  }, [activeAlgorithmId, mergeSortState, services.arService]);

  useEffect(() => {
    if (activeAlgorithmId === 'ds-avl-tree') {
      services.arService.renderAVLTree?.(avlTreeState);
    }
  }, [activeAlgorithmId, avlTreeState, services.arService]);

  useEffect(() => {
    if (activeAlgorithmId === 'algo-dijkstras-algorithm') {
      services.arService.renderDijkstra?.(dijkstraState);
    }
  }, [activeAlgorithmId, dijkstraState, services.arService]);

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
      } else if (activeAlgorithmId === 'algo-merge-sort') {
        const res = mergeSortEngine.step();
        if (res.state.isComplete) {
          setIsAutoPlaying(false);
        }
        setMergeSortState(res.state);
      } else if (activeAlgorithmId === 'ds-avl-tree') {
        const res = avlTreeEngine.step();
        if (res.state.isComplete) {
          setIsAutoPlaying(false);
        }
        setAvlTreeState(res.state);
      } else if (activeAlgorithmId === 'algo-dijkstras-algorithm') {
        const res = dijkstraEngine.step();
        if (res.state.isComplete) {
          setIsAutoPlaying(false);
        }
        setDijkstraState(res.state);
      } else {
        setIsAutoPlaying(false);
      }
    }, 1200);

    return () => clearInterval(timer);
  }, [isAutoPlaying, activeAlgorithmId, bubbleSortEngine, binarySearchEngine, bfsEngine, mergeSortEngine, avlTreeEngine, dijkstraEngine]);

  // Initialize AR / 3D Canvas Context (Mount Only)
  // Session Mount Tracking Ref across StrictMode renders
  const isComponentMountedRef = useRef(true);

  // Initialize AR / 3D Canvas Context (Mount Only)
  useEffect(() => {
    isComponentMountedRef.current = true;

    async function init() {
      if (!canvasRef.current) return;

      // Subscribe to state machine before initialization
      const unsubscribe = services.arService.onStateChange(state => {
        if (isComponentMountedRef.current) setSessionState(state);
      });

      await services.arService.initializeSession(canvasRef.current, overlayRef.current);
      if (!isComponentMountedRef.current) return;

      // Expose for diagnostic inspection
      if (typeof window !== 'undefined') {
        (window as any).__AR_SERVICE__ = services.arService;
      }

      // Ensure immediate sync of current session state
      setSessionState(services.arService.sessionState);

      // Initial 3D visualizer render for active topic
      if (activeAlgorithmId === 'ds-binary-search-tree') {
        update3DVisualization(practiceSession);
      } else if (activeAlgorithmId === 'algo-bubble-sort') {
        services.arService.renderBubbleSort?.(bubbleSortState);
      } else if (activeAlgorithmId === 'algo-binary-search') {
        services.arService.renderBinarySearch?.(binarySearchState);
      } else if (activeAlgorithmId === 'algo-breadth-first-search') {
        services.arService.renderBFS?.(bfsState);
      } else if (activeAlgorithmId === 'ds-stack') {
        services.arService.renderStack?.(stackState);
      } else if (activeAlgorithmId === 'algo-merge-sort') {
        services.arService.renderMergeSort?.(mergeSortState);
      } else if (activeAlgorithmId === 'ds-avl-tree') {
        services.arService.renderAVLTree?.(avlTreeState);
      } else if (activeAlgorithmId === 'algo-dijkstras-algorithm') {
        services.arService.renderDijkstra?.(dijkstraState);
      }

      return () => {
        unsubscribe();
      };
    }

    init();

    return () => {
      isComponentMountedRef.current = false;
      setTimeout(() => {
        if (!isComponentMountedRef.current) {
          services.arService.disposeSession();
        }
      }, 200);
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

  const isInteractiveTarget = (el: HTMLElement | null): boolean => {
    while (el && el !== overlayRef.current) {
      const tag = el.tagName?.toLowerCase();
      if (tag === 'button' || tag === 'input' || tag === 'select' || tag === 'textarea' || tag === 'a') {
        return true;
      }
      if (el.getAttribute('role') === 'button' || el.getAttribute('role') === 'dialog') {
        return true;
      }
      if (el.classList?.contains('btn') || el.classList?.contains('badge')) {
        return true;
      }
      el = el.parentElement;
    }
    return false;
  };

  // 3D Fallback Mouse/Touch Controls
  const handlePointerDown = (e: React.PointerEvent) => {
    if (sessionState === 'UNAVAILABLE') {
      if (isInteractiveTarget(e.target as HTMLElement)) {
        return;
      }
      try {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } catch {
        // Ignored
      }
      isDraggingRef.current = true;
      hasExceededDeadzoneRef.current = false;
      dragStartPos.current = { x: e.clientX, y: e.clientY };
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDraggingRef.current && sessionState === 'UNAVAILABLE') {
      const totalDx = e.clientX - dragStartPos.current.x;
      const totalDy = e.clientY - dragStartPos.current.y;
      if (!hasExceededDeadzoneRef.current) {
        if (Math.hypot(totalDx, totalDy) < 2.5) {
          return;
        }
        hasExceededDeadzoneRef.current = true;
      }

      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      lastMousePos.current = { x: e.clientX, y: e.clientY };

      (services.arService as any).rotateFallbackCamera?.(dx, dy);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Ignored
      }
      isDraggingRef.current = false;
      hasExceededDeadzoneRef.current = false;
    }
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

    // Cleanly reset EGEA telemetry to prevent cross-algorithm history leakage
    const egeaAlgoId = resolveEgeaAlgorithmId(canonicalId);
    if (egeaAlgoId) {
      egeaAdapterRef.current = new EGEAEventAdapter(`session-${Date.now()}`, egeaAlgoId, {
        debounceIntervalMs: 250,
        suppressDuplicateEvents: false
      });
      setEgeaDecision(EGEAPolicyEngine.evaluateIntervention([]));
    } else {
      egeaAdapterRef.current = null;
      setEgeaDecision(null);
    }

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
    } else if (canonicalId === 'algo-merge-sort') {
      services.arService.renderMergeSort?.(mergeSortState);
    } else if (canonicalId === 'ds-avl-tree') {
      services.arService.renderAVLTree?.(avlTreeState);
    } else if (canonicalId === 'algo-dijkstras-algorithm') {
      services.arService.renderDijkstra?.(dijkstraState);
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
      if (egeaAdapterRef.current) {
        egeaAdapterRef.current.recordHintUsage();
      }
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

    if (egeaAdapterRef.current) {
      const expected = practiceSession.targetValue < (practiceSession.currentNode?.value ?? 0)
        ? 'LEFT'
        : (practiceSession.currentNode?.right ? 'RIGHT' : (choice === 'INSERT_HERE' ? 'INSERT_HERE' : 'RIGHT'));
      egeaAdapterRef.current.recordInteraction({
        stepIdentifier: `bst-node-${practiceSession.currentNode?.value ?? 'root'}`,
        attemptedAction: choice,
        expectedAction: expected,
        isCorrect: result.isCorrect,
        errorCategory: result.isCorrect ? 'NONE' : 'VALUE_COMPARISON',
        stateContext: {
          target: practiceSession.targetValue,
          currentNode: practiceSession.currentNode?.value
        },
        hintUsed: usedHintInCurrentStepRef.current
      });
      const nextEgea = EGEAPolicyEngine.evaluateIntervention(egeaAdapterRef.current.getEvents());
      setEgeaDecision(nextEgea);
    }

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
    if (egeaAdapterRef.current) {
      egeaAdapterRef.current.reset(`session-${Date.now()}`, 'ds-binary-search-tree');
      setEgeaDecision(EGEAPolicyEngine.evaluateIntervention([]));
    }
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

    if (egeaAdapterRef.current) {
      const idx = bubbleSortState.j;
      const currentPair = [bubbleSortState.array[idx], bubbleSortState.array[idx + 1]];
      const expectedDecision: SortDecision = currentPair[0] > currentPair[1] ? 'SWAP' : 'NO_SWAP';
      egeaAdapterRef.current.recordInteraction({
        stepIdentifier: `bubble-pair-${idx}-${idx + 1}`,
        attemptedAction: decision,
        expectedAction: expectedDecision,
        isCorrect: validation.isCorrect,
        errorCategory: validation.isCorrect ? 'NONE' : 'VALUE_COMPARISON',
        stateContext: {
          currentIndex: idx,
          array: [...bubbleSortState.array]
        }
      });
      const nextEgea = EGEAPolicyEngine.evaluateIntervention(egeaAdapterRef.current.getEvents());
      setEgeaDecision(nextEgea);
    }

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
    if (egeaAdapterRef.current) {
      egeaAdapterRef.current.reset(`session-${Date.now()}`, 'algo-bubble-sort');
      setEgeaDecision(EGEAPolicyEngine.evaluateIntervention([]));
    }
    const fresh = bubbleSortEngine.getInitialState([5, 2, 4, 1, 3]);
    setBubbleSortState(fresh);
    setFeedbackToast({
      message: 'Bubble Sort reset to initial array [5, 2, 4, 1, 3].',
      isCorrect: true
    });
  };

  const handleBubbleSortNewArray = () => {
    setIsAutoPlaying(false);
    if (egeaAdapterRef.current) {
      egeaAdapterRef.current.reset(`session-${Date.now()}`, 'algo-bubble-sort');
      setEgeaDecision(EGEAPolicyEngine.evaluateIntervention([]));
    }
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

    if (egeaAdapterRef.current && binarySearchState.mid !== null) {
      const midIdx = binarySearchState.mid;
      const midVal = binarySearchState.array[midIdx];
      const expectedDecision: BinarySearchDecision = binarySearchState.target === midVal
        ? 'MATCH'
        : (binarySearchState.target < midVal ? 'GO_LEFT' : 'GO_RIGHT');
      egeaAdapterRef.current.recordInteraction({
        stepIdentifier: `binary-search-range-${binarySearchState.low}-${binarySearchState.high}`,
        attemptedAction: decision,
        expectedAction: expectedDecision,
        isCorrect: validation.isCorrect,
        errorCategory: validation.isCorrect ? 'NONE' : (binarySearchState.low > binarySearchState.high ? 'BOUNDARY_OVERFLOW' : 'VALUE_COMPARISON'),
        stateContext: {
          low: binarySearchState.low,
          high: binarySearchState.high,
          mid: midIdx,
          target: binarySearchState.target
        }
      });
      const nextEgea = EGEAPolicyEngine.evaluateIntervention(egeaAdapterRef.current.getEvents());
      setEgeaDecision(nextEgea);
    }

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
    if (egeaAdapterRef.current) {
      egeaAdapterRef.current.reset(`session-${Date.now()}`, 'algo-binary-search');
      setEgeaDecision(EGEAPolicyEngine.evaluateIntervention([]));
    }
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
    if (egeaAdapterRef.current) {
      egeaAdapterRef.current.reset(`session-${Date.now()}`, 'algo-binary-search');
      setEgeaDecision(EGEAPolicyEngine.evaluateIntervention([]));
    }
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

    if (egeaAdapterRef.current) {
      egeaAdapterRef.current.recordInteraction({
        stepIdentifier: `bfs-vertex-${bfsState.currentVertex || 'root'}`,
        attemptedAction: 'VISIT_NEIGHBOR',
        expectedAction: 'VISIT_NEIGHBOR',
        isCorrect: true,
        errorCategory: 'NONE',
        stateContext: {
          currentVertex: bfsState.currentVertex,
          queue: [...bfsState.queue],
          visited: [...bfsState.visited]
        }
      });
      const nextEgea = EGEAPolicyEngine.evaluateIntervention(egeaAdapterRef.current.getEvents());
      setEgeaDecision(nextEgea);
    }

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
    if (egeaAdapterRef.current) {
      egeaAdapterRef.current.reset(`session-${Date.now()}`, 'algo-breadth-first-search');
      setEgeaDecision(EGEAPolicyEngine.evaluateIntervention([]));
    }
    handleBFSSelectStart('A');
  };

  // --- Stack Handlers ---
  const handleStackPush = () => {
    const val = nextStackPushValue;
    const isOverflow = stackState.items.length >= stackState.capacity;

    if (egeaAdapterRef.current) {
      egeaAdapterRef.current.recordInteraction({
        stepIdentifier: `stack-size-${stackState.items.length}`,
        attemptedAction: 'PUSH',
        expectedAction: isOverflow ? 'POP' : 'PUSH',
        isCorrect: !isOverflow,
        errorCategory: isOverflow ? 'CAPACITY_LIMIT' : 'NONE',
        stateContext: {
          items: [...stackState.items],
          pushValue: val
        }
      });
      const nextEgea = EGEAPolicyEngine.evaluateIntervention(egeaAdapterRef.current.getEvents());
      setEgeaDecision(nextEgea);
    }

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
    const isUnderflow = stackState.items.length === 0;

    if (egeaAdapterRef.current) {
      egeaAdapterRef.current.recordInteraction({
        stepIdentifier: `stack-size-${stackState.items.length}`,
        attemptedAction: 'POP',
        expectedAction: isUnderflow ? 'PUSH' : 'POP',
        isCorrect: !isUnderflow,
        errorCategory: isUnderflow ? 'CAPACITY_LIMIT' : 'NONE',
        stateContext: {
          items: [...stackState.items]
        }
      });
      const nextEgea = EGEAPolicyEngine.evaluateIntervention(egeaAdapterRef.current.getEvents());
      setEgeaDecision(nextEgea);
    }

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
    setIsAutoPlaying(false);
    if (egeaAdapterRef.current) {
      egeaAdapterRef.current.reset(`session-${Date.now()}`, 'ds-stack');
      setEgeaDecision(EGEAPolicyEngine.evaluateIntervention([]));
    }
    const fresh = stackEngine.getInitialState();
    setNextStackPushValue(60);
    setStackState(fresh);
    setFeedbackToast({
      message: 'Stack reset to initial contents [15, 30, 45].',
      isCorrect: true
    });
  };

  // 6. Merge Sort Actions
  const handleMergeSortStep = () => {
    setIsAutoPlaying(false);
    const res = mergeSortEngine.step();
    setMergeSortState(res.state);
    setFeedbackToast({ message: res.event.description, isCorrect: true });
  };

  const handleMergeSortReset = () => {
    setIsAutoPlaying(false);
    const fresh = mergeSortEngine.initialize([38, 27, 43, 3, 9, 82, 10]);
    setMergeSortState(fresh);
    setFeedbackToast({ message: 'Merge Sort reset to initial array.', isCorrect: true });
  };

  // 7. AVL Tree Actions
  const handleAVLTreeStep = () => {
    setIsAutoPlaying(false);
    const res = avlTreeEngine.step();
    setAvlTreeState(res.state);
    setFeedbackToast({ message: res.event.description, isCorrect: true });
  };

  const handleAVLTreeInsert = () => {
    setIsAutoPlaying(false);
    const val = nextAvlInsertValue;
    const candidates = [15, 35, 60, 5, 28, 70];
    const nextCandidate = candidates[(candidates.indexOf(val) + 1) % candidates.length];
    setNextAvlInsertValue(nextCandidate);
    const res = avlTreeEngine.insert(val);
    setAvlTreeState(res.state);
    setFeedbackToast({ message: `Inserted node ${val} into AVL Tree.`, isCorrect: true });
  };

  const handleAVLTreeReset = () => {
    setIsAutoPlaying(false);
    const fresh = avlTreeEngine.initialize([10, 20, 30, 40, 50, 25]);
    setAvlTreeState(fresh);
    setFeedbackToast({ message: 'AVL Tree reset to balanced state.', isCorrect: true });
  };

  // 8. Dijkstra Actions
  const handleDijkstraStep = () => {
    setIsAutoPlaying(false);
    const res = dijkstraEngine.step();
    setDijkstraState(res.state);
    setFeedbackToast({ message: res.event.description, isCorrect: true });
  };

  const handleDijkstraReset = () => {
    setIsAutoPlaying(false);
    const fresh = dijkstraEngine.initialize();
    setDijkstraState(fresh);
    setFeedbackToast({ message: "Dijkstra's graph reset to start vertex A.", isCorrect: true });
  };

  // Reset Session (Resets Placement Anchor & Active Algorithm)
  const handleResetSession = () => {
    services.arService.resetAnchor();

    // Reset EGEA adapter for clean demonstration replay
    const egeaAlgoId = resolveEgeaAlgorithmId(activeAlgorithmId);
    if (egeaAlgoId && egeaAdapterRef.current) {
      egeaAdapterRef.current.reset(`session-${Date.now()}`, egeaAlgoId);
      setEgeaDecision(EGEAPolicyEngine.evaluateIntervention([]));
    } else {
      egeaAdapterRef.current = null;
      setEgeaDecision(null);
    }

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
    } else if (activeAlgorithmId === 'algo-merge-sort') {
      handleMergeSortReset();
    } else if (activeAlgorithmId === 'ds-avl-tree') {
      handleAVLTreeReset();
    } else if (activeAlgorithmId === 'algo-dijkstras-algorithm') {
      handleDijkstraReset();
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
      case 'algo-merge-sort': return 'Merge Sort';
      case 'ds-avl-tree': return 'AVL Tree';
      case 'algo-dijkstras-algorithm': return "Dijkstra's Algorithm";
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
        zIndex: 100,
        touchAction: 'none'
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onLostPointerCapture={handlePointerUp}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <span 
            className={`badge ${isPlaced ? 'badge-emerald' : ((sessionState as string) === 'UNAVAILABLE' ? 'badge-indigo' : 'badge-cyan')}`}
            style={{ fontSize: '11px', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}
          >
            {(sessionState as string) === 'UNAVAILABLE' ? <Layers size={12} /> : <Scan size={12} />}
            {getCleanStateLabel()}
          </span>
          <button
            type="button"
            onClick={() => setShowDiagnostics(prev => !prev)}
            style={{
              background: showDiagnostics ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '6px',
              padding: '3px 5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              color: showDiagnostics ? '#38bdf8' : '#94a3b8'
            }}
            title="Toggle WebXR Diagnostics"
            aria-label="Toggle WebXR Diagnostics"
          >
            <Info size={12} />
          </button>
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

      {/* REAL-TIME WEBXR PHYSICAL DIAGNOSTICS OVERLAY */}
      {showDiagnostics && (
        <div style={{
          position: 'absolute',
          top: '56px',
          left: '14px',
          zIndex: 99,
          background: 'rgba(8, 12, 22, 0.94)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(56, 189, 248, 0.45)',
          borderRadius: '10px',
          padding: '10px 14px',
          fontSize: '11px',
          color: '#e2e8f0',
          lineHeight: 1.6,
          fontFamily: 'monospace',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          maxWidth: '320px',
          pointerEvents: 'auto'
        }}>
          <div style={{ fontWeight: 800, color: '#38bdf8', letterSpacing: '0.5px', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
            <span>WEBXR RUNTIME HUD</span>
            <span style={{ color: '#34d399' }}>{liveDiagnostics.fps ?? 60} FPS</span>
          </div>
          <div>Mode: <span style={{ color: '#f8fafc' }}>{sessionState === 'UNAVAILABLE' ? '3D Fallback' : 'WebXR (local-floor)'}</span></div>
          <div>State: <span style={{ color: '#34d399', fontWeight: 700 }}>{sessionState}</span></div>
          <div>Hit Pose: <span style={{ color: liveDiagnostics.hitPos ? '#38bdf8' : '#94a3b8' }}>
            {liveDiagnostics.hitPos ? `${liveDiagnostics.hitPos.x.toFixed(2)}, ${liveDiagnostics.hitPos.y.toFixed(2)}, ${liveDiagnostics.hitPos.z.toFixed(2)}` : 'Scanning...'}
          </span></div>
          <div>Placed Pose: <span style={{ color: liveDiagnostics.placedPos ? '#34d399' : '#94a3b8' }}>
            {liveDiagnostics.placedPos ? `${liveDiagnostics.placedPos.x.toFixed(2)}, ${liveDiagnostics.placedPos.y.toFixed(2)}, ${liveDiagnostics.placedPos.z.toFixed(2)}` : 'Unplaced'}
          </span></div>
          <div>Active Meshes: <span style={{ color: '#f59e0b', fontWeight: 700 }}>{liveDiagnostics.meshCount ?? 0}</span></div>
        </div>
      )}

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
          egeaDecision={egeaDecision}
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
            width: 'min(calc(100vw - 20px), 640px)',
            margin: '0 auto 8px auto',
            padding: isHudCollapsed ? '8px 12px calc(env(safe-area-inset-bottom, 0px) + 4px)' : '10px 14px calc(env(safe-area-inset-bottom, 0px) + 6px)',
            background: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            borderRadius: '14px',
            boxShadow: '0 10px 36px rgba(0, 0, 0, 0.65)',
            display: 'flex',
            flexDirection: 'column',
            gap: isHudCollapsed ? '6px' : '8px'
          }}
        >
          {/* Top header row with Collapse / Expand pill */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.4px' }}>
              {getAlgorithmTitle(activeAlgorithmId).toUpperCase()}
            </span>
            <button
              type="button"
              onClick={() => setIsHudCollapsed(prev => !prev)}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.16)',
                borderRadius: '6px',
                padding: '2px 8px',
                color: '#cbd5e1',
                fontSize: '10.5px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title={isHudCollapsed ? "Expand HUD details" : "Collapse HUD for open AR view"}
            >
              {isHudCollapsed ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              <span>{isHudCollapsed ? 'Expand Details' : 'Compact View'}</span>
            </button>
          </div>
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

          {/* ========================================================= */}
          {/* 6. MERGE SORT HUD */}
          {/* ========================================================= */}
          {activeAlgorithmId === 'algo-merge-sort' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>PHASE:</span>
                  <span className={`badge ${mergeSortState.isComplete ? 'badge-emerald' : 'badge-purple'}`} style={{ fontSize: '11px', padding: '2px 8px' }}>
                    {mergeSortState.isComplete ? 'SORTED ✓' : 'DIVIDE & CONQUER'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
                  <span style={{ color: '#94a3b8' }}>Depth: <strong style={{ color: '#38bdf8' }}>{mergeSortState.recursionDepth}</strong></span>
                  <span style={{ color: '#94a3b8' }}>Comps: <strong style={{ color: '#f59e0b' }}>{mergeSortState.comparisonsCount}</strong></span>
                  <span style={{ color: '#94a3b8' }}>Writes: <strong style={{ color: '#10b981' }}>{mergeSortState.writesCount}</strong></span>
                </div>
              </div>

              <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '11.5px', color: '#cbd5e1' }}>
                  {mergeSortState.lastAction}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={handleMergeSortStep}
                    disabled={mergeSortState.isComplete}
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '8px 10px', fontSize: '11.5px', fontWeight: 700, justifyContent: 'center' }}
                  >
                    Next Merge Step
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                    disabled={mergeSortState.isComplete}
                    className="btn btn-secondary"
                    style={{ padding: '8px 12px', fontSize: '11.5px', fontWeight: 700 }}
                  >
                    {isAutoPlaying ? <Pause size={14} /> : <Play size={14} />}
                  </button>
                  <button
                    type="button"
                    onClick={handleMergeSortReset}
                    className="btn btn-secondary"
                    style={{ padding: '8px 10px', fontSize: '11.5px', fontWeight: 700 }}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ========================================================= */}
          {/* 7. AVL TREE HUD */}
          {/* ========================================================= */}
          {activeAlgorithmId === 'ds-avl-tree' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>NODES:</span>
                  <span className="badge badge-cyan" style={{ fontSize: '11px', padding: '2px 8px' }}>
                    {avlTreeState.nodeCount} Nodes
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
                  <span style={{ color: '#94a3b8' }}>Rotations: <strong style={{ color: '#38bdf8' }}>{avlTreeState.rotationCount}</strong></span>
                  <span style={{ color: '#94a3b8' }}>Imbalanced: <strong style={{ color: avlTreeState.imbalancedNodeValue ? '#ef4444' : '#10b981' }}>{avlTreeState.imbalancedNodeValue ?? 'None'}</strong></span>
                </div>
              </div>

              <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '11.5px', color: '#cbd5e1' }}>
                  {avlTreeState.rotationExplanation || avlTreeState.lastOperation}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={handleAVLTreeStep}
                    disabled={avlTreeState.isComplete}
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '8px 10px', fontSize: '11.5px', fontWeight: 700, justifyContent: 'center' }}
                  >
                    Next Balance Step
                  </button>
                  <button
                    type="button"
                    onClick={handleAVLTreeInsert}
                    className="btn btn-secondary"
                    style={{ padding: '8px 10px', fontSize: '11.5px', fontWeight: 700 }}
                  >
                    Insert (+{nextAvlInsertValue})
                  </button>
                  <button
                    type="button"
                    onClick={handleAVLTreeReset}
                    className="btn btn-secondary"
                    style={{ padding: '8px 10px', fontSize: '11.5px', fontWeight: 700 }}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ========================================================= */}
          {/* 8. DIJKSTRA HUD */}
          {/* ========================================================= */}
          {activeAlgorithmId === 'algo-dijkstras-algorithm' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>CURRENT VERTEX:</span>
                  <span className="badge badge-amber" style={{ fontSize: '11px', padding: '2px 8px' }}>
                    {dijkstraState.currentVertex ?? (dijkstraState.isComplete ? 'Complete' : 'Start A')}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
                  <span style={{ color: '#94a3b8' }}>Visited: <strong style={{ color: '#10b981' }}>{dijkstraState.visited.length}/{dijkstraState.vertices.length}</strong></span>
                  <span style={{ color: '#94a3b8' }}>Shortest Path: <strong style={{ color: '#38bdf8' }}>{dijkstraState.shortestPath.length > 0 ? dijkstraState.shortestPath.join(' -> ') : 'Evaluating'}</strong></span>
                </div>
              </div>

              <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '11.5px', color: '#cbd5e1' }}>
                  {dijkstraState.lastAction}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={handleDijkstraStep}
                    disabled={dijkstraState.isComplete}
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '8px 10px', fontSize: '11.5px', fontWeight: 700, justifyContent: 'center' }}
                  >
                    Relax Next Vertex
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                    disabled={dijkstraState.isComplete}
                    className="btn btn-secondary"
                    style={{ padding: '8px 12px', fontSize: '11.5px', fontWeight: 700 }}
                  >
                    {isAutoPlaying ? <Pause size={14} /> : <Play size={14} />}
                  </button>
                  <button
                    type="button"
                    onClick={handleDijkstraReset}
                    className="btn btn-secondary"
                    style={{ padding: '8px 10px', fontSize: '11.5px', fontWeight: 700 }}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Bottom tips & AI Tutor trigger (collapsible) */}
          {!isHudCollapsed && (
            <>
              <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', flexWrap: 'wrap', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#64748b' }}>
                    {selectedNode
                      ? `Node ${selectedNode.value} (Depth: ${selectedNode.depth})`
                      : 'Tip: Tap "Switch Algorithm" to change topic.'}
                  </span>
                  {egeaDecision && (
                    <button
                      type="button"
                      onClick={() => setShowTutorHUD(true)}
                      style={{
                        background: 'rgba(56, 189, 248, 0.12)',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        color: '#38bdf8',
                        borderRadius: '5px',
                        padding: '2px 6px',
                        fontSize: '10px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title={`EGEA Decision: ${egeaDecision.interventionType}\nRationale: ${egeaDecision.rationaleCode}\nConfidence: ${Math.round(egeaDecision.confidence * 100)}%`}
                    >
                      <span>EGEA:</span>
                      <span style={{ color: '#f8fafc', fontWeight: 600 }}>{egeaDecision.interventionType.replace(/_/g, ' ')}</span>
                    </button>
                  )}
                </div>

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
            </>
          )}
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
