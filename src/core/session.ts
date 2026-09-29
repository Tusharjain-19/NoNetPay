// Payment session state machine — pure TypeScript
// Aligns with ARCHITECTURE.md 6.4 & PRD 7.4

import type { SessionState } from './valueTypes';

export type { SessionState };

export interface TimelineEvent {
  state: SessionState;
  timestamp: number;
  message?: string;
  source?: 'system' | 'user' | 'timeout' | 'carrier';
}

export type SessionEventType =
  | 'VALIDATE'
  | 'SELECT_ROUTE'
  | 'HANDOFF'
  | 'AWAIT_AUTH'
  | 'REPORT_PROCESSING'
  | 'REPORT_SUCCESS'
  | 'REPORT_FAILED'
  | 'REPORT_UNKNOWN'
  | 'TIMEOUT_INACTIVITY'
  | 'TIMEOUT_HARD_CAP'
  | 'MANUAL_RESOLUTION';

export interface SessionEvent {
  type: SessionEventType;
  sessionId: string;
  timestamp: number;
  payload?: {
    evidence?: string;
    reason?: string;
    route?: string;
    resolution?: 'CONFIRMED' | 'NOT_PAID';
    note?: string;
  };
}

export interface PaymentSession {
  id: string;
  payeeVpa: string;
  payeeName: string;
  amount: string;
  amountPaise?: number;
  note: string;
  route: string;
  state: SessionState;
  timeline: TimelineEvent[];
  createdAt: number;
  updatedAt: number;
  resultMessage?: string;
  rawResultText?: string;
  userNote?: string;
  resolution?: 'CONFIRMED' | 'NOT_PAID';
  illegalAttempts?: { attemptedState: SessionState; timestamp: number; error: string }[];
}

const TERMINAL_STATES: SessionState[] = ['SUCCESS', 'FAILED', 'UNKNOWN'];

export function isTerminal(state: SessionState): boolean {
  return TERMINAL_STATES.includes(state);
}

// Pure reducer function
export function reduceSession(session: PaymentSession, event: SessionEvent): PaymentSession {
  // Guard 1: Event must match session ID
  if (event.sessionId !== session.id) {
    return session;
  }

  // Guard 2: Immutable terminal states (SUCCESS and FAILED cannot be altered)
  if (session.state === 'SUCCESS' || session.state === 'FAILED') {
    return {
      ...session,
      illegalAttempts: [
        ...(session.illegalAttempts || []),
        {
          attemptedState: session.state,
          timestamp: event.timestamp,
          error: `Cannot mutate terminal state ${session.state} with event ${event.type}`,
        },
      ],
    };
  }

  // Guard 3: UNKNOWN can ONLY be changed via MANUAL_RESOLUTION
  if (session.state === 'UNKNOWN') {
    if (event.type === 'MANUAL_RESOLUTION' && event.payload?.resolution) {
      const targetState: SessionState = event.payload.resolution === 'CONFIRMED' ? 'SUCCESS' : 'FAILED';
      const resolutionMessage = event.payload.resolution === 'CONFIRMED'
        ? 'Manual resolution: User verified funds debited'
        : 'Manual resolution: User verified payment did not go through';

      return {
        ...session,
        state: targetState,
        resolution: event.payload.resolution,
        userNote: event.payload.note,
        updatedAt: event.timestamp,
        resultMessage: resolutionMessage,
        timeline: [
          ...session.timeline,
          {
            state: targetState,
            timestamp: event.timestamp,
            message: resolutionMessage,
            source: 'user',
          },
        ],
      };
    }
    // Reject other mutations on UNKNOWN
    return session;
  }

  let nextState: SessionState = session.state;
  let timelineMessage = '';
  let source: TimelineEvent['source'] = 'system';

  switch (event.type) {
    case 'VALIDATE':
      if (session.state === 'CREATED') {
        nextState = 'VALIDATED';
        timelineMessage = 'Payment details validated';
      }
      break;

    case 'SELECT_ROUTE':
      if (session.state === 'VALIDATED') {
        nextState = 'ROUTE_SELECTED';
        timelineMessage = event.payload?.route
          ? `Route selected: ${event.payload.route}`
          : 'Payment route chosen';
      }
      break;

    case 'HANDOFF':
      if (session.state === 'ROUTE_SELECTED') {
        nextState = 'HANDOFF';
        timelineMessage = 'Handed off to phone dialer';
      }
      break;

    case 'AWAIT_AUTH':
      if (session.state === 'HANDOFF') {
        nextState = 'AWAITING_AUTH';
        timelineMessage = 'Awaiting user authentication in dialer';
      }
      break;

    case 'REPORT_PROCESSING':
      if (session.state === 'AWAITING_AUTH') {
        nextState = 'PROCESSING';
        timelineMessage = 'Processing transaction in dialer';
      }
      break;

    case 'REPORT_SUCCESS':
      nextState = 'SUCCESS';
      timelineMessage = event.payload?.evidence
        ? `Payment successful (Evidence: ${event.payload.evidence})`
        : 'Payment confirmed successful';
      source = 'carrier';
      break;

    case 'REPORT_FAILED':
      nextState = 'FAILED';
      timelineMessage = event.payload?.reason || 'Payment failed';
      source = 'carrier';
      break;

    case 'REPORT_UNKNOWN':
      nextState = 'UNKNOWN';
      timelineMessage = event.payload?.reason || 'Payment outcome uncertain';
      source = 'user';
      break;

    case 'TIMEOUT_INACTIVITY':
      nextState = 'UNKNOWN';
      timelineMessage = 'Inactivity timeout (12s) — Payment outcome marked UNKNOWN for safety';
      source = 'timeout';
      break;

    case 'TIMEOUT_HARD_CAP':
      nextState = 'UNKNOWN';
      timelineMessage = 'Hard cap timeout (90s) — Payment session capped as UNKNOWN';
      source = 'timeout';
      break;

    default:
      break;
  }

  if (nextState === session.state && !timelineMessage) {
    // Transition was invalid or not applicable
    return session;
  }

  return {
    ...session,
    state: nextState,
    updatedAt: event.timestamp,
    route: event.payload?.route || session.route,
    resultMessage: timelineMessage,
    rawResultText: event.payload?.evidence || event.payload?.reason || session.rawResultText,
    timeline: [
      ...session.timeline,
      {
        state: nextState,
        timestamp: event.timestamp,
        message: timelineMessage,
        source,
      },
    ],
  };
}

