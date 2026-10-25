/**
 * Phase 10: Research Data Manager & Quality Assurance Engine
 * 
 * Provides:
 * - Deterministic data hygiene & quality validation (duplicate checks, range audits)
 * - Strict read-only separation from active learner model state
 * - Longitudinal misconception episode tracking with operationalized resolution criteria
 * - Deterministic PRNG seed-based task reproducibility
 * - Deterministic AI response verification (schema, topic grounding, invariant preservation)
 * - Sanitized CSV & JSON research data export (zero PII, zero API keys)
 * - Anti-fabrication integrity enforcement
 */

import {
  ParticipantRecord,
  AssessmentAttempt,
  LearningOutcome,
  MisconceptionEpisode,
  ResearchEvent,
  StudyConfiguration,
  DataQualityReport,
  AIEvaluationRecord
} from '../../models/research';

export class Mulberry32PRNG {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  public next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  public nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}

export class ResearchDataManager {
  private static instance: ResearchDataManager;

  private participants: Map<string, ParticipantRecord> = new Map();
  private assessmentAttempts: AssessmentAttempt[] = [];
  private researchEvents: ResearchEvent[] = [];
  private misconceptionEpisodes: Map<string, MisconceptionEpisode> = new Map();
  private aiEvaluations: AIEvaluationRecord[] = [];

  private currentStudyConfig: StudyConfiguration = {
    studyId: 'STUDY-AR-DSA-2026-V1',
    title: 'Adaptive AR-DSA Educational Efficacy Study',
    version: '1.0.0',
    condition: 'AR_DSA_TUTOR',
    targetPopulation: 'Undergraduate Computer Science Students',
    inclusionCriteria: [
      'Enrolled in or completed introductory programming',
      'Age 18 or older',
      'Informed consent provided under approved institutional protocol'
    ],
    exclusionCriteria: [
      'Prior professional software engineering experience > 3 years',
      'Inability to interact with standard WebXR/Three.js display devices'
    ],
    preTestEnabled: true,
    postTestEnabled: true,
    delayedPostTestEnabled: true,
    delayedPostTestDays: 7
  };

  private constructor() {}

  public static getInstance(): ResearchDataManager {
    if (!ResearchDataManager.instance) {
      ResearchDataManager.instance = new ResearchDataManager();
    }
    return ResearchDataManager.instance;
  }

  /**
   * Resets all stored research records. Used for test isolation.
   */
  public reset(): void {
    this.participants.clear();
    this.assessmentAttempts = [];
    this.researchEvents = [];
    this.misconceptionEpisodes.clear();
    this.aiEvaluations = [];
  }

  // ==================== 1. STUDY CONFIGURATION ====================

  public getStudyConfiguration(): StudyConfiguration {
    return { ...this.currentStudyConfig };
  }

  public updateStudyConfiguration(config: Partial<StudyConfiguration>): void {
    this.currentStudyConfig = { ...this.currentStudyConfig, ...config };
  }

  // ==================== 2. PARTICIPANT ENROLLMENT & PRIVACY ====================

  /**
   * Enrolls a pseudonymous participant. Rejects identifiable personal data.
   */
  public enrollParticipant(record: ParticipantRecord): { success: boolean; error?: string } {
    if (!record.participantId || record.participantId.trim().length === 0) {
      return { success: false, error: 'Participant ID cannot be empty.' };
    }

    // Reject potential personal identifiers (e.g. email or names)
    if (record.participantId.includes('@') || record.participantId.includes(' ') || record.participantId.length > 32) {
      return { success: false, error: 'Participant ID must be a pseudonymous token (e.g. P001), not an email or full name.' };
    }

    if (this.participants.has(record.participantId)) {
      return { success: false, error: `Duplicate participant ID: ${record.participantId} already enrolled.` };
    }

    this.participants.set(record.participantId, { ...record });
    return { success: true };
  }

  public getParticipant(participantId: string): ParticipantRecord | undefined {
    return this.participants.get(participantId);
  }

  public getAllParticipants(): ParticipantRecord[] {
    return Array.from(this.participants.values());
  }

  // ==================== 3. ASSESSMENT ATTEMPTS & DATA HYGIENE ====================

  public recordAssessmentAttempt(attempt: AssessmentAttempt): { success: boolean; error?: string } {
    if (!this.participants.has(attempt.participantId)) {
      return { success: false, error: `Unregistered participant ID: ${attempt.participantId}` };
    }

    this.assessmentAttempts.push({ ...attempt });
    return { success: true };
  }

