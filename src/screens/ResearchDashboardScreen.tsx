import React, { useState } from 'react';
import { useApp } from '../state/AppContext';
import { HeaderBar } from '../components/HeaderBar';
import { ResearchDataManager } from '../services/evaluation/ResearchDataManager';
import { ResearchStatisticsEngine, DescriptiveStats, StatisticalTestResult, EffectSizeResult } from '../services/evaluation/ResearchStatisticsEngine';
import { RESEARCH_ASSESSMENT_BANK } from '../data/researchAssessments';
import { LearningOutcome } from '../models/research';

export const ResearchDashboardScreen: React.FC = () => {
  const { navigateTo } = useApp();
  const dataManager = ResearchDataManager.getInstance();
  const studyConfig = dataManager.getStudyConfiguration();

  const [activeTab, setActiveTab] = useState<'overview' | 'synthetic-pipeline' | 'assessment-bank' | 'data-quality'>('overview');

  const isEmpiricalAvailable = dataManager.isEmpiricalDataAvailable();
  const participantCount = dataManager.getAllParticipants().length;

  // Synthetic dataset for testing pipeline functionality only
  const [syntheticCohortA] = useState<number[]>([12, 14, 15, 18, 20, 22, 25, 26, 28, 30]); // Synthetic Control Gains
  const [syntheticCohortB] = useState<number[]>([18, 22, 24, 25, 28, 30, 32, 35, 36, 40]); // Synthetic Adaptive Gains

  const synthStatsA: DescriptiveStats = ResearchStatisticsEngine.calculateDescriptiveStats(syntheticCohortA);
  const synthStatsB: DescriptiveStats = ResearchStatisticsEngine.calculateDescriptiveStats(syntheticCohortB);
  const synthTTest: StatisticalTestResult = ResearchStatisticsEngine.welchTTest(syntheticCohortA, syntheticCohortB);
  const synthMWU: StatisticalTestResult = ResearchStatisticsEngine.mannWhitneyUTest(syntheticCohortA, syntheticCohortB);
  const synthCohensD: EffectSizeResult = ResearchStatisticsEngine.calculateCohensD(syntheticCohortB, syntheticCohortA);

  const sampleSyntheticOutcomes: LearningOutcome[] = [
    { participantId: 'SYNTH-01', condition: 'CONTROL', preTestScore: 40, postTestScore: 55, absoluteGain: 15, normalizedGain: 0.25, isComplete: true },
    { participantId: 'SYNTH-02', condition: 'AR_DSA_TUTOR', preTestScore: 40, postTestScore: 70, absoluteGain: 30, normalizedGain: 0.50, isComplete: true }
  ];

  const handleDownloadCSV = () => {
    const csv = dataManager.exportOutcomesAsCSV(sampleSyntheticOutcomes);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `research_outcomes_${studyConfig.studyId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJSON = () => {
    const json = dataManager.exportOutcomesAsJSON(sampleSyntheticOutcomes);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `research_outcomes_${studyConfig.studyId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ paddingBottom: '80px', minHeight: '100vh', background: '#0b0f19', color: '#f3f4f6' }}>
      <HeaderBar
        title="Research Evaluation Dashboard"
        showBack={true}
        onBack={() => navigateTo('settings')}
      />

      <div style={{ padding: '16px' }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto' }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'overview' ? '#3b82f6' : '#1f2937',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Empirical Status
          </button>
          <button
            onClick={() => setActiveTab('synthetic-pipeline')}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'synthetic-pipeline' ? '#3b82f6' : '#1f2937',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Statistical Pipeline (Synthetic)
          </button>
          <button
            onClick={() => setActiveTab('assessment-bank')}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'assessment-bank' ? '#3b82f6' : '#1f2937',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Assessment Bank ({RESEARCH_ASSESSMENT_BANK.length})
          </button>
          <button
            onClick={() => setActiveTab('data-quality')}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'data-quality' ? '#3b82f6' : '#1f2937',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Quality & Export
          </button>
        </div>

        {/* TAB 1: EMPIRICAL OVERVIEW (CRITICAL ANTI-FABRICATION CHECK) */}
        {activeTab === 'overview' && (
          <div>
            <div style={{
              background: '#111827',
              border: '1px solid #374151',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#60a5fa' }}>
                Study Protocol Metadata
              </h3>
              <div style={{ fontSize: '13px', color: '#9ca3af', lineHeight: '1.6' }}>
                <div><strong>Study ID:</strong> {studyConfig.studyId}</div>
                <div><strong>Protocol Version:</strong> {studyConfig.version}</div>
                <div><strong>Target Population:</strong> {studyConfig.targetPopulation}</div>
                <div><strong>Retention Evaluation Window:</strong> {studyConfig.delayedPostTestDays} days</div>
                <div><strong>Active Condition:</strong> {studyConfig.condition}</div>
              </div>
            </div>

            {!isEmpiricalAvailable ? (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid #ef4444',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚠️</div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#ef4444', fontWeight: 700 }}>
                  No empirical participant data available.
                </h4>
                <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#d1d5db', lineHeight: '1.5' }}>
                  Enrolled Participants: <strong>{participantCount}</strong>. Empirical learning gain, statistical significance, retention, and usability scores cannot be displayed because no human subjects have completed this study protocol.
                </p>
                <div style={{
                  background: '#1f2937',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#9ca3af',
                  textAlign: 'left',
                  lineHeight: '1.4'
                }}>
                  <strong>Ethical and Institutional Notice:</strong>
                  <br />
                  Human-subject evaluation requires appropriate institutional ethics/IRB approval and informed consent before recruitment or analysis of identifiable participant data.
                </div>
              </div>
            ) : (
              <div style={{
                background: '#111827',
                border: '1px solid #10b981',
                borderRadius: '12px',
                padding: '16px'
              }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#10b981' }}>Empirical Cohort Summary</h4>
                <p style={{ fontSize: '13px', color: '#9ca3af' }}>
                  Participants: {participantCount}
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SYNTHETIC PIPELINE VALIDATION */}
        {activeTab === 'synthetic-pipeline' && (
          <div>
            <div style={{
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid #f59e0b',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px',
              fontSize: '12px',
              color: '#fde68a',
              fontWeight: 600
            }}>
              ⚠️ SYNTHETIC TEST DATA — NOT EMPIRICAL (PIPELINE VALIDATION ONLY)
            </div>

            <div style={{
              background: '#111827',
              border: '1px solid #374151',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#93c5fd' }}>
                Pipeline Verification: Two-Arm Comparison
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div style={{ background: '#1f2937', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 600 }}>Synthetic Control Group</div>
                  <div style={{ fontSize: '13px', marginTop: '6px' }}>n = {synthStatsA.n}</div>
                  <div style={{ fontSize: '13px' }}>Mean Gain: {synthStatsA.mean}</div>
                  <div style={{ fontSize: '13px' }}>SD: {synthStatsA.standardDeviation}</div>
                  <div style={{ fontSize: '13px' }}>SEM: {synthStatsA.standardError}</div>
                </div>
                <div style={{ background: '#1f2937', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 600 }}>Synthetic Adaptive Group</div>
                  <div style={{ fontSize: '13px', marginTop: '6px' }}>n = {synthStatsB.n}</div>
                  <div style={{ fontSize: '13px' }}>Mean Gain: {synthStatsB.mean}</div>
                  <div style={{ fontSize: '13px' }}>SD: {synthStatsB.standardDeviation}</div>
                  <div style={{ fontSize: '13px' }}>SEM: {synthStatsB.standardError}</div>
                </div>
              </div>

              <div style={{ background: '#1f2937', padding: '12px', borderRadius: '8px', fontSize: '13px', lineHeight: '1.6' }}>
                <div><strong>Welch's t-test:</strong> t = {synthTTest.statistic}, df = {synthTTest.degreesOfFreedom}, p = {synthTTest.pValue}</div>
                <div><strong>Mann-Whitney U:</strong> U = {synthMWU.statistic}, p = {synthMWU.pValue}</div>
                <div><strong>Cohen's d:</strong> d = {synthCohensD.value} (95% CI: [{synthCohensD.ci95Lower}, {synthCohensD.ci95Upper}])</div>
                <div><strong>Interpretation:</strong> {synthCohensD.interpretation} effect</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: STANDARDIZED ASSESSMENT BANK */}
        {activeTab === 'assessment-bank' && (
          <div>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#93c5fd' }}>
              Standardized Assessment Items ({RESEARCH_ASSESSMENT_BANK.length})
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {RESEARCH_ASSESSMENT_BANK.map(q => (
                <div key={q.questionId} style={{
                  background: '#111827',
                  border: '1px solid #374151',
                  borderRadius: '10px',
                  padding: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px' }}>
                    <span style={{ color: '#60a5fa', fontWeight: 700 }}>{q.questionId}</span>
                    <span style={{
                      background: q.stage === 'PRETEST' ? '#374151' : q.stage === 'POSTTEST' ? '#1e3a8a' : '#065f46',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '10px'
                    }}>
                      {q.stage}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>{q.prompt}</div>
                  <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                    Topic: {q.topicId} | Dimension: {q.cognitiveDimension} | Difficulty: {q.difficulty}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: DATA QUALITY & EXPORT */}
        {activeTab === 'data-quality' && (
          <div>
            <div style={{
              background: '#111827',
              border: '1px solid #374151',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', color: '#93c5fd' }}>
                Privacy & Data Export
              </h4>
              <p style={{ fontSize: '13px', color: '#9ca3af', lineHeight: '1.5' }}>
                Exported files contain only research outcomes and pseudonymous tokens. All API keys, prompt logs, passwords, and private tokens are excluded.
              </p>
              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button
                  onClick={handleDownloadCSV}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: '#10b981',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Export CSV
                </button>
                <button
                  onClick={handleDownloadJSON}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: '#3b82f6',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Export JSON
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
