/**
 * RAG System Core Types and Embedding Utilities
 * 
 * Client-safe, zero external dependency definitions for RAG chunks,
 * vector indices, and deterministic dense embeddings.
 */

export interface RAGKnowledgeSection {
  sectionId: string;
  title: string;
  content: string;
}

export interface RAGKnowledgeDocument {
  documentId: string;
  algorithmId: string;
  topic: string;
  category: string;
  version: string;
  sourceFile: string;
  sections: RAGKnowledgeSection[];
}

export interface RAGChunk {
  chunkId: string;
  documentId: string;
  algorithmId: string;
  topic: string;
  category: string;
  sectionTitle: string;
  sourceFile: string;
  content: string;
  tokenCount: number;
  embedding: number[];
}

export interface RAGVectorIndex {
  version: string;
  generatedAt: string;
  totalDocuments: number;
  totalChunks: number;
  vectorDimensions: number;
  chunks: RAGChunk[];
}

export const VECTOR_DIMENSIONS = 128;

/**
 * Deterministic Semantic Embedding Generator
 * Computes a normalized 128-dimensional dense semantic feature vector
 * using subword hashing, term frequencies, and positional n-grams.
 */
export function generateDeterministicEmbedding(text: string, dimensions = VECTOR_DIMENSIONS): number[] {
  const vector = new Array(dimensions).fill(0);
  const normalized = text.toLowerCase().replace(/[^a-z0-9_\s#<>=-]/g, ' ');
  const words = normalized.split(/\s+/).filter(w => w.length > 0);

  if (words.length === 0) return vector;

  // 1. Unigram and Bigram Feature Hashing
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const weight = word.length > 3 ? 1.5 : 1.0;

    // Hash word into vector space
    let hash = 2166136261;
    for (let j = 0; j < word.length; j++) {
      hash ^= word.charCodeAt(j);
      hash = Math.imul(hash, 16777619);
    }
    const idx = Math.abs(hash) % dimensions;
    vector[idx] += weight;

    // Character trigrams for morphological robustness (e.g. "rotat", "rotat-ing")
    if (word.length >= 4) {
      for (let c = 0; c <= word.length - 3; c++) {
        const tri = word.slice(c, c + 3);
        let triHash = 5381;
        for (let k = 0; k < tri.length; k++) {
          triHash = (triHash * 33) ^ tri.charCodeAt(k);
        }
        const triIdx = Math.abs(triHash) % dimensions;
        vector[triIdx] += 0.4;
      }
    }

    // Bigram
    if (i < words.length - 1) {
      const bigram = `${word}_${words[i + 1]}`;
      let biHash = 5381;
      for (let j = 0; j < bigram.length; j++) {
        biHash = (biHash * 33) ^ bigram.charCodeAt(j);
      }
      const biIdx = Math.abs(biHash) % dimensions;
      vector[biIdx] += 1.2;
    }
  }

  // 2. L2 Normalization to unit length (for exact cosine similarity dot products)
  let sumSq = 0;
  for (let i = 0; i < dimensions; i++) {
    sumSq += vector[i] * vector[i];
  }
  const norm = Math.sqrt(sumSq);
  if (norm > 0) {
    for (let i = 0; i < dimensions; i++) {
      vector[i] = Number((vector[i] / norm).toFixed(6));
    }
  }

  return vector;
}
