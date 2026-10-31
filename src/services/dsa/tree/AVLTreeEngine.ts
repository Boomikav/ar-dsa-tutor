/**
 * Authoritative AVL Tree Learning Engine
 * 
 * Implements self-balancing Binary Search Tree:
 * 1. Strict BST invariant (left < node < right)
 * 2. Node height calculation: height(u) = 1 + max(height(left), height(right))
 * 3. Balance factor calculation: BF(u) = height(left) - height(right)
 * 4. Detection of imbalance: |BF(u)| > 1
 * 5. All 4 rotation cases:
 *    - Left-Left (LL) -> Single Right Rotation
 *    - Right-Right (RR) -> Single Left Rotation
 *    - Left-Right (LR) -> Double Rotation (Left rotate child, Right rotate parent)
 *    - Right-Left (RL) -> Double Rotation (Right rotate child, Left rotate parent)
 * 6. Step-by-step insertion and deletion with rotation explanation
 * 7. Theoretical complexity: O(log n) search, insertion, deletion
 */

import { IDSALearningEngine, DSAOperationResult, StepValidationResult, VisualizationCapability } from '../core/IDSALearningEngine';
import { 
  IInteractiveAlgorithmEngine, 
  AlgorithmComplexityInfo, 
  AlgorithmMetricsSnapshot, 
  AlgorithmExecutionEvent, 
  StepExecutionResult 
} from '../core/IAlgorithmEngine';

export interface AVLNode {
  value: number;
  height: number;
  balanceFactor: number; // height(left) - height(right)
  left: AVLNode | null;
  right: AVLNode | null;
  depth: number;
  id: string;
}

export type AVLRotationCase = 'LL_ROTATION' | 'RR_ROTATION' | 'LR_ROTATION' | 'RL_ROTATION' | 'NONE';

export interface AVLTreeState {
  root: AVLNode | null;
  nodeCount: number;
  treeHeight: number;
  lastOperation: string;
  lastRotationCase: AVLRotationCase;
  rotationCount: number;
  comparisonsCount: number;
  activeNodeValue: number | null;
  imbalancedNodeValue: number | null;
  pivotNodeValue: number | null;
  rotationExplanation: string;
  isComplete: boolean;
  operationHistory: string[];
}

export class AVLTreeEngine implements IDSALearningEngine<AVLTreeState, { type: 'INSERT' | 'DELETE' | 'RESET'; value?: number }>, IInteractiveAlgorithmEngine<AVLTreeState> {
  readonly topicId = 'ds-avl-tree';
  readonly algorithmId = 'ds-avl-tree';
  readonly topicTitle = 'AVL Tree (Self-Balancing)';
  readonly title = 'AVL Tree';
  readonly category = 'data-structure' as const;
  readonly visualizationCapability: VisualizationCapability = '3D_READY';

  private state!: AVLTreeState;
  private startTime = 0;
  private eventHistory: AlgorithmExecutionEvent<AVLTreeState>[] = [];

  constructor() {
    this.initialize([30, 20, 40, 10, 25, 50, 5]);
  }

  public getComplexity(): AlgorithmComplexityInfo {
    return {
      timeComplexity: {
        best: 'O(log n)',
        average: 'O(log n)',
        worst: 'O(log n)'
      },
      spaceComplexity: {
        auxiliary: 'O(log n)', // recursion call stack
        total: 'O(n)'
      },
      stability: undefined,
      paradigm: 'Self-Balancing Tree',
      invariants: [
        'Strict BST Invariant: For any node u, all left descendants < u.value < all right descendants.',
        'Height Balance Property: For every node u, |BF(u)| = |height(left) - height(right)| <= 1.',
        'Height guarantee: Maximum height of an AVL tree with n nodes is bounded by 1.44 * log2(n + 2) - 0.328.',
        'Imbalance resolution: Restored locally at the lowest imbalanced node via at most 2 tree pointer rotations.'
      ]
    };
  }

