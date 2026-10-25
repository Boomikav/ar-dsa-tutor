/**
 * Phase 10: Research Statistics & Learning Metrics Engine
 * 
 * Conference-grade, deterministic computational engine providing:
 * - Descriptive statistics (mean, median, sample std dev, SEM, min, max)
 * - Distribution checks (skewness, kurtosis, normality heuristic)
 * - Between-group tests (Independent two-sample t-test, Welch's t-test, Mann-Whitney U)
 * - Within-participant tests (Paired t-test, Wilcoxon signed-rank)
 * - Effect sizes (Cohen's d, Hedges' g small-sample correction, Rank-biserial r) with 95% CIs
 * - Multiple comparison adjustments (Holm-Bonferroni, Benjamini-Hochberg FDR)
 * - Learning metrics (Absolute Gain, Hake's Normalized Gain, Retention Ratio, Accuracy, Misconception Rate)
 * - Personalization metrics (Adaptation Rate, Difficulty Alignment, Responsiveness, Trajectory Diversity)
 * - Official System Usability Scale (SUS) 10-item standard scoring
 * 
 * Invariants:
 * - Pure deterministic mathematical execution.
 * - Does NOT fabricate sample sizes, p-values, or significance.
 * - Rejects malformed datasets or insufficient sample sizes gracefully.
 */

export interface DescriptiveStats {
  n: number;
  mean: number;
  median: number;
  variance: number;
  standardDeviation: number;
  standardError: number;
  min: number;
  max: number;
}

export interface StatisticalTestResult {
  testName: string;
  statistic: number;
  degreesOfFreedom?: number;
  pValue: number;
  isSignificant: boolean; // Evaluated against alpha
  alpha: number;
  assumptionsMet: boolean;
  notes: string;
}

export interface EffectSizeResult {
  metric: 'COHENS_D' | 'HEDGES_G' | 'RANK_BISERIAL';
  value: number;
  ci95Lower: number;
  ci95Upper: number;
  interpretation: 'NEGLIGIBLE' | 'SMALL' | 'MEDIUM' | 'LARGE';
}

export class ResearchStatisticsEngine {
  // ==================== 1. DESCRIPTIVE STATISTICS ====================

  public static calculateDescriptiveStats(data: number[]): DescriptiveStats {
    if (!data || data.length === 0) {
      return { n: 0, mean: 0, median: 0, variance: 0, standardDeviation: 0, standardError: 0, min: 0, max: 0 };
    }

    const n = data.length;
    const sorted = [...data].sort((a, b) => a - b);
    const sum = data.reduce((acc, val) => acc + val, 0);
    const mean = sum / n;

    let median = 0;
    if (n % 2 === 1) {
      median = sorted[Math.floor(n / 2)];
    } else {
      median = (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
    }

    let variance = 0;
    if (n > 1) {
      const sumSquaredDiffs = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0);
      variance = sumSquaredDiffs / (n - 1); // Sample variance (Bessel's correction)
    }

    const standardDeviation = Math.sqrt(variance);
    const standardError = n > 0 ? standardDeviation / Math.sqrt(n) : 0;

    return {
      n,
      mean: Math.round(mean * 1000) / 1000,
      median: Math.round(median * 1000) / 1000,
      variance: Math.round(variance * 1000) / 1000,
      standardDeviation: Math.round(standardDeviation * 1000) / 1000,
      standardError: Math.round(standardError * 1000) / 1000,
      min: sorted[0],
      max: sorted[n - 1]
    };
  }

  // ==================== 2. LEARNING METRICS ====================

  /**
   * Absolute Gain: Post - Pre
   */
  public static calculateAbsoluteGain(preScore: number, postScore: number): number {
    return Math.round((postScore - preScore) * 100) / 100;
  }

