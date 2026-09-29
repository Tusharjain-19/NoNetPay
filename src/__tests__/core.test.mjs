// Automated Test Suite for NoNetPay Core Domain
// Validates pure TypeScript core against shared test vectors
// Aligns with ARCHITECTURE.md 1, 6, 11

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  createMoneyFromPaise,
  createMoneyFromRupees,
  formatMoney,
  formatMoneyDisplay,
  validateVpa,
} from '../core/valueTypes.ts';

import { parseUPILink, escapeHtml, sanitize, getPayeeInitials } from '../core/qr.ts';
import { FailureMapper } from '../core/failureMapper.ts';
import {
  createSession,
  reduceSession,
  isTerminal,
} from '../core/session.ts';
import { checkDuplicatePayment } from '../core/duplicateGuard.ts';

console.log('─── Starting NoNetPay Core Test Suite ───\n');

let passedTests = 0;
let failedTests = 0;

function it(description, fn) {
  try {
    fn();
    console.log(`  ✓ ${description}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${description}`);
    console.error(`    ${err.message}`);
    failedTests++;
  }
}

// ── 1. Value Types & Money Arithmetic ──
console.log('Test Suite 1: Value Types & Money');

it('correctly converts rupees to integer paise without floating point inaccuracy', () => {
  assert.equal(createMoneyFromRupees('10.50').amountPaise, 1050);
  assert.equal(createMoneyFromRupees('0.99').amountPaise, 99);
  assert.equal(createMoneyFromRupees(150.00).amountPaise, 15000);
  assert.equal(createMoneyFromRupees('-5').amountPaise, 0);
  assert.equal(createMoneyFromRupees('invalid').amountPaise, 0);
});

it('correctly formats money into rupee display strings', () => {
  assert.equal(formatMoney({ amountPaise: 1050 }), '10.50');
  assert.equal(formatMoney({ amountPaise: 15000 }), '150');
  assert.equal(formatMoneyDisplay({ amountPaise: 2500 }), '₹25');
  assert.equal(formatMoneyDisplay({ amountPaise: 2575 }), '₹25.75');
});

it('validates VPA formats properly', () => {
  assert.equal(validateVpa('user@okhdfcbank'), true);
  assert.equal(validateVpa('merchant.123@icici'), true);
  assert.equal(validateVpa('store_branch@sbi'), true);
  assert.equal(validateVpa('invalid-vpa-no-handle'), false);
  assert.equal(validateVpa('bad@vpa@double'), false);
  assert.equal(validateVpa(''), false);
});

// ── 2. Shared QR Test Vectors ──
console.log('\nTest Suite 2: QR Parser & Shared Vectors');

const qrVectors = JSON.parse(
  readFileSync(resolve(process.cwd(), '../shared/test-vectors/qr.json'), 'utf8')
);

qrVectors.cases.forEach((testCase, idx) => {
  it(`Vector #${idx + 1}: ${testCase.name}`, () => {
    const result = parseUPILink(testCase.input);
    assert.equal(result.success, testCase.expectedValid, `Valid flag mismatch for: ${testCase.input}`);

    if (testCase.expectedValid && result.success) {
      if (testCase.expectedVpa) {
        assert.equal(result.data.pa, testCase.expectedVpa);
      }
      if (testCase.expectedPayeeName) {
        assert.equal(result.data.pn, testCase.expectedPayeeName);
      }
      if (testCase.expectedAmountPaise !== undefined && testCase.expectedAmountPaise !== null) {
        assert.equal(result.data.amountPaise, testCase.expectedAmountPaise);
      }
      if (testCase.expectedQrType) {
        assert.equal(result.classification.type, testCase.expectedQrType);
      }
    } else if (!testCase.expectedValid && !result.success) {
      if (testCase.expectedReason) {
        assert.equal(result.error, testCase.expectedReason);
      }
    }
  });
});

