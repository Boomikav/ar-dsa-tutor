import { 
  BSTNode, 
  BSTOperationStep, 
  BSTOperationResult 
} from '../../../models/bst';

/**
 * Binary Search Tree (BST) Core Engine.
 * 
 * STRICT SINGLE SOURCE OF TRUTH:
 * All guided lessons, manual operations, interactive practice sessions,
 * assessment prediction questions, and future AR spatial visualizations
 * must invoke this engine to execute operations and retrieve step-by-step traces.
 * 
 * Pure TypeScript. Zero framework or UI dependencies.
 */
export class BSTEngine {
  private static idCounter = 1;

  public static generateNodeId(): string {
    return `bst-node-${this.idCounter++}`;
  }

  /**
   * Deep clone a BST to maintain immutable step snapshots.
   */
  public static cloneTree(root: BSTNode | null, parentId: string | null = null): BSTNode | null {
    if (!root) return null;
    const cloned: BSTNode = {
      id: root.id,
      value: root.value,
      depth: root.depth,
      parent: parentId,
      left: null,
      right: null,
      x: root.x,
      y: root.y
    };
    cloned.left = this.cloneTree(root.left, cloned.id);
    cloned.right = this.cloneTree(root.right, cloned.id);
    return cloned;
  }

  /**
   * Generates a balanced educational starter tree:
   *        50
   *       /  \
   *     30    70
   *    /        \
   *  20          80
   */
  public static createSampleTree(): BSTNode {
    this.idCounter = 1;
    const root: BSTNode = { id: 'node-50', value: 50, depth: 0, left: null, right: null };
    const n30: BSTNode = { id: 'node-30', value: 30, depth: 1, parent: 'node-50', left: null, right: null };
    const n70: BSTNode = { id: 'node-70', value: 70, depth: 1, parent: 'node-50', left: null, right: null };
    const n20: BSTNode = { id: 'node-20', value: 20, depth: 2, parent: 'node-30', left: null, right: null };
    const n80: BSTNode = { id: 'node-80', value: 80, depth: 2, parent: 'node-70', left: null, right: null };

    root.left = n30;
    root.right = n70;
    n30.left = n20;
    n70.right = n80;

    this.computeLayout(root, 360, 220);
    return root;
  }

  /**
   * Generates a random BST with 4 to 6 unique values.
   */
  public static createRandomTree(size: number = 5): BSTNode {
    const values = new Set<number>();
    // First value is root near middle
    values.add(Math.floor(Math.random() * 40) + 30);
    while (values.size < size) {
      values.add(Math.floor(Math.random() * 90) + 10);
    }

    let root: BSTNode | null = null;
    for (const val of values) {
      const res = this.insert(root, val);
      root = res.finalTreeSnapshot;
    }

    return root || this.createSampleTree();
  }

