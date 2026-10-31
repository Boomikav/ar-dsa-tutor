/**
 * RAG Empirical Evaluation Engine
 * 
 * Computes standard Information Retrieval (IR) and Question Answering (QA) metrics:
 * - Precision@K, Recall@K, Mean Reciprocal Rank (MRR), nDCG@K
 * - Faithfulness & Key Concept Coverage
 * - Citation Coverage & Hallucinated Citation Rate
 * - Out-of-Scope Honest Refusal Rate
 * - Latency distributions (Mean, Median, p95)
 */

import { RAGTutorService, RAGTutorResponse } from '../ai/rag/RAGTutorService';

export interface EvaluationQuery {
  queryId: string;
  query: string;
  category: 'CONCEPTUAL' | 'COMPLEXITY' | 'TRACE' | 'COMPARISON' | 'EDGE_CASE' | 'OUT_OF_SCOPE' | string;
  targetAlgorithmId: string;
  expectedDocumentIds: string[];
  expectedKeyTerms: string[];
  isOutOfScope: boolean;
}

export interface QueryEvaluationResult {
  queryId: string;
  category: string;
  isOutOfScope: boolean;
  precisionAtK: number;
  recallAtK: number;
  reciprocalRank: number;
  ndcgAtK: number;
  faithfulnessScore: number;
  citationCoverage: number;
  hallucinatedCount: number;
  unsupportedClaimsRate: number;
  honestRefusal: boolean;
  retrievalLatencyMs: number;
  generationLatencyMs: number;
  totalLatencyMs: number;
  response: RAGTutorResponse;
}

export interface MetricSummary {
  count: number;
  precisionAtK: number;
  recallAtK: number;
  mrr: number;
  ndcgAtK: number;
  faithfulness: number;
  citationCoverage: number;
  hallucinationRate: number;
  honestRefusalRate: number;
  meanTotalLatencyMs: number;
  medianTotalLatencyMs: number;
  p95TotalLatencyMs: number;
  meanRetrievalLatencyMs: number;
}

export interface RAGBenchmarkReport {
  timestamp: string;
  totalQueries: number;
  kValue: number;
  overall: MetricSummary;
  byCategory: Record<string, MetricSummary>;
  byAlgorithm: Record<string, MetricSummary>;
  queryResults: QueryEvaluationResult[];
}

export class RAGEvaluationEngine {
  private readonly tutorService: RAGTutorService;

  constructor(tutorService?: RAGTutorService) {
    this.tutorService = tutorService || RAGTutorService.getInstance();
  }

  /**
   * Evaluates a full dataset of queries.
   */
  public async evaluateDataset(
    dataset: EvaluationQuery[],
    kValue: number = 3
  ): Promise<RAGBenchmarkReport> {
    const queryResults: QueryEvaluationResult[] = [];

    for (const item of dataset) {
      const res = await this.tutorService.answerQuery(item.query, undefined, {
        topK: kValue,
        forceLocal: true
      });

      const qResult = this.evaluateSingleQuery(item, res, kValue);
      queryResults.push(qResult);
    }

    const overall = this.aggregateMetrics(queryResults);

    // Group by category
    const byCategory: Record<string, MetricSummary> = {};
    const catMap = new Map<string, QueryEvaluationResult[]>();
    for (const qr of queryResults) {
      const list = catMap.get(qr.category) || [];
      list.push(qr);
      catMap.set(qr.category, list);
    }
    for (const [cat, list] of catMap.entries()) {
      byCategory[cat] = this.aggregateMetrics(list);
    }

    // Group by algorithm
    const byAlgorithm: Record<string, MetricSummary> = {};
    const algoMap = new Map<string, QueryEvaluationResult[]>();
    for (let i = 0; i < dataset.length; i++) {
      const algo = dataset[i].targetAlgorithmId;
      const list = algoMap.get(algo) || [];
      list.push(queryResults[i]);
      algoMap.set(algo, list);
    }
    for (const [algo, list] of algoMap.entries()) {
      byAlgorithm[algo] = this.aggregateMetrics(list);
    }

    return {
      timestamp: new Date().toISOString(),
      totalQueries: dataset.length,
      kValue,
      overall,
      byCategory,
      byAlgorithm,
      queryResults
    };
  }