it('parseUPILink never throws on arbitrary malformed or huge strings', () => {
  const hugeString = 'upi://pay?' + 'a'.repeat(5000);
  assert.doesNotThrow(() => parseUPILink(hugeString));
  assert.doesNotThrow(() => parseUPILink(null));
  assert.doesNotThrow(() => parseUPILink(undefined));
  assert.doesNotThrow(() => parseUPILink('<script>alert("xss")</script>'));
});

it('HTML escaping prevents XSS injection', () => {
  const dangerous = '<img src=x onerror=alert(1)> & "quotes"';
  const escaped = escapeHtml(dangerous);
  assert.equal(escaped.includes('<img'), false);
  assert.equal(escaped.includes('&lt;img'), true);
  assert.equal(escaped.includes('&quot;'), true);
});

it('getPayeeInitials returns clean uppercase 2-letter badge', () => {
  assert.equal(getPayeeInitials('Sharma General Store'), 'SS');
  assert.equal(getPayeeInitials('Suresh'), 'SU');
  assert.equal(getPayeeInitials(''), '₹');
});

// ── 3. Shared Failure Mapper Test Vectors ──
console.log('\nTest Suite 3: Failure Mapper & Result Evaluation');

const failureVectors = JSON.parse(
  readFileSync(resolve(process.cwd(), '../shared/test-vectors/failures.json'), 'utf8')
);

const mapper = new FailureMapper();

failureVectors.cases.forEach((testCase, idx) => {
  it(`Failure Vector #${idx + 1}: ${testCase.name}`, () => {
    const res = mapper.evaluate(testCase.raw);
    assert.equal(res.outcome, testCase.expectedStatus, `Expected ${testCase.expectedStatus} for: "${testCase.raw}"`);
    if (testCase.expectedHumanKey) {
      assert.equal(res.humanKey, testCase.expectedHumanKey);
    }
  });
});

// ── 4. Shared Session State Machine Test Vectors ──
console.log('\nTest Suite 4: Session State Machine & Reducer');

const sessionVectors = JSON.parse(
  readFileSync(resolve(process.cwd(), '../shared/test-vectors/sessions.json'), 'utf8')
);

it('executes valid state machine progression: CREATED -> VALIDATED -> ROUTE_SELECTED -> HANDOFF -> AWAITING_AUTH -> SUCCESS', () => {
  const s0 = createSession({ payeeVpa: 'store@sbi', payeeName: 'Store', amount: '100' });
  assert.equal(s0.state, 'CREATED');

  const s1 = reduceSession(s0, { type: 'VALIDATE', sessionId: s0.id, timestamp: Date.now() });
  assert.equal(s1.state, 'VALIDATED');

  const s2 = reduceSession(s1, { type: 'SELECT_ROUTE', sessionId: s1.id, timestamp: Date.now(), payload: { route: 'USSD_GUIDED' } });
  assert.equal(s2.state, 'ROUTE_SELECTED');

  const s3 = reduceSession(s2, { type: 'HANDOFF', sessionId: s2.id, timestamp: Date.now() });
  assert.equal(s3.state, 'HANDOFF');

  const s4 = reduceSession(s3, { type: 'AWAIT_AUTH', sessionId: s3.id, timestamp: Date.now() });
  assert.equal(s4.state, 'AWAITING_AUTH');

  const s5 = reduceSession(s4, { type: 'REPORT_SUCCESS', sessionId: s4.id, timestamp: Date.now(), payload: { evidence: 'Paid' } });
  assert.equal(s5.state, 'SUCCESS');
  assert.equal(isTerminal(s5.state), true);
});

it('terminal states (SUCCESS / FAILED) are strictly immutable', () => {
  const s0 = createSession({ payeeVpa: 'store@sbi', payeeName: 'Store', amount: '100' });
  const successSession = reduceSession(
    reduceSession(s0, { type: 'VALIDATE', sessionId: s0.id, timestamp: Date.now() }),
    { type: 'REPORT_SUCCESS', sessionId: s0.id, timestamp: Date.now() }
  );
  assert.equal(successSession.state, 'SUCCESS');

  // Attempt illegal change to FAILED
  const mutated = reduceSession(successSession, {
    type: 'REPORT_FAILED',
    sessionId: s0.id,
    timestamp: Date.now(),
    payload: { reason: 'Illegal rewrite attempt' },
  });

  assert.equal(mutated.state, 'SUCCESS', 'SUCCESS state must remain unchanged');
  assert.equal(mutated.illegalAttempts?.length, 1);
});

