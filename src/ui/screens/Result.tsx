import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useI18n } from '../../i18n';
import { useApp } from '../../store/AppContext';
import { reduceSession, type PaymentSession } from '../../core/session';
import { CheckCircleIcon, XCircleIcon, AlertCircleIcon, ShareIcon, ShieldIcon } from '../Icons';
import './Result.css';

export const ResultScreen: React.FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast, addToHistory, balance } = useApp();

  const initialSession = (location.state as { session: PaymentSession })?.session;
  const [session, setSession] = useState<PaymentSession | null>(initialSession || null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [showResolutionForm, setShowResolutionForm] = useState(false);

  if (!session) {
    navigate('/app');
    return null;
  }

  const isSuccess = session.state === 'SUCCESS';
  const isFailed = session.state === 'FAILED';
  const isUnknown = session.state === 'UNKNOWN';

  const handleShare = async () => {
    const receiptText = [
      `NoNetPay Payment Receipt`,
      `──────────────`,
      `To: ${session.payeeName || session.payeeVpa}`,
      `VPA: ${session.payeeVpa}`,
      `Amount: ₹${session.amount}`,
      `Status: ${session.state}`,
      session.resolution ? `Resolution: ${session.resolution}` : '',
      `Date: ${new Date(session.createdAt).toLocaleString()}`,
      `Route: ${session.route}`,
      session.note ? `Note: ${session.note}` : '',
      `──────────────`,
      `Session ID: ${session.id}`,
    ]
      .filter(Boolean)
      .join('\n');

    if (navigator.share) {
      try {
        await navigator.share({ title: 'NoNetPay Receipt', text: receiptText });
      } catch { /* ignore */ }
    } else {
      try {
        await navigator.clipboard.writeText(receiptText);
        showToast('Receipt copied to clipboard', 'success');
      } catch {
        showToast('Unable to share receipt', 'error');
      }
    }
  };

  const handleManualResolve = (resolution: 'CONFIRMED' | 'NOT_PAID') => {
    const updated = reduceSession(session, {
      type: 'MANUAL_RESOLUTION',
      sessionId: session.id,
      timestamp: Date.now(),
      payload: {
        resolution,
        note: resolutionNote || (resolution === 'CONFIRMED' ? 'Confirmed by user after checking bank balance' : 'User reported money not debited'),
      },
    });

    setSession(updated);
    addToHistory(updated);
    showToast(
      resolution === 'CONFIRMED'
        ? 'Payment marked as Successful'
        : 'Payment marked as Failed (Not Debited)',
      'info'
    );
  };

  const formatTime = (ts: number) =>
    new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`result result--${session.state.toLowerCase()}`} id="result-screen">
      {/* Status Icon */}
      <div className={`result__icon-circle result__icon-circle--${session.state.toLowerCase()}`}>
        {isSuccess && <CheckCircleIcon size={48} color="var(--color-success)" />}
        {isFailed && <XCircleIcon size={48} color="var(--color-error)" />}
        {isUnknown && <AlertCircleIcon size={48} color="var(--color-warning)" />}
      </div>

      {/* Title */}
      <h1 className="result__title">
        {isSuccess ? t.result.success : isFailed ? t.result.failed : t.result.unknown}
      </h1>
      <p className="result__desc">
        {isSuccess ? t.result.successDesc : isFailed ? t.result.failedDesc : t.result.unknownDesc}
      </p>

      {/* Amount Display */}
      <div className="result__amount">
        <span className="amount-display">
          <span className="amount-display__symbol">₹</span>
          {session.amount}
        </span>
      </div>

      {/* Payee */}
      <div className="result__payee">→ {session.payeeName || session.payeeVpa}</div>

      {/* UNKNOWN Recovery & Safety Box (ARCHITECTURE.md 8.4) */}
      {isUnknown && (
        <div className="result__unknown-recovery card card--accent" style={{ borderLeft: '4px solid var(--color-warning)' }}>
          <div
            className="info-banner info-banner--warning"
            style={{ border: 'none', padding: 0, marginBottom: '12px' }}
          >
            <AlertCircleIcon size={20} />
            <strong style={{ fontSize: '1rem' }}>{t.result.dontPayAgain}</strong>
          </div>
          <p className="result__recovery-text" style={{ fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '12px' }}>
            {t.result.checkBalance}
          </p>

          {balance && (
            <div style={{ background: 'var(--color-bg-secondary)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '14px' }}>
              <strong>Last recorded balance:</strong> ₹{balance.amount} ({new Date(balance.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
            </div>
          )}

          <div className="result__recovery-actions" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              className="btn btn--secondary btn--full"
              onClick={() => navigate('/app/balance')}
            >
              Dial *99# to Check Bank Balance
            </button>

            {!showResolutionForm ? (
              <button
                className="btn btn--ghost btn--full"
                onClick={() => setShowResolutionForm(true)}
              >
                Resolve Status Manually →
              </button>
            ) : (
              <div style={{ marginTop: '8px', padding: '12px', background: 'var(--color-bg)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>Did your bank account get debited?</p>
                <input
                  type="text"
                  placeholder="Optional resolution note / Bank SMS ref"
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  className="input-field"
                  style={{ marginBottom: '10px', fontSize: '0.85rem' }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn btn--primary"
                    style={{ flex: 1, padding: '8px' }}
                    onClick={() => handleManualResolve('CONFIRMED')}
                  >
                    Yes, Money Debited
                  </button>
                  <button
                    className="btn btn--secondary"
                    style={{ flex: 1, padding: '8px' }}
                    onClick={() => handleManualResolve('NOT_PAID')}
                  >
                    No, Not Debited
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="result__timeline card">
        <h3 className="result__timeline-title">{t.result.timeline}</h3>
        <div className="timeline">
          {session.timeline.map((event, i) => (
            <div key={i} className="timeline__step">
              <div
                className={`timeline__dot ${
                  i === session.timeline.length - 1
                    ? 'timeline__dot--active'
                    : i < session.timeline.length - 1
                    ? 'timeline__dot--done'
                    : ''
                }`}
              />
              <div className="timeline__content">
                <div className="timeline__label">{event.state}</div>
                {event.message && <div className="timeline__time">{event.message}</div>}
                <div className="timeline__time">{formatTime(event.timestamp)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="result__actions">
        <button className="btn btn--secondary btn--full" onClick={handleShare} id="share-receipt-btn">
          <ShareIcon size={18} />
          {t.result.shareReceipt}
        </button>
        <button className="btn btn--primary btn--full" onClick={() => navigate('/app')} id="back-home-btn">
          {t.result.backHome}
        </button>
      </div>
    </div>
  );
};
