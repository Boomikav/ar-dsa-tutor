import React, { useState } from 'react';
import { Play, Sparkles, X, GitBranch, ArrowUpDown, Search, Network, Layers, Sliders } from 'lucide-react';

export interface ARAlgorithmOption {
  id: string;
  name: string;
  category: string;
  learningObjective: string;
  operationSupported: string;
  icon: React.ReactNode;
  badgeColor: string;
}

export const AR_CORE_ALGORITHMS: ARAlgorithmOption[] = [
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

// Preserves backward compatibility and protected baseline verification
export const AR_ALGORITHMS: ARAlgorithmOption[] = AR_CORE_ALGORITHMS;

export const AR_ADVANCED_ALGORITHMS: ARAlgorithmOption[] = [
  {
    id: 'algo-merge-sort',
    name: 'Merge Sort',
    category: 'Divide & Conquer Sorting',
    learningObjective: 'Observe recursive array halving, recursion trees, and stable sorted merging in 3D.',
    operationSupported: 'Subarray Partitioning & Sorted Two-Way Merging',
    icon: <Sliders size={20} color="#a855f7" />,
    badgeColor: 'badge-purple'
  },
  {
    id: 'ds-avl-tree',
    name: 'AVL Tree',
    category: 'Self-Balancing Tree',
    learningObjective: 'Experience strict height balancing, balance factors (-1, 0, +1), and LL/RR/LR/RL 3D rotations.',
    operationSupported: 'Insert, Dynamic Rebalancing & Rotations',
    icon: <GitBranch size={20} color="#06b6d4" />,
    badgeColor: 'badge-teal'
  },
  {
    id: 'algo-dijkstras-algorithm',
    name: "Dijkstra's Algorithm",
    category: 'Shortest Path Graph',
    learningObjective: 'Trace greedy priority queue vertex extractions, edge relaxations, and shortest path trees in 3D.',
    operationSupported: 'Tentative Distance Relaxation & Path Tracing',
    icon: <Network size={20} color="#f97316" />,
    badgeColor: 'badge-amber'
  }
];

export const ALL_AR_ALGORITHMS: ARAlgorithmOption[] = [
  ...AR_CORE_ALGORITHMS,
  ...AR_ADVANCED_ALGORITHMS
];

export interface ARAlgorithmSelectorProps {
  activeAlgorithmId: string;
  onSelectAlgorithm: (algorithmId: string) => void;
  onClose?: () => void;
  isARSessionActive?: boolean;
}

export const ARAlgorithmSelector: React.FC<ARAlgorithmSelectorProps> = ({
  activeAlgorithmId,
  onSelectAlgorithm,
  onClose
}) => {
  const [filterTab, setFilterTab] = useState<'ALL' | 'CORE' | 'ADVANCED'>('ALL');

  const displayedAlgorithms = filterTab === 'ALL'
    ? ALL_AR_ALGORITHMS
    : (filterTab === 'CORE' ? AR_CORE_ALGORITHMS : AR_ADVANCED_ALGORITHMS);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(11, 15, 25, 0.88)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ar-selector-title"
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          maxHeight: '85vh',
          background: 'linear-gradient(180deg, #131b2e 0%, #0d121f 100%)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '20px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 20px 12px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="#38bdf8" />
              <h2 id="ar-selector-title" style={{ fontSize: '17px', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                Select AR Algorithm
              </h2>
            </div>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0 0' }}>
              Select from all 8 supported 3D spatial algorithm visualizers.
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

        {/* Tab Filters */}
        <div style={{
          display: 'flex',
          gap: '6px',
          padding: '10px 20px',
          background: 'rgba(15, 23, 42, 0.6)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          {[
            { id: 'ALL', label: 'All 8 Topics' },
            { id: 'CORE', label: 'Core Baseline (5)' },
            { id: 'ADVANCED', label: 'Advanced Expansion (3)' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id as any)}
              style={{
                background: filterTab === tab.id ? '#2563eb' : 'transparent',
                color: filterTab === tab.id ? '#ffffff' : '#94a3b8',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Algorithm List */}
        <div
          style={{
            padding: '14px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            overflowY: 'auto'
          }}
        >
          {displayedAlgorithms.map(algo => {
            const isSelected = algo.id === activeAlgorithmId;

            return (
              <div
                key={algo.id}
                className="card"
                style={{
                  padding: '12px 14px',
                  background: isSelected ? 'rgba(56, 189, 248, 0.08)' : 'rgba(30, 41, 59, 0.45)',
                  border: isSelected ? '2px solid rgba(56, 189, 248, 0.6)' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: 'rgba(15, 23, 42, 0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid rgba(255, 255, 255, 0.08)'
                      }}
                    >
                      {algo.icon}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                        {algo.name}
                      </h3>
                      <span className={`badge ${algo.badgeColor}`} style={{ fontSize: '10px', padding: '1px 6px', marginTop: '2px', display: 'inline-block' }}>
                        {algo.category}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectAlgorithm(algo.id)}
                    className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                    style={{
                      gap: '4px',
                      fontSize: '11px',
                      padding: '6px 12px',
                      borderRadius: '8px'
                    }}
                  >
                    <Play size={12} fill={isSelected ? '#ffffff' : 'none'} />
                    <span>{isSelected ? 'Active' : 'Practice'}</span>
                  </button>
                </div>

                <p style={{ fontSize: '11.5px', color: '#cbd5e1', lineHeight: 1.45, margin: 0 }}>
                  {algo.learningObjective}
                </p>

                <div
                  style={{
                    fontSize: '10.5px',
                    color: '#94a3b8',
                    background: 'rgba(15, 23, 42, 0.5)',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.04)'
                  }}
                >
                  <strong style={{ color: '#38bdf8' }}>Interactive Ops:</strong> {algo.operationSupported}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
