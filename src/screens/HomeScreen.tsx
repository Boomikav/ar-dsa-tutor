import React, { useState, useEffect } from 'react';
import { useApp } from '../state/AppContext';
import { HeaderBar } from '../components/HeaderBar';
import { ProgressBar } from '../components/ProgressBar';
import { MasteryBadge } from '../components/MasteryBadge';
import { Recommendation } from '../models/recommendation';
import { 
  Flame, 
  CheckCircle2, 
  Play, 
  Box, 
  ArrowRight, 
  MessageSquareCode, 
  BrainCircuit,
  Sparkles
} from 'lucide-react';

export const HomeScreen: React.FC = () => {
  const { learnerState, topics, navigateTo, services } = useApp();
  const [topRec, setTopRec] = useState<Recommendation | null>(null);

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const recs = await services.recommendationService.getRecommendations(learnerState, services.knowledgeGraphService);
        if (recs && recs.length > 0) {
          setTopRec(recs[0]);
        }
      } catch (err) {
        console.error('Failed to load recommendations', err);
      }
    };
    fetchRecs();
  }, [learnerState, services]);

  const currentGoalTopic = topics.find(t => t.id === (learnerState.currentGoalTopicId || 'ds-binary-search-tree')) || topics.find(t => t.id === 'ds-binary-search-tree') || topics[0];
  const goalTopicRecord = learnerState.masteryMap[currentGoalTopic.id];
  const goalMastery = goalTopicRecord?.masteryPercentage || 0;
  const goalDifficulty = goalTopicRecord?.currentDifficulty || 'MEDIUM';
  const goalConfidence = Math.round((goalTopicRecord?.confidence || 0.4) * 100);
  const goalIndependent = goalTopicRecord?.independentSuccessRate ?? 65;
  const goalTrend = goalTopicRecord?.masteryTrend || 'STABLE';

  // Calculate overall metrics
  const _completedCount = learnerState.history.completedTopicIds.length;
  const totalMasterySum = Object.values(learnerState.masteryMap).reduce((acc, curr) => acc + curr.masteryPercentage, 0);
  const _averageMastery = topics.length > 0 ? Math.round(totalMasterySum / topics.length) : 0;

  const getTrendIcon = (trend: string) => {
    if (trend === 'IMPROVING') return <span style={{ color: 'var(--accent-emerald)' }}>↑ Improving</span>;
    if (trend === 'DECLINING') return <span style={{ color: 'var(--accent-rose)' }}>↓ Declining</span>;
    return <span style={{ color: 'var(--accent-cyan)' }}>→ Stable</span>;
  };

  return (
    <div className="mobile-screen-content">
      <HeaderBar
        title="Dashboard"
        rightAction={
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span className="badge badge-amber" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              <Flame size={12} /> {learnerState.history.dailyStreak}d
            </span>
          </div>
        }
      />

      <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Welcome Header */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '2px' }} aria-label="Student greeting">
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
            Academic Profile • {learnerState.profile.academicLevel}
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '2px 0 0' }}>
            Welcome back, <span style={{ color: 'var(--accent-cyan)' }}>{learnerState.profile.fullName.split(' ')[0]}</span>
          </h2>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0 }}>
            Continue your DSA journey.
          </p>
        </section>

        {/* Quick Dual CTAs: AR Mode & AI Tutor */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
          <button
            onClick={() => navigateTo('ar-session', currentGoalTopic)}
            className="card card-interactive card-glow-cyan"
            style={{
              padding: '12px',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '86px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="badge badge-cyan" style={{ fontSize: '9px', padding: '1px 6px' }}>WebXR Ready</span>
              <Box size={18} color="var(--accent-cyan)" />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Start AR Mode
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>
                3D Spatial Canvas
              </div>
            </div>
          </button>

          <button
            onClick={() => navigateTo('ai-tutor', currentGoalTopic)}
            className="card card-interactive card-glow-purple"
            style={{
              padding: '12px',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '86px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="badge badge-purple" style={{ fontSize: '9px', padding: '1px 6px' }}>AI Tutor</span>
              <MessageSquareCode size={18} color="var(--accent-purple)" />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Consult AI
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>
                Socratic Explanations
              </div>
            </div>
          </button>
        </div>

        {/* AR Ready Algorithms Quick Carousel */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Sparkles size={13} color="var(--accent-cyan)" /> AR-Ready Algorithms (5)
            </span>
            <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', cursor: 'pointer' }} onClick={() => navigateTo('topics')}>
              Explore All →
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
            {[
              { id: 'ds-binary-search-tree', name: 'Binary Search Tree', icon: '🌳', badge: 'Tree' },
              { id: 'algo-bubble-sort', name: 'Bubble Sort', icon: '🫧', badge: 'Sort' },
              { id: 'algo-binary-search', name: 'Binary Search', icon: '🎯', badge: 'Search' },
              { id: 'algo-breadth-first-search', name: 'BFS Graph', icon: '🕸️', badge: 'Graph' },
              { id: 'ds-stack', name: 'Stack (LIFO)', icon: '🥞', badge: 'LIFO' }
            ].map(item => {
              const topicObj = topics.find(t => t.id === item.id);
              if (!topicObj) return null;
              return (
                <button
                  key={item.id}
                  onClick={() => navigateTo('ar-session', topicObj)}
                  className="card card-interactive card-glow-cyan"
                  style={{
                    minWidth: '135px',
                    padding: '12px',
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '8px',
                    flexShrink: 0
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '20px' }}>{item.icon}</span>
                    <span className="badge badge-cyan" style={{ fontSize: '8.5px', padding: '1px 5px' }}>{item.badge}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '2px', marginTop: '2px' }}>
                      <Sparkles size={10} /> WebXR AR
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Continue Learning Active Topic Card */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Continue Learning
            </span>
            <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', cursor: 'pointer' }} onClick={() => navigateTo('topics')}>
              View all 20 →
            </span>
          </div>

          <div
            className="card card-glow-cyan"
            style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span className="badge badge-cyan">{goalDifficulty}</span>
                  <span className="badge badge-emerald">{goalMastery}% Mastery</span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '2px 0 0' }}>{currentGoalTopic.title}</h3>
              </div>
              <MasteryBadge percentage={goalMastery} size="md" />
            </div>

            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0, lineClamp: 2, WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {currentGoalTopic.shortDescription}
            </p>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                <span>Concept Mastery</span>
                <span>{goalMastery}%</span>
              </div>
              <ProgressBar progressPercentage={goalMastery} color="cyan" height={6} />
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <button
                onClick={() => navigateTo('learning-session', currentGoalTopic)}
                className="btn btn-primary btn-full"
                style={{ fontSize: '13px', padding: '9px 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Play size={14} /> Continue
              </button>
              <button
                onClick={() => navigateTo('topic-details', currentGoalTopic)}
                className="btn btn-secondary"
                style={{ fontSize: '12px', padding: '8px 12px' }}
                title="Topic Details"
              >
                Details
              </button>
              <button
                onClick={() => navigateTo('ar-session', currentGoalTopic)}
                className="btn btn-secondary"
                style={{ fontSize: '12px', padding: '8px 12px', color: 'var(--accent-cyan)' }}
                title="Launch in AR"
              >
                <Box size={14} />
              </button>
            </div>
          </div>
        </section>

        {/* Current Topic Mastery Overview */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Current Mastery State
          </span>

          <div
            className="card"
            style={{
              padding: '14px',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '10px',
              textAlign: 'center'
            }}
          >
            <div>
              <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Mastery</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '2px' }}>
                {goalMastery}%
              </div>
            </div>

            <div>
              <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Confidence</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-purple)', marginTop: '2px' }}>
                {goalConfidence}%
              </div>
            </div>

            <div>
              <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Independent</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: '2px' }}>
                {goalIndependent}%
              </div>
            </div>

            <div style={{ gridColumn: 'span 3', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px', display: 'flex', justifyContent: 'space-around', fontSize: '11.5px' }}>
              <div>
                <span style={{ color: 'var(--text-tertiary)' }}>Level: </span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{goalDifficulty}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-tertiary)' }}>Trend: </span>
                <span style={{ fontWeight: 700 }}>{getTrendIcon(goalTrend)}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Recommended Next Actions */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Recommended Next Activity
            </span>
            <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', cursor: 'pointer' }} onClick={() => navigateTo('recommendations')}>
              More details →
            </span>
          </div>

          {topRec ? (
            <div
              className="card card-interactive"
              onClick={() => {
                const targetTopic = topics.find(t => t.id === topRec.targetTopicId);
                if (targetTopic) {
                  navigateTo('learning-session', targetTopic);
                } else {
                  navigateTo('recommendations');
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderLeft: '3px solid var(--accent-purple)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', background: 'var(--accent-purple-glow)', color: 'var(--accent-purple)' }}>
                  <BrainCircuit size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {topRec.title}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {topRec.reason.headline} • {topRec.estimatedMinutes}m estimated
                  </div>
                </div>
              </div>
              <ArrowRight size={16} color="var(--text-tertiary)" />
            </div>
          ) : (
            <div
              className="card"
              style={{ padding: '14px', textAlign: 'center', color: 'var(--text-secondary)' }}
            >
              <p style={{ margin: 0, fontSize: '12.5px' }}>
                Complete a few learning activities and personalized recommendations will appear here.
              </p>
            </div>
          )}
        </section>

        {/* Recent Activity Feed */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Recent Activity
          </span>

          {learnerState.history.assessmentHistory.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {learnerState.history.assessmentHistory.slice(0, 3).map(asmt => {
                const topic = topics.find(t => t.id === asmt.topicId);
                return (
                  <div
                    key={asmt.id}
                    className="card"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={16} color="var(--success)" />
                      <div>
                        <div style={{ fontSize: '12.5px', fontWeight: 600 }}>
                          {topic?.title || asmt.topicId} Assessment
                        </div>
                        <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)' }}>
                          {new Date(asmt.timestamp).toLocaleDateString()} • {asmt.correctCount}/{asmt.totalQuestions} correct
                        </div>
                      </div>
                    </div>
                    <span className="badge badge-emerald">{asmt.scorePercentage}%</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              className="card"
              style={{
                padding: '16px',
                textAlign: 'center',
                color: 'var(--text-tertiary)',
                fontSize: '12.5px'
              }}
            >
              Your learning history will appear after your first activity.
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
