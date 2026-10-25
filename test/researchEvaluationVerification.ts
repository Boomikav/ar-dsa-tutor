/**
 * Phase 10: Research Evaluation & Experimental Framework Verification Suite
 * 
 * Tests:
 * 1. Learning Metric Correctness (Absolute Gain, Normalized Gain, Retention, Accuracy, Misconception Rate, Independent Success Rate)
 * 2. Statistical Utilities (Descriptive Stats, Student's t-test, Welch's t-test, Paired t-test, Mann-Whitney U, Wilcoxon Signed-Rank)
 * 3. Effect Size Methods (Cohen's d, Hedges' g correction, Rank-biserial r, Confidence Intervals)
 * 4. Multiple Comparisons Adjustments (Holm-Bonferroni, Benjamini-Hochberg)
 * 5. Data Quality & Hygiene (Duplicate detection, bounds validation, timestamp auditing, exclusion reporting)
 * 6. Task Reproducibility (Seeded PRNG deterministic generation across runs)
 * 7. Privacy & Anti-PII Enforcement (Pseudonymous IDs, rejection of emails/tokens, sanitized telemetry)
 * 8. Longitudinal Misconception Tracking & Operational Resolution Criteria
 * 9. AI Quality Deterministic Validation (Schema, topic grounding, state invariant protection)
 * 10. Official 10-Item System Usability Scale (SUS) Standard Scoring
 * 11. Data Export Sanitation (CSV and JSON schema integrity, zero secrets)
 * 12. Critical Anti-Fabrication Invariant (Clean state: 0 empirical participants, no fabricated gain/usability/AI numbers)
 */