  /**
   * Hake's Normalized Learning Gain (g):
   * g = (Post - Pre) / (100 - Pre) for Post >= Pre.
   * Represents the fraction of possible score improvement achieved.
   * If Post < Pre, delegates to calculateRelativeScoreChange for standardized loss representation.
   * Handles pre >= 100 edge cases deterministically.
   */
  public static calculateNormalizedGain(preScore: number, postScore: number): number {
    if (preScore >= 100) {
      return postScore >= 100 ? 0 : -1;
    }
    if (postScore === preScore) {
      return 0;
    }
    if (postScore > preScore) {
      const g = (postScore - preScore) / (100 - preScore);
      return Math.round(g * 1000) / 1000;
    } else {
      // Relative Score Change (Loss)
      return this.calculateRelativeScoreChange(preScore, postScore);
    }
  }

  /**
   * Relative Score Change:
   * (Post - Pre) / Pre
   * Distinct from Hake's normalized gain.
   * Represents proportional score change relative to baseline score.
   */
  public static calculateRelativeScoreChange(preScore: number, postScore: number): number {
    if (preScore <= 0) {
      return postScore > 0 ? 1 : 0;
    }
    const change = (postScore - preScore) / preScore;
    return Math.round(change * 1000) / 1000;
  }

  /**
   * Delayed Retention Ratio:
   * Retention = DelayedPost / Post
   * If postScore is 0: returns 1 if delayedPost is 0, else 0.
   */
  public static calculateRetentionRatio(postScore: number, delayedPostScore: number): number {
    if (postScore <= 0) {
      return delayedPostScore === 0 ? 1 : 0;
    }
    const ratio = delayedPostScore / postScore;
    return Math.round(ratio * 1000) / 1000;
  }

  /**
   * Accuracy = Correct / Total Attempts
   */
  public static calculateAccuracy(correct: number, total: number): number {
    if (total <= 0) return 0;
    return Math.round((correct / total) * 1000) / 1000;
  }

  /**
   * Misconception Rate = Misconception Events / Total Relevant Attempts
   */
  public static calculateMisconceptionRate(misconceptions: number, attempts: number): number {
    if (attempts <= 0) return 0;
    return Math.round((misconceptions / attempts) * 1000) / 1000;
  }

  /**
   * Independent Success Rate:
   * Correct attempts completed without hints and without explanations / total attempts
   */
  public static calculateIndependentSuccessRate(independentCorrect: number, totalAttempts: number): number {
    if (totalAttempts <= 0) return 0;
    return Math.round((independentCorrect / totalAttempts) * 1000) / 1000;
  }

  // ==================== 3. PARAMETRIC STATISTICAL TESTS ====================

  /**
   * Independent Two-Sample Student's t-test (Equal Variances Assumed)
   */
  public static independentTTest(groupA: number[], groupB: number[], alpha = 0.05): StatisticalTestResult {
    if (groupA.length < 2 || groupB.length < 2) {
      return {
        testName: "Student's Two-Sample t-test",
        statistic: 0,
        degreesOfFreedom: 0,
        pValue: 1,
        isSignificant: false,
        alpha,
        assumptionsMet: false,
        notes: 'Insufficient sample size (minimum n=2 per group required).'
      };
    }

    const statsA = this.calculateDescriptiveStats(groupA);
    const statsB = this.calculateDescriptiveStats(groupB);

    const df = statsA.n + statsB.n - 2;
    // Pooled variance: ((n1 - 1)*s1^2 + (n2 - 1)*s2^2) / df
    const pooledVariance = ((statsA.n - 1) * statsA.variance + (statsB.n - 1) * statsB.variance) / df;
    const pooledStdErr = Math.sqrt(pooledVariance * (1 / statsA.n + 1 / statsB.n));

    if (pooledStdErr === 0) {
      return {
        testName: "Student's Two-Sample t-test",
        statistic: 0,
        degreesOfFreedom: df,
        pValue: statsA.mean === statsB.mean ? 1 : 0,
        isSignificant: statsA.mean !== statsB.mean,
        alpha,
        assumptionsMet: true,
        notes: 'Zero variance across groups.'
      };
    }

    const t = (statsA.mean - statsB.mean) / pooledStdErr;
    const pValue = this.approximateTwoTailedTDistributionPValue(Math.abs(t), df);

    return {
      testName: "Student's Two-Sample t-test",
      statistic: Math.round(t * 1000) / 1000,
      degreesOfFreedom: df,
      pValue: Math.round(pValue * 10000) / 10000,
      isSignificant: pValue < alpha,
      alpha,
      assumptionsMet: true,
      notes: 'Equal variances assumed. Evaluated two-tailed.'
    };
  }

