/**
 * Runner for the EGEA Engineering Challenge Suite
 * 
 * Executes evaluation of 18 realistic pedagogical scenarios across:
 * - Fixed Hint Baseline
 * - Simple Error Rule Baseline
 * - EGEA Adaptive Policy
 * 
 * Writes detailed machine-readable report to `research-results/engineering_challenge_suite_report.json`.
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  ENGINEERING_CHALLENGE_SUITE,
  evaluateEngineeringChallengeSuite,
} from '../src/services/research/egea/EGEAIndependentChallengeSet';

function run() {
  console.log('================================================================');
  console.log('EGEA INDEPENDENT ENGINEERING CHALLENGE SUITE (N = 18)');
  console.log('================================================================\n');

  const report = evaluateEngineeringChallengeSuite();

  const outDir = path.resolve(process.cwd(), 'research-results');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outPath = path.join(outDir, 'engineering_challenge_suite_report.json');
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf-8');

  console.log('SCENARIO-BY-SCENARIO TRAJECTORY LOG:');
  console.log('ID'.padEnd(10) + 'Algorithm'.padEnd(25) + 'Target Label'.padEnd(22) + 'Fixed Hint'.padEnd(20) + 'Simple Rule'.padEnd(20) + 'EGEA');
  console.log('-'.repeat(115));

  ENGINEERING_CHALLENGE_SUITE.forEach(s => {
    const fixed = report.fixedHint.confusionMatrix[s.targetIntervention];
    const simple = report.simpleRule.confusionMatrix[s.targetIntervention];
    const egea = report.egea.confusionMatrix[s.targetIntervention];

    // Get individual prediction
    const fPred = Object.keys(fixed).find(k => fixed[k] > 0) || 'NONE';
    const sPred = Object.keys(simple).find(k => simple[k] > 0) || 'NONE';
    const ePred = Object.keys(egea).find(k => egea[k] > 0) || 'NONE';

    console.log(
      s.id.padEnd(10) +
      s.algorithmId.padEnd(25) +
      s.targetIntervention.padEnd(22) +
      `${fPred} (${fPred === s.targetIntervention ? '✓' : '✗'})`.padEnd(20) +
      `${sPred} (${sPred === s.targetIntervention ? '✓' : '✗'})`.padEnd(20) +
      `${ePred} (${ePred === s.targetIntervention ? '✓' : '✗'})`
    );
  });

  console.log('-'.repeat(115) + '\n');

  console.log('---------------------------------------------------------------------------------------');
  console.log('OVERALL SYSTEM COMPARISON ON INDEPENDENT ENGINEERING CHALLENGES (N = 18)');
  console.log('---------------------------------------------------------------------------------------');
  console.log('System'.padEnd(28) + 'Accuracy %'.padEnd(14) + 'Macro-P'.padEnd(12) + 'Macro-R'.padEnd(12) + 'Macro-F1 (Unweighted)'.padEnd(24) + 'Macro-F1 (Harmonic)');
  console.log('---------------------------------------------------------------------------------------');

  [report.fixedHint, report.simpleRule, report.egea].forEach(s => {
    console.log(
      s.systemName.padEnd(28) +
      `${s.accuracy}%`.padEnd(14) +
      s.macroPrecision.toFixed(3).padEnd(12) +
      s.macroRecall.toFixed(3).padEnd(12) +
      s.macroF1Unweighted.toFixed(3).padEnd(24) +
      s.macroF1Harmonic.toFixed(3)
    );
  });

  console.log('---------------------------------------------------------------------------------------\n');
  console.log(`Report successfully written to: ${outPath}\n`);
}

run();