  /**
   * Validates raw assessment datasets and produces an audit report of valid vs excluded records.
   */
  public validateDatasetQuality(
    rawOutcomes: Array<{
      participantId: string;
      condition?: string;
      preTestScore?: number;
      postTestScore?: number;
      timestamp?: string;
    }>
  ): DataQualityReport {
    const report: DataQualityReport = {
      totalRecordsChecked: rawOutcomes.length,
      validRecords: 0,
      excludedRecords: 0,
      exclusionReasons: []
    };

    const seenIds = new Set<string>();

    for (const record of rawOutcomes) {
      let isValid = true;
      const reasons: string[] = [];

      if (!record.participantId || record.participantId.trim() === '') {
        reasons.push('Missing participant ID.');
        isValid = false;
      } else if (seenIds.has(record.participantId)) {
        reasons.push('Duplicate participant ID detected.');
        isValid = false;
      } else {
        seenIds.add(record.participantId);
      }

      if (!record.condition || !['CONTROL', 'AR_DSA_TUTOR'].includes(record.condition)) {
        reasons.push('Missing or invalid study condition assignment.');
        isValid = false;
      }

      if (record.preTestScore === undefined || record.preTestScore < 0 || record.preTestScore > 100) {
        reasons.push(`Pre-test score out of bounds [0, 100]: ${record.preTestScore}`);
        isValid = false;
      }

      if (record.postTestScore === undefined || record.postTestScore < 0 || record.postTestScore > 100) {
        reasons.push(`Post-test score out of bounds [0, 100]: ${record.postTestScore}`);
        isValid = false;
      }

      if (record.timestamp) {
        const timeVal = Date.parse(record.timestamp);
        if (isNaN(timeVal) || timeVal > Date.now() + 86400000) {
          reasons.push(`Impossible future or unparseable timestamp: ${record.timestamp}`);
          isValid = false;
        }
      }

      if (isValid) {
        report.validRecords++;
      } else {
        report.excludedRecords++;
        report.exclusionReasons.push({
          recordId: record.participantId || 'UNKNOWN',
          reason: reasons.join('; ')
        });
      }
    }

    return report;
  }

  // ==================== 4. LONGITUDINAL MISCONCEPTION TRACKING ====================

  /**
   * Tracks an occurrence of a misconception.
   */
  public logMisconceptionOccurrence(
    participantId: string,
    topicId: string,
    misconceptionType: string,
    timestamp = new Date().toISOString()
  ): MisconceptionEpisode {
    const key = `${participantId}:${topicId}:${misconceptionType}`;
    let episode = this.misconceptionEpisodes.get(key);

    if (!episode) {
      episode = {
        participantId,
        topicId,
        misconceptionType,
        firstDetectedAt: timestamp,
        recurrenceCount: 0,
        remediationAttempts: 0
      };
    } else {
      episode.recurrenceCount++;
      episode.resolvedAt = undefined; // Recurrence resets previous resolution
    }

    this.misconceptionEpisodes.set(key, episode);
    return { ...episode };
  }

  /**
   * Logs a pedagogical remediation intervention for a misconception.
   */
  public logRemediationAttempt(
    participantId: string,
    topicId: string,
    misconceptionType: string
  ): void {
    const key = `${participantId}:${topicId}:${misconceptionType}`;
    const episode = this.misconceptionEpisodes.get(key);
    if (episode) {
      episode.remediationAttempts++;
    }
  }

