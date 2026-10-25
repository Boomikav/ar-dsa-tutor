/**
 * Phase 7: Adaptive Difficulty Engine
 * 
 * Provides deterministic, explainable difficulty policy decisions:
 * - Levels: FOUNDATIONAL <-> EASY <-> MEDIUM <-> HARD <-> CHALLENGE
 * - Transparent thresholds based on Mastery, Recent Accuracy, Independent Success, and Misconceptions
 * - Generates structured DifficultyDecision with human-readable rationale
 * - Provides concrete AdaptiveTaskSpec for the BST AR practice loop
 */

import { 
  LearnerTopicState, 
  AdaptiveDifficultyLevel, 
  DifficultyDecision, 
  AdaptationRecord,
  AdaptiveTaskSpec 
} from '../../models/adaptiveLearner';

const DIFFICULTY_ORDER: AdaptiveDifficultyLevel[] = [
  'FOUNDATIONAL',
  'EASY',
  'MEDIUM',
  'HARD',
  'CHALLENGE'
];

export class AdaptiveDifficultyEngine {
  /**
   * Evaluates the learner topic state against explicit policy thresholds to determine the next difficulty level.
   */
  public static evaluateDifficulty(
    topicState: LearnerTopicState,
    currentDifficulty: AdaptiveDifficultyLevel = 'FOUNDATIONAL',
    prerequisitesMet: boolean = true
  ): DifficultyDecision {
    const reasons: string[] = [];
    const currentIndex = DIFFICULTY_ORDER.indexOf(currentDifficulty);

    const mastery = topicState.masteryScore;
    const recentAcc = topicState.recentAccuracy;
    const indepSuccess = topicState.independentSuccessRate;
    const repeatedMisconceptions = topicState.repeatedMisconceptionCount;
    const attempts = topicState.attempts;

    // Check whether recent performance demonstrates that earlier misconceptions have been resolved
    const recentEvents = topicState.evidenceHistory ? topicState.evidenceHistory.slice(-5) : [];
    const recentMisconceptions = recentEvents.filter(e => e.misconceptionDetected).length;
    const isRemediated = recentEvents.length >= 4 && recentMisconceptions === 0;

    // 1. Remediation Policy
    if (!prerequisitesMet) {
      reasons.push('Prerequisite concepts require review before progressing in this topic.');
      return this.buildDecision(currentDifficulty, 'FOUNDATIONAL', 'REMEDIATION', reasons, topicState);
    }

    if (!isRemediated && repeatedMisconceptions >= 3) {
      reasons.push(`Chronic repeated misconception detected (${repeatedMisconceptions} occurrences). Foundational invariant remediation required.`);
      return this.buildDecision(currentDifficulty, 'FOUNDATIONAL', 'REMEDIATION', reasons, topicState);
    }

    // 2. Reduce Difficulty Policy
    if (!isRemediated && repeatedMisconceptions >= 2) {
      reasons.push(`Repeated misconception detected (${repeatedMisconceptions} occurrences). Decreasing difficulty to reinforce correct decision patterns.`);
      const nextLevel = DIFFICULTY_ORDER[Math.max(0, currentIndex - 1)];
      return this.buildDecision(currentDifficulty, nextLevel, 'REDUCE', reasons, topicState);
    }

    if (attempts >= 3 && recentAcc < 50) {
      reasons.push(`Recent accuracy (${recentAcc}%) fell below 50%. Stepping down difficulty to rebuild confidence.`);
      const nextLevel = DIFFICULTY_ORDER[Math.max(0, currentIndex - 1)];
      return this.buildDecision(currentDifficulty, nextLevel, 'REDUCE', reasons, topicState);
    }

    if (attempts >= 4 && mastery < 50 && indepSuccess < 40) {
      reasons.push(`Mastery (${mastery}%) and independent success (${indepSuccess}%) are low. Decreasing exercise complexity.`);
      const nextLevel = DIFFICULTY_ORDER[Math.max(0, currentIndex - 1)];
      return this.buildDecision(currentDifficulty, nextLevel, 'REDUCE', reasons, topicState);
    }

    // 3. Increase Difficulty Policy
    if (
      mastery >= 75 &&
      recentAcc >= 75 &&
      indepSuccess >= 60 &&
      recentMisconceptions === 0
    ) {
      if (currentIndex < DIFFICULTY_ORDER.length - 1) {
        reasons.push(`High mastery (${mastery}%), strong recent accuracy (${recentAcc}%), and demonstrated independent success (${indepSuccess}%) demonstrate readiness for higher difficulty.`);
        const nextLevel = DIFFICULTY_ORDER[currentIndex + 1];
        return this.buildDecision(currentDifficulty, nextLevel, 'INCREASE', reasons, topicState);
      } else {
        reasons.push(`Mastery and independent accuracy remain exceptional at peak difficulty (${currentDifficulty}).`);
        return this.buildDecision(currentDifficulty, currentDifficulty, 'MAINTAIN', reasons, topicState);
      }
    }

    // 4. Maintain Difficulty Policy
    reasons.push(`Performance is stable (Mastery: ${mastery}%, Accuracy: ${recentAcc}%, Independence: ${indepSuccess}%). Continuing at ${currentDifficulty} level.`);
    return this.buildDecision(currentDifficulty, currentDifficulty, 'MAINTAIN', reasons, topicState);
  }

