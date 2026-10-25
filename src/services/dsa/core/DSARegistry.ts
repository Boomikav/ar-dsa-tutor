/**
 * Centralized DSA Learning Engine Registry.
 * 
 * Maps all 20 Tier-1 DSA Curriculum Topics to their deterministic IDSALearningEngine instances.
 * Provides uniform lookup, capability querying, and zero-leakage state isolation.
 */

import { IDSALearningEngine, VisualizationCapability } from './IDSALearningEngine';
import { ArrayEngine } from '../array/ArrayEngine';
import { LinkedListEngine } from '../linkedList/LinkedListEngine';
import { StackEngine } from '../stack/StackEngine';
import { QueueEngine } from '../queue/QueueEngine';
import { BinaryTreeEngine } from '../tree/BinaryTreeEngine';
import { BSTAdapter } from '../bst/BSTAdapter';
import { HeapEngine } from '../heap/HeapEngine';
import { HashTableEngine } from '../hashTable/HashTableEngine';
import { GraphEngine } from '../graph/GraphEngine';
import { LinearSearchEngine } from '../searching/LinearSearchEngine';
import { BinarySearchEngine } from '../searching/BinarySearchEngine';
import { BubbleSortEngine } from '../sorting/BubbleSortEngine';
import { SelectionSortEngine } from '../sorting/SelectionSortEngine';
import { InsertionSortEngine } from '../sorting/InsertionSortEngine';
import { MergeSortEngine } from '../sorting/MergeSortEngine';
import { QuickSortEngine } from '../sorting/QuickSortEngine';
import { BFSEngine } from '../graphAlgorithms/BFSEngine';
import { DFSEngine } from '../graphAlgorithms/DFSEngine';
import { DijkstraEngine } from '../graphAlgorithms/DijkstraEngine';
import { RecursionEngine } from '../recursion/RecursionEngine';

export class DSARegistry {
  private static engines: Map<string, IDSALearningEngine> = new Map();

  static {
    // Register all 20 Tier-1 topics
    // Data Structures (9)
    this.register(new ArrayEngine());
    this.register(new LinkedListEngine());
    this.register(new StackEngine());
    this.register(new QueueEngine());
    this.register(new BinaryTreeEngine());
    this.register(new BSTAdapter());
    this.register(new HeapEngine());
    this.register(new HashTableEngine());
    this.register(new GraphEngine());

    // Algorithms (11)
    this.register(new LinearSearchEngine());
    this.register(new BinarySearchEngine());
    this.register(new BubbleSortEngine());
    this.register(new SelectionSortEngine());
    this.register(new InsertionSortEngine());
    this.register(new MergeSortEngine());
    this.register(new QuickSortEngine());
    
    const bfs = new BFSEngine();
    this.register(bfs);
    this.engines.set('algo-bfs', bfs);

    const dfs = new DFSEngine();
    this.register(dfs);
    this.engines.set('algo-dfs', dfs);

    const dijkstra = new DijkstraEngine();
    this.register(dijkstra);
    this.engines.set('algo-dijkstra', dijkstra);

    this.register(new RecursionEngine());
  }

  public static register(engine: IDSALearningEngine): void {
    this.engines.set(engine.topicId, engine);
  }

  public static getEngine(topicId: string): IDSALearningEngine | undefined {
    return this.engines.get(topicId);
  }

  public static getAllEngines(): IDSALearningEngine[] {
    return Array.from(new Set(this.engines.values()));
  }

  public static isImplemented(topicId: string): boolean {
    return this.engines.has(topicId);
  }

  public static getVisualizationCapability(topicId: string): VisualizationCapability {
    const engine = this.engines.get(topicId);
    return engine ? engine.visualizationCapability : 'SPECIFICATION_ONLY';
  }
}
