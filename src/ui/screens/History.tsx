import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../i18n';
import { useApp } from '../../store/AppContext';
import {
  SearchIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertCircleIcon,
  ScanIcon,
  WalletIcon,
  ShieldIcon,
  ChevronRightIcon,
} from '../Icons';
import './History.css';

export const HistoryScreen: React.FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { history } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'success' | 'failed' | 'unknown'>('all');

  const filteredHistory = useMemo(() => {
    let items = history;

    if (filter !== 'all') {
      items = items.filter((h) => h.session.state.toLowerCase() === filter);
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      items = items.filter(
        (h) =>
          h.session.payeeName?.toLowerCase().includes(q) ||
          h.session.payeeVpa.toLowerCase().includes(q) ||
          h.session.amount.includes(q) ||
          h.session.route.toLowerCase().includes(q) ||
          (h.session.note && h.session.note.toLowerCase().includes(q))
      );
    }

    return items;
  }, [history, filter, search]);

  const groupedHistory = useMemo(() => {
    const groups: Record<string, typeof filteredHistory> = {};
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    filteredHistory.forEach((entry) => {
      const dateStr = new Date(entry.timestamp).toDateString();
      let label: string;
      if (dateStr === today) label = t.history.today || 'Today';
      else if (dateStr === yesterday) label = t.history.yesterday || 'Yesterday';
      else
        label = new Date(entry.timestamp).toLocaleDateString(undefined, {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });

      if (!groups[label]) groups[label] = [];
      groups[label].push(entry);
    });

    return groups;
  }, [filteredHistory, t]);

  const formatTime = (ts: number) =>
    new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="history" id="history-screen">
      {/* Header */}
      <div className="history__header">
        <h1 className="history__title">{t.history.title}</h1>
        <p style={{ fontSize: '13px', color: 'var(--color-ink-secondary)', marginTop: '4px' }}>
          Cryptographic ledger of local offline payments and balance checks
        </p>
      </div>

      {/* Search Input */}
      <div className="history__search stagger-item">
        <SearchIcon size={18} color="var(--color-ink-muted)" />
        <input
          type="text"
          className="history__search-input"
          placeholder="Filter by payee name, UPI ID, amount..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          id="history-search"
        />
      </div>

      {/* Filter Tabs */}
      <div className="history__filters stagger-item">
        {(
          [
            { id: 'all', label: t.history.filterAll || 'All' },
            { id: 'success', label: 'Settled' },
            { id: 'unknown', label: 'Pending / Unknown' },
            { id: 'failed', label: 'Failed' },
          ] as const
        ).map((f) => (
          <button
            key={f.id}
            className={`history__filter ${filter === f.id ? 'history__filter--active' : ''}`}
            onClick={() => setFilter(f.id)}
            id={`filter-${f.id}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Empty State when no transactions */}
      {filteredHistory.length === 0 && (
        <div className="history__empty card stagger-item">
          <div className="history__empty-icon-wrap">
            <svg
              width="44"
              height="44"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-ink-muted)"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <line x1="6" y1="8" x2="10" y2="8" />
              <line x1="6" y1="12" x2="18" y2="12" />
              <line x1="6" y1="16" x2="14" y2="16" />
            </svg>
          </div>
          <h3 style={{ margin: '8px 0 4px 0', fontSize: '16px', fontWeight: 700, color: 'var(--color-ink)' }}>
            {search ? 'No Matching Records Found' : 'No Transactions Recorded Yet'}
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-ink-secondary)', maxWidth: '300px', lineHeight: 1.5 }}>
            {search
              ? 'Try modifying your search term or clearing the active filter.'
              : 'When you initiate an offline payment or balance check via *99#, your verified session details and receipt tokens will be logged here.'}
          </p>
          {!search && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '14px', width: '100%', maxWidth: '320px' }}>
              <button
                className="btn btn--primary"
                style={{ flex: 1, padding: '10px 14px', fontSize: '13px' }}
                onClick={() => navigate('/app/scan')}
              >
                <ScanIcon size={16} />
                <span>Scan QR</span>
              </button>
              <button
                className="btn btn--secondary"
                style={{ flex: 1, padding: '10px 14px', fontSize: '13px' }}
                onClick={() => navigate('/app/balance')}
              >
                <WalletIcon size={16} />
                <span>Balance Check</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* History Ledger Rows */}
      {Object.entries(groupedHistory).map(([date, entries]) => (
        <div key={date} className="history__group stagger-item">
          <h3 className="history__group-title">{date}</h3>
          <div className="history__list card" style={{ padding: 0, overflow: 'hidden' }}>
            {entries.map((entry) => (
              <div
                key={entry.session.id}
                className="history__ledger-row"
                onClick={() => navigate('/app/result', { state: { session: entry.session } })}
                role="button"
                tabIndex={0}
                title="View full cryptographic receipt"
              >
                {/* Status Dot */}
                <div
                  className={`history__status-dot history__status-dot--${entry.session.state.toLowerCase()}`}
                >
                  {entry.session.state === 'SUCCESS' ? (
                    <CheckCircleIcon size={16} color="#059669" />
                  ) : entry.session.state === 'FAILED' ? (
                    <XCircleIcon size={16} color="#DC2626" />
                  ) : (
                    <AlertCircleIcon size={16} color="#D97706" />
                  )}
                </div>

                {/* Payee Info */}
                <div className="history__item-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="history__item-name">
                      {entry.session.payeeName || entry.session.payeeVpa}
                    </span>
                    <span className="history__route-badge font-mono">
                      {entry.session.route === 'USSD_DIRECT' ? '*99#' : entry.session.route}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                    <span className="history__item-vpa font-mono">{entry.session.payeeVpa}</span>
                    <span style={{ fontSize: '11px', color: 'var(--color-ink-muted)' }}>•</span>
                    <span className="history__item-time">{formatTime(entry.timestamp)}</span>
                  </div>
                </div>

                {/* Amount & Status Badge */}
                <div className="history__item-right">
                  <span className="history__item-amount font-mono">
                    ₹{entry.session.amount}
                  </span>
                  <span
                    className={`history__item-status history__item-status--${entry.session.state.toLowerCase()}`}
                  >
                    {entry.session.state === 'SUCCESS'
                      ? 'Settled'
                      : entry.session.state === 'FAILED'
                      ? 'Failed'
                      : 'Unknown / Pending'}
                  </span>
                </div>

                <ChevronRightIcon size={16} color="var(--color-ink-muted)" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
