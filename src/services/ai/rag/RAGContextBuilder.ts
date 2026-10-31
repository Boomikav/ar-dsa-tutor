/**
 * RAG Context Builder
 * 
 * Injects verified knowledge chunks and active 3D algorithm execution state
 * into a grounded prompt context with explicit citation instructions.
 */

import { ScoredRAGChunk } from './VectorStore';

export interface AlgorithmRuntimeContext {
  algorithmId: string;
  algorithmTitle: string;
  stepIndex?: number;
  lastAction?: string;
  comparisonsCount?: number;
  writesCount?: number;
  recursionDepth?: number;
  treeHeight?: number;
  balanceFactor?: number;
  imbalancedNode?: number | null;
  pivotNode?: number | null;
  activeElements?: (number | string)[];
  currentQueue?: string[];
  currentStack?: (number | string)[];
  shortestPath?: string[];
  shortestPathCost?: number;
}

export class RAGContextBuilder {
  public static buildPrompt(
    userQuery: string,
    chunks: ScoredRAGChunk[],
    runtimeState?: AlgorithmRuntimeContext
  ): string {
    let prompt = `You are the AR-DSA Tutor intelligent pedagogical assistant. Answer the user's question using ONLY the retrieved verified knowledge context below.\n\n`;

    // 1. Instructions
    prompt += `RULES:\n`;
    prompt += `1. Factual Grounding: Base your answer strictly on the facts in the retrieved documents.\n`;
    prompt += `2. Citations: Every key claim or invariant MUST include a citation tag referring to the source document, e.g. [DOC-AVL-01] or [DOC-MRG-01].\n`;
    prompt += `3. Insufficient Information: If the retrieved documents do not contain the answer, explicitly state: "Based on the verified knowledge base, this information is not available." Do NOT guess or invent facts.\n`;
    prompt += `4. Contextual Awareness: If the active 3D algorithm state is provided, connect your explanation to what the learner is currently observing in the AR session.\n\n`;

    // 2. Retrieved Chunks
    prompt += `=== RETRIEVED VERIFIED KNOWLEDGE ===\n`;
    if (chunks.length === 0) {
      prompt += `[No relevant knowledge chunks retrieved above confidence threshold.]\n\n`;
    } else {
      for (let i = 0; i < chunks.length; i++) {
        const item = chunks[i];
        prompt += `SOURCE ${i + 1} [${item.chunk.documentId}] (Relevance: ${(item.similarityScore * 100).toFixed(1)}%):\n`;
        prompt += `${item.chunk.content}\n\n`;
      }
    }

    // 3. Active 3D Algorithm Runtime State (Execution-Aware Context)
    if (runtimeState) {
      prompt += `=== CURRENT 3D AR EXECUTION STATE ===\n`;
      prompt += `Active Topic: ${runtimeState.algorithmTitle} (${runtimeState.algorithmId})\n`;
      if (runtimeState.stepIndex !== undefined) prompt += `Execution Step: ${runtimeState.stepIndex}\n`;
      if (runtimeState.lastAction) prompt += `Last Action: ${runtimeState.lastAction}\n`;
      if (runtimeState.comparisonsCount !== undefined) prompt += `Comparisons: ${runtimeState.comparisonsCount}\n`;
      if (runtimeState.writesCount !== undefined) prompt += `Writes/Swaps: ${runtimeState.writesCount}\n`;
      if (runtimeState.recursionDepth !== undefined) prompt += `Recursion Depth: ${runtimeState.recursionDepth}\n`;
      if (runtimeState.balanceFactor !== undefined) prompt += `Balance Factor: ${runtimeState.balanceFactor}\n`;
      if (runtimeState.imbalancedNode !== undefined && runtimeState.imbalancedNode !== null) prompt += `Imbalanced Node: ${runtimeState.imbalancedNode}\n`;
      if (runtimeState.pivotNode !== undefined && runtimeState.pivotNode !== null) prompt += `Pivot Node: ${runtimeState.pivotNode}\n`;
      if (runtimeState.currentQueue) prompt += `Current Queue: [${runtimeState.currentQueue.join(', ')}]\n`;
      if (runtimeState.currentStack) prompt += `Current Stack: [${runtimeState.currentStack.join(', ')}]\n`;
      if (runtimeState.shortestPath && runtimeState.shortestPath.length > 0) {
        prompt += `Shortest Path: ${runtimeState.shortestPath.join(' -> ')} (Cost: ${runtimeState.shortestPathCost})\n`;
      }
      prompt += `\n`;
    }

    // 4. User Query
    prompt += `=== USER QUESTION ===\n${userQuery}\n\n`;
    prompt += `=== GROUNDED EXPLANATION ===\n`;

    return prompt;
  }
}