  private static buildDecision(
    previousDifficulty: AdaptiveDifficultyLevel,
    recommendedDifficulty: AdaptiveDifficultyLevel,
    direction: 'INCREASE' | 'MAINTAIN' | 'REDUCE' | 'REMEDIATION',
    reasons: string[],
    topicState: LearnerTopicState
  ): DifficultyDecision {
    const attempts = topicState.attempts;
    const taskSpec = this.getTaskSpecification(recommendedDifficulty, topicState.topicId);

    return {
      previousDifficulty,
      recommendedDifficulty,
      direction,
      reasons,
      masteryScore: topicState.masteryScore,
      recentAccuracy: topicState.recentAccuracy,
      independentSuccessRate: topicState.independentSuccessRate,
      misconceptionRate: attempts > 0 ? +(topicState.misconceptionCount / attempts).toFixed(2) : 0,
      confidence: topicState.confidenceScore,
      recommendedTaskType: taskSpec.label,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Creates an audit adaptation record for persistent history and evaluation.
   */
  public static createAdaptationRecord(
    topicId: string,
    decision: DifficultyDecision,
    trigger: string = 'STEP_EVALUATION'
  ): AdaptationRecord {
    return {
      id: `adapt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      topicId,
      previousDifficulty: decision.previousDifficulty,
      newDifficulty: decision.recommendedDifficulty,
      direction: decision.direction,
      trigger,
      reasons: decision.reasons,
      masteryAtDecision: decision.masteryScore,
      confidenceAtDecision: decision.confidence,
      timestamp: decision.timestamp
    };
  }

  /**
   * Concrete task specification modifying the actual BST practice interaction.
   */
  public static getTaskSpecification(
    difficulty: AdaptiveDifficultyLevel,
    _topicId: string = 'ds-binary-search-tree',
    targetValue: number = 40
  ): AdaptiveTaskSpec {
    switch (difficulty) {
      case 'FOUNDATIONAL': {
        if (_topicId === 'algo-binary-search') {
          return {
            difficulty: 'FOUNDATIONAL',
            targetValue: 60,
            requiresPredictionBeforeMove: false,
            requiresFullOperationPrediction: false,
            showComparisonHint: true,
            showInvariantGuidance: true,
            label: 'Guided Binary Search',
            description: 'Search in small sorted array with explicit mid calculation and interval reduction guidance.'
          };
        }
        if (_topicId.includes('sort')) {
          return {
            difficulty: 'FOUNDATIONAL',
            targetValue: 0,
            requiresPredictionBeforeMove: false,
            requiresFullOperationPrediction: false,
            showComparisonHint: true,
            showInvariantGuidance: true,
            label: 'Guided Pairwise Comparison',
            description: 'Explicit inspection of element pairs with swap recommendation.'
          };
        }
        if (_topicId.includes('bfs') || _topicId.includes('dfs') || _topicId.includes('dijkstra')) {
          return {
            difficulty: 'FOUNDATIONAL',
            targetValue: 0,
            requiresPredictionBeforeMove: false,
            requiresFullOperationPrediction: false,
            showComparisonHint: true,
            showInvariantGuidance: true,
            label: 'Guided Frontier Traversal',
            description: 'Explicit frontier highlighting with step-by-step neighbor visitation guidance.'
          };
        }
        return {
          difficulty: 'FOUNDATIONAL',
          targetValue,
          requiresPredictionBeforeMove: false,
          requiresFullOperationPrediction: false,
          showComparisonHint: true,
          showInvariantGuidance: true,
          label: 'Guided Invariant Walkthrough',
          description: 'Step-by-step guidance highlighting the core ordering invariant (< vs >) at each step.'
        };
      }
      case 'EASY': {
        if (_topicId === 'algo-binary-search') {
          return {
            difficulty: 'EASY',
            targetValue: 60,
            requiresPredictionBeforeMove: false,
            requiresFullOperationPrediction: false,
            showComparisonHint: true,
            showInvariantGuidance: false,
            label: 'Assisted Binary Search',
            description: 'Standard sorted array with numerical comparison hints enabled.'
          };
        }
        if (_topicId.includes('sort')) {
          return {
            difficulty: 'EASY',
            targetValue: 0,
            requiresPredictionBeforeMove: false,
            requiresFullOperationPrediction: false,
            showComparisonHint: true,
            showInvariantGuidance: false,
            label: 'Assisted Swap Identification',
            description: 'Identify whether active adjacent elements violate sorting order.'
          };
        }
        if (_topicId.includes('bfs') || _topicId.includes('dfs') || _topicId.includes('dijkstra')) {
          return {
            difficulty: 'EASY',
            targetValue: 0,
            requiresPredictionBeforeMove: false,
            requiresFullOperationPrediction: false,
            showComparisonHint: true,
            showInvariantGuidance: false,
            label: 'Assisted Neighbor Expansion',
            description: 'Pick next unvisited neighbor with frontier validation.'
          };
        }
        return {
          difficulty: 'EASY',
          targetValue,
          requiresPredictionBeforeMove: false,
          requiresFullOperationPrediction: false,
          showComparisonHint: true,
          showInvariantGuidance: false,
          label: 'Assisted Traversal Practice',
          description: 'Standard practice with comparison hints enabled.'
        };
      }
      case 'MEDIUM': {
        if (_topicId === 'algo-binary-search') {
          return {
            difficulty: 'MEDIUM',
            targetValue: 60,
            requiresPredictionBeforeMove: false,
            requiresFullOperationPrediction: false,
            showComparisonHint: false,
            showInvariantGuidance: false,
            label: 'Standard Binary Search',
            description: 'Multi-step binary search requiring independent interval reduction decisions.'
          };
        }
        if (_topicId.includes('sort')) {
          return {
            difficulty: 'MEDIUM',
            targetValue: 0,
            requiresPredictionBeforeMove: false,
            requiresFullOperationPrediction: false,
            showComparisonHint: false,
            showInvariantGuidance: false,
            label: 'Standard Sorting Pass',
            description: 'Step through sorting pass independently without comparison hints.'
          };
        }
        if (_topicId.includes('bfs') || _topicId.includes('dfs') || _topicId.includes('dijkstra')) {
          return {
            difficulty: 'MEDIUM',
            targetValue: 0,
            requiresPredictionBeforeMove: false,
            requiresFullOperationPrediction: false,
            showComparisonHint: false,
            showInvariantGuidance: false,
            label: 'Independent Graph Traversal',
            description: 'Advance graph exploration order independently without hints.'
          };
        }
        return {
          difficulty: 'MEDIUM',
          targetValue,
          requiresPredictionBeforeMove: false,
          requiresFullOperationPrediction: false,
          showComparisonHint: false,
          showInvariantGuidance: false,
          label: 'Standard BST Insertion Practice',
          description: 'Multi-step traversal requiring independent directional decisions.'
        };
      }
      case 'HARD': {
        if (_topicId === 'algo-binary-search') {
          return {
            difficulty: 'HARD',
            targetValue: 60,
            requiresPredictionBeforeMove: true,
            requiresFullOperationPrediction: false,
            showComparisonHint: false,
            showInvariantGuidance: false,
            label: 'Predictive Binary Search',
            description: 'Predict target sub-interval before midpoint comparison is confirmed.'
          };
        }
        if (_topicId.includes('sort')) {
          return {
            difficulty: 'HARD',
            targetValue: 0,
            requiresPredictionBeforeMove: true,
            requiresFullOperationPrediction: false,
            showComparisonHint: false,
            showInvariantGuidance: false,
            label: 'Predictive Inversion Sorting',
            description: 'Predict next required swap and position change before executing comparison.'
          };
        }
        if (_topicId.includes('bfs') || _topicId.includes('dfs') || _topicId.includes('dijkstra')) {
          return {
            difficulty: 'HARD',
            targetValue: 0,
            requiresPredictionBeforeMove: true,
            requiresFullOperationPrediction: false,
            showComparisonHint: false,
            showInvariantGuidance: false,
            label: 'Predictive Frontier Search',
            description: 'Predict entire next frontier level before node expansion.'
          };
        }
        return {
          difficulty: 'HARD',
          targetValue,
          requiresPredictionBeforeMove: true,
          requiresFullOperationPrediction: false,
          showComparisonHint: false,
          showInvariantGuidance: false,
          label: 'Predictive Insertion Challenge',
          description: 'Learner must predict target branch before the visual engine animates the traversal step.'
        };
      }
      case 'CHALLENGE': {
        if (_topicId === 'algo-binary-search') {
          return {
            difficulty: 'CHALLENGE',
            targetValue: 60,
            requiresPredictionBeforeMove: true,
            requiresFullOperationPrediction: true,
            showComparisonHint: false,
            showInvariantGuidance: false,
            label: 'Full Search Path Prediction',
            description: 'Predict entire sequence of midpoints and elimination bounds from memory.'
          };
        }
        if (_topicId.includes('sort')) {
          return {
            difficulty: 'CHALLENGE',
            targetValue: 0,
            requiresPredictionBeforeMove: true,
            requiresFullOperationPrediction: true,
            showComparisonHint: false,
            showInvariantGuidance: false,
            label: 'Multi-Step Pass Prediction',
            description: 'Predict resulting array state after complete sorting iteration.'
          };
        }
        if (_topicId.includes('bfs') || _topicId.includes('dfs') || _topicId.includes('dijkstra')) {
          return {
            difficulty: 'CHALLENGE',
            targetValue: 0,
            requiresPredictionBeforeMove: true,
            requiresFullOperationPrediction: true,
            showComparisonHint: false,
            showInvariantGuidance: false,
            label: 'Complete Traversal Path Prediction',
            description: 'Predict terminal traversal sequence from start to goal vertex.'
          };
        }
        return {
          difficulty: 'CHALLENGE',
          targetValue,
          requiresPredictionBeforeMove: true,
          requiresFullOperationPrediction: true,
          showComparisonHint: false,
          showInvariantGuidance: false,
          label: 'Full-Path Spatial Prediction',
          description: 'Predict the entire insertion sequence and terminal parent node before AR verification.'
        };
      }
    }
  }
}
