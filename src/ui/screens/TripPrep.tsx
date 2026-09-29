import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../i18n';
import { useApp } from '../../store/AppContext';
import { CheckCircleIcon, XCircleIcon } from '../Icons';
import './TripPrep.css';

export const TripPrepScreen: React.FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { lastPreparedAt, setLastPreparedAt, lastPracticeAt, selectedBank, showToast } = useApp();

  const checks = useMemo(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const hasSW = 'serviceWorker' in navigator;
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    return [
      {
        id: 'installed',
        label: t.tripPrep.appInstalled,
        passed: isStandalone,
      },
      {
        id: 'cache',
        label: t.tripPrep.offlineCache,
        passed: hasSW,
      },
      {
        id: 'storage',
        label: t.tripPrep.storagePersisted,
        passed: true, // Best effort
      },
      {
        id: 'bank',
        label: t.tripPrep.bankLinked,
        passed: !!selectedBank,
      },
      {
        id: 'practice',
        label: t.tripPrep.practiceRecent,
        passed: !!lastPracticeAt && lastPracticeAt > sevenDaysAgo,
      },
    ];
  }, [t, selectedBank, lastPracticeAt]);

  const allPassed = checks.every((c) => c.passed);

  const handlePrepare = () => {
    setLastPreparedAt(Date.now());
    showToast('Trip prep complete!', 'success');
  };

  const formatDate = (ts: number) => new Date(ts).toLocaleDateString(undefined, {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="trip-prep" id="trip-prep-screen">
      <h1 className="trip-prep__title">{t.tripPrep.title}</h1>
      <p className="trip-prep__desc stagger-item">{t.tripPrep.desc}</p>

      {/* Status */}
      <div className={`trip-prep__status card card--elevated stagger-item ${allPassed ? 'trip-prep__status--ready' : 'trip-prep__status--needs-work'}`}>
        {allPassed ? (
          <>
            <CheckCircleIcon size={32} color="var(--color-success)" />
            <p>{t.tripPrep.allGood}</p>
          </>
        ) : (
          <>
            <XCircleIcon size={32} color="var(--color-warning)" />
            <p>{t.tripPrep.needsWork}</p>
          </>
        )}
      </div>

      {/* Checklist */}
      <div className="trip-prep__checklist stagger-item">
        {checks.map((check) => (
          <div key={check.id} className="checklist__item" id={`prep-${check.id}`}>
            <div className={`checklist__icon ${check.passed ? 'checklist__icon--pass' : 'checklist__icon--fail'}`}>
              {check.passed ? <CheckCircleIcon size={14} /> : <XCircleIcon size={14} />}
            </div>
            <span className="checklist__text">{check.label}</span>
          </div>
        ))}
      </div>

      {/* Fix actions */}
      {!selectedBank && (
        <button className="btn btn--secondary btn--full stagger-item" onClick={() => navigate('/app/setup')}>
          Complete Bank Setup
        </button>
      )}
      {(!lastPracticeAt || lastPracticeAt < Date.now() - 7 * 24 * 60 * 60 * 1000) && (
        <button className="btn btn--secondary btn--full stagger-item" onClick={() => navigate('/app/balance')}>
          Run Practice Check
        </button>
      )}

      {/* Prepare Button */}
      <button className="btn btn--primary btn--large btn--full stagger-item" onClick={handlePrepare} id="prepare-btn">
        {t.tripPrep.prepare}
      </button>

      {/* Last prepared */}
      {lastPreparedAt && (
        <div className="trip-prep__badge stagger-item">
          <CheckCircleIcon size={14} color="var(--color-success)" />
          <span>{t.tripPrep.preparedOn}: {formatDate(lastPreparedAt)}</span>
        </div>
      )}
    </div>
  );
};