it('UNKNOWN can only be resolved via MANUAL_RESOLUTION', () => {
  const s0 = createSession({ payeeVpa: 'store@sbi', payeeName: 'Store', amount: '100' });
  const unknownSession = reduceSession(s0, {
    type: 'REPORT_UNKNOWN',
    sessionId: s0.id,
    timestamp: Date.now(),
    payload: { reason: 'Uncertain dialer outcome' },
  });
  assert.equal(unknownSession.state, 'UNKNOWN');

  // Try standard event (must be rejected)
  const rejected = reduceSession(unknownSession, {
    type: 'REPORT_SUCCESS',
    sessionId: s0.id,
    timestamp: Date.now(),
  });
  assert.equal(rejected.state, 'UNKNOWN');

  // Perform legal MANUAL_RESOLUTION
  const resolved = reduceSession(unknownSession, {
    type: 'MANUAL_RESOLUTION',
    sessionId: s0.id,
    timestamp: Date.now(),
    payload: { resolution: 'CONFIRMED', note: 'Checked bank SMS' },
  });
  assert.equal(resolved.state, 'SUCCESS');
  assert.equal(resolved.resolution, 'CONFIRMED');
});

// ── 5. Duplicate Guard ──
console.log('\nTest Suite 5: Duplicate Payment Guard');

it('flags duplicate payment if unresolved session exists within 10 minutes', () => {
  const now = Date.now();
  const pastSession = createSession({
    payeeVpa: 'merchant@upi',
    payeeName: 'Merchant',
    amount: '250',
    now: now - 3 * 60 * 1000, // 3 minutes ago
  });
  pastSession.state = 'UNKNOWN';

  const check = checkDuplicatePayment(
    { payeeVpa: 'merchant@upi', amount: '250' },
    [pastSession],
    10 * 60 * 1000,
    now
  );

  assert.equal(check.isDuplicate, true);
  assert.equal(check.conflictingSession?.id, pastSession.id);
});

it('does not flag duplicate if window has expired (> 10 mins)', () => {
  const now = Date.now();
  const pastSession = createSession({
    payeeVpa: 'merchant@upi',
    payeeName: 'Merchant',
    amount: '250',
    now: now - 15 * 60 * 1000, // 15 minutes ago
  });
  pastSession.state = 'UNKNOWN';

  const check = checkDuplicatePayment(
    { payeeVpa: 'merchant@upi', amount: '250' },
    [pastSession],
    10 * 60 * 1000,
    now
  );

  assert.equal(check.isDuplicate, false);
});

it('does not flag duplicate if payee or amount differs', () => {
  const now = Date.now();
  const pastSession = createSession({
    payeeVpa: 'merchant@upi',
    payeeName: 'Merchant',
    amount: '250',
    now: now - 2 * 60 * 1000,
  });
  pastSession.state = 'UNKNOWN';

  const checkDiffPayee = checkDuplicatePayment(
    { payeeVpa: 'other@upi', amount: '250' },
    [pastSession],
    10 * 60 * 1000,
    now
  );
  assert.equal(checkDiffPayee.isDuplicate, false);

  const checkDiffAmount = checkDuplicatePayment(
    { payeeVpa: 'merchant@upi', amount: '500' },
    [pastSession],
    10 * 60 * 1000,
    now
  );
  assert.equal(checkDiffAmount.isDuplicate, false);
});

// ── Summary ──
console.log('\n═══════════════════════════════════════════');
console.log(`Test Execution Finished: ${passedTests} Passed, ${failedTests} Failed.`);
console.log('═══════════════════════════════════════════\n');

if (failedTests > 0) {
  process.exit(1);
}
