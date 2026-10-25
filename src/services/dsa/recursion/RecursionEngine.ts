/**
 * Deterministic Recursion & Call-Stack Learning Engine.
 * 
 * Implements call-stack push/pop mechanics for recursive functions (Factorial / Fibonacci):
 * Base-case termination, stack frame activation, return value propagation,
 * and stack overflow / missing base case misconceptions.
 */

import { IDSALearningEngine, DSAOperationResult, StepValidationResult } from '../core/IDSALearningEngine';

export interface StackFrame {
  callId: string;
  n: number;
  returnValue?: number;
  status: 'CALLING' | 'BASE_CASE' | 'RETURNING';
}

export interface RecursionState {
  initialN: number;
  callStack: StackFrame[];
  unwoundFrames: StackFrame[];
  currentN: number;
  isComplete: boolean;
  finalResult: number | null;
  lastAction: string;
}

export class RecursionEngine implements IDSALearningEngine<RecursionState, { type: 'STEP' }> {
  readonly topicId = 'algo-recursion';
  readonly topicTitle = 'Recursion';
  readonly category = 'algorithm' as const;
  readonly visualizationCapability = '3D_READY' as const;

  getInitialState(seed?: { n?: number }): RecursionState {
    const n = seed?.n ?? 4;
    return {
      initialN: n,
      callStack: [{ callId: `fact(${n})`, n, status: 'CALLING' }],
      unwoundFrames: [],
      currentN: n,
      isComplete: false,
      finalResult: null,
      lastAction: 'INITIALIZED'
    };
  }

  getAvailableOperations(state: RecursionState): string[] {
    return state.isComplete ? ['RESET'] : ['STEP'];
  }

  applyOperation(state: RecursionState, _operation: { type: 'STEP' }): DSAOperationResult<RecursionState> {
    if (state.isComplete) {
      return { success: false, newState: state, stepDescription: 'Recursive execution already completed.' };
    }

    const stack = [...state.callStack];
    const top = stack[stack.length - 1];

    // Phase 1: Winding call stack down to base case (n <= 1)
    if (top.status === 'CALLING') {
      if (top.n <= 1) {
        top.status = 'BASE_CASE';
        top.returnValue = 1;
        return {
          success: true,
          newState: { ...state, callStack: stack, lastAction: 'HIT_BASE_CASE' },
          stepDescription: `Base case reached: fact(1) = 1. Stack growth stops, unwinding begins.`
        };
      }

      // Push next subproblem: n - 1
      const nextN = top.n - 1;
      stack.push({ callId: `fact(${nextN})`, n: nextN, status: 'CALLING' });

      return {
        success: true,
        newState: { ...state, callStack: stack, currentN: nextN, lastAction: `PUSHED_fact(${nextN})` },
        stepDescription: `Pushed fact(${nextN}) onto call stack. Total active stack frames: ${stack.length}.`
      };
    }

    // Phase 2: Unwinding call stack
    if (top.status === 'BASE_CASE' || top.status === 'RETURNING') {
      const finishedFrame = stack.pop()!;
      const unwound = [...state.unwoundFrames, finishedFrame];

      if (stack.length === 0) {
        return {
          success: true,
          newState: {
            ...state,
            callStack: [],
            unwoundFrames: unwound,
            isComplete: true,
            finalResult: finishedFrame.returnValue ?? 1,
            lastAction: 'EXECUTION_COMPLETE'
          },
          stepDescription: `Recursion finished. Final return value: ${finishedFrame.returnValue}. Stack completely unwound.`
        };
      }

      // Propagate return value to caller: fact(n) = n * fact(n - 1)
      const parentFrame = stack[stack.length - 1];
      parentFrame.returnValue = parentFrame.n * (finishedFrame.returnValue ?? 1);
      parentFrame.status = 'RETURNING';

      return {
        success: true,
        newState: { ...state, callStack: stack, unwoundFrames: unwound, lastAction: `RESOLVED_fact(${parentFrame.n})` },
        stepDescription: `Unwound frame. ${parentFrame.callId} = ${parentFrame.n} * ${finishedFrame.returnValue} = ${parentFrame.returnValue}.`
      };
    }

    return { success: true, newState: state, stepDescription: 'Recursion step applied.' };
  }

  validateStep(state: RecursionState, userChoice: any, expectedChoice?: any): StepValidationResult {
    const isCorrect = String(userChoice) === String(expectedChoice);
    return {
      isCorrect,
      expectedChoice,
      userChoice,
      misconception: !isCorrect ? {
        id: `diag-rec-${Date.now()}`,
        type: 'RECURSION_MISSING_BASE_CASE',
        topicId: this.topicId,
        userChoice: String(userChoice),
        expectedChoice: String(expectedChoice),
        pedagogicalExplanation: `Recursion requires reaching the base case condition (n <= 1) before values can be returned and multiplied.`,
        correctiveGuidance: 'Ensure base case guard check executes before invoking recursive subproblems.',
        timestamp: new Date().toISOString()
      } : undefined,
      feedbackMessage: isCorrect ? 'Valid recursion step.' : 'Recursion invariant error.'
    };
  }

  getVisualizationData(state: RecursionState): any {
    return {
      type: 'RECURSION_CALL_STACK',
      callStack: state.callStack,
      unwoundFrames: state.unwoundFrames,
      isComplete: state.isComplete,
      finalResult: state.finalResult
    };
  }
}