  public getMetrics(): AlgorithmMetricsSnapshot {
    return {
      comparisonsCount: this.state.comparisonsCount,
      writesCount: this.state.rotationCount * 3, // Each rotation performs pointer updates
      stepsCount: this.state.operationHistory.length,
      treeHeight: this.state.treeHeight,
      rotationsCount: this.state.rotationCount,
      elapsedMs: this.startTime ? Math.max(1, Date.now() - this.startTime) : 0,
      inputSize: this.state.nodeCount,
      auxiliaryMemoryBytes: this.state.treeHeight * 32
    };
  }

  public initialize(initialValues?: number[]): AVLTreeState {
    const values = initialValues !== undefined ? initialValues : [30, 20, 40, 10, 25, 50, 5];
    this.startTime = Date.now();
    this.eventHistory = [];

    this.state = {
      root: null,
      nodeCount: 0,
      treeHeight: 0,
      lastOperation: 'INITIALIZED',
      lastRotationCase: 'NONE',
      rotationCount: 0,
      comparisonsCount: 0,
      activeNodeValue: null,
      imbalancedNodeValue: null,
      pivotNodeValue: null,
      rotationExplanation: 'Initialized empty AVL Tree.',
      isComplete: false,
      operationHistory: []
    };

    for (const v of values) {
      this.insert(v);
    }

    return this.getCurrentState();
  }

  public getInitialState(seed?: number[]): AVLTreeState {
    return this.initialize(seed);
  }

  public getCurrentState(): AVLTreeState {
    return {
      ...this.state,
      root: this.cloneNode(this.state.root)
    };
  }

  public isCompleted(): boolean {
    return this.state.isComplete;
  }

  public getEventHistory(): readonly AlgorithmExecutionEvent<AVLTreeState>[] {
    return this.eventHistory;
  }

  public reset(): AVLTreeState {
    return this.initialize([30, 20, 40, 10, 25, 50, 5]);
  }

  // --- Core AVL Node Helper Methods ---

  public getHeight(node: AVLNode | null): number {
    return node ? node.height : 0;
  }

  public getBalanceFactor(node: AVLNode | null): number {
    return node ? this.getHeight(node.left) - this.getHeight(node.right) : 0;
  }

  private updateNodeMetadata(node: AVLNode, depth = 0): void {
    node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
    node.balanceFactor = this.getHeight(node.left) - this.getHeight(node.right);
    node.depth = depth;

    if (node.left) this.updateNodeMetadata(node.left, depth + 1);
    if (node.right) this.updateNodeMetadata(node.right, depth + 1);
  }

  private countNodes(node: AVLNode | null): number {
    if (!node) return 0;
    return 1 + this.countNodes(node.left) + this.countNodes(node.right);
  }

  // --- AVL Rotations (LL, RR, LR, RL) ---

  /**
   * Single Right Rotation (LL Case):
   * Occurs when insertion is in left subtree of left child.
   * Pivot is node.left; becomes new root of this subtree.
   */
  public rotateRight(y: AVLNode): AVLNode {
    const x = y.left!;
    const T2 = x.right;

    // Perform rotation
    x.right = y;
    y.left = T2;

    // Update heights
    y.height = 1 + Math.max(this.getHeight(y.left), this.getHeight(y.right));
    y.balanceFactor = this.getHeight(y.left) - this.getHeight(y.right);

    x.height = 1 + Math.max(this.getHeight(x.left), this.getHeight(x.right));
    x.balanceFactor = this.getHeight(x.left) - this.getHeight(x.right);

    return x;
  }

  /**
   * Single Left Rotation (RR Case):
   * Occurs when insertion is in right subtree of right child.
   * Pivot is node.right; becomes new root of this subtree.
   */
  public rotateLeft(x: AVLNode): AVLNode {
    const y = x.right!;
    const T2 = y.left;

    // Perform rotation
    y.left = x;
    x.right = T2;

    // Update heights
    x.height = 1 + Math.max(this.getHeight(x.left), this.getHeight(x.right));
    x.balanceFactor = this.getHeight(x.left) - this.getHeight(x.right);

    y.height = 1 + Math.max(this.getHeight(y.left), this.getHeight(y.right));
    y.balanceFactor = this.getHeight(y.left) - this.getHeight(y.right);

    return y;
  }

