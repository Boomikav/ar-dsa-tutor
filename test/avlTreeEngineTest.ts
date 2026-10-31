/**
 * AVL Tree Engine Verification Suite
 * 
 * Verifies:
 * - LL Rotation (Single Right)
 * - RR Rotation (Single Left)
 * - LR Rotation (Double Left-Right)
 * - RL Rotation (Double Right-Left)
 * - Insertion & Deletion
 * - Height & Balance Factor accuracy (|BF| <= 1 for all nodes)
 * - BST ordering invariant across all operations
 */

import { AVLTreeEngine, AVLNode } from '../src/services/dsa/tree/AVLTreeEngine';

let totalChecks = 0;
let passedChecks = 0;

function assert(condition: boolean, message: string) {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`  ✓ ${message}`);
  } else {
    console.error(`  ✗ FAILED: ${message}`);
    process.exitCode = 1;
  }
}

function verifyBstOrdering(node: AVLNode | null, min = -Infinity, max = Infinity): boolean {
  if (!node) return true;
  if (node.value <= min || node.value >= max) return false;
  return verifyBstOrdering(node.left, min, node.value) && verifyBstOrdering(node.right, node.value, max);
}

function verifyAvlBalance(node: AVLNode | null): boolean {
  if (!node) return true;
  const leftHeight = node.left ? node.left.height : 0;
  const rightHeight = node.right ? node.right.height : 0;
  const expectedHeight = 1 + Math.max(leftHeight, rightHeight);
  const expectedBF = leftHeight - rightHeight;

  if (node.height !== expectedHeight) return false;
  if (node.balanceFactor !== expectedBF) return false;
  if (Math.abs(node.balanceFactor) > 1) return false;

  return verifyAvlBalance(node.left) && verifyAvlBalance(node.right);
}

console.log('====================================================');
console.log('AVL TREE ENGINE VERIFICATION SUITE');
console.log('====================================================\n');

const avl = new AVLTreeEngine();

// 1. LL Rotation Test: Insert 30, 20, 10
console.log('--- 1. Testing LL Rotation (Single Right Rotation) ---');
avl.initialize([]);
avl.insert(30);
avl.insert(20);
const llResult = avl.insert(10);
assert(llResult.state.lastRotationCase === 'LL_ROTATION', `Detected LL Rotation on inserting 10 (Case: ${llResult.state.lastRotationCase})`);
assert(llResult.state.root?.value === 20, `New root after Right Rotation is 20 (Actual: ${llResult.state.root?.value})`);
assert(llResult.state.root?.left?.value === 10, 'Left child is 10');
assert(llResult.state.root?.right?.value === 30, 'Right child is 30');
assert(verifyBstOrdering(llResult.state.root), 'BST ordering invariant holds after LL rotation');
assert(verifyAvlBalance(llResult.state.root), 'AVL balance property holds after LL rotation');

// 2. RR Rotation Test: Insert 10, 20, 30
console.log('\n--- 2. Testing RR Rotation (Single Left Rotation) ---');
avl.initialize([]);
avl.insert(10);
avl.insert(20);
const rrResult = avl.insert(30);
assert(rrResult.state.lastRotationCase === 'RR_ROTATION', `Detected RR Rotation on inserting 30 (Case: ${rrResult.state.lastRotationCase})`);
assert(rrResult.state.root?.value === 20, `New root after Left Rotation is 20 (Actual: ${rrResult.state.root?.value})`);
assert(rrResult.state.root?.left?.value === 10, 'Left child is 10');
assert(rrResult.state.root?.right?.value === 30, 'Right child is 30');
assert(verifyBstOrdering(rrResult.state.root), 'BST ordering invariant holds after RR rotation');
assert(verifyAvlBalance(rrResult.state.root), 'AVL balance property holds after RR rotation');

// 3. LR Rotation Test: Insert 30, 10, 20
console.log('\n--- 3. Testing LR Rotation (Double Left-Right Rotation) ---');
avl.initialize([]);
avl.insert(30);
avl.insert(10);
const lrResult = avl.insert(20);
assert(lrResult.state.lastRotationCase === 'LR_ROTATION', `Detected LR Rotation on inserting 20 (Case: ${lrResult.state.lastRotationCase})`);
assert(lrResult.state.root?.value === 20, `New root after LR Double Rotation is 20 (Actual: ${lrResult.state.root?.value})`);
assert(lrResult.state.root?.left?.value === 10, 'Left child is 10');
assert(lrResult.state.root?.right?.value === 30, 'Right child is 30');
assert(verifyBstOrdering(lrResult.state.root), 'BST ordering invariant holds after LR rotation');
assert(verifyAvlBalance(lrResult.state.root), 'AVL balance property holds after LR rotation');

// 4. RL Rotation Test: Insert 10, 30, 20
console.log('\n--- 4. Testing RL Rotation (Double Right-Left Rotation) ---');
avl.initialize([]);
avl.insert(10);
avl.insert(30);
const rlResult = avl.insert(20);
assert(rlResult.state.lastRotationCase === 'RL_ROTATION', `Detected RL Rotation on inserting 20 (Case: ${rlResult.state.lastRotationCase})`);
assert(rlResult.state.root?.value === 20, `New root after RL Double Rotation is 20 (Actual: ${rlResult.state.root?.value})`);
assert(rlResult.state.root?.left?.value === 10, 'Left child is 10');
assert(rlResult.state.root?.right?.value === 30, 'Right child is 30');
assert(verifyBstOrdering(rlResult.state.root), 'BST ordering invariant holds after RL rotation');
assert(verifyAvlBalance(rlResult.state.root), 'AVL balance property holds after RL rotation');

// 5. Deletion & Rebalancing
console.log('\n--- 5. Testing AVL Deletion & Rebalancing ---');
avl.initialize([20, 10, 40, 5, 15, 30, 50]);
assert(avl.getCurrentState().nodeCount === 7, 'Initialized AVL tree with 7 nodes');
const delResult = avl.delete(5);
assert(delResult.success, 'Successfully deleted leaf node 5');
assert(delResult.state.nodeCount === 6, 'Node count updated to 6');
assert(verifyBstOrdering(delResult.state.root), 'BST invariant holds after deletion');
assert(verifyAvlBalance(delResult.state.root), 'AVL balance holds after deletion');

// Delete node with two children
const delRootResult = avl.delete(20);
assert(delRootResult.success, 'Successfully deleted internal node 20');
assert(delRootResult.state.nodeCount === 5, 'Node count updated to 5');
assert(verifyBstOrdering(delRootResult.state.root), 'BST invariant holds after deleting internal node');
assert(verifyAvlBalance(delRootResult.state.root), 'AVL balance holds after deleting internal node');

// 6. Complexity & Metrics
console.log('\n--- 6. Complexity & Metrics ---');
const metrics = avl.getMetrics();
assert(metrics.inputSize === 5, `Metrics record 5 nodes (Actual: ${metrics.inputSize})`);
assert(metrics.treeHeight > 0, `Tree height is positive: ${metrics.treeHeight}`);
assert(metrics.rotationsCount >= 0, `Rotations count tracked: ${metrics.rotationsCount}`);

const complexity = avl.getComplexity();
assert(complexity.timeComplexity.worst === 'O(log n)', 'Worst case search/insert is O(log n)');
assert(complexity.paradigm === 'Self-Balancing Tree', 'Paradigm is Self-Balancing Tree');

console.log('\n====================================================');
console.log(`AVL TREE SUMMARY: ${passedChecks} / ${totalChecks} PASSED`);
console.log('====================================================');

if (passedChecks !== totalChecks) {
  process.exit(1);
}
