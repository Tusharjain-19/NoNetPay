import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../i18n';
import { useApp } from '../../store/AppContext';
import { appDb, type DiagnosticEvent } from '../../data/db';
import { ShieldIcon, ShareIcon, AlertCircleIcon, CheckCircleIcon } from '../Icons';

export const DiagnosticsScreen: React.FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { history, readiness, showToast } = useApp();
  const [events, setEvents] = useState<DiagnosticEvent[]>([]);
  const [swStatus, setSwStatus] = useState<string>('Checking...');
  const [cacheCount, setCacheCount] = useState<number>(0);
  const [storagePersisted, setStoragePersisted] = useState<boolean>(false);

  useEffect(() => {
    appDb.getDiagnosticEvents().then(setEvents);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        setSwStatus(reg ? (reg.active ? 'Active & Running' : 'Registered (installing)') : 'Not registered');
      }).catch(() => setSwStatus('Unavailable'));
    } else {
      setSwStatus('Unsupported by browser');
    }

    if (typeof caches !== 'undefined') {
      caches.keys().then((keys) => {
        setCacheCount(keys.length);
      }).catch(() => setCacheCount(0));
    }

    if (navigator.storage && navigator.storage.persisted) {
      navigator.storage.persisted().then(setStoragePersisted).catch(() => setStoragePersisted(false));
    }
  }, []);

  const getSystemDiagnostics = () => {
    return {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      isOnline: navigator.onLine,
      displayMode: window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser',
      serviceWorkerStatus: swStatus,
      cachesActive: cacheCount,
      storagePersisted,
      readinessScore: readiness?.score ?? 'N/A',
      totalHistoryRecords: history.length,
      recentDiagnostics: events,
    };
  };

  const handleExportReport = async () => {
    const report = getSystemDiagnostics();
    const jsonString = JSON.stringify(report, null, 2);

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(jsonString);
      showToast('Diagnostic report copied to clipboard!', 'success');
    }

    // Also trigger file download
    try {
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nonetpay-diagnostics-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { /* ignore */ }
  };

  return (
    <div className="page-enter" style={{ padding: '16px', maxWidth: '480px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>System Diagnostics</h1>
        <button className="btn btn--ghost" onClick={() => navigate('/app')}>
          Close
        </button>
      </div>

      <p style={{ fontSize: '0.9rem', color: 'var(--color-ink-muted)', marginBottom: '16px' }}>
        Inspect device environment, offline cache, service worker, and sanitized telemetry for testing.
      </p>

      {/* System Status Table */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--color-ink-muted)' }}>Display Mode:</span>
            <strong>{window.matchMedia('(display-mode: standalone)').matches ? 'Standalone PWA' : 'Browser Tab'}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--color-ink-muted)' }}>Service Worker:</span>
            <strong>{swStatus}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--color-ink-muted)' }}>Cache Buckets:</span>
            <strong>{cacheCount} active</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--color-ink-muted)' }}>Persistent Storage:</span>
            <strong>{storagePersisted ? 'Locked (Safe)' : 'Standard'}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--color-ink-muted)' }}>Network State:</span>
            <strong style={{ color: navigator.onLine ? 'var(--color-success)' : 'var(--color-warning)' }}>
              {navigator.onLine ? 'Online' : 'Offline'}
            </strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--color-ink-muted)' }}>Readiness Score:</span>
            <strong>{readiness?.score || 0}% ({readiness?.status || 'NOT_READY'})</strong>
          </div>
        </div>
      </div>

      {/* Export Action */}
      <button
        className="btn btn--primary btn--full"
        style={{ marginBottom: '20px' }}
        onClick={handleExportReport}
        id="export-diagnostics-btn"
      >
        <ShareIcon size={18} />
        Export Test Report (JSON)
      </button>

      {/* Audit Log */}
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '10px' }}>Sanitized Audit Log</h2>
      <div className="card" style={{ maxHeight: '280px', overflowY: 'auto' }}>
        {events.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--color-ink-muted)', margin: 0 }}>No logged events recorded yet.</p>
        ) : (
          events.map((e) => (
            <div key={e.id} style={{ borderBottom: '1px solid var(--color-border)', padding: '8px 0', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-ink-muted)', marginBottom: '2px' }}>
                <span style={{ fontWeight: 600, color: 'var(--color-accent)' }}>{e.type}</span>
                <span>{new Date(e.timestamp).toLocaleTimeString()}</span>
              </div>
              <div style={{ color: 'var(--color-ink)' }}>{e.details}</div>
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--color-ink-muted)' }}>
        <ShieldIcon size={16} />
        <span>All logs are strictly local, sanitized of PINs/OTPs, and never sent to any server.</span>
      </div>
    </div>
  );
};
