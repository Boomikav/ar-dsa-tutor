import React, { useState, useEffect } from 'react';
import { BSTNode, BSTOperationStep } from '../../models/bst';
import { BSTEngine } from '../../services/dsa/bst/BSTEngine';
import { 
  RotateCcw, 
  Shuffle, 
  Search, 
  Plus, 
  SkipBack, 
  SkipForward, 
  Sparkles
} from 'lucide-react';

interface BSTVisualizerProps {
  initialTree?: BSTNode | null;
  onOperationComplete?: (step: BSTOperationStep, isSuccess: boolean) => void;
  activeStepOverride?: BSTOperationStep | null;
  readOnly?: boolean;
}

export const BSTVisualizer: React.FC<BSTVisualizerProps> = ({
  initialTree,
  onOperationComplete,
  activeStepOverride,
  readOnly = false
}) => {
  const [tree, setTree] = useState<BSTNode>(() => initialTree ? BSTEngine.cloneTree(initialTree)! : BSTEngine.createSampleTree());
  const [targetInput, setTargetInput] = useState<string>('40');
  const [steps, setSteps] = useState<BSTOperationStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [_isExecuting, setIsExecuting] = useState(false);
  const [message, setMessage] = useState<string>('Enter a value to trace BST insertion.');

  const SVG_WIDTH = 360;
  const SVG_HEIGHT = 220;

  useEffect(() => {
    if (initialTree) {
      const cloned = BSTEngine.cloneTree(initialTree)!;
      BSTEngine.computeLayout(cloned, SVG_WIDTH, SVG_HEIGHT);
      setTree(cloned);
    }
  }, [initialTree]);

  // Handle manual insert trigger
  const handleInsert = (valueToInsert?: number) => {
    const val = valueToInsert !== undefined ? valueToInsert : parseInt(targetInput, 10);
    if (isNaN(val)) {
      setMessage('Please enter a valid numeric value.');
      return;
    }

    const result = BSTEngine.insert(tree, val);
    setSteps(result.steps);
    setCurrentStepIndex(0);
    setMessage(result.message);

    if (result.steps.length > 0) {
      setIsExecuting(true);
      const firstStep = result.steps[0];
      if (firstStep.treeSnapshot) {
        setTree(firstStep.treeSnapshot);
      }
    }
  };

  const handleSearch = () => {
    const val = parseInt(targetInput, 10);
    if (isNaN(val)) {
      setMessage('Please enter a valid numeric value.');
      return;
    }

    const result = BSTEngine.search(tree, val);
    setSteps(result.steps);
    setCurrentStepIndex(0);
    setMessage(result.message);
    if (result.steps.length > 0) {
      setIsExecuting(true);
    }
  };

  const handleStepNext = () => {
    if (currentStepIndex < steps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      const step = steps[nextIdx];
      if (step.treeSnapshot) {
        setTree(step.treeSnapshot);
      }
      if (onOperationComplete && step.isCompleted) {
        onOperationComplete(step, true);
      }
    }
  };

  const handleStepPrev = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      const step = steps[prevIdx];
      if (step.treeSnapshot) {
        setTree(step.treeSnapshot);
      }
    }
  };

  const handleReset = () => {
    const sample = BSTEngine.createSampleTree();
    setTree(sample);
    setSteps([]);
    setCurrentStepIndex(0);
    setIsExecuting(false);
    setMessage('Tree reset to foundational sample.');
  };

  const handleRandomTree = () => {
    const randomTree = BSTEngine.createRandomTree(5);
    BSTEngine.computeLayout(randomTree, SVG_WIDTH, SVG_HEIGHT);
    setTree(randomTree);
    setSteps([]);
    setCurrentStepIndex(0);
    setIsExecuting(false);
    setMessage('Generated new random BST.');
  };

  // Active step for highlighting
  const currentStep = activeStepOverride || (steps.length > 0 ? steps[currentStepIndex] : null);

  // Extract nodes and edges for SVG rendering
  const nodesList: BSTNode[] = [];
  const edgesList: { from: BSTNode; to: BSTNode; isLeft: boolean }[] = [];

  const traverseForRendering = (node: BSTNode | null) => {
    if (!node) return;
    nodesList.push(node);
    if (node.left) {
      edgesList.push({ from: node, to: node.left, isLeft: true });
      traverseForRendering(node.left);
    }
    if (node.right) {
      edgesList.push({ from: node, to: node.right, isLeft: false });
      traverseForRendering(node.right);
    }
  };

  traverseForRendering(tree);

  return (
    <div
      className="card card-glow-cyan"
      style={{
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        background: 'radial-gradient(ellipse at 50% 30%, rgba(14, 165, 233, 0.1) 0%, rgba(8, 12, 20, 0.95) 85%)',
        border: '1px solid var(--border-accent)',
        position: 'relative'
      }}
    >
      {/* Comparator HUD Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 10px',
          background: 'var(--bg-glass)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          fontSize: '11px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={13} color="var(--accent-cyan)" />
          <span style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>
            {currentStep ? currentStep.comparison : `Target: ${targetInput}`}
          </span>
        </div>
        {steps.length > 0 && (
          <span className="badge badge-purple" style={{ fontSize: '9.5px' }}>
            Step {currentStepIndex + 1} of {steps.length}
          </span>
        )}
      </div>

      {/* SVG Canvas for Crisp Vector BST Rendering */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: `${SVG_HEIGHT}px`,
          background: 'rgba(5, 9, 17, 0.6)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          style={{ width: '100%', height: '100%', overflow: 'visible' }}
          aria-label="Binary Search Tree Visualizer"
        >
          <defs>
            <linearGradient id="edgeGradientCyan" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#00f2fe" stopOpacity="0.8" />
            </linearGradient>
            <filter id="nodeGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Render Edges */}
          {edgesList.map((edge, idx) => {
            const isHighlighted = currentStep?.highlightEdge?.fromId === edge.from.id &&
                                 currentStep?.highlightEdge?.toId === edge.to.id;
            return (
              <line
                key={`edge-${idx}`}
                x1={edge.from.x || 0}
                y1={edge.from.y || 0}
                x2={edge.to.x || 0}
                y2={edge.to.y || 0}
                stroke={isHighlighted ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.18)'}
                strokeWidth={isHighlighted ? 3 : 1.5}
                strokeDasharray={isHighlighted ? '4 2' : undefined}
                style={{ transition: 'all 300ms ease' }}
              />
            );
          })}

          {/* Render Nodes */}
          {nodesList.map((node) => {
            const isCurrentNode = currentStep?.currentNodeValue === node.value;
            const isHighlighted = currentStep?.highlightNodeId === node.id || isCurrentNode;
            const isRoot = !node.parent;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x || 0}, ${node.y || 0})`}
                style={{ transition: 'transform 300ms ease' }}
              >
                {/* Node Outer Halo for Active Step */}
                {isHighlighted && (
                  <circle
                    r={20}
                    fill="none"
                    stroke="var(--accent-cyan)"
                    strokeWidth={2}
                    opacity={0.7}
                    filter="url(#nodeGlow)"
                  />
                )}

                {/* Main Node Circle */}
                <circle
                  r={15}
                  fill={isHighlighted ? 'rgba(0, 242, 254, 0.25)' : 'rgba(15, 23, 42, 0.95)'}
                  stroke={isHighlighted ? 'var(--accent-cyan)' : isRoot ? 'var(--accent-purple)' : 'rgba(255, 255, 255, 0.3)'}
                  strokeWidth={isHighlighted ? 2.5 : 1.5}
                  style={{ transition: 'all 250ms ease' }}
                />

                {/* Node Value Label */}
                <text
                  textAnchor="middle"
                  dy=".3em"
                  fill={isHighlighted ? '#ffffff' : 'var(--text-primary)'}
                  fontSize="11px"
                  fontWeight={800}
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {node.value}
                </text>

                {/* Pointer Tag (Root / Left / Right) */}
                {isRoot && (
                  <text
                    textAnchor="middle"
                    y={-20}
                    fill="var(--accent-purple)"
                    fontSize="8px"
                    fontWeight={700}
                    letterSpacing="0.05em"
                  >
                    ROOT
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Floating Pedagogical Step Message */}
        {currentStep && (
          <div
            style={{
              position: 'absolute',
              bottom: '8px',
              left: '8px',
              right: '8px',
              background: 'rgba(8, 12, 20, 0.85)',
              backdropFilter: 'blur(8px)',
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-accent)',
              fontSize: '11px',
              color: 'var(--text-primary)',
              lineHeight: 1.3
            }}
          >
            {currentStep.message}
          </div>
        )}
      </div>

      {/* Control Panel (Hidden if readOnly) */}
      {!readOnly && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Input and Action Buttons */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <input
              type="number"
              placeholder="Value"
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              style={{
                width: '70px',
                height: '34px',
                padding: '4px 8px',
                fontSize: '12px',
                textAlign: 'center'
              }}
              min={1}
              max={999}
            />

            <button
              onClick={() => handleInsert()}
              className="btn btn-primary btn-sm"
              style={{ flex: 1, fontSize: '11px', gap: '4px' }}
            >
              <Plus size={13} /> Insert
            </button>

            <button
              onClick={handleSearch}
              className="btn btn-secondary btn-sm"
              style={{ flex: 1, fontSize: '11px', gap: '4px' }}
            >
              <Search size={13} /> Search
            </button>

            <button
              onClick={handleRandomTree}
              className="btn btn-secondary btn-sm btn-icon-only"
              title="Randomize Tree"
              aria-label="Randomize Tree"
            >
              <Shuffle size={14} />
            </button>

            <button
              onClick={handleReset}
              className="btn btn-secondary btn-sm btn-icon-only"
              title="Reset Sample Tree"
              aria-label="Reset Tree"
            >
              <RotateCcw size={14} />
            </button>
          </div>

          {/* Step Traversal Navigation (When steps exist) */}
          {steps.length > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '4px 8px',
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '11px'
              }}
            >
              <button
                onClick={handleStepPrev}
                className="btn btn-ghost btn-sm"
                disabled={currentStepIndex === 0}
                style={{ padding: '2px 6px', fontSize: '11px' }}
              >
                <SkipBack size={12} /> Prev Step
              </button>

              <span style={{ color: 'var(--text-secondary)' }}>
                Step {currentStepIndex + 1} of {steps.length}
              </span>

              <button
                onClick={handleStepNext}
                className="btn btn-primary btn-sm"
                disabled={currentStepIndex === steps.length - 1}
                style={{ padding: '2px 8px', fontSize: '11px' }}
              >
                Next Step <SkipForward size={12} />
              </button>
            </div>
          )}

          {steps.length === 0 && (
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textAlign: 'center', padding: '2px 0' }}>
              {message}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