// Factory helper
export function createSession(params: {
  payeeVpa: string;
  payeeName: string;
  amount: string;
  amountPaise?: number;
  note?: string;
  route?: string;
  now?: number;
}): PaymentSession {
  const timestamp = params.now ?? Date.now();
  return {
    id: `session_${timestamp}_${Math.random().toString(36).substring(2, 8)}`,
    payeeVpa: params.payeeVpa,
    payeeName: params.payeeName,
    amount: params.amount,
    amountPaise: params.amountPaise,
    note: params.note || '',
    route: params.route || 'USSD_GUIDED',
    state: 'CREATED',
    timeline: [{ state: 'CREATED', timestamp, message: 'Payment session created', source: 'system' }],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

// Backward compatibility helper
export function transitionSession(
  session: PaymentSession,
  newState: SessionState,
  message?: string,
  now?: number
): PaymentSession {
  const timestamp = now ?? Date.now();

  let eventType: SessionEventType = 'REPORT_UNKNOWN';
  if (newState === 'VALIDATED') eventType = 'VALIDATE';
  else if (newState === 'ROUTE_SELECTED') eventType = 'SELECT_ROUTE';
  else if (newState === 'HANDOFF') eventType = 'HANDOFF';
  else if (newState === 'AWAITING_AUTH') eventType = 'AWAIT_AUTH';
  else if (newState === 'PROCESSING') eventType = 'REPORT_PROCESSING';
  else if (newState === 'SUCCESS') eventType = 'REPORT_SUCCESS';
  else if (newState === 'FAILED') eventType = 'REPORT_FAILED';
  else if (newState === 'UNKNOWN') eventType = 'REPORT_UNKNOWN';

  // If in UNKNOWN and transitioning to SUCCESS/FAILED, treat as manual resolution
  if (session.state === 'UNKNOWN' && (newState === 'SUCCESS' || newState === 'FAILED')) {
    return reduceSession(session, {
      type: 'MANUAL_RESOLUTION',
      sessionId: session.id,
      timestamp,
      payload: {
        resolution: newState === 'SUCCESS' ? 'CONFIRMED' : 'NOT_PAID',
        reason: message,
      },
    });
  }

  return reduceSession(session, {
    type: eventType,
    sessionId: session.id,
    timestamp,
    payload: {
      reason: message,
      evidence: message,
    },
  });
}

export function isDuplicatePayment(
  session: PaymentSession,
  existingSessions: PaymentSession[],
  windowMs: number = 10 * 60 * 1000
): boolean {
  const now = Date.now();
  return existingSessions.some(
    (s) =>
      s.id !== session.id &&
      s.payeeVpa.toLowerCase() === session.payeeVpa.toLowerCase() &&
      s.amount === session.amount &&
      (s.state === 'UNKNOWN' || !isTerminal(s.state)) &&
      now - s.createdAt < windowMs
  );
}

export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}