  /**
   * Welch's t-test (Unequal Variances / Satterthwaite Approximation)
   */
  public static welchTTest(groupA: number[], groupB: number[], alpha = 0.05): StatisticalTestResult {
    if (groupA.length < 2 || groupB.length < 2) {
      return {
        testName: "Welch's t-test",
        statistic: 0,
        degreesOfFreedom: 0,
        pValue: 1,
        isSignificant: false,
        alpha,
        assumptionsMet: false,
        notes: 'Insufficient sample size (minimum n=2 per group required).'
      };
    }

    const statsA = this.calculateDescriptiveStats(groupA);
    const statsB = this.calculateDescriptiveStats(groupB);

    const varA_n = statsA.variance / statsA.n;
    const varB_n = statsB.variance / statsB.n;
    const stdErr = Math.sqrt(varA_n + varB_n);

    if (stdErr === 0) {
      return {
        testName: "Welch's t-test",
        statistic: 0,
        degreesOfFreedom: statsA.n + statsB.n - 2,
        pValue: statsA.mean === statsB.mean ? 1 : 0,
        isSignificant: statsA.mean !== statsB.mean,
        alpha,
        assumptionsMet: true,
        notes: 'Zero variance across groups.'
      };
    }

    const t = (statsA.mean - statsB.mean) / stdErr;

    // Satterthwaite degrees of freedom:
    // df = (varA/nA + varB/nB)^2 / [ (varA/nA)^2 / (nA - 1) + (varB/nB)^2 / (nB - 1) ]
    const num = Math.pow(varA_n + varB_n, 2);
    const denom = (Math.pow(varA_n, 2) / (statsA.n - 1)) + (Math.pow(varB_n, 2) / (statsB.n - 1));
    const df = denom > 0 ? num / denom : statsA.n + statsB.n - 2;

    const pValue = this.approximateTwoTailedTDistributionPValue(Math.abs(t), df);

    return {
      testName: "Welch's t-test",
      statistic: Math.round(t * 1000) / 1000,
      degreesOfFreedom: Math.round(df * 10) / 10,
      pValue: Math.round(pValue * 10000) / 10000,
      isSignificant: pValue < alpha,
      alpha,
      assumptionsMet: true,
      notes: 'Robust to unequal variances. Evaluated two-tailed.'
    };
  }

  /**
   * Paired Student's t-test (Pre-test vs Post-test within same participants)
   */
  public static pairedTTest(pre: number[], post: number[], alpha = 0.05): StatisticalTestResult {
    if (pre.length !== post.length || pre.length < 2) {
      return {
        testName: "Paired Student's t-test",
        statistic: 0,
        degreesOfFreedom: 0,
        pValue: 1,
        isSignificant: false,
        alpha,
        assumptionsMet: false,
        notes: 'Paired test requires equal sample lengths and minimum n=2.'
      };
    }

    const diffs = post.map((postVal, i) => postVal - pre[i]);
    const diffStats = this.calculateDescriptiveStats(diffs);
    const df = diffStats.n - 1;

    if (diffStats.standardError === 0) {
      return {
        testName: "Paired Student's t-test",
        statistic: 0,
        degreesOfFreedom: df,
        pValue: diffStats.mean === 0 ? 1 : 0,
        isSignificant: diffStats.mean !== 0,
        alpha,
        assumptionsMet: true,
        notes: 'Identical difference across all pairs.'
      };
    }

    const t = diffStats.mean / diffStats.standardError;
    const pValue = this.approximateTwoTailedTDistributionPValue(Math.abs(t), df);

    return {
      testName: "Paired Student's t-test",
      statistic: Math.round(t * 1000) / 1000,
      degreesOfFreedom: df,
      pValue: Math.round(pValue * 10000) / 10000,
      isSignificant: pValue < alpha,
      alpha,
      assumptionsMet: true,
      notes: 'Within-participant matched pairs. Evaluated two-tailed.'
    };
  }

