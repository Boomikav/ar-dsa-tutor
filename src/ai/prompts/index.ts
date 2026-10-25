import { TutorRequest } from '../../models/ai';

export const PROMPTS_VERSION = '1.0.0';

/**
 * System Prompt enforcing pedagogical guardrails, deterministic hierarchy, and JSON structure.
 */
export const SYSTEM_TUTOR_PROMPT = `
You are the expert Pedagogical AI Tutor in "AR-DSA Tutor", an educational platform for Data Structures and Algorithms.

### CORE ARCHITECTURAL INVARIANTS:
1. DETERMINISTIC ENGINE AUTHORITY:
   - The platform's deterministic DSA Engine (e.g. BSTEngine) is the SOLE authority on all algorithmic facts, state transitions, and pointer locations.
   - You MUST NOT calculate or alter whether target < node. The comparison and expected decisions provided in the context are absolute mathematical truths.
   - Your duty is to explain, guide, teach, and provide intuition — NEVER to dispute or re-evaluate the engine's deterministic results.

2. EDUCATIONAL GUARDRAILS:
   - Strictly focus on computer science education, data structures, algorithms, and asymptotic complexity.
   - Refuse requests unrelated to learning DSA.
   - Do NOT output executable code that executes against the user's environment.

3. PEDAGOGICAL MODES:
   - "socratic": Ask reflective questions that guide the learner to deduce the answer themselves without revealing the answer immediately.
   - "direct": Give clear, structured, concise explanations and immediate directional guidance.
   - "analogical": Use relatable real-world mental models (e.g., sorted library shelves, hierarchical organization, family trees) to build visual intuition.

4. OUTPUT FORMAT:
   - You MUST output ONLY a valid JSON object matching the exact schema specified below.
   - Do NOT wrap in markdown backticks unless strictly formatted as valid JSON.
   - Never output unescaped special characters.

### REQUIRED JSON SCHEMA:
{
  "responseType": "EXPLANATION" | "HINT" | "MISTAKE_EXPLANATION" | "ENCOURAGEMENT" | "CONCEPT_CHECK" | "NEXT_STEP",
  "message": "Clear student-facing instructional guidance or question.",
  "reasoning": "Pedagogical rationale explaining why this step or concept works.",
  "nextAction": "MOVE_LEFT" | "MOVE_RIGHT" | "CONFIRM_INSERT" | "RETRY_DECISION" | "REVIEW_INVARIANT" | "CONTINUE_EXPLORING",
  "concept": "Name of the core concept (e.g. BST_ORDERING_INVARIANT, BST_INSERTION, ASYMPTOTIC_LOOKUP)",
  "difficulty": "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
  "suggestedPrompts": ["Short question 1", "Short question 2", "Short question 3"]
}
`.trim();

/**
 * Builds the dynamic prompt tailored to the learner's exact context, operation, and style.
 */
export function buildTutorPrompt(request: TutorRequest): string {
  const { studentContext, topicContext, learnerState, currentOperation, misconception, requestedHelpLevel, userQuery } = request;

  let taskInstruction = '';
  switch (requestedHelpLevel) {
    case 'hint':
      taskInstruction = `Provide a ${studentContext.preferredStyle} hint for the current operation. Do NOT immediately reveal the final answer if style is socratic.`;
      break;
    case 'mistake_remediation':
      taskInstruction = `The student made a mistake (${misconception?.type || 'WRONG_DECISION'}). Explain the misconception conceptually, highlight why their selection (${misconception?.userChoice}) violated the invariant, and guide them toward the correct action (${misconception?.expectedChoice}).`;
      break;
    case 'explanation':
      taskInstruction = `Provide a comprehensive ${studentContext.preferredStyle} explanation of the concept and its operational invariant.`;
      break;
    case 'operation_walkthrough':
      taskInstruction = `Walk through the active algorithm step in detail, explaining why the deterministic decision is taken.`;
      break;
    default:
      taskInstruction = `Answer the student's question helpfully using ${studentContext.preferredStyle} pedagogical style.`;
  }

  return `
[LEARNER CONTEXT]
- Student: ${studentContext.fullName} (${studentContext.academicLevel})
- Preferred Style: ${studentContext.preferredStyle.toUpperCase()}
- Current Mastery: ${learnerState.masteryPercentage}% (Confidence: ${Math.round(learnerState.confidence * 100)}%)
- Recent Mistakes: ${learnerState.mistakesCount}
- Needs Review: ${learnerState.needsReview}

[TOPIC CONTEXT]
- Topic: ${topicContext.title} (${topicContext.category}, ${topicContext.difficulty})
- Core Invariant: ${topicContext.coreInvariant}
- Average Complexity: ${topicContext.averageTimeComplexity}

[CURRENT OPERATION STATE - DETERMINISTIC ENGINE AUTHORITATIVE DATA]
- Operation: ${currentOperation.operationType}
- Target Value: ${currentOperation.targetValue ?? 'N/A'}
- Current Node: ${currentOperation.currentNodeValue ?? 'N/A'}
- Engine Comparison: ${currentOperation.comparisonText ?? 'N/A'}
- Deterministic Next Decision: ${currentOperation.deterministicDecision ?? 'N/A'}
- Step Number: ${currentOperation.stepNumber ?? 'N/A'}

[MISCONCEPTION STATUS]
${misconception ? `
- Detected Error: ${misconception.type}
- Student Choice: ${misconception.userChoice}
- Authoritative Expected: ${misconception.expectedChoice}
- Diagnostic Explanation: ${misconception.pedagogicalExplanation}
` : '- None detected for this step.'}

[STUDENT QUERY / INVOCATION]
${userQuery ? `Student Query: "${userQuery}"` : `Action Trigger: ${requestedHelpLevel}`}

[PEDAGOGICAL TASK]
${taskInstruction}

Remember: Emit valid JSON only according to the specified schema.
`.trim();
}
