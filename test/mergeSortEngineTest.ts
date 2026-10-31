/**
 * Merge Sort Engine Verification Suite
 */

import { MergeSortEngine } from '../src/services/dsa/sorting/MergeSortEngine';

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
console.log('MERGE SORT ENGINE VERIFICATION SUITE');
console.log('====================================================\n');

const engine = new MergeSortEngine();

// 1. Initial State & Invariants
console.log('--- 1. Initialization & Invariants ---');
const initialState = engine.initialize([38, 27, 43, 3, 9, 82, 10]);
assert(initialState.originalArray.length === 7, 'Initial array size is 7');
assert(initialState.currentStepIndex === 0, 'Initial step index is 0');
assert(!initialState.isComplete, 'Initial isComplete is false');

const complexity = engine.getComplexity();
assert(complexity.timeComplexity.worst === 'O(n log n)', 'Worst-case time complexity is O(n log n)');
assert(complexity.spaceComplexity.auxiliary === 'O(n)', 'Auxiliary space complexity is O(n)');
assert(complexity.stability === true, 'Merge sort is stable');

// 2. Step-by-Step Execution
console.log('\n--- 2. Step-by-Step Execution ---');
let stepsRun = 0;
while (!engine.isCompleted() && stepsRun < 100) {
  const result = engine.step();
  assert(result.success, `Step ${stepsRun + 1} executed successfully: ${result.event.description}`);
  stepsRun++;
}

assert(engine.isCompleted(), 'Engine reached completed status');
const finalState = engine.getCurrentState();
assert(finalState.isComplete, 'State isComplete is true');
assert(JSON.stringify(finalState.array) === JSON.stringify([3, 9, 10, 27, 38, 43, 82]), `Final array is properly sorted: [${finalState.array.join(', ')}]`);
assert(finalState.comparisonsCount > 0, `Recorded ${finalState.comparisonsCount} comparisons`);
assert(finalState.writesCount > 0, `Recorded ${finalState.writesCount} writes`);

// 3. Edge Cases
console.log('\n--- 3. Edge Case: Reverse-Sorted Input ---');
engine.initialize([5, 4, 3, 2, 1]);
while (!engine.isCompleted()) {
  engine.step();
}
assert(JSON.stringify(engine.getCurrentState().array) === JSON.stringify([1, 2, 3, 4, 5]), 'Reverse-sorted array is correctly sorted');

console.log('\n--- 4. Edge Case: Duplicate Elements ---');
engine.initialize([4, 2, 4, 3, 2, 1]);
while (!engine.isCompleted()) {
  engine.step();
}
assert(JSON.stringify(engine.getCurrentState().array) === JSON.stringify([1, 2, 2, 3, 4, 4]), 'Array with duplicates is correctly sorted');

console.log('\n--- 5. Edge Case: Already Sorted Input ---');
engine.initialize([1, 2, 3, 4, 5]);
while (!engine.isCompleted()) {
  engine.step();
}
assert(JSON.stringify(engine.getCurrentState().array) === JSON.stringify([1, 2, 3, 4, 5]), 'Already sorted array remains sorted');

console.log('\n--- 6. Edge Case: Single Element ---');
engine.initialize([42]);
assert(engine.isCompleted(), 'Single element is complete immediately');
assert(engine.getCurrentState().array[0] === 42, 'Single element array preserved');

console.log('\n====================================================');
console.log(`MERGE SORT SUMMARY: ${passedChecks} / ${totalChecks} PASSED`);
console.log('====================================================');

if (passedChecks !== totalChecks) {
  process.exit(1);
}
