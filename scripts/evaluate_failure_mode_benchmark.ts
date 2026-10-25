/**
 * Runner for EGEA Failure Mode & Edge-Case Benchmark
 * 
 * Specifically surfaces where EGEA and Baselines succeed, where crisp
 * thresholds fail, and where interface artifacts cause misclassification.
 */

import * as fs from 'fs';
import * as path from 'path';
import { evaluateFailureModeBenchmark } from '../src/services/research/egea/EGEAFailureModeBenchmark';

function run() {
  console.log('================================================================');
  console.log('EGEA FAILURE MODE & EDGE-CASE BENCHMARK (6 COUNTEREXAMPLES)');
  console.log('================================================================\n');

  const results = evaluateFailureModeBenchmark();

  const outDir = path.resolve(process.cwd(), 'research-results');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outPath = path.join(outDir, 'failure_mode_benchmark_report.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf-8');

  console.log('Case ID'.padEnd(10) + 'Target Ideal'.padEnd(20) + 'Matched History'.padEnd(20) + 'EGEA Output'.padEnd(20) + 'Status');
  console.log('-'.repeat(85));

  results.forEach(r => {
    console.log(
      r.caseId.padEnd(10) +
      r.intendedIdeal.padEnd(20) +
      r.matchedHistoryPrediction.padEnd(20) +
      r.egeaPrediction.padEnd(20) +
      r.behaviorClassification
    );
  });

  console.log('-'.repeat(85) + '\n');
  console.log('DETAILED FAILURE MODE & LIMITATION FINDINGS:');
  results.filter(r => r.behaviorClassification === 'DISCLOSED_LIMITATION').forEach(r => {
    console.log(`[LIMITATION] ${r.caseId} (${r.name}):`);
    console.log(`  - Target Ideal : ${r.intendedIdeal}`);
    console.log(`  - EGEA Produced: ${r.egeaPrediction}`);
    console.log(`  - Root Cause   : ${r.technicalRootCause}\n`);
  });

  console.log(`Report successfully written to: ${outPath}\n`);
}

run();
