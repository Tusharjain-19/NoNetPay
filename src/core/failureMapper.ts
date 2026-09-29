// Failure & Result Evaluation Mapper — pure TypeScript
// Aligns with ARCHITECTURE.md 6.5 & PRD 7.6

import failuresData from '../content/failures.json';

export type ResultOutcome = 'SUCCESS' | 'FAILED' | 'UNKNOWN';

export interface EvaluationResult {
  outcome: ResultOutcome;
  evidence?: string;
  humanReason?: string;
  humanKey?: string;
  rawText: string;
}

export interface FailureMapperRule {
  id: string;
  pattern: string;
  description?: string;
  humanKey?: string;
  humanReason?: string;
}

export class FailureMapper {
  private successRules: FailureMapperRule[];
  private failureRules: FailureMapperRule[];

  constructor(config = failuresData) {
    this.successRules = config.success || [];
    this.failureRules = config.failure || [];
  }

  evaluate(rawText: string): EvaluationResult {
    if (!rawText || !rawText.trim()) {
      return {
        outcome: 'UNKNOWN',
        rawText: rawText || '',
        humanReason: 'No response received from carrier or dialer.',
      };
    }

    const cleanText = rawText.trim();

    // 1. Check positive success patterns
    for (const rule of this.successRules) {
      try {
        const regex = new RegExp(rule.pattern, 'i');
        const match = cleanText.match(regex);
        if (match) {
          return {
            outcome: 'SUCCESS',
            evidence: match[0],
            rawText: cleanText,
          };
        }
      } catch {
        // Safe regex failure handling
      }
    }

    // 2. Check failure patterns
    for (const rule of this.failureRules) {
      try {
        const regex = new RegExp(rule.pattern, 'i');
        if (regex.test(cleanText)) {
          return {
            outcome: 'FAILED',
            humanKey: rule.humanKey,
            humanReason: rule.humanReason || 'Transaction was declined.',
            rawText: cleanText,
          };
        }
      } catch {
        // Safe regex failure handling
      }
    }

    // 3. Fallback: absence of error is NEVER success. Unknown means UNKNOWN.
    return {
      outcome: 'UNKNOWN',
      humanReason: 'Uncertain response received. Please verify with your bank balance before re-attempting.',
      rawText: cleanText,
    };
  }
}

export const defaultFailureMapper = new FailureMapper();