  private evaluateSingleQuery(
    item: EvaluationQuery,
    response: RAGTutorResponse,
    k: number
  ): QueryEvaluationResult {
    const retrievedDocIds = response.retrievedChunks.map(c => c.chunk.documentId);
    const expectedSet = new Set(item.expectedDocumentIds);

    let precisionAtK = 0;
    let recallAtK = 0;
    let reciprocalRank = 0;
    let ndcgAtK = 0;
    let honestRefusal = false;

    if (item.isOutOfScope) {
      // For out of scope queries, the system should signal insufficient context
      honestRefusal = !response.hasSufficientContext && response.citations.insufficientContextHandled;
      precisionAtK = honestRefusal ? 1.0 : 0.0;
      recallAtK = honestRefusal ? 1.0 : 0.0;
      reciprocalRank = honestRefusal ? 1.0 : 0.0;
      ndcgAtK = honestRefusal ? 1.0 : 0.0;
    } else {
      // Standard in-scope IR metrics
      const uniqueRetrievedRelevant = new Set<string>();
      let dcg = 0;

      for (let rank = 0; rank < retrievedDocIds.length; rank++) {
        const docId = retrievedDocIds[rank];
        if (expectedSet.has(docId)) {
          uniqueRetrievedRelevant.add(docId);
          if (reciprocalRank === 0) {
            reciprocalRank = 1 / (rank + 1);
          }
          dcg += 1 / Math.log2(rank + 2);
        }
      }

      // Precision: fraction of retrieved chunks that point to relevant documents
      let relevantChunkCount = 0;
      for (const docId of retrievedDocIds) {
        if (expectedSet.has(docId)) relevantChunkCount++;
      }
      precisionAtK = retrievedDocIds.length > 0 ? relevantChunkCount / k : 0;
      
      // Recall: fraction of expected documents discovered in Top-K
      recallAtK = item.expectedDocumentIds.length > 0 
        ? Math.min(1.0, uniqueRetrievedRelevant.size / item.expectedDocumentIds.length) 
        : 1.0;

      // Ideal DCG for normalization
      let idcg = 0;
      const idealCount = Math.min(k, item.expectedDocumentIds.length);
      for (let i = 0; i < idealCount; i++) {
        idcg += 1 / Math.log2(i + 2);
      }
      ndcgAtK = idcg > 0 ? Math.min(1.0, dcg / idcg) : (dcg === 0 ? 1.0 : 0);
    }

    // Faithfulness & Key term coverage
    let faithfulnessScore = 0;
    if (item.isOutOfScope) {
      faithfulnessScore = honestRefusal ? 1.0 : 0.0;
    } else if (item.expectedKeyTerms.length > 0) {
      const ansLower = response.answer.toLowerCase();
      let matchedTerms = 0;
      for (const term of item.expectedKeyTerms) {
        if (ansLower.includes(term.toLowerCase())) {
          matchedTerms++;
        }
      }
      faithfulnessScore = matchedTerms / item.expectedKeyTerms.length;
    } else {
      faithfulnessScore = 1.0;
    }

    return {
      queryId: item.queryId,
      category: item.category,
      isOutOfScope: item.isOutOfScope,
      precisionAtK: Number(precisionAtK.toFixed(4)),
      recallAtK: Number(recallAtK.toFixed(4)),
      reciprocalRank: Number(reciprocalRank.toFixed(4)),
      ndcgAtK: Number(ndcgAtK.toFixed(4)),
      faithfulnessScore: Number(faithfulnessScore.toFixed(4)),
      citationCoverage: Number(response.citations.citationCoverage.toFixed(4)),
      hallucinatedCount: response.citations.hallucinatedCitations.length,
      unsupportedClaimsRate: Number(response.citations.unsupportedClaimsRate.toFixed(4)),
      honestRefusal,
      retrievalLatencyMs: response.retrievalLatencyMs,
      generationLatencyMs: response.generationLatencyMs,
      totalLatencyMs: response.totalLatencyMs,
      response
    };
  }

  private aggregateMetrics(results: QueryEvaluationResult[]): MetricSummary {
    if (results.length === 0) {
      return {
        count: 0,
        precisionAtK: 0,
        recallAtK: 0,
        mrr: 0,
        ndcgAtK: 0,
        faithfulness: 0,
        citationCoverage: 0,
        hallucinationRate: 0,
        honestRefusalRate: 0,
        meanTotalLatencyMs: 0,
        medianTotalLatencyMs: 0,
        p95TotalLatencyMs: 0,
        meanRetrievalLatencyMs: 0
      };
    }

    const count = results.length;
    let sumP = 0;
    let sumR = 0;
    let sumMRR = 0;
    let sumNDCG = 0;
    let sumFaith = 0;
    let sumCite = 0;
    let sumHalluc = 0;
    let sumRefusal = 0;
    let oosCount = 0;
    let sumRetrievalLat = 0;

    const latencies: number[] = [];

    for (const r of results) {
      sumP += r.precisionAtK;
      sumR += r.recallAtK;
      sumMRR += r.reciprocalRank;
      sumNDCG += r.ndcgAtK;
      sumFaith += r.faithfulnessScore;
      sumCite += r.citationCoverage;
      sumHalluc += r.hallucinatedCount > 0 ? 1 : 0;
      if (r.isOutOfScope) {
        oosCount++;
        if (r.honestRefusal) sumRefusal++;
      }
      sumRetrievalLat += r.retrievalLatencyMs;
      latencies.push(r.totalLatencyMs);
    }

    latencies.sort((a, b) => a - b);
    const medianIdx = Math.floor(latencies.length / 2);
    const medianLat = latencies[medianIdx];
    const p95Idx = Math.min(latencies.length - 1, Math.floor(latencies.length * 0.95));
    const p95Lat = latencies[p95Idx];

    return {
      count,
      precisionAtK: Number((sumP / count).toFixed(4)),
      recallAtK: Number((sumR / count).toFixed(4)),
      mrr: Number((sumMRR / count).toFixed(4)),
      ndcgAtK: Number((sumNDCG / count).toFixed(4)),
      faithfulness: Number((sumFaith / count).toFixed(4)),
      citationCoverage: Number((sumCite / count).toFixed(4)),
      hallucinationRate: Number((sumHalluc / count).toFixed(4)),
      honestRefusalRate: oosCount > 0 ? Number((sumRefusal / oosCount).toFixed(4)) : 1.0,
      meanTotalLatencyMs: Number((latencies.reduce((a, b) => a + b, 0) / count).toFixed(2)),
      medianTotalLatencyMs: Number(medianLat.toFixed(2)),
      p95TotalLatencyMs: Number(p95Lat.toFixed(2)),
      meanRetrievalLatencyMs: Number((sumRetrievalLat / count).toFixed(2))
    };
  }
}
