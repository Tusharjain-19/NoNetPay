// Value types — pure TypeScript, no dependencies
// Aligns with ARCHITECTURE.md 6.1

export type QrType = 'STATIC' | 'DYNAMIC_ORDER' | 'UNSUPPORTED';

export type SessionState =
  | 'CREATED'
  | 'VALIDATED'
  | 'ROUTE_SELECTED'
  | 'HANDOFF'
  | 'AWAITING_AUTH'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'FAILED'
  | 'UNKNOWN';

export type RouteId = 'ONLINE_UPI' | 'USSD_GUIDED';

export interface Money {
  amountPaise: number; // Integer, never floating point
}

export function createMoneyFromPaise(amountPaise: number): Money {
  return { amountPaise: Math.round(amountPaise) };
}

export function createMoneyFromRupees(rupees: number | string): Money {
  const num = typeof rupees === 'string' ? parseFloat(rupees) : rupees;
  if (isNaN(num) || num < 0) {
    return { amountPaise: 0 };
  }
  return { amountPaise: Math.round(num * 100) };
}

export function formatMoney(money: Money): string {
  const rupees = (money.amountPaise / 100).toFixed(2);
  // Strip trailing zeros if integer
  return rupees.endsWith('.00') ? rupees.slice(0, -3) : rupees;
}

export function formatMoneyDisplay(money: Money): string {
  return `₹${formatMoney(money)}`;
}

export interface Vpa {
  value: string;
}

export function validateVpa(value: string): boolean {
  if (!value || value.length > 100) return false;
  // Standard UPI handle format: username@psp
  return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(value.trim());
}

export interface PaymentRequest {
  vpa: string;
  payeeName?: string;
  amountPaise?: number; // Integer paise if prefilled
  note?: string;
  txnRef?: string;
  merchantCode?: string;
  currency: string;
  qrType: QrType;
  rawUri: string;
}