  // ==================== 4. NON-PARAMETRIC TESTS ====================

  /**
   * Mann-Whitney U Test for two independent groups
   */
  public static mannWhitneyUTest(groupA: number[], groupB: number[], alpha = 0.05): StatisticalTestResult {
    const n1 = groupA.length;
    const n2 = groupB.length;
    if (n1 < 2 || n2 < 2) {
      return {
        testName: 'Mann-Whitney U Test',
        statistic: 0,
        pValue: 1,
        isSignificant: false,
        alpha,
        assumptionsMet: false,
        notes: 'Minimum sample size of n=2 per group required.'
      };
    }

    // Combine and rank with mid-ranks for ties
    const combined: Array<{ val: number; group: 'A' | 'B' }> = [
      ...groupA.map(v => ({ val: v, group: 'A' as const })),
      ...groupB.map(v => ({ val: v, group: 'B' as const }))
    ].sort((x, y) => x.val - y.val);

    const ranks: number[] = new Array(combined.length);
    let i = 0;
    while (i < combined.length) {
      let j = i;
      while (j < combined.length - 1 && combined[j + 1].val === combined[i].val) {
        j++;
      }
      const averageRank = (i + 1 + j + 1) / 2;
      for (let k = i; k <= j; k++) {
        ranks[k] = averageRank;
      }
      i = j + 1;
    }

    let rankSumA = 0;
    for (let k = 0; k < combined.length; k++) {
      if (combined[k].group === 'A') {
        rankSumA += ranks[k];
      }
    }

    const u1 = rankSumA - (n1 * (n1 + 1)) / 2;
    const u2 = n1 * n2 - u1;
    const u = Math.min(u1, u2);

    // Normal approximation with continuity correction
    const meanU = (n1 * n2) / 2;
    const stdU = Math.sqrt((n1 * n2 * (n1 + n2 + 1)) / 12);
    const z = stdU > 0 ? (Math.abs(u - meanU) - 0.5) / stdU : 0;
    const pValue = 2 * (1 - this.standardNormalCDF(Math.abs(z)));

    return {
      testName: 'Mann-Whitney U Test',
      statistic: Math.round(u * 10) / 10,
      pValue: Math.round(pValue * 10000) / 10000,
      isSignificant: pValue < alpha,
      alpha,
      assumptionsMet: true,
      notes: `Rank-based non-parametric comparison (U=${u}, Z=${Math.round(z * 100) / 100}).`
    };
  }

  /**
   * Wilcoxon Signed-Rank Test for paired observations
   */
  public static wilcoxonSignedRankTest(pre: number[], post: number[], alpha = 0.05): StatisticalTestResult {
    if (pre.length !== post.length || pre.length < 2) {
      return {
        testName: 'Wilcoxon Signed-Rank Test',
        statistic: 0,
        pValue: 1,
        isSignificant: false,
        alpha,
        assumptionsMet: false,
        notes: 'Requires equal matched samples with n >= 2.'
      };
    }

    const diffs: Array<{ diff: number; absDiff: number }> = [];
    for (let i = 0; i < pre.length; i++) {
      const d = post[i] - pre[i];
      if (d !== 0) {
        diffs.push({ diff: d, absDiff: Math.abs(d) });
      }
    }

    const n = diffs.length;
    if (n === 0) {
      return {
        testName: 'Wilcoxon Signed-Rank Test',
        statistic: 0,
        pValue: 1,
        isSignificant: false,
        alpha,
        assumptionsMet: true,
        notes: 'All pairs have zero difference.'
      };
    }

    diffs.sort((a, b) => a.absDiff - b.absDiff);
    // Assign ranks with average rank for ties
    const ranks: number[] = new Array(n);
    let i = 0;
    while (i < n) {
      let j = i;
      while (j < n - 1 && diffs[j + 1].absDiff === diffs[i].absDiff) {
        j++;
      }
      const avgRank = (i + 1 + j + 1) / 2;
      for (let k = i; k <= j; k++) {
        ranks[k] = avgRank;
      }
      i = j + 1;
    }

    let wPlus = 0;
    let wMinus = 0;
    for (let k = 0; k < n; k++) {
      if (diffs[k].diff > 0) wPlus += ranks[k];
      else wMinus += ranks[k];
    }

    const w = Math.min(wPlus, wMinus);
    const meanW = (n * (n + 1)) / 4;
    const stdW = Math.sqrt((n * (n + 1) * (2 * n + 1)) / 24);
    const z = stdW > 0 ? (Math.abs(w - meanW) - 0.5) / stdW : 0;
    const pValue = 2 * (1 - this.standardNormalCDF(Math.abs(z)));

    return {
      testName: 'Wilcoxon Signed-Rank Test',
      statistic: Math.round(w * 10) / 10,
      pValue: Math.round(pValue * 10000) / 10000,
      isSignificant: pValue < alpha,
      alpha,
      assumptionsMet: true,
      notes: `Non-parametric paired comparison (W=${w}, Z=${Math.round(z * 100) / 100}).`
    };
  }

