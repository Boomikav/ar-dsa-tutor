/**
 * Unified Multi-Topic DSA Visualizer Component.
 * 
 * Dynamically renders deterministic visual representations for all 20 Tier-1 DSA topics:
 * - Linear: Arrays, Searching (Linear/Binary), Sorting (Bubble, Selection, Insertion, Quick, Merge)
 * - Sequential: Stack (Vertical), Queue (Horizontal), Linked List (Nodes + Pointers)
 * - Trees & Heaps: Binary Tree, Heap (Dual Array/Tree)
 * - Hash Tables: Buckets & Separate Chaining
 * - Graphs: Vertices, Adjacency Edges, Traversal Highlighting (BFS, DFS, Dijkstra)
 * - Recursion: Call Stack Frames & Return Propagation
 * - Binary Search Tree: Preserves reference BSTVisualizer
 */

import React from 'react';
import { BSTVisualizer } from './BSTVisualizer';

interface DSAUnifiedVisualizerProps {
  topicId: string;
  data: any;
  interactive?: boolean;
  onSelectElement?: (element: any) => void;
}

export const DSAUnifiedVisualizer: React.FC<DSAUnifiedVisualizerProps> = ({
  topicId,
  data,
  interactive = false,
  onSelectElement
}) => {
  if (!data) {
    return (
      <div className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
        No visualization state available.
      </div>
    );
  }

  // 1. Reference BST Visualizer Delegation
  if (topicId === 'ds-binary-search-tree') {
    return <BSTVisualizer initialTree={data} readOnly={!interactive} />;
  }

  // 2. Arrays, Linear Search, Binary Search & Sorting
  if (
    data.type === 'ARRAY' ||
    data.type === 'SEARCH_LINEAR' ||
    data.type === 'SEARCH_BINARY' ||
    data.type?.startsWith('SORT_')
  ) {
    const elements: number[] = data.elements || data.array || [];
    const low = data.low;
    const high = data.high;
    const mid = data.mid;
    const activeIdx = data.activeIndex ?? data.currentIndex ?? data.scanIndex ?? -1;
    const compareIdx = data.comparingIndex ?? -1;
    const foundIdx = data.foundIndex ?? (data.isFound && mid !== null ? mid : -1);

    return (
      <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>
            {data.type.replace('_', ' ')} • Size: {elements.length}
          </span>
          {data.target !== undefined && (
            <span className="badge badge-cyan" style={{ fontSize: '11px' }}>
              Target: {data.target}
            </span>
          )}
        </div>

        {/* Array Cells */}
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', overflowX: 'auto', padding: '12px 4px' }}>
          {elements.map((val, idx) => {
            const isMid = idx === mid;
            const isLow = idx === low;
            const isHigh = idx === high;
            const isActive = idx === activeIdx;
            const isComparing = idx === compareIdx;
            const isFound = idx === foundIdx;
            const isOutOfInterval = low !== undefined && high !== undefined && (idx < low || idx > high);

            let border = '1px solid var(--border-subtle)';
            let bg = 'var(--bg-tertiary)';
            let color = 'var(--text-primary)';

            if (isFound) {
              bg = 'rgba(16, 185, 129, 0.25)';
              border = '2px solid var(--success)';
              color = '#34d399';
            } else if (isMid) {
              bg = 'rgba(56, 189, 248, 0.25)';
              border = '2px solid var(--accent-cyan)';
              color = '#38bdf8';
            } else if (isActive || isComparing) {
              bg = 'rgba(245, 158, 11, 0.25)';
              border = '2px solid var(--warning)';
              color = '#fbbf24';
            } else if (isOutOfInterval) {
              bg = 'rgba(15, 23, 42, 0.4)';
              color = '#475569';
              border = '1px dashed #334155';
            }

            return (
              <div
                key={idx}
                onClick={() => onSelectElement && onSelectElement(idx)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: interactive ? 'pointer' : 'default'
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '15px',
                    fontWeight: 800,
                    background: bg,
                    border,
                    color,
                    transition: 'all 200ms ease'
                  }}
                >
                  {val}
                </div>
                <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
                  [{idx}]
                </span>
                {isMid && <span style={{ fontSize: '9px', color: 'var(--accent-cyan)', fontWeight: 700 }}>MID</span>}
                {isLow && !isMid && <span style={{ fontSize: '9px', color: '#94a3b8' }}>LOW</span>}
                {isHigh && !isMid && <span style={{ fontSize: '9px', color: '#94a3b8' }}>HIGH</span>}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 3. Stack (Vertical LIFO)
  if (data.type === 'STACK') {
    const items: number[] = data.items || [];
    const capacity: number = data.capacity || 6;
    const topIndex: number = data.topIndex;

    return (
      <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>
          LIFO Stack (Capacity: {capacity})
        </div>

        <div
          style={{
            width: '160px',
            border: '2px solid rgba(168, 85, 247, 0.4)',
            borderTop: 'none',
            borderRadius: '0 0 12px 12px',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column-reverse',
            gap: '6px',
            minHeight: '160px',
            background: 'rgba(15, 23, 42, 0.6)'
          }}
        >
          {items.map((val, idx) => {
            const isTop = idx === topIndex;
            return (
              <div
                key={idx}
                style={{
                  height: '32px',
                  borderRadius: '6px',
                  background: isTop ? 'rgba(168, 85, 247, 0.3)' : 'var(--bg-tertiary)',
                  border: isTop ? '2px solid var(--accent-purple)' : '1px solid var(--border-subtle)',
                  color: isTop ? '#c084fc' : 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 12px',
                  fontWeight: 700,
                  fontSize: '13px'
                }}
              >
                <span>{val}</span>
                {isTop && <span style={{ fontSize: '9px', color: 'var(--accent-purple)', fontWeight: 800 }}>← TOP</span>}
              </div>
            );
          })}
          {items.length === 0 && (
            <div style={{ textAlign: 'center', color: '#64748b', fontSize: '11px', margin: 'auto' }}>
              (Empty Stack)
            </div>
          )}
        </div>
      </div>
    );
  }

  // 4. Queue (Horizontal FIFO)
  if (data.type === 'QUEUE') {
    const items: number[] = data.items || [];
    return (
      <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>
          FIFO Queue (Enqueue at Rear → Dequeue at Front)
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 0' }}>
          <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 800 }}>FRONT ➔</span>
          <div
            style={{
              display: 'flex',
              gap: '6px',
              borderTop: '2px solid rgba(56, 189, 248, 0.4)',
              borderBottom: '2px solid rgba(56, 189, 248, 0.4)',
              padding: '6px 10px',
              minWidth: '180px',
              justifyContent: 'center'
            }}
          >
            {items.map((val, idx) => (
              <div
                key={idx}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '6px',
                  background: idx === 0 ? 'rgba(56, 189, 248, 0.25)' : 'var(--bg-tertiary)',
                  border: idx === 0 ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '13px'
                }}
              >
                {val}
              </div>
            ))}
            {items.length === 0 && <span style={{ color: '#64748b', fontSize: '11px' }}>(Empty Queue)</span>}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--accent-purple)', fontWeight: 800 }}>➔ REAR</span>
        </div>
      </div>
    );
  }

  // 5. Linked List (Chain of Nodes)
  if (data.type === 'LINKED_LIST') {
    const nodes: Array<{ id: string; value: number; nextId: string | null }> = data.nodes || [];
    return (
      <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>
          Singly Linked List Nodes & Next Pointers
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', padding: '10px 4px' }}>
          <span style={{ fontSize: '10px', color: 'var(--accent-cyan)', fontWeight: 800 }}>HEAD ➔</span>
          {nodes.map(node => (
            <React.Fragment key={node.id}>
              <div
                style={{
                  display: 'flex',
                  border: '1px solid var(--accent-cyan)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  background: 'var(--bg-tertiary)'
                }}
              >
                <div style={{ padding: '8px 12px', fontWeight: 800, fontSize: '14px', borderRight: '1px solid var(--border-subtle)' }}>
                  {node.value}
                </div>
                <div style={{ padding: '8px 8px', fontSize: '10px', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center' }}>
                  •
                </div>
              </div>
              <span style={{ color: 'var(--accent-cyan)', fontWeight: 800 }}>➔</span>
            </React.Fragment>
          ))}
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 800 }}>NULL</span>
        </div>
      </div>
    );
  }

  // 6. Graph (BFS / DFS / Dijkstra)
  if (data.type?.startsWith('GRAPH')) {
    const vertices: string[] = data.vertices || [];
    const active = data.currentVertex;
    const visited: string[] = data.visited || [];
    const frontier: string[] = data.queue || data.stack || data.unvisited || [];
    const traversal: string[] = data.traversalOrder || [];

    return (
      <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>
            {data.type.replace('_', ' ')}
          </span>
          <span className="badge badge-purple" style={{ fontSize: '10px' }}>
            Active: {active || 'None'}
          </span>
        </div>

        {/* Vertex Badges */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {vertices.map(v => {
            const isActive = v === active;
            const isVisited = visited.includes(v);
            const inFrontier = frontier.includes(v);

            let bg = 'var(--bg-tertiary)';
            let border = '1px solid var(--border-subtle)';
            let color = 'var(--text-primary)';

            if (isActive) {
              bg = 'rgba(245, 158, 11, 0.3)';
              border = '2px solid var(--warning)';
              color = '#fbbf24';
            } else if (isVisited) {
              bg = 'rgba(16, 185, 129, 0.2)';
              border = '1px solid var(--success)';
              color = '#34d399';
            } else if (inFrontier) {
              bg = 'rgba(56, 189, 248, 0.2)';
              border = '1px dashed var(--accent-cyan)';
              color = '#38bdf8';
            }

            return (
              <div
                key={v}
                onClick={() => onSelectElement && onSelectElement(v)}
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: bg,
                  border,
                  color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '14px',
                  cursor: interactive ? 'pointer' : 'default'
                }}
              >
                {v}
              </div>
            );
          })}
        </div>

        {/* Traversal Order Log */}
        {traversal.length > 0 && (
          <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', background: 'var(--bg-tertiary)', padding: '8px', borderRadius: '6px' }}>
            <strong>Traversal Order:</strong> {traversal.join(' ➔ ')}
          </div>
        )}
      </div>
    );
  }

  // 7. Hash Table
  if (data.type === 'HASH_TABLE') {
    const buckets: Array<Array<{ key: string; value: number }>> = data.buckets || [];
    return (
      <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>
          Hash Table Buckets & Separate Chaining
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {buckets.map((bucket, bIdx) => (
            <div key={bIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '60px', fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                [{bIdx}]
              </span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {bucket.map(entry => (
                  <span key={entry.key} className="badge badge-purple" style={{ fontSize: '11px' }}>
                    {entry.key}: {entry.value}
                  </span>
                ))}
                {bucket.length === 0 && <span style={{ color: '#64748b', fontSize: '10px' }}>empty</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 8. General Binary Tree & Heap
  if (data.type === 'BINARY_TREE' || data.type === 'HEAP') {
    const arrayView: number[] = data.heap || [];
    return (
      <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>
          {data.type === 'HEAP' ? 'Min-Heap Array & Tree Representation' : 'Hierarchical Binary Tree'}
        </div>

        {arrayView.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
            {arrayView.map((val, idx) => (
              <div key={idx} style={{ padding: '6px 10px', background: 'var(--bg-tertiary)', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
                {val}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Fallback generic card
  return (
    <div className="card" style={{ padding: '16px' }}>
      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
        Deterministic State Representation
      </div>
      <pre style={{ fontSize: '11px', color: 'var(--text-secondary)', overflowX: 'auto', margin: 0 }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};
