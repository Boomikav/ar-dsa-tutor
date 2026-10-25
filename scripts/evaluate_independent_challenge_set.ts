/**
 * Independent Pedagogical Challenge Set Runner
 * 
 * Evaluates human expert labels against EGEA and the two baselines.
 */

import { evaluateIndependentChallenges } from '../src/services/research/egea/EGEAIndependentChallengeSet';

function run() {
  console.log('================================================================');
  console.log('INDEPENDENT PEDAGOGICAL CHALLENGE SET EVALUATION');
  console.log('================================================================\n');

  const { results, egeaAccuracy, fixedHintAccuracy, simpleRuleAccuracy } = evaluateIndependentChallenges();

  console.log('ID'.padEnd(10) + 'Expert Label'.padEnd(22) + 'Fixed Hint'.padEnd(20) + 'Simple Rule'.padEnd(20) + 'EGEA');
  console.log('--------------------------------------------------------------------------------------------------');

  results.forEach(r => {
    const fStatus = r.fixedHintMatchesExpert ? '✓' : '✗';
    const sStatus = r.simpleRuleMatchesExpert ? '✓' : '✗';
    const eStatus = r.egeaMatchesExpert ? '✓' : '✗';

    console.log(
      r.scenarioId.padEnd(10) +
      r.expertLabel.padEnd(22) +
      `${r.fixedHintPrediction} (${fStatus})`.padEnd(20) +
      `${r.simpleRulePrediction} (${sStatus})`.padEnd(20) +
      `${r.egeaPrediction} (${eStatus})`
    );
  });

  console.log('--------------------------------------------------------------------------------------------------\n');
  console.log(`SUMMARY ACCURACY ON INDEPENDENT CHALLENGES:`);
  console.log(`- Fixed Hint Baseline        : ${fixedHintAccuracy.toFixed(1)}%`);
  console.log(`- Simple Error Rule Baseline : ${simpleRuleAccuracy.toFixed(1)}%`);
  console.log(`- EGEA Adaptive Policy       : ${egeaAccuracy.toFixed(1)}%`);
  console.log('================================================================\n');
}

run();
