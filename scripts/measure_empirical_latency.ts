/**
 * Empirical Latency Profiler for EGEA
 * 
 * Measures execution time under controlled microbenchmarking conditions:
 * - Proper JIT warm-up (200 iterations)
 * - N = 1,000 measured decisions across distinct scenario conditions
 * - High-resolution performance.now()
 * - Pure Policy Evaluation vs Full End-to-End Ingestion Pipeline
 */

import { EGEAEventAdapter } from '../src/services/research/egea/EGEAEventAdapter';
import { EGEAPolicyEngine } from '../src/services/research/egea/EGEAPolicyEngine';
import { EGEAEvaluationHarness } from '../src/services/research/egea/EGEAEvaluationHarness';

function profile() {
  console.log('================================================================');
  console.log('EGEA LATENCY EMPIRICAL PROFILING');
  console.log('================================================================\n');

  const scenarios = EGEAEvaluationHarness.generateScenarios();
  const testHistories = scenarios.map(s => s.generateEvents());

  // 1. JIT Warm-up (200 iterations across all scenarios)
  for (let w = 0; w < 200; w++) {
    const hist = testHistories[w % testHistories.length];
    EGEAPolicyEngine.evaluateIntervention(hist);
  }

  // 2. Measure Pure Policy Evaluation (N = 1,000)
  const N = 1000;
  const policyLatencies: number[] = [];

  for (let i = 0; i < N; i++) {
    const hist = testHistories[i % testHistories.length];
    const t0 = performance.now();
    EGEAPolicyEngine.evaluateIntervention(hist);
    const t1 = performance.now();
    policyLatencies.push(t1 - t0);
  }

  policyLatencies.sort((a, b) => a - b);
  const policyMin = policyLatencies[0];
  const policyMax = policyLatencies[policyLatencies.length - 1];
  const policyMean = policyLatencies.reduce((a, b) => a + b, 0) / N;
  const policyMedian = policyLatencies[Math.floor(N / 2)];
  const policyP95 = policyLatencies[Math.floor(N * 0.95)];

  // 3. Measure End-to-End Pipeline (Ingestion + Adapter + Validation + Policy) (N = 1,000)
  const e2eLatencies: number[] = [];

  for (let i = 0; i < N; i++) {
    const t0 = performance.now();
    const adapter = new EGEAEventAdapter(`prof-sess-${i}`, 'ds-binary-search-tree');
    adapter.recordInteraction({
      stepIdentifier: 'step-profile-1',
      attemptedAction: 'LEFT',
      expectedAction: 'RIGHT',
      isCorrect: false,
      errorCategory: 'VALUE_COMPARISON',
      stateContext: { nodeVal: 50, targetVal: 40 },
    });
    adapter.recordInteraction({
      stepIdentifier: 'step-profile-2',
      attemptedAction: 'LEFT',
      expectedAction: 'RIGHT',
      isCorrect: false,
      errorCategory: 'VALUE_COMPARISON',
      stateContext: { nodeVal: 30, targetVal: 40 },
    });
    EGEAPolicyEngine.evaluateIntervention(adapter.getEvents());
    const t1 = performance.now();
    e2eLatencies.push(t1 - t0);
  }

  e2eLatencies.sort((a, b) => a - b);
  const e2eMin = e2eLatencies[0];
  const e2eMax = e2eLatencies[e2eLatencies.length - 1];
  const e2eMean = e2eLatencies.reduce((a, b) => a + b, 0) / N;
  const e2eMedian = e2eLatencies[Math.floor(N / 2)];
  const e2eP95 = e2eLatencies[Math.floor(N * 0.95)];

  console.log(`Hardware / Runtime Environment:`);
  console.log(`- Architecture: ${process.arch} (${process.platform})`);
  console.log(`- Node.js Runtime: ${process.version}`);
  console.log(`- High-Res Timer: performance.now()`);
  console.log(`- Iteration Count per Test: N = ${N} decisions (after 200-cycle JIT warm-up)\n`);

  console.log('----------------------------------------------------------------');
  console.log('LATENCY BENCHMARK RESULTS (in milliseconds)');
  console.log('----------------------------------------------------------------');
  console.log('Stage'.padEnd(25) + 'Min'.padEnd(10) + 'Median'.padEnd(10) + 'Mean'.padEnd(10) + 'P95'.padEnd(10) + 'Max');
  console.log('----------------------------------------------------------------');
  console.log(
    'Pure Policy Eval'.padEnd(25) +
    `${policyMin.toFixed(3)}`.padEnd(10) +
    `${policyMedian.toFixed(3)}`.padEnd(10) +
    `${policyMean.toFixed(3)}`.padEnd(10) +
    `${policyP95.toFixed(3)}`.padEnd(10) +
    `${policyMax.toFixed(3)}`
  );
  console.log(
    'End-to-End Pipeline'.padEnd(25) +
    `${e2eMin.toFixed(3)}`.padEnd(10) +
    `${e2eMedian.toFixed(3)}`.padEnd(10) +
    `${e2eMean.toFixed(3)}`.padEnd(10) +
    `${e2eP95.toFixed(3)}`.padEnd(10) +
    `${e2eMax.toFixed(3)}`
  );
  console.log('----------------------------------------------------------------\n');
}

profile();