  /**
   * Execute BST Insertion with complete, deterministic step-by-step trace.
   */
  public static insert(treeRoot: BSTNode | null, targetValue: number): BSTOperationResult {
    const initialTree = this.cloneTree(treeRoot);
    const steps: BSTOperationStep[] = [];
    let stepNumber = 1;

    // Validation: Check valid integer
    if (isNaN(targetValue)) {
      return {
        operationType: 'insert',
        targetValue,
        initialTreeSnapshot: initialTree,
        finalTreeSnapshot: initialTree,
        steps: [],
        success: false,
        message: 'Invalid input: Target must be a valid number.'
      };
    }

    // Case 1: Empty Tree -> Target becomes root
    if (!treeRoot) {
      const newRoot: BSTNode = {
        id: this.generateNodeId(),
        value: targetValue,
        depth: 0,
        left: null,
        right: null
      };

      steps.push({
        stepNumber: stepNumber++,
        currentNodeId: null,
        currentNodeValue: null,
        targetValue,
        comparison: 'Tree is empty',
        decision: 'ROOT_CHECK',
        message: `Tree is empty. Insert ${targetValue} as the root node.`,
        highlightNodeId: newRoot.id,
        isCompleted: true,
        treeSnapshot: this.cloneTree(newRoot)
      });

      this.computeLayout(newRoot, 360, 220);

      return {
        operationType: 'insert',
        targetValue,
        initialTreeSnapshot: null,
        finalTreeSnapshot: newRoot,
        steps,
        success: true,
        message: `Inserted ${targetValue} as root node.`
      };
    }

    // Work on a mutable clone for execution
    const workingTree = this.cloneTree(treeRoot)!;
    let current: BSTNode = workingTree;
    let parent: BSTNode | null = null;
    let direction: 'left' | 'right' | null = null;

    // Step 1: Start at Root
    steps.push({
      stepNumber: stepNumber++,
      currentNodeId: current.id,
      currentNodeValue: current.value,
      targetValue,
      comparison: `Begin traversal at root (value: ${current.value})`,
      decision: 'ROOT_CHECK',
      message: `Start at the root node (${current.value}). Compare target ${targetValue} with root value.`,
      highlightNodeId: current.id,
      isCompleted: false,
      treeSnapshot: this.cloneTree(workingTree)
    });

    // Traverse tree following BST invariant
    while (current) {
      // Comparison Step
      if (targetValue === current.value) {
        // Duplicate key handling
        steps.push({
          stepNumber: stepNumber++,
          currentNodeId: current.id,
          currentNodeValue: current.value,
          targetValue,
          comparison: `${targetValue} === ${current.value}`,
          decision: 'VALUE_EXISTS',
          message: `Value ${targetValue} already exists in the BST. Standard BSTs maintain unique keys. Insertion aborted.`,
          highlightNodeId: current.id,
          isCompleted: true,
          treeSnapshot: this.cloneTree(workingTree)
        });

        return {
          operationType: 'insert',
          targetValue,
          initialTreeSnapshot: initialTree,
          finalTreeSnapshot: initialTree,
          steps,
          success: false,
          message: `Value ${targetValue} already exists in the tree.`
        };
      }

      if (targetValue < current.value) {
        // Target < Node -> Left
        steps.push({
          stepNumber: stepNumber++,
          currentNodeId: current.id,
          currentNodeValue: current.value,
          targetValue,
          comparison: `${targetValue} < ${current.value}`,
          decision: 'MOVE_LEFT',
          direction: 'left',
          message: `${targetValue} is smaller than ${current.value}. Follow the BST property: proceed to the LEFT subtree.`,
          highlightNodeId: current.id,
          isCompleted: false,
          treeSnapshot: this.cloneTree(workingTree)
        });

        parent = current;
        direction = 'left';

        if (!current.left) {
          // Found insertion location!
          break;
        }
        current = current.left;
      } else {
        // Target > Node -> Right
        steps.push({
          stepNumber: stepNumber++,
          currentNodeId: current.id,
          currentNodeValue: current.value,
          targetValue,
          comparison: `${targetValue} > ${current.value}`,
          decision: 'MOVE_RIGHT',
          direction: 'right',
          message: `${targetValue} is greater than ${current.value}. Follow the BST property: proceed to the RIGHT subtree.`,
          highlightNodeId: current.id,
          isCompleted: false,
          treeSnapshot: this.cloneTree(workingTree)
        });

        parent = current;
        direction = 'right';

        if (!current.right) {
          // Found insertion location!
          break;
        }
        current = current.right;
      }
    }

    // Perform Insertion
    const newNodeId = this.generateNodeId();
    const newNode: BSTNode = {
      id: newNodeId,
      value: targetValue,
      depth: (parent ? parent.depth : 0) + 1,
      parent: parent ? parent.id : null,
      left: null,
      right: null
    };

    if (direction === 'left' && parent) {
      parent.left = newNode;
    } else if (direction === 'right' && parent) {
      parent.right = newNode;
    }

    this.computeLayout(workingTree, 360, 220);

    // Final Insertion Complete Step
    steps.push({
      stepNumber: stepNumber++,
      currentNodeId: newNode.id,
      currentNodeValue: newNode.value,
      targetValue,
      comparison: `Attached as ${direction} child of node ${parent?.value}`,
      decision: 'INSERT_FOUND',
      direction: direction || undefined,
      message: `Found null pointer! Inserted new node ${targetValue} as the ${direction} child of ${parent?.value}. Invariant preserved.`,
      highlightNodeId: newNode.id,
      highlightEdge: parent ? { fromId: parent.id, toId: newNode.id } : undefined,
      isCompleted: true,
      treeSnapshot: this.cloneTree(workingTree)
    });

    return {
      operationType: 'insert',
      targetValue,
      initialTreeSnapshot: initialTree,
      finalTreeSnapshot: workingTree,
      steps,
      success: true,
      message: `Successfully inserted ${targetValue} into the Binary Search Tree.`
    };
  }