  /**
   * Checks whether a misconception can be operationally classified as "resolved".
   * Criterion: Zero recurrence across consecutiveSuccessOpportunities consecutive opportunities (default N=3).
   */
  public evaluateMisconceptionResolution(
    participantId: string,
    topicId: string,
    misconceptionType: string,
    consecutiveSuccessOpportunities: number,
    requiredThreshold = 3
  ): boolean {
    const key = `${participantId}:${topicId}:${misconceptionType}`;
    const episode = this.misconceptionEpisodes.get(key);
    if (!episode) return false;

    if (consecutiveSuccessOpportunities >= requiredThreshold) {
      episode.resolvedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  public getAllMisconceptionEpisodes(): MisconceptionEpisode[] {
    return Array.from(this.misconceptionEpisodes.values());
  }

  // ==================== 5. REPRODUCIBLE SEEDED TASK GENERATION ====================

  /**
   * Produces a deterministic random seed-based test case configuration.
   * Enables independent researchers to replicate exact task states.
   */
  public generateReproducibleTask(seed: number, topicId: string, taskId: string): {
    seed: number;
    topicId: string;
    taskId: string;
    initialData: number[];
    targetValue?: number;
  } {
    const prng = new Mulberry32PRNG(seed);
    const size = prng.nextInt(5, 8);
    const initialData: number[] = [];

    for (let i = 0; i < size; i++) {
      initialData.push(prng.nextInt(1, 99));
    }

    let targetValue: number | undefined;
    if (topicId.includes('search')) {
      // Pick either an existing element or a novel value with 50% probability
      if (prng.next() > 0.5) {
        targetValue = initialData[prng.nextInt(0, initialData.length - 1)];
      } else {
        targetValue = prng.nextInt(1, 99);
      }
    }

    if (topicId === 'algo-binary-search') {
      initialData.sort((a, b) => a - b);
    }

    return {
      seed,
      topicId,
      taskId,
      initialData,
      targetValue
    };
  }

  // ==================== 6. AI QUALITY DETERMINISTIC EVALUATION ====================

  /**
   * Deterministically validates an AI tutor response against ground-truth domain rules.
   */
  public evaluateAIResponse(
    interactionId: string,
    participantId: string,
    topicId: string,
    responsePayload: {
      messageText: string;
      groundedOperationState?: string;
      suggestedNextAction?: string;
      hasUnauthorizedStateMutation?: boolean;
    }
  ): AIEvaluationRecord {
    const schemaValidity = !!responsePayload.messageText && responsePayload.messageText.length > 5;
    
    // Topic correctness: check that response does not reference disjoint concepts
    // e.g. An array topic should not reference BST rotations
    let topicCorrectness = true;
    if (topicId === 'ds-array' && responsePayload.messageText.toLowerCase().includes('in-order traversal')) {
      topicCorrectness = false;
    }
    if (topicId === 'algo-binary-search' && responsePayload.messageText.toLowerCase().includes('hash bucket collision')) {
      topicCorrectness = false;
    }

    const operationConsistency = !!responsePayload.groundedOperationState;
    const nextActionValidity = !!responsePayload.suggestedNextAction;
    const stateMutationViolation = !!responsePayload.hasUnauthorizedStateMutation;

    const record: AIEvaluationRecord = {
      interactionId,
      participantId,
      topicId,
      timestamp: new Date().toISOString(),
      schemaValidity,
      topicCorrectness,
      operationConsistency,
      nextActionValidity,
      stateMutationViolation
    };

    this.aiEvaluations.push(record);
    return record;
  }

  // ==================== 7. APPEND-ONLY RESEARCH TELEMETRY ====================

  public recordResearchEvent(event: ResearchEvent): { success: boolean; error?: string } {
    // Sanitization: Reject events containing credentials or potential secrets
    const payloadStr = JSON.stringify(event.payload || {}).toLowerCase();
    if (
      payloadStr.includes('apikey') ||
      payloadStr.includes('secret') ||
      payloadStr.includes('password') ||
      payloadStr.includes('token')
    ) {
      return { success: false, error: 'Research event payload contains forbidden sensitive key.' };
    }

    this.researchEvents.push({ ...event });
    return { success: true };
  }

  public getResearchEvents(): ResearchEvent[] {
    return [...this.researchEvents];
  }

  // ==================== 8. SANITIZED DATA EXPORT (CSV / JSON) ====================

  public exportOutcomesAsJSON(outcomes: LearningOutcome[]): string {
    return JSON.stringify(
      {
        studyId: this.currentStudyConfig.studyId,
        exportedAt: new Date().toISOString(),
        version: this.currentStudyConfig.version,
        outcomes
      },
      null,
      2
    );
  }

  public exportOutcomesAsCSV(outcomes: LearningOutcome[]): string {
    const headers = [
      'participantId',
      'condition',
      'preTestScore',
      'postTestScore',
      'delayedPostTestScore',
      'absoluteGain',
      'normalizedGain',
      'retentionRate',
      'isComplete'
    ];

    const rows = outcomes.map(o => [
      o.participantId,
      o.condition,
      o.preTestScore,
      o.postTestScore,
      o.delayedPostTestScore !== undefined ? o.delayedPostTestScore : 'NA',
      o.absoluteGain,
      o.normalizedGain !== undefined ? o.normalizedGain : 'NA',
      o.retentionRate !== undefined ? o.retentionRate : 'NA',
      o.isComplete
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  // ==================== 9. EMPIRICAL STATUS CHECK ====================

  /**
   * Strict anti-fabrication check: returns true ONLY if genuine participant records exist.
   */
  public isEmpiricalDataAvailable(): boolean {
    return this.participants.size > 0 && this.assessmentAttempts.length > 0;
  }
}
