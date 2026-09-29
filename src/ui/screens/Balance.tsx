import React, { useState } from 'react';
import { useI18n } from '../../i18n';
import { useApp } from '../../store/AppContext';
import { PhoneIcon, InfoIcon, CheckCircleIcon } from '../Icons';
import banksData from '../../content/banks.json';
import './Balance.css';

export const BalanceScreen: React.FC = () => {
  const { t } = useI18n();
  const { balance, setBalance, showToast, setLastPracticeAt, selectedBank } = useApp();
  const [inputAmount, setInputAmount] = useState('');

  const bankConfig = selectedBank ? banksData.banks.find((b) => b.id === selectedBank) : null;
  const balanceSteps = bankConfig?.balanceSteps || [
    'Dial *99# from your registered SIM',
    'Reply 3 for "Check Balance"',
    'Select your bank account (if multiple)',
    'Enter your confidential UPI PIN',
    'Record the balance shown on the USSD screen',
  ];

  const handleSave = () => {
    if (inputAmount && parseFloat(inputAmount) >= 0) {
      const prevAmount = balance ? parseFloat(balance.amount) : null;
      const newAmount = parseFloat(inputAmount);

      setBalance(inputAmount);
      setLastPracticeAt(Date.now());

      if (prevAmount !== null && !isNaN(prevAmount)) {
        const diff = prevAmount - newAmount;
        if (diff > 0) {
          showToast(`Balance saved! ₹${diff.toFixed(2)} debited since last check.`, 'success');
        } else if (diff < 0) {
          showToast(`Balance saved! ₹${Math.abs(diff).toFixed(2)} credited since last check.`, 'success');
        } else {
          showToast('Balance updated (unchanged)', 'info');
        }
      } else {
        showToast('Initial balance recorded successfully', 'success');
      }

      setInputAmount('');
    }
  };

  const formatTime = (ts: number) => {
    const date = new Date(ts);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="balance" id="balance-screen">
      <h1 className="balance__title">{t.balance.title}</h1>

      {/* Current Balance Display */}
      {balance && (
        <div className="balance__current card card--elevated stagger-item">
          <div className="balance__current-header">
            <span className="balance__current-label">{t.balance.lastKnown}</span>
            <span className="balance__current-badge">{t.balance.enteredByYou}</span>
          </div>
          <div className="balance__current-amount">
            <span className="amount-display">
              <span className="amount-display__symbol">₹</span>
              {balance.amount}
            </span>
          </div>
          <div className="balance__current-time">{formatTime(balance.timestamp)}</div>
        </div>
      )}

      {!balance && (
        <div className="balance__empty card stagger-item">
          <p>{t.balance.neverChecked}</p>
        </div>
      )}

      {/* Open Dialer */}
      <a
        href="tel:*99%23"
        className="btn btn--primary btn--large btn--full stagger-item"
        id="balance-dialer-btn"
      >
        <PhoneIcon size={20} color="white" />
        {t.balance.openDialer} (*99#)
      </a>

      {/* Step by step guide */}
      <div className="card stagger-item" style={{ marginTop: '16px', padding: '16px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px' }}>
          {bankConfig ? `${bankConfig.name} Balance Steps:` : 'How to Check Balance:'}
        </h3>
        <ol style={{ paddingLeft: '20px', margin: 0, fontSize: '0.88rem', color: 'var(--color-ink)', lineHeight: '1.6' }}>
          {balanceSteps.map((step, idx) => (
            <li key={idx} style={{ marginBottom: '4px' }}>
              {step}
            </li>
          ))}
        </ol>
      </div>

      {/* Input */}
      <div className="balance__input-section stagger-item">
        <label className="balance__input-label">{t.balance.enterBalance}</label>
        <div className="balance__input-wrap">
          <span className="balance__input-symbol">₹</span>
          <input
            type="number"
            className="balance__input"
            placeholder="0.00"
            value={inputAmount}
            onChange={(e) => setInputAmount(e.target.value)}
            id="balance-input"
            inputMode="decimal"
            min="0"
          />
        </div>
        <button
          className="btn btn--primary btn--full"
          onClick={handleSave}
          disabled={!inputAmount || parseFloat(inputAmount) < 0}
          id="save-balance-btn"
        >
          {t.balance.save}
        </button>
      </div>

      {/* Disclaimer */}
      <div className="info-banner info-banner--info stagger-item">
        <InfoIcon size={16} />
        <span>{t.balance.disclaimer}</span>
      </div>
    </div>
  );
};
