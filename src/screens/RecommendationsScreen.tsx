import React, { useState, useEffect } from 'react';
import { useApp } from '../state/AppContext';
import { HeaderBar } from '../components/HeaderBar';
import { Recommendation } from '../models/recommendation';
import { 
  ArrowRight, 
  RotateCcw, 
  Box, 
  Compass, 
  Clock, 
  Lock,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

export const RecommendationsScreen: React.FC = () => {
  const { learnerState, services, topics, navigateTo } = useApp();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecs = async () => {
      setIsLoading(true);
      const list = await services.recommendationService.getRecommendations(
        learnerState,
        services.knowledgeGraphService
      );
      setRecommendations(list);
      setIsLoading(false);
    };
    fetchRecs();
  }, [learnerState, services]);

  const getIconForType = (type: string) => {
    switch (type) {
      case 'SPACED_REPETITION_DRILL':
        return <RotateCcw size={18} color="var(--warning)" />;
      case 'AR_SPATIAL_PRACTICE':
        return <Box size={18} color="var(--accent-cyan)" />;
      case 'REVISIT_PREREQUISITE':
        return <Lock size={18} color="var(--danger)" />;
      case 'SUPPORTING_CONCEPT_REINFORCEMENT':
        return <Layers size={18} color="var(--accent-cyan)" />;
      case 'RELATED_CONCEPT_EXPLORATION':
        return <Compass size={18} color="var(--accent-purple)" />;
      default:
        return <Sparkles size={18} color="var(--accent-purple)" />;
    }
  };

  const getBadgeForType = (type: string) => {
    switch (type) {
      case 'SPACED_REPETITION_DRILL':
        return <span className="badge badge-amber">Spaced Review</span>;
      case 'REVISIT_PREREQUISITE':
        return <span className="badge badge-rose">Prerequisite Gap</span>;
      case 'SUPPORTING_CONCEPT_REINFORCEMENT':
        return <span className="badge badge-cyan">Supporting Concept</span>;
      case 'RELATED_CONCEPT_EXPLORATION':
        return <span className="badge badge-purple">Related Concept</span>;
      case 'AR_SPATIAL_PRACTICE':
        return <span className="badge badge-cyan">3D AR Lab</span>;
      default:
        return <span className="badge badge-emerald">Next Step</span>;
    }
  };

  const handleAction = (rec: Recommendation) => {
    const targetTopic = topics.find(t => t.id === rec.targetTopicId);
    if (!targetTopic) return;

    if (rec.type === 'AR_SPATIAL_PRACTICE') {
      navigateTo('ar-session', targetTopic);
    } else {
      navigateTo('learning-session', targetTopic);
    }
  };

  return (
    <div className="mobile-screen-content">
      <HeaderBar title="Adaptive Next Steps" showBack />

      <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Architecture Banner */}
        <div
          style={{
            padding: '8px 12px',
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Info size={16} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
            Powered by <code>IRecommendationService</code> integrating pedagogical knowledge graph DAG and learner mastery.
          </p>
        </div>

        {/* List of Recommendations */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-secondary)' }}>
            Evaluating knowledge graph & mastery states...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {recommendations.map(rec => (
              <div
                key={rec.id}
                className="card card-interactive"
                onClick={() => handleAction(rec)}
                style={{
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        padding: '8px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-tertiary)'
                      }}
                    >
                      {getIconForType(rec.type)}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                        {getBadgeForType(rec.type)}
                        <span style={{ fontSize: '9px', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                          Priority {rec.priorityScore}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>
                        {rec.title}
                      </h3>
                    </div>
                  </div>

                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <Clock size={12} /> {rec.estimatedMinutes}m
                  </span>
                </div>

                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0 }}>
                  {rec.description}
                </p>

                {/* Algorithmic Reason Box */}
                <div
                  style={{
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderLeft: '2px solid var(--accent-cyan)',
                    fontSize: '11px'
                  }}
                >
                  <strong style={{ color: 'var(--accent-cyan)' }}>{rec.reason.headline}: </strong>
                  <span style={{ color: 'var(--text-tertiary)' }}>{rec.reason.detail}</span>
                </div>

                <button
                  className="btn btn-primary btn-sm"
                  style={{ alignSelf: 'flex-end', gap: '4px', fontSize: '11px' }}
                >
                  <span>{rec.actionText}</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            ))}

            {recommendations.length === 0 && (
              <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-secondary)' }}>
                No active recommendations at this time. All concepts are in good standing!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
