import { spawnSync } from 'child_process';
import path from 'path';

const testSuites = [
  'arFiveAlgorithmsVerification.ts',
  'arCompositionVerification.ts',
  'arUXHardeningVerification.ts',
  'arNavigationRegression.ts',
  'arVerification.ts',
  'mobileARValidationVerification.ts',
  'phase13MobileDeploymentVerification.ts',
  'phase12FinalHardeningVerification.ts',
  'dsaExpansionVerification.ts',
  'learnerModelVerification.ts',
  'multiAgentVerification.ts',
  'aiVerification.ts',
  'arAiIntegrationVerification.ts',
  'appExperienceVerification.ts',
  'researchEvaluationVerification.ts',
  'egeaEvaluationVerification.ts'
];

let totalPassed = 0;
let totalFailed = 0;
let suiteFailures: string[] = [];

console.log('====================================================');
console.log(`RUNNING ALL ${testSuites.length} VERIFICATION TEST SUITES`);
console.log('====================================================\n');

for (const suite of testSuites) {
  const fullPath = path.resolve('test', suite);
  const result = spawnSync('npx', ['tsx', fullPath], {
    encoding: 'utf-8',
    shell: true
  });

  const output = result.stdout + '\n' + result.stderr;
  
  // Extract summary if present: e.g. "121 / 121 passed" or "25 / 25 passed" or similar
  const passMatch = output.match(/(\d+)\s*\/\s*(\d+)\s*passed/i) || output.match(/Passed:\s*(\d+)/i) || output.match(/(\d+)\s*tests passed/i);
  let passedCount = 0;
  let totalCount = 0;

  if (passMatch) {
    if (passMatch[2]) {
      passedCount = parseInt(passMatch[1], 10);
      totalCount = parseInt(passMatch[2], 10);
    } else {
      passedCount = parseInt(passMatch[1], 10);
      totalCount = passedCount;
    }
  } else {
    // Count individual check marks or test passes
    const passedLines = (output.match(/✓|PASSED|PASS/g) || []).length;
    passedCount = passedLines;
    totalCount = passedLines;
  }

  if (result.status === 0) {
    console.log(`✓ ${suite.padEnd(40)}: ${passedCount} passed`);
    totalPassed += passedCount;
  } else {
    console.error(`✗ ${suite.padEnd(40)}: FAILED (exit code ${result.status})`);
    console.error(output.slice(-1000));
    totalFailed += 1;
    suiteFailures.push(suite);
  }
}

console.log('\n====================================================');
console.log(`TOTAL SUITES: ${testSuites.length}`);
console.log(`PASSED TESTS: ${totalPassed}`);
console.log(`FAILED TESTS: ${totalFailed}`);
console.log(`SUITE FAILURES: ${suiteFailures.length === 0 ? `None (ALL ${testSuites.length} SUITES PASSED)` : suiteFailures.join(', ')}`);
console.log('====================================================');

process.exit(totalFailed > 0 ? 1 : 0);
