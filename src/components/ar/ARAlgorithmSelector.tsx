import React from 'react';
import { Play, Sparkles, X, GitBranch, ArrowUpDown, Search, Network, Layers } from 'lucide-react';

export interface ARAlgorithmOption {
  id: string;
  name: string;
  category: string;
  learningObjective: string;
  operationSupported: string;
  icon: React.ReactNode;
  badgeColor: string;
}

export const AR_ALGORITHMS: ARAlgorithmOption[] = [
  {
    id: 'ds-binary-search-tree',
    name: 'Binary Search Tree',
    category: 'Tree Data Structure',
    learningObjective: 'Master BST ordering invariants through spatial comparison and insertion traversal.',
    operationSupported: 'Left / Right Invariant Traversal & Node Insertion',
    icon: <GitBranch size={20} color="#38bdf8" />,
    badgeColor: 'badge-cyan'
  },
  {
    id: 'algo-bubble-sort',
    name: 'Bubble Sort',
    category: 'Sorting Algorithm',
    learningObjective: 'Understand pairwise adjacent comparisons, swapping conditions, and sorted partition bubbling.',
    operationSupported: 'Compare Adjacent Elements & Swap',
    icon: <ArrowUpDown size={20} color="#f59e0b" />,
    badgeColor: 'badge-amber'
  },
  {
    id: 'algo-binary-search',
    name: 'Binary Search',
    category: 'Searching Algorithm',
    learningObjective: 'Explore logarithmic search range reduction via midpoint calculation and binary partitioning.',
    operationSupported: 'Midpoint Evaluation & Search Interval Reduction',
    icon: <Search size={20} color="#38bdf8" />,
    badgeColor: 'badge-cyan'
  },
  {
    id: 'algo-breadth-first-search',
    name: 'Breadth-First Search',
    category: 'Graph Algorithm',
    learningObjective: 'Discover level-order graph exploration using a FIFO queue to prevent cycles and duplicate visits.',
    operationSupported: 'Start Node Selection, Dequeue & Neighbor Expansion',
    icon: <Network size={20} color="#10b981" />,
    badgeColor: 'badge-emerald'
  },
  {
    id: 'ds-stack',
    name: 'Stack',
    category: 'LIFO Data Structure',
    learningObjective: 'Experience Last-In, First-Out accumulation, top pointer tracking, and underflow/overflow bounds.',
    operationSupported: 'Push Element & Pop Top',
    icon: <Layers size={20} color="#818cf8" />,
    badgeColor: 'badge-indigo'
  }
];

interface ARAlgorithmSelectorProps {
  activeAlgorithmId: string;
  onSelectAlgorithm: (algorithmId: string) => void;
  onClose?: () => void;
  isARSessionActive?: boolean;
}

export const ARAlgorithmSelector: React.FC<ARAlgorithmSelectorProps> = ({
  activeAlgorithmId,
  onSelectAlgorithm,
  onClose,
  isARSessionActive = false
}) => {
  return (
    <div
      role="dialog"
      aria-label="AR Algorithm Selection"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        backgroundColor: 'rgba(4, 7, 17, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '16px',
        overflowY: 'auto'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90dvh',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(8, 12, 22, 0.98) 100%)',
          borderRadius: '20px',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="#38bdf8" />
              <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                Select AR Algorithm
              </h2>
            </div>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0 0' }}>
              Select a DSA topic to practice in the immersive WebXR spatial environment.
            </p>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="btn btn-secondary btn-icon-only"
              style={{ width: '36px', height: '36px', borderRadius: '10px' }}
              aria-label="Close Selector"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Algorithm List */}
        <div
          style={{
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            overflowY: 'auto'
          }}
        >
          {AR_ALGORITHMS.map(algo => {
            const isSelected = algo.id === activeAlgorithmId;

            return (
              <div
                key={algo.id}
                className="card"
                style={{
                  padding: '14px 16px',
                  background: isSelected ? 'rgba(56, 189, 248, 0.08)' : 'rgba(30, 41, 59, 0.45)',
                  border: isSelected ? '2px solid rgba(56, 189, 248, 0.6)' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: 'rgba(15, 23, 42, 0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {algo.icon}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                          {algo.name}
                        </h3>
                        <span className={`badge ${algo.badgeColor}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                          {algo.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectAlgorithm(algo.id)}
                    className="btn btn-primary"
                    style={{
                      padding: '8px 14px',
                      fontSize: '12px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      whiteSpace: 'nowrap',
                      flexShrink: 0
                    }}
                  >
                    <Play size={13} />
                    {isSelected && isARSessionActive ? 'Resume AR' : 'Start AR'}
                  </button>
                </div>

                <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: 1.4 }}>
                  <strong style={{ color: '#94a3b8' }}>Objective: </strong>
                  {algo.learningObjective}
                </div>

                <div
                  style={{
                    fontSize: '11px',
                    color: '#94a3b8',
                    background: 'rgba(15, 23, 42, 0.6)',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <strong style={{ color: '#38bdf8' }}>Operations: </strong>
                  {algo.operationSupported}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
