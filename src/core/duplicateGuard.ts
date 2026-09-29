// Duplicate Payment Guard — pure TypeScript
// Aligns with ARCHITECTURE.md 6.6 & PRD 7.7

import type { PaymentSession } from './session';

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  conflictingSession?: PaymentSession;
  timeRemainingMs?: number;
  reason?: string;
}

const DEFAULT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

export function checkDuplicatePayment(
  params: {
    payeeVpa: string;
    amount: string;
    currentSessionId?: string;
  },
  existingSessions: PaymentSession[],
  windowMs: number = DEFAULT_WINDOW_MS,
  now: number = Date.now()
): DuplicateCheckResult {
  const targetVpa = params.payeeVpa.trim().toLowerCase();
  const targetAmount = parseFloat(params.amount);

  for (const s of existingSessions) {
    if (params.currentSessionId && s.id === params.currentSessionId) {
      continue;
    }

    const sessionVpa = s.payeeVpa.trim().toLowerCase();
    const sessionAmount = parseFloat(s.amount);
    const ageMs = now - s.createdAt;

    // Must be same payee and amount within the duplicate window
    if (sessionVpa === targetVpa && Math.abs(sessionAmount - targetAmount) < 0.01 && ageMs < windowMs) {
      // Risk is high if previous transaction is UNKNOWN or still unresolved/pending
      if (s.state === 'UNKNOWN' || s.state === 'AWAITING_AUTH' || s.state === 'PROCESSING') {
        const timeRemainingMs = windowMs - ageMs;
        const minsLeft = Math.ceil(timeRemainingMs / 60000);
        return {
          isDuplicate: true,
          conflictingSession: s,
          timeRemainingMs,
          reason: `A payment of ₹${s.amount} to ${s.payeeVpa} is currently in state '${s.state}' from ${Math.round(ageMs / 60000)}m ago. Double payment may occur.`,
        };
      }
    }
  }

  return { isDuplicate: false };
}
