/**
 * Deterministic Hash Table Learning Engine.
 * 
 * Implements authoritative hash mapping, bucket indexing via modulo arithmetic,
 * collision resolution via separate chaining, and observable hashing misconceptions.
 */

import { IDSALearningEngine, DSAOperationResult, StepValidationResult } from '../core/IDSALearningEngine';

export interface HashEntry {
  key: string;
  value: number;
}

export interface HashTableState {
  buckets: HashEntry[][];
  bucketCount: number;
  itemCount: number;
  lastHashedBucket: number | null;
  lastAction: string;
}

export interface HashTableOperation {
  type: 'SET' | 'GET' | 'DELETE';
  key: string;
  value?: number;
}

export class HashTableEngine implements IDSALearningEngine<HashTableState, HashTableOperation> {
  readonly topicId = 'ds-hash-table';
  readonly topicTitle = 'Hash Table';
  readonly category = 'data-structure' as const;
  readonly visualizationCapability = '2D_READY' as const;

  getInitialState(): HashTableState {
    const bucketCount = 5;
    const buckets: HashEntry[][] = Array.from({ length: bucketCount }, () => []);

    // Seed sample entries
    buckets[0].push({ key: 'apple', value: 10 });
    buckets[1].push({ key: 'banana', value: 20 });
    buckets[1].push({ key: 'orange', value: 35 }); // Collision chained in bucket 1
    buckets[3].push({ key: 'grape', value: 50 });

    return {
      buckets,
      bucketCount,
      itemCount: 4,
      lastHashedBucket: null,
      lastAction: 'INITIALIZED'
    };
  }

  hash(key: string, bucketCount: number): number {
    let hashVal = 0;
    for (let i = 0; i < key.length; i++) {
      hashVal = (hashVal + key.charCodeAt(i) * 17) % bucketCount;
    }
    return hashVal;
  }

  getAvailableOperations(state: HashTableState): string[] {
    return ['SET', 'GET', 'DELETE'];
  }

  applyOperation(state: HashTableState, operation: HashTableOperation): DSAOperationResult<HashTableState> {
    const buckets: HashEntry[][] = state.buckets.map(b => b.map(e => ({ ...e })));
    const bucketIdx = this.hash(operation.key, state.bucketCount);

    if (operation.type === 'SET') {
      const val = operation.value ?? 100;
      const bucket = buckets[bucketIdx];
      const existing = bucket.find(e => e.key === operation.key);
      let isUpdate = false;

      if (existing) {
        existing.value = val;
        isUpdate = true;
      } else {
        bucket.push({ key: operation.key, value: val });
      }

      return {
        success: true,
        newState: {
          ...state,
          buckets,
          itemCount: isUpdate ? state.itemCount : state.itemCount + 1,
          lastHashedBucket: bucketIdx,
          lastAction: `SET_${operation.key}`
        },
        stepDescription: `Key '${operation.key}' hashed to bucket [${bucketIdx}]. ${isUpdate ? 'Updated existing key.' : 'Chained new entry.'}`
      };
    }

    if (operation.type === 'GET') {
      const bucket = buckets[bucketIdx];
      const found = bucket.find(e => e.key === operation.key);
      return {
        success: !!found,
        newState: { ...state, lastHashedBucket: bucketIdx, lastAction: `GET_${operation.key}` },
        stepDescription: found
          ? `Key '${operation.key}' found in bucket [${bucketIdx}] with value ${found.value}.`
          : `Key '${operation.key}' not found in bucket [${bucketIdx}].`
      };
    }

    if (operation.type === 'DELETE') {
      const bucket = buckets[bucketIdx];
      const idx = bucket.findIndex(e => e.key === operation.key);
      if (idx !== -1) {
        bucket.splice(idx, 1);
        return {
          success: true,
          newState: { ...state, buckets, itemCount: state.itemCount - 1, lastHashedBucket: bucketIdx, lastAction: `DELETED_${operation.key}` },
          stepDescription: `Deleted key '${operation.key}' from bucket [${bucketIdx}].`
        };
      }
      return {
        success: false,
        newState: state,
        stepDescription: `Key '${operation.key}' not found for deletion.`
      };
    }

    return { success: true, newState: state, stepDescription: 'Hash operation applied.' };
  }

  validateStep(state: HashTableState, userChoice: any, expectedChoice?: any): StepValidationResult {
    const isCorrect = Number(userChoice) === Number(expectedChoice);
    return {
      isCorrect,
      expectedChoice,
      userChoice,
      misconception: !isCorrect ? {
        id: `diag-hash-${Date.now()}`,
        type: 'HASH_WRONG_BUCKET',
        topicId: this.topicId,
        userChoice: String(userChoice),
        expectedChoice: String(expectedChoice),
        pedagogicalExplanation: `Hash function mapped key to bucket [${expectedChoice}], but user selected bucket [${userChoice}].`,
        correctiveGuidance: 'Recalculate bucket index = hash(key) % totalBuckets.',
        timestamp: new Date().toISOString()
      } : undefined,
      feedbackMessage: isCorrect ? 'Correct bucket index.' : 'Bucket index mismatch.'
    };
  }

  getVisualizationData(state: HashTableState): any {
    return {
      type: 'HASH_TABLE',
      buckets: state.buckets,
      bucketCount: state.bucketCount,
      itemCount: state.itemCount,
      lastHashedBucket: state.lastHashedBucket
    };
  }
}