  /**
   * Inserts a value into the AVL Tree and performs rebalancing if needed.
   */
  public insert(value: number): StepExecutionResult<AVLTreeState> {
    let rotationCaseDetected: AVLRotationCase = 'NONE';
    let imbalancedVal: number | null = null;
    let pivotVal: number | null = null;
    let explanation = `Inserted value ${value}. Tree remains balanced (all |BF| <= 1).`;

    const insertRecursive = (node: AVLNode | null, depth: number): AVLNode => {
      if (!node) {
        return {
          value,
          height: 1,
          balanceFactor: 0,
          left: null,
          right: null,
          depth,
          id: `avl-node-${value}`
        };
      }

      this.state.comparisonsCount++;
      if (value < node.value) {
        node.left = insertRecursive(node.left, depth + 1);
      } else if (value > node.value) {
        node.right = insertRecursive(node.right, depth + 1);
      } else {
        // Duplicate values not allowed in this AVL invariant
        explanation = `Value ${value} already exists in AVL tree. Duplicates ignored.`;
        return node;
      }

      // Update height and balance factor
      node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
      node.balanceFactor = this.getHeight(node.left) - this.getHeight(node.right);

      const balance = node.balanceFactor;

      // Case 1: Left-Left (LL) -> Single Right Rotation
      if (balance > 1 && value < node.left!.value) {
        rotationCaseDetected = 'LL_ROTATION';
        imbalancedVal = node.value;
        pivotVal = node.left!.value;
        this.state.rotationCount++;
        explanation = `LL Imbalance detected at node ${node.value} (BF: ${balance} > 1). Value ${value} was added to left subtree of left child ${node.left!.value}. Resolved via Single Right Rotation on node ${node.value}.`;
        return this.rotateRight(node);
      }

      // Case 2: Right-Right (RR) -> Single Left Rotation
      if (balance < -1 && value > node.right!.value) {
        rotationCaseDetected = 'RR_ROTATION';
        imbalancedVal = node.value;
        pivotVal = node.right!.value;
        this.state.rotationCount++;
        explanation = `RR Imbalance detected at node ${node.value} (BF: ${balance} < -1). Value ${value} was added to right subtree of right child ${node.right!.value}. Resolved via Single Left Rotation on node ${node.value}.`;
        return this.rotateLeft(node);
      }

      // Case 3: Left-Right (LR) -> Double Rotation (Left on child, Right on node)
      if (balance > 1 && value > node.left!.value) {
        rotationCaseDetected = 'LR_ROTATION';
        imbalancedVal = node.value;
        pivotVal = node.left!.right?.value ?? node.left!.value;
        this.state.rotationCount += 2;
        explanation = `LR Imbalance detected at node ${node.value} (BF: ${balance} > 1). Value ${value} was added to right subtree of left child ${node.left!.value}. Resolved via Double Rotation: Left Rotate child ${node.left!.value}, then Right Rotate parent ${node.value}.`;
        node.left = this.rotateLeft(node.left!);
        return this.rotateRight(node);
      }

      // Case 4: Right-Left (RL) -> Double Rotation (Right on child, Left on node)
      if (balance < -1 && value < node.right!.value) {
        rotationCaseDetected = 'RL_ROTATION';
        imbalancedVal = node.value;
        pivotVal = node.right!.left?.value ?? node.right!.value;
        this.state.rotationCount += 2;
        explanation = `RL Imbalance detected at node ${node.value} (BF: ${balance} < -1). Value ${value} was added to left subtree of right child ${node.right!.value}. Resolved via Double Rotation: Right Rotate child ${node.right!.value}, then Left Rotate parent ${node.value}.`;
        node.right = this.rotateRight(node.right!);
        return this.rotateLeft(node);
      }

      return node;
    };

    this.state.root = insertRecursive(this.state.root, 0);
    if (this.state.root) {
      this.updateNodeMetadata(this.state.root, 0);
    }

    this.state.nodeCount = this.countNodes(this.state.root);
    this.state.treeHeight = this.getHeight(this.state.root);
    this.state.activeNodeValue = value;
    this.state.imbalancedNodeValue = imbalancedVal;
    this.state.pivotNodeValue = pivotVal;
    this.state.lastRotationCase = rotationCaseDetected;
    this.state.rotationExplanation = explanation;
    this.state.lastOperation = `INSERT_${value}`;
    this.state.operationHistory.push(`INSERT(${value}) [${rotationCaseDetected}]`);

    const rotCaseStr: string = rotationCaseDetected;
    const eventType = (rotCaseStr !== 'NONE' ? `ROTATE_${rotCaseStr.replace('_ROTATION', '')}` : 'STEP') as any;
    const event: AlgorithmExecutionEvent<AVLTreeState> = {
      type: eventType,
      stepIndex: this.state.operationHistory.length,
      description: explanation,
      stateSnapshot: this.getCurrentState(),
      metrics: this.getMetrics(),
      timestamp: Date.now()
    };
    this.eventHistory.push(event);

    return {
      success: true,
      state: this.getCurrentState(),
      event,
      isComplete: false
    };
  }

