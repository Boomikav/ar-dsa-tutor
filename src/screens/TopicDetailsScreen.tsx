import React, { useState, useEffect } from 'react';
import { useApp } from '../state/AppContext';
import { HeaderBar } from '../components/HeaderBar';
import { MasteryBadge } from '../components/MasteryBadge';
import { 
  BookOpen, 
  Play, 
  Box, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  GitBranch, 
  BrainCircuit, 
  MessageSquareCode
} from 'lucide-react';
import { TopicRelationshipSummary } from '../services/knowledgeGraph/IKnowledgeGraphService';
import { DSARegistry } from '../services/dsa/core/DSARegistry';
import { isARSupportedTopic } from '../data/topicsData';

export const TopicDetailsScreen: React.FC = () => {
  const { selectedTopic, learnerState, navigateTo, navigateToTutor, services } = useApp();
  const [prereqCheck, setPrereqCheck] = useState<{ satisfied: boolean; missingPrerequisiteTopicIds: string[] }>({
    satisfied: true,
    missingPrerequisiteTopicIds: []
  });
  const [relSummary, setRelSummary] = useState<TopicRelationshipSummary | null>(null);

  useEffect(() => {
    services.knowledgeGraphService.checkPrerequisitesSatisfied(selectedTopic.id, learnerState).then(res => {
      setPrereqCheck(res);
    });
    services.knowledgeGraphService.getRelationshipsForTopic(selectedTopic.id).then(summary => {
      setRelSummary(summary);
    });
  }, [selectedTopic, learnerState, services]);

  const topicMastery = learnerState.masteryMap[selectedTopic.id]?.masteryPercentage || 0;
  const currentDiff = learnerState.masteryMap[selectedTopic.id]?.currentDifficulty || 'FOUNDATIONAL';
  const isLocked = !prereqCheck.satisfied;
  const capability = DSARegistry.getVisualizationCapability(selectedTopic.id);

  // Curated learning objectives based on topic
  const isBst = selectedTopic.id === 'ds-binary-search-tree';
  const objectives = isBst ? [
    'Explain the core BST ordering invariant (Left < Root < Right)',
    'Trace step-by-step key insertion from root to leaf',
    'Trace logarithmic search and identify branch decision points',
    'Evaluate directional choices and recognize cognitive misconceptions',
    'Verify spatial node placement in augmented reality'
  ] : [
    `Understand fundamental ${selectedTopic.title} structural properties`,
    'Analyze time complexity across best, average, and worst cases',
    'Trace key operations step-by-step with visual representation',
    'Evaluate practical trade-offs and memory layout invariants'
  ];

  return (
    <div className="mobile-screen-content" style={{ background: 'var(--bg-primary)' }}>
      <HeaderBar
        title={selectedTopic.title}
        showBack
        onBack={() => navigateTo('topics')}
        rightAction={
          <MasteryBadge percentage={topicMastery} size="md" />
        }
      />

      <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Header Hero */}
        <section
          className="card card-glow-cyan"
          style={{
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
            <span className="badge badge-cyan" style={{ fontSize: '10px' }}>
              {selectedTopic.category === 'data-structure' ? 'DATA STRUCTURE' : 'ALGORITHM'}
            </span>
            <span className="badge badge-purple" style={{ fontSize: '10px' }}>
              CURRENT LEVEL: {currentDiff}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-tertiary)' }}>
              <Clock size={12} /> {selectedTopic.estimatedMinutes} min
            </div>
          </div>

          <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>
            {selectedTopic.title}
          </h2>

          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            {selectedTopic.detailedConcept}
          </p>

          {/* Complexity Chips */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginTop: '4px' }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '6px 8px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '9px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Best</div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-emerald)' }}>{selectedTopic.timeComplexity?.best || 'O(1)'}</div>
            </div>
            <div style={{ background: 'var(--bg-tertiary)', padding: '6px 8px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '9px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Average</div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-cyan)' }}>{selectedTopic.timeComplexity?.average || 'O(log N)'}</div>
            </div>
            <div style={{ background: 'var(--bg-tertiary)', padding: '6px 8px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '9px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Space</div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-purple)' }}>{selectedTopic.spaceComplexity || 'O(1)'}</div>
            </div>
          </div>
        </section>

        {/* Prerequisites Status */}
        <section
          className="card"
          style={{
            padding: '14px',
            border: isLocked ? '1px solid var(--accent-amber)' : '1px solid var(--border-card)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <GitBranch size={16} color={isLocked ? 'var(--accent-amber)' : 'var(--accent-emerald)'} />
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Prerequisites & Readiness
            </span>
          </div>

          {selectedTopic.prerequisites.length === 0 ? (
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0 }}>
              ✓ No prior prerequisites. Foundational entry point in the curriculum graph.
            </p>
          ) : isLocked ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: 'var(--accent-amber)', fontWeight: 600 }}>
                <AlertTriangle size={14} />
                <span>Prerequisites incomplete: Requires {prereqCheck.missingPrerequisiteTopicIds.join(', ')}</span>
              </div>
              <p style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', margin: 0 }}>
                You can still explore the theory, but recommended practice begins after prerequisite review.
              </p>
            </div>
          ) : (
            <p style={{ fontSize: '12.5px', color: 'var(--accent-emerald)', margin: 0, fontWeight: 600 }}>
              ✓ All prerequisites mastered ({selectedTopic.prerequisites.join(', ')}). Ready for full practice.
            </p>
          )}

          {relSummary && relSummary.dependentConcepts.length > 0 && (
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)' }}>
              Unlocks next in curriculum graph: <strong style={{ color: 'var(--accent-cyan)' }}>{relSummary.dependentConcepts.map(d => d.node.title).join(', ')}</strong>
            </div>
          )}
        </section>

        {/* Learning Objectives */}
        <section className="card" style={{ padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <CheckCircle2 size={16} color="var(--accent-cyan)" />
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              What You Will Learn
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {objectives.map((obj, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>•</span>
                <span>{obj}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Available Learning Activities */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.05em' }}>
            Available Activities
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              onClick={() => navigateTo('learning-session', selectedTopic)}
              className="card card-interactive"
              style={{ padding: '14px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '6px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <BookOpen size={18} color="var(--accent-cyan)" />
                <span className="badge badge-cyan" style={{ fontSize: '9px' }}>Learn</span>
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700 }}>Theory & Trace</div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Invariant walkthrough</div>
              </div>
            </button>

            <button
              onClick={() => navigateTo('learning-session', selectedTopic)}
              className="card card-interactive"
              style={{ padding: '14px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '6px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Play size={18} color="var(--accent-purple)" />
                <span className="badge badge-purple" style={{ fontSize: '9px' }}>Practice</span>
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700 }}>Guided Practice</div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Decision-making mode</div>
              </div>
            </button>

            <button
              onClick={() => isARSupportedTopic(selectedTopic.id) ? navigateTo('ar-session', selectedTopic) : navigateTo('learning-session', selectedTopic)}
              className={`card card-interactive ${isARSupportedTopic(selectedTopic.id) ? 'card-glow-cyan' : ''}`}
              style={{ padding: '14px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '6px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box size={18} color={isARSupportedTopic(selectedTopic.id) ? 'var(--accent-cyan)' : capability === '3D_READY' ? 'var(--accent-purple)' : 'var(--warning)'} />
                <span className={`badge ${isARSupportedTopic(selectedTopic.id) ? 'badge-cyan' : capability === '3D_READY' ? 'badge-purple' : 'badge-amber'}`} style={{ fontSize: '9px' }}>
                  {isARSupportedTopic(selectedTopic.id) ? 'AR Ready' : capability === '3D_READY' ? '3D Ready' : '2D Ready'}
                </span>
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700 }}>
                  {isARSupportedTopic(selectedTopic.id) ? 'WebXR AR Session' : capability === '3D_READY' ? 'Interactive 3D' : '2D Visualizer'}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                  {isARSupportedTopic(selectedTopic.id) ? 'Spatial camera session' : capability === '3D_READY' ? 'WebGL spatial scene' : 'Structural canvas/DOM'}
                </div>
              </div>
            </button>

            <button
              onClick={() => navigateTo('assessment', selectedTopic)}
              className="card card-interactive"
              style={{ padding: '14px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '6px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <BrainCircuit size={18} color="var(--accent-emerald)" />
                <span className="badge badge-emerald" style={{ fontSize: '9px' }}>Quiz</span>
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700 }}>Assessment</div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Test understanding</div>
              </div>
            </button>
          </div>

          <button
            onClick={() => navigateToTutor({
              topic: selectedTopic,
              initialQuery: `Can you explain the key concepts and properties of ${selectedTopic.title}?`
            })}
            className="btn btn-secondary"
            style={{ marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <MessageSquareCode size={16} />
            <span>Consult AI Tutor about {selectedTopic.title}</span>
          </button>
        </section>
      </div>
    </div>
  );
};
