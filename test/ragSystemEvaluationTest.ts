/**
 * Comprehensive RAG System Evaluation & Regression Test Suite
 * 
 * Verifies:
 * 1. VectorStore index loading, dimensions, and chunk counts
 * 2. Deterministic embedding stability
 * 3. Exact Top-K cosine similarity retrieval
 * 4. Grounded citation validation and hallucination rejection
 * 5. Out-of-scope honest refusal gating
 * 6. Empirical IR and QA metric benchmarks (Precision, Recall, MRR, nDCG, Latency)
 */

import { VectorStore } from '../src/services/ai/rag/VectorStore';
import { generateDeterministicEmbedding } from '../src/services/ai/rag/types';
import { CitationValidator } from '../src/services/ai/rag/CitationValidator';
import { RAGContextBuilder } from '../src/services/ai/rag/RAGContextBuilder';
import { RAGTutorService } from '../src/services/ai/rag/RAGTutorService';
import { RAGEvaluationEngine, EvaluationQuery } from '../src/services/evaluation/RAGEvaluationEngine';
import evaluationData from '../data/rag/evaluation_dataset.json';

export async function runRAGSystemEvaluationSuite(): Promise<{ suite: string; passed: number; failed: number; errors: string[] }> {
  const errors: string[] = [];
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      passed++;
    } else {
      failed++;
      errors.push(msg);
    }
  }

  // TEST 1: Vector Store Initialization & Metadata
  const store = VectorStore.getInstance();
  const meta = store.getIndexMetadata();
  assert(meta.totalDocuments === 9, `Expected 9 documents in index, got ${meta.totalDocuments}`);
  assert(meta.totalChunks === 62, `Expected 62 chunks in index, got ${meta.totalChunks}`);
  assert(meta.vectorDimensions === 128, `Expected 128 vector dimensions, got ${meta.vectorDimensions}`);

  // TEST 2: Deterministic Embedding Generation
  const v1 = generateDeterministicEmbedding('AVL Tree Rotations');
  const v2 = generateDeterministicEmbedding('AVL Tree Rotations');
  assert(v1.length === 128, `Embedding length must be 128, got ${v1.length}`);
  let identical = true;
  for (let i = 0; i < 128; i++) {
    if (v1[i] !== v2[i]) {
      identical = false;
      break;
    }
  }
  assert(identical, 'Embeddings must be strictly reproducible and deterministic');

  // TEST 3: Vector Store Cosine Similarity Dot Product
  const dot = VectorStore.dotProduct(v1, v2);
  assert(Math.abs(dot - 1.0) < 0.001, `Unit vector self-dot-product must be ~1.0, got ${dot}`);

  // TEST 4: Query Retrieval Top-1 Alignment
  const avlRes = store.search('How does an AVL Tree balance factor work?');
  assert(avlRes.results.length === 3, `Expected 3 results, got ${avlRes.results.length}`);
  assert(avlRes.results[0].chunk.documentId === 'DOC-AVL-01', `Top result must be DOC-AVL-01, got ${avlRes.results[0].chunk.documentId}`);
  assert(avlRes.hasSufficientContext, 'AVL query must have sufficient context');

  const dijkstraRes = store.search('What is relaxation in Dijkstra shortest path?');
  assert(dijkstraRes.results[0].chunk.documentId === 'DOC-DIJ-01', `Top result must be DOC-DIJ-01, got ${dijkstraRes.results[0].chunk.documentId}`);

  const mergeRes = store.search('How does Merge Sort divide and conquer subarrays?');
  assert(mergeRes.results[0].chunk.documentId === 'DOC-MRG-01', `Top result must be DOC-MRG-01, got ${mergeRes.results[0].chunk.documentId}`);

  // TEST 5: Out of Scope Queries Trigger Insufficient Context
  const oosRes1 = store.search('How does Bellman-Ford detect negative cycles?');
  assert(!oosRes1.hasSufficientContext, 'Bellman-Ford query must flag insufficient context');

  const oosRes2 = store.search('Explain quantum entanglement and BB84 cryptography');
  assert(!oosRes2.hasSufficientContext, 'Quantum query must flag insufficient context');

  // TEST 6: Citation Validator
  const sampleRetrieved = avlRes.results;
  const validText = 'AVL tree maintains balance factors between -1 and +1 [DOC-AVL-01].';
  const valResult1 = CitationValidator.validate(validText, sampleRetrieved, true);
  assert(valResult1.isGrounded, 'Valid citation must be marked grounded');
  assert(valResult1.validCitations.includes('DOC-AVL-01'), 'DOC-AVL-01 must be recognized as valid');
  assert(valResult1.hallucinatedCitations.length === 0, 'No hallucinated citations expected');
  assert(valResult1.citationCoverage === 1.0, 'Citation coverage should be 1.0');

  // TEST 7: Hallucinated Citation Detection
  const hallucinatedText = 'AVL trees were invented in 1962 [DOC-AVL-01] but used quantum states [DOC-FAKE-99].';
  const valResult2 = CitationValidator.validate(hallucinatedText, sampleRetrieved, true);
  assert(!valResult2.isGrounded, 'Hallucinated citation must invalidate grounding');
  assert(valResult2.hallucinatedCitations.includes('DOC-FAKE-99'), 'DOC-FAKE-99 must be caught as hallucinated');
  assert(valResult2.unsupportedClaimsRate > 0, 'Unsupported claims rate must be > 0');

  // TEST 8: RAG Context Builder
  const builtPrompt = RAGContextBuilder.buildPrompt('What is AVL balance?', sampleRetrieved, {
    algorithmId: 'ds-avl-tree',
    algorithmTitle: 'AVL Tree',
    stepIndex: 4,
    balanceFactor: 2,
    imbalancedNode: 40
  });
  assert(builtPrompt.includes('DOC-AVL-01'), 'Prompt must contain retrieved doc ID');
  assert(builtPrompt.includes('Imbalanced Node: 40'), 'Prompt must contain active 3D runtime state');
  assert(builtPrompt.includes('RULES:'), 'Prompt must contain citation and grounding rules');

  // TEST 9: RAGTutorService End-to-End Query
  const tutorService = RAGTutorService.getInstance();
  const tutorResp = await tutorService.answerQuery('What is the time complexity of Merge Sort?', {
    algorithmId: 'algo-merge-sort',
    algorithmTitle: 'Merge Sort',
    stepIndex: 2
  }, { forceLocal: true });

  assert(tutorResp.hasSufficientContext, 'Merge sort query must have sufficient context');
  assert(tutorResp.citations.isGrounded, 'Merge sort answer must be grounded');
  assert(tutorResp.answer.includes('DOC-MRG-01'), 'Merge sort answer must cite DOC-MRG-01');
  assert(tutorResp.totalLatencyMs < 20, `Latency must be under 20ms, got ${tutorResp.totalLatencyMs}ms`);

  // TEST 10: RAGTutorService Out-of-Scope Honest Refusal
  const oosTutorResp = await tutorService.answerQuery('Explain quantum computing entanglement', undefined, { forceLocal: true });
  assert(!oosTutorResp.hasSufficientContext, 'OOS query must have hasSufficientContext = false');
  assert(oosTutorResp.citations.insufficientContextHandled, 'Must handle insufficient context');
  assert(oosTutorResp.citations.isGrounded, 'Honest refusal must be marked grounded');
  assert(oosTutorResp.citations.hallucinatedCitations.length === 0, 'Honest refusal must have 0 hallucinations');

  // TEST 11: Empirical Benchmark Over Full 32-Query Dataset
  const evalEngine = new RAGEvaluationEngine(tutorService);
  const benchmarkReport = await evalEngine.evaluateDataset(evaluationData as unknown as EvaluationQuery[], 3);

  assert(benchmarkReport.totalQueries === 32, `Expected 32 benchmark queries, got ${benchmarkReport.totalQueries}`);
  assert(benchmarkReport.overall.precisionAtK >= 0.85, `Overall Precision@3 must be >= 85%, got ${(benchmarkReport.overall.precisionAtK * 100).toFixed(1)}%`);
  assert(benchmarkReport.overall.recallAtK >= 0.90, `Overall Recall@3 must be >= 90%, got ${(benchmarkReport.overall.recallAtK * 100).toFixed(1)}%`);
  assert(benchmarkReport.overall.mrr >= 0.90, `Overall MRR must be >= 0.90, got ${benchmarkReport.overall.mrr.toFixed(3)}`);
  assert(benchmarkReport.overall.ndcgAtK >= 0.90, `Overall nDCG@3 must be >= 0.90, got ${benchmarkReport.overall.ndcgAtK.toFixed(3)}`);
  assert(benchmarkReport.overall.citationCoverage >= 0.95, `Citation coverage must be >= 95%, got ${(benchmarkReport.overall.citationCoverage * 100).toFixed(1)}%`);
  assert(benchmarkReport.overall.hallucinationRate === 0.0, `Hallucination rate must be 0%, got ${(benchmarkReport.overall.hallucinationRate * 100).toFixed(1)}%`);
  assert(benchmarkReport.overall.honestRefusalRate === 1.0, `Honest refusal rate must be 100%, got ${(benchmarkReport.overall.honestRefusalRate * 100).toFixed(1)}%`);
  assert(benchmarkReport.overall.meanTotalLatencyMs < 20, `Mean total latency must be < 20ms, got ${benchmarkReport.overall.meanTotalLatencyMs}ms`);

  return {
    suite: 'RAG System Evaluation & Regression Benchmark',
    passed,
    failed,
    errors
  };
}

runRAGSystemEvaluationSuite().then(res => {
  console.log(`[${res.suite}] Passed: ${res.passed}, Failed: ${res.failed}`);
  if (res.errors.length > 0) {
    console.error(res.errors.join('\n'));
    process.exit(1);
  }
});
