/**
 * Runner for EGEA Held-Out Evaluation Suite (N = 12)
 * 
 * Independently benchmarks all 4 pedagogical adaptation systems against pre-registered,
 * boundary-stressing held-out trajectories not used in tuning.
 */

import * as fs from 'fs';
import * as path from 'path';
import { evaluateHeldOutSuite } from '../src/services/research/egea/EGEAHeldOutEvaluationSuite';

function run() {
  console.log('================================================================');
  console.log('EGEA HELD-OUT EVALUATION SUITE (N = 12 BOUNDARY & ADVERSARIAL CASES)');
  console.log('================================================================\n');

  const { cases, metrics } = evaluateHeldOutSuite();

  const outDir = path.resolve(process.cwd(), 'research-results');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outPath = path.join(outDir, 'held_out_evaluation_report.json');
  fs.writeFileSync(outPath, JSON.stringify({ cases, metrics }, null, 2), 'utf-8');

  console.log('ID'.padEnd(12) + 'Category'.padEnd(22) + 'Target Label'.padEnd(22) + 'Fixed Hint'.padEnd(16) + 'Simple Rule'.padEnd(16) + 'Matched Hist'.padEnd(16) + 'EGEA Output');
  console.log('-'.repeat(120));

  cases.forEach(c => {
    const fMark = c.fixedHint === c.intendedIdeal ? '✓' : '✗';
    const sMark = c.simpleRule === c.intendedIdeal ? '✓' : '✗';
    const mMark = c.matchedHistory === c.intendedIdeal ? '✓' : '✗';
    const eMark = c.egea === c.intendedIdeal ? '✓' : '✗';

    console.log(
      c.id.padEnd(12) +
      c.category.padEnd(22) +
      c.intendedIdeal.padEnd(22) +
      `${c.fixedHint} (${fMark})`.padEnd(16) +
      `${c.simpleRule} (${sMark})`.padEnd(16) +
      `${c.matchedHistory} (${mMark})`.padEnd(16) +
      `${c.egea} (${eMark})`
    );
  });

  console.log('-'.repeat(120) + '\n');

  console.log('------------------------------------------------------------------------------------------------------');
  console.log('SYSTEM COMPARISON ON HELD-OUT ADVERSARIAL & BOUNDARY TRAJECTORIES (N = 12)');
  console.log('------------------------------------------------------------------------------------------------------');
  console.log(
    'System'.padEnd(30) +
    'Accuracy %'.padEnd(14) +
    'Macro-P'.padEnd(12) +
    'Macro-R'.padEnd(12) +
    'Macro-F1 (Unweighted)'.padEnd(24) +
    'Macro-F1 (Harmonic)'
  );
  console.log('-'.repeat(102));

  [metrics.fixedHint, metrics.simpleRule, metrics.matchedHistory, metrics.egea].forEach(m => {
    console.log(
      m.name.padEnd(30) +
      `${(m.accuracy * 100).toFixed(1)}%`.padEnd(14) +
      m.macroPrecision.toFixed(3).padEnd(12) +
      m.macroRecall.toFixed(3).padEnd(12) +
      m.macroF1Unweighted.toFixed(3).padEnd(24) +
      m.macroF1Harmonic.toFixed(3)
    );
  });

  console.log('------------------------------------------------------------------------------------------------------\n');
  console.log(`Machine-readable report written to: ${outPath}\n`);
}

run();
