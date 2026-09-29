import React, { useState, useEffect, useCallback } from 'react';
import { useI18n } from '../../i18n';
import { useApp } from '../../store/AppContext';
import { runReadinessCheck, updateUserCheck, requestStoragePersistence, type ReadinessResult } from '../../core/readiness';
import { CheckCircleIcon, XCircleIcon, AlertCircleIcon } from '../Icons';
import './Readiness.css';

export const ReadinessScreen: React.FC = () => {
  const { t } = useI18n();
  const { readiness, setReadiness, showToast } = useApp();
  const [checking, setChecking] = useState(false);

  const doCheck = useCallback(async () => {
    setChecking(true);
    const result = await runReadinessCheck();
    setReadiness(result);
    setChecking(false);
  }, [setReadiness]);

  useEffect(() => {
    doCheck();
  }, [doCheck]);

  const handleToggleUserCheck = useCallback((id: string, currentVal: boolean) => {
    updateUserCheck(id, !currentVal);
    doCheck();
    showToast(!currentVal ? 'Marked as confirmed' : 'Unmarked', 'info');
  }, [doCheck, showToast]);

  const handleRequestStorage = useCallback(async () => {
    const granted = await requestStoragePersistence();
    await doCheck();
    if (granted) {
      showToast('Persistent storage granted!', 'success');
    } else {
      showToast('Persistent storage request declined by browser', 'info');
    }
  }, [doCheck, showToast]);

  const statusColor = readiness?.status === 'READY' ? 'var(--color-success)' :
    readiness?.status === 'LIMITED' ? 'var(--color-warning)' : 'var(--color-error)';

  return (
    <div className="readiness" id="readiness-screen">
      <h1 className="readiness__title">{t.readiness.title}</h1>

      {/* Score Circle */}
      <div className="readiness__score-card card card--elevated stagger-item">
        <div className="readiness__score-circle">
          <svg viewBox="0 0 36 36" className="readiness__score-svg">
            <path
              className="readiness__score-bg-ring"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="readiness__score-fill-ring"
              style={{ stroke: statusColor }}
              strokeDasharray={`${readiness?.score || 0}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="readiness__score-center">
            <span className="readiness__score-number">{readiness?.score || 0}</span>
            <span className="readiness__score-label">{t.readiness.score}</span>
          </div>
        </div>

        <div className={`status-pill status-pill--${readiness?.status?.toLowerCase() || 'not-ready'}`}>
          <span className="status-pill__dot" />
          {readiness?.status === 'READY' ? t.readiness.ready :
           readiness?.status === 'LIMITED' ? t.readiness.limited : t.readiness.notReady}
        </div>
      </div>

      {/* Check Button */}
      <button
        className="btn btn--secondary btn--full stagger-item"
        onClick={doCheck}
        disabled={checking}
        id="run-check-btn"
      >
        {checking ? t.common.loading : t.readiness.check}
      </button>

      {/* Checklist */}
      <div className="readiness__checklist stagger-item">
        {readiness?.items.map((item) => (
          <div key={item.id} className="checklist__item" id={`check-${item.id}`}>
            <div className={`checklist__icon ${item.passed ? 'checklist__icon--pass' : 'checklist__icon--fail'}`}>
              {item.passed ? <CheckCircleIcon size={14} /> : <XCircleIcon size={14} />}
            </div>
            <div className="checklist__text">
              <div className="readiness__check-name">{item.label}</div>
              {item.detail && <div className="readiness__check-detail">{item.detail}</div>}
              {item.fixAction && !item.passed && (
                <div className="readiness__check-fix">
                  <span>{item.fixAction}</span>
                  {item.id === 'storage' && (
                    <button
                      className="btn btn--sm btn--primary"
                      style={{ marginTop: '6px', display: 'inline-block' }}
                      onClick={handleRequestStorage}
                    >
                      Request Storage Lock
                    </button>
                  )}
                </div>
              )}
            </div>
            <span className="checklist__label">
              {item.source === 'detected' ? t.readiness.detected : t.readiness.youToldUs}
            </span>
            {item.source === 'user_reported' && (
              <button
                className="readiness__toggle-btn"
                onClick={() => handleToggleUserCheck(item.id, item.passed)}
              >
                {item.passed ? '✓' : 'Mark'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