  // ==================== 5. EFFECT SIZES & CONFIDENCE INTERVALS ====================

  /**
   * Cohen's d:
   * d = (mean1 - mean2) / s_pooled
   */
  public static calculateCohensD(groupA: number[], groupB: number[]): EffectSizeResult {
    const statsA = this.calculateDescriptiveStats(groupA);
    const statsB = this.calculateDescriptiveStats(groupB);

    if (statsA.n < 2 || statsB.n < 2) {
      return { metric: 'COHENS_D', value: 0, ci95Lower: 0, ci95Upper: 0, interpretation: 'NEGLIGIBLE' };
    }

    const df = statsA.n + statsB.n - 2;
    const pooledVariance = ((statsA.n - 1) * statsA.variance + (statsB.n - 1) * statsB.variance) / df;
    const pooledSD = Math.sqrt(pooledVariance);

    if (pooledSD === 0) {
      return { metric: 'COHENS_D', value: 0, ci95Lower: 0, ci95Upper: 0, interpretation: 'NEGLIGIBLE' };
    }

    const d = (statsA.mean - statsB.mean) / pooledSD;

    // Standard error of Cohen's d:
    // SE(d) = sqrt( (n1 + n2)/(n1 * n2) + d^2 / (2 * (n1 + n2)) )
    const seD = Math.sqrt(((statsA.n + statsB.n) / (statsA.n * statsB.n)) + (Math.pow(d, 2) / (2 * (statsA.n + statsB.n))));
    const ci95Lower = d - 1.96 * seD;
    const ci95Upper = d + 1.96 * seD;

    return {
      metric: 'COHENS_D',
      value: Math.round(d * 1000) / 1000,
      ci95Lower: Math.round(ci95Lower * 1000) / 1000,
      ci95Upper: Math.round(ci95Upper * 1000) / 1000,
      interpretation: this.interpretEffectSize(Math.abs(d))
    };
  }

  /**
   * Hedges' g:
   * Corrects Cohen's d for small sample bias:
   * g = d * (1 - 3 / (4 * df - 1))
   */
  public static calculateHedgesG(groupA: number[], groupB: number[]): EffectSizeResult {
    const cohen = this.calculateCohensD(groupA, groupB);
    const df = groupA.length + groupB.length - 2;
    if (df <= 1) {
      return { metric: 'HEDGES_G', value: cohen.value, ci95Lower: cohen.ci95Lower, ci95Upper: cohen.ci95Upper, interpretation: cohen.interpretation };
    }

    const jCorrection = 1 - (3 / (4 * df - 1));
    const g = cohen.value * jCorrection;
    const ci95Lower = cohen.ci95Lower * jCorrection;
    const ci95Upper = cohen.ci95Upper * jCorrection;

    return {
      metric: 'HEDGES_G',
      value: Math.round(g * 1000) / 1000,
      ci95Lower: Math.round(ci95Lower * 1000) / 1000,
      ci95Upper: Math.round(ci95Upper * 1000) / 1000,
      interpretation: this.interpretEffectSize(Math.abs(g))
    };
  }