  /**
   * Deletes a value from the AVL Tree and performs rebalancing if needed.
   */
  public delete(value: number): StepExecutionResult<AVLTreeState> {
    let rotationCaseDetected: AVLRotationCase = 'NONE';
    let explanation = `Deleted value ${value}. Tree rebalanced.`;

    const minValueNode = (node: AVLNode): AVLNode => {
      let current = node;
      while (current.left !== null) {
        current = current.left;
      }
      return current;
    };

    const deleteRecursive = (node: AVLNode | null, val: number): AVLNode | null => {
      if (!node) return null;

      this.state.comparisonsCount++;
      if (val < node.value) {
        node.left = deleteRecursive(node.left, val);
      } else if (val > node.value) {
        node.right = deleteRecursive(node.right, val);
      } else {
        // Node found
        if (!node.left || !node.right) {
          const temp = node.left ? node.left : node.right;
          if (!temp) {
            // No child
            node = null;
          } else {
            // One child
            node = temp;
          }
        } else {
          // Two children: Get inorder successor (smallest in right subtree)
          const temp = minValueNode(node.right);
          node.value = temp.value;
          node.right = deleteRecursive(node.right, temp.value);
        }
      }

      if (!node) return null;

      // Update height and balance factor
      node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
      node.balanceFactor = this.getHeight(node.left) - this.getHeight(node.right);

      const balance = node.balanceFactor;

      // Balance check
      // LL Case
      if (balance > 1 && this.getBalanceFactor(node.left) >= 0) {
        rotationCaseDetected = 'LL_ROTATION';
        this.state.rotationCount++;
        return this.rotateRight(node);
      }

      // LR Case
      if (balance > 1 && this.getBalanceFactor(node.left) < 0) {
        rotationCaseDetected = 'LR_ROTATION';
        this.state.rotationCount += 2;
        node.left = this.rotateLeft(node.left!);
        return this.rotateRight(node);
      }

      // RR Case
      if (balance < -1 && this.getBalanceFactor(node.right) <= 0) {
        rotationCaseDetected = 'RR_ROTATION';
        this.state.rotationCount++;
        return this.rotateLeft(node);
      }

      // RL Case
      if (balance < -1 && this.getBalanceFactor(node.right) > 0) {
        rotationCaseDetected = 'RL_ROTATION';
        this.state.rotationCount += 2;
        node.right = this.rotateRight(node.right!);
        return this.rotateLeft(node);
      }

      return node;
    };

    this.state.root = deleteRecursive(this.state.root, value);
    if (this.state.root) {
      this.updateNodeMetadata(this.state.root, 0);
    }

    this.state.nodeCount = this.countNodes(this.state.root);
    this.state.treeHeight = this.getHeight(this.state.root);
    this.state.activeNodeValue = value;
    this.state.lastRotationCase = rotationCaseDetected;
    this.state.rotationExplanation = explanation;
    this.state.lastOperation = `DELETE_${value}`;
    this.state.operationHistory.push(`DELETE(${value}) [${rotationCaseDetected}]`);

    const event: AlgorithmExecutionEvent<AVLTreeState> = {
      type: 'STEP',
      stepIndex: this.state.operationHistory.length,
      description: explanation,
      stateSnapshot: this.getCurrentState(),
      metrics: this.getMetrics(),
      timestamp: Date.now()
    };
    this.eventHistory.push(event);

    return {
      success: true,
      state: this.getCurrentState(),
      event,
      isComplete: false
    };
  }

