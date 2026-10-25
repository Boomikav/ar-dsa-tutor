/**
 * Execution-Grounded Explainable Adaptation (EGEA)
 * Step Identifier Canonicalizer
 * 
 * Provides deterministic, centralized canonicalization of algorithm step identifiers.
 * Maps known syntactic aliases and retry suffixes to stable canonical identifiers
 * while strictly guaranteeing that distinct algorithm steps remain non-equivalent.
 */

/**
 * Explicit dictionary of known semantic step aliases used across DSA visualizers.
 * Maps syntactic variants (e.g. abbreviations from mobile HUD or alternate engine states)
 * to their authoritative canonical form.
 */
export const KNOWN_STEP_ALIAS_MAP: Readonly<Record<string, string>> = Object.freeze({
  // BST branch traversal abbreviations
  'NODE_42_L': 'NODE_42_LEFT',
  'NODE_42_R': 'NODE_42_RIGHT',
  'NODE_ROOT_L': 'NODE_ROOT_LEFT',
  'NODE_ROOT_R': 'NODE_ROOT_RIGHT',
  'BST_ROOT_L': 'BST_ROOT_LEFT',
  'BST_ROOT_R': 'BST_ROOT_RIGHT',

  // Binary search interval abbreviations
  'BS_MIDPOINT_DECISION': 'MIDPOINT_DECISION',
  'BS_MID_DECISION': 'MIDPOINT_DECISION',
  'MIDPOINT_DECISION_STEP_1': 'MIDPOINT_DECISION_1',
  'MIDPOINT_STEP_1': 'MIDPOINT_DECISION_1',

  // Bubble sort pass abbreviations
  'BUBBLE_SWAP_PAIR_0_1': 'BUBBLE_PAIR_0_1',
  'BUBBLE_COMPARE_0_1': 'BUBBLE_PAIR_0_1',

  // Stack operations aliases
  'STACK_POP_OP': 'STACK_POP',
  'STACK_PUSH_OP': 'STACK_PUSH',
  'PUSH_OP': 'STACK_PUSH',
  'POP_OP': 'STACK_POP',
});

/**
 * Regular expression matching structured retry and attempt suffixes:
 * Matches patterns like:
 *   -try-1, -try-2, _try_1, _try_2
 *   -attempt-1, _attempt_1
 *   -retry-1, _retry_1
 * 
 * Specifically anchored to the end of the identifier ($) so it does NOT match
 * distinct step indices like "step-1", "step-2", "node-1", "node-2".
 */
const RETRY_ATTEMPT_SUFFIX_REGEX = /[-_](?:try|attempt|retry)[-_]\d+$/i;

/**
 * Directional suffix abbreviation pattern (e.g., "_L" -> "_LEFT", "_R" -> "_RIGHT")
 * Matches ONLY trailing delimiter + L or R to prevent corrupting names like "LEVEL".
 */
const DIRECTIONAL_SUFFIX_L_REGEX = /[-_]l$/i;
const DIRECTIONAL_SUFFIX_R_REGEX = /[-_]r$/i;

/**
 * Canonicalizes a step identifier into its authoritative string representation.
 * 
 * Invariants:
 * 1. Deterministic: identical inputs always yield identical canonical outputs.
 * 2. Idempotent: canonicalize(canonicalize(id)) === canonicalize(id).
 * 3. Safe: null, undefined, whitespace, or non-string inputs return '__UNKNOWN_STEP__'.
 * 4. Conservative: only known retry suffixes and explicit aliases are normalized.
 *    Distinct subproblems (e.g. 'step-1' vs 'step-2') remain strictly non-equal.
 * 
 * @param stepIdentifier Raw step identifier from engine or telemetry
 * @returns Canonical step identifier
 */
export function canonicalizeStepIdentifier(stepIdentifier: unknown): string {
  if (typeof stepIdentifier !== 'string') {
    return '__UNKNOWN_STEP__';
  }

  const trimmed = stepIdentifier.trim();
  if (trimmed === '') {
    return '__UNKNOWN_STEP__';
  }

  // 1. Check exact dictionary match (case-sensitive first)
  if (KNOWN_STEP_ALIAS_MAP[trimmed]) {
    return KNOWN_STEP_ALIAS_MAP[trimmed];
  }

  // 2. Check uppercase variant in alias dictionary
  const upper = trimmed.toUpperCase();
  if (KNOWN_STEP_ALIAS_MAP[upper]) {
    return KNOWN_STEP_ALIAS_MAP[upper];
  }

  let canonical = trimmed;

  // 3. Strip structured retry/attempt suffix (e.g., "node-50-try-1" -> "node-50")
  if (RETRY_ATTEMPT_SUFFIX_REGEX.test(canonical)) {
    canonical = canonical.replace(RETRY_ATTEMPT_SUFFIX_REGEX, '');
  }

  // 4. Normalize trailing directional abbreviations (_L -> _LEFT, _R -> _RIGHT)
  if (DIRECTIONAL_SUFFIX_L_REGEX.test(canonical)) {
    // Preserve delimiter character (- or _)
    const delimiter = canonical.slice(-2, -1);
    canonical = canonical.slice(0, -2) + delimiter + 'LEFT';
  } else if (DIRECTIONAL_SUFFIX_R_REGEX.test(canonical)) {
    const delimiter = canonical.slice(-2, -1);
    canonical = canonical.slice(0, -2) + delimiter + 'RIGHT';
  }

  // 5. Final check against alias dictionary after suffix stripping
  if (KNOWN_STEP_ALIAS_MAP[canonical]) {
    return KNOWN_STEP_ALIAS_MAP[canonical];
  }
  const canonicalUpper = canonical.toUpperCase();
  if (KNOWN_STEP_ALIAS_MAP[canonicalUpper]) {
    return KNOWN_STEP_ALIAS_MAP[canonicalUpper];
  }

  return canonical;
}

/**
 * Checks whether two step identifiers refer to the same underlying algorithm step.
 */
export function areStepIdentifiersEquivalent(a: unknown, b: unknown): boolean {
  const canonA = canonicalizeStepIdentifier(a);
  const canonB = canonicalizeStepIdentifier(b);

  if (canonA === '__UNKNOWN_STEP__' || canonB === '__UNKNOWN_STEP__') {
    return false;
  }

  return canonA === canonB;
}