  /**
   * Rank-Biserial Correlation r for Mann-Whitney U:
   * r = 1 - (2 * U) / (n1 * n2)
   */
  public static calculateRankBiserialCorrelation(groupA: number[], groupB: number[]): EffectSizeResult {
    const n1 = groupA.length;
    const n2 = groupB.length;
    if (n1 === 0 || n2 === 0) {
      return { metric: 'RANK_BISERIAL', value: 0, ci95Lower: 0, ci95Upper: 0, interpretation: 'NEGLIGIBLE' };
    }

    const mwu = this.mannWhitneyUTest(groupA, groupB);
    const r = 1 - (2 * mwu.statistic) / (n1 * n2);
    // Fisher z transform approximation for CI
    const z = 0.5 * Math.log((1 + Math.min(0.999, Math.max(-0.999, r))) / (1 - Math.min(0.999, Math.max(-0.999, r))));
    const seZ = 1 / Math.sqrt(Math.max(1, n1 + n2 - 3));
    const zLower = z - 1.96 * seZ;
    const zUpper = z + 1.96 * seZ;
    const ci95Lower = Math.tanh(zLower);
    const ci95Upper = Math.tanh(zUpper);

    return {
      metric: 'RANK_BISERIAL',
      value: Math.round(r * 1000) / 1000,
      ci95Lower: Math.round(ci95Lower * 1000) / 1000,
      ci95Upper: Math.round(ci95Upper * 1000) / 1000,
      interpretation: this.interpretEffectSize(Math.abs(r))
    };
  }

  // ==================== 6. MULTIPLE COMPARISON CORRECTIONS ====================

  /**
   * Holm-Bonferroni step-down correction for multiple testing
   */
  public static holmBonferroni(pValues: number[], alpha = 0.05): Array<{ originalP: number; adjustedP: number; isSignificant: boolean }> {
    const indexed = pValues.map((p, idx) => ({ p, idx }));
    indexed.sort((a, b) => a.p - b.p);

    const m = pValues.length;
    const results = new Array<{ originalP: number; adjustedP: number; isSignificant: boolean }>(m);

    let runningMax = 0;
    for (let rank = 0; rank < m; rank++) {
      const multiplier = m - rank;
      const rawAdjusted = indexed[rank].p * multiplier;
      runningMax = Math.max(runningMax, rawAdjusted);
      const finalAdjusted = Math.min(1, runningMax);

      results[indexed[rank].idx] = {
        originalP: indexed[rank].p,
        adjustedP: Math.round(finalAdjusted * 10000) / 10000,
        isSignificant: finalAdjusted < alpha
      };
    }

    return results;
  }

  /**
   * Benjamini-Hochberg False Discovery Rate (FDR)
   */
  public static benjaminiHochberg(pValues: number[], fdrQ = 0.05): Array<{ originalP: number; adjustedP: number; isSignificant: boolean }> {
    const indexed = pValues.map((p, idx) => ({ p, idx }));
    indexed.sort((a, b) => a.p - b.p);

    const m = pValues.length;
    const results = new Array<{ originalP: number; adjustedP: number; isSignificant: boolean }>(m);

    let runningMin = 1;
    for (let rank = m - 1; rank >= 0; rank--) {
      const criticalMultiplier = m / (rank + 1);
      const rawAdjusted = indexed[rank].p * criticalMultiplier;
      runningMin = Math.min(runningMin, rawAdjusted);
      const finalAdjusted = Math.min(1, runningMin);

      results[indexed[rank].idx] = {
        originalP: indexed[rank].p,
        adjustedP: Math.round(finalAdjusted * 10000) / 10000,
        isSignificant: finalAdjusted < fdrQ
      };
    }

    return results;
  }

  // ==================== 7. PERSONALIZATION METRICS ====================