  // Demonstration step through example insertion triggers
  public step(operation?: { type: 'INSERT' | 'DELETE' | 'RESET'; value?: number }): StepExecutionResult<AVLTreeState> {
    if (!operation || operation.type === 'INSERT') {
      const demoInsertValues = [15, 60, 22, 45, 12];
      const nextVal = operation?.value ?? demoInsertValues[this.state.operationHistory.length % demoInsertValues.length];
      return this.insert(nextVal);
    } else if (operation.type === 'DELETE') {
      const val = operation.value ?? (this.state.root ? this.state.root.value : 30);
      return this.delete(val);
    } else {
      this.reset();
      return {
        success: true,
        state: this.getCurrentState(),
        event: {
          type: 'RESET',
          stepIndex: 0,
          description: 'AVL tree reset to baseline sample dataset.',
          stateSnapshot: this.getCurrentState(),
          metrics: this.getMetrics(),
          timestamp: Date.now()
        },
        isComplete: false
      };
    }
  }

  // IDSALearningEngine compatibility methods
  public getAvailableOperations(_state: AVLTreeState): string[] {
    return ['INSERT', 'DELETE', 'RESET'];
  }

  public applyOperation(_state: AVLTreeState, operation: { type: 'INSERT' | 'DELETE' | 'RESET'; value?: number }): DSAOperationResult<AVLTreeState> {
    const res = this.step(operation);
    return {
      success: res.success,
      newState: res.state,
      stepDescription: res.event.description,
      isTerminal: false
    };
  }

  public validateStep(_state: AVLTreeState, userChoice: any, expectedChoice?: any): StepValidationResult {
    const isCorrect = String(userChoice) === String(expectedChoice);
    return {
      isCorrect,
      expectedChoice,
      userChoice,
      feedbackMessage: isCorrect ? 'Correct balance evaluation.' : 'AVL balance factor or rotation evaluation incorrect.'
    };
  }

  public getVisualizationData(state: AVLTreeState): any {
    return {
      type: 'TREE_AVL_3D',
      root: state.root,
      nodeCount: state.nodeCount,
      treeHeight: state.treeHeight,
      lastRotationCase: state.lastRotationCase,
      rotationExplanation: state.rotationExplanation,
      rotationCount: state.rotationCount,
      activeNodeValue: state.activeNodeValue,
      imbalancedNodeValue: state.imbalancedNodeValue,
      pivotNodeValue: state.pivotNodeValue,
      complexity: this.getComplexity()
    };
  }

  private cloneNode(node: AVLNode | null): AVLNode | null {
    if (!node) return null;
    return {
      value: node.value,
      height: node.height,
      balanceFactor: node.balanceFactor,
      depth: node.depth,
      id: node.id,
      left: this.cloneNode(node.left),
      right: this.cloneNode(node.right)
    };
  }
}
