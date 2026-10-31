/**
 * RAG Tutor Service
 * 
 * Orchestrates:
 * 1. Semantic vector search across verified DSA knowledge base (VectorStore)
 * 2. Execution-aware context grounding (RAGContextBuilder)
 * 3. Answer synthesis (LLM / deterministic grounded generation)
 * 4. Citation and hallucination validation (CitationValidator)
 * 5. Latency and grounding telemetry
 */

import { VectorStore, ScoredRAGChunk, RetrievalOptions, RetrievalResult } from './VectorStore';
import { RAGContextBuilder, AlgorithmRuntimeContext } from './RAGContextBuilder';
import { CitationValidator, CitationValidationResult } from './CitationValidator';

export interface RAGTutorOptions extends RetrievalOptions {
  forceLocal?: boolean;
  timeoutMs?: number;
}

export interface RAGTutorResponse {
  query: string;
  answer: string;
  retrievedChunks: ScoredRAGChunk[];
  citations: CitationValidationResult;
  retrievalLatencyMs: number;
  generationLatencyMs: number;
  totalLatencyMs: number;
  hasSufficientContext: boolean;
  isOfflineFallback: boolean;
  timestamp: string;
}

export class RAGTutorService {
  private static instance: RAGTutorService | null = null;
  private readonly vectorStore: VectorStore;

  constructor(vectorStore?: VectorStore) {
    this.vectorStore = vectorStore || VectorStore.getInstance();
  }

  public static getInstance(): RAGTutorService {
    if (!this.instance) {
      this.instance = new RAGTutorService();
    }
    return this.instance;
  }

  /**
   * Main query execution pipeline.
   */
  public async answerQuery(
    query: string,
    runtimeState?: AlgorithmRuntimeContext,
    options: RAGTutorOptions = {}
  ): Promise<RAGTutorResponse> {
    const overallStart = typeof performance !== 'undefined' ? performance.now() : Date.now();

    // 1. Vector similarity retrieval
    const retrievalResult: RetrievalResult = this.vectorStore.search(query, {
      topK: options.topK ?? 3,
      minScoreThreshold: options.minScoreThreshold ?? 0.35,
      algorithmFilter: options.algorithmFilter ?? runtimeState?.algorithmId,
      categoryFilter: options.categoryFilter
    });

    const retrievalLatencyMs = retrievalResult.retrievalLatencyMs;
    const genStart = typeof performance !== 'undefined' ? performance.now() : Date.now();

    let answer = '';
    let isOfflineFallback = true;

    // 2. Insufficient Context Handling
    if (!retrievalResult.hasSufficientContext || retrievalResult.results.length === 0) {
      answer = `Based on the verified knowledge base, this information is not available. The AR-DSA Tutor curriculum currently contains verified knowledge for 8 core data structures and algorithms: Binary Search Tree, Bubble Sort, Binary Search, Breadth-First Search, Stack, Merge Sort, AVL Tree, Dijkstra's Algorithm, and EGEA adaptive learning.`;
    } else {
      // 3. Grounded Synthesis
      // Attempt remote LLM generation if configured and not forced local
      if (!options.forceLocal && typeof fetch !== 'undefined') {
        try {
          const prompt = RAGContextBuilder.buildPrompt(query, retrievalResult.results, runtimeState);
          const response = await fetch('/api/ai/tutor', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              question: prompt,
              topicId: runtimeState?.algorithmId || retrievalResult.results[0].chunk.algorithmId,
              context: {
                currentStep: runtimeState?.stepIndex,
                lastAction: runtimeState?.lastAction
              }
            })
          });

          if (response.ok) {
            const data = await response.json() as Record<string, any>;
            if (data && typeof data.message === 'string' && data.message.length > 0) {
              answer = data.message;
              isOfflineFallback = false;
            }
          }
        } catch {
          // Fall back gracefully to deterministic grounded synthesis
          isOfflineFallback = true;
        }
      }

      // If remote generation wasn't used or failed, use deterministic grounded synthesis
      if (!answer) {
        answer = this.synthesizeGroundedAnswer(query, retrievalResult.results, runtimeState);
        isOfflineFallback = true;
      }
    }

    const genEnd = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const generationLatencyMs = Number((genEnd - genStart).toFixed(3));
    const totalLatencyMs = Number((genEnd - overallStart).toFixed(3));

    // 4. Citation and Hallucination Validation
    const citations: CitationValidationResult = CitationValidator.validate(
      answer,
      retrievalResult.results,
      retrievalResult.hasSufficientContext
    );

    return {
      query,
      answer,
      retrievedChunks: retrievalResult.results,
      citations,
      retrievalLatencyMs,
      generationLatencyMs,
      totalLatencyMs,
      hasSufficientContext: retrievalResult.hasSufficientContext,
      isOfflineFallback,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Deterministic grounded answer synthesis from verified chunks.
   */
  private synthesizeGroundedAnswer(
    _query: string,
    chunks: ScoredRAGChunk[],
    runtimeState?: AlgorithmRuntimeContext
  ): string {
    const primary = chunks[0];
    const docId = primary.chunk.documentId;
    const title = primary.chunk.topic;

    let explanation = `Regarding **${title}** [${docId}]:\n\n`;

    for (const item of chunks) {
      const c = item.chunk;
      explanation += `### ${c.sectionTitle} [${c.documentId}]\n${c.content}\n\n`;
    }

    // Connect with active 3D runtime state if present
    if (runtimeState && runtimeState.algorithmTitle) {
      explanation += `**Active AR Session Connection:** Currently observing ${runtimeState.algorithmTitle}`;
      if (runtimeState.stepIndex !== undefined) {
        explanation += ` at execution step ${runtimeState.stepIndex}`;
      }
      if (runtimeState.lastAction) {
        explanation += ` (last operation: "${runtimeState.lastAction}")`;
      }
      if (runtimeState.balanceFactor !== undefined) {
        explanation += `, with current balance factor ${runtimeState.balanceFactor}`;
      }
      if (runtimeState.comparisonsCount !== undefined) {
        explanation += `, having performed ${runtimeState.comparisonsCount} comparisons`;
      }
      explanation += `. This matches the formal invariants established in [${docId}].`;
    }

    return explanation.trim();
  }
}
