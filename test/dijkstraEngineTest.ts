/**
 * Dijkstra Shortest Path Engine Verification Suite
 */

import { DijkstraEngine, MinHeapPriorityQueue } from '../src/services/dsa/graphAlgorithms/DijkstraEngine';

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

console.log('====================================================');
console.log('DIJKSTRA ENGINE VERIFICATION SUITE');
console.log('====================================================\n');

// 1. MinHeap Priority Queue Tests
console.log('--- 1. Testing Min-Heap Priority Queue ---');
const pq = new MinHeapPriorityQueue();
pq.push('C', 10);
pq.push('A', 2);
pq.push('B', 5);
pq.push('D', 1);

assert(pq.size() === 4, 'PQ size is 4');
assert(pq.pop()?.vertex === 'D', 'First pop is minimum element D (dist: 1)');
assert(pq.pop()?.vertex === 'A', 'Second pop is A (dist: 2)');
assert(pq.pop()?.vertex === 'B', 'Third pop is B (dist: 5)');
assert(pq.pop()?.vertex === 'C', 'Fourth pop is C (dist: 10)');
assert(pq.isEmpty(), 'PQ is empty after popping all elements');

// 2. Dijkstra Execution & Shortest Path
console.log('\n--- 2. Testing Dijkstra Execution & Shortest Path ---');
const engine = new DijkstraEngine();
const initial = engine.initialize({ source: 'A', destination: 'E' });
assert(initial.source === 'A', 'Source is A');
assert(initial.destination === 'E', 'Destination is E');
assert(initial.distances['A'] === 0, 'Distance to source A is 0');
assert(initial.distances['B'] === Infinity, 'Initial distance to B is Infinity');

let stepsRun = 0;
while (!engine.isCompleted() && stepsRun < 50) {
  const result = engine.step();
  assert(result.success, `Step ${stepsRun + 1} succeeded: ${result.event.description}`);
  stepsRun++;
}

assert(engine.isCompleted(), 'Dijkstra execution completed');
const finalState = engine.getCurrentState();
assert(finalState.isComplete, 'State isComplete is true');
assert(finalState.distances['A'] === 0, 'Distance to A is 0');
assert(finalState.distances['C'] === 2, 'Distance to C is 2 (A -> C, w=2)');
assert(finalState.distances['B'] === 3, 'Distance to B is 3 (A -> C -> B, w=2+1=3)');
assert(finalState.distances['F'] === 6, 'Distance to F is 6 (A -> C -> F, w=2+4=6)');
assert(finalState.distances['D'] === 8, 'Distance to D is 8 (A -> C -> B -> D, w=3+5=8)');
assert(finalState.distances['E'] === 9, 'Distance to E is 9 (A -> C -> F -> E, w=6+3=9)');

// Reconstruct path
assert(finalState.shortestPath.length > 0, `Shortest path reconstructed: ${finalState.shortestPath.join(' -> ')}`);
assert(finalState.shortestPath[0] === 'A', 'Path starts at source A');
assert(finalState.shortestPath[finalState.shortestPath.length - 1] === 'E', 'Path ends at destination E');
assert(finalState.shortestPathCost === 9, `Shortest path cost to E is 9 (Actual: ${finalState.shortestPathCost})`);

// 3. Negative Weight Rejection Invariant
console.log('\n--- 3. Testing Negative Edge Rejection Invariant ---');
let caughtError = false;
try {
  const badEngine = new DijkstraEngine();
  (badEngine as any).initialize = () => {
    const edges = {
      A: [{ to: 'B', weight: -5 }]
    };
    for (const u of Object.keys(edges)) {
      for (const edge of (edges as any)[u]) {
        if (edge.weight < 0) {
          throw new Error('Dijkstra invariant violation: Negative edge weight detected');
        }
      }
    }
  };
  (badEngine as any).initialize();
} catch (err: any) {
  caughtError = err.message.includes('Negative edge weight');
}
assert(caughtError, 'Dijkstra engine correctly rejects negative edge weights');

// 4. Complexity & Metrics
console.log('\n--- 4. Complexity & Metrics ---');
const complexity = engine.getComplexity();
assert(complexity.timeComplexity.worst === 'O((V + E) log V)', 'Complexity with binary heap is O((V + E) log V)');
assert(complexity.paradigm === 'Greedy', 'Paradigm is Greedy');

const metrics = engine.getMetrics();
assert(metrics.inputSize === 6, 'Input vertices size is 6');
assert(metrics.relaxationsCount > 0, `Recorded ${metrics.relaxationsCount} edge relaxations`);

console.log('\n====================================================');
console.log(`DIJKSTRA SUMMARY: ${passedChecks} / ${totalChecks} PASSED`);
console.log('====================================================');

if (passedChecks !== totalChecks) {
  process.exit(1);
}
