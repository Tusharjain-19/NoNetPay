// UPI QR Parser & Classifier — pure TypeScript, no dependencies
// Aligns with ARCHITECTURE.md 6.2 & PRD 7.1

import {
  type PaymentRequest,
  type QrType,
  validateVpa,
  createMoneyFromRupees,
} from './valueTypes';

export type { QrType, PaymentRequest };

export interface QRClassification {
  type: QrType;
  reason: string;
}

export interface ParsedUPI {
  pa: string;        // payee VPA
  pn: string;        // payee name
  am: string;        // amount (string format for UI inputs)
  amountPaise?: number; // integer paise
  tn: string;        // transaction note
  tr: string;        // transaction reference
  mc: string;        // merchant code
  cu: string;        // currency (default INR)
  raw: string;       // original input
}

export interface ParseSuccess {
  success: true;
  data: ParsedUPI;
  request: PaymentRequest;
  classification: QRClassification;
  warnings: string[];
}

export interface ParseFailure {
  success: false;
  warnings: string[];
  error: string;
}

export type ParseResult = ParseSuccess | ParseFailure;

// Strip RTL override, invisible, and control characters to prevent spoofing
export function sanitize(str: string): string {
  return str
    .replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069\u200B-\u200D\uFEFF\u0000-\u001F\u007F]/g, '')
    .trim();
}

// Escape HTML for safe rendering
export function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function getPayeeInitials(name?: string): string {
  if (!name || !name.trim()) return '₹';
  const clean = sanitize(name);
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function isValidAmount(amountStr: string): boolean {
  if (!amountStr) return true;
  const num = parseFloat(amountStr);
  return !isNaN(num) && num > 0 && num <= 100000 && /^\d+(\.\d{1,2})?$/.test(amountStr);
}

export function parseUPILink(input: string): ParseResult {
  const warnings: string[] = [];

  if (!input || typeof input !== 'string') {
    return { success: false, warnings, error: 'Empty input' };
  }

  const trimmed = sanitize(input);

  if (trimmed.length > 2000) {
    return { success: false, warnings, error: 'Input too long' };
  }

  // Check if direct raw VPA was entered
  if (validateVpa(trimmed)) {
    const data: ParsedUPI = {
      pa: trimmed.toLowerCase(),
      pn: '',
      am: '',
      tn: '',
      tr: '',
      mc: '',
      cu: 'INR',
      raw: input,
    };
    const request: PaymentRequest = {
      vpa: data.pa,
      currency: 'INR',
      qrType: 'STATIC',
      rawUri: input,
    };
    return {
      success: true,
      data,
      request,
      classification: { type: 'STATIC', reason: 'Direct VPA input without fixed amount' },
      warnings,
    };
  }

  // Check for upi:// scheme (case-insensitive)
  const upiMatch = trimmed.match(/^upi:\/\/pay\?(.+)$/i);
  if (!upiMatch) {
    return { success: false, warnings, error: 'Not a valid UPI link or VPA' };
  }

  const queryString = upiMatch[1];
  const params = new URLSearchParams(queryString);

  const getParam = (key: string): string => {
    for (const [k, v] of params.entries()) {
      if (k.toLowerCase() === key.toLowerCase()) {
        try {
          return sanitize(decodeURIComponent(v.replace(/\+/g, ' ')));
        } catch {
          return sanitize(v);
        }
      }
    }
    return '';
  };

  const pa = getParam('pa');
  const pn = getParam('pn');
  const am = getParam('am');
  const tn = getParam('tn');
  const tr = getParam('tr');
  const mc = getParam('mc');
  const cu = getParam('cu') || 'INR';

  if (!pa) {
    return { success: false, warnings, error: 'Missing payee address (pa)' };
  }

  if (!validateVpa(pa)) {
    return { success: false, warnings, error: 'Invalid payee VPA format' };
  }

  if (am && !isValidAmount(am)) {
    return { success: false, warnings, error: 'Invalid amount' };
  }

  if (pn.length > 100) {
    warnings.push('Payee name was truncated');
  }

  if (cu && cu.toUpperCase() !== 'INR') {
    warnings.push(`Non-INR currency: ${cu}`);
  }

  // Classify QR:
  // If transaction reference 'tr' is present or note contains order/bill terms, it's dynamic order-linked
  let qrType: QrType = 'STATIC';
  let classifyReason = 'Standard static merchant or peer UPI QR';

  if (tr || (am && (params.has('tid') || /order|bill|invoice|table/i.test(tn)))) {
    qrType = 'DYNAMIC_ORDER';
    classifyReason = 'Order-specific dynamic QR code linked to a checkout session or bill';
  }

  const parsedAmountPaise = am ? createMoneyFromRupees(am).amountPaise : undefined;

  const data: ParsedUPI = {
    pa: pa.toLowerCase(),
    pn: pn.slice(0, 100),
    am: am || '',
    amountPaise: parsedAmountPaise,
    tn: tn.slice(0, 200),
    tr: tr.slice(0, 100),
    mc: mc.slice(0, 30),
    cu: cu.toUpperCase(),
    raw: input,
  };

  const request: PaymentRequest = {
    vpa: data.pa,
    payeeName: data.pn || undefined,
    amountPaise: parsedAmountPaise,
    note: data.tn || undefined,
    txnRef: data.tr || undefined,
    merchantCode: data.mc || undefined,
    currency: data.cu,
    qrType,
    rawUri: input,
  };

  return {
    success: true,
    data,
    request,
    classification: { type: qrType, reason: classifyReason },
    warnings,
  };
}
