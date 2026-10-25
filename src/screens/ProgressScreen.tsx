import React, { useState, useEffect } from 'react';
import { useApp } from '../state/AppContext';
import { HeaderBar } from '../components/HeaderBar';
import { StatCard } from '../components/StatCard';
import { ProgressBar } from '../components/ProgressBar';
import { MasteryBadge } from '../components/MasteryBadge';
import { 
  Clock, 
  Target, 
  AlertCircle, 
  Layers, 
  Compass,
  TrendingUp,
  Brain,
  History,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import { AdaptationRecord } from '../models/adaptiveLearner';

export const ProgressScreen: React.FC = () => {
  const { learnerState, topics, navigateTo, services } = useApp();
  const [adaptations, setAdaptations] = useState<AdaptationRecord[]>([]);

  useEffect(() => {
    services.learnerService.getAdaptationHistory().then(setAdaptations);
  }, [services.learnerService, learnerState]);

  const dsTopics = topics.filter(t => t.category === 'data-structure');
  const algoTopics = topics.filter(t => t.category === 'algorithm');

  const dsMasterySum = dsTopics.reduce((acc, t) => acc + (learnerState.masteryMap[t.id]?.masteryPercentage || 0), 0);
  const algoMasterySum = algoTopics.reduce((acc, t) => acc + (learnerState.masteryMap[t.id]?.masteryPercentage || 0), 0);

  const dsAvg = Math.round(dsMasterySum / dsTopics.length);
  const algoAvg = Math.round(algoMasterySum / algoTopics.length);

  const reviewNeededList = topics.filter(t => learnerState.masteryMap[t.id]?.needsReview);

  return (
    <div className="mobile-screen-content">
      <HeaderBar title="Learning Analytics" />

      <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Metric Summary Cards */}
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <StatCard
            label="Total Study"
            value={`${learnerState.history.totalStudyMinutes}m`}
            subtext="Lifetime active"
            icon={<Clock size={16} />}
            accentColor="cyan"
          />
          <StatCard
            label="Assessments"
            value={learnerState.history.assessmentHistory.length}
            subtext="Completed"
            icon={<Target size={16} />}
            accentColor="purple"
          />
          <StatCard
            label="Streak"
            value={`${learnerState.history.dailyStreak}d`}
            subtext="Continuous"
            icon={<TrendingUp size={16} />}
            accentColor="emerald"
          />
        </div>

        {/* Category Competency Split */}
        <div className="card" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Domain Competency Split
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                <Layers size={14} color="var(--accent-cyan)" /> Data Structures ({dsAvg}%)
              </span>
              <span style={{ color: 'var(--text-tertiary)' }}>9 Topics</span>
            </div>
            <ProgressBar progressPercentage={dsAvg} color="cyan" height={6} />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                <Compass size={14} color="var(--accent-purple)" /> Algorithms ({algoAvg}%)
              </span>
              <span style={{ color: 'var(--text-tertiary)' }}>11 Topics</span>
            </div>
            <ProgressBar progressPercentage={algoAvg} color="purple" height={6} />
          </div>
        </div>

        {/* BST Deep Dive Sub-Skills Breakdown */}
        {(() => {
          const bstMastery = learnerState.masteryMap['ds-binary-search-tree'];
          const bstTopic = topics.find(t => t.id === 'ds-binary-search-tree');
          const subSkills = bstMastery?.subSkills || {
            conceptUnderstanding: 60,
            insertion: 50,
            search: 45,
            traversal: 30
          };

          return (
            <div className="card card-glow-cyan" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                    Core Data Structure Module
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '2px 0 0 0' }}>
                    Binary Search Tree Sub-Skills
                  </h3>
                </div>
                <MasteryBadge percentage={bstMastery?.masteryPercentage || 0} size="md" />
              </div>

              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                Granular competency matrix updated via interactive practice decisions & diagnostic assessments.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ background: 'var(--bg-tertiary)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600 }}>Concept Understanding</span>
                    <span style={{ color: 'var(--accent-cyan)' }}>{subSkills.conceptUnderstanding}%</span>
                  </div>
                  <ProgressBar progressPercentage={subSkills.conceptUnderstanding} color="cyan" height={4} />
                </div>

                <div style={{ background: 'var(--bg-tertiary)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600 }}>Insertion Decision</span>
                    <span style={{ color: 'var(--accent-purple)' }}>{subSkills.insertion}%</span>
                  </div>
                  <ProgressBar progressPercentage={subSkills.insertion} color="purple" height={4} />
                </div>

                <div style={{ background: 'var(--bg-tertiary)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600 }}>Search Invariant</span>
                    <span style={{ color: 'var(--accent-emerald)' }}>{subSkills.search}%</span>
                  </div>
                  <ProgressBar progressPercentage={subSkills.search} color="emerald" height={4} />
                </div>

                <div style={{ background: 'var(--bg-tertiary)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600 }}>Sorted Traversal</span>
                    <span style={{ color: 'var(--accent-amber)' }}>{subSkills.traversal}%</span>
                  </div>
                  <ProgressBar progressPercentage={subSkills.traversal} color="purple" height={4} />
                </div>
              </div>

              {bstTopic && (
                <button
                  onClick={() => navigateTo('learning-session', bstTopic)}
                  className="btn btn-secondary btn-full btn-sm"
                  style={{ marginTop: '2px', fontSize: '11.5px' }}
                >
                  Continue BST Practice & Evaluation →
                </button>
              )}
            </div>
          );
        })()}

        {/* PHASE 7: ADAPTIVE LEARNER MODELING & MEASURABLE ANALYTICS */}
        {(() => {
          const bstMastery = learnerState.masteryMap['ds-binary-search-tree'];
          const mastery = bstMastery?.masteryPercentage || 0;
          const confidence = Math.round((bstMastery?.confidence || 0.2) * 100);
          const indepSuccess = bstMastery?.independentSuccessRate ?? 0;
          const recentAcc = bstMastery?.recentPerformanceScore ?? 0;
          const currentDiff = bstMastery?.currentDifficulty || 'FOUNDATIONAL';
          const trend = bstMastery?.masteryTrend || 'INSUFFICIENT_DATA';
          const reviewReasons = bstMastery?.needsReviewReasons || [];

          return (
            <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.12)', color: 'var(--accent-cyan)' }}>
                    <Brain size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0 }}>
                      Adaptive Model & Measurable Analytics
                    </h3>
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                      Evidence-based evaluation & decoupled confidence scoring
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span 
                    style={{ 
                      fontSize: '10px', 
                      fontWeight: 800, 
                      padding: '3px 8px', 
                      borderRadius: '6px',
                      background: 'rgba(168, 85, 247, 0.15)',
                      color: '#c084fc',
                      border: '1px solid rgba(168, 85, 247, 0.3)'
                    }}
                  >
                    Level: {currentDiff}
                  </span>
                  <span 
                    style={{ 
                      fontSize: '10px', 
                      fontWeight: 800, 
                      padding: '3px 8px', 
                      borderRadius: '6px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                      background: trend === 'IMPROVING' ? 'rgba(34, 197, 94, 0.15)' : trend === 'DECLINING' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                      color: trend === 'IMPROVING' ? '#4ade80' : trend === 'DECLINING' ? '#f87171' : '#94a3b8',
                      border: `1px solid ${trend === 'IMPROVING' ? 'rgba(34, 197, 94, 0.3)' : trend === 'DECLINING' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(148, 163, 184, 0.3)'}`
                    }}
                  >
                    {trend === 'IMPROVING' ? <ArrowUpRight size={12} /> : trend === 'DECLINING' ? <ArrowDownRight size={12} /> : <Minus size={12} />}
                    {trend}
                  </span>
                </div>
              </div>

              {/* 4 Core Evidence-Based Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ background: 'var(--bg-tertiary)', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', marginBottom: '2px' }}>
                    Demonstrated Mastery
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                    {mastery}%
                  </div>
                  <div style={{ fontSize: '9.5px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                    Target problem-solving ability
                  </div>
                </div>

                <div style={{ background: 'var(--bg-tertiary)', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', marginBottom: '2px' }}>
                    Consistency & Confidence
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-purple)' }}>
                    {confidence}%
                  </div>
                  <div style={{ fontSize: '9.5px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                    Independence & streak stability
                  </div>
                </div>

                <div style={{ background: 'var(--bg-tertiary)', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', marginBottom: '2px' }}>
                    Independent Success
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                    {indepSuccess}%
                  </div>
                  <div style={{ fontSize: '9.5px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                    Solved without hints or AI help
                  </div>
                </div>

                <div style={{ background: 'var(--bg-tertiary)', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', marginBottom: '2px' }}>
                    Recent Window Accuracy
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-amber)' }}>
                    {recentAcc}%
                  </div>
                  <div style={{ fontSize: '9.5px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                    Rolling 5-attempt accuracy
                  </div>
                </div>
              </div>

              {/* Needs Review Reasons (Explainable Triggers) */}
              {reviewReasons.length > 0 && (
                <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '8px', padding: '10px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#f87171', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertCircle size={13} /> Active Review Triggers ({reviewReasons.length}):
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '10.5px', color: '#fca5a5' }}>
                    {reviewReasons.map((r, i) => (
                      <li key={i} style={{ marginBottom: '2px' }}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recent Adaptation Decisions Audit Trail */}
              {adaptations.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <History size={13} /> Recent Adaptation Decisions:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '140px', overflowY: 'auto' }}>
                    {adaptations.slice(0, 3).map((a) => (
                      <div 
                        key={a.id} 
                        style={{ 
                          background: 'var(--bg-tertiary)', 
                          padding: '8px 10px', 
                          borderRadius: '6px', 
                          fontSize: '10.5px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                            {a.previousDifficulty} → {a.newDifficulty} ({a.direction})
                          </span>
                          <span style={{ fontSize: '9px', color: 'var(--text-tertiary)' }}>
                            {new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div style={{ fontSize: '9.5px', color: 'var(--text-secondary)' }}>
                          {a.reasons[0] || 'Adaptive threshold adjustment based on learner evidence.'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Cognitive Retention Alerts */}
        {reviewNeededList.length > 0 && (
          <div className="card" style={{ padding: '14px', borderLeft: '3px solid var(--warning)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <AlertCircle size={16} color="var(--warning)" />
              <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--warning)' }}>
                Retention Review Flags ({reviewNeededList.length})
              </span>
            </div>
            <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: '0 0 8px 0' }}>
              The spaced repetition model detected retention decay in these concepts:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {reviewNeededList.map(t => (
                <button
                  key={t.id}
                  onClick={() => navigateTo('learning-session', t)}
                  className="badge badge-amber"
                  style={{ cursor: 'pointer', padding: '4px 8px' }}
                >
                  {t.title} →
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Full 20-Topic Mastery Breakdown Table */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            All 20 Curriculum Topics
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {topics.map(t => {
              const mastery = learnerState.masteryMap[t.id]?.masteryPercentage || 0;
              return (
                <div
                  key={t.id}
                  className="card card-interactive"
                  onClick={() => navigateTo('learning-session', t)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: mastery >= 70 ? 'var(--success)' : mastery > 0 ? 'var(--accent-cyan)' : 'var(--text-tertiary)'
                      }}
                    />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {t.title}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
                        {t.category === 'data-structure' ? 'Data Structure' : 'Algorithm'} • {t.difficulty}
                      </div>
                    </div>
                  </div>

                  <MasteryBadge percentage={mastery} />
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};
