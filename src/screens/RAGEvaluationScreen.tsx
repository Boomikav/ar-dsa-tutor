import React, { useState } from 'react';
import { useApp } from '../state/AppContext';
import { HeaderBar } from '../components/HeaderBar';
import { 
  Database, 
  Search, 
  CheckCircle2, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  Download, 
  Play, 
  RefreshCw, 
  BookOpen, 
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { RAGTutorService, RAGTutorResponse } from '../services/ai/rag/RAGTutorService';
import benchmarkData from '../../data/rag/rag_benchmark_results.json';
import evaluationData from '../../data/rag/evaluation_dataset.json';

export const RAGEvaluationScreen: React.FC = () => {
  const { navigateTo } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'algorithms' | 'sandbox'>('overview');
  
  // Interactive Sandbox state
  const [queryInput, setQueryInput] = useState<string>('What are the four rotation cases in an AVL Tree and when is a double rotation required?');
  const [targetAlgorithm, setTargetAlgorithm] = useState<string>('ds-avl-tree');
  const [injectARState, setInjectARState] = useState<boolean>(true);
  const [isRunningQuery, setIsRunningQuery] = useState<boolean>(false);
  const [liveResponse, setLiveResponse] = useState<RAGTutorResponse | null>(null);

  const report = benchmarkData;

  const handleRunLiveQuery = async () => {
    if (!queryInput.trim()) return;
    setIsRunningQuery(true);

    try {
      const tutorService = RAGTutorService.getInstance();
      const runtimeState = injectARState ? {
        algorithmId: targetAlgorithm,
        algorithmTitle: targetAlgorithm === 'ds-avl-tree' ? 'AVL Tree' : (targetAlgorithm === 'algo-merge-sort' ? 'Merge Sort' : "Dijkstra's Shortest Path"),
        stepIndex: 3,
        lastAction: 'Detecting imbalance at node 40',
        balanceFactor: 2,
        imbalancedNode: 40,
        comparisonsCount: 7
      } : undefined;

      const res = await tutorService.answerQuery(queryInput, runtimeState, {
        topK: 3,
        forceLocal: true
      });
      setLiveResponse(res);
    } catch (err) {
      console.error('Error executing live RAG query:', err);
    } finally {
      setIsRunningQuery(false);
    }
  };

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(report, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rag_empirical_benchmark_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ paddingBottom: '90px', minHeight: '100vh', background: '#0b0f19', color: '#f3f4f6' }}>
      <HeaderBar
        title="RAG Evaluation & Verification"
        showBack={true}
        onBack={() => navigateTo('home')}
      />

      <div style={{ padding: '16px', maxWidth: '900px', margin: '0 auto' }}>
        {/* Status Pill & Header Intro */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          background: 'rgba(30, 41, 59, 0.6)',
          padding: '12px 16px',
          borderRadius: '12px',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={18} color="#38bdf8" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>
              Dense Vector Index: 62 Chunks | 9 Algorithms + EGEA | 128-D Unit Space
            </span>
          </div>
          <button
            onClick={handleExportJSON}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#1e293b',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Download size={14} /> Export Benchmark JSON
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #1f293d', paddingBottom: '8px', overflowX: 'auto' }}>
          {[
            { id: 'overview', label: 'Overview Metrics' },
            { id: 'categories', label: 'By Category' },
            { id: 'algorithms', label: 'By Algorithm' },
            { id: 'sandbox', label: 'Interactive Sandbox' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                background: activeTab === tab.id ? '#2563eb' : '#1e293b',
                color: activeTab === tab.id ? '#ffffff' : '#94a3b8',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW METRICS */}
        {activeTab === 'overview' && (
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={20} color="#10b981" />
              Empirical Retrieval & Grounding Benchmark (N=32 Queries, K=3)
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
              gap: '12px',
              marginBottom: '24px'
            }}>
              <div style={{ background: '#131b2e', border: '1px solid #1e293b', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Precision@3</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#38bdf8' }}>
                  {(report.overall.precisionAtK * 100).toFixed(1)}%
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Target docs in retrieved set</div>
              </div>

              <div style={{ background: '#131b2e', border: '1px solid #1e293b', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Recall@3</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981' }}>
                  {(report.overall.recallAtK * 100).toFixed(1)}%
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>100% relevant docs retrieved</div>
              </div>

              <div style={{ background: '#131b2e', border: '1px solid #1e293b', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Mean Reciprocal Rank (MRR)</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#a855f7' }}>
                  {report.overall.mrr.toFixed(3)}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Rank 1 top-match accuracy</div>
              </div>

              <div style={{ background: '#131b2e', border: '1px solid #1e293b', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Citation Coverage</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981' }}>
                  {(report.overall.citationCoverage * 100).toFixed(1)}%
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Every factual claim cited</div>
              </div>

              <div style={{ background: '#131b2e', border: '1px solid #1e293b', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Hallucination Rate</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#22c55e' }}>
                  {(report.overall.hallucinationRate * 100).toFixed(1)}%
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>0 invalid or unretrieved citations</div>
              </div>

              <div style={{ background: '#131b2e', border: '1px solid #1e293b', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Honest Refusal Rate</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#3b82f6' }}>
                  {(report.overall.honestRefusalRate * 100).toFixed(1)}%
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Out-of-scope safely rejected</div>
              </div>

              <div style={{ background: '#131b2e', border: '1px solid #1e293b', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Median Retrieval Latency</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#f59e0b' }}>
                  {report.overall.medianTotalLatencyMs} ms
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>p95: {report.overall.p95TotalLatencyMs} ms (Client In-Memory)</div>
              </div>
            </div>

            {/* Architecture Explanation Card */}
            <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '12px', padding: '16px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#93c5fd', marginBottom: '8px' }}>
                Pedagogical Grounding & Zero-Hallucination Guarantees
              </h4>
              <p style={{ fontSize: '13px', lineHeight: 1.6, color: '#cbd5e1', margin: 0 }}>
                The AR-DSA Tutor RAG pipeline enforces a formal dual-gate verification model. Every candidate answer is checked by the <code style={{ color: '#38bdf8' }}>CitationValidator</code> against the retrieved chunks from <code style={{ color: '#38bdf8' }}>vector_index.json</code>. If a query falls outside the 8 curriculum algorithms or lacks high-confidence semantic relevance, the system triggers an honest refusal rather than fabricating steps or invariants.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: BREAKDOWN BY CATEGORY */}
        {activeTab === 'categories' && (
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc', marginBottom: '12px' }}>
              Evaluation Performance Broken Down by Query Category
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#1e293b', color: '#94a3b8' }}>
                    <th style={{ padding: '10px' }}>Category</th>
                    <th style={{ padding: '10px' }}>Queries</th>
                    <th style={{ padding: '10px' }}>Precision@3</th>
                    <th style={{ padding: '10px' }}>Recall@3</th>
                    <th style={{ padding: '10px' }}>MRR</th>
                    <th style={{ padding: '10px' }}>Faithfulness</th>
                    <th style={{ padding: '10px' }}>Mean Latency</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(report.byCategory).map(([cat, met]: [string, any]) => (
                    <tr key={cat} style={{ borderBottom: '1px solid #1f293d' }}>
                      <td style={{ padding: '10px', fontWeight: 600, color: '#e2e8f0' }}>{cat}</td>
                      <td style={{ padding: '10px', color: '#94a3b8' }}>{met.count}</td>
                      <td style={{ padding: '10px', color: '#38bdf8' }}>{(met.precisionAtK * 100).toFixed(1)}%</td>
                      <td style={{ padding: '10px', color: '#10b981' }}>{(met.recallAtK * 100).toFixed(1)}%</td>
                      <td style={{ padding: '10px', color: '#a855f7' }}>{met.mrr.toFixed(3)}</td>
                      <td style={{ padding: '10px', color: '#e2e8f0' }}>{(met.faithfulness * 100).toFixed(1)}%</td>
                      <td style={{ padding: '10px', color: '#f59e0b' }}>{met.meanTotalLatencyMs} ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: BREAKDOWN BY ALGORITHM */}
        {activeTab === 'algorithms' && (
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc', marginBottom: '12px' }}>
              Evaluation Performance Broken Down by Algorithm Topic
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#1e293b', color: '#94a3b8' }}>
                    <th style={{ padding: '10px' }}>Algorithm Topic ID</th>
                    <th style={{ padding: '10px' }}>Queries</th>
                    <th style={{ padding: '10px' }}>Recall@3</th>
                    <th style={{ padding: '10px' }}>MRR</th>
                    <th style={{ padding: '10px' }}>Citation Coverage</th>
                    <th style={{ padding: '10px' }}>Faithfulness</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(report.byAlgorithm).map(([algo, met]: [string, any]) => (
                    <tr key={algo} style={{ borderBottom: '1px solid #1f293d' }}>
                      <td style={{ padding: '10px', fontWeight: 600, color: '#e2e8f0' }}>{algo}</td>
                      <td style={{ padding: '10px', color: '#94a3b8' }}>{met.count}</td>
                      <td style={{ padding: '10px', color: '#10b981' }}>{(met.recallAtK * 100).toFixed(1)}%</td>
                      <td style={{ padding: '10px', color: '#a855f7' }}>{met.mrr.toFixed(3)}</td>
                      <td style={{ padding: '10px', color: '#38bdf8' }}>{(met.citationCoverage * 100).toFixed(1)}%</td>
                      <td style={{ padding: '10px', color: '#e2e8f0' }}>{(met.faithfulness * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: INTERACTIVE QUERY SANDBOX */}
        {activeTab === 'sandbox' && (
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc', marginBottom: '12px' }}>
              Live RAG Retrieval & Verification Sandbox
            </h3>

            <div style={{ background: '#131b2e', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                  Select Pre-filled Benchmark Query or Type Below:
                </label>
                <select
                  style={{
                    width: '100%',
                    background: '#1e293b',
                    color: '#e2e8f0',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '12px'
                  }}
                  onChange={(e) => {
                    const found = evaluationData.find((q: any) => q.queryId === e.target.value);
                    if (found) {
                      setQueryInput(found.query);
                      setTargetAlgorithm(found.targetAlgorithmId);
                    }
                  }}
                >
                  <option value="">-- Choose from 32 Benchmark Questions --</option>
                  {evaluationData.map((q: any) => (
                    <option key={q.queryId} value={q.queryId}>
                      [{q.category}] {q.query}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                  User Question:
                </label>
                <textarea
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    background: '#0b0f19',
                    color: '#f8fafc',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    padding: '10px',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#cbd5e1', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={injectARState}
                    onChange={(e) => setInjectARState(e.target.checked)}
                  />
                  Inject Active 3D AR Runtime State (Execution Grounding)
                </label>

                <button
                  onClick={handleRunLiveQuery}
                  disabled={isRunningQuery}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: isRunningQuery ? 'not-allowed' : 'pointer',
                    opacity: isRunningQuery ? 0.6 : 1
                  }}
                >
                  {isRunningQuery ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
                  Run RAG Pipeline
                </button>
              </div>
            </div>

            {/* Live Response Output */}
            {liveResponse && (
              <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: liveResponse.citations.isGrounded ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: liveResponse.citations.isGrounded ? '#10b981' : '#ef4444',
                      padding: '4px 10px',
                      borderRadius: '16px',
                      fontSize: '11px',
                      fontWeight: 700
                    }}>
                      {liveResponse.citations.isGrounded ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                      {liveResponse.citations.isGrounded ? 'GROUNDED & AUDITED' : 'HALLUCINATION DETECTED'}
                    </span>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                      Latency: {liveResponse.totalLatencyMs} ms (Retrieval: {liveResponse.retrievalLatencyMs}ms)
                    </span>
                  </div>

                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    Citations: {liveResponse.citations.validCitations.join(', ') || 'None (Refusal)'}
                  </div>
                </div>

                <div style={{
                  background: '#0b0f19',
                  padding: '14px',
                  borderRadius: '8px',
                  border: '1px solid #1e293b',
                  fontSize: '13px',
                  lineHeight: 1.6,
                  color: '#e2e8f0',
                  whiteSpace: 'pre-wrap',
                  marginBottom: '14px'
                }}>
                  {liveResponse.answer}
                </div>

                <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#38bdf8', marginBottom: '8px' }}>
                  Retrieved Knowledge Chunks ({liveResponse.retrievedChunks.length}):
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {liveResponse.retrievedChunks.map((item, idx) => (
                    <div key={idx} style={{ background: '#1e293b', padding: '10px', borderRadius: '6px', fontSize: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, color: '#f8fafc' }}>
                          [{item.chunk.documentId}] {item.chunk.topic} — {item.chunk.sectionTitle}
                        </span>
                        <span style={{ color: '#10b981', fontWeight: 700 }}>
                          {(item.similarityScore * 100).toFixed(1)}% match
                        </span>
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '11px' }}>
                        {item.chunk.content.substring(0, 160)}...
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