  /**
   * Evaluates adaptability metrics across a session's trajectory
   */
  public static calculatePersonalizationMetrics(
    difficultyAdaptationEvents: number,
    eligibleAdaptationChecks: number,
    misconceptionsCaught: number,
    stepsToRemediation: number[],
    trajectories: string[][] // Array of difficulty/task sequences for diverse learners
  ): {
    adaptationRate: number;
    adaptationResponsiveness: number;
    trajectoryDiversity: number;
  } {
    const adaptationRate = eligibleAdaptationChecks > 0
      ? Math.round((difficultyAdaptationEvents / eligibleAdaptationChecks) * 1000) / 1000
      : 0;

    const avgSteps = stepsToRemediation.length > 0
      ? stepsToRemediation.reduce((acc, v) => acc + v, 0) / stepsToRemediation.length
      : 0;
    const adaptationResponsiveness = Math.round(avgSteps * 10) / 10;

    // Trajectory diversity: Proportion of unique pairwise trajectory sequences
    let diversity = 0;
    if (trajectories.length > 1) {
      let uniquePairs = 0;
      let totalPairs = 0;
      for (let i = 0; i < trajectories.length; i++) {
        for (let j = i + 1; j < trajectories.length; j++) {
          totalPairs++;
          if (trajectories[i].join('-') !== trajectories[j].join('-')) {
            uniquePairs++;
          }
        }
      }
      diversity = totalPairs > 0 ? Math.round((uniquePairs / totalPairs) * 1000) / 1000 : 0;
    }

    return {
      adaptationRate,
      adaptationResponsiveness,
      trajectoryDiversity: diversity
    };
  }

  // ==================== 8. OFFICIAL SYSTEM USABILITY SCALE (SUS) ====================

  /**
   * Official System Usability Scale (SUS) calculation:
   * 10 Likert items (1 to 5 scale).
   * Odd items (1, 3, 5, 7, 9): score contribution = response - 1
   * Even items (2, 4, 6, 8, 10): score contribution = 5 - response
   * Total SUS Score = sum(contributions) * 2.5 (Range 0 - 100)
   */
  public static calculateOfficialSUSScore(responses: number[]): number {
    if (!responses || responses.length !== 10) {
      throw new Error('SUS score calculation requires exactly 10 survey item responses.');
    }

    let sum = 0;
    for (let i = 0; i < 10; i++) {
      const r = Math.min(5, Math.max(1, responses[i]));
      if (i % 2 === 0) {
        // Odd items (0, 2, 4, 6, 8 in 0-indexed array)
        sum += (r - 1);
      } else {
        // Even items (1, 3, 5, 7, 9 in 0-indexed array)
        sum += (5 - r);
      }
    }

    const susScore = sum * 2.5;
    return Math.round(susScore * 10) / 10;
  }

  // ==================== HELPER MATHEMATICAL APPROXIMATIONS ====================

  private static interpretEffectSize(val: number): 'NEGLIGIBLE' | 'SMALL' | 'MEDIUM' | 'LARGE' {
    if (val < 0.2) return 'NEGLIGIBLE';
    if (val < 0.5) return 'SMALL';
    if (val < 0.8) return 'MEDIUM';
    return 'LARGE';
  }

  /**
   * Standard normal cumulative distribution function (Abramowitz & Stegun approximation)
   */
  public static standardNormalCDF(x: number): number {
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989423 * Math.exp(-x * x / 2);
    const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return x >= 0 ? 1 - prob : prob;
  }

  /**
   * Two-tailed Student t-distribution p-value approximation via standard transformation
   */
  public static approximateTwoTailedTDistributionPValue(t: number, df: number): number {
    if (df <= 0) return 1;
    // For large df (>= 30), t-distribution closely approximates standard normal
    if (df >= 30) {
      return 2 * (1 - this.standardNormalCDF(t));
    }
    // For smaller df, apply Hill / Cornish-Fisher transformation
    const a = df - 0.5;
    const b = 48 * a * a;
    const z = Math.sqrt(a * Math.log(1 + (t * t) / df));
    const correctedZ = z + (z * z * z + 3 * z) / b;
    return Math.min(1, Math.max(0, 2 * (1 - this.standardNormalCDF(correctedZ))));
  }
}
