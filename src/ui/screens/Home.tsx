import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../i18n';
import { useApp } from '../../store/AppContext';
import { runReadinessCheck } from '../../core/readiness';
import {
  ScanIcon,
  ChevronRightIcon,
  ShieldIcon,
  WalletIcon,
  MapPinIcon,
  InfoIcon,
  CheckCircleIcon,
  PhoneIcon,
  WifiOffIcon,
  HistoryIcon,
  RocketIcon,
  CheckIcon,
  XCircleIcon,
  AlertCircleIcon,
} from '../Icons';
import './Home.css';

export const HomeScreen: React.FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const {
    readiness,
    setReadiness,
    history,
    balance,
    lastPracticeAt,
    setupComplete,
    activeSession,
    setActiveSession,
    simulatedNetwork,
    selectedBank,
  } = useApp();

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const hasPendingSession = activeSession && !['SUCCESS', 'FAILED'].includes(activeSession.state);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    runReadinessCheck().then(setReadiness);
  }, [setReadiness]);

  // Compute multi-rail telemetry status based on simulated edge network
  const telemetry = useMemo(() => {
    switch (simulatedNetwork) {
      case '5G':
        return {
          score: 100,
          label: 'Optimal Multi-Rail',
          ipState: 'active', // active
          volteState: 'active',
          voiceState: 'active',
          ussdState: 'active',
        };
      case '2G':
        return {
          score: 88,
          label: 'High Latency / Failover Ready',
          ipState: 'warning', // high latency
          volteState: 'active',
          voiceState: 'active',
          ussdState: 'active',
        };
      case 'OFFLINE':
        return {
          score: 94,
          label: '94% Sovereign Offline Ready',
          ipState: 'inactive', // no internet
          volteState: 'active',
          voiceState: 'active',
          ussdState: 'active',
        };
      case 'DEADZONE':
        return {
          score: 42,
          label: 'Dead Zone Blackout (Local Ledger)',
          ipState: 'inactive',
          volteState: 'inactive',
          voiceState: 'inactive',
          ussdState: 'inactive',
        };
    }
  }, [simulatedNetwork]);

  const recentPayments = history.slice(0, 3);

  const formatTimeAgo = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div className="home" id="home-screen">
      {/* ── Active Session Resumption Banner ── */}
      {hasPendingSession && activeSession && (
        <section
          className="card page-enter"
          style={{
            margin: '0 0 16px 0',
            padding: '16px',
            borderLeft: '4px solid #D97706',
            background: '#FFFBEB',
            border: '1px solid #FDE68A',
            borderRadius: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#B45309', letterSpacing: '0.04em' }}>
              OFFLINE PAYMENT IN PROGRESS
            </span>
            <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: '#FEF3C7', color: '#92400E', fontWeight: 700 }}>
              {activeSession.state}
            </span>
          </div>
          <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '4px' }}>
            ₹{activeSession.amount} → {activeSession.payeeName || activeSession.payeeVpa}
          </div>
          <p style={{ fontSize: '13px', color: '#78350F', marginBottom: '12px', lineHeight: 1.45 }}>
            You have an active session awaiting dialer outcome. Tap below to resume step-by-step guidance.
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn--primary"
              style={{ flex: 1, padding: '8px 12px', fontSize: '13px' }}
              onClick={() => navigate('/app/pay')}
            >
              Resume Payment →
            </button>
            <button
              className="btn btn--ghost"
              style={{ padding: '8px 12px', fontSize: '13px', color: '#DC2626' }}
              onClick={() => setActiveSession(null)}
            >
              Discard
            </button>
          </div>
        </section>
      )}

      {/* ── ScanHeroBanner (Sovereign Design System Specification) ── */}
      <section className="scan-hero-banner stagger-item" onClick={() => navigate('/app/scan')} role="button" tabIndex={0}>
        <div className="scan-hero-banner__content">
          <div className="scan-hero-banner__tag">
            <span className="scan-hero-banner__dot" />
            <span>UNIVERSAL OFFLINE QR ROUTER</span>
          </div>
          <h1 className="scan-hero-banner__title">
            Scan & Pay Offline
          </h1>
          <p className="scan-hero-banner__desc">
            Point rear camera at any merchant UPI QR. Decoded on-device and guided through *99# USSD without cellular data.
          </p>
          <div className="scan-hero-banner__cta">
            <span className="scan-hero-banner__cta-btn">
              <ScanIcon size={18} color="#0F172A" />
              <span>Open Camera Scanner</span>
            </span>
            <span className="scan-hero-banner__shortcut-badge font-mono">
              Auto *99#
            </span>
          </div>
        </div>
      </section>

      {/* ── ReadinessMeter (94% Multi-Rail Readiness Dial) ── */}
      <section
        className="readiness-meter card card--elevated stagger-item"
        onClick={() => navigate('/app/readiness')}
        id="status-card"
        role="button"
        tabIndex={0}
      >
        <div className="readiness-meter__main">
          <div className="readiness-meter__left">
            <div className="readiness-meter__badge">
              <CheckCircleIcon size={14} color="#059669" />
              <span>{telemetry.label}</span>
            </div>
            <h2 className="readiness-meter__title">Multi-Rail Payment System</h2>
            <p className="readiness-meter__desc">
              {simulatedNetwork === 'OFFLINE'
                ? 'Mobile data is inactive. Payments will failover smoothly to SIM VoLTE and *99# USSD.'
                : simulatedNetwork === 'DEADZONE'
                ? 'Radio blackout simulated. Receipts and transactions will be recorded in local encrypted storage.'
                : 'All primary and failover banking rails are verified for instant offline transactions.'}
            </p>
          </div>

          {/* SVG Score Ring */}
          <div className="readiness-meter__ring-wrap">
            <svg viewBox="0 0 36 36" className="readiness-meter__svg">
              <path
                className="readiness-meter__track"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="readiness-meter__fill"
                strokeDasharray={`${telemetry.score}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="readiness-meter__ring-inner">
              <span className="readiness-meter__score-num font-mono">{telemetry.score}%</span>
              <span className="readiness-meter__score-lbl">Ready</span>
            </div>
          </div>
        </div>

        {/* ── TelemetryRow (Multi-Rail Channel State Pills) ── */}
        <div className="telemetry-row">
          <div className="telemetry-pill">
            <span className={`telemetry-dot telemetry-dot--${telemetry.ipState}`} />
            <span className="telemetry-pill-text">5G IP Data</span>
          </div>
          <div className="telemetry-pill">
            <span className={`telemetry-dot telemetry-dot--${telemetry.volteState}`} />
            <span className="telemetry-pill-text">SIM VoLTE</span>
          </div>
          <div className="telemetry-pill">
            <span className={`telemetry-dot telemetry-dot--${telemetry.voiceState}`} />
            <span className="telemetry-pill-text">123PAY Voice</span>
          </div>
          <div className="telemetry-pill">
            <span className={`telemetry-dot telemetry-dot--${telemetry.ussdState}`} />
            <span className="telemetry-pill-text">USSD *99#</span>
          </div>
        </div>
      </section>

      {/* ── Quick Actions Grid ── */}
      <section className="home__actions stagger-item">
        <h2 className="home__section-title">Quick Actions</h2>
        <div className="home__actions-grid">
          <button className="home__action" onClick={() => navigate('/app/scan?mode=upi')} id="enter-upi-btn">
            <div className="home__action-dot home__action-dot--accent">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <span className="home__action-name">Enter UPI ID</span>
          </button>

          <button className="home__action" onClick={() => navigate('/app/balance')} id="check-balance-btn">
            <div className="home__action-dot home__action-dot--green">
              <WalletIcon size={20} />
            </div>
            <span className="home__action-name">Check Balance</span>
          </button>

          <button className="home__action" onClick={() => navigate('/app/trip-prep')} id="trip-prep-btn">
            <div className="home__action-dot home__action-dot--blue">
              <MapPinIcon size={20} />
            </div>
            <span className="home__action-name">Travel Offline Prep</span>
          </button>

          <button className="home__action" onClick={() => navigate('/app/setup')} id="setup-btn">
            <div className="home__action-dot home__action-dot--purple">
              <ShieldIcon size={20} />
            </div>
            <span className="home__action-name">Configure Bank</span>
          </button>
        </div>
      </section>

      {/* ── Balance Card (If saved) ── */}
      {balance && (
        <section className="home__balance card stagger-item" id="balance-card">
          <div className="home__balance-top">
            <span className="home__balance-label">Last Known Account Balance</span>
            <span className="home__balance-tag">User Verified</span>
          </div>
          <div className="home__balance-val font-mono">
            <span className="home__rupee">₹</span>{balance.amount}
          </div>
          <div className="home__balance-when">{formatTimeAgo(balance.timestamp)}</div>
        </section>
      )}

      {/* ── Recent Authentic Payments (Only Real Data) ── */}
      {recentPayments.length > 0 && (
        <section className="home__recent stagger-item">
          <div className="home__recent-header">
            <h2 className="home__section-title">Recent Transactions</h2>
            <button className="home__view-all" onClick={() => navigate('/app/history')}>
              View Ledger →
            </button>
          </div>
          <div className="home__recent-list card" style={{ padding: 0, overflow: 'hidden' }}>
            {recentPayments.map((entry) => (
              <div
                key={entry.session.id}
                className="history__ledger-row"
                onClick={() => navigate('/app/result', { state: { session: entry.session } })}
                role="button"
                tabIndex={0}
              >
                <div className={`history__status-dot history__status-dot--${entry.session.state.toLowerCase()}`}>
                  {entry.session.state === 'SUCCESS' ? (
                    <CheckCircleIcon size={16} color="#059669" />
                  ) : entry.session.state === 'FAILED' ? (
                    <XCircleIcon size={16} color="#DC2626" />
                  ) : (
                    <AlertCircleIcon size={16} color="#D97706" />
                  )}
                </div>
                <div className="history__item-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="history__item-name">
                      {entry.session.payeeName || entry.session.payeeVpa}
                    </span>
                    <span className="history__route-badge font-mono">
                      {entry.session.route === 'USSD_DIRECT' ? '*99#' : entry.session.route}
                    </span>
                  </div>
                  <span className="history__item-time">{formatTimeAgo(entry.timestamp)}</span>
                </div>
                <div className="history__item-right">
                  <span className="history__item-amount font-mono">
                    ₹{entry.session.amount}
                  </span>
                  <span className={`history__item-status history__item-status--${entry.session.state.toLowerCase()}`}>
                    {entry.session.state === 'SUCCESS' ? 'Settled' : entry.session.state}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Getting Started Card (If Setup Not Finished) ── */}
      {!setupComplete && (
        <section className="home__cta-card card stagger-item">
          <div className="home__cta-icon">
            <RocketIcon size={28} color="var(--color-ink)" />
          </div>
          <h3 className="home__cta-title">Configure Offline Bank Rail</h3>
          <p className="home__cta-desc">
            Select your bank, link your USSD shortcut (*99#), and run a quick practice balance check before traveling.
          </p>
          <button className="btn btn--primary" onClick={() => navigate('/app/setup')} id="setup-cta-btn">
            Configure Bank in 4 Steps →
          </button>
        </section>
      )}

      {/* ── Footer ── */}
      <footer className="home__footer">
        <p>NoNetPay Sovereign Adaptive UPI Infrastructure</p>
        <p>
          Client-side routing engine • Zero tracking • <button className="home__footer-link" onClick={() => navigate('/app/help')}>Documentation</button>
          {' • '}
          <button className="home__footer-link" onClick={() => navigate('/app/diagnostics')}>Diagnostics</button>
        </p>
      </footer>
    </div>
  );
};
