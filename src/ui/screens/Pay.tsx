import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../i18n';
import { useApp } from '../../store/AppContext';
import {
  createSession,
  transitionSession,
  reduceSession,
  type PaymentSession,
} from '../../core/session';
import { escapeHtml, getPayeeInitials } from '../../core/qr';
import { defaultRouteSelector } from '../../core/routes';
import { checkDuplicatePayment } from '../../core/duplicateGuard';
import { defaultClipboard, defaultHaptics } from '../../adapters';
import banksData from '../../content/banks.json';
import { CopyIcon, PhoneIcon, AlertCircleIcon, ShieldIcon, CheckCircleIcon } from '../Icons';
import './Pay.css';

export const PayScreen: React.FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const {
    scannedData,
    qrClassification,
    activeSession,
    setActiveSession,
    history,
    selectedBank,
    showToast,
    addToHistory,
  } = useApp();

  const [amount, setAmount] = useState(scannedData?.am || '');
  const [note, setNote] = useState(scannedData?.tn || '');
  const [step, setStep] = useState<'confirm' | 'guided' | 'result-prompt'>('confirm');
  const [copied, setCopied] = useState(false);
  const [currentGuideStep, setCurrentGuideStep] = useState(0);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [activeRouteReason, setActiveRouteReason] = useState<string>('');

  const isOnline = navigator.onLine;
  const hardCapTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!scannedData && !activeSession) {
      navigate('/app/scan');
    }
  }, [scannedData, activeSession, navigate]);

  // Route selector evaluation
  useEffect(() => {
    defaultRouteSelector
      .selectRoute({
        isOnline: navigator.onLine,
        hasDialer: true,
        selectedBank,
      })
      .then((res) => {
        setActiveRouteReason(res.reason);
      });
  }, [isOnline, selectedBank]);

  // Check for duplicate payments whenever amount or payee changes
  useEffect(() => {
    if (scannedData && amount && parseFloat(amount) > 0) {
      const existingSessions = history.map((h) => h.session);
      const dupCheck = checkDuplicatePayment(
        {
          payeeVpa: scannedData.pa,
          amount,
        },
        existingSessions
      );

      if (dupCheck.isDuplicate && dupCheck.reason) {
        setDuplicateWarning(dupCheck.reason);
      } else {
        setDuplicateWarning(null);
      }
    }
  }, [scannedData, amount, history]);

  // Listen for visibility change (user returning from dialer)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && step === 'guided') {
        setStep('result-prompt');
        defaultHaptics.warning();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [step]);

  // Hard-cap 90s safety timer: if in guided/awaiting auth too long, default to UNKNOWN
  useEffect(() => {
    if (step === 'guided' && activeSession) {
      hardCapTimerRef.current = window.setTimeout(() => {
        if (step === 'guided') {
          showToast('Payment time limit reached. Verify outcome carefully.', 'info');
          setStep('result-prompt');
        }
      }, 90000);
    }
    return () => {
      if (hardCapTimerRef.current) {
        window.clearTimeout(hardCapTimerRef.current);
      }
    };
  }, [step, activeSession, showToast]);

  const handleCopyUPI = useCallback(async () => {
    if (!scannedData) return;
    const ok = await defaultClipboard.writeText(scannedData.pa);
    if (ok) {
      setCopied(true);
      defaultHaptics.success();
      showToast(t.pay.copied, 'success');
      setTimeout(() => setCopied(false), 2000);
    } else {
      showToast('Unable to copy UPI ID', 'error');
    }
  }, [scannedData, showToast, t]);

  const proceedWithPaymentSession = useCallback(() => {
    if (!scannedData || !amount) return;

    let session = createSession({
      payeeVpa: scannedData.pa,
      payeeName: scannedData.pn,
      amount,
      note,
      route: isOnline ? 'ONLINE_UPI' : 'USSD_GUIDED',
    });

    session = transitionSession(session, 'VALIDATED', 'Payment details validated');
    session = transitionSession(
      session,
      'ROUTE_SELECTED',
      isOnline ? 'Online UPI selected' : 'USSD Guided selected'
    );
    session = transitionSession(session, 'HANDOFF', 'Handed off to phone dialer');
    session = transitionSession(session, 'AWAITING_AUTH', 'Waiting for user to complete in dialer');

    setActiveSession(session);
    setStep('guided');
  }, [scannedData, amount, note, isOnline, setActiveSession]);

  const handleStartPayment = useCallback(() => {
    if (duplicateWarning) {
      setShowDuplicateModal(true);
    } else {
      proceedWithPaymentSession();
    }
  }, [duplicateWarning, proceedWithPaymentSession]);

  const handleResult = useCallback(
    (result: 'yes' | 'no' | 'not-sure') => {
      if (!activeSession) return;

      let session = activeSession;
      try {
        if (result === 'yes') {
          session = reduceSession(session, {
            type: 'REPORT_SUCCESS',
            sessionId: session.id,
            timestamp: Date.now(),
            payload: { evidence: 'User confirmed in-app after dialer completion' },
          });
        } else if (result === 'no') {
          session = reduceSession(session, {
            type: 'REPORT_FAILED',
            sessionId: session.id,
            timestamp: Date.now(),
            payload: { reason: 'User reported transaction failed or was cancelled' },
          });
        } else {
          session = reduceSession(session, {
            type: 'REPORT_UNKNOWN',
            sessionId: session.id,
            timestamp: Date.now(),
            payload: { reason: 'User unsure about payment status. Verification required.' },
          });
        }
      } catch { /* ignore transition errors */ }

      addToHistory(session);
      navigate('/app/result', { state: { session } });
    },
    [activeSession, addToHistory, navigate]
  );

  if (!scannedData && !activeSession) return null;

  const currentPayee = scannedData || (activeSession ? {
    pa: activeSession.payeeVpa,
    pn: activeSession.payeeName,
    am: activeSession.amount,
    tn: activeSession.note,
  } : null);

  if (!currentPayee) return null;

  // Retrieve bank-specific menu steps if available
  const bankConfig = selectedBank ? banksData.banks.find((b) => b.id === selectedBank) : null;
  const guideSteps = bankConfig?.ussd?.menuSteps || [
    t.guided.step1,
    t.guided.step2,
    t.guided.step3,
    t.guided.step4,
    t.guided.step5,
    t.guided.step6,
  ];

  return (
    <div className="pay" id="pay-screen">
      {/* ── Confirm View ── */}
      {step === 'confirm' && (
        <div className="pay__confirm page-enter">
          <h1 className="pay__title">{t.pay.title}</h1>

          {/* Payee Card */}
          <div className="payee-card stagger-item" id="payee-card">
            <div className="payee-card__avatar">{getPayeeInitials(currentPayee.pn)}</div>
            <div className="payee-card__info">
              <div className="payee-card__name">{escapeHtml(currentPayee.pn) || 'Verified Payee'}</div>
              <div className="payee-card__vpa">{escapeHtml(currentPayee.pa)}</div>
            </div>
          </div>

          {/* QR Type Badge */}
          {qrClassification && (
            <div
              className={`pay__qr-badge stagger-item ${
                qrClassification.type === 'DYNAMIC_ORDER' ? 'pay__qr-badge--warn' : ''
              }`}
            >
              <span>{qrClassification.type === 'STATIC' ? t.pay.qrStatic : t.pay.qrDynamic}</span>
              {qrClassification.type === 'DYNAMIC_ORDER' && (
                <p className="pay__qr-warn">{t.pay.qrDynamicWarning}</p>
              )}
            </div>
          )}

          {/* Amount Input */}
          <div className="pay__amount-section stagger-item">
            <label className="pay__amount-label">{t.pay.amount}</label>
            <div className="pay__amount-input-wrap">
              <span className="pay__amount-symbol">₹</span>
              <input
                type="number"
                className="pay__amount-input"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={!!scannedData?.am}
                id="amount-input"
                inputMode="decimal"
                min="1"
                max="100000"
              />
            </div>
          </div>

          {/* Note Input */}
          <div className="input-group stagger-item">
            <label className="input-group__label">{t.pay.note}</label>
            <input
              type="text"
              className="input-field"
              placeholder={t.pay.notePlaceholder}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              id="note-input"
              maxLength={200}
            />
          </div>

          {/* Route Chip */}
          <div className="pay__route stagger-item" id="route-chip">
            <div className="route-chip">
              <div className="route-chip__bars">
                <div className="route-chip__bar" style={{ height: '4px' }} />
                <div className="route-chip__bar" style={{ height: '7px' }} />
                <div className="route-chip__bar" style={{ height: '10px', opacity: isOnline ? 1 : 0.3 }} />
                <div className="route-chip__bar" style={{ height: '12px', opacity: isOnline ? 1 : 0.3 }} />
              </div>
              <span>{isOnline ? t.pay.routeOnline : `${t.pay.routeOffline} • ${t.pay.routeUssdGuided}`}</span>
            </div>
            {activeRouteReason && (
              <p style={{ fontSize: '0.8rem', color: 'var(--color-ink-muted)', marginTop: '4px' }}>
                {activeRouteReason}
              </p>
            )}
          </div>

          {/* Duplicate Warning in form */}
          {duplicateWarning && (
            <div className="info-banner info-banner--warning stagger-item" id="duplicate-warning">
              <AlertCircleIcon size={18} />
              <span>{duplicateWarning}</span>
            </div>
          )}

          {/* Pay Button */}
          <button
            className="btn btn--primary btn--large btn--full stagger-item"
            onClick={handleStartPayment}
            disabled={!amount || parseFloat(amount) <= 0}
            id="pay-now-btn"
          >
            {t.pay.payNow} — ₹{amount || '0'}
          </button>

          {/* Security Notice */}
          <div className="pay__security stagger-item">
            <ShieldIcon size={14} color="var(--color-ink-muted)" />
            <span>{t.guided.neverEnterPin}</span>
          </div>
        </div>
      )}

      {/* ── Guided Flow View ── */}
      {step === 'guided' && (
        <div className="pay__guided page-enter">
          <h1 className="pay__title">{t.guided.title}</h1>

          {/* Amount Reminder */}
          <div className="pay__guided-amount card card--accent">
            <span className="pay__guided-amount-label">{t.guided.amountToPay}</span>
            <div className="amount-display">
              <span className="amount-display__symbol">₹</span>
              {amount}
            </div>
            <div className="payee-card__vpa" style={{ marginTop: '4px', fontSize: '0.9rem' }}>
              to {currentPayee.pn || currentPayee.pa}
            </div>
          </div>

          {/* Action 1: Copy Payee UPI ID */}
          <button className="btn btn--secondary btn--full" onClick={handleCopyUPI} id="copy-upi-btn">
            <CopyIcon size={18} />
            {copied ? t.pay.copied : `${t.pay.copyUpiId}: ${currentPayee.pa}`}
          </button>

          {/* Action 2: Open Phone Dialer with *99# */}
          <a
            href="tel:*99%23"
            className="btn btn--primary btn--large btn--full"
            id="open-dialer-btn"
            onClick={() => defaultHaptics.success()}
          >
            <PhoneIcon size={20} color="white" />
            {t.pay.openDialer} (*99#)
          </a>

          {/* Fallback button if tel: link does not trigger */}
          <button
            className="btn btn--ghost btn--full"
            onClick={async () => {
              await defaultClipboard.writeText('*99#');
              showToast('*99# copied to clipboard!', 'success');
            }}
            id="dialer-fallback-btn"
          >
            {t.pay.dialerFallback}
          </button>

          {/* Bank specific interactive steps */}
          <div className="pay__guide-steps card">
            <div style={{ padding: '8px 12px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-ink-muted)', borderBottom: '1px solid var(--color-border)' }}>
              {bankConfig ? `${bankConfig.name} USSD Steps:` : 'NUUP *99# Steps:'}
            </div>
            {guideSteps.map((stepText, i) => (
              <div
                key={i}
                className={`pay__guide-step ${i === currentGuideStep ? 'pay__guide-step--active' : ''} ${
                  i < currentGuideStep ? 'pay__guide-step--done' : ''
                }`}
                onClick={() => setCurrentGuideStep(i)}
              >
                <div className="pay__guide-step-num">{i + 1}</div>
                <span className="pay__guide-step-text">{stepText}</span>
                {stepText.toLowerCase().includes('pin') && (
                  <span className="pay__guide-step-warn">⚠ In dialer only</span>
                )}
              </div>
            ))}
          </div>

          {/* Security warning banner */}
          <div className="info-banner info-banner--warning">
            <ShieldIcon size={18} />
            <span>{t.guided.neverEnterPin}</span>
          </div>

          {/* Explicit manual transition when returning from dialer */}
          <button
            className="btn btn--secondary btn--full"
            onClick={() => setStep('result-prompt')}
            id="done-with-dialer-btn"
          >
            I finished dialing → Record Outcome
          </button>
        </div>
      )}

      {/* ── Result Prompt View ── */}
      {step === 'result-prompt' && (
        <div className="pay__result-prompt page-enter">
          <h1 className="pay__title">{t.guided.returnPrompt}</h1>

          <div className="pay__guided-amount card card--accent">
            <span className="pay__guided-amount-label">{t.guided.amountToPay}</span>
            <div className="amount-display">
              <span className="amount-display__symbol">₹</span>
              {amount}
            </div>
            <div className="payee-card__vpa" style={{ marginTop: '8px' }}>
              → {currentPayee.pn || currentPayee.pa}
            </div>
          </div>

          <p className="pay__result-question">{t.guided.didItWork}</p>

          <div className="pay__result-options">
            <button
              className="btn btn--primary btn--full pay__result-btn pay__result-btn--success"
              onClick={() => handleResult('yes')}
              id="result-yes-btn"
            >
              <CheckCircleIcon size={18} /> {t.guided.yes}
            </button>
            <button
              className="btn btn--secondary btn--full pay__result-btn pay__result-btn--failed"
              onClick={() => handleResult('no')}
              id="result-no-btn"
            >
              {t.guided.no}
            </button>
            <button
              className="btn btn--ghost btn--full pay__result-btn pay__result-btn--unknown"
              onClick={() => handleResult('not-sure')}
              id="result-unsure-btn"
            >
              <AlertCircleIcon size={18} /> {t.guided.notSure}
            </button>
          </div>
        </div>
      )}

      {/* ── Duplicate Payment Guard Modal ── */}
      {showDuplicateModal && (
        <div className="modal-backdrop page-enter" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="card card--elevated" style={{ maxWidth: '420px', width: '100%', padding: '24px', background: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#D97706', marginBottom: '12px' }}>
              <AlertCircleIcon size={28} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Possible Duplicate Payment</h2>
            </div>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.5', color: 'var(--color-ink-muted)', marginBottom: '16px' }}>
              {duplicateWarning}
            </p>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '20px' }}>
              To avoid paying twice, check your account balance first before re-trying.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                className="btn btn--secondary btn--full"
                onClick={() => {
                  setShowDuplicateModal(false);
                  navigate('/app/balance');
                }}
              >
                Check Bank Balance First
              </button>
              <button
                className="btn btn--primary btn--full"
                onClick={() => {
                  setShowDuplicateModal(false);
                  proceedWithPaymentSession();
                }}
              >
                Continue Anyway
              </button>
              <button
                className="btn btn--ghost btn--full"
                onClick={() => setShowDuplicateModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