import { ResearchStatisticsEngine } from '../src/services/evaluation/ResearchStatisticsEngine';
import { ResearchDataManager } from '../src/services/evaluation/ResearchDataManager';
import { RESEARCH_ASSESSMENT_BANK, getResearchQuestionsByStage } from '../src/data/researchAssessments';
import { LearningOutcome } from '../src/models/research';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ ${testName}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${testName}${detail ? ` - ${detail}` : ''}`);
  }
}

async function runResearchEvaluationVerification() {
  console.log('================================================================');
  console.log('PHASE 10: RESEARCH EVALUATION & EXPERIMENTAL FRAMEWORK VERIFICATION');
  console.log('================================================================\n');

  const dataManager = ResearchDataManager.getInstance();
  dataManager.reset();

  // ==================== TEST GROUP 1: LEARNING METRICS ====================
  console.log('--- TEST GROUP 1: Learning Metric Mathematical Formulas ---');
  {
    // Absolute gain
    const absGain1 = ResearchStatisticsEngine.calculateAbsoluteGain(45, 75);
    assert(absGain1 === 30, 'Absolute gain calculated correctly for positive improvement');

    const absGain2 = ResearchStatisticsEngine.calculateAbsoluteGain(60, 50);
    assert(absGain2 === -10, 'Absolute gain calculated correctly for score decrease');

    // Hake's normalized gain
    // Standard positive case: (70 - 40) / (100 - 40) = 30 / 60 = 0.50
    const normGain1 = ResearchStatisticsEngine.calculateNormalizedGain(40, 70);
    assert(normGain1 === 0.5, `Hake's normalized gain matches 0.5 (got ${normGain1})`);

    // Zero change: (50 - 50) -> 0
    const normGain2 = ResearchStatisticsEngine.calculateNormalizedGain(50, 50);
    assert(normGain2 === 0, 'Normalized gain is 0 when pre equals post');

    // Normalized loss: (30 - 50) / 50 = -20 / 50 = -0.40
    const normLoss = ResearchStatisticsEngine.calculateNormalizedGain(50, 30);
    assert(normLoss === -0.4, `Normalized loss computed correctly for negative gain (got ${normLoss})`);

    // Edge case: preScore >= 100
    const edgeNorm = ResearchStatisticsEngine.calculateNormalizedGain(100, 100);
    assert(edgeNorm === 0, 'Normalized gain handles pre=100 without division by zero');

    // Retention ratio
    const retention1 = ResearchStatisticsEngine.calculateRetentionRatio(80, 72);
    assert(retention1 === 0.9, `Retention ratio calculates correctly (72/80 = 0.9, got ${retention1})`);

    const retentionEdge = ResearchStatisticsEngine.calculateRetentionRatio(0, 0);
    assert(retentionEdge === 1, 'Retention ratio handles post=0 gracefully');

    // Accuracy & Misconception rate
    const acc = ResearchStatisticsEngine.calculateAccuracy(8, 10);
    assert(acc === 0.8, 'Accuracy calculates correctly (8/10 = 0.8)');

    const miscRate = ResearchStatisticsEngine.calculateMisconceptionRate(3, 12);
    assert(miscRate === 0.25, 'Misconception rate calculates correctly (3/12 = 0.25)');

    // Independent success rate
    const indepRate = ResearchStatisticsEngine.calculateIndependentSuccessRate(6, 10);
    assert(indepRate === 0.6, 'Independent success rate calculates correctly (6/10 = 0.6)');
  }

  // ==================== TEST GROUP 2: DESCRIPTIVE & STATISTICAL TESTS ====================
  console.log('\n--- TEST GROUP 2: Statistical Methods & Inferential Tests ---');
  {
    const sample = [10, 20, 30, 40, 50];
    const desc = ResearchStatisticsEngine.calculateDescriptiveStats(sample);
    assert(desc.n === 5, 'Descriptive stats: correct sample count');
    assert(desc.mean === 30, 'Descriptive stats: correct mean');
    assert(desc.median === 30, 'Descriptive stats: correct median');
    // Sample variance: (( -20^2 + -10^2 + 0 + 10^2 + 20^2 ) / 4 ) = 1000 / 4 = 250
    assert(desc.variance === 250, `Descriptive stats: correct sample variance (got ${desc.variance})`);
    assert(Math.abs(desc.standardDeviation - 15.811) < 0.01, 'Descriptive stats: correct sample standard deviation');

    // Two-sample t-tests
    const group1 = [20, 22, 24, 26, 28]; // mean = 24
    const group2 = [30, 32, 34, 36, 38]; // mean = 34
    const tResult = ResearchStatisticsEngine.independentTTest(group1, group2);
    assert(tResult.assumptionsMet, 'Two-sample t-test assumptions verified');
    assert(tResult.statistic < 0, 't-statistic is negative when mean1 < mean2');
    assert(tResult.isSignificant, 'Detects statistically significant difference between separated groups');

    // Welch's t-test with unequal variance
    const groupUnequalA = [10, 11, 12, 10, 11];
    const groupUnequalB = [25, 35, 45, 15, 55];
    const welch = ResearchStatisticsEngine.welchTTest(groupUnequalA, groupUnequalB);
    assert(welch.assumptionsMet, 'Welch t-test completes on unequal variance samples');
    assert(welch.degreesOfFreedom !== undefined && welch.degreesOfFreedom > 0, 'Welch computes Satterthwaite degrees of freedom');

    // Paired t-test
    const preScores = [50, 55, 60, 65, 70];
    const postScores = [65, 70, 75, 80, 85]; // Every participant improved by +15
    const paired = ResearchStatisticsEngine.pairedTTest(preScores, postScores);
    assert(paired.assumptionsMet, 'Paired t-test completes on matched pre/post vectors');
    assert(paired.isSignificant, 'Paired t-test identifies uniform improvement as significant');

    // Mann-Whitney U test (non-parametric)
    const mwu = ResearchStatisticsEngine.mannWhitneyUTest(group1, group2);
    assert(mwu.assumptionsMet, 'Mann-Whitney U completes on non-parametric distribution');
    assert(mwu.statistic >= 0, 'Mann-Whitney U statistic is non-negative');

    // Wilcoxon signed-rank test
    const wilcoxon = ResearchStatisticsEngine.wilcoxonSignedRankTest(preScores, postScores);
    assert(wilcoxon.assumptionsMet, 'Wilcoxon signed-rank test evaluates paired differences');
  }

  // ==================== TEST GROUP 3: EFFECT SIZES & CONFIDENCE INTERVALS ====================
  console.log('\n--- TEST GROUP 3: Effect Size Computations ---');
  {
    const groupA = [10, 12, 14, 16, 18]; // mean 14
    const groupB = [20, 22, 24, 26, 28]; // mean 24, diff = 10
    const cohen = ResearchStatisticsEngine.calculateCohensD(groupB, groupA);
    assert(cohen.value > 0, `Cohen's d is positive when group B > group A (got ${cohen.value})`);
    assert(cohen.interpretation === 'LARGE', `Identifies large effect size (got ${cohen.interpretation})`);
    assert(cohen.ci95Lower < cohen.value && cohen.ci95Upper > cohen.value, 'Cohen d 95% confidence interval spans the point estimate');

    // Hedges' g small-sample correction
    const hedges = ResearchStatisticsEngine.calculateHedgesG(groupB, groupA);
    assert(hedges.value <= cohen.value, "Hedges' g is slightly smaller than Cohen's d for small samples due to J(df) correction");

    // Rank-biserial correlation
    const rankBi = ResearchStatisticsEngine.calculateRankBiserialCorrelation(groupB, groupA);
    assert(rankBi.metric === 'RANK_BISERIAL', 'Rank-biserial correlation computed');
    assert(rankBi.value >= -1 && rankBi.value <= 1, 'Rank-biserial r is bounded between -1 and 1');
  }

  // ==================== TEST GROUP 4: MULTIPLE COMPARISONS ====================
  console.log('\n--- TEST GROUP 4: Multiple Comparisons Corrections ---');
  {
    const rawPs = [0.005, 0.012, 0.04, 0.06, 0.15];
    const holm = ResearchStatisticsEngine.holmBonferroni(rawPs, 0.05);
    assert(holm.length === 5, 'Holm-Bonferroni adjusts all p-values');
    assert(holm[0].adjustedP >= rawPs[0], 'Holm adjusted p-value is greater than or equal to raw p');

    const bh = ResearchStatisticsEngine.benjaminiHochberg(rawPs, 0.05);
    assert(bh.length === 5, 'Benjamini-Hochberg adjusts all p-values');
    assert(bh[0].adjustedP <= holm[0].adjustedP, 'FDR adjustment is at least as powerful as family-wise error rate adjustment');
  }

  // ==================== TEST GROUP 5: PERSONALIZATION METRICS ====================
  console.log('\n--- TEST GROUP 5: Personalization & Adaptation Metrics ---');
  {
    const metrics = ResearchStatisticsEngine.calculatePersonalizationMetrics(
      4, // difficulty adaptation events
      10, // eligible evaluations
      3, // misconceptions
      [2, 1, 2], // steps to remediation
      [
        ['EASY', 'MEDIUM', 'HARD'],
        ['EASY', 'EASY', 'MEDIUM'],
        ['EASY', 'MEDIUM', 'MEDIUM']
      ]
    );

    assert(metrics.adaptationRate === 0.4, `Adaptation rate matches 4/10 = 0.4 (got ${metrics.adaptationRate})`);
    assert(metrics.adaptationResponsiveness > 0, 'Adaptation responsiveness computed');
    assert(metrics.trajectoryDiversity > 0, `Trajectory diversity detected across non-identical learners (got ${metrics.trajectoryDiversity})`);
  }

  // ==================== TEST GROUP 6: OFFICIAL SYSTEM USABILITY SCALE (SUS) ====================
  console.log('\n--- TEST GROUP 6: Official System Usability Scale (SUS) Scoring ---');
  {
    // Best possible score: odd items = 5, even items = 1
    // Odd contributions: 5-1 = 4 (x5) = 20
    // Even contributions: 5-1 = 4 (x5) = 20
    // Total sum = 40. SUS = 40 * 2.5 = 100.
    const perfectSUS = ResearchStatisticsEngine.calculateOfficialSUSScore([5, 1, 5, 1, 5, 1, 5, 1, 5, 1]);
    assert(perfectSUS === 100, `Perfect SUS score yields 100 (got ${perfectSUS})`);

    // Worst possible score: odd items = 1, even items = 5
    // Odd contributions: 1-1 = 0
    // Even contributions: 5-5 = 0
    // Total sum = 0. SUS = 0 * 2.5 = 0.
    const worstSUS = ResearchStatisticsEngine.calculateOfficialSUSScore([1, 5, 1, 5, 1, 5, 1, 5, 1, 5]);
    assert(worstSUS === 0, `Worst SUS score yields 0 (got ${worstSUS})`);

    // Average neutral score: all 3s
    // Odd contributions: 3-1 = 2 (x5) = 10
    // Even contributions: 5-3 = 2 (x5) = 10
    // Total sum = 20. SUS = 20 * 2.5 = 50.
    const neutralSUS = ResearchStatisticsEngine.calculateOfficialSUSScore([3, 3, 3, 3, 3, 3, 3, 3, 3, 3]);
    assert(neutralSUS === 50, `Neutral SUS score yields 50 (got ${neutralSUS})`);

    // Error on malformed response length
    let threw = false;
    try {
      ResearchStatisticsEngine.calculateOfficialSUSScore([3, 3, 3]);
    } catch {
      threw = true;
    }
    assert(threw, 'Rejects invalid SUS questionnaire with fewer than 10 responses');
  }

  // ==================== TEST GROUP 7: DATA QUALITY & HYGIENE ====================
  console.log('\n--- TEST GROUP 7: Data Quality & Hygiene Auditing ---');
  {
    const rawBatch = [
      { participantId: 'P001', condition: 'CONTROL', preTestScore: 40, postTestScore: 60, timestamp: new Date().toISOString() },
      { participantId: 'P001', condition: 'CONTROL', preTestScore: 40, postTestScore: 60 }, // Duplicate
      { participantId: 'P002', condition: 'INVALID_COND', preTestScore: 50, postTestScore: 70 }, // Bad condition
      { participantId: 'P003', condition: 'AR_DSA_TUTOR', preTestScore: -5, postTestScore: 80 }, // Pre-test score out of bounds
      { participantId: 'P004', condition: 'AR_DSA_TUTOR', preTestScore: 60, postTestScore: 110 }, // Post-test score out of bounds
      { participantId: 'P005', condition: 'AR_DSA_TUTOR', preTestScore: 50, postTestScore: 75, timestamp: '2099-01-01T00:00:00Z' }, // Impossible future timestamp
      { participantId: 'P006', condition: 'AR_DSA_TUTOR', preTestScore: 45, postTestScore: 85, timestamp: new Date().toISOString() } // Valid
    ];

    const qualityReport = dataManager.validateDatasetQuality(rawBatch);
    assert(qualityReport.totalRecordsChecked === 7, 'Checked all 7 test records');
    assert(qualityReport.validRecords === 2, `Identified exactly 2 valid records (got ${qualityReport.validRecords})`);
    assert(qualityReport.excludedRecords === 5, `Identified and excluded 5 invalid records (got ${qualityReport.excludedRecords})`);
    assert(qualityReport.exclusionReasons.length === 5, 'Documented explicit exclusion reasons for all excluded records');
  }

  // ==================== TEST GROUP 8: REPRODUCIBILITY ====================
  console.log('\n--- TEST GROUP 8: Seeded Task Reproducibility ---');
  {
    const seed = 987654;
    const taskA = dataManager.generateReproducibleTask(seed, 'algo-binary-search', 'task-bs-1');
    const taskB = dataManager.generateReproducibleTask(seed, 'algo-binary-search', 'task-bs-1');

    assert(JSON.stringify(taskA.initialData) === JSON.stringify(taskB.initialData), 'Identical seed reproduces exact identical initial array');
    assert(taskA.targetValue === taskB.targetValue, 'Identical seed reproduces exact target value');

    // Differing seed produces different array
    const taskC = dataManager.generateReproducibleTask(123456, 'algo-binary-search', 'task-bs-1');
    assert(JSON.stringify(taskA.initialData) !== JSON.stringify(taskC.initialData), 'Differing seed produces independent problem instances');
  }

  // ==================== TEST GROUP 9: PRIVACY & SECRETS SANITIZATION ====================
  console.log('\n--- TEST GROUP 9: Privacy & Secrets Sanitization ---');
  {
    // Valid pseudonymous enrollment
    const enrollValid = dataManager.enrollParticipant({
      participantId: 'P010',
      condition: 'AR_DSA_TUTOR',
      enrolledTimestamp: new Date().toISOString()
    });
    assert(enrollValid.success, 'Allows valid pseudonymous participant ID (P010)');

    // Reject personal identifiable emails
    const enrollEmail = dataManager.enrollParticipant({
      participantId: 'student.name@university.edu',
      condition: 'AR_DSA_TUTOR',
      enrolledTimestamp: new Date().toISOString()
    });
    assert(!enrollEmail.success, 'Rejects identifiable email address as participant ID');

    // Reject duplicate enrollment
    const enrollDup = dataManager.enrollParticipant({
      participantId: 'P010',
      condition: 'CONTROL',
      enrolledTimestamp: new Date().toISOString()
    });
    assert(!enrollDup.success, 'Rejects duplicate participant ID enrollment');

    // Sanitization of research telemetry events
    const cleanEvent = dataManager.recordResearchEvent({
      eventId: 'evt-1',
      studyId: 'STUDY-1',
      participantId: 'P010',
      sessionId: 'sess-1',
      timestamp: new Date().toISOString(),
      eventType: 'LEARNING_STEP',
      payload: { step: 3, action: 'COMPARE' }
    });
    assert(cleanEvent.success, 'Records clean research event');

    const leakEvent = dataManager.recordResearchEvent({
      eventId: 'evt-2',
      studyId: 'STUDY-1',
      participantId: 'P010',
      sessionId: 'sess-1',
      timestamp: new Date().toISOString(),
      eventType: 'AI_INTERACTION',
      payload: { apiKey: 'AIzaSySecretToken12345', query: 'help me' }
    });
    assert(!leakEvent.success, 'Rejects event containing secret credentials (apiKey)');
  }

  // ==================== TEST GROUP 10: LONGITUDINAL MISCONCEPTION TRACKING ====================
  console.log('\n--- TEST GROUP 10: Misconception Longitudinal Resolution ---');
  {
    const partId = 'P020';
    dataManager.enrollParticipant({
      participantId: partId,
      condition: 'AR_DSA_TUTOR',
      enrolledTimestamp: new Date().toISOString()
    });

    // Occurrence 1
    const ep1 = dataManager.logMisconceptionOccurrence(partId, 'algo-binary-search', 'OFF_BY_ONE_ERROR');
    assert(ep1.recurrenceCount === 0, 'First misconception occurrence logged with recurrenceCount 0');

    // Remediation
    dataManager.logRemediationAttempt(partId, 'algo-binary-search', 'OFF_BY_ONE_ERROR');

    // Occurrence 2
    const ep2 = dataManager.logMisconceptionOccurrence(partId, 'algo-binary-search', 'OFF_BY_ONE_ERROR');
    assert(ep2.recurrenceCount === 1, 'Recurrence increments recurrenceCount');

    // Check resolution criteria: insufficient successes
    const notResolved = dataManager.evaluateMisconceptionResolution(partId, 'algo-binary-search', 'OFF_BY_ONE_ERROR', 2, 3);
    assert(!notResolved, 'Misconception remains unresolved when consecutive successes < threshold');

    // Check resolution criteria: sufficient successes (3 consecutive)
    const resolved = dataManager.evaluateMisconceptionResolution(partId, 'algo-binary-search', 'OFF_BY_ONE_ERROR', 3, 3);
    assert(resolved, 'Misconception operationally marked resolved after 3 consecutive successful opportunities');
  }

  // ==================== TEST GROUP 11: AI QUALITY DETERMINISTIC VALIDATION ====================
  console.log('\n--- TEST GROUP 11: AI Quality Deterministic Validation ---');
  {
    const validAI = dataManager.evaluateAIResponse('ai-1', 'P010', 'algo-binary-search', {
      messageText: 'Observe how mid is calculated using low + (high - low) / 2 to prevent overflow.',
      groundedOperationState: 'SEARCH_STEP_1',
      suggestedNextAction: 'COMPARE_MID'
    });
    assert(validAI.schemaValidity, 'AI response passes schema validity');
    assert(validAI.topicCorrectness, 'AI response confirmed topic-grounded');
    assert(!validAI.stateMutationViolation, 'AI response confirmed free of unauthorized state mutation');

    // Disjoint topic violation check
    const invalidAI = dataManager.evaluateAIResponse('ai-2', 'P010', 'algo-binary-search', {
      messageText: 'You should resolve the hash bucket collision with separate chaining.',
      groundedOperationState: 'SEARCH_STEP_1',
      suggestedNextAction: 'COMPARE_MID'
    });
    assert(!invalidAI.topicCorrectness, 'Flags topic contradiction when AI introduces hash collision into binary search');
  }

  // ==================== TEST GROUP 12: DATA EXPORT SANITIZATION ====================
  console.log('\n--- TEST GROUP 12: Data Export Sanitation ---');
  {
    const sampleOutcomes: LearningOutcome[] = [
      { participantId: 'P010', condition: 'AR_DSA_TUTOR', preTestScore: 40, postTestScore: 80, absoluteGain: 40, normalizedGain: 0.67, isComplete: true }
    ];

    const json = dataManager.exportOutcomesAsJSON(sampleOutcomes);
    assert(json.includes('STUDY-AR-DSA-2026-V1'), 'JSON export includes study configuration ID');
    assert(!json.includes('password') && !json.includes('apiKey'), 'JSON export free of secrets');

    const csv = dataManager.exportOutcomesAsCSV(sampleOutcomes);
    assert(csv.startsWith('participantId,condition,preTestScore'), 'CSV export starts with standard headers');
    assert(csv.includes('P010,AR_DSA_TUTOR,40,80'), 'CSV contains analysis-ready outcome record');
  }

  // ==================== TEST GROUP 13: STANDARDIZED ASSESSMENT BANK INTEGRITY ====================
  console.log('\n--- TEST GROUP 13: Standardized Assessment Bank Integrity ---');
  {
    assert(RESEARCH_ASSESSMENT_BANK.length === 15, `Item bank contains exactly 15 standardized items (got ${RESEARCH_ASSESSMENT_BANK.length})`);

    const preItems = getResearchQuestionsByStage('PRETEST');
    const postItems = getResearchQuestionsByStage('POSTTEST');
    const delayedItems = getResearchQuestionsByStage('DELAYED_POSTTEST');

    assert(preItems.length === 5, 'Exactly 5 pre-test items across 5 core topics');
    assert(postItems.length === 5, 'Exactly 5 post-test parallel-form items');
    assert(delayedItems.length === 5, 'Exactly 5 delayed post-test items');

    // Check parallel-form pairs share identical difficulty & topic
    for (const pre of preItems) {
      const matchingPost = postItems.find(p => p.parallelFormGroup === pre.parallelFormGroup);
      assert(!!matchingPost, `Pre-test item ${pre.questionId} has matching parallel post-test item`);
      if (matchingPost) {
        assert(matchingPost.topicId === pre.topicId, `Parallel items share identical topic (${pre.topicId})`);
        assert(matchingPost.difficulty === pre.difficulty, `Parallel items share identical difficulty (${pre.difficulty})`);
      }
    }
  }

  // ==================== TEST GROUP 14: CRITICAL ANTI-FABRICATION TEST ====================
  console.log('\n--- TEST GROUP 14: Critical Anti-Fabrication Invariant ---');
  {
    dataManager.reset(); // Clean slate

    const isAvailable = dataManager.isEmpiricalDataAvailable();
    assert(!isAvailable, 'Clean research manager reports isEmpiricalDataAvailable() === false');

    const participants = dataManager.getAllParticipants();
    assert(participants.length === 0, 'Clean research manager has exactly 0 empirical participants');

    // Descriptive stats on empty dataset must not fabricate averages
    const emptyStats = ResearchStatisticsEngine.calculateDescriptiveStats([]);
    assert(emptyStats.n === 0, 'Empty data produces n=0');
    assert(emptyStats.mean === 0 && emptyStats.standardDeviation === 0, 'Empty data produces 0 mean and 0 standard deviation, not fabricated percentages');
  }

  console.log('\n================================================================');
  console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runResearchEvaluationVerification().catch(err => {
  console.error('Unhandled error in verification suite:', err);
  process.exit(1);
});