  /**
   * Execute BST Search with complete step trace.
   */
  public static search(treeRoot: BSTNode | null, targetValue: number): BSTOperationResult {
    const initialTree = this.cloneTree(treeRoot);
    const steps: BSTOperationStep[] = [];
    let stepNumber = 1;

    if (!treeRoot) {
      return {
        operationType: 'search',
        targetValue,
        initialTreeSnapshot: null,
        finalTreeSnapshot: null,
        steps: [],
        success: false,
        message: 'Tree is empty. Target not found.'
      };
    }

    let current: BSTNode | null = this.cloneTree(treeRoot);

    while (current) {
      if (current.value === targetValue) {
        steps.push({
          stepNumber: stepNumber++,
          currentNodeId: current.id,
          currentNodeValue: current.value,
          targetValue,
          comparison: `${targetValue} === ${current.value}`,
          decision: 'SEARCH_FOUND',
          message: `Match discovered! Value ${targetValue} found at node ${current.id}.`,
          highlightNodeId: current.id,
          isCompleted: true,
          treeSnapshot: this.cloneTree(treeRoot)
        });

        return {
          operationType: 'search',
          targetValue,
          initialTreeSnapshot: initialTree,
          finalTreeSnapshot: initialTree,
          steps,
          success: true,
          message: `Found value ${targetValue} in BST.`
        };
      }

      if (targetValue < current.value) {
        steps.push({
          stepNumber: stepNumber++,
          currentNodeId: current.id,
          currentNodeValue: current.value,
          targetValue,
          comparison: `${targetValue} < ${current.value}`,
          decision: 'MOVE_LEFT',
          direction: 'left',
          message: `${targetValue} is smaller than ${current.value}. Searching left subtree.`,
          highlightNodeId: current.id,
          isCompleted: false,
          treeSnapshot: this.cloneTree(treeRoot)
        });
        current = current.left;
      } else {
        steps.push({
          stepNumber: stepNumber++,
          currentNodeId: current.id,
          currentNodeValue: current.value,
          targetValue,
          comparison: `${targetValue} > ${current.value}`,
          decision: 'MOVE_RIGHT',
          direction: 'right',
          message: `${targetValue} is greater than ${current.value}. Searching right subtree.`,
          highlightNodeId: current.id,
          isCompleted: false,
          treeSnapshot: this.cloneTree(treeRoot)
        });
        current = current.right;
      }
    }

    steps.push({
      stepNumber: stepNumber++,
      currentNodeId: null,
      currentNodeValue: null,
      targetValue,
      comparison: 'Reached null leaf pointer',
      decision: 'SEARCH_NOT_FOUND',
      message: `Reached null leaf pointer. Target ${targetValue} is not present in the tree.`,
      isCompleted: true,
      treeSnapshot: this.cloneTree(treeRoot)
    });

    return {
      operationType: 'search',
      targetValue,
      initialTreeSnapshot: initialTree,
      finalTreeSnapshot: initialTree,
      steps,
      success: false,
      message: `Value ${targetValue} was not found in the BST.`
    };
  }

  /**
   * Compute 2D SVG spatial coordinates (x, y) for nodes so that
   * child subtrees branch evenly without visual node collision.
   */
  public static computeLayout(root: BSTNode | null, svgWidth: number = 360, svgHeight: number = 220): void {
    if (!root) return;

    const maxDepth = this.getMaxDepth(root);
    const verticalGap = maxDepth > 0 ? (svgHeight - 60) / Math.max(1, maxDepth) : 40;

    const assignCoordinates = (
      node: BSTNode | null,
      depth: number,
      leftBound: number,
      rightBound: number
    ) => {
      if (!node) return;
      const x = (leftBound + rightBound) / 2;
      const y = 30 + depth * verticalGap;
      node.x = Math.round(x);
      node.y = Math.round(y);
      node.depth = depth;

      assignCoordinates(node.left, depth + 1, leftBound, x);
      assignCoordinates(node.right, depth + 1, x, rightBound);
    };

    assignCoordinates(root, 0, 20, svgWidth - 20);
  }

  public static getMaxDepth(root: BSTNode | null): number {
    if (!root) return 0;
    return 1 + Math.max(this.getMaxDepth(root.left), this.getMaxDepth(root.right));
  }

  public static getInorder(root: BSTNode | null): number[] {
    const res: number[] = [];
    const traverse = (node: BSTNode | null) => {
      if (!node) return;
      traverse(node.left);
      res.push(node.value);
      traverse(node.right);
    };
    traverse(root);
    return res;
  }

  public static getPreorder(root: BSTNode | null): number[] {
    const res: number[] = [];
    const traverse = (node: BSTNode | null) => {
      if (!node) return;
      res.push(node.value);
      traverse(node.left);
      traverse(node.right);
    };
    traverse(root);
    return res;
  }

  public static getPostorder(root: BSTNode | null): number[] {
    const res: number[] = [];
    const traverse = (node: BSTNode | null) => {
      if (!node) return;
      traverse(node.left);
      traverse(node.right);
      res.push(node.value);
    };
    traverse(root);
    return res;
  }
}
