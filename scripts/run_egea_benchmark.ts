/**
 * EGEA Benchmark Runner
 * 
 * Executes formal evaluation across 7 pedagogical scenario families comparing:
 * 1. Fixed Hint Baseline
 * 2. Simple Error Rule Baseline
 * 3. EGEA Adaptive Policy
 * 
 * Generates machine-readable research report in `research-results/egea_evaluation_report.json`.
 */

import * as fs from 'fs';
import * as path from 'path';
import { EGEAEvaluationHarness } from '../src/services/research/egea/EGEAEvaluationHarness';

function run() {
  console.log('================================================================');
  console.log('AR-DSA TUTOR — EGEA TECHNICAL BENCHMARK & COMPARATIVE EVALUATION');
  console.log('================================================================\n');

  const report = EGEAEvaluationHarness.runBenchmark();

  const outDir = path.resolve(process.cwd(), 'research-results');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outPath = path.join(outDir, 'egea_evaluation_report.json');
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf-8');

  console.log(`Evaluated ${report.scenarioCount} scenarios across 6 algorithm & failure families:`);
  Object.entries(report.scenariosPerFamily).forEach(([fam, count]) => {
    console.log(`  - ${fam.padEnd(32)}: ${count} scenarios`);
  });

  console.log('\n----------------------------------------------------------------');
  console.log('SYSTEM COMPARISON SUMMARY');
  console.log('----------------------------------------------------------------');
  console.log(
    'System'.padEnd(28) +
    'Appropriate %'.padEnd(16) +
    'Macro-F1'.padEnd(12) +
    'Avg Latency'.padEnd(15) +
    'P95 Latency'
  );
  console.log('----------------------------------------------------------------');

  const systems = [
    report.systems.fixedHintBaseline,
    report.systems.simpleErrorRuleBaseline,
    report.systems.egeaAdaptivePolicy,
  ];

  systems.forEach(s => {
    console.log(
      s.systemName.padEnd(28) +
      `${s.appropriatenessRate}%`.padEnd(16) +
      s.macroF1.toFixed(3).padEnd(12) +
      `${s.averageLatencyMs} ms`.padEnd(15) +
      `${s.p95LatencyMs} ms`
    );
  });

  console.log('----------------------------------------------------------------\n');
  console.log(`Report successfully written to: ${outPath}\n`);
}

run();
